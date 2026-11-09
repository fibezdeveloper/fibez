import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  const connectionString = process.env.DATABASE_URL || '';
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(connectionString);
}

export async function GET(req: NextRequest) {
  try {
    const sql = getSql();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const role = searchParams.get('role'); // 'user', 'admin', 'owner'

    let ticketsList;

    if (role === 'admin' || role === 'owner' || !email) {
      ticketsList = await sql`
        SELECT 
          t.*,
          COUNT(m.id)::int AS message_count,
          MAX(m.created_at) AS last_message_at
        FROM public.tickets t
        LEFT JOIN public.ticket_messages m ON t.id = m.ticket_id
        GROUP BY t.id
        ORDER BY t.updated_at DESC
      `;
    } else {
      ticketsList = await sql`
        SELECT 
          t.*,
          COUNT(m.id)::int AS message_count,
          MAX(m.created_at) AS last_message_at
        FROM public.tickets t
        LEFT JOIN public.ticket_messages m ON t.id = m.ticket_id
        WHERE t.customer_email = ${email}
        GROUP BY t.id
        ORDER BY t.updated_at DESC
      `;
    }

    return NextResponse.json({ tickets: ticketsList });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getSql();
    const body = await req.json();
    const { customerName, customerEmail, subject, category, priority, message, userId } = body;

    if (!customerEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Customer email, subject, and message are required' },
        { status: 400 }
      );
    }

    const ticketId = 'tck-' + Math.random().toString(36).substring(2, 10);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TCK-${randomDigits}`;

    const newTicket = await sql`
      INSERT INTO public.tickets (
        id, ticket_number, user_id, customer_name, customer_email,
        subject, category, priority, status, created_at, updated_at
      ) VALUES (
        ${ticketId}, ${ticketNumber}, ${userId || null}, ${customerName || 'Anonymous User'},
        ${customerEmail}, ${subject}, ${category || 'General'}, ${priority || 'MEDIUM'},
        'OPEN', NOW(), NOW()
      )
      RETURNING *
    `;

    const messageId = 'msg-' + Math.random().toString(36).substring(2, 10);
    await sql`
      INSERT INTO public.ticket_messages (
        id, ticket_id, sender_id, sender_name, sender_role, message, created_at
      ) VALUES (
        ${messageId}, ${ticketId}, ${userId || null}, ${customerName || 'Anonymous User'},
        'user', ${message}, NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      ticket: newTicket[0],
    });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: error.message || 'Failed to create ticket' }, { status: 500 });
  }
}
