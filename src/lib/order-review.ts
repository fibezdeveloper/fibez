import { adminStore, type AdminOrder } from '@/lib/admin-store';
import { awardReferral } from '@/lib/wallet';
import { dbReady } from '@/lib/db/tx';
import { fulfillOrder, recordFulfilledClients, revokeOrderLines } from '@/lib/fulfillment';
import { notifyLater } from '@/lib/telegram';
import { tgMessages } from '@/lib/telegram-bot';

/**
 * Approving / rejecting a customer order. ONE implementation used by the admin console route and the
 * admin Telegram bot, so both paths deliver, refuse and notify in exactly the same way.
 */

export type ApproveResult =
  | {
      ok: true;
      order: AdminOrder | null;
      itemKeys: Record<string, string>;
      dispensedPayload: string;
      referralAwarded: boolean;
    }
  | { ok: false; status: number; error: string };

export async function approveOrder(
  order: AdminOrder,
  reviewer: string,
  reviewNotes: string,
  manualKeys: Record<string, string> = {}
): Promise<ApproveResult> {
  // Idempotency: approving twice would provision a second 3x-ui client / burn another stock key.
  if (order.paymentStatus === 'VERIFIED' && order.fulfillmentStatus === 'DELIVERED') {
    return { ok: false, status: 409, error: 'Order is already approved and delivered' };
  }

  const result = await fulfillOrder(order, manualKeys);
  if (!result.ok) {
    return { ok: false, status: result.status, error: `${result.error} The order was NOT approved.` };
  }
  const { itemKeys, panelClients, dispensedPayload } = result;

  // Referral reward goes to the referrer's WALLET (once per order, idempotent).
  let referralAwarded = false;
  if (order.referralCode && dbReady()) {
    try {
      const r = await awardReferral({ orderNumber: order.orderNumber, code: order.referralCode, buyerEmail: order.customerEmail });
      referralAwarded = Boolean(r?.awarded);
    } catch (refErr) {
      console.error('Referral reward failed (order still approved):', refErr);
    }
  }

  const updated = await adminStore.updateOrderStatus(order.orderNumber, {
    paymentStatus: 'VERIFIED',
    fulfillmentStatus: 'DELIVERED',
    reviewedBy: reviewer,
    reviewNotes: reviewNotes || 'Bank receipt verified and approved by admin.',
    itemKeys,
    metadata: { panelClients },
  });
  await recordFulfilledClients(order, panelClients);

  // Telegram: tell the customer right away if they connected the bot (no-op otherwise).
  const m = tgMessages.delivered(
    order.orderNumber,
    order.items.map((i) => ({ title: i.productTitle, key: itemKeys[i.id] || '' })).filter((c) => c.key)
  );
  notifyLater(order.customerEmail, m.html, m.buttons);

  return { ok: true, order: updated, itemKeys, dispensedPayload, referralAwarded };
}

export async function rejectOrder(
  order: AdminOrder,
  reviewer: string,
  reviewNotes: string
): Promise<{ order: AdminOrder | null; revokedClients: number }> {
  // Rejecting (or revoking) an order that already got V2Ray lines removes them from the panel.
  const revokedClients = await revokeOrderLines(order);
  const updated = await adminStore.updateOrderStatus(order.orderNumber, {
    paymentStatus: 'FAILED',
    fulfillmentStatus: 'REVOKED',
    reviewedBy: reviewer,
    reviewNotes: reviewNotes || 'Payment rejected. Receipt could not be validated.',
  });
  const m = tgMessages.orderRejected(order.orderNumber, reviewNotes || undefined);
  notifyLater(order.customerEmail, m.html, m.buttons);
  return { order: updated, revokedClients };
}
