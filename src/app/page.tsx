'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import CatalogSection from '@/components/CatalogSection';
import CodeWindow from '@/components/CodeWindow';
import FeaturesGrid from '@/components/FeaturesGrid';
import Testimonials from '@/components/Testimonials';
import { useStore } from '@/lib/store-context';
import { ArrowRight, ShieldCheck, Zap, KeyRound, Server, Activity } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currency } = useStore();

  return (
    <main className="flex flex-col">
      {/* Hero with Domaine Editorial Typography & 3D Cube */}
      <Hero
        onExploreCatalog={() => {
          router.push('/catalog');
        }}
      />

      {/* Monochromatic Infrastructure Trust Proof */}
      <TrustBar />

      {/* Featured Digital Goods Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 flex items-center justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-1">
              Live Provisioning Vault
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-[-0.03em] text-white">
              Featured Infrastructure & Digital Assets
            </h2>
          </div>
          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-[#9281f7]/50 text-xs font-mono text-[#a1a4a5] hover:text-white transition-colors"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#9281f7]" />
          </Link>
        </div>

        <CatalogSection currency={currency} />

        <div className="text-center pb-16">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141026] border border-[#2d2449] hover:border-[#9281f7] text-white text-sm font-medium transition-all shadow-lg hover:shadow-[0_0_20px_rgba(146,129,247,0.3)]"
          >
            <span>Browse All 9+ Available Nodes & Subscriptions</span>
            <ArrowRight className="w-4 h-4 text-[#9281f7]" />
          </Link>
        </div>
      </div>

      {/* Developer Terminal Code Window & Live Provisioning Simulator */}
      <CodeWindow />

      {/* Resend 16px Bento Feature Pillars */}
      <FeaturesGrid />

      {/* Quick Navigation Hub to Dedicated Sub-Pages */}
      <section className="py-20 border-t border-[#181a1c] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-2">
              Multi-Cloud Architecture
            </div>
            <h2 className="text-3xl font-normal tracking-[-0.03em] text-white">
              Explore the Fibez Ecosystem
            </h2>
            <p className="text-sm text-[#8e87aa] mt-2">
              Direct access to our dedicated product catalog, real-time edge telemetry, encrypted license vault, and developer documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/catalog"
              className="group p-6 rounded-[16px] bg-[#0a0815] border border-[#231e38] hover:border-[#9281f7]/60 transition-all block relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-[#9281f7] mb-4 group-hover:scale-105 transition-transform">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-white group-hover:text-[#9281f7] transition-colors flex items-center justify-between">
                <span>Product Catalog</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-[#8e87aa] mt-1.5 leading-relaxed">
                Filter by VPN bypass nodes, cloud VPS, software subscriptions, and instant game activations.
              </p>
            </Link>

            <Link
              href="/vault"
              className="group p-6 rounded-[16px] bg-[#0a0815] border border-[#231e38] hover:border-[#9281f7]/60 transition-all block relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-white group-hover:text-[#9281f7] transition-colors flex items-center justify-between">
                <span>Key Vault & Orders</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-[#8e87aa] mt-1.5 leading-relaxed">
                Retrieve revealed credentials, QR codes, SSH keys, order tracking, and receipt slips.
              </p>
            </Link>

            <Link
              href="/infrastructure"
              className="group p-6 rounded-[16px] bg-[#0a0815] border border-[#231e38] hover:border-[#9281f7]/60 transition-all block relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-white group-hover:text-[#9281f7] transition-colors flex items-center justify-between">
                <span>Network Status</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-[#8e87aa] mt-1.5 leading-relaxed">
                Real-time node telemetry, latency measurements across Singapore, Tokyo, and Frankfurt.
              </p>
            </Link>

            <Link
              href="/docs"
              className="group p-6 rounded-[16px] bg-[#0a0815] border border-[#231e38] hover:border-[#9281f7]/60 transition-all block relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-white group-hover:text-[#9281f7] transition-colors flex items-center justify-between">
                <span>Developer Docs</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-[#8e87aa] mt-1.5 leading-relaxed">
                Step-by-step guides for Sing-box, v2rayNG, Shadowrocket, and cloud server provisioning.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Developer Experience Testimonial Quotes */}
      <Testimonials />
    </main>
  );
}
