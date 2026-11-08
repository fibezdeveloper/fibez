'use client';

import React, { useState } from 'react';
import { copyToClipboardWithToast } from '@/lib/cipher';
import Link from 'next/link';

export interface StoreSku {
  id: string;
  slug: string;
  category: 'vpn' | 'vps' | 'subs' | 'keys';
  tag: string;
  title: string;
  specs: string;
  price: string;
  unit: string;
  stock: string;
  secret: string;
}

export const STORE_SKUS: StoreSku[] = [
  {
    id: "SKU-V2R-01",
    slug: "v2ray-premium-sg",
    category: "vpn",
    tag: "VLESS REALITY",
    title: "Singapore CN2-GIA V2Ray",
    specs: "2,000 GB · 10Gbps · Zero-Log XTLS",
    price: "$4.90",
    unit: "/ mo",
    stock: "412 NODES",
    secret: "vless://fbz-sg01@103.214.16.88:443?security=reality&sni=cloudflare.com#FIBEZ-SG"
  },
  {
    id: "SKU-V2R-02",
    slug: "v2ray-premium-sg",
    category: "vpn",
    tag: "MULTI-HOP",
    title: "Tokyo + Zurich Double-Hop",
    specs: "Unlimited BW · Dedicated SNI · IPv4/v6",
    price: "$7.50",
    unit: "/ mo",
    stock: "189 NODES",
    secret: "vless://fbz-ch-jp@194.12.88.10:443?security=reality&flow=xtls-rprx-vision#FIBEZ-HOP"
  },
  {
    id: "SKU-VPS-01",
    slug: "cloud-vps-epyc",
    category: "vps",
    tag: "AMD EPYC KVM",
    title: "NVMe Cloud VPS · 8 vCPU",
    specs: "16GB DDR5 · 320GB NVMe · Frankfurt",
    price: "$14.00",
    unit: "/ mo",
    stock: "38 INSTANCES",
    secret: "ssh root@185.212.44.91 -p 22 # RootPass: Fbz#KVM9921"
  },
  {
    id: "SKU-VPS-02",
    slug: "cloud-vps-epyc",
    category: "vps",
    tag: "RYZEN 9950X",
    title: "High-Frequency VPS · 4 vCPU",
    specs: "8GB DDR5 · 160GB Gen5 NVMe · Amsterdam",
    price: "$9.80",
    unit: "/ mo",
    stock: "64 INSTANCES",
    secret: "ssh root@91.198.112.40 -p 22 # RootPass: Fbz#RZN4410"
  },
  {
    id: "SKU-SUB-01",
    slug: "chatgpt-plus-private",
    category: "subs",
    tag: "AI WORKSPACE",
    title: "ChatGPT Plus Dedicated Seat",
    specs: "GPT-4o / o3-mini · Private Workspace",
    price: "$8.90",
    unit: "/ mo",
    stock: "94 SEATS",
    secret: "https://chat.openai.com/invite/fbz-plus-88219a | Pin: 9920"
  },
  {
    id: "SKU-SUB-02",
    slug: "netflix-4k-uhd",
    category: "subs",
    tag: "4K DOLBY VISION",
    title: "Netflix 4K UHD Private Profile",
    specs: "PIN-Locked Seat · 30-Day Auto Warranty",
    price: "$3.80",
    unit: "/ mo",
    stock: "215 SEATS",
    secret: "nf_uhd_77@fibez.io : FbzNet#2026 | Profile #3 (PIN 8812)"
  },
  {
    id: "SKU-SUB-03",
    slug: "discord-nitro-boost",
    category: "subs",
    tag: "2X SERVER BOOST",
    title: "Discord Nitro Full (1 Month)",
    specs: "Instant Gift Link · Works on All Accounts",
    price: "$4.20",
    unit: "/ mo",
    stock: "160 LINKS",
    secret: "https://discord.gift/fbzNitro9921XkLpQ8"
  },
  {
    id: "SKU-KEY-01",
    slug: "steam-global-key",
    category: "keys",
    tag: "GLOBAL STEAM",
    title: "Black Myth / AAA Steam Key",
    specs: "Region-Free CD-Key · Instant Decrypt",
    price: "$34.50",
    unit: "/ key",
    stock: "27 KEYS",
    secret: "STEAM-GLOBAL-KEY: 99FK2-LM88P-Q771Z-VB20N"
  }
];

