import { auditLog } from '@/lib/audit';
import { sql } from '@/lib/db';
import { adminStore } from '@/lib/admin-store';
import { xui } from '@/lib/xui';
import {
  approveTopup,
  rejectTopup,
  listTopups,
  listRefunds,
  walletSummary,
  getPanelClientsByUser,
  getPanelClientsByOrder,
  type Staff,
} from '@/lib/wallet';
import { approveOrder, rejectOrder } from '@/lib/order-review';
import { getPageFlags, setPageFlags, PAGE_DEFS, type PageKey } from '@/lib/site-config';
import { notifyLater, esc, siteUrl } from '@/lib/telegram';
import { tgMessages } from '@/lib/telegram-bot';
import { rateLimit } from '@/lib/rate-limit';
import {
  adminAnswer,
  adminEdit,
  adminSend,
  isAdminId,
  notifyAdminsNow,
  type AdminButton,
} from '@/lib/telegram-admin';

const GB = 1024 * 1024 * 1024;
const COLOMBO = 'Asia/Colombo';
const day = (d: Date | string | number) => new Date(d).toLocaleDateString('en-CA', { timeZone: COLOMBO });
const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: COLOMBO });
const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;

const staffFor = (uid: number): Staff => ({ id: `telegram:${uid}`, email: `telegram:${uid}`, role: 'owner' });

const HELP = [
  '<b>Fibez admin bot</b>',
  '',
  '/stats: revenue, orders, wallets, panel',
  '/pending: orders, top-ups and refunds waiting for you',
  '/order FBZ-123456: one order',
  '/client email or order: a customer\'s lines and usage',
  '/tickets: open support tickets',
  '/flags: switch site sections on or off',
  '',
  'Approve and reject always ask you to confirm first.',
].join('\n');

// ------------------------------------------------------------------ read-only reports

export async function buildStats(): Promise<string> {
  const orders = await adminStore.getOrders();
  const today = day(Date.now());
  const weekAgo = Date.now() - 7 * 86400000;
  const paid = orders.filter((o) => o.paymentStatus === 'VERIFIED' && o.totalAmountLKR > 0 && o.paymentMethod !== 'staff_grant');
  const todayRev = paid.filter((o) => day(o.createdAt) === today).reduce((s, o) => s + o.totalAmountLKR, 0);
  const weekRev = paid.filter((o) => new Date(o.createdAt).getTime() > weekAgo).reduce((s, o) => s + o.totalAmountLKR, 0);
  const todayOrders = orders.filter((o) => day(o.createdAt) === today && !o.orderNumber.startsWith('FBZ-TRL-')).length;
  const slips = orders.filter((o) => o.paymentStatus === 'PENDING_REVIEW').length;

  let wallets = 'n/a';
  let topups = 0;
  let refunds = 0;
  try {
    const [w, t, r] = await Promise.all([walletSummary(), listTopups({ status: 'PENDING', limit: 100 }), listRefunds({ status: 'PENDING' })]);
    wallets = rs(w.totalBalanceLkr);
    topups = t.length;
    refunds = r.length;
  } catch {}

  let panel = 'unreachable';
  try {
    const plans = await xui.listClientPlans();
    let used = 0;
    for (const p of plans.values()) used += p.up + p.down;
    panel = `${plans.size} clients, ${(used / GB / 1024).toFixed(2)} TB used`;
  } catch {}

  return [
    '<b>Fibez today</b>',
    `Revenue today: <b>${rs(todayRev)}</b>`,
    `Revenue 7 days: ${rs(weekRev)}`,
    `Orders today: ${todayOrders}`,
    '',
    `Waiting: ${slips} slips · ${topups} top-ups · ${refunds} refunds`,
    `Money in wallets: ${wallets}`,
    `Panel: ${panel}`,
  ].join('\n');
}

