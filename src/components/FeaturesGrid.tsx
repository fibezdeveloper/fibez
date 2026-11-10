'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, Gift, Key, Gamepad2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FeaturesGrid() {
  return (
    <section id="categories" className="w-full py-24 bg-black border-t border-[#292d30]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
            What We Sell
          </div>
          <h2 className="text-[36px] sm:text-[52px] font-normal leading-[1.12] tracking-[-0.04em] text-white">
            Everything digital. <br />
            Ready when you are.
          </h2>
          <p className="text-[16px] leading-relaxed text-[#a1a4a5] mt-4">
            Four core product categories stocked around the clock with instant automated delivery and full replacement warranty.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Card 1: High-Speed VLESS VPN (Span 7) */}
          <div className="md:col-span-7 resend-card p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[6px] border border-[#292d30] bg-black flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                  SLT · DIALOG · HUTCH · AIRTEL
                </span>
              </div>

              <h3 className="text-2xl font-normal tracking-[-0.03em] text-white mb-2">
                High-Speed VLESS VPN
              </h3>
              <p className="text-[15px] leading-relaxed text-[#a1a4a5] mb-6">
                High-speed VLESS VPN — optimised for SLT, Dialog, Hutch &amp; Airtel. Instant delivery. Config sent to your email in seconds for NetMod Syna &amp; v2rayNG.
              </p>

              {/* Config Preview */}
              <div className="p-4 rounded-[6px] border border-[#292d30] bg-[#050505] font-mono text-xs text-[#f0f0f0] space-y-1.5 overflow-x-auto">
                <div className="text-[#6e727a]">// Delivered via email &amp; QR code</div>
                <div className="text-zinc-300 truncate">vless://fibez-user@sg.fibez.store:443?encryption=none&amp;security=tls#Fibez-VLESS</div>
                <div className="text-zinc-400 flex items-center gap-1.5 pt-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3ad389]" />
                  <span>Works with NetMod Syna &amp; v2rayNG · 24h Free Trial Available</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1f2224] flex items-center justify-between text-xs text-[#a1a4a5]">
              <span>Includes 1-Click Line Check &amp; Setup Guide</span>
              <Link href="/v2ray" className="font-mono text-white hover:underline inline-flex items-center gap-1">
                <span>Browse VLESS</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: Official Gift Cards (Span 5) */}
          <div className="md:col-span-5 resend-card p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[6px] border border-[#292d30] bg-black flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                  DIGITAL CODES
                </span>
              </div>

              <h3 className="text-2xl font-normal tracking-[-0.03em] text-white mb-2">
                Official Gift Cards
              </h3>
              <p className="text-[15px] leading-relaxed text-[#a1a4a5] mb-6">
                Top up your store wallets globally with authentic digital codes for Steam, PlayStation, Nintendo, Apple App Store, Google Play &amp; Amazon.
              </p>

              {/* Brand Badges Grid */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-[6px] border border-[#292d30] bg-[#050505]">
                  <span className="text-[#6e727a] block text-[10px]">PC GAMING</span>
                  <span className="text-white">Steam &amp; Razer Gold</span>
                </div>
                <div className="p-2.5 rounded-[6px] border border-[#292d30] bg-[#050505]">
                  <span className="text-[#6e727a] block text-[10px]">CONSOLE &amp; MOBILE</span>
                  <span className="text-white">PSN, Apple &amp; Play</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1f2224] flex items-center justify-between text-xs text-[#a1a4a5]">
              <span>US &amp; Global Regions</span>
              <Link href="/catalog?category=giftcard" className="font-mono text-white hover:underline inline-flex items-center gap-1">
                <span>View Gift Cards</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Bento Card 3: Streaming & AI Subscriptions (Span 5) */}
          <div className="md:col-span-5 resend-card p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[6px] border border-[#292d30] bg-black flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                  WARRANTY BACKED
                </span>
              </div>

              <h3 className="text-2xl font-normal tracking-[-0.03em] text-white mb-2">
                Streaming &amp; AI Accounts
              </h3>
              <p className="text-[15px] leading-relaxed text-[#a1a4a5] mb-6">
                Save on your monthly essentials: ChatGPT Plus, Netflix 4K UHD, Spotify Premium, YouTube Premium, Crunchyroll, and Discord Nitro.
              </p>

              <div className="flex flex-wrap gap-2">
                {['ChatGPT Plus', 'Netflix 4K', 'Spotify', 'Discord Nitro'].map((item) => (
                  <span key={item} className="font-mono text-xs px-2.5 py-1 rounded-[6px] border border-[#292d30] text-[#f0f0f0] bg-[#050505]">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1f2224] flex items-center justify-between text-xs text-[#a1a4a5]">
              <span>Full-Term Replacement</span>
              <Link href="/catalog?category=subscription" className="font-mono text-white hover:underline inline-flex items-center gap-1">
                <span>View Subscriptions</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Bento Card 4: Game Top-Ups & Software Keys (Span 7) */}
          <div className="md:col-span-7 resend-card p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[6px] border border-[#292d30] bg-black flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                  GAME CREDITS &amp; KEYS
                </span>
              </div>

              <h3 className="text-2xl font-normal tracking-[-0.03em] text-white mb-2">
                Game Top-Ups &amp; Software Licenses
              </h3>
              <p className="text-[15px] leading-relaxed text-[#a1a4a5] mb-6">
                Instant Free Fire Diamonds, PUBG Mobile UC, Valorant VP, Xbox Game Pass, plus verified keys for Microsoft 365, Canva Pro, and Kaspersky.
              </p>

              {/* Key Vault Simulation Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-[6px] border border-[#292d30] bg-[#050505] font-mono text-xs">
                <span className="text-[#6e727a]">DIGITAL CODE:</span>
                <span className="text-white tracking-widest font-semibold">XXXXX-XXXXX-FBZ26-VALID</span>
                <span className="text-xs px-2 py-0.5 rounded-[6px] bg-[#1a1c1e] text-[#f0f0f0] border border-[#292d30]">
                  INSTANT
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1f2224] flex items-center justify-between text-xs text-[#a1a4a5]">
              <span>Direct Top-Ups &amp; Retail Keys</span>
              <Link href="/catalog?category=gaming" className="font-mono text-white hover:underline inline-flex items-center gap-1">
                <span>View Gaming &amp; Keys</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
