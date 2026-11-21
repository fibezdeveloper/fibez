import crypto from 'crypto';
import type { PoolClient } from '@neondatabase/serverless';
import { sql } from '@/lib/db';
import { withTransaction, isUniqueViolation } from '@/lib/db/tx';

/**
 * Wallet / refunds / referrals / trial claims / panel-client tracking.
 * Every money movement goes through the `wallet_apply()` SQL function (migration 0002):
 * append-only ledger, no negative balances, idempotent. This file never edits a balance directly.
 */

export const TOPUP_MIN_LKR = 250;
export const TOPUP_MAX_LKR = 200000;
export const MAX_PENDING_TOPUPS = 3;
export const REFERRAL_BONUS_LKR = 100;
export const REFUND_WINDOW_HOURS = 24; // must claim within 24h of delivery
export const REFUND_OWNER_THRESHOLD_LKR = 5000;
export const REFUND_MAX_USAGE_GB = 1;

export const REFUND_REASONS = {
  NOT_WORKING: 'Config does not work and could not be fixed',
  WRONG_ITEM: 'Wrong item delivered',
  DUPLICATE_CHARGE: 'Charged twice for the same order',
  SERVICE_OUTAGE: 'Long service outage',
  OTHER_VALID: 'Other valid reason (explain below)',
} as const;
export type RefundReason = keyof typeof REFUND_REASONS;

export class InsufficientFundsError extends Error {
  constructor() {
    super('Insufficient wallet balance');
  }
}

export type LedgerType = 'TOPUP' | 'PURCHASE' | 'REFUND' | 'REFERRAL_BONUS' | 'ADJUSTMENT' | 'REVERSAL';

export interface LedgerParams {
  userId: string;
  type: LedgerType;
  amount: number; // signed LKR
  refType?: string;
  refId?: string;
  reason?: string;
  actorId?: string;
  actorEmail?: string;
  idem: string;
}

const q = async <T = any>(text: string, params: unknown[] = []): Promise<T[]> => {
  if (!sql) throw new Error('Database is not configured');
  return (await sql.query(text, params)) as unknown as T[];
};

/** Atomic ledger write inside an existing transaction. */
export async function applyLedger(
  client: PoolClient,
  p: LedgerParams
): Promise<{ ledgerId: string; balanceAfter: number; replayed: boolean }> {
  try {
    const r = await client.query('SELECT * FROM public.wallet_apply($1,$2,$3,$4,$5,$6,$7,$8,$9)', [
      p.userId,
      p.type,
      Math.round(p.amount),
      p.refType ?? null,
      p.refId ?? null,
      p.reason ?? null,
      p.actorId ?? null,
      p.actorEmail ?? null,
      p.idem,
    ]);
    const row = r.rows[0];
    return { ledgerId: row.ledger_id, balanceAfter: Number(row.balance_after), replayed: Boolean(row.replayed) };
  } catch (err) {
    if (String((err as Error)?.message || '').includes('INSUFFICIENT_FUNDS')) throw new InsufficientFundsError();
    throw err;
  }
}

export async function applyLedgerOnce(p: LedgerParams) {
  return withTransaction((c) => applyLedger(c, p));
}

export async function getBalance(userId: string): Promise<number> {
  const rows = await q<{ balance_lkr: string }>('SELECT balance_lkr FROM public.wallet_accounts WHERE user_id = $1', [userId]);
  return rows[0] ? Number(rows[0].balance_lkr) : 0;
}

export interface LedgerRow {
  id: string;
  entry_type: LedgerType;
  amount_lkr: number;
  balance_after_lkr: number;
  ref_type: string | null;
  ref_id: string | null;
  reason: string | null;
  created_at: string;
}

export async function getHistory(userId: string, limit = 50, before?: string): Promise<LedgerRow[]> {
  const rows = await q<any>(
    `SELECT id, entry_type, amount_lkr, balance_after_lkr, ref_type, ref_id, reason, created_at
       FROM public.wallet_ledger
      WHERE user_id = $1 ${before ? 'AND created_at < $3' : ''}
      ORDER BY created_at DESC LIMIT $2`,
    before ? [userId, Math.min(limit, 200), before] : [userId, Math.min(limit, 200)]
  );
  return rows.map((r) => ({ ...r, amount_lkr: Number(r.amount_lkr), balance_after_lkr: Number(r.balance_after_lkr) }));
}

