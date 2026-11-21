import crypto from 'crypto';
import type { PoolClient } from '@neondatabase/serverless';
import { sql } from '@/lib/db';
import { withTransaction } from '@/lib/db/tx';
import type { AdminOrder, AdminOrderItem, AdminInventoryItem, AdminPromoCode } from '@/lib/admin-store';

/**
 * Postgres implementation of orders / stock / coupons (replaces the JSON admin_state document).
 * AdminStore delegates here whenever DATABASE_URL is configured.
 */

const q = async (text: string, params: unknown[] = []): Promise<any[]> => {
  if (!sql) throw new Error('Database is not configured');
  return (await sql.query(text, params)) as unknown as any[];
};
const iso = (v: unknown): string | null => (v ? new Date(v as any).toISOString() : null);

// ------------------------------------------------------------------------------------ orders

function mapItem(r: any): AdminOrderItem {
  return {
    id: r.id,
    orderId: r.order_id,
    productId: r.product_id || '',
    productTitle: r.product_title,
    variantTitle: r.variant_title || undefined,
    quantity: Number(r.quantity),
    unitPriceLKR: Number(r.unit_price_lkr),
    subtotalLKR: Number(r.subtotal_lkr),
    dispensedKey: r.dispensed_key,
    keyType: r.key_type || undefined,
    guideMarkdown: r.guide_markdown || undefined,
    warranty: r.warranty || undefined,
    status: (r.status as AdminOrderItem['status']) || 'PENDING',
  };
}

function mapOrder(r: any, items: any[]): AdminOrder {
  const x = r.extra || {};
  return {
    id: r.id,
    orderNumber: r.order_number,
    userId: r.user_id,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerWhatsapp: r.customer_whatsapp,
    totalAmountLKR: Number(r.total_amount_lkr),
    totalAmountUSD: Number(r.total_amount_usd),
    currency: (r.currency as AdminOrder['currency']) || 'LKR',
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    fulfillmentStatus: r.fulfillment_status,
    receiptImageUrl: r.receipt_image_url,
    receiptUploadedAt: iso(r.receipt_uploaded_at),
    promoCode: r.promo_code,
    bankName: x.bankName ?? null,
    reviewedBy: r.reviewed_by,
    reviewNotes: r.review_notes,
    grantType: x.grantType ?? null,
    renewOrderId: x.renewOrderId ?? null,
    existingUuid: x.existingUuid ?? null,
    referralCode: x.referralCode ?? null,
    referralCreditsAwarded: x.referralCreditsAwarded,
    receiptAnalysis: x.receiptAnalysis,
    metadata: x.metadata,
    deliveredAt: iso(r.delivered_at),
    receivedConfirmedAt: iso(r.received_confirmed_at),
    createdAt: iso(r.created_at) as string,
    updatedAt: iso(r.updated_at) as string,
    items: items.map(mapItem),
  };
}

async function attachItems(rows: any[]): Promise<AdminOrder[]> {
  if (rows.length === 0) return [];
  const items = await q('SELECT * FROM public.order_items WHERE order_id = ANY($1::text[]) ORDER BY created_at, id', [rows.map((r) => r.id)]);
  const byOrder = new Map<string, any[]>();
  for (const it of items) {
    const list = byOrder.get(it.order_id) || [];
    list.push(it);
    byOrder.set(it.order_id, list);
  }
  return rows.map((r) => mapOrder(r, byOrder.get(r.id) || []));
}

export async function dbGetOrders(): Promise<AdminOrder[]> {
  return attachItems(await q('SELECT * FROM public.orders ORDER BY created_at DESC LIMIT 1000'));
}

export async function dbGetOrder(idOrNumber: string): Promise<AdminOrder | undefined> {
  const rows = await q('SELECT * FROM public.orders WHERE id = $1 OR upper(order_number) = upper($1) LIMIT 1', [idOrNumber.trim()]);
  return (await attachItems(rows))[0];
}

