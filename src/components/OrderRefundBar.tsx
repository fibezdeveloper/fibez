'use client';

import React, { useState } from 'react';

const REASONS: Record<string, string> = {
  NOT_WORKING: 'Config / key does not work and could not be fixed',
  WRONG_ITEM: 'Wrong item delivered',
  DUPLICATE_CHARGE: 'Charged twice for the same order',
  SERVICE_OUTAGE: 'Long service outage',
  OTHER_VALID: 'Other valid reason',
};

/**
 * "I received it and it works" / "Report a problem" for a delivered order.
 * Shown only while the 24-hour claim window is open. Confirming closes the window for good.
 */
export default function OrderRefundBar({
  orderNumber,
  refundDeadline,
  onChanged,
}: {
  orderNumber: string;
  refundDeadline: string | null | undefined;
  onChanged?: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('NOT_WORKING');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);

  const hoursLeft = refundDeadline ? Math.max(0, Math.ceil((new Date(refundDeadline).getTime() - Date.now()) / 3600000)) : 0;
  const btn = 'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold disabled:opacity-50 cursor-pointer';

  const call = async (key: string, url: string, body: unknown, okText: (j: any) => string) => {
    setBusy(key);
    setMsg(null);
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Request failed');
      setDone(true);
      setReporting(false);
      setMsg({ text: okText(j), ok: true });
      onChanged?.();
    } catch (e) {
      setMsg({ text: (e as Error).message, ok: false });
    } finally {
      setBusy(null);
    }
  };

  if (done) {
    return msg ? <div className={`text-xs font-mono ${msg.ok ? 'text-emerald-300' : 'text-red-300'}`}>{msg.text}</div> : null;
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-mono text-amber-300">
        Check it now. You have {hoursLeft}h left to confirm it works or report a problem.
      </div>
      {!reporting ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => call('confirm', '/api/orders/confirm', { orderNumber }, () => 'Thanks! Marked as received and working.')}
            disabled={busy === 'confirm'}
            className={`${btn} bg-white/10 text-white hover:bg-white/20`}
          >
            It works — confirm
          </button>
          <button onClick={() => setReporting(true)} className={`${btn} bg-red-500/15 text-red-300 hover:bg-red-500/25`}>
            Report a problem
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-2 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-white">
            {Object.entries(REASONS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            placeholder="What exactly is wrong? (ISP, app, error you see...)"
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-white placeholder-zinc-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => call('report', '/api/wallet/refunds', { orderNumber, reasonCode: reason, details }, (j) => j.message || 'Request sent.')}
              disabled={busy === 'report'}
              className={`${btn} bg-red-500/80 text-white`}
            >
              {busy === 'report' ? 'Sending...' : 'Send refund request'}
            </button>
            <button onClick={() => setReporting(false)} className={`${btn} bg-white/5 text-zinc-300`}>Cancel</button>
          </div>
          <p className="text-[10px] text-zinc-500">
            Approved refunds go back to your wallet. Lines that already used a lot of data are normally not refundable.
          </p>
        </div>
      )}
      {msg && !msg.ok && <div className="text-xs font-mono text-red-300">{msg.text}</div>}
    </div>
  );
}
