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

    if (id) {
      const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ product: rows[0] });
    }

    if (category && category !== 'all') {
      const rows = await sql`
        SELECT * FROM products 
        WHERE category_id = ${category} AND is_active = TRUE 
        ORDER BY created_at DESC
      `;
      return NextResponse.json({ products: rows });
    }

    const rows = await sql`
      SELECT * FROM products 
      WHERE is_active = TRUE 
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ products: rows });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { id, priceUSD, priceLKR, stockCount, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await sql`
      UPDATE products 
      SET 
        price_usd = COALESCE(${priceUSD}, price_usd),
        price_lkr = COALESCE(${priceLKR}, price_lkr),
        stock_count = COALESCE(${stockCount}, stock_count),
        is_active = COALESCE(${isActive}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}
