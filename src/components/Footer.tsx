'use client';

import React from 'react';
import Link from 'next/link';
import { FibezMonogram } from './FibezLogo';
import { MessageCircle, ShieldCheck, Zap, Lock, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-40 w-full bg-[var(--color-void-black)] border-t border-[var(--color-graphite)] text-[var(--color-ash)] pt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-12">
        
        {/* Top Broadsheet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[var(--color-graphite)]">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-[2px] bg-onyx border border-graphite group-hover:border-signalLime flex items-center justify-center transition-colors">
                <FibezMonogram className="w-5 h-5 text-chalk group-hover:text-signalLime transition-colors" />
              </div>
              <span className="font-editorial text-2xl tracking-[-0.03em] font-normal text-white">
                FIBEZ
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-[var(--color-smoke)] max-w-sm">
              Automated digital goods clearance vault. Instant delivery of high-speed V2Ray configurations, dedicated Cloud VPS compute, premium software subscriptions, and permanent game keys.
            </p>

            {/* Operational Engine Status */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-[2px] bg-[var(--color-onyx)] border border-[var(--color-graphite)] font-mono text-[11px] text-[var(--color-chalk)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-signal-lime)] glow-lime animate-pulse" />
              <span>SYSTEM STATUS: DISPATCH OPERATIONAL</span>
            </div>
          </div>

          {/* Infrastructure Column */}
          <div className="space-y-3 text-sm">
            <div className="metadata-stamp text-[var(--color-chalk)]">
              [ INFRASTRUCTURE ]
            </div>
            <ul className="space-y-2 font-mono text-xs text-[var(--color-smoke)]">
              <li>
                <a href="#provisioning-bench" className="hover:text-[var(--color-signal-lime)] transition-colors">
                  V2Ray &amp; VLESS Tunnels
                </a>
              </li>
              <li>
                <a href="#provisioning-bench" className="hover:text-[var(--color-signal-lime)] transition-colors">
                  NVMe Cloud VPS Instances
                </a>
              </li>
              <li>
                <a href="#provisioning-bench" className="hover:text-[var(--color-signal-lime)] transition-colors">
                  ISP Optimized Routing (SLT / Dialog)
                </a>
              </li>
              <li>
                <a href="#provisioning-bench" className="hover:text-[var(--color-signal-lime)] transition-colors">
                  Frankfurt &amp; Singapore Edge Nodes
                </a>
              </li>
            </ul>
          </div>

          {/* Catalog & Keys Column */}
          <div className="space-y-3 text-sm">
            <div className="metadata-stamp text-[var(--color-chalk)]">
              [ VAULT INVENTORY ]
            </div>
            <ul className="space-y-2 font-mono text-xs text-[var(--color-smoke)]">
              <li>
                <a href="#storefront-grid" className="hover:text-[var(--color-signal-lime)] transition-colors">
                  ChatGPT Plus &amp; Team Slots
                </a>
              </li>
              <li>
                <a href="#storefront-grid" className="hover:text-[var(--color-signal-lime)] transition-colors">
                  Netflix 4K UHD Profiles
                </a>
              </li>
              <li>
                <a href="#storefront-grid" className="hover:text-[var(--color-signal-lime)] transition-colors">
                  Discord Nitro Server Boosts
                </a>
              </li>
              <li>
                <a href="#storefront-grid" className="hover:text-[var(--color-signal-lime)] transition-colors">
                  Minecraft PC &amp; Steam Codes
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Direct Support */}
          <div className="space-y-3 text-sm">
            <div className="metadata-stamp text-[var(--color-chalk)]">
              [ VERIFICATION &amp; HELP ]
            </div>
            <ul className="space-y-2 font-mono text-xs text-[var(--color-smoke)]">
              <li>
                <Link href="/dashboard/vault" className="hover:text-[var(--color-signal-lime)] transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[var(--color-signal-lime)]" />
                  <span>Customer Key Vault</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/?text=Hello%20Fibez%20Support,%20I%20need%20assistance%20with%20my%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-signal-lime)] transition-colors flex items-center gap-1.5 text-[#25D366]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Operator</span>
                </a>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[var(--color-signal-lime)] transition-colors">
                  Bank Transfer Instructions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--color-signal-lime)] transition-colors flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Admin Terminal</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Mid-Row Metadata & Legal */}
        <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--color-ash)]">
          <div>
            &copy; 2026 FIBEZ AUTOMATED VAULT. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[var(--color-signal-lime)]" />
              <span>FIFO ATOMIC DISPENSING</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-signal-lime)]" />
              <span>AES-256 VAULT ENCRYPTION</span>
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Technical Bar matching reference */}
      <div className="border-t border-graphite bg-voidBlack py-6 px-4 sm:px-8 font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FibezMonogram className="w-5 h-5 text-signalLime" />
            <span className="text-chalk font-semibold">FIBEZ</span>
            <span>·</span>
            <span>AUTOMATED DIGITAL GOODS &amp; SUBSCRIPTION MARKETPLACE</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#provisioning-bench" className="hover:text-signalLime transition-colors">CLI BENCH</a>
            <a href="#rbac-console" className="hover:text-signalLime transition-colors">RBAC PANEL</a>
            <a href="#hero-scroll-track" className="text-bone hover:text-signalLime transition-colors">TOP ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
