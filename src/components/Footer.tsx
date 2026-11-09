'use client';

import React from 'react';
import Link from 'next/link';
import FibezLogo from '@/components/FibezLogo';
import { useStore, SocialLinkConfig } from '@/lib/store-context';
import { 
  Landmark, 
  ShieldCheck, 
  ArrowUpRight, 
  Headphones, 
  FileText, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

function SocialIcon({ platform }: { platform: SocialLinkConfig['platform'] }) {
  switch (platform) {
    case 'discord':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.979-.276-.1-.477-.15-.678.15-.201.301-.778.979-.954 1.18-.176.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.008-.377-.01-.577-.01-.201 0-.527.075-.803.377-.276.301-1.054 1.029-1.054 2.509s1.079 2.911 1.229 3.112c.15.201 2.123 3.242 5.143 4.547.718.311 1.279.497 1.716.636.722.23 1.379.197 1.9.12.581-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352z"/>
          <path d="M12.004 0C5.385 0 0 5.384 0 12c0 2.109.547 4.167 1.587 5.981L.062 24l6.19-1.623A11.94 11.94 0 0 0 12.004 24c6.619 0 12.003-5.384 12.003-12S18.623 0 12.004 0zm0 21.844c-1.848 0-3.66-.497-5.244-1.438l-.376-.223-3.896 1.022 1.04-3.798-.245-.39A9.832 9.832 0 0 1 2.16 12c0-5.428 4.416-9.844 9.844-9.844 5.428 0 9.844 4.416 9.844 9.844 0 5.428-4.416 9.844-9.844 9.844z"/>
        </svg>
      );
    case 'x':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'github':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      );
    case 'reddit':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    default:
      return <ExternalLink className="w-4 h-4" />;
  }
}

export default function Footer() {
  const { socialLinks } = useStore();
  const enabledSocials = socialLinks.filter((s) => s.enabled);

  return (
    <footer className="w-full bg-[#070709] border-t border-[#1b1c20] pt-16 pb-20 sm:pb-16 text-zinc-400 relative">
      <div className="max-w-[1240px] mx-auto px-6">
        
        {/* Main Multi-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-[#1b1c20]">
          
          {/* Brand & Socials Column (5 Columns on Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-block hover:opacity-85 transition-opacity" aria-label="FIBEZ Home">
              <FibezLogo size="lg" withVersion={false} />
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Instant zero-trust digital goods, streaming subscriptions, and high-performance anti-censorship cloud networking. Built for the autonomous web.
            </p>

            {/* Configurable Social Media Links (Enabled via Owner Dashboard) */}
            <div className="pt-2">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-300 mb-3 font-semibold">
                Connect & Channels
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {enabledSocials.length > 0 ? (
                  enabledSocials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      title={social.name}
                      aria-label={social.name}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 text-zinc-300 hover:text-white transition-all flex items-center justify-center group"
                    >
                      <SocialIcon platform={social.platform} />
                    </a>
                  ))
                ) : (
                  <span className="text-xs font-mono text-zinc-600">
                    No public socials active
                  </span>
                )}
              </div>
            </div>

            {/* Edge SLA Telemetry Indicator */}
            <div className="pt-2">
              <Link
                href="/infrastructure"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#3ad389] animate-pulse" />
                <span>All systems operational · High-speed VLESS VPN</span>
              </Link>
            </div>
          </div>

          {/* Navigation Columns (7 Columns on Desktop, split into 3 groups) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Column 1: V2Ray & Platform */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                V2Ray & Nodes
              </div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/v2ray" className="text-white font-medium hover:text-zinc-200 transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                    <span>High-Speed VLESS Hub</span>
                  </Link>
                </li>
                <li>
                  <Link href="/v2ray#line-check" className="text-zinc-400 hover:text-white transition-colors">
                    Line Check Diagnostic
                  </Link>
                </li>
                <li>
                  <Link href="/v2ray/guide" className="text-zinc-400 hover:text-white transition-colors">
                    NetMod Setup Guide
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="text-zinc-400 hover:text-white transition-colors">
                    Products Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/vault" className="text-zinc-400 hover:text-white transition-colors">
                    Key Vault &amp; Orders
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-zinc-400 hover:text-white transition-colors">
                    Shopping Cart
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Help & Support */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                Support
              </div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/tickets" className="text-zinc-400 hover:text-white transition-colors">
                    Support Tickets
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://wa.me/94771234567" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>WhatsApp Desk</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                  </a>
                </li>
                <li>
                  <Link href="/infrastructure" className="text-zinc-400 hover:text-white transition-colors">
                    ISP DPI Routing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-zinc-400 hover:text-white transition-colors">
                    Connection FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                    Console Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Security */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                Compliance
              </div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="text-zinc-400 hover:text-white transition-colors">
                    Refund & Return Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
                    Privacy (Zero-Logs)
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:support@fibez.store" 
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    support@fibez.store
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Row: Copyright & Bank Transfer Logo (with reserved clearance for BackToTop button) */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pr-0 sm:pr-24 lg:pr-28">
          
          {/* Copyright */}
          <div className="font-mono text-xs text-zinc-500">
            © 2026 FIBEZ DIGITAL INC. ALL RIGHTS RESERVED.
          </div>

          {/* Payment Method: Strictly Manual Bank Wire Logo & CDM Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:border-white/20 transition-colors">
              <Landmark className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-semibold text-white tracking-wide">
                  Manual Bank Transfer / CDM
                </span>
                <span className="text-[9px] text-zinc-400">
                  Commercial Bank · Sampath Bank
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Verified Slip Deposit</span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
