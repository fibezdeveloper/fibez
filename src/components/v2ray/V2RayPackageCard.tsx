'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  V2RayPackageDef,
  V2RAY_PLAN_TIERS,
  DURATION_DISCOUNTS,
  V2RayPlanTier,
} from '@/lib/v2ray-catalog';
import { useStore } from '@/lib/store-context';
import { useSiteFlags } from '@/lib/use-site-flags';
import V2RayThumbnail from './V2RayThumbnail';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Meteors } from '@/components/ui/meteors';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  Server,
  Radio,
  Copy,
  Check,
  Globe2,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Laptop,
  Layers,
  Crown,
  X,
} from 'lucide-react';

interface V2RayPackageCardProps {
  pkg: V2RayPackageDef;
  defaultServerType?: 'standard' | 'lk_ip';
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function V2RayPackageCard({
  pkg,
  defaultServerType = 'standard',
  isExpanded: controlledExpanded,
  onToggleExpand,
}: V2RayPackageCardProps) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useStore();

  const [selectedPlanId, setSelectedPlanId] = useState('basic');
  const [selectedMonths, setSelectedMonths] = useState(1);
  const siteFlags = useSiteFlags();
  const lkIpOpen = siteFlags?.lk_ip === true && pkg.hasSriLankanIpOption;
  const [serverTypeState, setServerType] = useState<'standard' | 'lk_ip'>(defaultServerType);
  // Never sell the Sri Lanka IP variant while the option is switched off.
  const serverType: 'standard' | 'lk_ip' = lkIpOpen ? serverTypeState : 'standard';
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Local fallback if parent doesn't control expansion
  const [localExpanded, setLocalExpanded] = useState(false);
  const isCardActive = controlledExpanded !== undefined ? controlledExpanded : localExpanded;

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setLocalExpanded((prev) => !prev);
    }
  };

  // Sheet behaviour: Esc closes, page behind does not scroll
  const sheetOpen = controlledExpanded !== undefined ? controlledExpanded : localExpanded;
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleExpand();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOpen]);

  useEffect(() => {
    if (defaultServerType) {
      setServerType(defaultServerType);
    }
  }, [defaultServerType]);

  // Active plan tier
  const activePlan: V2RayPlanTier =
    V2RAY_PLAN_TIERS.find((t) => t.id === selectedPlanId) || V2RAY_PLAN_TIERS[0];

  const durationDiscount =
    DURATION_DISCOUNTS.find((d) => d.months === selectedMonths) || DURATION_DISCOUNTS[0];

  const baseMonthlyPrice =
    serverType === 'lk_ip' ? activePlan.lkIpPriceLKR : activePlan.monthlyPriceLKR;

  const discountedMonthlyPrice = Math.round(
    baseMonthlyPrice * (1 - durationDiscount.discountPercent / 100)
  );
  const totalPriceLKR = discountedMonthlyPrice * selectedMonths;
  const originalTotalPriceLKR = baseMonthlyPrice * selectedMonths;
  const totalSavingsLKR = originalTotalPriceLKR - totalPriceLKR;
  const priceUSD = parseFloat((totalPriceLKR / 305).toFixed(2));

  const copyReloadCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pkg.reloadCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const productItem = {
      id: `${pkg.id}-${activePlan.id}-${serverType}-${selectedMonths}m`,
      category: 'vpn' as const,
      brand: 'Fibez Net',
      title: `${pkg.title} [${activePlan.name} · ${activePlan.quotaLabel}] (${serverType === 'lk_ip' ? 'Sri Lankan IP' : 'Singapore SG3'}) - ${selectedMonths} Month${selectedMonths > 1 ? 's' : ''}`,
      description: `${pkg.description} - Plan: ${activePlan.name} (${activePlan.quotaLabel}), Device Limit: ${activePlan.deviceLimit} Device${activePlan.deviceLimit > 1 ? 's' : ''}, Node: ${activePlan.nodeType}, Duration: ${selectedMonths} Month${selectedMonths > 1 ? 's' : ''}.`,
      priceUSD,
      priceLKR: totalPriceLKR,
      stockCount: 100,
      badge: activePlan.badge || pkg.badge || 'VERIFIED',
      isInstant: true,
      durations: [
        {
          label: `${activePlan.name} (${selectedMonths * 30} Days)`,
          days: selectedMonths * 30,
          multiplier: 1,
        },
      ],
      guideMarkdown: `Import config link into NetMod or v2rayNG. Masquerades SNI: ${pkg.sni}. Includes ${activePlan.configsCount} config link(s).`,
      warranty: '24-hour instant connection guarantee. Bypasses Sri Lankan ISP restrictions.',
      protocol: 'VLESS' as const,
      isps: [pkg.isp as any],
      sniMasquerade: pkg.sni,
      location: serverType === 'lk_ip' ? 'Sri Lanka' : 'Singapore SG3',
    };

    addToCart(productItem, 0, pkg.isp);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleInstantBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleAddToCart(e);
    setIsCartOpen(true);
    router.push('/cart');
  };

  return (
    <div
      onClick={toggleExpand}
      className={`group relative rounded-[20px] bg-[#09090c] border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer select-none ${
        isCardActive
          ? 'border-[#3ad389]/60 shadow-[0_0_35px_-8px_rgba(58,211,137,0.22)] ring-1 ring-[#3ad389]/40'
          : 'border-[#1b1b20] hover:border-zinc-700/80 hover:shadow-lg'
      }`}
    >
      {/* Proximity Glowing Border Effect */}
      <GlowingEffect color="emerald" proximity={55} />

      {/* Top Banner Ribbon for Popular / Bestsellers */}
      {pkg.badge && (
        <div className="absolute top-3 right-3 z-20">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-bold uppercase shadow-md ${
              pkg.badge.includes('NO SPEED')
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : pkg.badge.includes('BEST')
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-[#3ad389]/20 text-[#3ad389] border border-[#3ad389]/30'
            }`}
          >
            {pkg.badge}
          </span>
        </div>
      )}

      {/* Main Body */}
      <div className="p-4 sm:p-5 flex flex-col h-full">
        {/* Dynamic Visual ISP Header with Real Carrier Logos */}
        <div className="w-full mb-3.5">
          <V2RayThumbnail
            isp={pkg.isp}
            category={pkg.categoryLabel}
            port={pkg.inboundPort}
            sni={pkg.sni}
            hasSriLankanIp={pkg.hasSriLankanIpOption}
            serverType={serverType === 'lk_ip' ? 'LK_IP' : 'STANDARD'}
            badge={pkg.badge}
          />
        </div>

        {/* Title & Target Indicator */}
        <div className="flex items-start justify-between gap-2 mt-1">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#3ad389] transition-colors line-clamp-1">
              {pkg.title}
            </h3>
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
              <span>{pkg.targetMedium}</span>
            </span>
          </div>
        </div>

        {/* Reload Instruction Badge with 1-Click Copy */}
        <div className="mt-3 p-2.5 rounded-xl bg-[#121216] border border-[#1e1e26] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
              Required Reload / Activation
            </span>
            <span className="text-xs font-mono font-medium text-zinc-200 truncate block">
              {pkg.reloadCode}
            </span>
          </div>
          <button
            type="button"
            onClick={copyReloadCode}
            title="Copy reload instructions"
            className="p-1.5 rounded-lg bg-[#181820] hover:bg-[#22222c] border border-white/5 text-zinc-400 hover:text-white transition-all shrink-0 cursor-pointer"
          >
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-[#3ad389]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Carrier Speed Limit & SNI Masquerade */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span className="truncate max-w-[200px]" title={pkg.carrierSpeedNote}>
            {pkg.carrierSpeedNote}
          </span>
          <span className="text-zinc-500 font-mono text-[10px]">
            Inbound #{pkg.inboundId}
          </span>
        </div>

        {/* Price teaser + one clear action. The plan picker opens in a sheet so the card never stretches. */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[#1a1a22]">
          <div>
            <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">Starting from</span>
            <div className="text-lg font-black font-mono text-white flex items-baseline gap-1">
              <span>{V2RAY_PLAN_TIERS[0].monthlyPriceLKR}</span>
              <span className="text-[11px] font-sans text-zinc-400 font-normal">LKR / mo</span>
            </div>
          </div>

          <AnimatedButton
            variant="emerald"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="text-xs font-mono font-bold"
          >
            <span>Choose plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </AnimatedButton>
        </div>
      </div>

      {isCardActive && mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={`Choose a plan for ${pkg.title}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-[24px] sm:rounded-[24px] bg-[#0b0b0f] border border-[#26262d] shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 p-5 pb-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white tracking-tight truncate">{pkg.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">
                    {pkg.targetMedium} · {pkg.carrierSpeedNote}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleExpand}
                  aria-label="Close"
                  className="p-2 -m-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable choices */}
              <div className="px-5 pb-4 overflow-y-auto space-y-5">
                {lkIpOpen && (
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Server location</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'standard', title: 'Singapore', sub: 'Fastest · included' },
                        { id: 'lk_ip', title: 'Sri Lanka IP', sub: 'For local bank apps · +Rs 300' },
                      ].map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setServerType(o.id as 'standard' | 'lk_ip')}
                          className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                            serverType === o.id
                              ? 'bg-[#3ad389]/10 border-[#3ad389]'
                              : 'bg-[#111116] border-[#202028] hover:border-zinc-600'
                          }`}
                        >
                          <div className="text-sm font-semibold text-white">{o.title}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">{o.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Plan</div>
                  <div className="space-y-2">
                    {V2RAY_PLAN_TIERS.map((tier) => {
                      const monthly = serverType === 'lk_ip' ? tier.lkIpPriceLKR : tier.monthlyPriceLKR;
                      const selected = selectedPlanId === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedPlanId(tier.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer flex items-center gap-3 ${
                            selected ? 'bg-[#3ad389]/10 border-[#3ad389]' : 'bg-[#111116] border-[#202028] hover:border-zinc-600'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                              selected ? 'border-[#3ad389] bg-[#3ad389]' : 'border-zinc-600'
                            }`}
                          >
                            {selected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-white capitalize">{tier.name.toLowerCase()}</span>
                              {tier.badge && (
                                <span className="px-1.5 rounded text-[9px] font-mono font-bold bg-[#3ad389]/15 text-[#3ad389] border border-[#3ad389]/25">
                                  {tier.badge}
                                </span>
                              )}
                            </span>
                            <span className="block text-[11px] text-zinc-400 mt-0.5">
                              {tier.quotaLabel.replace(' GB', tier.quotaGB > 0 ? ' GB' : ' data')} · {tier.deviceLimit} device
                              {tier.deviceLimit > 1 ? 's' : ''}
                              {tier.configsCount > 1 ? ` · ${tier.configsCount} configs` : ''}
                            </span>
                          </span>
                          <span className="text-right shrink-0">
                            <span className="block text-sm font-bold font-mono text-white">Rs {monthly.toLocaleString()}</span>
                            <span className="block text-[10px] text-zinc-500">per month</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-2 leading-snug">{activePlan.features}</p>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">How long</div>
                  <div className="grid grid-cols-4 gap-2">
                    {DURATION_DISCOUNTS.map((d) => {
                      const selected = selectedMonths === d.months;
                      return (
                        <button
                          key={d.months}
                          type="button"
                          onClick={() => setSelectedMonths(d.months)}
                          className={`py-2 rounded-xl border text-center transition-colors cursor-pointer ${
                            selected
                              ? 'bg-[#3ad389] border-[#3ad389] text-black'
                              : 'bg-[#111116] border-[#202028] text-zinc-200 hover:border-zinc-600'
                          }`}
                        >
                          <div className="text-sm font-bold">{d.months}</div>
                          <div className={`text-[10px] ${selected ? 'text-black/70' : d.discountPercent > 0 ? 'text-[#3ad389]' : 'text-zinc-500'}`}>
                            {d.discountPercent > 0 ? `save ${d.discountPercent}%` : d.months === 1 ? 'month' : 'months'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sticky footer: total + the one action */}
              <div className="p-5 pt-4 border-t border-[#1d1d24] bg-[#0b0b0f] rounded-b-[24px] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="text-[11px] text-zinc-400">
                      {activePlan.name.charAt(0) + activePlan.name.slice(1).toLowerCase()} · {selectedMonths} month{selectedMonths > 1 ? 's' : ''}
                    </div>
                    <div className="text-2xl font-black font-mono text-white flex items-baseline gap-1">
                      {totalPriceLKR.toLocaleString()} <span className="text-xs font-sans font-medium text-zinc-400">LKR</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    {totalSavingsLKR > 0 && <div className="text-[#3ad389] font-semibold">You save Rs {totalSavingsLKR.toLocaleString()}</div>}
                    <div className="text-zinc-500">≈ ${(totalPriceLKR / 305).toFixed(2)} USD</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInstantBuy}
                  className="w-full py-3 rounded-xl bg-[#3ad389] hover:bg-[#32be7a] text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Buy now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleAddToCart(e);
                    window.setTimeout(() => {
                      if (onToggleExpand) onToggleExpand();
                      else setLocalExpanded(false);
                    }, 700);
                  }}
                  className="w-full mt-2 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAdded ? 'Added to cart ✓' : 'Add to cart and keep browsing'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