async function cmdPending(chatId: number) {
  const orders = (await adminStore.getOrders()).filter((o) => o.paymentStatus === 'PENDING_REVIEW').slice(0, 8);
  let topups: Awaited<ReturnType<typeof listTopups>> = [];
  let refundCount = 0;
  try {
    topups = (await listTopups({ status: 'PENDING', limit: 8 })) as typeof topups;
    refundCount = (await listRefunds({ status: 'PENDING' })).length;
  } catch {}

  if (orders.length === 0 && topups.length === 0 && refundCount === 0) {
    await adminSend(chatId, '✅ Nothing is waiting for you.');
    return;
  }
  for (const o of orders) {
    const rows: AdminButton[][] = [
      [
        { text: '✅ Approve', callback_data: `o:a:${o.orderNumber}` },
        { text: '❌ Reject', callback_data: `o:r:${o.orderNumber}` },
      ],
    ];
    await adminSend(
      chatId,
      `🧾 <b>${esc(o.orderNumber)}</b>\n${esc(o.customerEmail)}\n${rs(o.totalAmountLKR)} · ${esc(o.paymentMethod)}\n${o.items.slice(0, 3).map((i) => `• ${esc(i.productTitle)} x${i.quantity}`).join('\n')}${o.receiptImageUrl ? '\n📎 slip attached' : ''}`,
      rows
    );
  }
  for (const t of topups) {
    await adminSend(chatId, `💰 <b>Top-up</b> ${esc(t.user_email)}\n${rs(Number(t.amount_lkr))} · ref ${esc(t.bank_reference)}\nCheck the slip in the admin console first.`, [
      [
        { text: '✅ Approve', callback_data: `t:a:${t.id}` },
        { text: '❌ Reject', callback_data: `t:r:${t.id}` },
      ],
    ]);
  }
  if (refundCount > 0) {
    await adminSend(chatId, `↩️ ${refundCount} refund request${refundCount > 1 ? 's' : ''} waiting.`, [[{ text: 'Review refunds', url: `${siteUrl()}/admin` }]]);
  }
}

async function cmdOrder(chatId: number, arg: string) {
  const order = arg ? await adminStore.getOrder(arg.trim().toUpperCase()) : undefined;
  if (!order) return void (await adminSend(chatId, 'Order not found. Use /order FBZ-123456'));
  const items = order.items.map((i) => `• ${esc(i.productTitle)}${i.variantTitle ? ` (${esc(i.variantTitle)})` : ''} x${i.quantity}`).join('\n');
  await adminSend(
    chatId,
    `🧾 <b>${esc(order.orderNumber)}</b>\n${esc(order.customerEmail)}\n${rs(order.totalAmountLKR)} · ${esc(order.paymentMethod)}\nPayment: ${esc(order.paymentStatus)} · Delivery: ${esc(order.fulfillmentStatus)}\nCreated: ${esc(fmtDate(new Date(order.createdAt).getTime()))}\n\n${items}`,
    order.paymentStatus === 'PENDING_REVIEW'
      ? [[{ text: '✅ Approve', callback_data: `o:a:${order.orderNumber}` }, { text: '❌ Reject', callback_data: `o:r:${order.orderNumber}` }]]
      : []
  );
}

async function cmdClient(chatId: number, arg: string) {
  const q = arg.trim();
  if (!q) return void (await adminSend(chatId, 'Use /client email@example.com or /client FBZ-123456'));
  let email = q.toLowerCase();
  let rows = q.includes('@') ? await getPanelClientsByUser(email) : [];
  if (!q.includes('@')) {
    rows = await getPanelClientsByOrder(q.toUpperCase());
    email = rows[0]?.user_email ?? '';
  }
  if (rows.length === 0) return void (await adminSend(chatId, 'No panel lines found for that.'));
  const plans = await xui.listClientPlans().catch(() => null);
  const out = rows.slice(0, 10).map((c) => {
    const p = plans?.get(c.uuid.toLowerCase());
    if (!p) return `<b>${esc(c.order_number)}</b> ${esc(c.status)}\nNot on the panel.`;
    const used = (p.up + p.down) / GB;
    const quota = p.totalBytes > 0 ? `${used.toFixed(1)} / ${(p.totalBytes / GB).toFixed(0)} GB` : `${used.toFixed(1)} GB (unlimited)`;
    const expired = !p.enable || (p.expiryMs > 0 && p.expiryMs < Date.now());
    return `<b>${esc(c.order_number)}</b> ${expired ? '🔴' : '🟢'}\n${quota} · expires ${p.expiryMs > 0 ? fmtDate(p.expiryMs) : 'never'}`;
  });
  await adminSend(chatId, `<b>${esc(email)}</b>\n\n${out.join('\n\n')}`);
}

async function cmdTickets(chatId: number) {
  if (!sql) return;
  const rows = (await sql.query(
    `SELECT ticket_number, customer_email, subject, status, priority FROM public.tickets
      WHERE status IN ('OPEN','IN_PROGRESS','WAITING_USER') ORDER BY updated_at DESC LIMIT 8`
  )) as any[];
  if (rows.length === 0) return void (await adminSend(chatId, '✅ No open tickets.'));
  const text = rows
    .map((t) => `• <b>${esc(t.ticket_number)}</b> [${esc(t.status)}] ${esc(t.subject)}\n  ${esc(t.customer_email)}`)
    .join('\n');
  await adminSend(chatId, `🎫 <b>Open tickets</b>\n\n${text}`, [[{ text: 'Open tickets', url: `${siteUrl()}/tickets` }]]);
}

