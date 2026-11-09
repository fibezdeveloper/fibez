'use client';

import React from 'react';
import { Shield, Cpu, Key, QrCode, Server, Terminal, Lock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function FeaturesGrid() {
  return (
    <section id="infrastructure" className="w-full py-24 bg-black border-t border-[#292d30]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
            Core Architecture
          </div>
          <h2 className="text-[40px] sm:text-[56px] font-normal leading-[1.12] tracking-[-0.05em] text-white">
            Beyond instant delivery. <br />
            Built for total reliability.
          </h2>
          <p className="text-[17px] leading-relaxed text-[#a1a4a5] mt-4">
            Four specialized infrastructure pillars designed for zero friction, high speed, and cryptographic security.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Card 1: V2Ray & Trojan Reality (Span 7) */}
          <div className="md:col-span-7 resend-card p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[6px] border border-[#292d30] bg-black flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  REALITY PROTOCOL
                </span>
              </div>

              <h3 className="text-2xl font-normal tracking-[-0.03em] text-white mb-2">
                V2Ray &amp; Xray Reality Nodes
              </h3>
              <p className="text-[15px] leading-relaxed text-[#a1a4a5] mb-6">
                Ultra-low latency tunnel endpoints designed to bypass ISP throttling with SNI masking. Instant dynamic QR code generation for mobile clients (v2rayNG, Shadowrocket, Sing-box).
              </p>

              {/* Terminal Code Mockup */}
              <div className="p-4 rounded-[6px] border border-[#292d30] bg-[#050505] font-mono text-xs text-[#f0f0f0] space-y-1.5 overflow-x-auto">
                <div className="text-[#6e727a]">// Config connection string</div>
                <div className="text-zinc-300 truncate">vless://98e4d1b8-3a91-4c12@singapore.edge.fibez.io:443?security=reality&amp;sni=apple.com</div>
                <div className="text-zinc-400 flex items-center gap-1 pt-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified 10 Gbps Uplink · Ping: 18ms</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1f2224] flex items-center justify-between text-xs text-[#a1a4a5]">
              <span>Protocols: VLESS, Trojan, VMess, ShadowTLS</span>
              <span className="font-mono text-white">Auto-Renewing</span>
            </div>
          </div>

          {/* Bento Card 2: Cloud NVMe VPS (Span 5) */}
          <div className="md:col-span-5 resend-card p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[6px] border border-[#292d30] bg-black flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  INSTANT ROOT
                </span>
              </div>

              <h3 className="text-2xl font-normal tracking-[-0.03em] text-white mb-2">
                NVMe Cloud VPS
              </h3>
              <p className="text-[15px] leading-relaxed text-[#a1a4a5] mb-6">
                Automated high-performance cloud compute. Sub-second boot times, dedicated IPv4/IPv6, and instantaneous SSH credentials delivery.
              </p>

              {/* Specs Badge Grid */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-[6px] border border-[#292d30] bg-[#050505]">
                  <span className="text-[#6e727a] block text-[10px]">CPU</span>
                  <span className="text-white">AMD EPYC™ 9004</span>
                </div>
                <div className="p-2.5 rounded-[6px] border border-[#292d30] bg-[#050505]">
                  <span className="text-[#6e727a] block text-[10px]">STORAGE</span>
                  <span className="text-white">PCIe 4.0 NVMe</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1f2224] flex items-center justify-between text-xs text-[#a1a4a5]">
              <span>Locations: Frankfurt, Singapore, US-East</span>
              <span className="font-mono text-zinc-300">&lt; 15s Provision</span>
            </div>
          </div>

          {/* Bento Card 3: Premium Developer Subscriptions (Span 5) */}
          <div className="md:col-span-5 resend-card p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[6px] border border-[#292d30] bg-black flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  WARRANTY BACKED
                </span>
              </div>

              <h3 className="text-2xl font-normal tracking-[-0.03em] text-white mb-2">
                Premium Subscriptions
              </h3>
              <p className="text-[15px] leading-relaxed text-[#a1a4a5] mb-6">
                Direct credentials and invitation links for ChatGPT Plus, Claude Pro, Netflix 4K UHD, Discord Nitro, and Spotify Premium. Protected by Fibez 30-day warranty replacement.
              </p>

              <div className="flex flex-wrap gap-2">
                {['ChatGPT Team', 'Claude Pro', 'Discord Nitro', 'Netflix 4K'].map((item) => (
                  <span key={item} className="font-mono text-xs px-2.5 py-1 rounded-[6px] border border-[#292d30] text-[#f0f0f0] bg-[#050505]">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1f2224] flex items-center justify-between text-xs text-[#a1a4a5]">
              <span>Account Modes: Shared or Private Domain</span>
              <span className="font-mono text-white">Full Term</span>
            </div>
          </div>

          {/* Bento Card 4: Global Game Keys & Licenses (Span 7) */}
          <div className="md:col-span-7 resend-card p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-[6px] border border-[#292d30] bg-black flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  INSTANT SERIAL VAULT
                </span>
              </div>

              <h3 className="text-2xl font-normal tracking-[-0.03em] text-white mb-2">
                Game Keys &amp; Enterprise Licenses
              </h3>
              <p className="text-[15px] leading-relaxed text-[#a1a4a5] mb-6">
                Cryptographically sealed activation keys for Steam, EA Play, Xbox Game Pass, and Windows Pro. One-click instant unmasking with automatic activation guide.
              </p>

              {/* Key Vault Simulation Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-[6px] border border-[#292d30] bg-[#050505] font-mono text-xs">
                <span className="text-[#6e727a]">SERIAL KEY:</span>
                <span className="text-white tracking-widest font-semibold">XXXXX-XXXXX-FBZ26-VALID</span>
                <span className="text-xs px-2 py-0.5 rounded-[6px] bg-[#1a1c1e] text-[#f0f0f0] border border-[#292d30]">
                  GENUINE
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1f2224] flex items-center justify-between text-xs text-[#a1a4a5]">
              <span>Region-Free Global Activation</span>
              <span className="font-mono text-zinc-300">Instant Delivery</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
