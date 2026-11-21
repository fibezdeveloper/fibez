'use client';

import React from 'react';
import Link from 'next/link';
import HeroCube from '@/components/HeroCube';
import GradientASCII from '@/components/GradientASCII';
import { ShieldCheck } from 'lucide-react';
import { FlipText } from '@/components/ui/FlipText';
import { TextAnimation } from '@/components/ui/TextAnimation';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

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
          glyphOpacity={0.85}
          glow={0.2}
          depthOfField={0}
          flicker={0.2}
          softness={0.5}
          scale={1}
          flow={0.5}
          speed={1}
          gradientOpacity={0.9}
          grain={0.08}
          variation={0}
          mouseInteraction
          scrambleRadius={0.1}
          clickEffect="wave"
          intro
          lightMode={false}
        />
        {/* Deep vignette at the top so top bar is pure clean dark with no weird gradient bleed */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-black/30 to-black" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pointer-events-none">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Display Typography */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-7 pointer-events-auto">
            
            {/* Editorial Serif Display Headline with Vengeance UI FlipText */}
            <h1 className="font-serif text-[52px] sm:text-[68px] lg:text-[80px] leading-[1.08] tracking-[-0.01em] text-white font-normal drop-shadow-sm select-none">
              <span className="block">
                <FlipText duration={2.2} delay={0.1}>
                  Digital products,
                </FlipText>
              </span>
              <span className="block italic font-normal text-[#f0f0f0]">
                <FlipText duration={2.2} delay={0.45}>
                  delivered in seconds.
                </FlipText>
              </span>
            </h1>

            {/* Sub-headline with Staggered Word Slide-in Animation */}
            <p className="text-[17px] sm:text-[19px] leading-[1.5] text-[#a1a4a5] max-w-xl font-normal">
              <TextAnimation delay={0.6} divideBy="word">
                Instant gift cards, streaming subscriptions, game top-ups, software keys, and high-speed VLESS VPN — sent straight to your email and vault.
              </TextAnimation>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <AnimatedButton
                onClick={onExploreCatalog || (() => {
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                })}
                className="bg-white text-black font-semibold text-[15px] px-6 py-2.5 rounded-full border-none shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:bg-[#eaeaea] [--shine:rgba(0,0,0,0.5)] cursor-pointer"
              >
                <span>Shop All Products</span>
                <span className="text-sm ml-1">›</span>
              </AnimatedButton>

              <AnimatedButton
                as="a"
                href="/v2ray"
                className="text-[15px] px-5 py-2.5 text-[#f0f0f0] backdrop-blur-md bg-black/60 border border-[#292d30] hover:border-[#464a4d] rounded-full gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#3ad389]" />
                <span>High-Speed VLESS VPN</span>
              </AnimatedButton>
            </div>

            {/* Minimal Metrics Row */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#292d30] w-full max-w-lg backdrop-blur-xs">
              <div>
                <div className="font-mono text-xl text-white font-medium">LKR</div>
                <div className="text-xs text-[#a1a4a5] font-sans mt-0.5">Bank transfer &amp; wallet</div>
              </div>
              <div>
                <div className="font-mono text-xl text-white font-medium">Instant</div>
                <div className="text-xs text-[#a1a4a5] font-sans mt-0.5">Email &amp; vault delivery</div>
              </div>
              <div>
                <div className="font-mono text-xl text-white font-medium">24h</div>
                <div className="text-xs text-[#a1a4a5] font-sans mt-0.5">Replacement guarantee</div>
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
