'use client';

import React, { useEffect, useRef } from 'react';
import { runCipherDecode } from '@/lib/cipher';

export default function TwoSurfacesSection() {
  const retailTitleRef = useRef<HTMLHeadingElement | null>(null);
  const wholesaleTitleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const text = target.getAttribute('data-text') || target.textContent || '';
            runCipherDecode(target, text, 560);
          }
        });
      },
      { threshold: 0.35 }
    );

    if (retailTitleRef.current) observer.observe(retailTitleRef.current);
    if (wholesaleTitleRef.current) observer.observe(wholesaleTitleRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="two-surfaces" className="relative z-40 bg-carbon bg-dot-matrix py-24 lg:py-32 px-4 sm:px-8 border-b border-graphite">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Section Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-7">
            <div className="metadata-stamp mb-5">
              [ &nbsp; TWO SURFACES, ONE ENGINE &nbsp; ]
            </div>
            <h2 className="font-editorial text-chalk text-[46px] sm:text-[60px] md:text-[72px] leading-[0.98] tracking-[-0.022em]">
              Instant goods for <span className="italic text-signalLime">buyers.</span><br />
              Role-based power for <span className="italic text-signalLime">operators.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="font-sans text-[15px] text-zinc-300 leading-relaxed max-w-[460px]">
              One automated fulfillment core, three permissioned views. Buyers get zero-wait digital vaults; Resellers and Admins get wholesale APIs, automated stock pools, and live node telemetry.
            </p>
          </div>
        </div>

        {/* Sharp 2-Column Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 border border-graphite bg-carbon divide-y md:divide-y-0 md:divide-x divide-graphite">
          
          {/* Left Card: Retail. */}
          <div
            className="p-8 sm:p-12 lg:p-14 flex flex-col justify-between min-h-[460px] group cursor-pointer transition-colors hover:bg-onyx/40"
            onMouseEnter={() => runCipherDecode(retailTitleRef.current, 'Retail.', 480)}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-fog group-hover:text-chalk transition-colors">+</span>
              <span className="font-sans text-[12px] font-medium tracking-[0.08em] text-zinc-300">For buyers · Instant Vault</span>
            </div>

            <div className="my-12">
              <h3
                ref={retailTitleRef}
                data-text="Retail."
                className="font-editorial italic text-[68px] sm:text-[82px] lg:text-[89px] leading-[0.94] tracking-[-0.025em] text-white group-hover:text-signalLime transition-colors mb-6"
              >
                Retail.
              </h3>
              <p className="font-sans text-[15px] text-zinc-300 leading-relaxed max-w-[340px]">
                V2Ray Reality configs, Cloud VPS root credentials, Netflix/ChatGPT/Nitro seats, and game keys minted to your vault on payment confirmation.
              </p>
            </div>

            <div>
              <a
                href="#provisioning-bench"
                className="inline-flex items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-white pb-2 border-b border-zinc-500 group-hover:border-signalLime group-hover:text-signalLime transition-colors"
              >
                <span>SEE PRODUCTS</span>
                <span className="font-mono text-xs transform group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>

          {/* Right Card: Wholesale. */}
          <div
            className="p-8 sm:p-12 lg:p-14 flex flex-col justify-between min-h-[460px] group cursor-pointer transition-colors hover:bg-onyx/40"
            onMouseEnter={() => runCipherDecode(wholesaleTitleRef.current, 'Wholesale.', 480)}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-fog group-hover:text-signalLime transition-colors">+</span>
              <span className="flex items-center gap-2 font-sans text-[12px] font-medium tracking-[0.08em] text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-signalLime glow-lime"></span>
                <span>For Resellers &amp; Agents</span>
              </span>
            </div>

            <div className="my-12">
              <h3
                ref={wholesaleTitleRef}
                data-text="Wholesale."
                className="font-editorial italic text-[68px] sm:text-[82px] lg:text-[89px] leading-[0.94] tracking-[-0.025em] text-signalLime mb-6"
              >
                Wholesale.
              </h3>
              <p className="font-sans text-[15px] text-zinc-300 leading-relaxed max-w-[340px]">
                Granular RBAC dashboard isolating buyer key vaults, reseller bulk-discount APIs, and admin stock-pool &amp; Xray node orchestration.
              </p>
            </div>

            <div>
              <a
                href="#rbac-console"
                className="inline-flex items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-white pb-2 border-b border-signalLime hover:text-signalLime transition-colors"
              >
                <span>BUILD FOR RESELLERS</span>
                <span className="font-mono text-xs transform group-hover:translate-x-1 transition-transform">↗</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
