import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { runPanelBackup } from '@/lib/panel-backup';

/**
 * Daily encrypted backup of the 3x-ui panel database to the admin Telegram chat (Vercel Cron, see vercel.json).
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; anything else is rejected.
 */
function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || '';
  if (secret.length < 16) return false;
  const a = Buffer.from(req.headers.get('authorization') || '');
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await runPanelBackup();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
