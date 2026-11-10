'use client';

import React, { useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import { PRODUCTS, ProductItem } from '@/lib/products';
import { useStore } from '@/lib/store-context';
import ProductReviews from '@/components/ProductReviews';
import { 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Server, 
  Shield, 
  Sparkles, 
  ShoppingCart, 
  Check, 
  ArrowRight, 
  Copy, 
  Globe, 
  Clock, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Key,
  Star
} from 'lucide-react';

function ProductDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { currency, addToCart, setIsCartOpen } = useStore();

  const product = PRODUCTS.find((p) => p.id === resolvedParams.id);
  if (!product) {
    notFound();
  }

  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [selectedISP, setSelectedISP] = useState('SLT Fiber / Mobitel / Dialog');
  const [copied, setCopied] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'guide' | 'warranty' | 'reviews'>('specs');

  const selectedDuration = product.durations[selectedDurationIndex] || product.durations[0];
  const multiplier = selectedDuration?.multiplier || 1;
  const currentPriceLKR = Math.round(product.priceLKR * multiplier);
  const currentPriceUSD = parseFloat((product.priceUSD * multiplier).toFixed(2));

  const priceText =
    currency === 'USD'
      ? `$${currentPriceUSD.toFixed(2)}`
      : `Rs. ${currentPriceLKR.toLocaleString()}`;

  const handleAddToCart = () => {
    addToCart(product, selectedDurationIndex);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleInstantCheckout = () => {
    addToCart(product, selectedDurationIndex);
    router.push('/cart');
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8e87aa] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        {product.category === 'vpn' ? (
          <Link href="/v2ray" className="text-white hover:underline">
            VLESS / V2Ray
          </Link>
        ) : (
          <>
            <Link href="/catalog" className="hover:text-white transition-colors">Catalog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
            <Link
              href={`/catalog?category=${product.category}`}
              className="text-white hover:underline capitalize"
            >
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-white truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Left 7 Columns: Product Specs, Overview, Guides */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
                {product.category === 'vpn' ? 'VLESS VPN' : product.category.toUpperCase()}
              </span>
              {product.badge && (
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white">
                  {product.badge}
                </span>
              )}
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
                product.stockCount > 0
                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-zinc-500 bg-white/5 border-white/10'
              }`}>
                {product.stockCount > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
              {product.title}
            </h1>
            <p className="text-sm sm:text-base text-[#a1a4a5] mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quick Store Matrix Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23]">
            <div className="text-center sm:text-left">
              <div className="text-[11px] font-mono text-[#a1a4a5]">Delivery</div>
              <div className="text-sm sm:text-base font-mono font-semibold text-white mt-0.5">
                Instant Email
              </div>
            </div>
            <div className="text-center sm:text-left border-x border-[#1f1f23] px-3">
              <div className="text-[11px] font-mono text-[#a1a4a5]">Protection</div>
              <div className="text-sm sm:text-base font-mono font-semibold text-white mt-0.5">
                Full Warranty
              </div>
            </div>
            <div className="text-center sm:text-left pl-1">
              <div className="text-[11px] font-mono text-[#a1a4a5]">Storage</div>
              <div className="text-sm sm:text-base font-mono font-semibold text-zinc-300 mt-0.5">
                Key Vault
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-[#1f1f23] flex items-center gap-6 text-sm font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`pb-3 transition-colors cursor-pointer relative ${
                activeTab === 'specs' ? 'text-white' : 'text-[#a1a4a5] hover:text-white'
              }`}
            >
              Specifications
              {activeTab === 'specs' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`pb-3 transition-colors cursor-pointer relative ${
                activeTab === 'guide' ? 'text-white' : 'text-[#a1a4a5] hover:text-white'
              }`}
            >
              Setup Guide
              {activeTab === 'guide' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('warranty')}
              className={`pb-3 transition-colors cursor-pointer relative ${
                activeTab === 'warranty' ? 'text-white' : 'text-[#a1a4a5] hover:text-white'
              }`}
            >
              Warranty & SLA
              {activeTab === 'warranty' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                activeTab === 'reviews' ? 'text-white' : 'text-[#a1a4a5] hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Reviews</span>
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-[12px] bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between">
                    <span className="text-[#a1a4a5]">Fulfillment Method</span>
                    <span className="text-white font-medium">Zero-Trust Instant API</span>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between">
                    <span className="text-[#a1a4a5]">Security Standard</span>
                    <span className="text-white font-medium">ChaCha20 / TLS 1.3</span>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between">
                    <span className="text-[#a1a4a5]">VPN Protocol</span>
                    <span className="text-white font-medium">{product.protocol || 'High-Speed VLESS'}</span>
                  </div>
                  <div className="p-3.5 rounded-[12px] bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between">
                    <span className="text-[#a1a4a5]">Device Concurrency</span>
                    <span className="text-white font-medium">Unlimited Multi-Device</span>
                  </div>
                </div>

                <div className="p-4 rounded-[14px] bg-[#0c0c0e] border border-[#1f1f23] text-xs leading-relaxed text-[#c9c3e0]">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Real-Time ISP Masking & DPI Resistance</span>
                  </div>
                  Designed specifically to bypass deep packet inspection and bandwidth throttling. Automatically rotates SNI masquerades to ensure persistent connectivity.
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-4">
                <div className="p-4 rounded-[14px] bg-[#0c0c0e] border border-[#1f1f23] font-mono text-xs text-zinc-300 space-y-3">
                  <div className="text-white font-semibold">Activation &amp; Setup Guide:</div>
                  <p className="leading-relaxed text-[#a1a4a5]">{product.guideMarkdown}</p>
                  {product.category === 'vpn' && (
                    <div className="pt-2 border-t border-white/10">
                      <Link href="/v2ray/guide" className="text-white hover:underline inline-flex items-center gap-1">
                        <span>Open NetMod Syna &amp; v2rayNG Setup Guide</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="p-4 rounded-[14px] bg-[#0c0c0e] border border-[#1f1f23] text-xs leading-relaxed text-zinc-300 space-y-2.5">
                <div className="text-white font-mono font-semibold">Fibez Refund & Replacement Guarantee:</div>
                <p className="text-zinc-300">{product.warranty}</p>
                <div className="pt-2 border-t border-white/10 text-xs font-mono text-zinc-400">
                  Defective or used codes reported within 24 hours of delivery are eligible for replacement or refund via{' '}
                  <a href="mailto:support@fibez.store" className="text-white underline">support@fibez.store</a>. Read our full{' '}
                  <Link href="/refund" className="text-white underline">Refund Policy</Link>.
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} />
            )}
          </div>
        </div>

        {/* Right 5 Columns: Sticky Order Configurator Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-[24px] bg-[#0c0c0e] border border-[#1f1f23] p-6 shadow-2xl space-y-6">
            
            {/* Price Display */}
            <div className="pb-4 border-b border-[#1f1f23] flex items-baseline justify-between">
              <div>
                <span className="text-xs font-mono text-[#a1a4a5] uppercase tracking-wider block">
                  Total Subscription Price
                </span>
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  {priceText}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  Instant Delivery
                </span>
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-mono text-[#a1a4a5] uppercase tracking-wider mb-2">
                Select Commitment Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {product.durations.map((dur, idx) => (
                  <button
                    key={dur.label}
                    type="button"
                    onClick={() => setSelectedDurationIndex(idx)}
                    className={`py-2.5 px-3 rounded-[12px] text-xs font-mono tracking-wider transition-all cursor-pointer border text-center ${
                      selectedDurationIndex === idx
                        ? 'bg-white text-black font-semibold border-white'
                        : 'bg-[#141417] text-[#a1a4a5] hover:text-white hover:bg-[#1a1a1e] border-white/5'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ISP Optimization Selector */}
            {product.category === 'vpn' && (
              <div>
                <label className="block text-xs font-mono text-[#a1a4a5] uppercase tracking-wider mb-2">
                  Target ISP Routing Optimization
                </label>
                <select
                  value={selectedISP}
                  onChange={(e) => setSelectedISP(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#141417] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                >
                  <option value="SLT Fiber / Mobitel / Dialog">Sri Lanka (SLT Fiber / Dialog / Mobitel)</option>
                  <option value="Dialog 4G / Home Broadband">Dialog 4G / Broadband</option>
                  <option value="Hutch / Airtel Broadband">Hutch / Airtel 4G</option>
                  <option value="International Starlink / Anycast">Global / Starlink Low-Latency</option>
                </select>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleInstantCheckout}
                className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-wider uppercase text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Instant Checkout & Claim Key ›</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3 px-6 rounded-xl border text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isAdded
                    ? 'bg-white/15 border-white text-white'
                    : 'bg-[#141417] border-white/10 hover:border-white/30 text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-zinc-400" />
                    <span>Add to Shopping Cart</span>
                  </>
                )}
              </button>

              {isAdded && (
                <Link
                  href="/cart"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#16161a] border border-[#26262b] hover:border-white/30 text-xs font-mono text-white transition-all flex items-center justify-center gap-1.5 animate-in fade-in"
                >
                  <span>Go to Dedicated Cart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Security Guarantee Footnote */}
            <div className="pt-2 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#a1a4a5]">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Zero-trust encrypted payload delivery</span>
              </div>
              <p className="text-[10px] font-mono text-[#a1a4a5]">
                Keys immediately appear in your personal <Link href="/vault" className="text-white hover:underline">Key Vault</Link>
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[#1f1f23]">
          <h2 className="text-xl font-medium text-white mb-6">
            Related {product.category.toUpperCase()} Configurations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => {
              const relPrice =
                currency === 'USD'
                  ? `$${rel.priceUSD.toFixed(2)}`
                  : `Rs. ${rel.priceLKR.toLocaleString()}`;

              return (
                <Link
                  key={rel.id}
                  href={`/products/${rel.id}`}
                  className="p-5 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] hover:border-white/30 hover:bg-[#111114] transition-all block group"
                >
                  <div className="flex items-center justify-between text-xs text-[#a1a4a5] mb-2 font-mono">
                    <span className="uppercase text-zinc-400">{rel.category}</span>
                    <span className="text-white font-medium">{relPrice}</span>
                  </div>
                  <h3 className="text-base font-medium text-white group-hover:text-white transition-colors line-clamp-1">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-[#a1a4a5] line-clamp-2 mt-1">
                    {rel.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-32 text-center font-mono text-sm text-[#8e87aa]">Loading product specifications...</div>}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
