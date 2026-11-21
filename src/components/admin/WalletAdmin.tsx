'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface Topup {
  id: string;
  user_email: string;
  amount_lkr: number;
  bank_reference: string;
  status: string;
  created_at: string;
  slipViewUrl?: string | null;
  review_note?: string | null;
}
interface Refund {
  id: string;
  user_email: string;
  order_number: string;
  amount_lkr: number;
  reason_code: string;
  details: string | null;
  evidence: Record<string, unknown>;
  created_at: string;
}
interface Overview {
  summary: {
    totalBalanceLkr: number;
    accounts: number;
    mismatches: { user_id: string; account_balance: string; ledger_sum: string }[];
    pendingTopups: number;
    pendingTopupsLkr: number;
    pendingRefunds: number;
  };
  pendingTopups: Topup[];
  pendingRefunds: Refund[];
  recentTopups: Topup[];
  refundOwnerThresholdLkr: number;
  role: 'admin' | 'owner';
}
interface LedgerRow {
  id: string;
  entry_type: string;
  amount_lkr: number;
  balance_after_lkr: number;
  reason: string | null;
  created_at: string;
}

const fmt = (n: number) => `Rs. ${Number(n).toLocaleString()}`;
const when = (s: string) => new Date(s).toLocaleString();

export default function WalletAdmin() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const [lookupEmail, setLookupEmail] = useState('');
  const [lookup, setLookup] = useState<{ user: { id: string; email: string; name: string; balance_lkr: number }; history: LedgerRow[] } | null>(null);
  const [users, setUsers] = useState<{ id: string; email: string; name: string; role: string; balance_lkr: number }[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/wallet', { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed to load');
      setData(j);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (key: string, payload: Record<string, unknown>, okText: string) => {
    setBusy(key);
    setMessage(null);
    try {
      const r = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Action failed');
      setMessage({ text: okText, ok: true });
      await load();
      if (lookup && payload.action === 'adjust') await doLookup();
    } catch (e) {
      setMessage({ text: (e as Error).message, ok: false });
    } finally {
      setBusy(null);
    }
  };


  const loadUsers = useCallback(async (q: string) => {
    setUsersLoading(true);
    try {
      const r = await fetch(`/api/admin/wallet?view=users&q=${encodeURIComponent(q)}`, { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        setUsers(j.users || []);
        setUsersTotal(j.total || 0);
      }
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadUsers(userSearch), 250);
    return () => clearTimeout(t);
  }, [userSearch, loadUsers]);

  const doLookup = async (emailOverride?: string) => {
    setMessage(null);
    try {
      const target = (emailOverride ?? lookupEmail).trim();
      const r = await fetch(`/api/admin/wallet?view=user&email=${encodeURIComponent(target)}`, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Not found');
      setLookup(j);
    } catch (e) {
      setLookup(null);
      setMessage({ text: (e as Error).message, ok: false });
    }
  };

  const card = 'rounded-2xl bg-[#0c0c0e] border border-white/10 p-5';
  const btn = 'px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer';
  const input = 'w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389]';

  if (error) return <div className={`${card} text-red-300 text-sm`}>Wallet console unavailable: {error}</div>;
  if (!data) return <div className={`${card} text-zinc-400 text-sm`}>Loading wallet console...</div>;

  const s = data.summary;
  const isOwner = data.role === 'owner';

  return (
    <div className="space-y-6">
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${message.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
          {message.text}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Money held in wallets', value: fmt(s.totalBalanceLkr) },
          { label: 'Wallet accounts', value: String(s.accounts) },
          { label: 'Top-ups waiting', value: `${s.pendingTopups} (${fmt(s.pendingTopupsLkr)})` },
          { label: 'Refunds waiting', value: String(s.pendingRefunds) },
          {
            label: 'Ledger check',
            value: s.mismatches.length === 0 ? 'All balances match' : `${s.mismatches.length} MISMATCH`,
            bad: s.mismatches.length > 0,
          },
        ].map((c) => (
          <div key={c.label} className={`${card} !p-4`}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{c.label}</div>
            <div className={`mt-1 text-lg font-bold ${c.bad ? 'text-red-400' : 'text-white'}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Pending top-ups */}
      <div className={card}>
        <h3 className="text-sm font-bold text-white mb-1">Top-ups waiting for you</h3>
        <p className="text-xs text-zinc-500 mb-4">
          Check the amount and reference in your Commercial Bank app first. Approving credits the customer&apos;s wallet.
        </p>
        {data.pendingTopups.length === 0 ? (
          <div className="text-xs text-zinc-500">Nothing waiting.</div>
        ) : (
          <div className="space-y-3">
            {data.pendingTopups.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {fmt(t.amount_lkr)} <span className="text-zinc-400 font-normal">from {t.user_email}</span>
                    </div>
                    <div className="text-xs font-mono text-zinc-400">
                      Bank ref: {t.bank_reference} · {when(t.created_at)}
                    </div>
                  </div>
                  {t.slipViewUrl ? (
                    <a href={t.slipViewUrl} target="_blank" rel="noopener noreferrer" className={`${btn} bg-white/10 text-white hover:bg-white/20`}>
                      View slip
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-500">No slip link</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className={input}
                    placeholder="Note (required to reject)"
                    value={notes[t.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [t.id]: e.target.value })}
                  />
                  <button
                    disabled={busy === t.id}
                    onClick={() => act(t.id, { action: 'approve_topup', id: t.id, note: notes[t.id] || '' }, `Credited ${fmt(t.amount_lkr)} to ${t.user_email}`)}
                    className={`${btn} bg-[#3ad389] text-black`}
                  >
                    Approve
                  </button>
                  <button
                    disabled={busy === t.id}
                    onClick={() => act(t.id, { action: 'reject_topup', id: t.id, note: notes[t.id] || '' }, 'Top-up rejected')}
                    className={`${btn} bg-red-500/20 text-red-300`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending refunds */}
      <div className={card}>
        <h3 className="text-sm font-bold text-white mb-1">Refund requests</h3>
        <p className="text-xs text-zinc-500 mb-4">
          Approved refunds go back to the customer&apos;s WALLET (never the bank) and the V2Ray line is removed. Amounts above{' '}
          {fmt(data.refundOwnerThresholdLkr)} need the owner.
        </p>
        {data.pendingRefunds.length === 0 ? (
          <div className="text-xs text-zinc-500">No requests waiting.</div>
        ) : (
          <div className="space-y-3">
            {data.pendingRefunds.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-white">
                    {r.order_number} <span className="text-zinc-400 font-normal">· {fmt(r.amount_lkr)} · {r.user_email}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">{r.reason_code}</span>
                </div>
                <div className="text-xs text-zinc-300 whitespace-pre-wrap">{r.details}</div>
                <div className="text-[11px] font-mono text-zinc-500">
                  Evidence: {Object.entries(r.evidence || {}).map(([k, v]) => `${k}=${String(v)}`).join(' · ') || 'none'}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className={`${input} sm:max-w-[140px]`}
                    placeholder={`Amount (${r.amount_lkr})`}
                    value={amounts[r.id] || ''}
                    onChange={(e) => setAmounts({ ...amounts, [r.id]: e.target.value })}
                  />
                  <input
                    className={input}
                    placeholder="Note (required)"
                    value={notes[r.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                  />
                  <button
                    disabled={busy === r.id}
                    onClick={() =>
                      act(
                        r.id,
                        { action: 'approve_refund', id: r.id, note: notes[r.id] || '', amount: amounts[r.id] ? Number(amounts[r.id]) : undefined },
                        `Refund approved for ${r.order_number}`
                      )
                    }
                    className={`${btn} bg-[#3ad389] text-black`}
                  >
                    Approve
                  </button>
                  <button
                    disabled={busy === r.id}
                    onClick={() => act(r.id, { action: 'reject_refund', id: r.id, note: notes[r.id] || '' }, 'Refund rejected')}
                    className={`${btn} bg-red-500/20 text-red-300`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All users: pick one to see the wallet and (owner) add or remove money */}
      <div className={card}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-bold text-white">
            All users <span className="text-zinc-500 font-mono text-xs">({usersTotal})</span>
          </h3>
          <input
            className={`${input} sm:max-w-xs`}
            placeholder="Search name or email"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-white/5 rounded-xl border border-white/5">
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setLookupEmail(u.email);
                doLookup(u.email);
                document.getElementById('wallet-lookup')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-white truncate">{u.name || u.email.split('@')[0]}</div>
                <div className="text-[11px] text-zinc-500 truncate">
                  {u.email}
                  {u.role !== 'user' ? ` · ${u.role}` : ''}
                </div>
              </div>
              <div className="text-xs font-mono font-semibold text-white shrink-0">{fmt(u.balance_lkr)}</div>
            </button>
          ))}
          {users.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-zinc-500">{usersLoading ? 'Loading...' : 'No users found.'}</div>
          )}
        </div>
        {usersTotal > users.length && (
          <div className="text-[11px] text-zinc-500 mt-2">Showing the first {users.length}. Search to narrow down.</div>
        )}
      </div>

      {/* User lookup + adjustment */}
      <div id="wallet-lookup" className={card}>
        <h3 className="text-sm font-bold text-white mb-3">Look up a customer&apos;s wallet</h3>
        <div className="flex gap-2">
          <input className={input} placeholder="customer@email.com" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} />
          <button onClick={() => doLookup()} className={`${btn} bg-white text-black`}>
            Find
          </button>
        </div>
        {lookup && (
          <div className="mt-4 space-y-4">
            <div className="text-sm text-white">
              {lookup.user.name} ({lookup.user.email}) — balance <strong>{fmt(lookup.user.balance_lkr)}</strong>
            </div>

            {isOwner ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
                <div className="text-xs font-semibold text-zinc-300">Owner adjustment (logged with your name)</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input className={`${input} sm:max-w-[160px]`} placeholder="+500 or -500" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} />
                  <input className={input} placeholder="Reason (required)" value={adjReason} onChange={(e) => setAdjReason(e.target.value)} />
                  <button
                    disabled={busy === 'adjust'}
                    onClick={() => act('adjust', { action: 'adjust', email: lookup.user.email, amount: Number(adjAmount), reason: adjReason }, 'Balance adjusted')}
                    className={`${btn} bg-amber-400 text-black`}
                  >
                    Apply
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-500">Only the owner can adjust balances.</div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-zinc-500 text-left">
                  <tr>
                    <th className="py-1 pr-3">When</th>
                    <th className="pr-3">Type</th>
                    <th className="pr-3">Amount</th>
                    <th className="pr-3">Balance</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {lookup.history.map((h) => (
                    <tr key={h.id} className="border-t border-white/5 text-zinc-300">
                      <td className="py-1.5 pr-3 whitespace-nowrap">{when(h.created_at)}</td>
                      <td className="pr-3">{h.entry_type}</td>
                      <td className={`pr-3 font-mono ${h.amount_lkr < 0 ? 'text-red-300' : 'text-emerald-300'}`}>{h.amount_lkr > 0 ? '+' : ''}{h.amount_lkr}</td>
                      <td className="pr-3 font-mono">{h.balance_after_lkr}</td>
                      <td className="text-zinc-400">{h.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent top-ups */}
      <div className={card}>
        <h3 className="text-sm font-bold text-white mb-3">Recent top-ups</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-zinc-500 text-left">
              <tr>
                <th className="py-1 pr-3">When</th>
                <th className="pr-3">Customer</th>
                <th className="pr-3">Amount</th>
                <th className="pr-3">Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTopups.map((t) => (
                <tr key={t.id} className="border-t border-white/5 text-zinc-300">
                  <td className="py-1.5 pr-3 whitespace-nowrap">{when(t.created_at)}</td>
                  <td className="pr-3">{t.user_email}</td>
                  <td className="pr-3 font-mono">{fmt(t.amount_lkr)}</td>
                  <td className="pr-3 font-mono">{t.bank_reference}</td>
                  <td>{t.status}{t.review_note ? ` · ${t.review_note}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
