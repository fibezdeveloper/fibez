'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRODUCTS, ProductItem } from '@/lib/products';
import { useStore } from '@/lib/store-context';
import { WIZARD_ISP_STEPS, WizardUseCase } from '@/lib/v2ray-guide-data';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface GuidePlanWizardProps {
  eyebrow: string;
  title: string;
  stepLabels: [string, string, string];
  step1Question: string;
  step2Question: string;
  step2Subtitle: string;
  step3Title: string;
  buyLabel: string;
  trialLabel: string;
  startOverLabel: string;
  backLabel: string;
  liveProducts?: ProductItem[];
}

const ISP_KEYS = ['dialog', 'slt', 'airtel', 'hutch', 'mobitel', 'all'] as const;

export default function GuidePlanWizard({
  eyebrow,
  title,
  stepLabels,
  step1Question,
  step2Question,
  step2Subtitle,
  step3Title,
  buyLabel,
  trialLabel,
  startOverLabel,
  backLabel,
  liveProducts = [],
}: GuidePlanWizardProps) {
  const { formatPrice } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIsp, setSelectedIsp] = useState<string>('dialog');
  const [selectedUseCase, setSelectedUseCase] = useState<WizardUseCase | null>(null);

  const ispConfig = WIZARD_ISP_STEPS[selectedIsp] || WIZARD_ISP_STEPS.dialog;

  const findProduct = (id: string): ProductItem | undefined => {
    return (
      liveProducts.find((p) => p.id === id) ||
      PRODUCTS.find((p) => p.id === id)
    );
  };

  const matchedProduct = selectedUseCase
    ? findProduct(selectedUseCase.productId)
    : undefined;

  const handleSelectIsp = (key: string) => {
    setSelectedIsp(key);
    setSelectedUseCase(null);
    setStep(2);
  };

  const handleSelectUseCase = (uc: WizardUseCase) => {
    setSelectedUseCase(uc);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedUseCase(null);
  };

  return (
    <section id="plan-finder" className="space-y-6 pt-6 border-t border-[#181820]">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1.5">
          <Compass className="w-4 h-4 text-white" />
          <span>{eyebrow}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {title}
        </h2>
      </div>

      <div className="rounded-2xl bg-[#0e0e12] border border-[#1e1e26] p-6 sm:p-8 space-y-8">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between gap-2">
          {[1, 2, 3].map((num, idx) => {
            const isDone = step > num;
            const isCurrent = step === num;
            return (
              <React.Fragment key={num}>
                <div className="flex items-center gap-2.5 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center border transition-colors ${
                      isDone
                        ? 'bg-[#3ad389] border-[#3ad389] text-black'
                        : isCurrent
                        ? 'bg-white border-white text-black'
                        : 'bg-black border-white/15 text-zinc-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : num}
                  </div>
                  <span
                    className={`text-xs font-mono hidden sm:inline ${
                      isCurrent || isDone ? 'text-white font-semibold' : 'text-zinc-500'
                    }`}
                  >
                    {stepLabels[idx]}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`h-px flex-1 transition-colors ${
                      step > num ? 'bg-[#3ad389]/60' : 'bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step 1: Choose Connection / ISP */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
              Step 1 of 3
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {step1Question}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              {ISP_KEYS.map((key) => {
                const entry = WIZARD_ISP_STEPS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectIsp(key)}
                    className="p-4 rounded-xl bg-black border border-white/15 hover:border-white text-left transition-all cursor-pointer group"
                  >
                    <div className="text-sm sm:text-base font-bold text-white flex items-center justify-between">
                      <span>{entry.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-1">
                      {entry.tag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Choose Package / Usage */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                Step 2 of 3 · {ispConfig.label}
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {step2Question}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {step2Subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {ispConfig.useCases.map((uc) => (
                <button
                  key={uc.id}
                  type="button"
                  onClick={() => handleSelectUseCase(uc)}
                  className="p-4 rounded-xl bg-black border border-white/15 hover:border-white text-left transition-all cursor-pointer group flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white">
                      {uc.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {uc.hint}
                  </p>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{backLabel}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Recommendation Output */}
        {step === 3 && selectedUseCase && matchedProduct && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#3ad389]">
                Step 3 of 3 · {ispConfig.label}
              </span>
            </div>

            <div className="rounded-xl bg-black border border-white/15 p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full bg-[#3ad389]/10 border border-[#3ad389]/30 text-[#3ad389]">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{step3Title}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {matchedProduct.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                    {matchedProduct.description}
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">
                    Starting Price (1 Month)
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {formatPrice(matchedProduct.priceLKR, matchedProduct.priceUSD)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#0d0d11] border border-white/10">
                  <span className="text-zinc-500 block text-[10px] uppercase">
                    Activate on SIM / Line
                  </span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {selectedUseCase.recommendedPack}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0d0d11] border border-white/10">
                  <span className="text-zinc-500 block text-[10px] uppercase">
                    SNI Host / Exit
                  </span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {selectedUseCase.sniHost} · {matchedProduct.location || 'Singapore'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0d0d11] border border-white/10">
                  <span className="text-zinc-500 block text-[10px] uppercase">
                    Quota Behavior
                  </span>
                  <span className="text-zinc-300 mt-0.5 block font-sans">
                    {selectedUseCase.quotaNote}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={`/products/${matchedProduct.id}`}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold flex items-center gap-2 transition-all"
                >
                  <span>{buyLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/v2ray?openTrial=true"
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-mono flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-[#3ad389]" />
                  <span>{trialLabel}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer sm:ml-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{startOverLabel}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