// ------------------------------------------------------------------------------------ top-ups

export interface TopupRow {
  id: string;
  user_id: string;
  user_email: string;
  amount_lkr: number;
  bank_reference: string;
  slip_url: string | null;
  slip_key: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const mapTopup = (r: any): TopupRow => ({ ...r, amount_lkr: Number(r.amount_lkr) });

export async function createTopup(t: {
  userId: string;
  userEmail: string;
  amount: number;
  bankReference: string;
  slipUrl: string;
  slipKey: string;
  slipHash: string;
}): Promise<{ ok: true; id: string } | { ok: false; reason: 'DUPLICATE_REFERENCE' | 'DUPLICATE_SLIP' | 'TOO_MANY_PENDING' }> {
  const pending = await q<{ n: string }>(
    `SELECT count(*) AS n FROM public.wallet_topups WHERE user_id = $1 AND status = 'PENDING'`,
    [t.userId]
  );
  if (Number(pending[0]?.n || 0) >= MAX_PENDING_TOPUPS) return { ok: false, reason: 'TOO_MANY_PENDING' };

  const id = `tup_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  try {
    await q(
      `INSERT INTO public.wallet_topups (id, user_id, user_email, amount_lkr, bank_reference, slip_url, slip_key, slip_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, t.userId, t.userEmail.toLowerCase(), t.amount, t.bankReference, t.slipUrl, t.slipKey, t.slipHash]
    );
    return { ok: true, id };
  } catch (err) {
    if (isUniqueViolation(err, 'wallet_topups_ref_unique')) return { ok: false, reason: 'DUPLICATE_REFERENCE' };
    if (isUniqueViolation(err, 'wallet_topups_slip_unique')) return { ok: false, reason: 'DUPLICATE_SLIP' };
    throw err;
  }
}

export async function listTopups(opts: { userId?: string; status?: string; limit?: number }): Promise<TopupRow[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.userId) {
    params.push(opts.userId);
    where.push(`user_id = $${params.length}`);
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`status = $${params.length}`);
  }
  params.push(Math.min(opts.limit ?? 100, 500));
  const rows = await q<any>(
    `SELECT id, user_id, user_email, amount_lkr, bank_reference, slip_url, slip_key, status, reviewed_by, review_note, reviewed_at, created_at
       FROM public.wallet_topups ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY created_at DESC LIMIT $${params.length}`,
    params
  );
  return rows.map(mapTopup);
}

export type Staff = { id: string; email: string; role: 'admin' | 'owner' };

export async function approveTopup(id: string, admin: Staff, note?: string) {
  return withTransaction(async (c) => {
    const r = await c.query('SELECT * FROM public.wallet_topups WHERE id = $1 FOR UPDATE', [id]);
    const t = r.rows[0];
    if (!t) return { ok: false as const, reason: 'NOT_FOUND' as const };
    if (t.status !== 'PENDING') return { ok: false as const, reason: 'ALREADY_REVIEWED' as const };
    const led = await applyLedger(c, {
      userId: t.user_id,
      type: 'TOPUP',
      amount: Number(t.amount_lkr),
      refType: 'topup',
      refId: id,
      reason: `Bank top-up ${t.bank_reference}`,
      actorId: admin.id,
      actorEmail: admin.email,
      idem: `topup:${id}`,
    });
    await c.query(
      `UPDATE public.wallet_topups SET status='APPROVED', reviewed_by=$2, review_note=$3, reviewed_at=now(), ledger_id=$4 WHERE id=$1`,
      [id, admin.email, note ?? null, led.ledgerId]
    );
    return { ok: true as const, userId: t.user_id as string, amount: Number(t.amount_lkr), balanceAfter: led.balanceAfter };
  });
}

export async function rejectTopup(id: string, admin: Staff, note: string) {
  const rows = await q(
    `UPDATE public.wallet_topups SET status='REJECTED', reviewed_by=$2, review_note=$3, reviewed_at=now()
      WHERE id=$1 AND status='PENDING' RETURNING id`,
    [id, admin.email, note]
  );
  return rows.length > 0;
}

// ------------------------------------------------------------------------------------ refunds

export interface RefundRow {
  id: string;
  user_id: string;
  user_email: string;
  order_number: string;
  amount_lkr: number;
  reason_code: RefundReason;
  details: string | null;
  evidence: Record<string, unknown>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}
