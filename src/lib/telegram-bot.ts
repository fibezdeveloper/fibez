import { sql } from '@/lib/db';
import { xui } from '@/lib/xui';
import { getPanelClientsByUser } from '@/lib/wallet';
import { getResolvedPackages, toPublicPackage } from '@/lib/package-list';
import { V2RAY_PLAN_TIERS } from '@/lib/v2ray-catalog';
import { rateLimit } from '@/lib/rate-limit';
import {
  consumeLinkToken,
  esc,
  getLinkByChat,
  linkChat,
  notifyEmail,
  sendMessage,
  setNotify,
  siteUrl,
  type TgButton,
} from '@/lib/telegram';

const GB = 1024 * 1024 * 1024;
const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' });

const btn = (text: string, path: string): TgButton => ({ text, url: `${siteUrl()}${path}` });

const HELP = [
  '<b>Fibez V2Ray bot</b>',
  '',
  '/plans: packages and prices',
  '/myline: your lines, usage and expiry',
  '/trial: claim the free 24-hour trial',
  '/support: open a support ticket',
  '/stop: pause notifications (/resume turns them back on)',
  '/unlink: disconnect this chat from your account',
  '',
  'To get order alerts, open your dashboard on fibez.store and tap <b>Connect Telegram</b>.',
].join('\n');

// ------------------------------------------------------------------ commands

async function cmdPlans(chatId: number) {
  const pkgs = (await getResolvedPackages()).map(toPublicPackage).filter((p) => p.isActive);
  const from = V2RAY_PLAN_TIERS[0].monthlyPriceLKR;
  const byIsp = new Map<string, typeof pkgs>();
  for (const p of pkgs) byIsp.set(p.isp, [...(byIsp.get(p.isp) ?? []), p]);

  await sendMessage(
    chatId,
    `<b>Fibez V2Ray plans</b>\nFrom Rs. ${from} / month. Pick your data pack and duration on the site.`,
    [btn('Choose a plan', '/v2ray')]
  );
  for (const [isp, list] of byIsp) {
    const lines = list.map(
      (p) => `• <b>${esc(p.title)}</b>\n  ${esc(p.targetMedium)}${p.reloadCode ? `\n  Activate: ${esc(p.reloadCode)}` : ''}`
    );
    await sendMessage(chatId, `<b>${esc(isp)}</b>\n\n${lines.join('\n\n')}`);
  }
}

async function myLines(email: string): Promise<string> {
  const clients = (await getPanelClientsByUser(email)).filter((c) => c.status === 'ACTIVE');
  if (clients.length === 0) return 'You have no active lines yet. Send /trial for a free 24-hour test or /plans to see packages.';
  const plans = await xui.listClientPlans().catch(() => null);
  const out: string[] = [];
  for (const c of clients.slice(0, 10)) {
    const plan = plans?.get(c.uuid.toLowerCase());
    if (!plan) {
      out.push(`<b>${esc(c.order_number)}</b>\nNot found on the server right now. Contact support if this is unexpected.`);
      continue;
    }
    const used = (plan.up + plan.down) / GB;
    const quota = plan.totalBytes > 0 ? `${used.toFixed(1)} / ${(plan.totalBytes / GB).toFixed(0)} GB` : `${used.toFixed(1)} GB (unlimited)`;
    const expired = !plan.enable || (plan.expiryMs > 0 && plan.expiryMs < Date.now());
    const expiry = plan.expiryMs > 0 ? fmtDate(plan.expiryMs) : 'no expiry';
    out.push(`<b>${esc(c.order_number)}</b> ${expired ? '🔴 expired' : '🟢 active'}\nData: ${quota}\nExpires: ${expiry}`);
  }
  return out.join('\n\n');
}

