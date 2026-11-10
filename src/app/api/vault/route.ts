import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const orderNumber = searchParams.get('order_number');

    let itemsQuery;

    if (orderNumber) {
      itemsQuery = await sql`
        SELECT 
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
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.order_number = ${orderNumber}
        ORDER BY oi.created_at DESC
      `;
    } else if (email) {
      itemsQuery = await sql`
        SELECT 
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
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.customer_email = ${email}
        ORDER BY oi.created_at DESC
      `;
    } else {
      // Require either an authenticated email or specific order number
      return NextResponse.json({ assets: [] });
    }

    const assets = itemsQuery.map((item: any) => ({
      id: item.id,
      orderNumber: item.order_number,
      productName: item.product_name,
      category: item.category || 'vpn',
      initialDays: 30,
      initialHours: 12,
      type: item.type === 'CONNECTION_CONFIG' ? 'VLESS URI' : item.type === 'ACCOUNT_CREDENTIALS' ? 'Credentials' : 'Serial Key',
      payload: item.payload || '',
      username: item.username,
      password: item.password,
      status: item.status === 'DELIVERED' ? 'ACTIVE' : item.status,
      guideMarkdown: item.guide_markdown,
      warranty: item.warranty,
    }));

    return NextResponse.json({ assets });
  } catch (error: any) {
    console.error('Error fetching vault assets:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch vault assets' }, { status: 500 });
  }
}
