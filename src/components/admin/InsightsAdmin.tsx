'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface Insights {
  days: number;
  totals: { orders: number; revenueLKR: number; discountsLKR: number; avgOrderLKR: number };
  daily: { day: string; orders: number; revenueLKR: number }[];
  packages: { title: string; sold: number; revenueLKR: number }[];
  refunds: { orders: number; amountLKR: number };
  pending: { orders: number; topups: number; refunds: number };
  wallets: { totalLKR: number; holders: number };
  inbounds: {
    id: number;
    remark: string;
    port: number;
    enable: boolean;
    panelClients: number;
    activeLines: number;
    limit: number;
    usedPct: number;
    level: 'ok' | 'warn' | 'full';
  }[];
  panelReachable: boolean;
  inboundLimit: number;
  role: 'admin' | 'owner';
}

const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;
const card = 'rounded-2xl border border-[#1f1f23] bg-[#0c0c0e] p-4';
const label = 'text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500';

/** Revenue, refunds, package sales and panel capacity in one place. */
export default function InsightsAdmin() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/insights?days=${days}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load insights');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load insights');
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  async function backupNow() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup_now' }),
      });
      const json = await res.json().catch(() => ({}));
      setNote(
        res.ok
          ? { ok: true, text: `Backup sent to your admin Telegram chat (${Math.round((json.bytes || 0) / 1024)} KB).` }
          : { ok: false, text: json.error || 'Backup failed.' }
      );
    } catch {
      setNote({ ok: false, text: 'Backup request failed.' });
    } finally {
      setBusy(false);
    }
  }

  const maxRev = data ? Math.max(1, ...data.daily.map((d) => d.revenueLKR)) : 1;
  const warnings = data?.inbounds.filter((i) => i.level !== 'ok') ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Insights</h2>
          <p className="text-xs text-zinc-500">Paid, verified orders only (free trials and grants are left out). Capacity compares each inbound against {data?.inboundLimit ?? 250} clients.</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-mono transition-colors ${
                days === d ? 'border-[#3ad389]/50 bg-[#0c0c0e] text-white' : 'border-[#1f1f23] text-zinc-400 hover:text-white'
              }`}
            >
              {d}d
            </button>
          ))}
          {data?.role === 'owner' && (
            <button
              onClick={backupNow}
              disabled={busy}
              className="rounded-lg border border-[#1f1f23] bg-[#0c0c0e] px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-600 disabled:opacity-50"
            >
              {busy ? 'Backing up...' : 'Back up panel now'}
            </button>
          )}
        </div>
      </div>

      {note && <div className={`rounded-xl border px-3 py-2 text-xs ${note.ok ? 'border-emerald-500/30 text-emerald-300' : 'border-rose-500/30 text-rose-300'}`}>{note.text}</div>}
      {error && <div className="rounded-xl border border-rose-500/30 px-3 py-2 text-xs text-rose-300">{error}</div>}
      {!data && !error && <div className="font-mono text-xs text-zinc-500">Loading...</div>}

      {data && (
        <>
          {(warnings.length > 0 || !data.panelReachable) && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
              {!data.panelReachable && <div>The panel could not be reached, so live capacity is unknown.</div>}
              {warnings.map((w) => (
                <div key={w.id}>
                  Inbound {w.id} ({w.remark}, port {w.port}) is {w.level === 'full' ? 'FULL' : 'close to full'}: {w.panelClients} of {w.limit} clients ({w.usedPct}%). Add another inbound before selling more on it.
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className={card}>
              <div className={label}>Revenue ({data.days}d)</div>
              <div className="mt-1 text-xl font-semibold text-white">{rs(data.totals.revenueLKR)}</div>
              <div className="text-[11px] text-zinc-500">{data.totals.orders} orders, avg {rs(data.totals.avgOrderLKR)}</div>
            </div>
            <div className={card}>
              <div className={label}>Discounts given</div>
              <div className="mt-1 text-xl font-semibold text-white">{rs(data.totals.discountsLKR)}</div>
              <div className="text-[11px] text-zinc-500">promo, referral and bundle</div>
            </div>
            <div className={card}>
              <div className={label}>Refunds ({data.days}d)</div>
              <div className="mt-1 text-xl font-semibold text-white">{rs(data.refunds.amountLKR)}</div>
              <div className="text-[11px] text-zinc-500">{data.refunds.orders} orders</div>
            </div>
            <div className={card}>
              <div className={label}>Wallet balances owed</div>
              <div className="mt-1 text-xl font-semibold text-white">{rs(data.wallets.totalLKR)}</div>
              <div className="text-[11px] text-zinc-500">{data.wallets.holders} customers hold a balance</div>
            </div>
          </div>

          <div className={card}>
            <div className="mb-3 flex items-center justify-between">
              <div className={label}>Revenue per day</div>
              <div className="text-[11px] text-zinc-500">
                waiting: {data.pending.orders} orders, {data.pending.topups} top-ups, {data.pending.refunds} refunds
              </div>
            </div>
            {data.daily.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">No verified sales in this period.</div>
            ) : (
              <div className="flex h-32 items-end gap-1">
                {data.daily.map((d) => (
                  <div key={d.day} className="group relative flex-1" title={`${d.day}: ${rs(d.revenueLKR)} (${d.orders} orders)`}>
                    <div className="w-full rounded-t bg-[#3ad389]/70 group-hover:bg-[#3ad389]" style={{ height: `${Math.max(4, (d.revenueLKR / maxRev) * 100)}%` }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className={card}>
              <div className={`${label} mb-3`}>Sales per package</div>
              {data.packages.length === 0 ? (
                <div className="py-4 text-xs text-zinc-500">Nothing sold yet in this period.</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-zinc-500">
                      <th className="pb-2 font-normal">Package</th>
                      <th className="pb-2 text-right font-normal">Sold</th>
                      <th className="pb-2 text-right font-normal">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.packages.map((p) => (
                      <tr key={p.title} className="border-t border-[#1f1f23] text-zinc-200">
                        <td className="py-1.5 pr-2">{p.title}</td>
                        <td className="py-1.5 text-right font-mono">{p.sold}</td>
                        <td className="py-1.5 text-right font-mono">{rs(p.revenueLKR)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className={card}>
              <div className={`${label} mb-3`}>Capacity per inbound</div>
              {data.inbounds.length === 0 ? (
                <div className="py-4 text-xs text-zinc-500">{data.panelReachable ? 'No inbounds on the panel.' : 'Panel not reachable.'}</div>
              ) : (
                <div className="space-y-3">
                  {data.inbounds.map((i) => (
                    <div key={i.id}>
                      <div className="mb-1 flex justify-between text-xs text-zinc-300">
                        <span>
                          #{i.id} {i.remark} <span className="text-zinc-500">:{i.port}{i.enable ? '' : ' (off)'}</span>
                        </span>
                        <span className="font-mono">
                          {i.panelClients}/{i.limit}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full ${i.level === 'full' ? 'bg-rose-500' : i.level === 'warn' ? 'bg-amber-400' : 'bg-[#3ad389]'}`}
                          style={{ width: `${Math.min(100, i.usedPct)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
