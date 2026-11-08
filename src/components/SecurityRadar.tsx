'use client';

import React from 'react';

/**
 * SecurityRadar
 * Reverse-engineered from zkPass orbital security graphics
 * Concentric dashed rings rotating in opposite directions with pulsing node beacons.
 */
export default function SecurityRadar({ size = 160 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center select-none pointer-events-none"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer Counter-Clockwise Ring */}
      <div
        className="absolute inset-0 rounded-full border border-dashed border-[var(--color-graphite)]"
        style={{ animation: 'zkSecurityRotateReverse 24s linear infinite' }}
      >
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--color-ash)]" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-slate)]" />
      </div>

      {/* Middle Clockwise Ring */}
      <div
        className="absolute inset-3 rounded-full border border-dashed border-[var(--color-slate)]"
        style={{
          animation: 'zkSecurityRotate 16s linear infinite',
        }}
      >
        <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
      </div>

      {/* Inner Fast Counter-Clockwise Ring */}
      <div
        className="absolute inset-7 rounded-full border border-[var(--color-iron)]"
        style={{ animation: 'zkSecurityRotateReverse 10s linear infinite' }}
      >
        <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]/80" />
      </div>

      {/* Center Core Beacon */}
      <div className="relative w-8 h-8 rounded-full bg-[var(--color-onyx)] border border-[var(--color-accent)] flex items-center justify-center shadow-[0_0_12px_rgba(197,255,74,0.4)]">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] animate-ping opacity-75" />
        <span className="absolute w-2 h-2 rounded-full bg-[var(--color-accent)]" />
      </div>
    </div>
  );
}
