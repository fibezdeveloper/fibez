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

  // Nothing is chosen until the visitor picks a plan; the duration, coupon and total then open up.
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [couponOpen, setCouponOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [refInput, setRefInput] = useState('');
  const [appliedRef, setAppliedRef] = useState<{ code: string; discountLKR: number } | null>(null);
  const [refError, setRefError] = useState<string | null>(null);
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
  const chosenPlan: V2RayPlanTier | undefined = V2RAY_PLAN_TIERS.find((t) => t.id === selectedPlanId);
  const activePlan: V2RayPlanTier = chosenPlan || V2RAY_PLAN_TIERS[0];

  const durationDiscount =
    DURATION_DISCOUNTS.find((d) => d.months === selectedMonths) || DURATION_DISCOUNTS[0];

  const monthlyFor = (tier: V2RayPlanTier, months: number) => {
    const base = serverType === 'lk_ip' ? tier.lkIpPriceLKR : tier.monthlyPriceLKR;
    const pct = (DURATION_DISCOUNTS.find((d) => d.months === months) || DURATION_DISCOUNTS[0]).discountPercent;
    return Math.round(base * (1 - pct / 100)) * months;
  };

  const baseMonthlyPrice =
    serverType === 'lk_ip' ? activePlan.lkIpPriceLKR : activePlan.monthlyPriceLKR;

  const discountedMonthlyPrice = Math.round(
    baseMonthlyPrice * (1 - durationDiscount.discountPercent / 100)
  );
  const totalPriceLKR = discountedMonthlyPrice * selectedMonths;
  const originalTotalPriceLKR = baseMonthlyPrice * selectedMonths;
  const totalSavingsLKR = originalTotalPriceLKR - totalPriceLKR;
  const promoDiscountLKR = appliedPromo ? Math.round(totalPriceLKR * (appliedPromo.percent / 100)) : 0;
  const refDiscountLKR = appliedRef ? appliedRef.discountLKR : 0;
  const payableLKR = Math.max(0, totalPriceLKR - promoDiscountLKR - refDiscountLKR);
  const priceUSD = parseFloat((totalPriceLKR / 305).toFixed(2));

  const applyPromo = async () => {
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedPromo({ code: data.code, percent: data.discountPercent || 10 });
        try { localStorage.setItem('fibez_promo', data.code); } catch {}
      } else {
        setAppliedPromo(null);
        setPromoError(data.message || data.error || 'That code is not valid.');
      }
    } catch {
      setPromoError('Could not check the code. Try again.');
    }
  };

  const applyReferral = async () => {
    setRefError(null);
    const code = refInput.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', code }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedRef({ code, discountLKR: data.discountLKR || 50 });
        try { localStorage.setItem('fibez_ref', code); } catch {}
      } else {
        setAppliedRef(null);
        setRefError(data.message || 'Referral code not found or expired.');
      }
    } catch {
      setRefError('Could not check the code. Try again.');
    }
  };

  const copyReloadCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pkg.reloadCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!chosenPlan) return;
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
          ? 'border-[#8b5cf6]/60 shadow-[0_0_35px_-8px_rgba(124,58,237,0.32)] ring-1 ring-[#8b5cf6]/40'
          : 'border-[#1b1b20] hover:border-zinc-700/80 hover:shadow-lg'
      }`}
    >
      {/* Proximity Glowing Border Effect */}
      <GlowingEffect color="rgba(139, 92, 246, 0.85)" proximity={55} />

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
            <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#b79cff] transition-colors line-clamp-1">
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
            variant="purple"
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
            aria-label={`Select a package for ${pkg.title}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-[24px] sm:rounded-[24px] bg-[#0c0a14] border border-[#2a2340] shadow-2xl shadow-[#7c3aed]/10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-[#221c36]">
                <h3 className="text-lg font-bold text-white tracking-tight">Select Package</h3>
                <button
                  type="button"
                  onClick={toggleExpand}
                  aria-label="Close"
                  className="p-2 -m-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto">
                {/* What you are buying */}
                <div className="px-5 py-4 space-y-3 border-b border-[#221c36]">
                  <div className="min-w-0">
                    <div className="text-base font-bold text-white leading-snug">{pkg.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{pkg.isp} · {pkg.categoryLabel}</div>
                  </div>
                  <div className="space-y-1.5 text-sm text-zinc-200">
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-[#a78bfa] shrink-0" />
                      <span>{serverType === 'lk_ip' ? 'Sri Lanka IP' : 'Singapore server'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#a78bfa] shrink-0" />
                      <span>{chosenPlan ? `${selectedMonths * 30} days` : '30 days per month'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#a78bfa] shrink-0" />
                      <span>Torrent traffic is blocked</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-sm text-zinc-300">
                    <li className="flex items-start gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-2 shrink-0" />{pkg.targetMedium}</li>
                    <li className="flex items-start gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-2 shrink-0" />{pkg.carrierSpeedNote}</li>
                    {chosenPlan && (
                      <li className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] mt-2 shrink-0" />
                        {chosenPlan.deviceLimit} device{chosenPlan.deviceLimit > 1 ? 's' : ''}
                        {chosenPlan.configsCount > 1 ? ` · ${chosenPlan.configsCount} configs` : ''}
                      </li>
                    )}
                  </ul>
                </div>

                {lkIpOpen && (
                  <div className="px-5 py-4 border-b border-[#221c36]">
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
                              ? 'bg-[#7c3aed]/15 border-[#8b5cf6]'
                              : 'bg-[#120f1d] border-[#2a2340] hover:border-zinc-600'
                          }`}
                        >
                          <div className="text-sm font-semibold text-white">{o.title}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">{o.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: data package */}
                <div className="px-5 py-4 border-b border-[#221c36]">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Data package</div>
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
                            selected ? 'bg-[#7c3aed]/15 border-[#8b5cf6]' : 'bg-[#120f1d] border-[#2a2340] hover:border-zinc-600'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                              selected ? 'border-[#8b5cf6] bg-[#8b5cf6]' : 'border-zinc-600'
                            }`}
                          >
                            {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-white capitalize">{tier.name.toLowerCase()}</span>
                              {tier.badge && (
                                <span className="px-1.5 rounded text-[9px] font-mono font-bold bg-[#7c3aed]/25 text-[#c4b5fd] border border-[#8b5cf6]/40">
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
                  {chosenPlan && <p className="text-[11px] text-zinc-500 mt-2 leading-snug">{chosenPlan.features}</p>}
                </div>

                {/* Step 2 and 3 open once a package is chosen */}
                {chosenPlan && (
                  <>
                    <div className="px-5 py-4 border-b border-[#221c36] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">How long</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {DURATION_DISCOUNTS.map((d) => {
                          const selected = selectedMonths === d.months;
                          const total = monthlyFor(chosenPlan, d.months);
                          const full = (serverType === 'lk_ip' ? chosenPlan.lkIpPriceLKR : chosenPlan.monthlyPriceLKR) * d.months;
                          return (
                            <button
                              key={d.months}
                              type="button"
                              onClick={() => setSelectedMonths(d.months)}
                              className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                                selected
                                  ? 'bg-[#7c3aed]/20 border-[#8b5cf6] ring-1 ring-[#8b5cf6]/50'
                                  : 'bg-[#120f1d] border-[#2a2340] hover:border-zinc-600'
                              }`}
                            >
                              <div className="text-sm font-bold text-white">
                                {d.months} {d.months === 1 ? 'month' : 'months'}
                              </div>
                              <div className="text-xs text-zinc-300 mt-0.5">Rs {total.toLocaleString()}</div>
                              <div className={`text-[10px] mt-0.5 ${d.discountPercent > 0 ? 'text-[#c4b5fd] font-semibold' : 'text-zinc-500'}`}>
                                {d.discountPercent > 0 ? `−${d.discountPercent}% · save ${(full - total).toLocaleString()}` : '30 days'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-b border-[#221c36] animate-in fade-in slide-in-from-top-2 duration-200">
                      <button
                        type="button"
                        onClick={() => setCouponOpen((v) => !v)}
                        aria-expanded={couponOpen}
                        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-sm text-zinc-200 hover:text-white cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-[#a78bfa]" />
                          <span>Coupon or referral code</span>
                          {(appliedPromo || appliedRef) && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#7c3aed]/25 text-[#c4b5fd] border border-[#8b5cf6]/40">applied</span>
                          )}
                        </span>
                        {couponOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                      </button>

                      {couponOpen && (
                        <div className="px-5 pb-4 space-y-3">
                          <div>
                            <div className="flex gap-2">
                              <input
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                                placeholder="DISCOUNT CODE"
                                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-black border border-[#2a2340] text-sm text-white placeholder-zinc-600 uppercase font-mono focus:outline-none focus:border-[#8b5cf6]"
                              />
                              <button
                                type="button"
                                onClick={applyPromo}
                                className="px-4 rounded-xl bg-[#1a1530] hover:bg-[#241c42] border border-[#2a2340] text-xs font-mono font-bold text-white cursor-pointer"
                              >
                                APPLY
                              </button>
                            </div>
                            {appliedPromo && (
                              <p className="text-[11px] text-[#c4b5fd] mt-1.5">&ldquo;{appliedPromo.code}&rdquo; applied: {appliedPromo.percent}% off</p>
                            )}
                            {promoError && <p className="text-[11px] text-rose-400 mt-1.5">{promoError}</p>}
                          </div>

                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">Referral code (optional)</div>
                            <div className="flex gap-2">
                              <input
                                value={refInput}
                                onChange={(e) => setRefInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyReferral()}
                                placeholder="Enter referral code"
                                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-black border border-[#2a2340] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#8b5cf6]"
                              />
                              <button
                                type="button"
                                onClick={applyReferral}
                                className="px-4 rounded-xl bg-[#1a1530] hover:bg-[#241c42] border border-[#2a2340] text-xs font-mono font-bold text-white cursor-pointer"
                              >
                                APPLY
                              </button>
                            </div>
                            {appliedRef && (
                              <p className="text-[11px] text-[#c4b5fd] mt-1.5">&ldquo;{appliedRef.code}&rdquo; applied: Rs {appliedRef.discountLKR} off</p>
                            )}
                            {refError && <p className="text-[11px] text-rose-400 mt-1.5">{refError}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Totals and the one action */}
              <div className="px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-[#221c36] bg-[#0c0a14] rounded-b-[24px]">
                {chosenPlan ? (
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-sm text-zinc-300">
                      <span>Subtotal</span>
                      <span className="font-mono">{totalPriceLKR.toLocaleString()} LKR</span>
                    </div>
                    {(promoDiscountLKR > 0 || refDiscountLKR > 0) && (
                      <div className="flex items-center justify-between text-sm text-[#c4b5fd]">
                        <span>Discount</span>
                        <span className="font-mono">−{(promoDiscountLKR + refDiscountLKR).toLocaleString()} LKR</span>
                      </div>
                    )}
                    <div className="flex items-end justify-between pt-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Total</span>
                      <span className="text-right">
                        <span className="block text-2xl font-black font-mono text-white leading-none">
                          {payableLKR.toLocaleString()} <span className="text-xs font-sans font-medium text-zinc-400">LKR</span>
                        </span>
                        <span className="block text-[11px] text-zinc-500 mt-1">≈ ${(payableLKR / 305).toFixed(2)} USD</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 mb-3">Choose a data package to see the price.</p>
                )}

                <button
                  type="button"
                  disabled={!chosenPlan}
                  onClick={handleInstantBuy}
                  className="w-full py-3 rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6] disabled:bg-[#1c1730] disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={!chosenPlan}
                  onClick={(e) => {
                    handleAddToCart(e);
                    window.setTimeout(() => {
                      if (onToggleExpand) onToggleExpand();
                      else setLocalExpanded(false);
                    }, 700);
                  }}
                  className="w-full mt-2 py-2 text-xs font-mono text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
