import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const id = searchParams.get('id');
    const includeInactive = searchParams.get('all') === 'true';

    if (id) {
      const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ product: rows[0] });
    }

    if (category && category !== 'all') {
      const rows = includeInactive
        ? await sql`SELECT * FROM products WHERE category_id = ${category} ORDER BY created_at DESC`
        : await sql`SELECT * FROM products WHERE category_id = ${category} AND is_active = TRUE ORDER BY created_at DESC`;
      return NextResponse.json({ products: rows });
    }

    const rows = includeInactive
      ? await sql`SELECT * FROM products ORDER BY created_at DESC`
      : await sql`SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC`;
    return NextResponse.json({ products: rows });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const {
      title,
      category = 'vpn',
      brand = 'Fibez',
      region = 'Global',
      description = '',
      priceLKR = 0,
      priceUSD = 0,
      stockCount = 10,
      badge,
      guideMarkdown = '',
      warranty = 'Full term replacement warranty included.',
    } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    const slugBase = String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = `${slugBase}-${Date.now().toString(36)}`;

    const durations = [
      { label: 'Standard / 1 Month', days: 30, multiplier: 1 },
    ];

    const rows = await sql`
      INSERT INTO products (
        id, category_id, brand, region, title, slug, description,
        price_usd, price_lkr, stock_count, badge, is_instant,
        durations, options, guide_markdown, warranty_terms, is_featured, is_active
      ) VALUES (
        ${id}, ${category}, ${brand}, ${region}, ${String(title).trim()}, ${id},
        ${String(description).trim() || `${String(title).trim()} — instant email delivery.`},
        ${Number(priceUSD)}, ${Math.round(Number(priceLKR))}, ${Math.max(0, Math.round(Number(stockCount)))},
        ${badge || null}, TRUE, ${JSON.stringify(durations)}::jsonb, '[]'::jsonb,
        ${guideMarkdown || 'Delivery details sent automatically to your email and Key Vault.'},
        ${warranty}, FALSE, TRUE
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, product: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { id, priceUSD, priceLKR, stockCount, isActive, title } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE products
      SET
        title = COALESCE(${title ?? null}, title),
        price_usd = COALESCE(${priceUSD !== undefined ? Number(priceUSD) : null}, price_usd),
        price_lkr = COALESCE(${priceLKR !== undefined ? Math.round(Number(priceLKR)) : null}, price_lkr),
        stock_count = COALESCE(${stockCount !== undefined ? Math.max(0, Math.round(Number(stockCount))) : null}, stock_count),
        is_active = COALESCE(${isActive ?? null}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, product: rows[0] });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await sql`DELETE FROM products WHERE id = ${id}`;
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
