'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  V2RayPackageDef,
  V2RAY_PLAN_TIERS,
  DURATION_DISCOUNTS,
  V2RayPlanTier,
} from '@/lib/v2ray-catalog';
import { useStore } from '@/lib/store-context';
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
  const [serverType, setServerType] = useState<'standard' | 'lk_ip'>(defaultServerType);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

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
      pingMs: serverType === 'lk_ip' ? 22 : 18,
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

        {/* ============================================================== */}
        {/* COLLAPSED TEASER BAR (Visible when NOT expanded)               */}
        {/* ============================================================== */}
        {!isCardActive && (
          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[#1a1a22]">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
                Starting From
              </span>
              <div className="text-lg font-black font-mono text-white flex items-baseline gap-1">
                <span>{V2RAY_PLAN_TIERS[0].monthlyPriceLKR}</span>
                <span className="text-[11px] font-sans text-zinc-400 font-normal">
                  LKR / mo
                </span>
              </div>
            </div>

            <AnimatedButton
              variant="default"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                toggleExpand();
              }}
              className="text-xs font-mono text-[#3ad389] font-medium"
            >
              <span>Choose Plan &amp; Buy</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#3ad389]" />
            </AnimatedButton>
          </div>
        )}

        {/* ============================================================== */}
        {/* EXPANDED CONTROLS DRAWER (Click-to-Expand)                     */}
        {/* ============================================================== */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isCardActive
              ? 'max-h-[850px] opacity-100 mt-3.5 pointer-events-auto'
              : 'max-h-0 opacity-0 overflow-hidden mt-0 pointer-events-none'
          }`}
        >
          {/* Server Routing Mode Switcher (Standard SG vs Sri Lankan IP) */}
          {pkg.hasSriLankanIpOption && (
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className="uppercase tracking-wider">Server Routing Location:</span>
                {serverType === 'lk_ip' && (
                  <span className="text-amber-400 text-[10px]">Local Bank Safe</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 bg-[#141419] p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setServerType('standard')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    serverType === 'standard'
                      ? 'bg-[#1e1e26] text-white font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Zap className="w-3 h-3 text-[#3ad389]" />
                  <span>Standard SG (18ms)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setServerType('lk_ip')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    serverType === 'lk_ip'
                      ? 'bg-[#3ad389]/10 text-[#3ad389] border border-[#3ad389]/30 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Routes via Sri Lankan residential node for banking & local services"
                >
                  <span>🇱🇰 Sri Lankan IP (+300)</span>
                </button>
              </div>

              {serverType === 'lk_ip' && (
                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[10px] font-mono text-emerald-300 leading-snug">
                  🛡️ <strong>Sri Lankan IP:</strong> Bypasses foreign IP security flags on BOC, Sampath, and Commercial Bank apps.
                </div>
              )}
            </div>
          )}

          {/* Service Plan Selection (Basic, Standard, Premium, Private, Streaming) */}
          <div className="w-full mt-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="uppercase tracking-wider">Select Service Plan Tier:</span>
              <span className="text-emerald-400 font-bold">{activePlan.name} ({activePlan.quotaLabel})</span>
            </div>

            <div className="space-y-1.5">
              {V2RAY_PLAN_TIERS.map((tier) => {
                const tierMonthly =
                  serverType === 'lk_ip' ? tier.lkIpPriceLKR : tier.monthlyPriceLKR;
                const isSelected = selectedPlanId === tier.id;

                return (
                  <div
                    key={tier.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlanId(tier.id);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#141419] border-[#3ad389] ring-1 ring-[#3ad389]/30'
                        : 'bg-[#0f0f13] border-[#1d1d24] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-[#3ad389] bg-[#3ad389]'
                            : 'border-zinc-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{tier.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            • {tier.quotaLabel}
                          </span>
                          {tier.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#3ad389]/10 text-[#3ad389] border border-[#3ad389]/20">
                              {tier.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                          {tier.deviceLimit} Device{tier.deviceLimit > 1 ? 's' : ''} • {tier.nodeType}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-white">
                        Rs {tierMonthly.toLocaleString()}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500">/ month</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billing Duration Discounts */}
          <div className="w-full mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="uppercase tracking-wider">Billing Duration &amp; Discounts:</span>
              {durationDiscount.discountPercent > 0 && (
                <span className="text-[#3ad389] font-bold">
                  {durationDiscount.discountPercent}% OFF APPLIED
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DURATION_DISCOUNTS.map((d) => {
                const isSelected = selectedMonths === d.months;
                return (
                  <button
                    key={d.months}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMonths(d.months);
                    }}
                    className={`py-2 px-1.5 rounded-xl text-[10px] font-mono transition-all text-center border cursor-pointer ${
                      isSelected
                        ? 'bg-[#3ad389] text-black font-bold border-[#3ad389] shadow-sm'
                        : 'bg-[#121217] text-zinc-300 hover:text-white border-[#202029]'
                    }`}
                  >
                    <div>{d.months} Mo</div>
                    <div
                      className={`text-[9px] ${
                        isSelected
                          ? 'text-black/80 font-semibold'
                          : d.discountPercent > 0
                          ? 'text-[#3ad389]'
                          : 'text-zinc-500'
                      }`}
                    >
                      {d.discountPercent > 0 ? `-${d.discountPercent}% OFF` : 'Regular'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Strip */}
          <div className="w-full mt-3 p-2.5 rounded-xl bg-[#121217] border border-[#1e1e26] space-y-1.5 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-zinc-400" />
                <span>Simultaneous Devices:</span>
              </span>
              <span className="text-white font-semibold">{activePlan.deviceLimit} Device Limit</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-zinc-400" />
                <span>Infrastructure Node:</span>
              </span>
              <span className="text-zinc-200 font-semibold">{activePlan.nodeType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Generated Configs:</span>
              </span>
              <span className="text-[#3ad389] font-semibold">
                {activePlan.configsCount} {activePlan.configsCount > 1 ? 'Configs (Streaming + Gaming)' : 'Config'}
              </span>
            </div>
            <div className="pt-1 border-t border-white/5 text-[10px] text-zinc-400 leading-tight">
              {activePlan.features}
            </div>
          </div>

          {/* Dynamic Price & Instant Action Buttons */}
          <div className="w-full mt-4 pt-3 border-t border-[#1f1f26]">
            <div className="flex items-baseline justify-between mb-3.5">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">
                  Total for {selectedMonths} Month{selectedMonths > 1 ? 's' : ''} ({activePlan.name})
                </span>
                <div className="text-2xl font-black font-mono text-white tracking-tight flex items-baseline gap-1">
                  <span>{totalPriceLKR.toLocaleString()}</span>
                  <span className="text-xs font-sans text-zinc-400 font-medium">LKR</span>
                </div>
                {totalSavingsLKR > 0 && (
                  <span className="text-[10px] font-mono text-[#3ad389] font-bold">
                    You save Rs {totalSavingsLKR.toLocaleString()} LKR!
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  ≈ ${(totalPriceLKR / 305).toFixed(2)} USD
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Rs {discountedMonthlyPrice.toLocaleString()} / mo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <AnimatedButton
                variant="dark"
                size="sm"
                onClick={handleAddToCart}
                className="py-2.5 px-3 text-xs font-mono font-medium"
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#3ad389]" />
                    <span className="text-[#3ad389] font-bold">Added!</span>
                  </>
                ) : (
                  <span>Add to Cart</span>
                )}
              </AnimatedButton>

              <AnimatedButton
                variant="emerald"
                size="sm"
                onClick={handleInstantBuy}
                className="py-2.5 px-3 text-xs font-mono font-bold"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </AnimatedButton>
            </div>

            {/* Collapse toggle button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
              className="w-full mt-2.5 py-1 text-center text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Hide Controls</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