const mapRefund = (r: any): RefundRow => ({ ...r, amount_lkr: Number(r.amount_lkr) });

export async function createRefundRequest(r: {
  userId: string;
  userEmail: string;
  orderNumber: string;
  amount: number;
  reasonCode: RefundReason;
  details: string;
  evidence: Record<string, unknown>;
}): Promise<{ ok: true; id: string } | { ok: false; reason: 'ALREADY_REQUESTED' }> {
  const id = `rfd_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  try {
    await q(
      `INSERT INTO public.refund_requests (id, user_id, user_email, order_number, amount_lkr, reason_code, details, evidence)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)`,
      [id, r.userId, r.userEmail.toLowerCase(), r.orderNumber, r.amount, r.reasonCode, r.details, JSON.stringify(r.evidence)]
    );
    return { ok: true, id };
  } catch (err) {
    if (isUniqueViolation(err, 'refund_one_per_order')) return { ok: false, reason: 'ALREADY_REQUESTED' };
    throw err;
  }
}

export async function listRefunds(opts: { userId?: string; status?: string }): Promise<RefundRow[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.userId) {
    params.push(opts.userId);
    where.push(`user_id = $${params.length}`);
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`status = $${params.length}`);
  }
  const rows = await q<any>(
    `SELECT * FROM public.refund_requests ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 200`,
    params
  );
  return rows.map(mapRefund);
}

export async function approveRefund(id: string, admin: Staff, amount: number | undefined, note: string) {
  return withTransaction(async (c) => {
    const r = await c.query('SELECT * FROM public.refund_requests WHERE id = $1 FOR UPDATE', [id]);
    const rf = r.rows[0];
    if (!rf) return { ok: false as const, reason: 'NOT_FOUND' as const };
    if (rf.status !== 'PENDING') return { ok: false as const, reason: 'ALREADY_REVIEWED' as const };
    const requested = Number(rf.amount_lkr);
    const final = Math.min(requested, Math.max(1, Math.round(amount ?? requested)));
    if (final > REFUND_OWNER_THRESHOLD_LKR && admin.role !== 'owner') {
      return { ok: false as const, reason: 'OWNER_REQUIRED' as const };
    }
    const led = await applyLedger(c, {
      userId: rf.user_id,
      type: 'REFUND',
      amount: final,
      refType: 'order',
      refId: rf.order_number,
      reason: `Refund approved (${rf.reason_code}): ${note}`,
      actorId: admin.id,
      actorEmail: admin.email,
      idem: `refund:${id}`,
    });
    await c.query(
      `UPDATE public.refund_requests SET status='APPROVED', reviewed_by=$2, review_note=$3, reviewed_at=now(), ledger_id=$4, amount_lkr=$5 WHERE id=$1`,
      [id, admin.email, note, led.ledgerId, final]
    );
    return { ok: true as const, orderNumber: rf.order_number as string, userId: rf.user_id as string, amount: final };
  });
}

export async function rejectRefund(id: string, admin: Staff, note: string) {
  const rows = await q(
    `UPDATE public.refund_requests SET status='REJECTED', reviewed_by=$2, review_note=$3, reviewed_at=now()
      WHERE id=$1 AND status='PENDING' RETURNING id`,
    [id, admin.email, note]
  );
  return rows.length > 0;
}

// ------------------------------------------------------------------------------------ referrals

export async function getOrCreateReferralCode(userId: string, email: string, name?: string): Promise<string> {
  const found = await q<{ code: string }>('SELECT code FROM public.referral_codes WHERE user_id = $1', [userId]);
  if (found[0]) return found[0].code;
  const prefix =
    (name || email.split('@')[0]).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'FIBEZ';
  for (let i = 0; i < 8; i++) {
    const code = `${prefix}-${crypto.randomInt(100, 9999)}`;
    try {
      await q('INSERT INTO public.referral_codes (user_id, user_email, code) VALUES ($1,$2,$3)', [userId, email.toLowerCase(), code]);
      return code;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      const again = await q<{ code: string }>('SELECT code FROM public.referral_codes WHERE user_id = $1', [userId]);
      if (again[0]) return again[0].code; // raced with ourselves
    }
  }
  throw new Error('Could not allocate a referral code');
}

export async function findReferrerByCode(code: string): Promise<{ userId: string; email: string } | null> {
  const rows = await q<{ user_id: string; user_email: string }>(
    'SELECT user_id, user_email FROM public.referral_codes WHERE code = $1',
    [code.trim().toUpperCase()]
  );
  return rows[0] ? { userId: rows[0].user_id, email: rows[0].user_email } : null;
}

/** Credits the referrer's WALLET once per referred order. Safe to call repeatedly. */
export async function awardReferral(p: { orderNumber: string; code: string; buyerEmail: string }) {
  const referrer = await findReferrerByCode(p.code);
  if (!referrer) return { awarded: false as const };
  if (referrer.email.toLowerCase() === p.buyerEmail.toLowerCase()) return { awarded: false as const };

  return withTransaction(async (c) => {
    // One reward per referred customer: a friend placing many orders must not pay the referrer each time.
    const prior = await c.query(
      `SELECT 1 FROM public.referral_rewards WHERE lower(buyer_email) = lower($1) AND order_number <> $2 LIMIT 1`,
      [p.buyerEmail, p.orderNumber]
    );
    if (prior.rows.length > 0) return { awarded: false as const };
    const led = await applyLedger(c, {
      userId: referrer.userId,
      type: 'REFERRAL_BONUS',
      amount: REFERRAL_BONUS_LKR,
      refType: 'order',
      refId: p.orderNumber,
      reason: `Friend ${p.buyerEmail} completed order ${p.orderNumber}`,
      idem: `referral:${p.orderNumber}`,
    });
    await c.query(
      `INSERT INTO public.referral_rewards (order_number, referrer_user_id, buyer_email, amount_lkr, ledger_id)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (order_number) DO NOTHING`,
      [p.orderNumber, referrer.userId, p.buyerEmail.toLowerCase(), REFERRAL_BONUS_LKR, led.ledgerId]
    );
    return { awarded: !led.replayed, amount: REFERRAL_BONUS_LKR };
  });
}

export async function referralStats(userId: string) {
  const rows = await q<{ n: string; total: string }>(
    'SELECT count(*) AS n, COALESCE(sum(amount_lkr),0) AS total FROM public.referral_rewards WHERE referrer_user_id = $1',
    [userId]
  );
  return { rewardedFriends: Number(rows[0]?.n || 0), totalEarnedLkr: Number(rows[0]?.total || 0) };
}

// ------------------------------------------------------------------------------------ admin helpers

export async function findWalletUser(email: string) {
  const rows = await q<any>(
    `SELECT u.id::text AS id, u.email, u.name, COALESCE(a.balance_lkr, 0) AS balance_lkr
       FROM neon_auth."user" u LEFT JOIN public.wallet_accounts a ON a.user_id = u.id::text
      WHERE lower(u.email) = lower($1) LIMIT 1`,
    [email.trim()]
  );
  return rows[0] ? { ...rows[0], balance_lkr: Number(rows[0].balance_lkr) } : null;
}

export async function adjustBalance(p: { userId: string; amount: number; reason: string; admin: Staff }) {
  return applyLedgerOnce({
    userId: p.userId,
    type: 'ADJUSTMENT',
    amount: p.amount,
    refType: 'admin',
    refId: p.admin.email,
    reason: p.reason,
    actorId: p.admin.id,
    actorEmail: p.admin.email,
    idem: `adjust:${crypto.randomUUID()}`,
  });
}

export async function walletSummary() {
  const [tot, bad, pend, rfd] = await Promise.all([
    q<any>('SELECT COALESCE(sum(balance_lkr),0) AS total, count(*) AS accounts FROM public.wallet_accounts'),
    q<any>('SELECT user_id, account_balance, ledger_sum FROM public.wallet_integrity WHERE NOT ok LIMIT 50'),
    q<any>(`SELECT count(*) AS n, COALESCE(sum(amount_lkr),0) AS total FROM public.wallet_topups WHERE status='PENDING'`),
    q<any>(`SELECT count(*) AS n FROM public.refund_requests WHERE status='PENDING'`),
  ]);
  return {
    totalBalanceLkr: Number(tot[0].total),
    accounts: Number(tot[0].accounts),
    mismatches: bad,
    pendingTopups: Number(pend[0].n),
    pendingTopupsLkr: Number(pend[0].total),
    pendingRefunds: Number(rfd[0].n),
  };
}

// ------------------------------------------------------------------------------------ free-trial claims (DB-enforced)

export async function tryClaimTrialDb(
  c: { userId: string; email: string; canonicalEmail: string; ip: string; deviceId: string; fpHash: string; uaHash: string; orderNumber: string },
  opts: { maxPerIp: number; ipWindowDays: number }
): Promise<{ ok: true; claimId: string } | { ok: false; reason: 'ACCOUNT' | 'EMAIL' | 'DEVICE' | 'IP' }> {
  try {
    return await withTransaction(async (client) => {
      if (c.ip && c.ip !== 'unknown') {
        const r = await client.query(
          `SELECT count(*) AS n FROM public.trial_claims WHERE ip = $1 AND created_at > now() - ($2::int * interval '1 day')`,
          [c.ip, opts.ipWindowDays]
        );
        if (Number(r.rows[0].n) >= opts.maxPerIp) return { ok: false as const, reason: 'IP' as const };
      }
      const id = `trial_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
      await client.query(
        `INSERT INTO public.trial_claims (id, user_id, email, canonical_email, device_id, fp_hash, ip, ua_hash, order_number)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [id, c.userId, c.email.toLowerCase(), c.canonicalEmail, c.deviceId, c.fpHash, c.ip, c.uaHash, c.orderNumber]
      );
      return { ok: true as const, claimId: id };
    });
  } catch (err) {
    if (isUniqueViolation(err, 'user_id_key')) return { ok: false, reason: 'ACCOUNT' };
    if (isUniqueViolation(err, 'canonical_email_key')) return { ok: false, reason: 'EMAIL' };
    if (isUniqueViolation(err, 'trial_claims_device_unique') || isUniqueViolation(err, 'trial_claims_fp_unique')) {
      return { ok: false, reason: 'DEVICE' };
    }
    throw err;
  }
}

export async function releaseTrialClaimDb(claimId: string) {
  await q('DELETE FROM public.trial_claims WHERE id = $1', [claimId]);
}

export async function userHasTrial(userId: string, canonicalEmail: string): Promise<boolean> {
  const rows = await q('SELECT 1 FROM public.trial_claims WHERE user_id = $1 OR canonical_email = $2 LIMIT 1', [userId, canonicalEmail]);
  return rows.length > 0;
}

// ------------------------------------------------------------------------------------ panel clients

export interface PanelClientRow {
  id: string;
  order_number: string;
  item_id: string | null;
  user_email: string;
  email: string;
  uuid: string;
  inbound_id: number | null;
  expires_at: string | null;
  status: 'ACTIVE' | 'REVOKED';
}

export async function recordPanelClients(
  rows: { orderNumber: string; itemId?: string; userEmail: string; email: string; uuid: string; inboundId?: number; expiresAt?: Date }[]
) {
  for (const r of rows) {
    await q(
      `INSERT INTO public.panel_clients (id, order_number, item_id, user_email, email, uuid, inbound_id, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (email) DO NOTHING`,
      [
        `pc_${crypto.randomUUID().replace(/-/g, '').slice(0, 14)}`,
        r.orderNumber,
        r.itemId ?? null,
        r.userEmail.toLowerCase(),
        r.email,
        r.uuid,
        r.inboundId ?? null,
        r.expiresAt ? r.expiresAt.toISOString() : null,
      ]
    );
  }
}

export async function getPanelClientsByOrder(orderNumber: string): Promise<PanelClientRow[]> {
  return q<PanelClientRow>('SELECT * FROM public.panel_clients WHERE order_number = $1', [orderNumber]);
}

export async function getPanelClientByUuid(uuid: string): Promise<PanelClientRow | null> {
  const rows = await q<PanelClientRow>('SELECT * FROM public.panel_clients WHERE lower(uuid) = lower($1) LIMIT 1', [uuid]);
  return rows[0] ?? null;
}

export async function markPanelClientsRevoked(orderNumber: string) {
  await q(`UPDATE public.panel_clients SET status='REVOKED', revoked_at=now() WHERE order_number=$1 AND status='ACTIVE'`, [orderNumber]);
}

export async function setPanelClientExpiry(email: string, expiresAt: Date) {
  await q('UPDATE public.panel_clients SET expires_at = $2 WHERE email = $1', [email, expiresAt.toISOString()]);
}

export async function getPanelClientsByUser(email: string): Promise<PanelClientRow[]> {
  return q<PanelClientRow>('SELECT * FROM public.panel_clients WHERE lower(user_email) = lower($1)', [email]);
}