async function flagsView() {
  const flags = await getPageFlags();
  const rows: AdminButton[][] = [];
  for (const d of PAGE_DEFS) {
    const on = flags[d.key];
    rows.push([{ text: `${on ? '🟢' : '⚪'} ${d.label}: ${on ? 'ON' : 'OFF'} (tap to switch)`, callback_data: `f:${d.key}:${on ? 0 : 1}` }]);
  }
  return { html: '<b>Site sections</b>\nTap one to switch it. Staff always see everything.', rows };
}

// ------------------------------------------------------------------ updates

export async function handleAdminUpdate(update: any): Promise<void> {
  if (update?.callback_query) return handleCallback(update.callback_query);
  const msg = update?.message;
  if (!msg || msg.chat?.type !== 'private' || typeof msg.text !== 'string') return;
  // Anyone who is not on the allow-list is ignored without a reply: the bot does not even confirm it exists.
  if (!isAdminId(msg.from?.id)) return;
  const chatId: number = msg.chat.id;
  if ((await rateLimit('tga-chat', String(chatId), 60, 300)).limited) return;

  const [rawCmd, ...args] = msg.text.trim().split(/\s+/);
  const cmd = rawCmd.toLowerCase().replace(/@\w+$/, '');
  const arg = args.join(' ');

  if (cmd === '/start' || cmd === '/help') return void (await adminSend(chatId, HELP));
  if (cmd === '/stats' || cmd === '/digest') return void (await adminSend(chatId, await buildStats(), [[{ text: 'Open admin', url: `${siteUrl()}/admin` }]]));
  if (cmd === '/pending') return void (await cmdPending(chatId));
  if (cmd === '/order') return void (await cmdOrder(chatId, arg));
  if (cmd === '/client') return void (await cmdClient(chatId, arg));
  if (cmd === '/tickets') return void (await cmdTickets(chatId));
  if (cmd === '/flags') {
    const v = await flagsView();
    return void (await adminSend(chatId, v.html, v.rows));
  }
  await adminSend(chatId, HELP);
}

