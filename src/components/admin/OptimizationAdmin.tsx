'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Smartphone, Tablet } from 'lucide-react';
import { detectDeviceClass, resolveMotion, type DeviceClass } from '@/lib/motion';
import type { MotionMode, MotionSettings } from '@/lib/use-site-flags';

const MODES: { id: MotionMode; label: string; hint: string }[] = [
  { id: 'auto', label: 'Auto', hint: 'Full animations on strong devices, none on old or budget ones' },
  { id: 'full', label: 'Full', hint: 'Every animation, WebGL backgrounds and glass blur' },
  { id: 'lite', label: 'Lite', hint: 'Simple animations only. No WebGL backgrounds or blur' },
  { id: 'off', label: 'Off', hint: 'No animations at all. Fastest' },
];

const DEVICES: { id: DeviceClass; label: string; icon: React.ComponentType<{ className?: string }>; note: string }[] = [
  { id: 'phone', label: 'Phones', icon: Smartphone, note: 'Most of your customers. Lite or Auto keeps older phones smooth.' },
  { id: 'tablet', label: 'Tablets', icon: Tablet, note: 'iPads and Android tablets.' },
];

/** Owner switch: how much animation phones, tablets and computers get. Visitors' reduce-motion setting always wins. */
export default function OptimizationAdmin() {
  const [saved, setSaved] = useState<MotionSettings | null>(null);
  const [draft, setDraft] = useState<MotionSettings | null>(null);
  const [role, setRole] = useState<'admin' | 'owner'>('admin');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [thisDevice, setThisDevice] = useState<DeviceClass>('desktop');

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/site-pages', { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    const m: MotionSettings = j.motion || { phone: 'auto', tablet: 'auto', desktop: 'auto' };
    setSaved(m);
    setDraft(m);
    setRole(j.role === 'owner' ? 'owner' : 'admin');
  }, []);

  useEffect(() => {
    load();
    setThisDevice(detectDeviceClass());
  }, [load]);

  const dirty = saved && draft && (['phone', 'tablet'] as const).some((k) => saved[k] !== draft[k]);

  async function save() {
    if (!draft) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch('/api/admin/site-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motion: draft }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Could not save');
      setSaved(j.motion);
      setDraft(j.motion);
      setMsg({ ok: true, text: 'Saved. Visitors get the new level on their next page load.' });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not save' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-semibold text-white">Optimization</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Choose how much animation phones and tablets get. Computers always get the full animations. Lighter settings make the site
          faster and smoother on phones. A visitor who turned on &ldquo;reduce motion&rdquo; on their own phone always gets no animation.
        </p>
      </div>

      {!draft ? (
        <div className="font-mono text-xs text-zinc-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {DEVICES.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.id} className="rounded-2xl border border-[#1f1f23] bg-[#0c0c0e] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-semibold text-white">{d.label}</span>
                    {thisDevice === d.id && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#3ad389]/10 text-[#3ad389] border border-[#3ad389]/25">
                        this device
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500">{d.note}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MODES.map((m) => {
                    const active = draft[d.id] === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={role !== 'owner'}
                        onClick={() => setDraft({ ...draft, [d.id]: m.id })}
                        className={`text-left rounded-xl border px-3 py-2.5 transition-colors disabled:cursor-not-allowed ${
                          active ? 'border-[#3ad389]/60 bg-[#3ad389]/5' : 'border-[#1f1f23] hover:border-zinc-600'
                        }`}
                      >
                        <div className={`text-xs font-mono font-semibold ${active ? 'text-[#3ad389]' : 'text-white'}`}>{m.label}</div>
                        <div className="text-[10.5px] text-zinc-500 mt-0.5 leading-snug">{m.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-zinc-500">
              This device is a <span className="text-zinc-300">{thisDevice}</span> and would get{' '}
              <span className="text-zinc-300">{resolveMotion(draft, thisDevice)}</span> with these settings.
            </div>
            {role === 'owner' ? (
              <button
                type="button"
                onClick={save}
                disabled={busy || !dirty}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold font-mono disabled:opacity-40"
              >
                {busy ? 'Saving...' : 'Save'}
              </button>
            ) : (
              <span className="text-[11px] text-zinc-500">Only the owner can change this.</span>
            )}
          </div>
          {msg && <div className={`text-xs ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.text}</div>}
        </div>
      )}
    </div>
  );
}