export async function handleTelegramUpdate(update: any): Promise<void> {
  const msg = update?.message;
  // Private chats only: nothing in a group should ever be able to talk to a customer's account.
  if (!msg || msg.chat?.type !== 'private' || typeof msg.text !== 'string') return;
  const chatId: number = msg.chat.id;
  const [rawCmd, ...args] = msg.text.trim().split(/\s+/);
  const cmd = rawCmd.toLowerCase().replace(/@\w+$/, '');

  if ((await rateLimit('tg-chat', String(chatId), 40, 300)).limited) return;

  if (cmd === '/start') {
    const code = args[0];
    if (code) {
      const grant = await consumeLinkToken(code);
      if (!grant) {
        await sendMessage(chatId, 'That link has expired or was already used. Open your Fibez dashboard and tap <b>Connect Telegram</b> again.', [
          btn('Open dashboard', '/dashboard'),
        ]);
        return;
      }
      await linkChat({ userId: grant.user_id, email: grant.user_email, chatId, username: msg.from?.username });
      await sendMessage(
        chatId,
        `✅ <b>Connected.</b> This chat is now linked to <code>${esc(grant.user_email)}</code>.\n\nYou will get order deliveries, free-trial configs, ticket replies and expiry reminders here.\n\nSend /myline to see your lines or /help for all commands.`
      );
      return;
    }
    await sendMessage(chatId, `Welcome to Fibez 👋\n\n${HELP}`, [btn('Open Fibez', '/v2ray')]);
    return;
  }

  if (cmd === '/help') return void (await sendMessage(chatId, HELP));
  if (cmd === '/plans') return void (await cmdPlans(chatId));
  if (cmd === '/trial') {
    return void (await sendMessage(chatId, 'Claim your free 24-hour trial on the site (needs a Google-verified email).', [btn('Get free trial', '/v2ray?openTrial=true')]));
  }
  if (cmd === '/support') {
    return void (await sendMessage(chatId, 'Open or follow a support ticket here:', [btn('Support tickets', '/tickets')]));
  }

  // Everything below needs a linked account.
  const link = await getLinkByChat(chatId);
  if (!link) {
    await sendMessage(chatId, 'This chat is not connected to a Fibez account yet. Open your dashboard and tap <b>Connect Telegram</b>.', [
      btn('Open dashboard', '/dashboard'),
    ]);
    return;
  }

  if (cmd === '/myline' || cmd === '/lines') {
    await sendMessage(chatId, await myLines(link.user_email), [btn('Manage lines', '/v2ray/dashboard')]);
  } else if (cmd === '/stop') {
    await setNotify(link.user_id, false);
    await sendMessage(chatId, 'Notifications paused. Send /resume to turn them back on.');
  } else if (cmd === '/resume') {
    await setNotify(link.user_id, true);
    await sendMessage(chatId, 'Notifications are on again.');
  } else if (cmd === '/unlink') {
    if (sql) await sql.query('DELETE FROM public.telegram_links WHERE user_id = $1', [link.user_id]);
    await sendMessage(chatId, 'Disconnected. You can connect again any time from your dashboard.');
  } else {
    await sendMessage(chatId, HELP);
  }
}

// ------------------------------------------------------------------ notifications (called from the API routes)

