import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/dal';
import { rateLimit } from '@/lib/rate-limit';
import {
  botUsername,
  createLinkToken,
  getLinkByUser,
  setNotify,
  telegramConfigured,
  unlinkUser,
} from '@/lib/telegram';

// The signed-in customer manages their own Telegram connection. Nothing here touches anyone else's.

export async function GET() {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!telegramConfigured()) return NextResponse.json({ configured: false, linked: false });
  const link = await getLinkByUser(auth.user.id);
  return NextResponse.json({
    configured: true,
    bot: botUsername(),
    linked: Boolean(link),
    username: link?.tg_username ?? null,
    notify: link?.notify ?? false,
  });
}

/** Start linking: returns the t.me deep link that carries a one-time code. */
export async function POST() {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!telegramConfigured()) return NextResponse.json({ error: 'Telegram is not available right now' }, { status: 503 });
  if ((await rateLimit('tg-link', auth.user.id, 8, 600)).limited) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }
  const code = await createLinkToken({ id: auth.user.id, email: auth.user.email });
  return NextResponse.json({ url: `https://t.me/${botUsername()}?start=${code}`, expiresInMinutes: 15 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!telegramConfigured()) return NextResponse.json({ error: 'Telegram is not available right now' }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.notify !== 'boolean') return NextResponse.json({ error: 'notify must be true or false' }, { status: 400 });
  await setNotify(auth.user.id, body.notify);
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!telegramConfigured()) return NextResponse.json({ error: 'Telegram is not available right now' }, { status: 503 });
  await unlinkUser(auth.user.id);
  return NextResponse.json({ success: true });
}
