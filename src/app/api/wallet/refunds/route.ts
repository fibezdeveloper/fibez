import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/dal';
import { dbReady, withTransaction } from '@/lib/db/tx';
import { adminStore } from '@/lib/admin-store';
import { xui } from '@/lib/xui';
import {
  createRefundRequest,
  listRefunds,
  getPanelClientsByOrder,
  REFUND_REASONS,
  REFUND_MAX_USAGE_GB,
  REFUND_WINDOW_HOURS,
  type RefundReason,
} from '@/lib/wallet';

// GET: the user's own refund requests
export async function GET() {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!dbReady()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  return NextResponse.json({ refunds: await listRefunds({ userId: auth.user.id }), reasons: REFUND_REASONS });
}

/**
 * POST: ask for a refund. Rules (enforced here, not in the browser):
 *  - only your own paid + delivered order, never a free grant / trial
 *  - within 24 hours of delivery, and only if you did NOT confirm "received & works"
 *  - one request per order; users with a history of refund requests are blocked
 *  - a line that already used more than ~1 GB cannot be claimed as "not working"
 * Approved refunds are credited to the WALLET (never back to the bank) by staff.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!dbReady()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  const user = auth.user;
  if ((await rateLimit('refund', user.id, 5, 3600)).limited) {
    return NextResponse.json({ error: 'Too many refund requests. Please try again later.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim().toUpperCase() : '';
  const reasonCode = typeof body.reasonCode === 'string' ? (body.reasonCode as RefundReason) : ('' as RefundReason);
  const details = typeof body.details === 'string' ? body.details.trim().slice(0, 2000) : '';

  if (!orderNumber || !(reasonCode in REFUND_REASONS)) {
    return NextResponse.json({ error: 'Choose the order and a reason.' }, { status: 400 });
  }
  if (details.length < 15) {
    return NextResponse.json({ error: 'Please describe the problem (at least a sentence) so we can check it.' }, { status: 400 });
  }

  const order = await adminStore.getOrder(orderNumber);
  const owns = order && (order.userId === user.id || order.customerEmail.toLowerCase() === user.email.toLowerCase());
  if (!order || !owns) return NextResponse.json({ error: 'Order not found on your account.' }, { status: 404 });

  if (order.paymentStatus !== 'VERIFIED' || order.fulfillmentStatus !== 'DELIVERED') {
    return NextResponse.json({ error: 'Only paid and delivered orders can be refunded.' }, { status: 400 });
  }
  if (order.totalAmountLKR <= 0 || order.paymentMethod === 'staff_grant' || order.orderNumber.startsWith('FBZ-TRL-')) {
    return NextResponse.json({ error: 'Free items and trials cannot be refunded.' }, { status: 400 });
  }
  if (order.receivedConfirmedAt) {
    return NextResponse.json({ error: 'You confirmed this order as received and working, so it can no longer be refunded.' }, { status: 403 });
  }
  const deliveredAt = new Date(order.deliveredAt || order.updatedAt).getTime();
  if (Date.now() - deliveredAt > REFUND_WINDOW_HOURS * 3600 * 1000) {
    return NextResponse.json({ error: `The ${REFUND_WINDOW_HOURS}-hour claim window for this order has closed.` }, { status: 403 });
  }

  // Abuse guard: people who keep asking for refunds get blocked.
  const history = await listRefunds({ userId: user.id });
  const approved = history.filter((r) => r.status === 'APPROVED').length;
  const last90 = history.filter((r) => Date.now() - new Date(r.created_at).getTime() < 90 * 86400000).length;
  if (approved >= 2 || last90 >= 3) {
    return NextResponse.json({ error: 'Refund requests are not available on this account. Please contact support.' }, { status: 403 });
  }

  // Evidence from the panel: how much of the line was actually used.
  const evidence: Record<string, unknown> = { deliveredAt: order.deliveredAt, paymentMethod: order.paymentMethod };
  let usedGB = 0;
  try {
    for (const c of await getPanelClientsByOrder(order.orderNumber)) {
      const live = await xui.getClient(c.uuid);
      if (live) usedGB += (live.usedTraffic || 0) / (1024 * 1024 * 1024);
    }
    evidence.panelUsedGB = Number(usedGB.toFixed(2));
  } catch {
    evidence.panelUsedGB = 'unavailable';
  }
  if (reasonCode === 'NOT_WORKING' && usedGB > REFUND_MAX_USAGE_GB) {
    return NextResponse.json(
      { error: `This line already used ${usedGB.toFixed(1)} GB, so it clearly works. If you have a real problem, describe it and open a support ticket.` },
      { status: 403 }
    );
  }

  const created = await createRefundRequest({
    userId: user.id,
    userEmail: user.email,
    orderNumber: order.orderNumber,
    amount: order.totalAmountLKR,
    reasonCode,
    details,
    evidence,
  });
  if (!created.ok) return NextResponse.json({ error: 'A refund request already exists for this order.' }, { status: 409 });

  // Also open a support ticket so staff and the customer can talk about it.
  try {
    const ticketId = `tck_${crypto.randomUUID()}`;
    await withTransaction(async (c) => {
      await c.query(
        `INSERT INTO public.tickets (id, ticket_number, user_id, customer_name, customer_email, subject, category, priority, status)
         VALUES ($1,$2,$3,$4,$5,$6,'Refund','HIGH','OPEN')`,
        [ticketId, `TCK-${crypto.randomInt(100000, 999999)}`, user.id, user.name || user.email, user.email.toLowerCase(), `Refund request: ${order.orderNumber}`]
      );
      await c.query(
        `INSERT INTO public.ticket_messages (id, ticket_id, sender_id, sender_name, sender_role, message)
         VALUES ($1,$2,$3,$4,'user',$5)`,
        [`msg_${crypto.randomUUID()}`, ticketId, user.id, user.name || user.email, `${REFUND_REASONS[reasonCode]}\n\n${details}`]
      );
    });
  } catch (err) {
    console.warn('Refund ticket was not created (request still saved):', err);
  }

  return NextResponse.json({ success: true, id: created.id, message: 'Refund request sent. Staff will review it and reply on your ticket.' });
}
