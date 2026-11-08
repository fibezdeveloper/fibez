'use client';

import React from 'react';

const COMPARISON_DATA = [
  {
    standard: 'Manual seller response (2-6 hour delay)',
    fibez: 'Instant automated vault decryption (< 3 seconds)',
  },
  {
    standard: 'Shared plaintext passwords sent in unencrypted chat',
    fibez: 'Private AES-256 encrypted Key Vault with one-click reveal',
  },
  {
    standard: 'Generic congested VPN servers with frequent bans',
    fibez: 'Dedicated ISP SNI bypass nodes (Dialog / Mobitel / SLT)',
  },
  {
    standard: 'No QR code import for mobile devices',
    fibez: 'Vector mobile QR generation for v2rayNG & Streisand',
  },
  {
    standard: 'Unrecorded bank slip submissions with lost orders',
    fibez: 'Side-by-side slip audit ledger with immutable order refs',
  },
  {
    standard: 'Disputed replacements on forced account lockouts',
    fibez: '100% subscription replacement warranty for full duration',
  },
];

export default function ComparisonTable() {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-20 border-t border-[var(--color-graphite)]">
      
      {/* Header */}
      <div className="mb-12">
        <span className="metadata-stamp text-[10px]">
          [ 02 // PARADIGM COMPARISON ]
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white mt-2 leading-[0.98] tracking-[-0.03em]">
          Conventional marketplaces sell promises.{' '}
          <span className="italic text-[var(--color-accent)] font-normal block sm:inline">
            Fibez proves delivery.
          </span>
        </h2>
      </div>

      {/* Comparison Grid (Exact zkPass Ns Structure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-[var(--color-graphite)] bg-[var(--color-carbon)] rounded-[2px] overflow-hidden">
        
        {/* Left Column Header (Standard) */}
        <div className="p-4 sm:p-5 border-b md:border-r border-[var(--color-graphite)] flex items-center gap-3 bg-[var(--color-onyx)]/50">
          <span className="w-2 h-2 rounded-full bg-[var(--color-ash)]" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-ash)]">
            CONVENTIONAL DIGITAL RESELLERS
          </span>
        </div>

        {/* Right Column Header (Fibez) */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-graphite)] flex items-center gap-3 bg-[var(--color-accent-subtle)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_6px_var(--color-accent)]" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] font-bold">
            FIBEZ AUTOMATED VAULT
          </span>
        </div>

        {/* Comparison Rows */}
        {COMPARISON_DATA.map((row, idx) => {
          const isLast = idx === COMPARISON_DATA.length - 1;
          return (
            <React.Fragment key={idx}>
              
              {/* Left Cell (Strikethrough) */}
              <div
                className={`p-4 sm:p-6 md:border-r border-[var(--color-graphite)] ${
                  !isLast ? 'border-b' : ''
                } font-serif text-sm sm:text-base text-[var(--color-ash)] line-through decoration-[rgba(122,122,122,0.4)] flex items-center`}
              >
                {row.standard}
              </div>

              {/* Right Cell (Italic Signal Accent) */}
              <div
                className={`p-4 sm:p-6 ${
                  !isLast ? 'border-b' : ''
                } border-[var(--color-graphite)] font-serif text-sm sm:text-base text-white italic bg-[var(--color-accent-subtle)]/40 flex items-center`}
              >
                <span className="text-[var(--color-accent)] mr-2 not-italic font-bold font-mono text-xs">
                  ✓
                </span>
                <span>{row.fibez}</span>
              </div>

            </React.Fragment>
          );
        })}

      </div>

    </section>
  );
}
