import { rateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/dal';
import { adminStore } from '@/lib/admin-store';

/**
 * POST { orderNumber }: "I received it and it works".
 * This closes the refund window for that order. Customers who have a problem use the refund
 * request (within 24 hours of delivery) instead.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if ((await rateLimit('confirm', auth.user.id, 30, 600)).limited) {
    return NextResponse.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : '';
  if (!orderNumber) return NextResponse.json({ error: 'Order number required' }, { status: 400 });

  const ok = await adminStore.confirmReceived(orderNumber, auth.user.email);
  if (!ok) {
    return NextResponse.json({ error: 'Nothing to confirm (order not found, not delivered yet, or already confirmed).' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
