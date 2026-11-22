import crypto from 'crypto';
import { after } from 'next/server';
import { sql } from '@/lib/db';
import { esc, siteUrl, tgCall, type TgResult } from '@/lib/telegram';

/**
 * Admin Telegram bot (@FibezAdminbot): the owner's control room. Separate bot, separate token.
 * Env: TELEGRAM_ADMIN_BOT_TOKEN, TELEGRAM_ADMIN_BOT_USERNAME, TELEGRAM_ADMIN_IDS (comma-separated Telegram
 * user ids), TELEGRAM_ADMIN_WEBHOOK_SECRET. Only the listed ids are ever answered; everyone else is ignored.
 */
const adminToken = () => process.env.TELEGRAM_ADMIN_BOT_TOKEN || '';
export const adminBotUsername = () => (process.env.TELEGRAM_ADMIN_BOT_USERNAME || '').replace(/^@/, '');
export const adminConfigured = () => Boolean(adminToken() && sql);

export function adminIds(): number[] {
  return (process.env.TELEGRAM_ADMIN_IDS || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}
export const isAdminId = (id: unknown) => typeof id === 'number' && adminIds().includes(id);

export const adminCall = (method: string, body: Record<string, unknown>): Promise<TgResult> =>
  tgCall(method, body, adminToken());

export type AdminButton = { text: string; url?: string; callback_data?: string };

const markup = (rows: AdminButton[][]) =>
  rows.length ? { reply_markup: { inline_keyboard: rows } } : {};

export function adminSend(chatId: number | string, html: string, rows: AdminButton[][] = []) {
  return adminCall('sendMessage', {
    chat_id: chatId,
    text: html.slice(0, 4000),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...markup(rows),
  });
}

export function adminEdit(chatId: number | string, messageId: number, html: string, rows: AdminButton[][] = []) {
  return adminCall('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: html.slice(0, 4000),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...markup(rows),
  });
}

export const adminAnswer = (callbackId: string, text?: string, alert = false) =>
  adminCall('answerCallbackQuery', { callback_query_id: callbackId, text: text?.slice(0, 190), show_alert: alert });

/** Sends to every admin chat. Never throws. */
export async function notifyAdminsNow(html: string, rows: AdminButton[][] = []): Promise<void> {
  if (!adminConfigured()) return;
  await Promise.all(adminIds().map((id) => adminSend(id, html, rows).catch(() => null)));
}

/** After the response is sent, so a slow Telegram call never delays an order or a ticket. */
export function notifyAdmins(html: string, rows: AdminButton[][] = []) {
  if (!adminConfigured()) return;
  const job = () => notifyAdminsNow(html, rows);
  try {
    after(job);
  } catch {
    void job();
  }
}

export function verifyAdminSecret(header: string | null): boolean {
  const want = process.env.TELEGRAM_ADMIN_WEBHOOK_SECRET || '';
  if (want.length < 16 || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Admin alert texts, built in one place so the routes stay small. */
export const adminAlerts = {
  newOrder(o: { orderNumber: string; customerEmail: string; totalAmountLKR: number; paymentMethod: string; paymentStatus: string; hasSlip: boolean; items: { productTitle: string; variantTitle?: string; quantity: number }[] }) {
    const lines = o.items
      .slice(0, 4)
      .map((i) => `• ${esc(i.productTitle)}${i.variantTitle ? ` (${esc(i.variantTitle)})` : ''} x${i.quantity}`)
      .join('\n');
    const waiting = o.hasSlip ? '📎 Slip attached, ready to review' : o.paymentStatus === 'PENDING_PAYMENT' ? '⏳ Waiting for payment' : '🔎 Needs review';
    const rows: AdminButton[][] = [];
    if (o.hasSlip || o.paymentStatus === 'PENDING_REVIEW') {
      rows.push([
        { text: '✅ Approve', callback_data: `o:a:${o.orderNumber}` },
        { text: '❌ Reject', callback_data: `o:r:${o.orderNumber}` },
      ]);
    }
    rows.push([{ text: 'Open in admin', url: `${siteUrl()}/admin` }]);
    return {
      html: `🧾 <b>New order ${esc(o.orderNumber)}</b>\n${esc(o.customerEmail)}\nRs. ${o.totalAmountLKR.toLocaleString()} · ${esc(o.paymentMethod)}\n${lines}\n\n${waiting}`,
      rows,
    };
  },
  newTopup(t: { id: string; email: string; amount: number; reference: string }) {
    return {
      html: `💰 <b>Wallet top-up request</b>\n${esc(t.email)}\nRs. ${t.amount.toLocaleString()} · ref ${esc(t.reference)}\n\nCheck the slip in the admin console, then approve here.`,
      rows: [
        [
          { text: '✅ Approve', callback_data: `t:a:${t.id}` },
          { text: '❌ Reject', callback_data: `t:r:${t.id}` },
        ],
        [{ text: 'See slip in admin', url: `${siteUrl()}/admin` }],
      ] as AdminButton[][],
    };
  },
  newRefund(r: { email: string; orderNumber: string; amount: number; reason: string }) {
    return {
      html: `↩️ <b>Refund request</b>\n${esc(r.email)} · ${esc(r.orderNumber)}\nRs. ${r.amount.toLocaleString()} · ${esc(r.reason)}\n\nRefunds are reviewed in the admin console.`,
      rows: [[{ text: 'Review refund', url: `${siteUrl()}/admin` }]] as AdminButton[][],
    };
  },
  newTicket(t: { ticketNumber: string; email: string; subject: string; preview: string; reply?: boolean }) {
    return {
      html: `${t.reply ? '💬 <b>Customer replied</b>' : '🎫 <b>New ticket</b>'} ${esc(t.ticketNumber)}\n${esc(t.email)}\n<b>${esc(t.subject)}</b>\n\n${esc(t.preview.slice(0, 300))}`,
      rows: [[{ text: 'Open tickets', url: `${siteUrl()}/tickets` }]] as AdminButton[][],
    };
  },
};
