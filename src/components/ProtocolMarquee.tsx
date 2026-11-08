'use client';

import React from 'react';

const PROTOCOLS = [
  'V2RAY VLESS-REALITY',
  'SLT FIBRE OPTIMIZED SNI',
  'DIALOG 4G/5G BYPASS',
  'MOBITEL ANYCAST ROUTING',
  'FRANKFURT 10GBPS TRANSIT',
  'SINGAPORE NVME COMPUTE',
  'CHATGPT PLUS GPT-4o',
  'NETFLIX 4K UHD ULTRA',
  'DISCORD NITRO 2X BOOST',
  'MINECRAFT JAVA OFFICIAL',
  'STEAM WALLET INSTANT KEY',
  'ATOMIC FIFO DISPENSE',
  'AES-256 VAULT ENCRYPTION',
];

export default function ProtocolMarquee() {
  return (
    <div className="w-full overflow-hidden border-y border-[var(--color-graphite)] bg-black/60 py-3 backdrop-blur-sm select-none">
      <div className="flex w-max" style={{ animation: 'marquee 35s linear infinite' }}>
        {[...PROTOCOLS, ...PROTOCOLS].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-6 px-6 font-mono text-[11px] tracking-[0.18em] text-[var(--color-ash)] uppercase whitespace-nowrap group hover:text-white transition-colors"
          >
            <span className="text-[var(--color-accent)] font-bold">+</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
