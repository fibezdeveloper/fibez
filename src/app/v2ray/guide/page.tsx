'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PRODUCTS, ProductItem } from '@/lib/products';
import {
  ClientTabId,
  GUIDE_COPY,
  GuideLang,
} from '@/lib/v2ray-guide-data';
import GuidePackageGallery from '@/components/v2ray/GuidePackageGallery';
import GuidePlanWizard from '@/components/v2ray/GuidePlanWizard';
import GuideFaqSection from '@/components/v2ray/GuideFaqSection';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Download,
  Globe,
  Laptop,
  Layers,
  ShieldCheck,
  Smartphone,
  Terminal,
} from 'lucide-react';

const LANG_OPTIONS: { id: GuideLang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'si', label: 'සිංහල' },
  { id: 'ta', label: 'தமிழ்' },
];

const CLIENT_HASH_MAP: Record<string, ClientTabId> = {
  '#netmod-pc': 'netmod-pc',
  '#netmod-android': 'netmod-android',
  '#v2rayng': 'v2rayng',
  '#ios-macos': 'ios-macos',
};

export default function V2RayGuidePage() {
  const [lang, setLang] = useState<GuideLang>('en');
  const [activeClientTab, setActiveClientTab] = useState<ClientTabId>('netmod-pc');
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    const syncHash = () => {
      const targetTab = CLIENT_HASH_MAP[window.location.hash];
      if (targetTab) {
        setActiveClientTab(targetTab);
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => {
    fetch('/api/products?category=vpn')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length > 0) {
          const merged = PRODUCTS.filter((p) => p.category === 'vpn').map((local) => {
            const remote = data.products.find((d: any) => d.id === local.id);
            if (!remote) return local;
            return {
              ...local,
              priceLKR: Number(remote.price_lkr),
              priceUSD: Number(remote.price_usd),
              stockCount: Number(remote.stock_count),
            };
          });
          setLiveProducts(merged);
        }
      })
      .catch(() => {});
  }, []);

  const copy = GUIDE_COPY[lang];
  const selectedClient =
    copy.clients.find((c) => c.id === activeClientTab) || copy.clients[0];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-300">
      {/* Header / Hero */}
      <section className="relative pt-10 pb-14 border-b border-[#181820] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f2a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          {/* Top Bar: Back + Language Options */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#3ad389] animate-pulse" />
              <Terminal className="w-3.5 h-3.5 text-white" />
              <span>{copy.heroBadge}</span>
            </div>

            {/* English | සිංහල | தமிழ் Language Options */}
            <div
              role="group"
              aria-label="Guide language options"
              className="inline-flex items-center p-1 rounded-full bg-black border border-white/15"
            >
              {LANG_OPTIONS.map((opt) => {
                const isActive = lang === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLang(opt.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-black font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              {copy.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {copy.heroDesc}
            </p>
          </div>

          {/* Quick Navigation CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#plan-finder"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs font-mono flex items-center gap-1.5 transition-all shadow"
            >
              <span>{copy.heroCtaFind}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="#supported-packages"
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-white/10 border border-white/15 text-zinc-200 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <span>{copy.heroCtaPackages}</span>
            </a>

            <a
              href="#setup-clients"
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-white/10 border border-white/15 text-zinc-200 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <span>{copy.heroCtaApps}</span>
            </a>

            <Link
              href="/v2ray#line-check"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-[#3ad389]" />
              <span>{copy.heroCtaLineCheck}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Guide Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Section 1: How the Data Works + One Rule */}
        <section className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1.5">
              <Layers className="w-4 h-4 text-white" />
              <span>{copy.howEyebrow}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {copy.howTitle}
            </h2>
          </div>

          {/* Highlighted One Rule Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] border-l-2 border-l-[#3ad389] space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#3ad389] font-semibold">
              {copy.ruleLabel}
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {copy.ruleBody}
            </p>
          </div>

          {/* 01 / 02 / 03 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {copy.steps.map((st) => (
              <div
                key={st.num}
                className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-2.5"
              >
                <div className="text-xs font-mono font-bold text-[#3ad389]">
                  {st.num}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {st.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{st.body}</p>
              </div>
            ))}
          </div>

          {/* Visual Connection Pipeline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0b0f] border border-white/10 space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-400">
              {copy.pipelineLabel}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-white">
                {copy.pipelineSteps[0]}
              </span>
              <span className="text-zinc-600 hidden sm:inline">─►</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-zinc-200">
                {copy.pipelineSteps[1]}
              </span>
              <span className="text-zinc-600 hidden sm:inline">─►</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-[#3ad389]/15 border border-[#3ad389]/30 text-[#3ad389] font-semibold">
                {copy.pipelineSteps[2]}
              </span>
              <span className="text-zinc-600 hidden sm:inline">─►</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-white text-black font-semibold">
                {copy.pipelineSteps[3]}
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Frequently Asked Questions */}
        <GuideFaqSection
          eyebrow={copy.faqEyebrow}
          title={copy.faqTitle}
          subtitle={copy.faqSubtitle}
          goodToKnowTitle={copy.goodToKnowTitle}
          goodToKnowPoints={copy.goodToKnowPoints}
          faqs={copy.faqs}
        />

        {/* Section 3: Three Quick Examples */}
        <section className="space-y-6 pt-6 border-t border-[#181820]">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1.5">
              {copy.examplesEyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {copy.examplesTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {copy.examples.map((ex, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-3"
              >
                <span
                  className={`inline-block text-[10px] font-mono uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full border ${
                    ex.isUnlimited
                      ? 'bg-[#3ad389]/10 border-[#3ad389]/30 text-[#3ad389]'
                      : 'bg-white/5 border-white/10 text-zinc-400'
                  }`}
                >
                  {ex.tag}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {ex.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{ex.body}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-black border border-white/10 text-xs text-zinc-400 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
            <span>{copy.speedDisclaimer}</span>
          </div>
        </section>

        {/* Section 4: Exit Location Guide */}
        <section className="space-y-6 pt-6 border-t border-[#181820]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1.5">
              <Globe className="w-4 h-4 text-white" />
              <span>{copy.exitEyebrow}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {copy.exitTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl">
              {copy.exitSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {copy.exitCards.map((card, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <span
                    className={`inline-block text-[10px] font-mono uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full border ${
                      card.availableOnFibez
                        ? 'bg-[#3ad389]/10 border-[#3ad389]/30 text-[#3ad389]'
                        : 'bg-white/5 border-white/10 text-zinc-400'
                    }`}
                  >
                    {card.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {card.body}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/5 text-xs font-mono text-zinc-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#3ad389] shrink-0" />
                  <span>{card.note}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Supported Packages Visual Gallery + Directory */}
        <GuidePackageGallery
          eyebrow={copy.packagesEyebrow}
          title={copy.packagesTitle}
          subtitle={copy.packagesSubtitle}
          allPackagesTitle={copy.allPackagesTitle}
          browseAllLabel={copy.browseAllBtn}
        />

        {/* Section 6: Device & Client Setup Options */}
        <section id="setup-clients" className="space-y-6 pt-6 border-t border-[#181820]">
          {/* Deep-link hash anchors */}
          <span id="netmod-pc" className="sr-only" />
          <span id="netmod-android" className="sr-only" />
          <span id="v2rayng" className="sr-only" />
          <span id="ios-macos" className="sr-only" />

          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1.5">
              <Cpu className="w-4 h-4 text-white" />
              <span>{copy.clientsEyebrow}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {copy.clientsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl">
              {copy.clientsSubtitle}
            </p>
          </div>

          {/* Client Option Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {copy.clients.map((client) => {
              const isActive = selectedClient.id === client.id;
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setActiveClientTab(client.id)}
                  className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-black border-white/15 text-zinc-300 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {client.id === 'netmod-pc' ? (
                    <Laptop className="w-3.5 h-3.5" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5" />
                  )}
                  <span>{client.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Client Card */}
          <div className="rounded-2xl bg-[#0e0e12] border border-[#1e1e26] p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                    {selectedClient.badge}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    {selectedClient.platform}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {selectedClient.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                  {selectedClient.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {selectedClient.downloads.map((dl, i) => (
                  <a
                    key={i}
                    href={dl.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-black hover:bg-white/10 border border-white/15 text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{dl.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedClient.steps.map((st, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-black border border-white/10 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white font-mono">
                    <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[11px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{st.title}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                    {st.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2.5 text-xs text-zinc-300 bg-[#09090d] border border-white/10 rounded-xl p-3.5">
              <CheckCircle2 className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
              <span>{selectedClient.proTip}</span>
            </div>
          </div>
        </section>

        {/* Section 7: 3-Tap Interactive Plan Finder */}
        <GuidePlanWizard
          eyebrow={copy.wizardEyebrow}
          title={copy.wizardTitle}
          stepLabels={copy.wizardStepLabels}
          step1Question={copy.wizardStep1Q}
          step2Question={copy.wizardStep2Q}
          step2Subtitle={copy.wizardStep2Sub}
          step3Title={copy.wizardStep3Title}
          buyLabel={copy.wizardBuyBtn}
          trialLabel={copy.wizardTrialBtn}
          startOverLabel={copy.wizardStartOver}
          backLabel={copy.wizardBack}
          liveProducts={liveProducts}
        />

        {/* Section 8: Diagnostics & Ticket CTA */}
        <section className="p-6 rounded-2xl bg-[#121217] border border-[#22222c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-[#3ad389]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {copy.troubleshootTitle}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
                {copy.troubleshootBody}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/v2ray#line-check"
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              <span>{copy.troubleshootLineCheck}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/tickets"
              className="px-4 py-2 rounded-xl bg-black hover:bg-white/10 border border-white/15 text-zinc-200 text-xs font-mono transition-all"
            >
              {copy.troubleshootTicket}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
