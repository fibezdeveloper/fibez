import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSecret } from '@/lib/telegram';
import { handleTelegramUpdate } from '@/lib/telegram-bot';

/**
 * Telegram webhook. Telegram sends the secret we registered in the X-Telegram-Bot-Api-Secret-Token
 * header; anything without it is rejected. Always answer 200 once authenticated so Telegram does not
 * keep retrying an update that failed on our side.
 */
export async function POST(req: NextRequest) {
  if (!verifyWebhookSecret(req.headers.get('x-telegram-bot-api-secret-token'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const update = await req.json();
    await handleTelegramUpdate(update);
  } catch (err) {
    console.error('Telegram update failed:', err instanceof Error ? err.message : err);
  }
  return NextResponse.json({ ok: true });
}
