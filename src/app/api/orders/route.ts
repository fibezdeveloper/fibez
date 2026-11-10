import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { buildRlsContext, isStaffRole, requireAuth, requireRole } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

const ALLOWED_PAYMENT_STATUSES = new Set([
  'PENDING_PAYMENT',
  'PENDING_REVIEW',
  'VERIFIED',
  'FAILED',
  'REFUNDED',
]);

const ALLOWED_FULFILLMENT_STATUSES = new Set([
  'PENDING',
  'PROCESSING',
  'MINTED',
  'DELIVERED',
  'REVOKED',
]);

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;
    const isStaff = isStaffRole(actor.role);

    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email')?.trim().toLowerCase() || '';
    const orderNumberParam = searchParams.get('order_number')?.trim().toUpperCase() || '';

    const ordersWithItems = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      let orderRows;

      if (isStaff) {
        if (orderNumberParam) {
          const res = await client.query(
            `SELECT * FROM public.orders WHERE order_number = $1 LIMIT 1`,
            [orderNumberParam]
          );
          orderRows = res.rows;
        } else if (emailParam) {
          const res = await client.query(
            `SELECT * FROM public.orders WHERE LOWER(customer_email) = $1 ORDER BY created_at DESC LIMIT 50`,
            [emailParam]
          );
          orderRows = res.rows;
        } else {
          const res = await client.query(
            `SELECT * FROM public.orders ORDER BY created_at DESC LIMIT 50`
          );
          orderRows = res.rows;
        }
      } else {
        if (orderNumberParam) {
          const res = await client.query(
            `SELECT * FROM public.orders
             WHERE order_number = $1
               AND (user_id = $2 OR LOWER(customer_email) = $3)
             LIMIT 1`,
            [orderNumberParam, actor.id, actor.email]
          );
          orderRows = res.rows;
        } else {
          const res = await client.query(
            `SELECT * FROM public.orders
             WHERE user_id = $1 OR LOWER(customer_email) = $2
             ORDER BY created_at DESC
             LIMIT 50`,
            [actor.id, actor.email]
          );
          orderRows = res.rows;
        }
      }

      if (orderRows.length === 0) {
        return [];
      }

      const orderIds = orderRows.map((o) => o.id);
      const itemsRes = await client.query(
        `SELECT * FROM public.order_items WHERE order_id = ANY($1::text[]) ORDER BY created_at ASC`,
        [orderIds]
      );

      const itemsByOrder = new Map<string, Record<string, unknown>[]>();
      for (const item of itemsRes.rows) {
        const list = itemsByOrder.get(item.order_id) || [];
        list.push(item);
        itemsByOrder.set(item.order_id, list);
      }

      return orderRows.map((o) => ({
        ...o,
        items: itemsByOrder.get(o.id) || [],
      }));
    });

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireRole(['admin', 'owner']);
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;

    const body = await request.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const paymentStatus = typeof body.paymentStatus === 'string' ? body.paymentStatus.trim() : null;
    const fulfillmentStatus =
      typeof body.fulfillmentStatus === 'string' ? body.fulfillmentStatus.trim() : null;
    const reviewNotes = typeof body.reviewNotes === 'string' ? body.reviewNotes.trim() : null;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (paymentStatus && !ALLOWED_PAYMENT_STATUSES.has(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid paymentStatus value' }, { status: 400 });
    }

    if (fulfillmentStatus && !ALLOWED_FULFILLMENT_STATUSES.has(fulfillmentStatus)) {
      return NextResponse.json({ error: 'Invalid fulfillmentStatus value' }, { status: 400 });
    }

    const updatedOrder = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const res = await client.query(
        `UPDATE public.orders
         SET
           payment_status = COALESCE($1, payment_status),
           fulfillment_status = COALESCE($2, fulfillment_status),
           review_notes = COALESCE($3, review_notes),
           reviewed_by = $4,
           updated_at = NOW()
         WHERE id = $5 OR order_number = $5
         RETURNING id, order_number`,
        [paymentStatus, fulfillmentStatus, reviewNotes, actor.email, orderId]
      );

      if (res.rows.length === 0) {
        return null;
      }

      await client.query(
        `INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, 'ORDER_STATUS_UPDATED', 'ORDER', $4, $5::jsonb)`,
        [
          `audit_ord_${crypto.randomUUID()}`,
          actor.id,
          actor.email,
          res.rows[0].id,
          JSON.stringify({
            orderNumber: res.rows[0].order_number,
            paymentStatus,
            fulfillmentStatus,
            reviewNotes,
          }),
        ]
      );

      return res.rows[0];
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, orderId: updatedOrder.id });
  } catch (error: unknown) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
