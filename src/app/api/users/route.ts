import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const users = await sql`
      SELECT 
        u.id::text AS id,
        u.name,
        u.email,
        u.role,
        u."createdAt" AS created_at,
        COALESCE(SUM(CASE WHEN o.payment_status = 'VERIFIED' THEN o.total_amount_lkr ELSE 0 END), 0) AS total_spend_lkr
      FROM neon_auth."user" u
      LEFT JOIN orders o ON LOWER(o.customer_email) = LOWER(u.email)
      GROUP BY u.id, u.name, u.email, u.role, u."createdAt"
      ORDER BY u."createdAt" DESC
    `;

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !['user', 'admin', 'owner'].includes(role)) {
      return NextResponse.json({ error: 'Valid userId and role are required' }, { status: 400 });
    }

    await sql`
      UPDATE neon_auth."user"
      SET role = ${role}, "updatedAt" = NOW()
      WHERE id::text = ${userId}
    `;

    return NextResponse.json({ success: true, userId, role });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}
