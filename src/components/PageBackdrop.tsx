import React from 'react';

/**
 * Pure-CSS ambient background (no canvas, no WebGL, no JS): soft blue and green glows with a faint dot
 * grid that fades out. Put it as the first child of a `relative isolate` page wrapper.
 */
export default function PageBackdrop({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute -top-40 left-1/2 h-[560px] w-[980px] -translate-x-1/2 rounded-full bg-[#1e3fd8]/25 blur-[140px]" />
      <div className="absolute top-[28%] -left-40 h-[420px] w-[420px] rounded-full bg-[#3ad389]/10 blur-[130px]" />
      <div className="absolute top-[52%] -right-40 h-[460px] w-[460px] rounded-full bg-[#38bdf8]/10 blur-[140px]" />
      <div
        className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:28px_28px]"
        style={{ maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 85%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 85%)' }}
      />
    </div>
  );
}
