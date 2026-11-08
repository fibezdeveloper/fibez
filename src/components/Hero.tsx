'use client';

import React from 'react';
import DottedGlobe from './DottedGlobe';
import { Search, Zap, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { CATEGORIES } from '@/lib/products-data';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export default function Hero({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden pt-12 md:pt-20 pb-16 bg-[var(--color-carbon)]">
      
      {/* Background Dotted Pointillist Globe */}
      <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none">
        <DottedGlobe className="max-w-[1100px] -translate-y-6" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10">
        
        {/* Metadata Eyebrow Stamp */}
        <div className="metadata-stamp mb-6 inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-onyx)]/60 border border-[var(--color-graphite)] rounded-[2px] backdrop-blur-sm">
          <span>[ CLASSIFIED VAULT // ZERO-LATENCY CLEARANCE ]</span>
        </div>

        {/* Display Headline with Whisper-weight PT Serif & Italic Accent Word */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[78px] font-normal tracking-[-0.03em] leading-[0.98] text-white max-w-4xl mb-6">
          Automated digital goods for the{' '}
          <span className="italic text-[var(--color-accent)] font-normal">
            connected generation.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[var(--color-bone)]/80 max-w-2xl leading-relaxed mb-10">
          Instant cryptographic delivery of encrypted V2Ray tunnels, high-throughput Cloud VPS nodes, verified software subscriptions, and permanent game licenses.
        </p>

        {/* Live Search Bar */}
        <div className="w-full max-w-xl relative mb-10">
          <div className="relative flex items-center bg-[var(--color-onyx)] border border-[var(--color-graphite)] focus-within:border-[var(--color-accent)] focus-within:shadow-[0_0_12px_rgba(197,255,74,0.25)] transition-all rounded-[4px] px-4 py-3">
            <span className="font-mono text-[var(--color-accent)] text-sm mr-2 font-bold select-none">
              &gt;
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search V2Ray tunnels, VPS instances, Netflix, ChatGPT, Steam keys..."
              className="w-full bg-transparent text-sm text-[var(--color-chalk)] placeholder-[var(--color-ash)] outline-none font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-mono text-[var(--color-ash)] hover:text-white px-2 py-1"
              >
                CLEAR
              </button>
            )}
            <Search className="w-4 h-4 text-[var(--color-ash)] ml-2 shrink-0" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.12em] font-medium transition-all rounded-[2px] flex items-center gap-2 ${
                  isActive
                    ? 'bg-[var(--color-accent)] text-black font-semibold shadow-[0_0_8px_rgba(197,255,74,0.4)]'
                    : 'bg-[var(--color-onyx)] text-[var(--color-bone)] border border-[var(--color-graphite)] hover:border-[var(--color-slate)] hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-black/20 text-black'
                      : 'bg-[var(--color-graphite)] text-[var(--color-ash)]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl pt-2 pb-6 border-t border-[var(--color-graphite)]/60">
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-ash)] font-mono">
            <Zap className="w-4 h-4 text-[var(--color-accent)]" />
            <span>&lt; 3s DISPENSING LATENCY</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-ash)] font-mono">
            <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
            <span>100% REPLACEMENT WARRANTY</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-ash)] font-mono">
            <Lock className="w-4 h-4 text-[var(--color-accent)]" />
            <span>AES-256 ENCRYPTED VAULT</span>
          </div>
        </div>

      </div>

      {/* Signature Neon Section Divider Bar */}
      <div className="w-full mt-6">
        <div className="neon-divider" />
      </div>
    </section>
  );
}
