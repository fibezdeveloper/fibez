'use client';

import React from 'react';

const ITEMS = [
  'VLESS-REALITY & V2RAY CONFIGS',
  'INSTANT NVME CLOUD VPS',
  'NETFLIX 4K · CHATGPT PLUS · DISCORD NITRO',
  'VERIFIED GLOBAL GAME KEYS',
  'MULTI-TIER RBAC DASHBOARD',
];

export default function ProtocolMarquee() {
  return (
    <div className="relative z-40 select-none">
      {/* 6px Signal Lime Bar */}
      <div className="w-full h-[6px] bg-[var(--color-signal-lime)]" />
      
      {/* Marquee Track */}
      <div className="bg-[var(--color-carbon)] border-b border-[var(--color-graphite)] py-3.5 overflow-hidden">
        <div className="marquee-track font-mono text-[10px] tracking-[0.22em] uppercase text-bone">
          <div className="flex items-center shrink-0">
            {ITEMS.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="px-8">{item}</span>
                <span className="text-[var(--color-signal-lime)]">■</span>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center shrink-0" aria-hidden="true">
            {ITEMS.map((item, idx) => (
              <React.Fragment key={`rep-${idx}`}>
                <span className="px-8">{item}</span>
                <span className="text-[var(--color-signal-lime)]">■</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
