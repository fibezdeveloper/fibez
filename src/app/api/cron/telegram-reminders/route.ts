import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { telegramConfigured } from '@/lib/telegram';
import { runTelegramReminders } from '@/lib/telegram-bot';
import { adminConfigured } from '@/lib/telegram-admin';
import { sendAdminDigest } from '@/lib/telegram-admin-bot';

/**
 * Daily expiry and data-usage reminders for customers who linked Telegram (Vercel Cron, see vercel.json).
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
    // Morning summary for the owner, then customer reminders.
    if (adminConfigured()) await sendAdminDigest().catch((e) => console.warn('admin digest failed:', e));
    if (!telegramConfigured()) return NextResponse.json({ ok: true, skipped: 'customer bot not configured' });
    return NextResponse.json({ ok: true, ...(await runTelegramReminders()) });
  } catch (err) {
    console.error('telegram reminders failed:', err);
    return NextResponse.json({ error: 'Reminders failed' }, { status: 500 });
  }
}
