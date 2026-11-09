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
    const role = searchParams.get('role');

    let orderRows;

    if (orderNumber) {
      orderRows = await sql`SELECT * FROM orders WHERE order_number = ${orderNumber} LIMIT 1`;
    } else if (email) {
      orderRows = await sql`SELECT * FROM orders WHERE customer_email = ${email} ORDER BY created_at DESC`;
    } else if (role === 'admin' || role === 'owner') {
      orderRows = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`;
    } else {
      orderRows = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 20`;
    }

    const dbSql = sql;
    if (!dbSql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Attach items to each order
    const ordersWithItems = await Promise.all(
      orderRows.map(async (o: any) => {
        const items = await dbSql`SELECT * FROM order_items WHERE order_id = ${o.id}`;
        return { ...o, items };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { orderId, paymentStatus, fulfillmentStatus, reviewNotes, reviewedBy } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await sql`
      UPDATE orders
      SET 
        payment_status = COALESCE(${paymentStatus}, payment_status),
        fulfillment_status = COALESCE(${fulfillmentStatus}, fulfillment_status),
        review_notes = COALESCE(${reviewNotes}, review_notes),
        reviewed_by = COALESCE(${reviewedBy}, reviewed_by),
        updated_at = NOW()
      WHERE id = ${orderId} OR order_number = ${orderId}
    `;

    // Audit log
    await sql`
      INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
      VALUES (
        ${`audit_${orderId}_${Date.now()}`}, 'admin@fibez.io', 'ORDER_STATUS_UPDATED', 'ORDER', ${orderId},
        ${JSON.stringify({ paymentStatus, fulfillmentStatus, reviewNotes })}::jsonb
      )
    `;

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
