'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import CatalogSection from '@/components/CatalogSection';
import HowItWorks from '@/components/HowItWorks';
import FeaturesGrid from '@/components/FeaturesGrid';
import Testimonials from '@/components/Testimonials';
import DarkVeil from '@/components/DarkVeil';
import { useStore } from '@/lib/store-context';
import { ArrowRight, ShoppingBag, KeyRound, ShieldCheck, LifeBuoy } from 'lucide-react';

/**
 * The landing page. The server decides which sections are open (Admin -> Site pages) and passes them in,
 * so a switched-off shop never flashes on screen. With the shop off the page shows V2Ray content only.
 */
export default function HomeContent({
  shopOn,
  v2rayOn,
  ticketsOn,
}: {
  shopOn: boolean;
  v2rayOn: boolean;
  ticketsOn: boolean;
}) {
  const router = useRouter();
  const { currency } = useStore();
  const v2rayOnly = !shopOn;

  return (
    <main className="relative isolate flex flex-col">
      {/* Page-wide dark veil behind every section, so the page never goes flat black while scrolling */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-black">
        <DarkVeil color="#3b3fd9" speed={0.8} flow={1.8} warp={0.4} brightness={0.95} glow={0.5} grain={0.04} quality={0.5} />
      </div>

      {/* Store Hero */}
      <Hero
        v2rayOnly={v2rayOnly}
        onExploreCatalog={() => {
          router.push('/catalog');
        }}
      />

      {/* Shop-only sections: brands strip, product catalog, categories */}
      {shopOn && <TrustBar />}
      {shopOn && <CatalogSection currency={currency} />}

      {/* 3-Step Ordering Guide */}
      <HowItWorks v2rayOnly={v2rayOnly} />

      {shopOn && <FeaturesGrid />}

      {/* Quick Store Navigation */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Quick Access
            </div>
            <h2 className="text-3xl font-normal tracking-[-0.03em] text-white">
              Everything you need in one place
            </h2>
            <p className="text-sm text-[#a1a4a5] mt-2">
              {shopOn
                ? 'Shop the full catalog, get a free VLESS VPN trial, view your delivered keys, or reach support.'
                : 'Pick a VLESS plan, claim a free 24-hour trial, view your delivered keys, or reach support.'}
            </p>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              [shopOn, v2rayOn, true, ticketsOn].filter(Boolean).length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            }`}
          >
            {shopOn && (<Link
              href="/catalog"
              className="group p-6 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] hover:border-white/30 hover:bg-[#111114] transition-all block relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#16161a] border border-[#26262b] flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-white group-hover:text-white transition-colors flex items-center justify-between">
                <span>Product Catalog</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-zinc-400" />
              </h3>
              <p className="text-xs text-[#a1a4a5] mt-1.5 leading-relaxed">
                Browse gift cards, streaming accounts, game top-ups, software licenses &amp; VLESS VPN plans.
              </p>
            </Link>)}

            {v2rayOn && (<Link
              href="/v2ray"
              className="group p-6 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] hover:border-white/30 hover:bg-[#111114] transition-all block relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#16161a] border border-[#26262b] flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-white group-hover:text-white transition-colors flex items-center justify-between">
                <span>High-Speed VLESS VPN</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-zinc-400" />
              </h3>
              <p className="text-xs text-[#a1a4a5] mt-1.5 leading-relaxed">
                Optimised for SLT, Dialog, Hutch &amp; Airtel. Test your line or claim a free 24-hour trial.
              </p>
            </Link>)}

            <Link
              href="/vault"
              className="group p-6 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] hover:border-white/30 hover:bg-[#111114] transition-all block relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#16161a] border border-[#26262b] flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-white group-hover:text-white transition-colors flex items-center justify-between">
                <span>Key Vault &amp; Orders</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-zinc-400" />
              </h3>
              <p className="text-xs text-[#a1a4a5] mt-1.5 leading-relaxed">
                {shopOn
                  ? 'Access purchased gift codes, account logins, VLESS QR codes, and order tracking.'
                  : 'Access your VLESS configs, QR codes, and order tracking.'}
              </p>
            </Link>

{ticketsOn && (            <Link
              href="/tickets"
              className="group p-6 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] hover:border-white/30 hover:bg-[#111114] transition-all block relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#16161a] border border-[#26262b] flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-white group-hover:text-white transition-colors flex items-center justify-between">
                <span>Support &amp; Guides</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-zinc-400" />
              </h3>
              <p className="text-xs text-[#a1a4a5] mt-1.5 leading-relaxed">
                Open a support ticket, check NetMod &amp; v2rayNG setup steps, or get replacement warranty help.
              </p>
            </Link>)}
          </div>
        </div>
      </section>

      {/* Customer Reviews (product reviews, so shop only) */}
      {shopOn && <Testimonials />}
    </main>
  );
}
