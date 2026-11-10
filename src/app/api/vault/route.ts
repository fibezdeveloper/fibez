import { NextRequest, NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import {
  buildRlsContext,
  getRecentOrderNumberFromRequest,
  getVerifiedSessionUser,
  isStaffRole,
} from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

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

    const itemsQuery = await withRlsTransaction(
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

    const assets = itemsQuery.map((item) => ({
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
