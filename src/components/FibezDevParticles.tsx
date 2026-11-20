'use client';

import React from 'react';
import InteractiveParticles from '@/components/ui/InteractiveParticles';

export default function FibezDevParticles() {
  return (
    <section className="w-full py-6 sm:py-8 bg-black overflow-hidden border-b border-[#1b1c20]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="relative rounded-[20px] bg-[#060608] border border-[#1c1c24] overflow-hidden shadow-2xl h-[170px] sm:h-[210px] group transition-all duration-300 hover:border-[#2a2a38]">
          {/* GPU Interactive Particles Canvas */}
          <InteractiveParticles
            src="/images/fibez-developers.svg"
            allowUpload={false}
            maxDimension={320}
            size={1.15}
            randomness={1.6}
            depth={2.8}
            touchRadius={0.18}
            background="#050507"
            className="w-full h-full"
          />

          {/* Vignettes for luxury depth */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-black/70" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/50 via-transparent to-black/50" />

          {/* Interactive Hint & Status */}
          <div className="absolute bottom-2.5 left-4 sm:left-5 pointer-events-none flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389] animate-pulse" />
            <span className="font-mono text-[10px] text-zinc-500 tracking-wider">
              FibezDevelopers // GPU Particle Field
            </span>
          </div>

          <div className="absolute top-2.5 right-4 sm:right-5 pointer-events-none hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
            <span>Hover to scatter</span>
          </div>
        </div>
      </div>
    </section>
  );
}
