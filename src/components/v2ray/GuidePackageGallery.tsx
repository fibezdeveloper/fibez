'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiquidButton } from '@/components/ui/liquid-button';
import {
  VISUAL_PACKAGES,
  VisualPackageCard,
} from '@/lib/v2ray-guide-data';
import LiquidTabs from '@/components/LiquidTabs';
import {
  ArrowRight,
  ZoomIn,
  X,
  Package,
} from 'lucide-react';

interface GuidePackageGalleryProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

type GalleryFilter = 'ALL' | 'SLT' | 'Dialog' | 'Airtel';

const FILTER_TABS: { id: GalleryFilter; label: string }[] = [
  { id: 'ALL', label: 'All (8)' },
  { id: 'SLT', label: 'SLT (4)' },
  { id: 'Dialog', label: 'Dialog (3)' },
  { id: 'Airtel', label: 'Airtel (1)' },
];

export default function GuidePackageGallery({
  eyebrow,
  title,
  subtitle,
}: GuidePackageGalleryProps) {
  const router = useRouter();
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
    <section id="supported-packages" className="scroll-mt-40 space-y-8">
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
        <LiquidTabs
          ariaLabel="Filter by network"
          value={activeFilter}
          onChange={setActiveFilter}
          tabs={FILTER_TABS}
        />
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
            <div className="px-4 py-3 border-t border-[#181820] bg-[#0b0b0f]">
              <LiquidButton
                size="sm"
                variant="accent"
                className="w-full"
                onClick={() => router.push(`/products/${pkg.productId}`)}
              >
                <span>Buy now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </LiquidButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
