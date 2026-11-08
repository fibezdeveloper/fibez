'use client';

import React from 'react';
import HeroCube from '@/components/HeroCube';
import GradientASCII from '@/components/GradientASCII';
import { ArrowRight, ChevronRight, Terminal, ShieldCheck, Zap } from 'lucide-react';

export default function Hero({
  onExploreCatalog,
}: {
  onExploreCatalog?: () => void;
}) {
  return (
    <section className="relative w-full pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-black">
      
      {/* Interactive GradientASCII Background from React Bits */}
      <div className="absolute inset-0 z-0 pointer-events-auto overflow-hidden">
        <GradientASCII
          colors={['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']}
          shape="horizon"
          characters=" =+xX0S8#@"
          cellSize={18}
          density={0.8}
        />
        {/* Deep vignette at the top so top bar is pure clean dark with no weird gradient bleed */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-black/40 to-black" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pointer-events-none">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Display Typography */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-7 pointer-events-auto">
            
            {/* Editorial Serif Display Headline */}
            <h1 className="font-serif text-[56px] sm:text-[72px] lg:text-[84px] leading-[1.02] tracking-[-0.01em] text-white font-normal drop-shadow-sm">
              Digital delivery <br />
              <span className="italic font-normal text-[#f0f0f0]">for developers.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-[17px] sm:text-[19px] leading-[1.5] text-[#a1a4a5] max-w-xl font-normal">
              The high-velocity automated marketplace and key vault for V2Ray VPN configurations, NVMe Cloud VPS, developer subscriptions, and global game licenses.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreCatalog || (() => {
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                })}
                className="btn-action-resend text-[15px] px-5 py-2.5 shadow-lg"
              >
                <span>Explore marketplace</span>
                <span className="text-sm">›</span>
              </button>

              <a
                href="#api"
                className="btn-ghost-resend text-[15px] px-5 py-2.5 text-[#f0f0f0] backdrop-blur-md bg-black/40"
              >
                <Terminal className="w-4 h-4 text-[#9281f7]" />
                <span>API Reference</span>
              </a>
            </div>

            {/* Minimal Metrics Row */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#292d30] w-full max-w-lg backdrop-blur-xs">
              <div>
                <div className="font-mono text-xl text-white font-medium">&lt; 350ms</div>
                <div className="text-xs text-[#a1a4a5] font-sans mt-0.5">Average dispatch</div>
              </div>
              <div>
                <div className="font-mono text-xl text-white font-medium">99.99%</div>
                <div className="text-xs text-[#a1a4a5] font-sans mt-0.5">Automated uptime</div>
              </div>
              <div>
                <div className="font-mono text-xl text-white font-medium">AES-256</div>
                <div className="text-xs text-[#a1a4a5] font-sans mt-0.5">Zero-trust vault</div>
              </div>
            </div>

          </div>

          {/* Right Column: WebGL Sculptural 3D Cube */}
          <div className="lg:col-span-5 flex items-center justify-center pointer-events-auto">
            <div className="relative w-full max-w-[440px]">
              <HeroCube />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
