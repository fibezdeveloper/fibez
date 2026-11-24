import { auditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dal';
import { sql } from '@/lib/db';
import { notifyLater } from '@/lib/telegram';
import { tgMessages } from '@/lib/telegram-bot';

/** Customer email behind a top-up or refund request, for the Telegram notice. */
async function emailOf(table: 'wallet_topups' | 'refund_requests', id: string): Promise<string | null> {
  if (!sql || !id) return null;
  const rows = (await sql.query(`SELECT user_email FROM public.${table} WHERE id = $1`, [id])) as { user_email: string }[];
  return rows[0]?.user_email ?? null;
}
import { dbReady } from '@/lib/db/tx';
import { adminStore } from '@/lib/admin-store';
import { getObjectDownloadUrl, BUCKET_NAME } from '@/lib/storage';
import { revokeOrderLines } from '@/lib/fulfillment';
import {
  approveTopup,
  rejectTopup,
  approveRefund,
  rejectRefund,
  listTopups,
  listRefunds,
  findWalletUser,
  listWalletUsers,
  adjustBalance,
  getHistory,
  walletSummary,
  REFUND_OWNER_THRESHOLD_LKR,
  type Staff,
} from '@/lib/wallet';

/** Admin wallet console: top-up approvals, refund reviews, user lookup, owner adjustments. */

export async function GET(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;
  if (!dbReady()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view') || 'overview';

    if (view === 'users') {
      const search = (searchParams.get('q') || '').slice(0, 80);
      const offset = Math.max(0, Number(searchParams.get('offset')) || 0);
      return NextResponse.json(await listWalletUsers(search, 50, offset));
    }

    if (view === 'user') {
      const email = (searchParams.get('email') || '').trim();
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
      const user = await findWalletUser(email);
      if (!user) return NextResponse.json({ error: 'No account with that email' }, { status: 404 });
      return NextResponse.json({ user, history: await getHistory(user.id, 100) });
    }

    const [summary, pendingTopups, pendingRefunds, recentTopups] = await Promise.all([
      walletSummary(),
      listTopups({ status: 'PENDING', limit: 100 }),
      listRefunds({ status: 'PENDING' }),
      listTopups({ limit: 30 }),
    ]);

    // Slip links are time-limited: sign a fresh one for each pending top-up.
    const withSlip = await Promise.all(
      pendingTopups.map(async (t) => ({
        ...t,
        slipViewUrl: t.slip_key ? await getObjectDownloadUrl(t.slip_key, BUCKET_NAME, 3600).catch(() => null) : null,
        slip_key: undefined,
        slip_url: undefined,
      }))
    );

    return NextResponse.json({
      summary,
      pendingTopups: withSlip,
      pendingRefunds,
      recentTopups: recentTopups.map(({ slip_key, slip_url, ...t }) => t),
      refundOwnerThresholdLkr: REFUND_OWNER_THRESHOLD_LKR,
      role: guard.user.role,
    });
  } catch (err) {
    console.error('Admin wallet read failed:', err);
    return NextResponse.json({ error: 'Failed to load wallet console' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;
  if (!dbReady()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  const staff: Staff = { id: guard.user.id, email: guard.user.email, role: guard.user.role === 'owner' ? 'owner' : 'admin' };

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const id = typeof body.id === 'string' ? body.id : '';
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : '';

    if (action === 'approve_topup') {
      const r = await approveTopup(id, staff, note || undefined);
      if (!r.ok) return NextResponse.json({ error: r.reason === 'ALREADY_REVIEWED' ? 'Already reviewed' : 'Top-up not found' }, { status: 409 });
      const topupMsg = tgMessages.money('Wallet top-up approved', `Rs. ${r.amount.toLocaleString()} was added. New balance: Rs. ${r.balanceAfter.toLocaleString()}.`);
      notifyLater(await emailOf('wallet_topups', id), topupMsg.html, topupMsg.buttons);
      await auditLog(guard.user, 'TOPUP_APPROVED', 'WALLET_TOPUP', id, { amount: r.amount, balanceAfter: r.balanceAfter, note }, req);
      return NextResponse.json({ success: true, credited: r.amount, balanceAfter: r.balanceAfter });
    }

    if (action === 'reject_topup') {
      if (note.length < 3) return NextResponse.json({ error: 'A reason is required to reject' }, { status: 400 });
      const ok = await rejectTopup(id, staff, note);
      if (ok) {
        await auditLog(guard.user, 'TOPUP_REJECTED', 'WALLET_TOPUP', id, { note }, req);
        const m = tgMessages.money('Wallet top-up not approved', note);
        notifyLater(await emailOf('wallet_topups', id), m.html, m.buttons);
      }
      return ok ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Already reviewed or not found' }, { status: 409 });
    }

    if (action === 'approve_refund') {
      if (note.length < 3) return NextResponse.json({ error: 'A note is required to approve a refund' }, { status: 400 });
      const amount = body.amount !== undefined ? Number(body.amount) : undefined;
      const r = await approveRefund(id, staff, amount, note);
      if (!r.ok) {
        const msg =
          r.reason === 'OWNER_REQUIRED'
            ? `Refunds above Rs. ${REFUND_OWNER_THRESHOLD_LKR.toLocaleString()} need the owner to approve`
            : r.reason === 'ALREADY_REVIEWED'
            ? 'Already reviewed'
            : 'Refund request not found';
        return NextResponse.json({ error: msg }, { status: r.reason === 'OWNER_REQUIRED' ? 403 : 409 });
      }
      // Same step: take the line away and mark the order refunded.
      let removed = 0;
      const order = await adminStore.getOrder(r.orderNumber);
      if (order) {
        removed = await revokeOrderLines(order);
        await adminStore.updateOrderStatus(r.orderNumber, {
          paymentStatus: 'REFUNDED',
          fulfillmentStatus: 'REVOKED',
          reviewedBy: staff.email,
          reviewNotes: `Refunded Rs. ${r.amount} to wallet: ${note}`,
        });
      }
      {
        const m = tgMessages.money('Refund approved', `Rs. ${r.amount.toLocaleString()} for order ${r.orderNumber} was added to your wallet.`);
        notifyLater(order?.customerEmail ?? (await emailOf('refund_requests', id)), m.html, m.buttons);
      }
      await auditLog(guard.user, 'REFUND_APPROVED', 'ORDER', r.orderNumber, { amount: r.amount, note, linesRemoved: removed }, req);
      return NextResponse.json({ success: true, refunded: r.amount, linesRemoved: removed });
    }

    if (action === 'reject_refund') {
      if (note.length < 3) return NextResponse.json({ error: 'A reason is required to reject' }, { status: 400 });
      const ok = await rejectRefund(id, staff, note);
      if (ok) {
        await auditLog(guard.user, 'REFUND_REJECTED', 'REFUND', id, { note }, req);
        const m = tgMessages.money('Refund request not approved', note);
        notifyLater(await emailOf('refund_requests', id), m.html, m.buttons);
      }
      return ok ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Already reviewed or not found' }, { status: 409 });
    }

    if (action === 'adjust') {
      if (staff.role !== 'owner') return NextResponse.json({ error: 'Only the owner can adjust balances' }, { status: 403 });
      const amount = Math.round(Number(body.amount));
      const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 300) : '';
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 100000) {
        return NextResponse.json({ error: 'Amount must be a non-zero number up to Rs. 100,000' }, { status: 400 });
      }
      if (reason.length < 5) return NextResponse.json({ error: 'A clear reason is required' }, { status: 400 });
      const user = await findWalletUser(email);
      if (!user) return NextResponse.json({ error: 'No account with that email' }, { status: 404 });
      try {
        const r = await adjustBalance({ userId: user.id, amount, reason, admin: staff });
        await auditLog(guard.user, 'WALLET_ADJUSTED', 'USER', user.id, { email, amount, reason, balanceAfter: r.balanceAfter }, req);
        const m = tgMessages.money(
          amount > 0 ? 'Wallet credited' : 'Wallet adjusted',
          `${amount > 0 ? '+' : ''}Rs. ${amount.toLocaleString()}: ${reason}. Balance: Rs. ${r.balanceAfter.toLocaleString()}.`
        );
        notifyLater(email, m.html, m.buttons);
        return NextResponse.json({ success: true, balanceAfter: r.balanceAfter });
      } catch (err) {
        if (String((err as Error).message).includes('Insufficient')) {
          return NextResponse.json({ error: 'That would take the balance below zero' }, { status: 400 });
        }
        throw err;
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Admin wallet action failed:', err);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