export default function StorefrontGrid() {
  const [filter, setFilter] = useState<'all' | 'vpn' | 'vps' | 'subs' | 'keys'>('all');

  const filteredItems = filter === 'all'
    ? STORE_SKUS
    : STORE_SKUS.filter(item => item.category === filter);

  return (
    <section id="storefront-grid" className="relative z-40 bg-carbon py-24 lg:py-32 px-4 sm:px-8 border-b border-graphite">
      <div className="max-w-[1280px] mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="metadata-stamp mb-4">
              [ &nbsp; VERIFIED STOCK POOL · INSTANT DELIVERY &nbsp; ]
            </div>
            <h2 className="font-editorial text-chalk text-[42px] sm:text-[56px] leading-[0.98] tracking-[-0.025em]">
              Featured <span className="italic text-signalLime">digital SKUs.</span>
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`store-filter-btn px-4 py-2 rounded-[2px] font-sans text-[11px] uppercase tracking-[0.18em] transition-colors ${
                filter === 'all'
                  ? 'border border-signalLime bg-signalLime text-voidBlack font-semibold'
                  : 'border border-graphite bg-onyx text-bone hover:border-fog font-medium'
              }`}
            >
              ALL SKUS ({STORE_SKUS.length})
            </button>
            <button
              onClick={() => setFilter('vpn')}
              className={`store-filter-btn px-4 py-2 rounded-[2px] font-sans text-[11px] uppercase tracking-[0.18em] transition-colors ${
                filter === 'vpn'
                  ? 'border border-signalLime bg-signalLime text-voidBlack font-semibold'
                  : 'border border-graphite bg-onyx text-bone hover:border-fog font-medium'
              }`}
            >
              V2RAY / VPN
            </button>
            <button
              onClick={() => setFilter('vps')}
              className={`store-filter-btn px-4 py-2 rounded-[2px] font-sans text-[11px] uppercase tracking-[0.18em] transition-colors ${
                filter === 'vps'
                  ? 'border border-signalLime bg-signalLime text-voidBlack font-semibold'
                  : 'border border-graphite bg-onyx text-bone hover:border-fog font-medium'
              }`}
            >
              CLOUD VPS
            </button>
            <button
              onClick={() => setFilter('subs')}
              className={`store-filter-btn px-4 py-2 rounded-[2px] font-sans text-[11px] uppercase tracking-[0.18em] transition-colors ${
                filter === 'subs'
                  ? 'border border-signalLime bg-signalLime text-voidBlack font-semibold'
                  : 'border border-graphite bg-onyx text-bone hover:border-fog font-medium'
              }`}
            >
              SUBSCRIPTIONS
            </button>
            <button
              onClick={() => setFilter('keys')}
              className={`store-filter-btn px-4 py-2 rounded-[2px] font-sans text-[11px] uppercase tracking-[0.18em] transition-colors ${
                filter === 'keys'
                  ? 'border border-signalLime bg-signalLime text-voidBlack font-semibold'
                  : 'border border-graphite bg-onyx text-bone hover:border-fog font-medium'
              }`}
            >
              GAME KEYS
            </button>
          </div>
        </div>

        {/* Sharp Architectural Product Grid */}
        <div id="sku-grid-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-graphite">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="p-7 bg-onyx/75 hover:bg-onyx border-r border-b border-graphite flex flex-col justify-between transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] mb-4">
                  <span className="text-ash">{item.id}</span>
                  <span className="border border-signalLime/60 text-signalLime px-2 py-0.5 rounded-full text-[9px]">
                    ● {item.stock}
                  </span>
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-signalLime uppercase mb-1.5">
                  {item.tag}
                </div>
                <h3 className="font-editorial text-[26px] text-chalk leading-[1.1] mb-2">
                  <Link href={`/product/${item.slug}`} className="hover:text-signalLime transition-colors">
                    {item.title}
                  </Link>
                </h3>
                <p className="font-sans text-[12px] text-ash mb-6">
                  {item.specs}
                </p>
              </div>

              <div className="pt-4 border-t border-graphite flex items-center justify-between">
                <div>
                  <span className="font-editorial text-[28px] text-chalk">{item.price}</span>
                  <span className="font-mono text-[10px] text-ash"> {item.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/product/${item.slug}`}
                    className="border border-graphite text-ash hover:text-white px-2.5 py-2 rounded-[2px] font-mono text-[10px] uppercase transition-colors"
                    title="Configure"
                  >
                    CONFIG
                  </Link>
                  <button
                    onClick={() => copyToClipboardWithToast(`${item.title} Instant Mint`, item.secret)}
                    className="bg-signalLime text-voidBlack font-sans text-[10px] font-semibold uppercase tracking-[0.2em] px-3.5 py-2.5 rounded-[4px] glow-lime hover:brightness-105 transition-all"
                  >
                    MINT NOW ↗
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
