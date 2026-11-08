'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ShieldCheck, Zap, Lock, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--color-void-black)] border-t border-[var(--color-graphite)] text-[var(--color-ash)] pt-16 pb-12 mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        
        {/* Top Broadsheet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[var(--color-graphite)]">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[4px] overflow-hidden bg-[var(--color-onyx)] border border-[var(--color-graphite)] flex items-center justify-center">
                <Image
                  src="/brand/fibez-logo-dark.png"
                  alt="Fibez Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-2xl tracking-[-0.03em] font-normal text-white">
                FIBEZ
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-[var(--color-smoke)] max-w-sm">
              Automated digital goods clearance vault. Instant delivery of high-speed V2Ray configurations, dedicated Cloud VPS compute, premium software subscriptions, and permanent game keys.
            </p>

            {/* Operational Engine Status */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-[2px] bg-[var(--color-onyx)] border border-[var(--color-graphite)] font-mono text-[11px] text-[var(--color-chalk)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
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
                <Link href="/#v2ray" className="hover:text-[var(--color-accent)] transition-colors">
                  V2Ray & VLESS Tunnels
                </Link>
              </li>
              <li>
                <Link href="/#vps" className="hover:text-[var(--color-accent)] transition-colors">
                  NVMe Cloud VPS Instances
                </Link>
              </li>
              <li>
                <Link href="/#v2ray" className="hover:text-[var(--color-accent)] transition-colors">
                  ISP Optimized Routing (SLT / Dialog)
                </Link>
              </li>
              <li>
                <Link href="/#v2ray" className="hover:text-[var(--color-accent)] transition-colors">
                  Frankfurt & Singapore Edge Nodes
                </Link>
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
                <Link href="/#subscriptions" className="hover:text-[var(--color-accent)] transition-colors">
                  ChatGPT Plus & Team Slots
                </Link>
              </li>
              <li>
                <Link href="/#subscriptions" className="hover:text-[var(--color-accent)] transition-colors">
                  Netflix 4K UHD Profiles
                </Link>
              </li>
              <li>
                <Link href="/#subscriptions" className="hover:text-[var(--color-accent)] transition-colors">
                  Discord Nitro Server Boosts
                </Link>
              </li>
              <li>
                <Link href="/#gaming" className="hover:text-[var(--color-accent)] transition-colors">
                  Minecraft PC & Steam Codes
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Direct Support */}
          <div className="space-y-3 text-sm">
            <div className="metadata-stamp text-[var(--color-chalk)]">
              [ VERIFICATION & HELP ]
            </div>
            <ul className="space-y-2 font-mono text-xs text-[var(--color-smoke)]">
              <li>
                <Link href="/dashboard/vault" className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>Customer Key Vault</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/?text=Hello%20Fibez%20Support,%20I%20need%20assistance%20with%20my%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-1.5 text-[#25D366]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Operator</span>
                </a>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[var(--color-accent)] transition-colors">
                  Bank Transfer Instructions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--color-accent)] transition-colors flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Admin Terminal</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Metadata & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--color-ash)]">
          <div>
            &copy; 2026 FIBEZ AUTOMATED VAULT. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>FIFO ATOMIC DISPENSING</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>AES-256 VAULT ENCRYPTION</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
