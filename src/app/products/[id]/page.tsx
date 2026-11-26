'use client';

import React, { useState, use, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import { PRODUCTS, ProductItem } from '@/lib/products';
import { useStore } from '@/lib/store-context';
import ProductReviews from '@/components/ProductReviews';
import { 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  ShoppingCart, 
  Check, 
  ArrowRight, 
  Globe, 
  Clock, 
  Wifi, 
  Key,
  Star,
  CheckCircle2,
  Laptop,
  Smartphone,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Server,
  Radio,
  Copy,
  Share2
} from 'lucide-react';
import { V2RAY_QUOTA_TIERS, LIVE_V2RAY_PACKAGES, V2RayPackageDef } from '@/lib/v2ray-catalog';
import { AnimatedNumber, QuantityStepper } from '@/components/ui/AnimatedNumber';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ShareSheet } from '@/components/ui/ShareSheet';
import { useSiteFlags } from '@/lib/use-site-flags';

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
  const [selectedQuotaId, setSelectedQuotaId] = useState<string>(V2RAY_QUOTA_TIERS[0]?.id ?? '');
  const siteFlags = useSiteFlags();
  const lkIpOpen = siteFlags?.lk_ip === true;
  const [serverType, setServerType] = useState<'STANDARD' | 'LK_IP'>('STANDARD');
  // The Sri Lanka IP variant is only sellable while the owner has it switched on.
  useEffect(() => {
    if (!lkIpOpen && serverType === 'LK_IP') setServerType('STANDARD');
  }, [lkIpOpen, serverType]);
  const [copiedReload, setCopiedReload] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'features' | 'reviews'>('setup');

  const isVpn = product.category === 'vpn' || product.id.startsWith('v2ray-');

  // Plain-English helper for required reload package
  let requiredPackName = 'Active SIM Social / Data Pack';
  let ispDisplay = product.isps?.join(' / ') || 'All Networks';

  if (product.id.includes('airtel-tiktok')) {
    requiredPackName = 'Airtel TikTok Pack (Rs. 297 or Rs. 997)';
    ispDisplay = 'Airtel 4G / 5G';
  } else if (product.id.includes('dialog-zoom')) {
    requiredPackName = 'Dialog Zoom & Teams Unlimited Pack (298 / 724)';
    ispDisplay = 'Dialog 4G / 5G';
  } else if (product.id.includes('slt-fiber') || product.id.includes('slt')) {
    requiredPackName = 'SLT YouTube or Netflix Unlimited Add-on';
    ispDisplay = 'SLT Mobitel Fiber / ADSL';
  } else if (product.id.includes('mobitel')) {
    requiredPackName = 'Mobitel Zoom / Any-Net Unlimited Pack';
    ispDisplay = 'Mobitel 4G / 5G';
  } else if (product.id.includes('hutch')) {
    requiredPackName = 'Hutch Work & Learn / Social Pack';
    ispDisplay = 'Hutch 4G';
  }

  const matchingCatalogPkg = isVpn
    ? LIVE_V2RAY_PACKAGES.find(
        (p) =>
          product.id.includes(p.id) ||
          p.id.includes(product.id.replace('v2ray-', '')) ||
          (product.id.includes('airtel-tiktok') && p.id === 'airtel-tiktok') ||
          (product.id.includes('dialog-zoom') && p.id === 'dialog-zoom-router') ||
          (product.id.includes('dialog-tiktok') && p.id === 'dialog-tiktok-sim') ||
          (product.id.includes('slt-zoom') && p.id === 'slt-zoom') ||
          (product.id.includes('slt-netflix') && p.id === 'slt-netflix') ||
          (product.id.includes('mobitel') && p.id === 'mobitel-zoom') ||
          (product.id.includes('hutch') && p.id === 'hutch-zoom')
      ) || null
    : null;

  const activeQuotaTier = V2RAY_QUOTA_TIERS.find((t) => t.id === selectedQuotaId) || V2RAY_QUOTA_TIERS[0];

  const v2rayPriceLKR = serverType === 'LK_IP' ? activeQuotaTier.lkIpPriceLKR : activeQuotaTier.standardPriceLKR;
  const v2rayPriceUSD = parseFloat((v2rayPriceLKR / 300).toFixed(2));

  const selectedDuration = product.durations[selectedDurationIndex] || product.durations[0];
  const multiplier = selectedDuration?.multiplier || 1;
  const standardPriceLKR = Math.round(product.priceLKR * multiplier);
  const standardPriceUSD = parseFloat((product.priceUSD * multiplier).toFixed(2));

  const currentPriceLKR = isVpn ? v2rayPriceLKR : standardPriceLKR;
  const currentPriceUSD = isVpn ? v2rayPriceUSD : standardPriceUSD;

  const priceText =
    currency === 'USD'
      ? `$${currentPriceUSD.toFixed(2)}`
      : `Rs. ${currentPriceLKR.toLocaleString()}`;

  const handleAddToCart = () => {
    if (isVpn) {
      const customTitle = `${product.title} (${activeQuotaTier.label}) - ${serverType === 'LK_IP' ? 'LK IP' : 'SG Server'}`;
      const customProduct = {
        ...product,
        id: `${product.id}-${activeQuotaTier.id}-${serverType.toLowerCase()}`,
        title: customTitle,
        priceLKR: v2rayPriceLKR,
        priceUSD: v2rayPriceUSD,
      };
      addToCart(customProduct, 0, undefined, orderQuantity);
    } else {
      addToCart(product, selectedDurationIndex, undefined, orderQuantity);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleInstantCheckout = () => {
    if (isVpn) {
      const customTitle = `${product.title} (${activeQuotaTier.label}) - ${serverType === 'LK_IP' ? 'LK IP' : 'SG Server'}`;
      const customProduct = {
        ...product,
        id: `${product.id}-${activeQuotaTier.id}-${serverType.toLowerCase()}`,
        title: customTitle,
        priceLKR: v2rayPriceLKR,
        priceUSD: v2rayPriceUSD,
      };
      addToCart(customProduct, 0, undefined, orderQuantity);
    } else {
      addToCart(product, selectedDurationIndex, undefined, orderQuantity);
    }
    router.push('/cart');
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8e87aa] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        {isVpn ? (
          <Link href="/v2ray" className="text-white hover:underline">
            V2Ray Hub
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
        
        {/* Left 7 Columns: Product Summary, How It Works, Guides */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Block */}
          <div>
            <div className="flex items-start gap-4 mb-3">
              {(product.id.includes('capcut') || product.id.includes('canva')) && (
                <div className="w-14 h-14 rounded-[16px] bg-[#141418] border border-[#24242a] p-2.5 shrink-0 flex items-center justify-center shadow-lg">
                  <img
                    src={product.id.includes('capcut') ? '/images/capcut-logo.svg' : '/images/canva-logo.svg'}
                    alt={product.brand || 'Logo'}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3ad389]/10 text-[#3ad389] border border-[#3ad389]/20 font-medium">
                    {isVpn ? `⚡ ${ispDisplay} COMPATIBLE` : product.category.toUpperCase()}
                  </span>

                  {product.badge && (
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white">
                      {product.badge}
                    </span>
                  )}

                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Instant Automated Delivery</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
                    {product.title}
                  </h1>
                  <ShareSheet
                    url={typeof window !== 'undefined' ? window.location.href : `https://fibez.store/products/${product.id}`}
                    title={`Get ${product.title} on Fibez!`}
                    trigger={
                      <button
                        type="button"
                        className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-[#16161c] hover:bg-[#202028] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#3ad389]" />
                        <span>Share</span>
                      </button>
                    }
                  />
                </div>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-[#a1a4a5] mt-2 leading-relaxed">
              {isVpn 
                ? `Convert your ${ispDisplay} unlimited package into unthrottled high-speed internet. Stream in 4K, game with low latency, and browse without using your main regular data balance.`
                : product.description}
            </p>
          </div>

          {/* Step 1: Required SIM Reload Callout Card for V2Ray */}
          {isVpn && (
            <div className="p-4 sm:p-5 rounded-[16px] bg-gradient-to-r from-amber-500/10 via-[#0d0d10] to-[#0d0d10] border border-amber-500/30 shadow-lg">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Step 1: Required SIM Reload or Package</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Activate on SIM First
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-black/70 border border-white/5">
                <div>
                  <div className="text-sm font-bold text-white font-mono">
                    {matchingCatalogPkg?.reloadCode || requiredPackName}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {matchingCatalogPkg?.carrierSpeedNote || 'Ensure this reload is active on your SIM card prior to connecting.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const codeToCopy = matchingCatalogPkg?.reloadCode || requiredPackName;
                    navigator.clipboard.writeText(codeToCopy);
                    setCopiedReload(true);
                    setTimeout(() => setCopiedReload(false), 1500);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-zinc-700 transition-all shrink-0 cursor-pointer"
                >
                  {copiedReload ? <Check className="w-3.5 h-3.5 text-[#3ad389]" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copiedReload ? 'Copied!' : 'Copy Reload'}</span>
                </button>
              </div>
            </div>
          )}

          {/* At-a-Glance Highlights Card */}
          {isVpn ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23]">
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Compatible SIM</div>
                <div className="text-xs sm:text-sm font-mono font-semibold text-white mt-1">
                  {ispDisplay}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Required Reload</div>
                <div className="text-xs sm:text-sm font-mono font-semibold text-[#3ad389] mt-1 truncate" title={requiredPackName}>
                  {requiredPackName}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Server Uplink</div>
                <div className="text-xs sm:text-sm font-mono font-semibold text-white mt-1">
                  🇸🇬 Singapore (10G)
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Client Apps</div>
                <div className="text-xs sm:text-sm font-mono font-semibold text-white mt-1">
                  NetMod &amp; V2Box
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 p-4 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23]">
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Platform / Region</div>
                <div className="text-xs sm:text-sm font-mono font-semibold text-white mt-1">
                  {product.region || product.brand || 'Global'}
                </div>
              </div>
              <div className="border-x border-[#1f1f23] px-3">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Fulfillment</div>
                <div className="text-xs sm:text-sm font-mono font-semibold text-[#3ad389] mt-1">
                  Instant Code
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Storage</div>
                <div className="text-xs sm:text-sm font-mono font-semibold text-white mt-1">
                  Key Vault
                </div>
              </div>
            </div>
          )}

          {/* Simple "How It Works in 3 Steps" Card */}
          <div className="p-5 sm:p-6 rounded-[20px] bg-gradient-to-b from-[#0f0f13] to-[#08080a] border border-[#22222a] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#3ad389] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>How It Works in 3 Easy Steps</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="p-4 rounded-[14px] bg-[#070709] border border-[#1b1b20]">
                <div className="w-6 h-6 rounded-full bg-white/10 text-white font-mono text-xs flex items-center justify-center font-bold mb-2.5">
                  1
                </div>
                <h4 className="text-xs font-medium text-white mb-1">
                  {isVpn ? 'Activate Reload' : 'Place Order'}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  {isVpn 
                    ? `Make sure ${requiredPackName} is active on your SIM.`
                    : 'Select your duration or balance and proceed to instant checkout.'}
                </p>
              </div>

              <div className="p-4 rounded-[14px] bg-[#070709] border border-[#1b1b20]">
                <div className="w-6 h-6 rounded-full bg-white/10 text-white font-mono text-xs flex items-center justify-center font-bold mb-2.5">
                  2
                </div>
                <h4 className="text-xs font-medium text-white mb-1">Get Instant Config</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  Your code &amp; QR are generated instantly and sent to your email and Key Vault.
                </p>
              </div>

              <div className="p-4 rounded-[14px] bg-[#070709] border border-[#1b1b20]">
                <div className="w-6 h-6 rounded-full bg-[#3ad389] text-black font-mono text-xs flex items-center justify-center font-bold mb-2.5">
                  3
                </div>
                <h4 className="text-xs font-medium text-white mb-1">
                  {isVpn ? 'Connect & Enjoy' : 'Redeem & Use'}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  {isVpn
                    ? 'Import into NetMod or V2Box and click Connect. Unlimited browsing starts!'
                    : 'Redeem the code on your official account to unlock your digital product.'}
                </p>
              </div>
            </div>
          </div>

          {/* Simple Tab Navigation */}
          <div className="border-b border-[#1f1f23] flex items-center gap-6 text-xs sm:text-sm font-mono pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('setup')}
              className={`pb-3 transition-colors cursor-pointer relative ${
                activeTab === 'setup' ? 'text-white font-medium' : 'text-[#a1a4a5] hover:text-white'
              }`}
            >
              <span>{isVpn ? 'Setup & Apps' : 'How to Redeem'}</span>
              {activeTab === 'setup' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3ad389]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`pb-3 transition-colors cursor-pointer relative ${
                activeTab === 'features' ? 'text-white font-medium' : 'text-[#a1a4a5] hover:text-white'
              }`}
            >
              <span>Features &amp; Guarantee</span>
              {activeTab === 'features' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3ad389]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                activeTab === 'reviews' ? 'text-white font-medium' : 'text-[#a1a4a5] hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-[#ffca16] text-[#ffca16]" />
              <span>Customer Reviews</span>
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3ad389]" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'setup' && (
              <div className="space-y-4">
                {isVpn ? (
                  <div className="p-5 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] space-y-4">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#3ad389]" />
                      <span>Recommended Official Apps for Sri Lanka</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-[12px] bg-[#070709] border border-[#1a1a20]">
                        <div className="flex items-center gap-2 text-white font-medium mb-1">
                          <Laptop className="w-4 h-4 text-[#3ad389]" />
                          <span>NetMod Syna (Windows &amp; Android)</span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          Best for PC gaming, laptops, and Android phones. Supports full system Tun Mode and Wi-Fi hotspot sharing.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-[12px] bg-[#070709] border border-[#1a1a20]">
                        <div className="flex items-center gap-2 text-white font-medium mb-1">
                          <Smartphone className="w-4 h-4 text-[#3ad389]" />
                          <span>V2Box (iPhone, iPad &amp; Mac)</span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          Best for Apple devices. 1-tap subscription import directly from our V2Ray Dash with automatic updates.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#18181f] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <span className="text-zinc-400">Need installation instructions?</span>
                      <Link
                        href="/v2ray/guide"
                        className="text-[#3ad389] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Open NetMod &amp; V2Box Setup Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] font-mono text-xs text-zinc-300 space-y-2">
                    <div className="text-white font-semibold">Redemption Guide:</div>
                    <p className="leading-relaxed text-[#a1a4a5] font-sans">{product.guideMarkdown}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-4">
                <div className="p-5 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] space-y-3">
                  <h3 className="text-sm font-medium text-white mb-2">
                    What is Included with Your Purchase:
                  </h3>
                  
                  <div className="space-y-2.5 text-xs text-zinc-300">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
                      <span><strong>100 GB Monthly High-Speed Traffic:</strong> Hosted on Singapore servers.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
                      <span><strong>Wi-Fi Hotspot Sharing:</strong> Share the tunnel to smart TVs, PCs, and gaming consoles via your phone hotspot.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
                      <span><strong>24-Hour Replacement Warranty:</strong> If your ISP changes settings or your line slows down, contact our support for immediate assistance.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
                      <span><strong>Instant Automated Delivery:</strong> Configuration links and QR codes appear in your Key Vault right after purchase.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews productId={product.id} />
            )}
          </div>
        </div>

        {/* Right 5 Columns: Clean, Friction-Free Order Box */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-[24px] bg-[#0c0c0e] border border-[#1f1f23] p-6 shadow-2xl space-y-5">
            
            {/* Price Display */}
            <div className="pb-4 border-b border-[#1f1f23] flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#a1a4a5] uppercase tracking-wider block">
                  Subscription Price
                </span>
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  {priceText}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  Instant Delivery
                </span>
              </div>
            </div>

            {/* V2Ray Interactive Quota & Gateway Selector OR Standard Duration */}
            {isVpn ? (
              <div className="space-y-4">
                {/* Data Quota Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3ad389]" />
                      <span>Choose Data Quota</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">30 Days Validity</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {V2RAY_QUOTA_TIERS.map((tier) => {
                      const isSelected = selectedQuotaId === tier.id;
                      const price = serverType === 'LK_IP' ? tier.lkIpPriceLKR : tier.standardPriceLKR;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedQuotaId(tier.id)}
                          className={`py-2 px-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-white text-black border-white shadow-lg'
                              : 'bg-[#121215] text-zinc-300 hover:text-white hover:bg-[#1a1a1f] border-[#222228]'
                          }`}
                        >
                          <div className="text-[11px] font-mono font-bold leading-tight flex items-center justify-between">
                            <span>{tier.label}</span>
                            {tier.id === 'unlimited' && (
                              <span className={`text-[8px] font-mono px-1 rounded ${isSelected ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                HOT
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-zinc-800 font-semibold' : 'text-zinc-500'}`}>
                            {currency === 'USD' ? `$${(price / 300).toFixed(2)}` : `${price} LKR`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Server Routing Gateway Toggle (hidden while Sri Lanka IP is switched off) */}
                {lkIpOpen && <div>
                  <label className="block text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider mb-2">
                    Select Server Gateway
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setServerType('STANDARD')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        serverType === 'STANDARD'
                          ? 'bg-[#18181b] border-[#3ad389] text-white shadow-md'
                          : 'bg-[#101013] border-[#222228] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-white">
                        <span>🇸🇬 Standard SG3</span>
                        {serverType === 'STANDARD' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Lowest ping for gaming & 4K
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServerType('LK_IP')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        serverType === 'LK_IP'
                          ? 'bg-purple-950/20 border-purple-500 text-white shadow-md'
                          : 'bg-[#101013] border-[#222228] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold font-mono text-white">
                        <span>🇱🇰 LK IP Edition</span>
                        <span className="text-[9px] font-mono text-purple-300 bg-purple-500/20 px-1 py-0.2 rounded">
                          +300 LKR
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Unlocks Sri Lankan bank apps
                      </div>
                    </button>
                  </div>
                </div>}

                {/* Network & Order Summary */}
                <div className="p-3.5 rounded-[14px] bg-[#070709] border border-[#1b1b20] space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Selected Plan:</span>
                    <span className="text-white font-bold">{activeQuotaTier.label} ({serverType === 'LK_IP' ? 'LK IP' : 'Singapore SG3'})</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Tunnel Protocols:</span>
                    <span className="text-[#3ad389] font-medium">VLESS · TCP · TLS 1.3</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Torrent Policy:</span>
                    <span className="text-rose-400 font-medium">Blocked (Clean IP)</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Device Limit:</span>
                    <span className="text-zinc-300 font-medium">Unlimited Logins</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Renewal Support:</span>
                    <span className="text-emerald-400 font-medium">Same UUID Preserved</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-mono text-[#a1a4a5] uppercase tracking-wider mb-2">
                  Select Validity Duration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {product.durations.map((dur, idx) => (
                    <button
                      key={dur.label}
                      type="button"
                      onClick={() => setSelectedDurationIndex(idx)}
                      className={`py-2.5 px-3 rounded-[12px] text-xs font-mono tracking-wider transition-all cursor-pointer border text-center ${
                        selectedDurationIndex === idx
                          ? 'bg-white text-black font-semibold border-white shadow-md'
                          : 'bg-[#141417] text-[#a1a4a5] hover:text-white hover:bg-[#1a1a1e] border-white/5'
                      }`}
                    >
                      <div>{dur.label}</div>
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-[14px] bg-[#070709] border border-[#1b1b20] space-y-2 text-xs font-mono mt-4">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Delivery Method:</span>
                    <span className="text-[#3ad389] font-medium">Instant Digital Key / Link</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Warranty:</span>
                    <span className="text-white font-medium">Full Duration Guarantee</span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Quantity Stepper Row */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121217] border border-white/5">
              <div>
                <span className="text-xs font-mono text-zinc-300 font-semibold block">Order Quantity</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Total: {currency === 'USD' ? `$${(currentPriceUSD * orderQuantity).toFixed(2)}` : `Rs. ${(currentPriceLKR * orderQuantity).toLocaleString()}`}
                </span>
              </div>
              <QuantityStepper
                value={orderQuantity}
                min={1}
                max={50}
                onChange={setOrderQuantity}
                size="md"
              />
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <AnimatedButton
                variant="emerald"
                size="lg"
                onClick={handleInstantCheckout}
                className="w-full text-xs font-mono tracking-wider uppercase font-bold"
              >
                <Zap className="w-4 h-4 fill-current text-black" />
                <span>Instant Buy &amp; Get Config</span>
              </AnimatedButton>

              <AnimatedButton
                variant="default"
                size="lg"
                onClick={handleAddToCart}
                className="w-full text-xs font-mono tracking-wider font-medium"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-[#3ad389]" />
                    <span className="text-[#3ad389] font-bold">Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-zinc-400" />
                    <span>Add to Shopping Cart</span>
                  </>
                )}
              </AnimatedButton>

              {isAdded && (
                <Link
                  href="/cart"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#16161a] border border-[#26262b] hover:border-white/30 text-xs font-mono text-white transition-all flex items-center justify-center gap-1.5 animate-in fade-in"
                >
                  <span>Go to Checkout Cart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Simple Trust & Support Badges */}
            <div className="pt-2 text-center space-y-1.5 border-t border-[#18181f]">
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3ad389]" />
                <span>24-Hour Replacement Warranty Guaranteed</span>
              </div>
              <p className="text-[10px] font-mono text-zinc-500">
                Config sent to your email and accessible in <Link href="/vault" className="text-white hover:underline">Key Vault</Link>
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[#1f1f23]">
          <h2 className="text-xl font-medium text-white mb-6">
            Other Popular {product.category.toUpperCase()} Options
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
                  <h3 className="text-base font-medium text-white group-hover:text-[#3ad389] transition-colors line-clamp-1">
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
