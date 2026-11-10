import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { buildRlsContext, isStaffRole, requireAuth } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

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

    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const result = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const ticketRes = await client.query(
        `SELECT id, user_id, customer_email, status FROM public.tickets
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

      await client.query(
        `INSERT INTO public.ticket_messages (
           id, ticket_id, sender_id, sender_name, sender_role, message, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [messageId, ticket.id, actor.id, senderName, senderRole, message]
      );

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

      return { success: true, messageId, status: newStatus };
    });

    if (result === null) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    if (result === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
