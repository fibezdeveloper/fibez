import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  const connectionString = process.env.DATABASE_URL || '';
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(connectionString);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSql();
    const { id } = await params;

    const ticketRows = await sql`
      SELECT * FROM public.tickets WHERE id = ${id} OR ticket_number = ${id}
    `;

    if (ticketRows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = ticketRows[0];
    const messages = await sql`
      SELECT * FROM public.ticket_messages
      WHERE ticket_id = ${ticket.id}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({ ticket, messages });
  } catch (error: any) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSql();
    const { id } = await params;
    const body = await req.json();
    const { message, senderName, senderRole, senderId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const ticketRows = await sql`
      SELECT id, status FROM public.tickets WHERE id = ${id} OR ticket_number = ${id}
    `;

    if (ticketRows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticket = ticketRows[0];
    const messageId = 'msg-' + Math.random().toString(36).substring(2, 10);
    const role = senderRole || 'user';

    await sql`
      INSERT INTO public.ticket_messages (
        id, ticket_id, sender_id, sender_name, sender_role, message, created_at
      ) VALUES (
        ${messageId}, ${ticket.id}, ${senderId || null}, ${senderName || (role === 'admin' ? 'Support Desk' : role === 'owner' ? 'Owner' : 'User')},
        ${role}, ${message}, NOW()
      )
    `;

    // Auto-update ticket status based on responder
    let newStatus = ticket.status;
    if (role === 'admin' || role === 'owner') {
      newStatus = 'IN_PROGRESS';
    } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      newStatus = 'OPEN'; // Reopened by user
    }

    await sql`
      UPDATE public.tickets
      SET updated_at = NOW(), status = ${newStatus}
      WHERE id = ${ticket.id}
    `;

    return NextResponse.json({ success: true, messageId, status: newStatus });
  } catch (error: any) {
    console.error('Error posting ticket message:', error);
    return NextResponse.json({ error: error.message || 'Failed to post message' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSql();
    const { id } = await params;
    const body = await req.json();
    const { status, priority } = body;

    const ticketRows = await sql`
      SELECT id FROM public.tickets WHERE id = ${id} OR ticket_number = ${id}
    `;

    if (ticketRows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const ticketId = ticketRows[0].id;

    if (status && priority) {
      await sql`
        UPDATE public.tickets
        SET status = ${status}, priority = ${priority}, updated_at = NOW()
        WHERE id = ${ticketId}
      `;
    } else if (status) {
      await sql`
        UPDATE public.tickets
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${ticketId}
      `;
    } else if (priority) {
      await sql`
        UPDATE public.tickets
        SET priority = ${priority}, updated_at = NOW()
        WHERE id = ${ticketId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: error.message || 'Failed to update ticket' }, { status: 500 });
  }
}
