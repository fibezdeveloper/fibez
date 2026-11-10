'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, CheckCircle2, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

export default function InfrastructurePage() {
  const [storeOnline, setStoreOnline] = useState<boolean | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [responseMs, setResponseMs] = useState<number | null>(null);

  const checkHealth = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setResponseMs(Math.round(performance.now() - start));
      if (res.ok && Array.isArray(data.products)) {
        setStoreOnline(true);
        setProductCount(data.products.length);
      } else {
        setStoreOnline(false);
      }
    } catch {
      setStoreOnline(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#a1a4a5] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-white">Service Status</span>
      </div>

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#1f1f23]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3ad389]" />
            <span>Live System Status</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
            Store &amp; VLESS VPN Service Status
          </h1>
          <p className="text-sm text-[#a1a4a5] mt-2 max-w-2xl leading-relaxed">
            High-speed VLESS VPN — optimised for SLT, Dialog, Hutch &amp; Airtel. Instant delivery. Config sent to your email in seconds.
          </p>
        </div>

        <button
          type="button"
          onClick={checkHealth}
          className="px-4 py-2 rounded-full bg-[#16161a] hover:bg-[#202026] border border-[#26262b] text-xs font-mono text-white transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Refresh Live Check</span>
        </button>
      </div>

      {/* Live Service Checks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-5 rounded-[18px] bg-[#0c0c0e] border border-[#1f1f23]">
          <div className="text-xs font-mono text-[#a1a4a5] uppercase mb-1">Storefront &amp; Database</div>
          <div className="flex items-center gap-2 text-white font-mono text-lg font-bold">
            <CheckCircle2 className={`w-5 h-5 ${storeOnline === false ? 'text-zinc-500' : 'text-[#3ad389]'}`} />
            <span>
              {storeOnline === null ? 'Checking...' : storeOnline ? 'Operational' : 'Offline'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-1">
            {responseMs !== null ? `Live API response: ${responseMs} ms` : 'Measuring API response...'}
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-[#0c0c0e] border border-[#1f1f23]">
          <div className="text-xs font-mono text-[#a1a4a5] uppercase mb-1">Catalog Products Loaded</div>
          <div className="text-white font-mono text-lg font-bold">
            {productCount !== null ? `${productCount} Active Products` : 'Loading...'}
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-1">
            Synced directly from Neon PostgreSQL
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-[#0c0c0e] border border-[#1f1f23]">
          <div className="text-xs font-mono text-[#a1a4a5] uppercase mb-1">VLESS Line Diagnostic</div>
          <div className="text-white font-mono text-lg font-bold">Real-Time Test</div>
          <div className="text-[11px] font-mono text-zinc-400 mt-1">
            <Link href="/v2ray#line-check" className="hover:underline text-white">
              Open Line Check Tool →
            </Link>
          </div>
        </div>
      </div>

      {/* Optimised Networks */}
      <div className="p-6 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23] mb-12">
        <h2 className="text-lg font-medium text-white mb-2">
          Supported Sri Lankan Networks
        </h2>
        <p className="text-xs text-[#a1a4a5] mb-6">
          Our High-speed VLESS VPN configs are tailored for these Sri Lankan ISP packages and work with NetMod Syna and v2rayNG.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-[12px] bg-[#141417] border border-[#1f1f23]">
            <div className="text-xs font-mono text-white font-semibold">SLT Fiber / FTTH</div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">Netflix &amp; Streaming packages</div>
          </div>
          <div className="p-4 rounded-[12px] bg-[#141417] border border-[#1f1f23]">
            <div className="text-xs font-mono text-white font-semibold">Dialog 4G / Broadband</div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">Work &amp; Learn / Zoom (*678#)</div>
          </div>
          <div className="p-4 rounded-[12px] bg-[#141417] border border-[#1f1f23]">
            <div className="text-xs font-mono text-white font-semibold">Hutch 4G</div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">Zoom &amp; Work bundles</div>
          </div>
          <div className="p-4 rounded-[12px] bg-[#141417] border border-[#1f1f23]">
            <div className="text-xs font-mono text-white font-semibold">Airtel &amp; Mobitel</div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">TikTok 297/997 &amp; Zoom1 (#170#)</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/v2ray"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider transition-all"
        >
          <span>View VLESS VPN Packages</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141417] border border-[#26262b] hover:border-white/30 text-white text-xs font-semibold uppercase tracking-wider transition-all"
        >
          <span>Browse All Store Products</span>
        </Link>
      </div>
    </div>
  );
}
