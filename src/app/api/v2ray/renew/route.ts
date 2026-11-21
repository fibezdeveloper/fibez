import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/dal';
import { dbReady, withTransaction } from '@/lib/db/tx';
import { adminStore } from '@/lib/admin-store';
import { xui } from '@/lib/xui';
import { renewalQuote } from '@/lib/pricing';
import {
  applyLedger,
  applyLedgerOnce,
  getBalance,
  getPanelClientByUuid,
  setPanelClientExpiry,
  InsufficientFundsError,
} from '@/lib/wallet';

// GET ?uuid=...: what renewing one of YOUR lines would cost, plus your wallet balance.
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!dbReady()) return NextResponse.json({ error: 'Renewals are unavailable right now' }, { status: 503 });
  const uuid = (new URL(req.url).searchParams.get('uuid') || '').trim();
  const pc = uuid ? await getPanelClientByUuid(uuid) : null;
  if (!pc || pc.status !== 'ACTIVE' || pc.user_email.toLowerCase() !== auth.user.email.toLowerCase()) {
    return NextResponse.json({ error: 'Line not found on your account' }, { status: 404 });
  }
  const origin = await adminStore.getOrder(pc.order_number);
  const item = origin?.items.find((i) => i.id === pc.item_id) || origin?.items[0];
  const quotes = item
    ? [1, 3, 6, 12].map((m) => ({ months: m, quote: renewalQuote(item.productId, m) })).filter((x) => x.quote).map((x) => ({ months: x.months, priceLKR: x.quote!.priceLKR }))
    : [];
  return NextResponse.json({ quotes, balanceLkr: await getBalance(auth.user.id), expiresAt: pc.expires_at });
}
/**
 * POST { uuid, months }: renew one of YOUR V2Ray lines, paid from the wallet.
 * The wallet debit and the renewal record are one transaction; if the panel then fails to extend the
 * line, the money is returned automatically.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!dbReady()) return NextResponse.json({ error: 'Renewals are unavailable right now' }, { status: 503 });
  const user = auth.user;
  if ((await rateLimit('renew', user.id, 10, 600)).limited) {
    return NextResponse.json({ error: 'Too many renewal attempts. Please wait a few minutes.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const uuid = typeof body.uuid === 'string' ? body.uuid.trim() : '';
  const months = Math.round(Number(body.months));
  if (!uuid || !Number.isFinite(months)) return NextResponse.json({ error: 'Choose a line and a duration' }, { status: 400 });

  // Ownership: the panel client must belong to THIS account.
  const pc = await getPanelClientByUuid(uuid);
  if (!pc || pc.status !== 'ACTIVE' || pc.user_email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ error: 'Line not found on your account' }, { status: 404 });
  }

  const origin = await adminStore.getOrder(pc.order_number);
  const item = origin?.items.find((i) => i.id === pc.item_id) || origin?.items[0];
  const quote = item ? renewalQuote(item.productId, months) : null;
  if (!origin || !item || !quote) {
    return NextResponse.json({ error: 'This line cannot be renewed online. Please contact support.' }, { status: 400 });
  }

  const live = await xui.getClient(uuid).catch(() => null);
  if (!live) return NextResponse.json({ error: 'The line is not available on the server right now. Try again shortly.' }, { status: 503 });

  const orderId = `ord_rnw_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const orderNumber = `FBZ-RNW-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();
  // Same line + same current expiry = same key, so a double-click can never charge twice.
  const idem = `renew:${pc.email}:${live.expiryTime}`;

  try {
    await withTransaction(async (client) => {
      await applyLedger(client, {
        userId: user.id,
        type: 'PURCHASE',
        amount: -quote.priceLKR,
        refType: 'order',
        refId: orderNumber,
        reason: `${quote.title} (${months} month${months > 1 ? 's' : ''})`,
        actorId: user.id,
        actorEmail: user.email,
        idem,
      });
      await adminStore.addOrder(
        {
          id: orderId,
          orderNumber,
          userId: user.id,
          customerName: user.name || user.email,
          customerEmail: user.email,
          totalAmountLKR: quote.priceLKR,
          totalAmountUSD: Number((quote.priceLKR / 305).toFixed(2)),
          currency: 'LKR',
          paymentMethod: 'wallet',
          paymentStatus: 'VERIFIED',
          fulfillmentStatus: 'DELIVERED',
          renewOrderId: pc.order_number,
          reviewedBy: 'wallet-auto',
          reviewNotes: `Renewal of ${pc.order_number} for ${months} month(s)`,
          deliveredAt: now,
          createdAt: now,
          updatedAt: now,
          items: [
            {
              id: `${orderId}_1`,
              orderId,
              productId: quote.productId,
              productTitle: quote.title,
              variantTitle: `${months} Month${months > 1 ? 's' : ''}`,
              quantity: 1,
              unitPriceLKR: quote.priceLKR,
              subtotalLKR: quote.priceLKR,
              dispensedKey: null, // the line already exists: a renewal never creates a second one
              keyType: 'CONNECTION_CONFIG',
              status: 'DELIVERED',
            },
          ],
        },
        client
      );
    });
  } catch (err) {
    if (err instanceof InsufficientFundsError) {
      return NextResponse.json(
        { error: 'Not enough wallet balance. Top up first.', balanceLkr: await getBalance(user.id), neededLkr: quote.priceLKR },
        { status: 402 }
      );
    }
    throw err;
  }

  try {
    const newExpiry = await xui.extendClient(pc.email, months * 30);
    await setPanelClientExpiry(pc.email, new Date(newExpiry)).catch(() => {});
    return NextResponse.json({
      success: true,
      orderNumber,
      chargedLkr: quote.priceLKR,
      newExpiry: new Date(newExpiry).toISOString(),
      balanceLkr: await getBalance(user.id),
    });
  } catch (err) {
    console.error('Renewal failed on the panel, reversing:', err);
    const rev = await applyLedgerOnce({
      userId: user.id,
      type: 'REVERSAL',
      amount: quote.priceLKR,
      refType: 'order',
      refId: orderNumber,
      reason: `Renewal ${orderNumber} failed on the server: automatic reversal`,
      idem: `reversal:${orderId}`,
    });
    await adminStore.updateOrderStatus(orderNumber, {
      paymentStatus: 'REFUNDED',
      fulfillmentStatus: 'REVOKED',
      reviewedBy: 'system',
      reviewNotes: 'Panel renewal failed. Wallet reversed automatically.',
    });
    return NextResponse.json(
      { error: 'We could not renew the line right now. You were NOT charged. Please try again shortly.', balanceLkr: rev.balanceAfter },
      { status: 503 }
    );
  }
}
