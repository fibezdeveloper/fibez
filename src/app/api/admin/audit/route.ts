import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dal';
import { sql } from '@/lib/db';

/**
 * Admin -> Audit: the trail of who did what. Owner only, read only (rows can never be edited or deleted here).
 *   GET ?limit=100&q=<text>&action=<ACTION>
 */
const noStore = { 'Cache-Control': 'no-store' };

export async function GET(req: NextRequest) {
  const guard = await requireRole(['owner']);
  if ('response' in guard) return guard.response;
  if (!sql) return NextResponse.json({ error: 'Database not configured' }, { status: 503, headers: noStore });

  const url = new URL(req.url);
  const limit = Math.min(300, Math.max(1, Math.floor(Number(url.searchParams.get('limit')) || 100)));
  const q = (url.searchParams.get('q') || '').trim().slice(0, 80);
  const action = (url.searchParams.get('action') || '').trim().slice(0, 80);
  const like = q ? `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%` : '';

  try {
    const rows = await sql`
      SELECT id, user_email, action, entity_type, entity_id, details, ip_address, created_at
      FROM public.audit_logs
      WHERE (${action} = '' OR action = ${action})
        AND (${like} = '' OR user_email ILIKE ${like} OR entity_id ILIKE ${like} OR action ILIKE ${like} OR details::text ILIKE ${like})
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    const actions = await sql`SELECT DISTINCT action FROM public.audit_logs ORDER BY action LIMIT 100`;
    return NextResponse.json(
      { rows, actions: (actions as { action: string }[]).map((a) => a.action) },
      { headers: noStore }
    );
  } catch (err) {
    console.error('Audit fetch failed:', err);
    return NextResponse.json({ error: 'Could not load the audit log' }, { status: 500, headers: noStore });
  }
}
