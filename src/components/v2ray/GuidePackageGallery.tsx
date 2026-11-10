'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  VISUAL_PACKAGES,
  SUPPORTED_ISPS,
  VisualPackageCard,
} from '@/lib/v2ray-guide-data';
import {
  ArrowRight,
  Radio,
  ZoomIn,
  X,
  CheckCircle2,
  Package,
} from 'lucide-react';

interface GuidePackageGalleryProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  allPackagesTitle: string;
  browseAllLabel: string;
}

type GalleryFilter = 'ALL' | 'SLT' | 'Dialog' | 'Airtel';

const FILTER_TABS: { id: GalleryFilter; label: string }[] = [
  { id: 'ALL', label: 'All Visual Guides (8)' },
  { id: 'SLT', label: 'SLT WiFi / Fiber (4)' },
  { id: 'Dialog', label: 'Dialog SIM (3)' },
  { id: 'Airtel', label: 'Airtel (1)' },
];

export default function GuidePackageGallery({
  eyebrow,
  title,
  subtitle,
  allPackagesTitle,
  browseAllLabel,
}: GuidePackageGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('ALL');
  const [lightboxPkg, setLightboxPkg] = useState<VisualPackageCard | null>(null);

  useEffect(() => {
    if (!lightboxPkg) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxPkg(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxPkg]);

  const visiblePackages =
    activeFilter === 'ALL'
      ? VISUAL_PACKAGES
      : VISUAL_PACKAGES.filter((p) => p.isp === activeFilter);

  return (
    <section id="supported-packages" className="space-y-8 pt-6 border-t border-[#181820]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1.5">
            <Package className="w-4 h-4 text-white" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* ISP Visual Filter Options */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-black border-white/15 text-zinc-300 hover:border-white/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual ISP Package Reference Screenshots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visiblePackages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-2xl bg-[#0e0e12] border border-[#1e1e26] hover:border-white/25 transition-all flex flex-col justify-between overflow-hidden group"
          >
            <div>
              {/* Screenshot Frame */}
              <button
                type="button"
                onClick={() => setLightboxPkg(pkg)}
                aria-label={`Zoom ${pkg.title} package screenshot`}
                className="w-full bg-black border-b border-[#181820] p-3 flex items-center justify-center relative h-44 cursor-zoom-in overflow-hidden"
              >
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
                />
                <span className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/80 border border-white/15 text-[10px] font-mono text-zinc-300 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <ZoomIn className="w-3 h-3" />
                  <span>Zoom</span>
                </span>
              </button>

              {/* Card Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-400">
                    {pkg.ispLabel}
                  </span>
                  <span
                    className={`shrink-0 whitespace-nowrap text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      pkg.quotaType === 'unlimited'
                        ? 'bg-[#3ad389]/10 border-[#3ad389]/30 text-[#3ad389]'
                        : 'bg-white/5 border-white/10 text-zinc-300'
                    }`}
                  >
                    {pkg.quotaBadge}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white">
                  {pkg.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {pkg.activationHint}
                </p>
              </div>
            </div>

            {/* Footer Link */}
            <div className="px-4 py-3 border-t border-[#181820] bg-[#0b0b0f] flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">
                SNI: <code className="text-zinc-300">{pkg.sniHost}</code>
              </span>
              <Link
                href={`/products/${pkg.productId}`}
                className="text-white hover:text-[#3ad389] flex items-center gap-1 transition-colors font-semibold"
              >
                <span>View VLESS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* All Supported Packages & Quick Activation Directory */}
      <div
        id="isp-codes"
        className="rounded-2xl bg-[#0e0e12] border border-[#1e1e26] p-6 sm:p-7 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#181820]">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#3ad389]" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {allPackagesTitle}
            </h3>
          </div>
          <Link
            href="/v2ray"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold transition-all self-start sm:self-auto"
          >
            <span>{browseAllLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUPPORTED_ISPS.map((isp) => (
            <div
              key={isp.id}
              className="p-4 rounded-xl bg-[#09090d] border border-white/10 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{isp.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    {isp.networkTag}
                  </span>
                </div>

                <ul className="space-y-1.5">
                  {isp.packages.map((line) => (
                    <li
                      key={line}
                      className="text-xs font-mono text-zinc-300 flex items-start gap-2 leading-snug"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3ad389] shrink-0 mt-0.5" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                {isp.note && (
                  <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 leading-snug">
                    {isp.note}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 space-y-1.5 text-[11px] font-mono">
                <div className="text-zinc-400">
                  Activate: <span className="text-white">{isp.activationCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">
                    SNI: <code className="text-zinc-300">{isp.sniHost}</code>
                  </span>
                  <Link
                    href={`/products/${isp.productId}`}
                    className="text-zinc-200 hover:text-white underline underline-offset-4"
                  >
                    Open Plan ›
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Package Screenshot Zoom */}
      {lightboxPkg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxPkg.title}
          onClick={() => setLightboxPkg(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full rounded-2xl bg-[#0e0e12] border border-white/20 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-400">
                  {lightboxPkg.ispLabel}
                </div>
                <div className="text-sm sm:text-base font-bold text-white">
                  {lightboxPkg.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPkg(null)}
                aria-label="Close image preview"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black p-4 sm:p-6 flex items-center justify-center max-h-[70vh]">
              <img
                src={lightboxPkg.image}
                alt={lightboxPkg.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="px-5 py-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <span className="text-zinc-400">{lightboxPkg.activationHint}</span>
              <Link
                href={`/products/${lightboxPkg.productId}`}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Open Matching VLESS Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
