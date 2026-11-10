import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { buildRlsContext, isStaffRole, requireAuth } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

const VALID_PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;
    const isStaff = isStaffRole(actor.role);

    const { searchParams } = new URL(req.url);
    const emailFilter = searchParams.get('email')?.trim().toLowerCase() || '';

    const ticketsList = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      if (isStaff && !emailFilter) {
        const res = await client.query(
          `SELECT
             t.*,
             COUNT(m.id)::int AS message_count,
             MAX(m.created_at) AS last_message_at
           FROM public.tickets t
           LEFT JOIN public.ticket_messages m ON t.id = m.ticket_id
           GROUP BY t.id
           ORDER BY t.updated_at DESC`
        );
        return res.rows;
      }

      if (isStaff && emailFilter) {
        const res = await client.query(
          `SELECT
             t.*,
             COUNT(m.id)::int AS message_count,
             MAX(m.created_at) AS last_message_at
           FROM public.tickets t
           LEFT JOIN public.ticket_messages m ON t.id = m.ticket_id
           WHERE LOWER(t.customer_email) = $1
           GROUP BY t.id
           ORDER BY t.updated_at DESC`,
          [emailFilter]
        );
        return res.rows;
      }

      const res = await client.query(
        `SELECT
           t.*,
           COUNT(m.id)::int AS message_count,
           MAX(m.created_at) AS last_message_at
         FROM public.tickets t
         LEFT JOIN public.ticket_messages m ON t.id = m.ticket_id
         WHERE t.user_id = $1 OR LOWER(t.customer_email) = $2
         GROUP BY t.id
         ORDER BY t.updated_at DESC`,
        [actor.id, actor.email]
      );
      return res.rows;
    });

    return NextResponse.json({ tickets: ticketsList });
  } catch (error: unknown) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;

    const body = await req.json().catch(() => ({}));
    const customerName =
      typeof body.customerName === 'string' && body.customerName.trim()
        ? body.customerName.trim().slice(0, 120)
        : actor.name;
    const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : '';
    const category =
      typeof body.category === 'string' && body.category.trim()
        ? body.category.trim().slice(0, 80)
        : 'General';
    const rawPriority = typeof body.priority === 'string' ? body.priority.trim().toUpperCase() : 'MEDIUM';
    const priority = VALID_PRIORITIES.has(rawPriority) ? rawPriority : 'MEDIUM';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    const ticketId = `tck_${crypto.randomUUID()}`;
    const ticketNumber = `TCK-${crypto.randomInt(100000, 999999)}`;
    const messageId = `msg_${crypto.randomUUID()}`;

    const newTicket = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const tRes = await client.query(
        `INSERT INTO public.tickets (
           id, ticket_number, user_id, customer_name, customer_email,
           subject, category, priority, status, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN', NOW(), NOW())
         RETURNING *`,
        [ticketId, ticketNumber, actor.id, customerName, actor.email, subject, category, priority]
      );

      await client.query(
        `INSERT INTO public.ticket_messages (
           id, ticket_id, sender_id, sender_name, sender_role, message, created_at
         ) VALUES ($1, $2, $3, $4, 'user', $5, NOW())`,
        [messageId, ticketId, actor.id, customerName, message]
      );

      return tRes.rows[0];
    });

    return NextResponse.json({
      success: true,
      ticket: newTicket,
    });
  } catch (error: unknown) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
