'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PurchasedV2RayLine } from '@/lib/v2ray-lines';
import OrderRefundBar from '@/components/OrderRefundBar';


/** Renew from the wallet, confirm "it works", or report a problem (refund request, 24h window). */
export default function LineActions({ line, onChanged }: { line: PurchasedV2RayLine; onChanged: () => void }) {
  const [quotes, setQuotes] = useState<{ months: number; priceLKR: number }[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    setMsg(null);
    if (!line.renewable) {
      setQuotes([]);
      return;
    }
    fetch(`/api/v2ray/renew?uuid=${encodeURIComponent(line.uuid)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setQuotes(d.quotes || []);
        setBalance(typeof d.balanceLkr === 'number' ? d.balanceLkr : null);
        if (d.quotes?.[0]) setMonths(d.quotes[0].months);
      })
      .catch(() => {});
  }, [line.uuid, line.renewable]);

  const quote = quotes.find((q) => q.months === months);

  const renew = async () => {
    setBusy('renew');
    setMsg(null);
    try {
      const r = await fetch('/api/v2ray/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: line.uuid, months }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Renewal failed');
      setMsg({ text: `Renewed. Charged Rs. ${j.chargedLkr}. New expiry ${new Date(j.newExpiry).toLocaleDateString()}.`, ok: true });
      setBalance(j.balanceLkr);
      onChanged();
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false });
    } finally {
      setBusy(null);
    }
  };

  if (!line.renewable && !line.refundable && !msg) return null;

  const btn = 'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold disabled:opacity-50 cursor-pointer';

  return (
    <div className="mt-4 p-4 rounded-[14px] bg-[#09090c] border border-[#1b1b20] space-y-3">
      {line.expiresAt && (
        <div className="text-[11px] font-mono text-zinc-400">
          Line expires: <span className="text-white">{new Date(line.expiresAt).toLocaleString()}</span>
        </div>
      )}

      {line.renewable && quotes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-zinc-300">Renew from wallet:</span>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="px-2 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-white"
          >
            {quotes.map((q) => (
              <option key={q.months} value={q.months}>
                {q.months} month{q.months > 1 ? 's' : ''} — Rs. {q.priceLKR.toLocaleString()}
              </option>
            ))}
          </select>
          <button onClick={renew} disabled={busy === 'renew' || (balance !== null && quote !== undefined && balance < quote.priceLKR)} className={`${btn} bg-[#3ad389] text-black`}>
            {busy === 'renew' ? 'Renewing...' : 'Renew now'}
          </button>
          <span className="text-[11px] font-mono text-zinc-500">
            Balance: Rs. {balance === null ? '...' : balance.toLocaleString()}
            {balance !== null && quote && balance < quote.priceLKR && (
              <> · <Link href="/billing" className="text-[#3ad389] underline">Top up</Link></>
            )}
          </span>
        </div>
      )}

      {line.refundable && (
        <OrderRefundBar orderNumber={line.orderNumber} refundDeadline={line.refundDeadline} onChanged={onChanged} />
      )}

      {msg && (
        <div className={`text-xs font-mono ${msg.ok ? 'text-emerald-300' : 'text-red-300'}`}>{msg.text}</div>
      )}
    </div>
  );
}