async function handleCallback(cb: any): Promise<void> {
  const uid = cb?.from?.id;
  const chatId = cb?.message?.chat?.id;
  const messageId = cb?.message?.message_id;
  if (!isAdminId(uid) || !chatId || !messageId) return; // never answer strangers
  const data: string = String(cb.data || '');
  const [kind, action, ...rest] = data.split(':');
  const ref = rest.join(':');
  const staff = staffFor(uid);
  const who = `telegram:${uid}`;

  const confirmRow = (yes: string, label: string): AdminButton[][] => [[{ text: `Yes, ${label}`, callback_data: yes }, { text: 'Cancel', callback_data: 'x:c' }]];

  try {
    if (kind === 'x') {
      await adminAnswer(cb.id, 'Cancelled');
      return void (await adminEdit(chatId, messageId, '↩️ Cancelled. Nothing was changed.'));
    }

    // ---- orders: first tap asks, second tap (capital letter) does it
    if (kind === 'o') {
      const order = await adminStore.getOrder(ref);
      if (!order) return void (await adminAnswer(cb.id, 'Order not found', true));
      if (action === 'a' || action === 'r') {
        await adminAnswer(cb.id);
        const verb = action === 'a' ? 'approve' : 'reject';
        return void (await adminEdit(
          chatId,
          messageId,
          `⚠️ <b>${verb === 'approve' ? 'Approve' : 'Reject'} ${esc(order.orderNumber)}?</b>\n${esc(order.customerEmail)} · ${rs(order.totalAmountLKR)}\n${verb === 'approve' ? 'This creates the customer\'s lines and delivers them now.' : 'This removes any delivered lines.'}`,
          confirmRow(`o:${action.toUpperCase()}:${order.orderNumber}`, verb)
        ));
      }
      if (action === 'A') {
        const r = await approveOrder(order, who, 'Approved from the admin Telegram bot.');
        if (r.ok) await auditLog({ id: 'telegram-admin', email: who }, 'ORDER_APPROVED', 'ORDER', order.orderNumber, { via: 'telegram' });
        await adminAnswer(cb.id, r.ok ? 'Approved' : r.error, !r.ok);
        return void (await adminEdit(chatId, messageId, r.ok ? `✅ <b>${esc(order.orderNumber)} approved and delivered.</b>` : `⚠️ ${esc(r.error)}`));
      }
      if (action === 'R') {
        const r = await rejectOrder(order, who, 'Rejected from the admin Telegram bot.');
        await auditLog({ id: 'telegram-admin', email: who }, 'ORDER_REJECTED', 'ORDER', order.orderNumber, { via: 'telegram' });
        await adminAnswer(cb.id, 'Rejected');
        return void (await adminEdit(chatId, messageId, `❌ <b>${esc(order.orderNumber)} rejected.</b>${r.revokedClients ? ` ${r.revokedClients} line(s) removed.` : ''}`));
      }
    }

    // ---- wallet top-ups
    if (kind === 't') {
      if (action === 'a' || action === 'r') {
        await adminAnswer(cb.id);
        const verb = action === 'a' ? 'approve' : 'reject';
        return void (await adminEdit(
          chatId,
          messageId,
          `⚠️ <b>${verb === 'approve' ? 'Approve' : 'Reject'} this top-up?</b>\n${verb === 'approve' ? 'Only approve after you saw the money in the bank. The wallet is credited now.' : 'The customer is told it was not approved.'}`,
          confirmRow(`t:${action.toUpperCase()}:${ref}`, verb)
        ));
      }
      const emailRow = async () =>
        ((await sql!.query('SELECT user_email FROM public.wallet_topups WHERE id = $1', [ref])) as { user_email: string }[])[0]?.user_email ?? null;
      if (action === 'A') {
        const r = await approveTopup(ref, staff, 'Approved from the admin Telegram bot.');
        if (!r.ok) {
          await adminAnswer(cb.id, r.reason === 'ALREADY_REVIEWED' ? 'Already reviewed' : 'Not found', true);
          return void (await adminEdit(chatId, messageId, `⚠️ ${r.reason === 'ALREADY_REVIEWED' ? 'This top-up was already reviewed.' : 'Top-up not found.'}`));
        }
        await auditLog({ id: 'telegram-admin', email: who }, 'TOPUP_APPROVED', 'WALLET_TOPUP', ref, { amount: r.amount, via: 'telegram' });
        const m = tgMessages.money('Wallet top-up approved', `Rs. ${r.amount.toLocaleString()} was added. New balance: Rs. ${r.balanceAfter.toLocaleString()}.`);
        notifyLater(await emailRow(), m.html, m.buttons);
        await adminAnswer(cb.id, 'Approved');
        return void (await adminEdit(chatId, messageId, `✅ <b>Top-up approved.</b> ${rs(r.amount)} credited.`));
      }
      if (action === 'R') {
        const email = await emailRow();
        const ok = await rejectTopup(ref, staff, 'Rejected from the admin Telegram bot.');
        if (ok) {
          await auditLog({ id: 'telegram-admin', email: who }, 'TOPUP_REJECTED', 'WALLET_TOPUP', ref, { via: 'telegram' });
          const m = tgMessages.money('Wallet top-up not approved', 'We could not match the transfer. Open a ticket if this is a mistake.');
          notifyLater(email, m.html, m.buttons);
        }
        await adminAnswer(cb.id, ok ? 'Rejected' : 'Already reviewed', !ok);
        return void (await adminEdit(chatId, messageId, ok ? '❌ <b>Top-up rejected.</b>' : '⚠️ This top-up was already reviewed.'));
      }
    }

    // ---- site sections
    if (kind === 'f') {
      const key = action as PageKey;
      const on = ref === '1';
      if (!PAGE_DEFS.some((d) => d.key === key)) return void (await adminAnswer(cb.id, 'Unknown section', true));
      await setPageFlags({ [key]: on } as any, who);
      await auditLog({ id: 'telegram-admin', email: who }, 'SITE_PAGES_UPDATED', 'SETTINGS', 'site_pages', { [key]: on, via: 'telegram' });
      await adminAnswer(cb.id, `${key} is now ${on ? 'ON' : 'OFF'}`);
      const v = await flagsView();
      return void (await adminEdit(chatId, messageId, v.html, v.rows));
    }

    await adminAnswer(cb.id);
  } catch (err) {
    console.error('Admin bot action failed:', err instanceof Error ? err.message : err);
    await adminAnswer(cb.id, 'Something went wrong. Check the admin console.', true).catch(() => {});
  }
}

// ------------------------------------------------------------------ daily digest (cron)

export async function sendAdminDigest(): Promise<void> {
  await notifyAdminsNow(await buildStats(), [[{ text: 'Open admin', url: `${siteUrl()}/admin` }]]);
}