export const tgMessages = {
  delivered(orderNumber: string, configs: { title: string; key: string }[]) {
    const shown = configs.slice(0, 3);
    const body = shown
      .map((c) => `<b>${esc(c.title)}</b>\n<code>${esc(c.key.split('\n')[0])}</code>`)
      .join('\n\n');
    const more = configs.length > shown.length ? `\n\n+ ${configs.length - shown.length} more in your Key Vault.` : '';
    return {
      html: `✅ <b>Order ${esc(orderNumber)} is ready</b>\n\n${body}${more}\n\nTap a config to copy it, then import it into NetMod or v2rayNG.`,
      buttons: [btn('Open Key Vault', '/dashboard'), btn('Setup guide', '/v2ray/guide')],
    };
  },
  trial(title: string, key: string, expiresAt: string) {
    return {
      html: `🎁 <b>Your free trial is ready</b>\n\n<b>${esc(title)}</b>\n<code>${esc(key)}</code>\n\nValid for 24 hours (until ${esc(fmtDate(new Date(expiresAt).getTime()))}). Tap the config to copy it.`,
      buttons: [btn('Setup guide', '/v2ray/guide')],
    };
  },
  ticketReply(ticketNumber: string, subject: string, preview: string) {
    return {
      html: `💬 <b>New reply on ${esc(ticketNumber)}</b>\n${esc(subject)}\n\n${esc(preview.slice(0, 280))}${preview.length > 280 ? '…' : ''}`,
      buttons: [btn('Open ticket', '/tickets')],
    };
  },
  orderRejected(orderNumber: string, note?: string) {
    return {
      html: `❌ <b>Order ${esc(orderNumber)} was not approved</b>${note ? `\n\n${esc(note.slice(0, 300))}` : ''}\n\nOpen a ticket if you think this is a mistake.`,
      buttons: [btn('Support tickets', '/tickets')],
    };
  },
  money(title: string, detail: string) {
    return { html: `💳 <b>${esc(title)}</b>\n${esc(detail)}`, buttons: [btn('My wallet', '/billing')] };
  },
};

// ------------------------------------------------------------------ reminders (daily cron)

async function claimReminder(key: string): Promise<boolean> {
  if (!sql) return false;
  const rows = (await sql.query(
    'INSERT INTO public.telegram_reminders (key) VALUES ($1) ON CONFLICT (key) DO NOTHING RETURNING key',
    [key]
  )) as any[];
  return rows.length > 0;
}

/** Expiry (3 days, 1 day) and data usage (80%, 100%) reminders. Each is sent once per line and expiry. */
export async function runTelegramReminders(): Promise<{ checked: number; sent: number }> {
  if (!sql) return { checked: 0, sent: 0 };
  const links = (await sql.query('SELECT * FROM public.telegram_links WHERE notify = TRUE')) as any[];
  if (links.length === 0) return { checked: 0, sent: 0 };
  const plans = await xui.listClientPlans();
  let checked = 0;
  let sent = 0;

  for (const link of links) {
    const clients = (await getPanelClientsByUser(link.user_email)).filter((c) => c.status === 'ACTIVE');
    for (const c of clients) {
      const plan = plans.get(c.uuid.toLowerCase());
      if (!plan || !plan.enable) continue;
      checked++;
      const stamp = `${c.uuid.toLowerCase()}:${plan.expiryMs}`;
      const label = esc(c.order_number);

      let text: string | null = null;
      let key = '';
      if (plan.expiryMs > Date.now()) {
        const days = Math.ceil((plan.expiryMs - Date.now()) / 86400000);
        if (days <= 1) {
          key = `exp1:${stamp}`;
          text = `⏰ <b>Line ${label} expires within a day</b> (${esc(fmtDate(plan.expiryMs))}). Renew now to avoid a break.`;
        } else if (days <= 3) {
          key = `exp3:${stamp}`;
          text = `⏰ <b>Line ${label} expires in ${days} days</b> (${esc(fmtDate(plan.expiryMs))}).`;
        }
      }
      if (!text && plan.totalBytes > 0) {
        const pct = (plan.up + plan.down) / plan.totalBytes;
        if (pct >= 1) {
          key = `use100:${stamp}`;
          text = `📉 <b>Line ${label} has used all its data.</b> Renew or top up to keep connecting.`;
        } else if (pct >= 0.8) {
          key = `use80:${stamp}`;
          text = `📊 <b>Line ${label} has used ${Math.floor(pct * 100)}% of its data.</b>`;
        }
      }
      if (text && (await claimReminder(key))) {
        const ok = await notifyEmail(link.user_email, text, [btn('Manage line', '/v2ray/dashboard')]);
        if (ok) sent++;
      }
    }
  }
  if (sql) await sql.query(`DELETE FROM public.telegram_reminders WHERE sent_at < now() - interval '120 days'`);
  return { checked, sent };
}
