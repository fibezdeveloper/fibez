'use client';

import { useSiteFlag } from '@/lib/use-site-flags';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PRODUCTS, ProductItem } from '@/lib/products';
import { GUIDE_COPY } from '@/lib/v2ray-guide-data';
import GuidePackageGallery from '@/components/v2ray/GuidePackageGallery';
import GuidePlanWizard from '@/components/v2ray/GuidePlanWizard';
import GuideFaqSection from '@/components/v2ray/GuideFaqSection';
import GuideDeviceSetup from '@/components/v2ray/GuideDeviceSetup';
import PillNav from '@/components/PillNav';
import PredictiveArcBackground from '@/components/PredictiveArcBackground';
import { Activity, AlertCircle, ArrowRight, ChevronDown, Globe, Layers, ShieldCheck, Terminal } from 'lucide-react';

// Section anchors, in the same order as the translated chip labels (copy.navLabels).
const SECTION_IDS = ['plan-finder', 'how-it-works', 'setup-clients', 'supported-packages', 'good-to-know', 'faq'] as const;

export default function V2RayGuidePage() {
  const ticketsOn = useSiteFlag('tickets');
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS[0]);

  useEffect(() => {
    fetch('/api/products?category=vpn')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length > 0) {
          const merged = PRODUCTS.filter((p) => p.category === 'vpn').map((local) => {
            const remote = data.products.find((d: { id: string }) => d.id === local.id);
            if (!remote) return local;
            // The API sends camelCase; keep the local value if a field is missing or not a number.
            const num = (value: unknown, fallback: number) => (Number.isFinite(Number(value)) && value != null ? Number(value) : fallback);
            return {
              ...local,
              priceLKR: num(remote.priceLKR, local.priceLKR),
              priceUSD: num(remote.priceUSD, local.priceUSD),
              stockCount: num(remote.stockCount, local.stockCount),
            };
          });
          setLiveProducts(merged);
        }
      })
      .catch(() => {});
  }, []);

  // Highlight the chip of the section the visitor is reading: the last one whose top has passed the upper third.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current: string = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActiveSection(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const copy = GUIDE_COPY.en;

  return (
    <div className="relative isolate min-h-screen bg-[#070709] text-zinc-300">
      <PredictiveArcBackground />

      {/* Hero */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f2a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#3ad389] animate-pulse" />
              <Terminal className="w-3.5 h-3.5 text-white" />
              <span>{copy.heroBadge}</span>
            </div>

          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">{copy.heroTitle}</h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">{copy.heroDesc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#plan-finder"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs font-mono flex items-center gap-1.5 transition-all shadow"
            >
              <span>{copy.heroCtaFind}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/v2ray/line-check"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-[#3ad389]" />
              <span>{copy.heroCtaLineCheck}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Jump menu: stays under the top bar while you scroll */}
      <div className="sticky top-[84px] z-30 pointer-events-none">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="pointer-events-auto flex justify-center">
            <PillNav
              layout="joined"
              size="sm"
              itemStyle="pill"
              hoverEffect="fill"
              indicator="pill"
              highlightColor="#8b5cf6"
              ariaLabel="Guide sections"
              items={SECTION_IDS.map((id, i) => ({ label: copy.navLabels[i], href: `#${id}` }))}
              activeHref={`#${activeSection}`}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* 1. Find a plan */}
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

        {/* 2. How it works */}
        <section id="how-it-works" className="scroll-mt-40 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1.5">
              <Layers className="w-4 h-4 text-white" />
              <span>{copy.howEyebrow}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{copy.howTitle}</h2>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] border-l-2 border-l-[#3ad389] space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#3ad389] font-semibold">{copy.ruleLabel}</div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{copy.ruleBody}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {copy.steps.map((st) => (
              <div key={st.num} className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-2.5">
                <div className="text-xs font-mono font-bold text-[#3ad389]">{st.num}</div>
                <h3 className="text-sm sm:text-base font-bold text-white">{st.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{st.body}</p>
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0b0f] border border-white/10 space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-400">{copy.pipelineLabel}</div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-white">{copy.pipelineSteps[0]}</span>
              <span className="text-zinc-600 hidden sm:inline">─►</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-zinc-200">{copy.pipelineSteps[1]}</span>
              <span className="text-zinc-600 hidden sm:inline">─►</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-[#3ad389]/15 border border-[#3ad389]/30 text-[#3ad389] font-semibold">{copy.pipelineSteps[2]}</span>
              <span className="text-zinc-600 hidden sm:inline">─►</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-white text-black font-semibold">{copy.pipelineSteps[3]}</span>
            </div>
          </div>
        </section>

        {/* 3. Set up your device */}
        <section id="setup-clients" className="scroll-mt-40 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{copy.deviceSetup.title}</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl">{copy.deviceSetup.subtitle}</p>
          </div>
          <GuideDeviceSetup copy={copy.deviceSetup} />
        </section>

        {/* 4. Package pictures */}
        <GuidePackageGallery
          eyebrow={copy.packagesEyebrow}
          title={copy.packagesTitle}
          subtitle={copy.packagesSubtitle}
        />

        {/* 5. Good to know: the extras, folded away until wanted */}
        <section id="good-to-know" className="scroll-mt-40 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{copy.navLabels[4]}</h2>

          <details className="group rounded-2xl bg-[#0e0e12] border border-[#1e1e26] open:border-white/20">
            <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none">
              <span className="flex items-center gap-2.5 text-base font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-[#3ad389] shrink-0" />
                {copy.examplesTitle}
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="px-5 pb-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {copy.examples.map((ex, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                    <span
                      className={`inline-block text-[10px] font-mono uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full border ${
                        ex.isUnlimited ? 'bg-[#3ad389]/10 border-[#3ad389]/30 text-[#3ad389]' : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      {ex.tag}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">{ex.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{ex.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                <span>{copy.speedDisclaimer}</span>
              </div>
            </div>
          </details>

          <details className="group rounded-2xl bg-[#0e0e12] border border-[#1e1e26] open:border-white/20">
            <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none">
              <span className="flex items-center gap-2.5 text-base font-bold text-white">
                <Globe className="w-4 h-4 text-[#3ad389] shrink-0" />
                {copy.exitTitle}
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="px-5 pb-5 space-y-4">
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">{copy.exitSubtitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {copy.exitCards.map((card, i) => (
                  <div key={i} className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <span
                        className={`inline-block text-[10px] font-mono uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full border ${
                          card.availableOnFibez ? 'bg-[#3ad389]/10 border-[#3ad389]/30 text-[#3ad389]' : 'bg-white/5 border-white/10 text-zinc-400'
                        }`}
                      >
                        {card.badge}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">{card.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{card.body}</p>
                    </div>
                    <div className="pt-3 border-t border-white/5 text-xs font-mono text-zinc-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#3ad389] shrink-0" />
                      <span>{card.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </section>

        {/* 6. Questions */}
        <GuideFaqSection
          eyebrow={copy.faqEyebrow}
          title={copy.faqTitle}
          subtitle={copy.faqSubtitle}
          goodToKnowTitle={copy.goodToKnowTitle}
          goodToKnowPoints={copy.goodToKnowPoints}
          faqs={copy.faqs}
        />

        {/* Still stuck */}
        <section className="p-6 rounded-2xl bg-[#121217] border border-[#22222c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-[#3ad389]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{copy.troubleshootTitle}</h3>
              <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">{copy.troubleshootBody}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/v2ray/line-check"
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              <span>{copy.troubleshootLineCheck}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {ticketsOn && (
              <Link
                href="/tickets"
                className="px-4 py-2 rounded-xl bg-black hover:bg-white/10 border border-white/15 text-zinc-200 text-xs font-mono transition-all"
              >
                {copy.troubleshootTicket}
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
