'use client';

import React, { useState, useEffect } from 'react';
import { runCipherDecode } from '@/lib/cipher';

export default function InspectorPill() {
  const [stage, setStage] = useState('PORTAL: 72×72 LOGO TILE');

  useEffect(() => {
    const handleStage = (e: any) => {
      if (e.detail) setStage(e.detail);
    };
    window.addEventListener('fibez:portal-stage', handleStage);
    return () => window.removeEventListener('fibez:portal-stage', handleStage);
  }, []);

  const handleDemoPortalZoom = () => {
    const track = document.getElementById('hero-scroll-track');
    if (!track) return;

    window.scrollTo({ top: 0, behavior: 'instant' });
    let step = 0;
    const targetScroll = track.offsetHeight - window.innerHeight;

    function autoScroll() {
      step += 0.008;
      window.scrollTo(0, step * targetScroll);
      if (step < 0.78) {
        requestAnimationFrame(autoScroll);
      }
    }
    requestAnimationFrame(autoScroll);
  };

  const handleScrambleCipher = () => {
    document.querySelectorAll('[data-text]').forEach((el) => {
      const targetText = el.getAttribute('data-text');
      if (targetText && el instanceof HTMLElement) {
        runCipherDecode(el, targetText, 650);
      }
    });
  };

  return (
    <div
      id="inspector-pill"
      className="fixed bottom-4 left-4 z-50 bg-voidBlack/95 backdrop-blur-md border border-graphite px-4 py-2.5 rounded-[4px] flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.14em] text-bone shadow-2xl select-none"
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-signalLime glow-lime"></span>
        <span className="text-chalk font-semibold">FIBEZ ENGINE</span>
      </div>
      <span className="text-graphite">|</span>
      <span id="portal-stage-readout" className="text-signalLime max-w-[200px] truncate sm:max-w-none">
        {stage}
      </span>
      <span className="text-graphite">|</span>
      <button
        id="replay-portal-btn"
        onClick={handleDemoPortalZoom}
        className="px-2 py-1 bg-onyx border border-slate hover:border-signalLime text-bone hover:text-signalLime rounded-[2px] transition-colors"
      >
        DEMO PORTAL ZOOM
      </button>
      <button
        id="trigger-cipher-btn"
        onClick={handleScrambleCipher}
        className="px-2 py-1 bg-onyx border border-slate hover:border-signalLime text-bone hover:text-signalLime rounded-[2px] transition-colors"
      >
        SCRAMBLE CIPHER
      </button>
    </div>
  );
}
