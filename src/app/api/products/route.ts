import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildRlsContext,
  getVerifiedSessionUser,
  isStaffRole,
  requireRole,
} from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

export async function GET(request: NextRequest) {
  try {
    const actor = await getVerifiedSessionUser();
    const isStaff = isStaffRole(actor?.role);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category')?.trim() || '';
    const id = searchParams.get('id')?.trim() || '';
    const includeInactive = isStaff && searchParams.get('all') === 'true';

    const data = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      if (id) {
        const res = await client.query(
          `SELECT * FROM public.products WHERE id = $1 LIMIT 1`,
          [id]
        );
        return { single: res.rows[0] ?? null };
      }

      if (category && category !== 'all') {
        const res = includeInactive
          ? await client.query(
              `SELECT * FROM public.products WHERE category_id = $1 ORDER BY created_at DESC`,
              [category]
            )
          : await client.query(
              `SELECT * FROM public.products WHERE category_id = $1 AND is_active = TRUE ORDER BY created_at DESC`,
              [category]
            );
        return { products: res.rows };
      }

      const res = includeInactive
        ? await client.query(`SELECT * FROM public.products ORDER BY created_at DESC`)
        : await client.query(
            `SELECT * FROM public.products WHERE is_active = TRUE ORDER BY created_at DESC`
          );
      return { products: res.rows };
    });

    if ('single' in data) {
      if (!data.single) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ product: data.single });
    }

    return NextResponse.json({ products: data.products });
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;

    const body = await request.json().catch(() => ({}));
    const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';

    if (!rawTitle) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    const category = typeof body.category === 'string' && body.category.trim() ? body.category.trim() : 'vpn';
    const brand = typeof body.brand === 'string' && body.brand.trim() ? body.brand.trim() : 'Fibez';
    const region = typeof body.region === 'string' && body.region.trim() ? body.region.trim() : 'Global';
    const description =
      typeof body.description === 'string' && body.description.trim()
        ? body.description.trim()
        : `${rawTitle} — instant email delivery.`;
    const priceLKR = Math.max(0, Math.round(Number(body.priceLKR) || 0));
    const priceUSD = Math.max(0, Number(body.priceUSD) || 0);
    const stockCount = Math.max(0, Math.round(Number(body.stockCount) || 0));
    const badge = typeof body.badge === 'string' && body.badge.trim() ? body.badge.trim() : null;
    const guideMarkdown =
      typeof body.guideMarkdown === 'string' && body.guideMarkdown.trim()
        ? body.guideMarkdown.trim()
        : 'Delivery details sent automatically to your email and Key Vault.';
    const warranty =
      typeof body.warranty === 'string' && body.warranty.trim()
        ? body.warranty.trim()
        : 'Full term replacement warranty included.';

    const slugBase = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;

    const durations = [{ label: 'Standard / 1 Month', days: 30, multiplier: 1 }];

    const product = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const res = await client.query(
        `INSERT INTO public.products (
           id, category_id, brand, region, title, slug, description,
           price_usd, price_lkr, stock_count, badge, is_instant,
           durations, options, guide_markdown, warranty_terms, is_featured, is_active
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           $8, $9, $10, $11, TRUE,
           $12::jsonb, '[]'::jsonb, $13, $14, FALSE, TRUE
         )
         RETURNING *`,
        [
          id,
          category,
          brand,
          region,
          rawTitle,
          id,
          description,
          priceUSD,
          priceLKR,
          stockCount,
          badge,
          JSON.stringify(durations),
          guideMarkdown,
          warranty,
        ]
      );

      await client.query(
        `INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, 'PRODUCT_CREATED', 'PRODUCT', $4, $5::jsonb)`,
        [
          `audit_prod_${crypto.randomUUID()}`,
          actor.id,
          actor.email,
          id,
          JSON.stringify({ title: rawTitle, category, priceLKR, priceUSD }),
        ]
      );

      return res.rows[0];
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireRole(['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;

    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id.trim() : '';

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const title = typeof body.title === 'string' ? body.title.trim() : null;
    const priceUSD = body.priceUSD !== undefined ? Math.max(0, Number(body.priceUSD)) : null;
    const priceLKR =
      body.priceLKR !== undefined ? Math.max(0, Math.round(Number(body.priceLKR))) : null;
    const stockCount =
      body.stockCount !== undefined ? Math.max(0, Math.round(Number(body.stockCount))) : null;
    const isActive = typeof body.isActive === 'boolean' ? body.isActive : null;

    const product = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const res = await client.query(
        `UPDATE public.products
         SET
           title = COALESCE($1, title),
           price_usd = COALESCE($2, price_usd),
           price_lkr = COALESCE($3, price_lkr),
           stock_count = COALESCE($4, stock_count),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [title, priceUSD, priceLKR, stockCount, isActive, id]
      );

      if (res.rows.length === 0) {
        return null;
      }

      await client.query(
        `INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, 'PRODUCT_UPDATED', 'PRODUCT', $4, $5::jsonb)`,
        [
          `audit_prod_${crypto.randomUUID()}`,
          actor.id,
          actor.email,
          id,
          JSON.stringify({ title, priceUSD, priceLKR, stockCount, isActive }),
        ]
      );

      return res.rows[0];
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, product });
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireRole(['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim() || '';

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const deleted = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const res = await client.query(
        `DELETE FROM public.products WHERE id = $1 RETURNING id`,
        [id]
      );
      if (res.rows.length > 0) {
        await client.query(
          `INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details)
           VALUES ($1, $2, $3, 'PRODUCT_DELETED', 'PRODUCT', $4, '{}'::jsonb)`,
          [`audit_prod_${crypto.randomUUID()}`, actor.id, actor.email, id]
        );
      }
      return res.rows.length > 0;
    });

    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
