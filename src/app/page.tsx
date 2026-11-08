import React from 'react';
import Image from 'next/image';
import FibezLogo, { FibezMonogram } from '@/components/FibezLogo';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050505]">
      <div className="flex flex-col items-center max-w-lg space-y-6">
        
        {/* Uploaded Brand Logo */}
        <div className="relative w-24 h-24 mb-2">
          <Image
            src="/brand/fibez-logo-dark.png"
            alt="Fibez Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Brand Vector Monogram & Wordmark */}
        <FibezLogo />

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Fibez Marketplace
          </h1>
          <p className="text-sm text-zinc-400">
            Clean slate initialized. Ready to build your digital goods &amp; subscription marketplace.
          </p>
        </div>

        {/* Neon Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-[#c5ff4a] shadow-[0_0_8px_#c5ff4a] animate-pulse" />
          <span>Neon Serverless Postgres &amp; Storage Connected</span>
        </div>

      </div>
    </main>
  );
}
