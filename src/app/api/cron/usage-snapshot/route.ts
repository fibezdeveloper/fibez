import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { xui } from '@/lib/xui';
import { recordSnapshots } from '@/lib/usage';
import { sql } from '@/lib/db';

/**
 * Daily usage snapshot for every V2Ray client (Vercel Cron, see vercel.json).
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; anything else is rejected.
 */
function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || '';
  if (secret.length < 16) return false;
  const given = req.headers.get('authorization') || '';
  const want = `Bearer ${secret}`;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const clients = await xui.listAllClientTraffic();
    const saved = await recordSnapshots(clients);
    // Keep four months of history.
    if (sql) await sql.query(`DELETE FROM public.usage_snapshots WHERE day < (now() AT TIME ZONE 'Asia/Colombo')::date - 120`);
    return NextResponse.json({ ok: true, clients: saved });
  } catch (err) {
    console.error('usage snapshot failed:', err);
    return NextResponse.json({ error: 'Snapshot failed' }, { status: 500 });
  }
}
