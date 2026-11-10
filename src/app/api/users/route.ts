import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminSql, buildRlsContext, requireRole } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

export async function GET() {
  try {
    const authResult = await requireRole(['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }

    if (!adminSql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const users = await adminSql`
      SELECT
        u.id::text AS id,
        u.name,
        u.email,
        COALESCE(u.role, 'user') AS role,
        u."createdAt" AS created_at,
        COALESCE(SUM(CASE WHEN o.payment_status = 'VERIFIED' THEN o.total_amount_lkr ELSE 0 END), 0) AS total_spend_lkr
      FROM neon_auth."user" u
      LEFT JOIN orders o ON LOWER(o.customer_email) = LOWER(u.email) OR o.user_id = u.id::text
      GROUP BY u.id, u.name, u.email, u.role, u."createdAt"
      ORDER BY u."createdAt" DESC
    `;

    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireRole(['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;

    if (!adminSql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    const role = typeof body.role === 'string' ? body.role.trim() : '';

    if (!userId || !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid userId and target role ("user" or "admin") are required' },
        { status: 400 }
      );
    }

    if (userId === actor.id) {
      return NextResponse.json(
        { error: 'Owners cannot modify their own role via the dashboard' },
        { status: 400 }
      );
    }

    const existing = await adminSql`
      SELECT id::text AS id, email, COALESCE(role, 'user') AS role
      FROM neon_auth."user"
      WHERE id::text = ${userId}
      LIMIT 1
    `;

    if (existing.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existing[0].role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot alter an existing owner account role' },
        { status: 403 }
      );
    }

    await adminSql`
      UPDATE neon_auth."user"
      SET role = ${role}, "updatedAt" = NOW()
      WHERE id::text = ${userId}
    `;

    await withRlsTransaction(buildRlsContext(actor), async (client) => {
      await client.query(
        `INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, 'ROLE_CHANGED', 'USER', $4, $5::jsonb)`,
        [
          `audit_role_${crypto.randomUUID()}`,
          actor.id,
          actor.email,
          userId,
          JSON.stringify({
            targetEmail: existing[0].email,
            previousRole: existing[0].role,
            newRole: role,
          }),
        ]
      );
    });

    return NextResponse.json({ success: true, userId, role });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
