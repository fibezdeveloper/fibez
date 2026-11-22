import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dal';
import { botUsername, telegramConfigured, tgCall } from '@/lib/telegram';
import { adminBotUsername, adminCall, adminConfigured } from '@/lib/telegram-admin';

// Owner-only setup for both Telegram bots. Run once after deploying to a new domain.
//   POST { action: 'set_webhook', bot?: 'customer' | 'admin' | 'both' }  registers the webhooks + command menus
//   POST { action: 'status' }                                            shows what Telegram has on file
const CUSTOMER_COMMANDS = [
  { command: 'plans', description: 'Packages and prices' },
  { command: 'myline', description: 'My lines, usage and expiry' },
  { command: 'trial', description: 'Free 24-hour trial' },
  { command: 'support', description: 'Open a support ticket' },
  { command: 'help', description: 'All commands' },
  { command: 'stop', description: 'Pause notifications' },
  { command: 'unlink', description: 'Disconnect this chat' },
];

const ADMIN_COMMANDS = [
  { command: 'stats', description: 'Revenue, orders, wallets, panel' },
  { command: 'pending', description: 'Orders, top-ups, refunds waiting' },
  { command: 'order', description: 'Look up an order: /order FBZ-123456' },
  { command: 'client', description: 'A customer\'s lines: /client email' },
  { command: 'tickets', description: 'Open support tickets' },
  { command: 'flags', description: 'Switch site sections on or off' },
  { command: 'help', description: 'All commands' },
];

export async function POST(req: NextRequest) {
  const guard = await requireRole(['owner']);
  if ('response' in guard) return guard.response;
  const body = await req.json().catch(() => ({}));

  if (body.action === 'status') {
    const [c, a] = await Promise.all([
      telegramConfigured() ? tgCall('getWebhookInfo', {}) : null,
      adminConfigured() ? adminCall('getWebhookInfo', {}) : null,
    ]);
    const pick = (r: typeof c, bot: string) =>
      r ? { bot, webhook: r.result?.url || null, pending: r.result?.pending_update_count ?? 0, lastError: r.result?.last_error_message || null } : { bot: null };
    return NextResponse.json({ customer: pick(c, botUsername()), admin: pick(a, adminBotUsername()) });
  }

  if (body.action === 'set_webhook') {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    if (!host || /localhost|127\.0\.0\.1/.test(host)) {
      return NextResponse.json({ error: 'Telegram needs a public https domain. Run this from your live site.' }, { status: 400 });
    }
    const which: string = body.bot === 'customer' || body.bot === 'admin' ? body.bot : 'both';
    const result: Record<string, unknown> = {};

    if ((which === 'customer' || which === 'both') && telegramConfigured()) {
      const secret = process.env.TELEGRAM_WEBHOOK_SECRET || '';
      if (secret.length < 16) {
        result.customer = { ok: false, error: 'TELEGRAM_WEBHOOK_SECRET must be at least 16 characters.' };
      } else {
        const url = `https://${host}/api/telegram/webhook`;
        const hook = await tgCall('setWebhook', { url, secret_token: secret, allowed_updates: ['message'], drop_pending_updates: true, max_connections: 20 });
        await tgCall('setMyCommands', { commands: CUSTOMER_COMMANDS });
        await tgCall('setMyDescription', {
          description: 'Fibez V2Ray: get your order configs, free-trial link, ticket replies and expiry reminders here. Send /plans to see packages.',
        });
        await tgCall('setMyShortDescription', { short_description: 'Fibez V2Ray orders, trial and reminders' });
        result.customer = { ok: hook.ok, webhook: url, description: hook.description ?? null };
      }
    }

    if ((which === 'admin' || which === 'both') && adminConfigured()) {
      const secret = process.env.TELEGRAM_ADMIN_WEBHOOK_SECRET || '';
      if (secret.length < 16) {
        result.admin = { ok: false, error: 'TELEGRAM_ADMIN_WEBHOOK_SECRET must be at least 16 characters.' };
      } else {
        const url = `https://${host}/api/telegram/admin-webhook`;
        const hook = await adminCall('setWebhook', { url, secret_token: secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true, max_connections: 10 });
        await adminCall('setMyCommands', { commands: ADMIN_COMMANDS });
        await adminCall('setMyDescription', { description: 'Fibez owner control room: order and top-up alerts with approve buttons, daily stats and site controls. Private.' });
        await adminCall('setMyShortDescription', { short_description: 'Fibez owner control room' });
        result.admin = { ok: hook.ok, webhook: url, description: hook.description ?? null };
      }
    }

    if (Object.keys(result).length === 0) {
      return NextResponse.json({ error: 'No bot is configured. Set the TELEGRAM_* environment variables first.' }, { status: 503 });
    }
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
