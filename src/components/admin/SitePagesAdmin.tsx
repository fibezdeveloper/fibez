'use client';

import React, { useCallback, useEffect, useState } from 'react';

type Flags = Record<string, boolean>;
interface Def {
  key: string;
  label: string;
  description: string;
}

const PRESETS: { label: string; hint: string; flags: Flags }[] = [
  {
    label: 'V2Ray only',
    hint: 'Only the V2Ray store and dashboard are open. Shop, tickets, FAQ and docs disappear.',
    flags: { shop: false, v2ray: true, tickets: false, docs: false, faq: false, infrastructure: false },
  },
  {
    label: 'V2Ray + support',
    hint: 'V2Ray store plus tickets, FAQ and docs so customers can get help.',
    flags: { shop: false, v2ray: true, tickets: true, docs: true, faq: true, infrastructure: false },
  },
  {
    label: 'Open everything',
    hint: 'Every section is live.',
    flags: { shop: true, v2ray: true, tickets: true, docs: true, faq: true, infrastructure: true },
  },
];

/** Switch whole sections of the website on or off. Staff always see everything. */
export default function SitePagesAdmin() {
  const [defs, setDefs] = useState<Def[]>([]);
  const [flags, setFlags] = useState<Flags>({});
  const [saved, setSaved] = useState<Flags>({});
  const [role, setRole] = useState<'admin' | 'owner'>('admin');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/site-pages', { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    setDefs(j.defs || []);
    setFlags(j.pages || {});
    setSaved(j.pages || {});
    setRole(j.role === 'owner' ? 'owner' : 'admin');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = defs.some((d) => flags[d.key] !== saved[d.key]);
  const canEdit = role === 'owner';

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch('/api/admin/site-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: flags }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Could not save');
      setSaved(j.pages);
      setFlags(j.pages);
      setMsg({ ok: true, text: 'Saved. Visitors see the change within a few seconds.' });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Site pages</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Choose which parts of the website visitors can open. Switched-off sections do not exist for visitors: the page gives a 404 and every
          link to it is hidden. Staff accounts always see everything, and you can switch a section back on any time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={!canEdit}
            onClick={() => setFlags({ ...flags, ...p.flags })}
            className="text-left p-4 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-[#3ad389]/50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <div className="text-sm font-semibold text-white">{p.label}</div>
            <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{p.hint}</div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] divide-y divide-[#1a1a20]">
        {defs.map((d) => {
          const on = flags[d.key] !== false;
          return (
            <div key={d.key} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">{d.label}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{d.description}</div>
              </div>
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setFlags({ ...flags, [d.key]: !on })}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer disabled:opacity-50 ${
                  on ? 'bg-[#3ad389]' : 'bg-zinc-800'
                }`}
                aria-pressed={on}
                title={on ? 'Open to visitors' : 'Hidden from visitors'}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-black shadow transition-transform ${
                    on ? 'translate-x-5' : 'translate-x-0 bg-zinc-400'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!canEdit || !dirty || busy}
          className="px-5 py-2 rounded-xl bg-[#3ad389] text-black text-sm font-semibold disabled:opacity-40 cursor-pointer"
        >
          {busy ? 'Saving...' : 'Save changes'}
        </button>
        {dirty && (
          <button type="button" onClick={() => setFlags(saved)} className="text-xs font-mono text-zinc-400 hover:text-white cursor-pointer">
            Discard
          </button>
        )}
        {!canEdit && <span className="text-xs text-zinc-500">Only the owner can change this.</span>}
        {msg && <span className={`text-xs font-mono ${msg.ok ? 'text-emerald-300' : 'text-red-300'}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
