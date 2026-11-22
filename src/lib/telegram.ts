import crypto from 'crypto';
import { after } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Telegram customer bot: low-level API calls, account linking and notification delivery.
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, TELEGRAM_WEBHOOK_SECRET. If they are missing every
 * function here quietly does nothing, so the site works the same without the bot.
 */
const API = 'https://api.telegram.org';

const token = () => process.env.TELEGRAM_BOT_TOKEN || '';
export const botUsername = () => (process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fibez.store').replace(/\/$/, '');
export const telegramConfigured = () => Boolean(token() && botUsername() && sql);

export interface TgResult {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
}

/** Calls the Telegram Bot API. Uses the customer bot unless another bot's token is passed. */
export async function tgCall(method: string, body: Record<string, unknown>, tokenOverride?: string): Promise<TgResult> {
  const useToken = tokenOverride ?? token();
  if (!useToken) return { ok: false, description: 'Bot token not configured' };
  try {
    const res = await fetch(`${API}/bot${useToken}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    return (await res.json()) as TgResult;
  } catch (err) {
    return { ok: false, description: err instanceof Error ? err.message : 'Telegram request failed' };
  }
}

/** Escape text for Telegram's HTML parse mode. */
export const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export interface TgButton {
  text: string;
  url: string;
}

export async function sendMessage(chatId: number | string, html: string, buttons: TgButton[] = []): Promise<TgResult> {
  return tgCall('sendMessage', {
    chat_id: chatId,
    text: html.slice(0, 4000),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...(buttons.length ? { reply_markup: { inline_keyboard: buttons.map((b) => [{ text: b.text, url: b.url }]) } } : {}),
  });
}

// ------------------------------------------------------------------ links

export interface TgLink {
  user_id: string;
  user_email: string;
  chat_id: string; // BIGINT comes back as a string
  tg_username: string | null;
  notify: boolean;
  linked_at: string;
}

const q = async <T = any>(text: string, params: unknown[] = []): Promise<T[]> => {
  if (!sql) throw new Error('Database is not configured');
  return (await sql.query(text, params)) as unknown as T[];
};

const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/** One-time code for the t.me deep link. Only its hash is stored; it lives 15 minutes. */
export async function createLinkToken(user: { id: string; email: string }): Promise<string> {
  const raw = crypto.randomBytes(24).toString('base64url');
  await q('DELETE FROM public.telegram_link_tokens WHERE user_id = $1 OR expires_at < now()', [user.id]);
  await q(
    `INSERT INTO public.telegram_link_tokens (token_hash, user_id, user_email, expires_at)
     VALUES ($1, $2, $3, now() + interval '15 minutes')`,
    [sha(raw), user.id, user.email.toLowerCase()]
  );
  return raw;
}

/** Atomically spends a code: it works once, and only before it expires. */
export async function consumeLinkToken(raw: string): Promise<{ user_id: string; user_email: string } | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(raw)) return null;
  const rows = await q<{ user_id: string; user_email: string }>(
    `DELETE FROM public.telegram_link_tokens WHERE token_hash = $1 AND expires_at > now() RETURNING user_id, user_email`,
    [sha(raw)]
  );
  return rows[0] ?? null;
}

export async function linkChat(p: { userId: string; email: string; chatId: number; username?: string | null }) {
  // A chat belongs to one account and an account to one chat: a new link replaces any old one.
  await q('DELETE FROM public.telegram_links WHERE chat_id = $1 AND user_id <> $2', [p.chatId, p.userId]);
  await q(
    `INSERT INTO public.telegram_links (user_id, user_email, chat_id, tg_username, notify, linked_at)
     VALUES ($1, $2, $3, $4, TRUE, now())
     ON CONFLICT (user_id) DO UPDATE
       SET user_email = EXCLUDED.user_email, chat_id = EXCLUDED.chat_id,
           tg_username = EXCLUDED.tg_username, notify = TRUE, linked_at = now()`,
    [p.userId, p.email.toLowerCase(), p.chatId, p.username ?? null]
  );
}

export async function getLinkByUser(userId: string): Promise<TgLink | null> {
  return (await q<TgLink>('SELECT * FROM public.telegram_links WHERE user_id = $1', [userId]))[0] ?? null;
}

export async function getLinkByChat(chatId: number): Promise<TgLink | null> {
  return (await q<TgLink>('SELECT * FROM public.telegram_links WHERE chat_id = $1', [chatId]))[0] ?? null;
}

export async function getLinkByEmail(email: string): Promise<TgLink | null> {
  return (await q<TgLink>('SELECT * FROM public.telegram_links WHERE lower(user_email) = lower($1)', [email]))[0] ?? null;
}

export async function unlinkUser(userId: string) {
  await q('DELETE FROM public.telegram_links WHERE user_id = $1', [userId]);
  await q('DELETE FROM public.telegram_link_tokens WHERE user_id = $1', [userId]);
}

export async function setNotify(userId: string, on: boolean) {
  await q('UPDATE public.telegram_links SET notify = $2 WHERE user_id = $1', [userId, on]);
}

// ------------------------------------------------------------------ notifications

/** Sends to the account's linked chat. Never throws; a chat that blocked the bot is unlinked. */
export async function notifyEmail(email: string, html: string, buttons: TgButton[] = []): Promise<boolean> {
  if (!telegramConfigured() || !email) return false;
  try {
    const link = await getLinkByEmail(email);
    if (!link || !link.notify) return false;
    const r = await sendMessage(link.chat_id, html, buttons);
    if (!r.ok && (r.error_code === 403 || /chat not found|bot was blocked|user is deactivated/i.test(r.description || ''))) {
      await q('DELETE FROM public.telegram_links WHERE user_id = $1', [link.user_id]).catch(() => {});
    }
    return r.ok;
  } catch (err) {
    console.warn('Telegram notify failed:', err instanceof Error ? err.message : err);
    return false;
  }
}

/** Run after the response is sent, so a slow Telegram call never delays an order or a reply. */
export function notifyLater(email: string | null | undefined, html: string, buttons: TgButton[] = []) {
  if (!email || !telegramConfigured()) return;
  const job = () => notifyEmail(email, html, buttons).then(() => undefined);
  try {
    after(job);
  } catch {
    void job();
  }
}

/** Constant-time check of Telegram's X-Telegram-Bot-Api-Secret-Token header. */
export function verifyWebhookSecret(header: string | null): boolean {
  const want = process.env.TELEGRAM_WEBHOOK_SECRET || '';
  if (want.length < 16 || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
