import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dal';
import { sql } from '@/lib/db';
import { invalidateSiteConfigCache } from '@/lib/site-config';

// GET: current visibility of every shop product. POST: show/hide one, several, or all shop products.
// V2Ray products are controlled from the Packages tab, so "all" never touches the vpn category.
export async function GET() {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;
  if (!sql) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  const rows = (await sql.query(`SELECT id, is_active FROM public.products WHERE COALESCE(category_id,'') <> 'vpn'`)) as unknown as {
    id: string;
    is_active: boolean;
  }[];
  return NextResponse.json({ visibility: Object.fromEntries(rows.map((r) => [r.id, r.is_active !== false])) });
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;
  if (!sql) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  if (typeof body.isActive !== 'boolean') return NextResponse.json({ error: 'isActive (true/false) required' }, { status: 400 });
  const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === 'string').slice(0, 500) : [];
  const all = body.all === true;
  if (!all && ids.length === 0) return NextResponse.json({ error: 'Pick products or use all' }, { status: 400 });

  const rows = (all
    ? await sql.query(
        `UPDATE public.products SET is_active = $1, updated_at = NOW() WHERE COALESCE(category_id,'') <> 'vpn' RETURNING id`,
        [body.isActive]
      )
    : await sql.query(
        `UPDATE public.products SET is_active = $1, updated_at = NOW() WHERE id = ANY($2::text[]) AND COALESCE(category_id,'') <> 'vpn' RETURNING id`,
        [body.isActive, ids]
      )) as unknown as { id: string }[];

  await sql
    .query(
      `INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, 'PRODUCT_VISIBILITY', 'PRODUCT', $4, $5::jsonb)`,
      [
        `audit_vis_${crypto.randomUUID()}`,
        guard.user.id,
        guard.user.email,
        all ? 'ALL' : ids.join(',').slice(0, 200),
        JSON.stringify({ isActive: body.isActive, count: rows.length, all }),
      ]
    )
    .catch(() => {});
  invalidateSiteConfigCache();
  return NextResponse.json({ success: true, changed: rows.length, isActive: body.isActive });
}
