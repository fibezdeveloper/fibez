import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const rows = productId
      ? await sql`SELECT * FROM inventory_items WHERE product_id = ${productId} ORDER BY created_at DESC LIMIT 100`
      : await sql`SELECT * FROM inventory_items WHERE status = 'AVAILABLE' ORDER BY created_at DESC LIMIT 100`;

    return NextResponse.json({ items: rows });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { productId, stockType = 'SERIAL_KEY', entries } = body;

    if (!productId || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'productId and entries array are required' }, { status: 400 });
    }

    let inserted = 0;
    for (const rawEntry of entries) {
      const entry = String(rawEntry).trim();
      if (!entry) continue;

      const invId = `inv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      let credUser: string | null = null;
      let credPass: string | null = null;

      if (stockType === 'ACCOUNT_CREDENTIALS' && entry.includes(':')) {
        const [u, ...rest] = entry.split(':');
        credUser = u.trim();
        credPass = rest.join(':').trim();
      }

      await sql`
        INSERT INTO inventory_items (
          id, product_id, stock_type, key_payload, credential_user, credential_pass, status
        ) VALUES (
          ${invId}, ${productId}, ${stockType}, ${entry}, ${credUser}, ${credPass}, 'AVAILABLE'
        )
      `;
      inserted++;
    }

    if (inserted > 0) {
      const countRes = await sql`
        SELECT COUNT(*)::int AS cnt FROM inventory_items WHERE product_id = ${productId} AND status = 'AVAILABLE'
      `;
      const avail = countRes[0]?.cnt ?? inserted;
      await sql`
        UPDATE products SET stock_count = GREATEST(stock_count, ${avail}), updated_at = NOW() WHERE id = ${productId}
      `;
    }

    return NextResponse.json({ success: true, inserted });
  } catch (error: any) {
    console.error('Error adding inventory:', error);
    return NextResponse.json({ error: error.message || 'Failed to add inventory' }, { status: 500 });
  }
}
