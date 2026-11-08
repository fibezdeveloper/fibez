'use client';

import React, { useState, use, Suspense } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { PRODUCTS } from '@/lib/products-data';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice } from '@/lib/currency';
import {
  ArrowLeft,
  Check,
  Zap,
  ShieldCheck,
  ChevronDown,
  MessageCircle,
  Cpu,
  Layers,
  Radio,
  Clock
} from 'lucide-react';

function ProductDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const { currency } = useCurrency();

  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) {
    notFound();
  }

  // Active selected variant state
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [setupGuideOpen, setSetupGuideOpen] = useState(true);
  const [warrantyOpen, setWarrantyOpen] = useState(true);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];

  const currentPrice =
    currency === 'LKR' ? selectedVariant.priceLKR : selectedVariant.priceUSD;

  // WhatsApp inquiry text
  const waText = encodeURIComponent(
    `Hello Fibez! I want to purchase ${product.title} (${selectedVariant.title}) for ${formatPrice(currentPrice, currency)}.`
  );
  const waUrl = `https://wa.me/?text=${waText}`;

  const handleCheckout = () => {
    router.push(`/checkout?variant=${selectedVariant.id}&product=${product.slug}`);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
      
      {/* Back Link */}
      <div className="mb-8">
        <Link
          href="/#catalog"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--color-ash)] hover:text-[var(--color-accent)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO CLEARANCE CATALOG</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Product Dossier & Guides (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="metadata-stamp text-[10px]">
                [ {product.categoryLabel.toUpperCase()} // DOSSIER ]
              </span>
              {product.instantDelivery && (
                <span className="pill-instant font-mono text-[10px]">
                  <Zap className="w-3 h-3 text-[var(--color-accent)]" />
                  <span>INSTANT VAULT DISPATCH</span>
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.02em] leading-tight mb-4">
              {product.title}
            </h1>

            <p className="text-base text-[var(--color-bone)]/90 leading-relaxed font-sans mb-6">
              {product.tagline}
            </p>

            <div className="p-4 bg-[var(--color-onyx)] border border-[var(--color-graphite)] rounded-[2px] text-xs font-mono text-[var(--color-smoke)] leading-relaxed">
              {product.description}
            </div>
          </div>

          {/* Core Features */}
          <div className="space-y-4">
            <h3 className="metadata-stamp text-[11px] text-white">
              [ TECHNICAL SPECIFICATIONS & CAPABILITIES ]
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 bg-[var(--color-graphite)]/40 border border-[var(--color-slate)]/40 rounded-[2px] text-xs text-[var(--color-bone)]"
                >
                  <span className="text-[var(--color-accent)] font-bold">✓</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Guide Accordion Drawer */}
          <div className="border border-[var(--color-graphite)] bg-[var(--color-onyx)]">
            <button
              onClick={() => setSetupGuideOpen(!setupGuideOpen)}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-mono text-white tracking-wider uppercase border-b border-[var(--color-graphite)] hover:bg-[var(--color-graphite)]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--color-accent)]" />
                <span>SETUP & ACTIVATION GUIDE</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  setupGuideOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {setupGuideOpen && (
              <div className="p-5 space-y-3 font-mono text-xs text-[var(--color-smoke)] leading-relaxed">
                <ol className="list-decimal list-inside space-y-2">
                  {product.setupGuide.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      <span className="text-[var(--color-bone)]">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Warranty Terms Drawer */}
          <div className="border border-[var(--color-graphite)] bg-[var(--color-onyx)]">
            <button
              onClick={() => setWarrantyOpen(!warrantyOpen)}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-mono text-white tracking-wider uppercase border-b border-[var(--color-graphite)] hover:bg-[var(--color-graphite)]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                <span>WARRANTY & REPLACEMENT GUARANTEE</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  warrantyOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {warrantyOpen && (
              <div className="p-5 font-mono text-xs text-[var(--color-smoke)] leading-relaxed">
                <p>{product.warrantyTerms}</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Dynamic Configurator (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 card-sharp p-6 sm:p-8 space-y-6 bg-[var(--color-onyx)] border-[var(--color-graphite)]">
            
            <div className="border-b border-[var(--color-graphite)] pb-4">
              <span className="metadata-stamp text-[10px]">
                [ DYNAMIC CONFIGURATOR ]
              </span>
              <h2 className="font-serif text-2xl font-normal text-white mt-1">
                Configure Package
              </h2>
            </div>

            {/* Variant Radio Option Grid */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-[var(--color-ash)] uppercase tracking-wider block">
                SELECT VARIANT TIER
              </label>

              <div className="space-y-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  const vPrice = currency === 'LKR' ? v.priceLKR : v.priceUSD;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`w-full text-left p-3.5 rounded-[2px] border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[0_0_8px_rgba(197,255,74,0.2)]'
                          : 'border-[var(--color-slate)] bg-[var(--color-carbon)] hover:border-[var(--color-ash)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[var(--color-accent)]'
                              : 'border-[var(--color-ash)]'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white font-sans">
                            {v.title}
                          </div>
                          <div className="text-[10px] font-mono text-[var(--color-ash)] mt-0.5">
                            {v.duration} {v.accountType ? `• ${v.accountType}` : ''}{' '}
                            {v.ispNetwork ? `• ${v.ispNetwork}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-white">
                          {formatPrice(vPrice, currency)}
                        </div>
                        <div className="text-[9px] font-mono text-[var(--color-accent)]">
                          {v.stockCount > 0 ? `${v.stockCount} left` : 'Out of stock'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-4 bg-[var(--color-carbon)] border border-[var(--color-graphite)] rounded-[2px] space-y-2">
              <div className="flex justify-between text-xs font-mono text-[var(--color-ash)]">
                <span>Selected Tier:</span>
                <span className="text-white text-right truncate max-w-[180px]">
                  {selectedVariant.title}
                </span>
              </div>
              <div className="flex justify-between text-xs font-mono text-[var(--color-ash)]">
                <span>Stock Allocation:</span>
                <span className="text-[var(--color-accent)]">
                  {selectedVariant.stockCount > 0 ? '✓ RESERVED UPON CHECKOUT' : 'OUT OF STOCK'}
                </span>
              </div>
              <div className="flex justify-between text-xs font-mono text-[var(--color-ash)]">
                <span>Instant Delivery:</span>
                <span className="text-white">&lt; 3 Seconds</span>
              </div>
              <div className="pt-2 border-t border-[var(--color-graphite)] flex justify-between items-baseline">
                <span className="font-mono text-xs uppercase text-white">Total Amount:</span>
                <span className="font-mono text-2xl font-bold text-[var(--color-accent)]">
                  {formatPrice(currentPrice, currency)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCheckout}
                disabled={selectedVariant.stockCount === 0}
                className="btn-signal w-full py-3 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                <span>PROCEED TO SECURE CHECKOUT</span>
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outlined w-full py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-[#25D366] border-[#25D366]/60 hover:bg-[#25D366]/10"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>BUY VIA WHATSAPP CHAT</span>
              </a>
            </div>

            {/* Security Guarantee Note */}
            <div className="pt-2 text-center text-[10px] font-mono text-[var(--color-ash)] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>CRYPTOGRAPHIC VAULT · 100% DISPATCH ACCURACY</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1280px] mx-auto px-4 py-20 text-center font-mono text-xs text-[var(--color-ash)]">
          INITIALIZING CONFIGURATOR DOSSIER...
        </div>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
