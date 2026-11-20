'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import VaultDashboard from '@/components/VaultDashboard';
import TechText from '@/components/TechText';
import { ChevronRight, KeyRound, ShieldCheck, Lock, Terminal } from 'lucide-react';

export default function VaultPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8e87aa] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        <span className="text-white">Personal Key Vault & Orders</span>
      </div>

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#1f1f23]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Personal Key Vault</span>
          </div>
          <div className="h-[46px] sm:h-[56px] w-full max-w-[480px] relative -ml-1">
            <h1 className="sr-only">Your Key Vault & Orders</h1>
            <TechText
              text="Your Key Vault & Orders"
              align="left"
              fontWeight={700}
              fontSize={40}
              color="#ffffff"
              accentColor="#3ad389"
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={12}
              intro="none"
              clickKick
              guides={false}
            />
          </div>
          <p className="text-sm text-[#a1a4a5] mt-2 max-w-2xl leading-relaxed">
            View delivered gift card codes, subscription logins, and VLESS VPN configuration links &amp; QR codes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16161a] border border-[#26262b] text-xs font-mono text-zinc-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Protected Order Delivery</span>
          </div>
        </div>
      </div>

      {/* Vault Dashboard Component */}
      <Suspense fallback={<div className="text-center font-mono text-sm py-20 text-[#8e87aa]">Loading vault...</div>}>
        <VaultDashboard />
      </Suspense>
    </div>
  );
}
