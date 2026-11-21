import { NextRequest, NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import {
  buildRlsContext,
  getRecentOrderNumberFromRequest,
  getVerifiedSessionUser,
  isStaffRole,
} from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';
import { adminStore } from '@/lib/admin-store';
import { REFUND_WINDOW_HOURS } from '@/lib/wallet';

export async function GET(request: NextRequest) {
  try {
    const actor = await getVerifiedSessionUser();
    const recentOrderNumber = getRecentOrderNumberFromRequest(request);

    const { searchParams } = new URL(request.url);
    const orderNumberParam = searchParams.get('order_number')?.trim().toUpperCase() || '';

    if (orderNumberParam) {
      const canUseRecentCookie = recentOrderNumber === orderNumberParam;
      if (!actor && !canUseRecentCookie) {
        return NextResponse.json(
          {
            error: 'Please sign in with your purchase email to view order keys.',
            assets: [],
          },
          { status: 401 }
        );
      }
    } else if (!actor) {
      return NextResponse.json({ assets: [] }, { status: 401 });
    }

    const isStaff = isStaffRole(actor?.role);

    let itemsQuery: any[] = [];
    if (process.env.DATABASE_URL) {
      try {
        itemsQuery = await withRlsTransaction(
          buildRlsContext(actor, { recentOrderNumber }),
          async (client) => {
            if (orderNumberParam) {
              const res = await client.query(
                `SELECT
                   oi.id,
                   o.order_number,
                   oi.product_title as product_name,
                   p.category_id as category,
                   oi.variant_title,
                   oi.quantity,
                   oi.dispensed_key as payload,
                   oi.credential_user as username,
                   oi.credential_pass as password,
                   oi.key_type as type,
                   oi.guide_markdown,
                   oi.warranty,
                   oi.status,
                   o.created_at
                 FROM public.order_items oi
                 JOIN public.orders o ON oi.order_id = o.id
                 LEFT JOIN public.products p ON oi.product_id = p.id
                 WHERE o.order_number = $1
                   AND (
                     $2::boolean = TRUE
                     OR ($3::text <> '' AND o.user_id = $3)
                     OR ($4::text <> '' AND LOWER(o.customer_email) = $4)
                     OR ($5::text <> '' AND o.order_number = $5)
                   )
                 ORDER BY oi.created_at DESC`,
                [
                  orderNumberParam,
                  isStaff,
                  actor?.id || '',
                  actor?.email || '',
                  recentOrderNumber || '',
                ]
              );
              return res.rows;
            }

            const res = await client.query(
              `SELECT
                 oi.id,
                 o.order_number,
                 oi.product_title as product_name,
                 p.category_id as category,
                 oi.variant_title,
                 oi.quantity,
                 oi.dispensed_key as payload,
                 oi.credential_user as username,
                 oi.credential_pass as password,
                 oi.key_type as type,
                 oi.guide_markdown,
                 oi.warranty,
                 oi.status,
                 o.created_at
               FROM public.order_items oi
               JOIN public.orders o ON oi.order_id = o.id
               LEFT JOIN public.products p ON oi.product_id = p.id
               WHERE o.user_id = $1 OR LOWER(o.customer_email) = $2
               ORDER BY oi.created_at DESC`,
              [actor!.id, actor!.email]
            );
            return res.rows;
          }
        );
      } catch (dbErr) {
        console.warn('Postgres vault query skipped:', dbErr);
      }
    }

    if (!itemsQuery || itemsQuery.length === 0) {
      // Fallback to adminStore when database is not configured or in dev
      const allOrders = await adminStore.getOrders();
      // Ownership is enforced here too: a signed-in user must never read someone else's order
      // just by guessing its number.
      const userOrders = allOrders.filter((o) => {
        const ownsOrder =
          (isStaff && Boolean(orderNumberParam)) ||
          Boolean(actor?.email && o.customerEmail?.toLowerCase() === actor.email.toLowerCase()) ||
          Boolean(recentOrderNumber && o.orderNumber?.toUpperCase() === recentOrderNumber.toUpperCase());
        if (!ownsOrder) return false;
        if (orderNumberParam) return o.orderNumber?.toUpperCase() === orderNumberParam;
        return true;
      });
      itemsQuery = userOrders.flatMap((o) =>
        (o.items || []).map((item) => ({
          id: item.id,
          order_number: o.orderNumber,
          product_name: item.productTitle,
          category: 'vpn',
          variant_title: item.variantTitle,
          quantity: item.quantity,
          payload: item.dispensedKey || '',
          username: null,
          password: null,
          type: item.keyType || 'CONNECTION_CONFIG',
          guide_markdown: item.guideMarkdown,
          warranty: item.warranty,
          status: item.status,
          created_at: o.createdAt,
        }))
      );
    }

    // Refund window info per order (24h after delivery, closed once confirmed as working).
    const refundInfo = new Map<string, { refundable: boolean; refundDeadline: string | null }>();
    if (actor) {
      for (const num of new Set(itemsQuery.map((i) => String(i.order_number)))) {
        const ord = await adminStore.getOrder(num);
        if (!ord || ord.customerEmail.toLowerCase() !== actor.email.toLowerCase()) continue;
        const deliveredMs = new Date(ord.deliveredAt || ord.updatedAt).getTime();
        const paid = ord.totalAmountLKR > 0 && ord.paymentMethod !== 'staff_grant' && !ord.orderNumber.startsWith('FBZ-TRL-');
        const open =
          paid &&
          ord.paymentStatus === 'VERIFIED' &&
          ord.fulfillmentStatus === 'DELIVERED' &&
          !ord.receivedConfirmedAt &&
          Date.now() - deliveredMs < REFUND_WINDOW_HOURS * 3600 * 1000;
        refundInfo.set(num, {
          refundable: open,
          refundDeadline: open ? new Date(deliveredMs + REFUND_WINDOW_HOURS * 3600 * 1000).toISOString() : null,
        });
      }
    }

    const assets = itemsQuery.map((item) => ({
      refundable: refundInfo.get(String(item.order_number))?.refundable ?? false,
      refundDeadline: refundInfo.get(String(item.order_number))?.refundDeadline ?? null,
      id: item.id,
      orderNumber: item.order_number,
      productName: item.product_name,
      category: item.category || 'vpn',
      initialDays: 30,
      initialHours: 12,
      type:
        item.type === 'CONNECTION_CONFIG'
          ? 'VLESS URI'
          : item.type === 'ACCOUNT_CREDENTIALS'
          ? 'Credentials'
          : 'Serial Key',
      payload: item.payload || '',
      username: item.username,
      password: item.password,
      status: item.status === 'DELIVERED' ? 'ACTIVE' : item.status,
      guideMarkdown: item.guide_markdown,
      warranty: item.warranty,
    }));

    return NextResponse.json({ assets });
  } catch (error: unknown) {
    unstable_rethrow(error);
    console.error('Error fetching vault assets:', error);
    return NextResponse.json({ error: 'Failed to fetch vault assets' }, { status: 500 });
  }
}
