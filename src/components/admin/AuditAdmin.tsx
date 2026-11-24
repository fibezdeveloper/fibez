'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface Row {
  id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

/** Read-only trail of staff actions (owner only). */
export default function AuditAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [action, setAction] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '150' });
      if (q.trim()) params.set('q', q.trim());
      if (action) params.set('action', action);
      const res = await fetch(`/api/admin/audit?${params}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load the audit log');
      setRows(json.rows || []);
      setActions(json.actions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the audit log');
    } finally {
      setLoading(false);
    }
  }, [q, action]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-semibold text-white">Audit log</h2>
        <p className="text-xs text-zinc-500">Who did what, newest first. Entries cannot be edited or deleted from here.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          placeholder="Search email, order, detail..."
          className="min-w-[220px] flex-1 rounded-lg border border-[#1f1f23] bg-[#0c0c0e] px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
        />
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-lg border border-[#1f1f23] bg-[#0c0c0e] px-3 py-2 text-xs text-white outline-none"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button onClick={load} className="rounded-lg border border-[#1f1f23] bg-[#0c0c0e] px-3 py-2 text-xs text-zinc-200 hover:border-zinc-600">
          Refresh
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-500/30 px-3 py-2 text-xs text-rose-300">{error}</div>}
      {loading && <div className="font-mono text-xs text-zinc-500">Loading...</div>}

      {!loading && rows.length === 0 && !error && <div className="py-8 text-center text-xs text-zinc-500">No entries match.</div>}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#1f1f23] bg-[#0c0c0e] px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono font-semibold text-white">{r.action}</span>
              <span className="text-zinc-500">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            <div className="mt-1 text-zinc-400">
              {r.user_email || 'system'} on {r.entity_type}
              {r.entity_id ? ` ${r.entity_id}` : ''}
              {r.ip_address ? ` from ${r.ip_address}` : ''}
            </div>
            {r.details && Object.keys(r.details).length > 0 && (
              <div className="mt-1 break-all font-mono text-[11px] text-zinc-500">{JSON.stringify(r.details)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
