import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminSql, buildRlsContext, isStaffRole, requireAuth } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';
import { parseAttachments } from '@/lib/ticket-attachments';
import { rateLimit } from '@/lib/rate-limit';
import { notifyLater } from '@/lib/telegram';
import { adminAlerts, notifyAdmins } from '@/lib/telegram-admin';
import { tgMessages } from '@/lib/telegram-bot';

const STAFF_ALLOWED_STATUSES = new Set([
  'OPEN',
  'IN_PROGRESS',
  'WAITING_USER',
  'RESOLVED',
  'CLOSED',
]);
const USER_ALLOWED_STATUSES = new Set(['OPEN', 'RESOLVED']);
const VALID_PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;
    const isStaff = isStaffRole(actor.role);
    const { id } = await params;

    const result = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const ticketRes = await client.query(
        `SELECT * FROM public.tickets WHERE id = $1 OR ticket_number = $1 LIMIT 1`,
        [id]
      );

      if (ticketRes.rows.length === 0) {
        return null;
      }

      const ticket = ticketRes.rows[0];
      const isOwnerOfTicket =
        ticket.user_id === actor.id ||
        String(ticket.customer_email || '').toLowerCase() === actor.email;

      if (!isStaff && !isOwnerOfTicket) {
        return 'FORBIDDEN' as const;
      }

      const messagesRes = await client.query(
        `SELECT * FROM public.ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC`,
        [ticket.id]
      );

      return { ticket, messages: messagesRes.rows };
    });

    if (result === null) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    if (result === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Staff see each sender's email on hover. Customers never get staff emails.
    if (isStaff && adminSql) {
      const ids = [...new Set(result.messages.map((m: { sender_id: string | null }) => m.sender_id).filter(Boolean))] as string[];
      if (ids.length > 0) {
        try {
          const rows = await adminSql`SELECT id::text AS id, email FROM neon_auth."user" WHERE id::text = ANY(${ids})`;
          const emailById = new Map<string, string>(rows.map((r) => [String(r.id), String(r.email)]));
          result.messages = result.messages.map((m: { sender_id: string | null }) => ({
            ...m,
            sender_email: (m.sender_id && emailById.get(m.sender_id)) || null,
          }));
        } catch (err) {
          console.error('Failed to resolve ticket sender emails:', err);
        }
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;
    const isStaff = isStaffRole(actor.role);
    const { id } = await params;
    if (!isStaff && (await rateLimit('ticket-reply', actor.id, 60, 3600)).limited) {
      return NextResponse.json({ error: 'Too many messages. Please slow down.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

    const attachments = parseAttachments(body.attachments, actor.id);
    if (attachments === null) {
      return NextResponse.json({ error: 'Invalid attachments' }, { status: 400 });
    }

    if (!message && attachments.length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Set when staff answer a customer's ticket, so the customer can be told on Telegram.
    let customerNotice: { email: string; ticketNumber: string; subject: string } | null = null;
    // Set when a customer writes back, so the owner hears about it on the admin bot.
    let staffNotice: { email: string; ticketNumber: string; subject: string } | null = null;
    const result = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const ticketRes = await client.query(
        `SELECT id, user_id, customer_email, status, ticket_number, subject FROM public.tickets
         WHERE id = $1 OR ticket_number = $1 LIMIT 1`,
        [id]
      );

      if (ticketRes.rows.length === 0) {
        return null;
      }

      const ticket = ticketRes.rows[0];
      const isOwnerOfTicket =
        ticket.user_id === actor.id ||
        String(ticket.customer_email || '').toLowerCase() === actor.email;

      if (!isStaff && !isOwnerOfTicket) {
        return 'FORBIDDEN' as const;
      }

      const messageId = `msg_${crypto.randomUUID()}`;
      const senderRole = actor.role;
      const senderName =
        senderRole === 'owner'
          ? 'Owner Desk'
          : senderRole === 'admin'
          ? 'Support Engineer'
          : actor.name;

      if (attachments.length > 0) {
        await client.query(
          `INSERT INTO public.ticket_messages (
             id, ticket_id, sender_id, sender_name, sender_role, message, attachments, created_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())`,
          [messageId, ticket.id, actor.id, senderName, senderRole, message, JSON.stringify(attachments)]
        );
      } else {
        await client.query(
          `INSERT INTO public.ticket_messages (
             id, ticket_id, sender_id, sender_name, sender_role, message, created_at
           ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [messageId, ticket.id, actor.id, senderName, senderRole, message]
        );
      }

      let newStatus = ticket.status;
      if (isStaff) {
        newStatus = 'IN_PROGRESS';
      } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
        newStatus = 'OPEN';
      }

      await client.query(
        `UPDATE public.tickets SET updated_at = NOW(), status = $1 WHERE id = $2`,
        [newStatus, ticket.id]
      );

      if (!isStaff && isOwnerOfTicket) {
        staffNotice = {
          email: String(ticket.customer_email || actor.email),
          ticketNumber: String(ticket.ticket_number || ''),
          subject: String(ticket.subject || ''),
        };
      }
      if (isStaff && !isOwnerOfTicket && ticket.customer_email) {
        customerNotice = {
          email: String(ticket.customer_email),
          ticketNumber: String(ticket.ticket_number || ''),
          subject: String(ticket.subject || ''),
        };
      }

      return { success: true, messageId, status: newStatus };
    });

    if (result === null) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    if (result === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (staffNotice) {
      const n = staffNotice as { email: string; ticketNumber: string; subject: string };
      const a = adminAlerts.newTicket({ ticketNumber: n.ticketNumber, email: n.email, subject: n.subject, preview: message || 'Sent an attachment.', reply: true });
      notifyAdmins(a.html, a.rows);
    }

    if (customerNotice) {
      const n = customerNotice as { email: string; ticketNumber: string; subject: string };
      const m = tgMessages.ticketReply(n.ticketNumber, n.subject, message || 'Sent you an attachment.');
      notifyLater(n.email, m.html, m.buttons);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error posting ticket message:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;
    const isStaff = isStaffRole(actor.role);
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const status = typeof body.status === 'string' ? body.status.trim().toUpperCase() : null;
    const priority = typeof body.priority === 'string' ? body.priority.trim().toUpperCase() : null;

    if (!status && !priority) {
      return NextResponse.json({ error: 'Status or priority is required' }, { status: 400 });
    }

    if (status) {
      const allowedSet = isStaff ? STAFF_ALLOWED_STATUSES : USER_ALLOWED_STATUSES;
      if (!allowedSet.has(status)) {
        return NextResponse.json({ error: 'Forbidden or invalid ticket status' }, { status: 403 });
      }
    }

    if (priority) {
      if (!isStaff) {
        return NextResponse.json({ error: 'Only staff can modify ticket priority' }, { status: 403 });
      }
      if (!VALID_PRIORITIES.has(priority)) {
        return NextResponse.json({ error: 'Invalid ticket priority' }, { status: 400 });
      }
    }

    const result = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const ticketRes = await client.query(
        `SELECT id, user_id, customer_email FROM public.tickets
         WHERE id = $1 OR ticket_number = $1 LIMIT 1`,
        [id]
      );

      if (ticketRes.rows.length === 0) {
        return null;
      }

      const ticket = ticketRes.rows[0];
      const isOwnerOfTicket =
        ticket.user_id === actor.id ||
        String(ticket.customer_email || '').toLowerCase() === actor.email;

      if (!isStaff && !isOwnerOfTicket) {
        return 'FORBIDDEN' as const;
      }

      await client.query(
        `UPDATE public.tickets
         SET
           status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           updated_at = NOW()
         WHERE id = $3`,
        [status, priority, ticket.id]
      );

      return { success: true };
    });

    if (result === null) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    if (result === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
