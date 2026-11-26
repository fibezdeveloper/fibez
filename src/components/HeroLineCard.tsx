'use client';

import React, { useEffect, useRef, useState } from 'react';
import useDevicePerf from '@/lib/use-device-perf';

/**
 * Phone / tablet hero visual (the 3D cube stays on computers). A "live line" card that cycles through the
 * Sri Lankan networks Fibez supports and counts up a speed from the site's own speedtest showcase.
 * With animations off it shows one settled state, so it never looks empty.
 */
const LINES = [
  // Same figures and captions as the speedtest showcase on /v2ray.
  { isp: 'Dialog', logo: '/images/isps/dialog.svg', network: 'Dialog 4G LTE', mbps: 84.2, note: 'Zoom & Teams unlimited tunnel' },
  { isp: 'SLT-Mobitel', logo: '/images/isps/slt.svg', network: 'SLT Fiber Pro', mbps: 282.5, note: 'YouTube bypass, low jitter' },
  { isp: 'Airtel', logo: '/images/isps/airtel.svg', network: 'Airtel 4G', mbps: 54.3, note: 'Sub-25ms latency' },
  { isp: 'Hutch', logo: '/images/isps/hutch.svg', network: 'Hutch 4G', mbps: 45.6, note: 'v2rayNG mobile hotspot' },
];
const CYCLE_MS = 3200;
const COUNT_MS = 1100;

export default function HeroLineCard() {
  const perf = useDevicePerf();
  const animate = perf.detected && !perf.prefersReducedMotion;
  const [index, setIndex] = useState(1);
  const [speed, setSpeed] = useState(LINES[1].mbps);
  const raf = useRef(0);

  // Cycle the network every few seconds.
  useEffect(() => {
    if (!animate) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % LINES.length), CYCLE_MS);
    return () => window.clearInterval(t);
  }, [animate]);

  // Count the speed up from zero for each network.
  useEffect(() => {
    const target = LINES[index].mbps;
    if (!animate) {
      setSpeed(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setSpeed(target * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [index, animate]);

  const line = LINES[index];
  const fill = Math.min(100, (speed / 300) * 100);

  return (
    <div className="relative w-full max-w-[420px] mx-auto select-none" aria-label="Fibez V2Ray line status">
      {/* glow */}
      <div className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(closest-side,rgba(99,102,241,0.28),transparent)] pointer-events-none" />

      <div className="relative rounded-[28px] border border-white/10 bg-[#0b0b12]/90 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {animate && <span className="absolute inline-flex h-full w-full rounded-full bg-[#3ad389] opacity-60 animate-ping" />}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3ad389]" />
            </span>
            <span className="text-[13px] font-medium text-white">Connected</span>
          </div>
          <span className="font-mono text-[11px] tracking-wider text-zinc-400 uppercase">Singapore SG3</span>
        </div>

        {/* network */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-12 w-[104px] shrink-0 rounded-2xl bg-white/95 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={line.logo}
              src={line.logo}
              alt={line.isp}
              className={`h-7 w-auto max-w-[84px] object-contain ${animate ? 'fz-pop' : ''}`}
            />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">Your SIM</div>
            <div key={line.network} className={`text-[15px] font-semibold text-white truncate ${animate ? 'fz-rise' : ''}`}>
              {line.network}
            </div>
          </div>
        </div>

        {/* speed */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">Download</div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[44px] leading-none font-bold text-white tabular-nums">{speed.toFixed(1)}</span>
              <span className="text-sm text-zinc-400">Mbps</span>
            </div>
          </div>
          <div key={line.note} className={`text-right text-[12px] leading-snug text-[#3ad389] max-w-[46%] ${animate ? 'fz-rise' : ''}`}>
            {line.note}
          </div>
        </div>

        {/* bar */}
        <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-[#3ad389]"
            style={{ width: `${fill}%` }}
          />
        </div>

        {/* network dots */}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[11px] text-zinc-500">VLESS · TLS · Unthrottled</span>
          <div className="flex gap-1.5">
            {LINES.map((l, i) => (
              <span key={l.isp} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/25'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[11px] text-[#6e727a] tracking-wider uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span>Real customer speedtests</span>
      </div>
    </div>
  );
}
