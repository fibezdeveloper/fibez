'use client';

import React, { useState } from 'react';
import SecurityRadar from './SecurityRadar';

const ARCHITECTURE_ROWS = [
  {
    num: '01',
    title: 'Zero-exposure key vault',
    body: 'Decrypted credentials and V2Ray connection strings are generated and stored inside an isolated cryptographic envelope. No logs or intermediate servers retain plaintext keys.',
    location: 'USER DEVICE',
  },
  {
    num: '02',
    title: 'Atomic FIFO dispensing',
    body: 'Database row-level concurrency locks ensure each purchased serial key or V2Ray configuration is dispensed strictly once, completely eliminating duplicate sales under burst load.',
    location: 'POSTGRES LOCK',
  },
  {
    num: '03',
    title: 'Dedicated ISP routing edge',
    body: 'V2Ray tunnels route through Singapore & Frankfurt NVMe nodes pre-tuned with custom SNI bug hosts for Dialog, Mobitel, and SLT Fibre networks.',
    location: 'EDGE TRANSIT',
  },
  {
    num: '04',
    title: 'Dual clearance verification',
    body: 'Automated webhook clearance provisions stock in under 3 seconds. Manual bank transfer receipts are audited through our side-by-side terminal verification queue.',
    location: 'CLEARANCE DESK',
  },
];

export default function VaultArchitectureSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-24 border-t border-[var(--color-graphite)]">
      
      {/* Eyebrow & Title Row */}
      <div className="mb-14 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <span className="metadata-stamp text-[10px]">
            [ 01 // ARCHITECTURAL ASSURANCES ]
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white mt-2 leading-[0.96] tracking-[-0.03em]">
            Where the trust{' '}
            <span className="italic text-[var(--color-accent)] font-normal block sm:inline">
              actually sits.
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-8">
          <p className="text-xs sm:text-sm font-mono text-[var(--color-smoke)] max-w-md leading-relaxed">
            Conventional sellers expose shared credentials and delay dispatch by hours. Fibez guarantees deterministic, cryptographic fulfillment with verifiable uptime.
          </p>
          <div className="hidden sm:block">
            <SecurityRadar size={120} />
          </div>
        </div>
      </div>

      {/* Interactive Sliding Rows (zkPass N9 Architecture) */}
      <div className="border-t border-[var(--color-graphite)]">
        {ARCHITECTURE_ROWS.map((row, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={row.num}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="zk-row-hover py-8 border-b border-[var(--color-graphite)] cursor-default"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
                
                {/* Index Column */}
                <div className="md:col-span-1 font-mono text-xs tracking-[0.2em] text-[var(--color-ash)] transition-colors">
                  <span className={isHovered ? 'text-[var(--color-accent)] font-bold' : ''}>
                    {row.num} / 04
                  </span>
                </div>

                {/* Title Column */}
                <div className="md:col-span-5">
                  <h3
                    className={`font-serif text-2xl sm:text-3xl italic tracking-[-0.02em] transition-colors leading-tight ${
                      isHovered ? 'text-[var(--color-accent)]' : 'text-white'
                    }`}
                  >
                    {row.title}
                  </h3>
                </div>

                {/* Description Column */}
                <div className="md:col-span-4">
                  <p className="text-xs sm:text-sm text-[var(--color-smoke)] leading-relaxed font-sans">
                    {row.body}
                  </p>
                </div>

                {/* Location Stamp Column */}
                <div className="md:col-span-2 text-left md:text-right font-mono text-[10px] tracking-wider uppercase text-[var(--color-ash)] transition-colors">
                  <span
                    className={`px-2 py-1 rounded-[2px] border ${
                      isHovered
                        ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                        : 'border-[var(--color-slate)] text-[var(--color-ash)]'
                    }`}
                  >
                    {row.location}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