export async function dbGetOrdersForUser(userId: string, email: string): Promise<AdminOrder[]> {
  return attachItems(
    await q('SELECT * FROM public.orders WHERE user_id = $1 OR lower(customer_email) = lower($2) ORDER BY created_at DESC LIMIT 200', [userId, email])
  );
}

export async function dbAddOrder(o: AdminOrder, client?: PoolClient): Promise<AdminOrder> {
  const run = async (c: PoolClient) => {
    // Only store keys that have a value (a JSON null here would break later metadata merges).
    const extra = Object.fromEntries(
      Object.entries({
        bankName: o.bankName,
        grantType: o.grantType,
        renewOrderId: o.renewOrderId,
        existingUuid: o.existingUuid,
        referralCode: o.referralCode,
        referralCreditsAwarded: o.referralCreditsAwarded,
        receiptAnalysis: o.receiptAnalysis,
        metadata: o.metadata,
      }).filter(([, v]) => v !== undefined && v !== null)
    );
    await c.query(
      `INSERT INTO public.orders (
         id, order_number, user_id, customer_email, customer_whatsapp, customer_name,
         total_amount_lkr, total_amount_usd, currency, payment_method, payment_status, fulfillment_status,
         receipt_image_url, receipt_uploaded_at, promo_code, reviewed_by, review_notes, extra, delivered_at, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb,$19,$20,$21)`,
      [
        o.id, o.orderNumber, o.userId ?? null, o.customerEmail.toLowerCase(), o.customerWhatsapp ?? null, o.customerName,
        Math.round(o.totalAmountLKR), o.totalAmountUSD, o.currency, o.paymentMethod, o.paymentStatus, o.fulfillmentStatus,
        o.receiptImageUrl ?? null, o.receiptUploadedAt ?? null, o.promoCode ?? null, o.reviewedBy ?? null, o.reviewNotes ?? null,
        JSON.stringify(extra), o.deliveredAt ?? null, o.createdAt, o.updatedAt,
      ]
    );
    for (const it of o.items) {
      await c.query(
        `INSERT INTO public.order_items (
           id, order_id, product_id, product_title, variant_title, quantity, unit_price_lkr, unit_price_usd,
           subtotal_lkr, subtotal_usd, dispensed_key, key_type, guide_markdown, warranty, status
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          it.id, o.id, it.productId, it.productTitle, it.variantTitle ?? null, it.quantity, Math.round(it.unitPriceLKR),
          Number((it.unitPriceLKR / 305).toFixed(2)), Math.round(it.subtotalLKR), Number((it.subtotalLKR / 305).toFixed(2)),
          it.dispensedKey ?? null, it.keyType ?? null, it.guideMarkdown ?? null, it.warranty ?? null, it.status,
        ]
      );
    }
  };
  if (client) await run(client);
  else await withTransaction(run);
  return o;
}

export async function dbUpdateOrderStatus(
  idOrNumber: string,
  u: {
    paymentStatus?: string;
    fulfillmentStatus?: string;
    reviewNotes?: string;
    reviewedBy?: string;
    dispensedKey?: string;
    itemKeys?: Record<string, string>;
    metadata?: AdminOrder['metadata'];
  }
): Promise<AdminOrder | null> {
  return withTransaction(async (c) => {
    const found = await c.query('SELECT id FROM public.orders WHERE id = $1 OR upper(order_number) = upper($1) FOR UPDATE', [idOrNumber.trim()]);
    const id = found.rows[0]?.id as string | undefined;
    if (!id) return null;

    await c.query(
      `UPDATE public.orders SET
         payment_status     = COALESCE($2::text, payment_status),
         fulfillment_status = COALESCE($3::text, fulfillment_status),
         review_notes       = CASE WHEN $4::boolean THEN $5::text ELSE review_notes END,
         reviewed_by        = COALESCE($6::text, reviewed_by),
         delivered_at       = CASE WHEN $3::text = 'DELIVERED' AND delivered_at IS NULL THEN now() ELSE delivered_at END,
         extra              = CASE WHEN $7::jsonb IS NULL THEN extra ELSE extra || jsonb_build_object('metadata', (CASE WHEN jsonb_typeof(extra->'metadata') = 'object' THEN extra->'metadata' ELSE '{}'::jsonb END) || $7::jsonb) END,
         updated_at         = now()
       WHERE id = $1`,
      [
        id, u.paymentStatus ?? null, u.fulfillmentStatus ?? null,
        u.reviewNotes !== undefined, u.reviewNotes ?? null, u.reviewedBy ?? null,
        u.metadata ? JSON.stringify(u.metadata) : null,
      ]
    );

    if (u.itemKeys) {
      for (const [itemId, key] of Object.entries(u.itemKeys)) {
        await c.query(`UPDATE public.order_items SET dispensed_key = $3, status = 'DELIVERED' WHERE id = $1 AND order_id = $2`, [itemId, id, key]);
      }
    } else if (u.dispensedKey) {
      await c.query(
        `UPDATE public.order_items SET dispensed_key = $2, status = 'DELIVERED'
          WHERE id = (SELECT id FROM public.order_items WHERE order_id = $1 ORDER BY created_at, id LIMIT 1)`,
        [id, u.dispensedKey]
      );
    }
    // Revoked / refunded orders: mark their items as revoked too.
    if (u.fulfillmentStatus === 'REVOKED') {
      await c.query(`UPDATE public.order_items SET status = 'REVOKED' WHERE order_id = $1`, [id]);
    }

    const fresh = await c.query('SELECT * FROM public.orders WHERE id = $1', [id]);
    const items = await c.query('SELECT * FROM public.order_items WHERE order_id = $1 ORDER BY created_at, id', [id]);
    return mapOrder(fresh.rows[0], items.rows);
  });
}

/** Customer says "I received it and it works": closes the refund window for this order. */
export async function dbConfirmReceived(orderNumber: string, email: string): Promise<boolean> {
  const rows = await q(
    `UPDATE public.orders SET received_confirmed_at = now(), updated_at = now()
      WHERE upper(order_number) = upper($1) AND lower(customer_email) = lower($2)
        AND received_confirmed_at IS NULL AND fulfillment_status = 'DELIVERED'
      RETURNING id`,
    [orderNumber, email]
  );
  return rows.length > 0;
}

// ------------------------------------------------------------------------------------ inventory

function mapInv(r: any): AdminInventoryItem {
  return {
    id: r.id,
    productId: r.product_id,
    productTitle: r.product_title || r.product_id,
    stockType: r.stock_type,
    keyPayload: r.key_payload,
    status: r.status,
    batchReference: r.batch_reference || undefined,
    dispensedToEmail: r.assigned_user_email,
    dispensedOrderId: r.order_id,
    createdAt: iso(r.created_at) as string,
  };
}

export async function dbGetInventory(): Promise<AdminInventoryItem[]> {
  return (await q('SELECT * FROM public.inventory_items ORDER BY created_at DESC LIMIT 5000')).map(mapInv);
}

export async function dbAddInventoryBatch(
  productId: string,
  productTitle: string,
  stockType: AdminInventoryItem['stockType'],
  rawKeys: string[],
  batch: string
): Promise<number> {
  return withTransaction(async (c) => {
    let n = 0;
    for (const raw of rawKeys) {
      const key = raw.trim();
      if (!key) continue;
      await c.query(
        `INSERT INTO public.inventory_items (id, product_id, product_title, stock_type, key_payload, status, batch_reference)
         VALUES ($1,$2,$3,$4,$5,'AVAILABLE',$6)`,
        [`inv_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`, productId, productTitle, stockType, key, batch]
      );
      n++;
    }
    return n;
  });
}

/** Atomic: two simultaneous approvals can never receive the same key. */
export async function dbDispenseStockItem(productId: string, orderId: string, email: string): Promise<AdminInventoryItem | null> {
  const rows = await q(
    `UPDATE public.inventory_items SET status='DISPENSED', order_id=$2, assigned_user_email=$3, dispensed_at=now()
      WHERE id = (
        SELECT id FROM public.inventory_items
         WHERE status='AVAILABLE' AND (product_id = $1 OR position($1 in product_id) > 0)
         ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED)
      RETURNING *`,
    [productId, orderId, email]
  );
  return rows[0] ? mapInv(rows[0]) : null;
}

/** Put a dispensed key back (used when a wallet order has to be rolled back). */
export async function dbReleaseStockForOrder(orderId: string): Promise<void> {
  await q(`UPDATE public.inventory_items SET status='AVAILABLE', order_id=NULL, assigned_user_email=NULL, dispensed_at=NULL WHERE order_id=$1 AND status='DISPENSED'`, [orderId]);
}

export async function dbDeleteInventoryItem(id: string): Promise<boolean> {
  return (await q('DELETE FROM public.inventory_items WHERE id=$1 RETURNING id', [id])).length > 0;
}
export async function dbClearInventory(): Promise<void> {
  await q('DELETE FROM public.inventory_items');
}
export async function dbClearDispensed(): Promise<number> {
  return (await q(`DELETE FROM public.inventory_items WHERE status='DISPENSED' RETURNING id`)).length;
}

// ------------------------------------------------------------------------------------ coupons

function mapCoupon(r: any): AdminPromoCode {
  return {
    id: r.id,
    code: r.code,
    discountPercent: Number(r.discount_percent || 0),
    discountFixedLKR: Number(r.discount_fixed_lkr || 0),
    minSpendLKR: Number(r.min_spend_lkr || 0),
    maxUses: Number(r.max_uses || 0),
    timesUsed: Number(r.times_used || 0),
    isActive: Boolean(r.is_active),
    expiresAt: iso(r.expires_at),
    createdAt: iso(r.created_at) as string,
  };
}
export async function dbGetCoupons(): Promise<AdminPromoCode[]> {
  return (await q('SELECT * FROM public.promo_codes ORDER BY created_at DESC')).map(mapCoupon);
}
export async function dbAddCoupon(c: Omit<AdminPromoCode, 'id' | 'timesUsed' | 'createdAt'>): Promise<AdminPromoCode> {
  const rows = await q(
    `INSERT INTO public.promo_codes (id, code, discount_percent, discount_fixed_lkr, min_spend_lkr, max_uses, times_used, is_active, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,0,$7,$8) RETURNING *`,
    [`cpn_${crypto.randomUUID().slice(0, 8)}`, c.code.toUpperCase().trim(), c.discountPercent, c.discountFixedLKR, c.minSpendLKR, c.maxUses, c.isActive, c.expiresAt ?? null]
  );
  return mapCoupon(rows[0]);
}
export async function dbToggleCoupon(id: string): Promise<boolean> {
  const rows = await q('UPDATE public.promo_codes SET is_active = NOT is_active WHERE id=$1 RETURNING is_active', [id]);
  return rows[0] ? Boolean(rows[0].is_active) : false;
}
export async function dbDeleteCoupon(id: string): Promise<boolean> {
  return (await q('DELETE FROM public.promo_codes WHERE id=$1 RETURNING id', [id])).length > 0;
}

/** Atomically use one coupon redemption if the code is valid for this subtotal. Returns the discount, or null. */
export async function dbRedeemCoupon(code: string, subtotalLkr: number): Promise<number | null> {
  const rows = await q(
    `UPDATE public.promo_codes SET times_used = COALESCE(times_used,0) + 1
      WHERE upper(code) = upper($1) AND is_active
        AND (expires_at IS NULL OR expires_at > now())
        AND (COALESCE(max_uses,0) = 0 OR COALESCE(times_used,0) < max_uses)
        AND COALESCE(min_spend_lkr,0) <= $2
      RETURNING discount_percent, discount_fixed_lkr`,
    [code, subtotalLkr]
  );
  if (!rows[0]) return null;
  const pct = Number(rows[0].discount_percent || 0);
  const fixed = Number(rows[0].discount_fixed_lkr || 0);
  return Math.min(subtotalLkr, Math.round((subtotalLkr * pct) / 100) + fixed);
}