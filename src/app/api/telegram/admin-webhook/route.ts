import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSecret } from '@/lib/telegram-admin';
import { handleAdminUpdate } from '@/lib/telegram-admin-bot';

/**
 * Admin bot webhook. Requires Telegram's secret header, and the handler only answers Telegram user ids
 * on the TELEGRAM_ADMIN_IDS allow-list. Always 200 once authenticated so Telegram does not retry.
 */
export async function POST(req: NextRequest) {
  if (!verifyAdminSecret(req.headers.get('x-telegram-bot-api-secret-token'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await handleAdminUpdate(await req.json());
  } catch (err) {
    console.error('Admin bot update failed:', err instanceof Error ? err.message : err);
  }
  return NextResponse.json({ ok: true });
}
