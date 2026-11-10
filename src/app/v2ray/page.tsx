'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRODUCTS, ProductItem } from '@/lib/products';
import { useStore } from '@/lib/store-context';
import LineCheck from '@/components/v2ray/LineCheck';
import FreeTrialModal from '@/components/v2ray/FreeTrialModal';
import ClientApps from '@/components/v2ray/ClientApps';
import { 
  Zap, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Server, 
  Cpu, 
  ArrowRight, 
  ShoppingCart, 
  Clock, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Wifi, 
  HelpCircle, 
  Star,
  Mail,
  Send
} from 'lucide-react';

function TrialUrlTrigger({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('openTrial') === 'true' || searchParams.get('trial') === 'true') {
      onOpen();
    }
  }, [searchParams, onOpen]);
  return null;
}

export default function V2RayPage() {
  const router = useRouter();
  const { currency, formatPrice, addToCart, setIsCartOpen } = useStore();

  const [activeIspFilter, setActiveIspFilter] = useState<string>('all');
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  const [dbVpnProducts, setDbVpnProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.reviews)) {
          setLiveReviews(data.reviews.filter((r: any) => String(r.product_id || '').startsWith('v2ray')).slice(0, 3));
        }
      })
      .catch(() => {});

    fetch('/api/products?category=vpn')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length > 0) {
          setDbVpnProducts(
            data.products.map((p: any) => ({
              id: p.id,
              category: p.category_id,
              brand: p.brand || undefined,
              region: p.region || undefined,
              title: p.title,
              description: p.description,
              priceUSD: Number(p.price_usd),
              priceLKR: Number(p.price_lkr),
              stockCount: Number(p.stock_count),
              badge: p.badge || undefined,
              isInstant: p.is_instant,
              durations: p.durations || [],
              options: p.options || [],
              guideMarkdown: p.guide_markdown || '',
              warranty: p.warranty_terms || '',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Filter only VLESS VPN products and merge live DB stock & prices
  const v2rayProducts = useMemo(() => {
    const base = PRODUCTS.filter((p) => p.category === 'vpn' && p.id.startsWith('v2ray'));
    if (dbVpnProducts.length === 0) return base;
    return base
      .map((local) => {
        const remote = dbVpnProducts.find((d) => d.id === local.id);
        return remote ? { ...local, priceLKR: remote.priceLKR, priceUSD: remote.priceUSD, stockCount: remote.stockCount } : local;
      })
      .filter((p) => p.stockCount > 0);
  }, [dbVpnProducts]);

  const filteredProducts = useMemo(() => {
    if (activeIspFilter === 'all') return v2rayProducts;
    return v2rayProducts.filter((p) => {
      if (!p.isps) return false;
      return p.isps.some(
        (isp) => isp.toLowerCase() === activeIspFilter.toLowerCase() || isp === 'All'
      );
    });
  }, [v2rayProducts, activeIspFilter]);

  const ispTabs = [
    { id: 'all', label: 'All Packages', count: v2rayProducts.length },
    { id: 'dialog', label: 'Dialog Axiata', badge: 'Zoom & Router' },
    { id: 'slt', label: 'SLT Fiber', badge: 'Netflix & Streaming' },
    { id: 'mobitel', label: 'Mobitel', badge: 'Zoom1 Pack' },
    { id: 'airtel', label: 'Airtel', badge: 'TikTok 297/997' },
    { id: 'hutch', label: 'Hutch', badge: 'Work & Zoom' },
  ];

  const handleDurationChange = (productId: string, durationIndex: number) => {
    setSelectedDurations((prev) => ({
      ...prev,
      [productId]: durationIndex,
    }));
  };

  const handleAddToCart = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const durationIdx = selectedDurations[product.id] || 0;
    addToCart(product, durationIdx);
    setAddedItemNotice(product.title);
    setTimeout(() => setAddedItemNotice(null), 3000);
  };

  const handleBuyNow = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const durationIdx = selectedDurations[product.id] || 0;
    addToCart(product, durationIdx);
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'Do you have your own dedicated VPN app?',
      a: 'No, and that is a deliberate choice. Proprietary VPN apps from small providers often leak DNS, drain phone batteries, and get blocked easily by ISPs. Instead, we use official open-source standards: NetMod Syna (Windows/Android) and v2rayNG. They are faster, lighter, and give you complete control over Tun Mode and routing.',
    },
    {
      q: 'How does ISP package bypass work in Sri Lanka?',
      a: 'Sri Lankan telecom operators offer zero-rated unlimited packages for specific apps (e.g. Dialog Zoom/Teams, SLT Netflix, Airtel TikTok). Our VLESS nodes masquerade TLS traffic with the exact SNI and handshake fingerprints of those allowed domains. The ISP system records your usage under the unlimited package, while delivering unthrottled access to the entire web.',
    },
    {
      q: 'How fast is delivery?',
      a: 'Delivery is 100% instant and automated. Once payment or checkout is confirmed, your VLESS config link and QR code are generated and sent to your email in seconds, and also displayed in your Key Vault.',
    },
    {
      q: 'How does the "Line Check" diagnostic tool work?',
      a: 'Our Line Check runs a 4-hop diagnostic from your device to your local ISP, to the VLESS server, and out to the internet. It tests whether your ISP is blocking the SNI, checks handshake latency, and verifies whether slowdowns are caused by your local line or the server node.',
    },
    {
      q: 'Can I share the connection via Wi-Fi hotspot to my PC or TV?',
      a: 'Yes! When using NetMod on Android or Windows, simply enable "Tun Mode" or "Share VPN Hotspot". Any PC, console, or Android TV connected to your hotspot will automatically route through the tunnel.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-300">
      
      {/* Toast Notice when item added */}
      {addedItemNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-white text-black text-xs font-semibold shadow-2xl flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Added to cart: {addedItemNotice}</span>
          <button
            onClick={() => router.push('/cart')}
            className="px-2.5 py-1 rounded bg-black text-white text-[11px] font-mono hover:bg-zinc-800 transition-colors ml-2"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-14 pb-16 border-b border-[#181820] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f2a_1px,transparent_1px)] [background-size:28px_28px] opacity-30 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#3ad389] animate-pulse" />
              <span>HIGH-SPEED VLESS VPN · INSTANT EMAIL DELIVERY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              High-speed VLESS VPN — optimised for SLT, Dialog, Hutch &amp; Airtel.
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              Instant delivery. Config sent to your email in seconds.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTrialModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm font-mono flex items-center gap-2 transition-all shadow-lg active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Try 24-Hour Free Trial</span>
              </button>

              <a
                href="#line-check"
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white font-medium text-xs sm:text-sm font-mono flex items-center gap-2 transition-all"
              >
                <Activity className="w-4 h-4" />
                <span>Run Line Check Diagnostic</span>
              </a>

              <Link
                href="/v2ray/guide"
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-medium text-xs sm:text-sm font-mono flex items-center gap-2 transition-all"
              >
                <span>NetMod Setup Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Highlights Row */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left w-full max-w-3xl">
              <div className="p-3.5 rounded-xl bg-[#0d0d10] border border-[#1d1d24]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Fulfillment</div>
                <div className="text-sm font-bold text-white font-mono mt-1 leading-snug">Instant Email</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0d10] border border-[#1d1d24]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Optimised For</div>
                <div className="text-sm font-bold text-[#3ad389] font-mono mt-1 leading-snug">
                  SLT · Dialog{' '}
                  <br />
                  Hutch · Airtel
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0d10] border border-[#1d1d24]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Protocol</div>
                <div className="text-sm font-bold text-white font-mono mt-1 leading-snug">VLESS VPN</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0d10] border border-[#1d1d24]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Supported Apps</div>
                <div className="text-sm font-bold text-white font-mono mt-1 leading-snug">NetMod &amp; v2rayNG</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ISP Filtered Catalog Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1 font-semibold">
              Tailored Nodes for Sri Lankan Networks
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Select Your ISP Package Node
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsTrialModalOpen(true)}
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 underline underline-offset-4"
          >
            <span>Not sure which one fits? Try 24h Free Trial ›</span>
          </button>
        </div>

        {/* ISP Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {ispTabs.map((tab) => {
            const isActive = activeIspFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveIspFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all shrink-0 flex items-center gap-2 border ${
                  isActive
                    ? 'bg-white text-black border-white font-bold shadow'
                    : 'bg-[#101014] text-zinc-400 hover:text-white border-[#22222b] hover:border-zinc-700'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-black/10 text-zinc-800' : 'bg-white/5 text-zinc-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const currentDurationIdx = selectedDurations[product.id] || 0;
            const currentDuration = product.durations[currentDurationIdx] || product.durations[0];
            const priceLKR = Math.round(product.priceLKR * currentDuration.multiplier);
            const priceUSD = +(product.priceUSD * currentDuration.multiplier).toFixed(2);

            return (
              <div
                key={product.id}
                className="bg-[#0e0e12] border border-[#1e1e26] hover:border-zinc-600 rounded-2xl p-6 flex flex-col justify-between transition-all group relative overflow-hidden shadow-xl"
              >
                <div>
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                      {product.badge || 'VERIFIED'}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                      <span>{product.pingMs ? `${product.pingMs}ms` : '38ms'}</span>
                      <span className="text-zinc-600">·</span>
                      <span>{product.location || 'Singapore'}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-2 mb-4">
                    {product.description}
                  </p>

                  {/* Protocol & SNI Attributes */}
                  <div className="p-3 rounded-xl bg-[#131317] border border-white/5 space-y-1.5 text-xs font-mono mb-4">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Protocol:</span>
                      <span className="text-white font-medium">{product.protocol || 'VLESS'}</span>
                    </div>
                    {product.sniMasquerade && (
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>SNI Host:</span>
                        <span className="text-zinc-300 font-semibold">{product.sniMasquerade}</span>
                      </div>
                    )}
                    {product.isps && (
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Compatible:</span>
                        <span className="text-zinc-300 truncate max-w-[140px] text-right">
                          {product.isps.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Duration Selector */}
                  <div className="mb-6">
                    <label className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-400 block mb-2 font-semibold">
                      Validity Period
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {product.durations.map((dur, dIdx) => (
                        <button
                          key={dIdx}
                          type="button"
                          onClick={() => handleDurationChange(product.id, dIdx)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-mono text-center transition-all border ${
                            currentDurationIdx === dIdx
                              ? 'bg-white text-black border-white font-bold'
                              : 'bg-[#141419] border-[#22222c] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {dur.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Price & Action Row */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-xs text-zinc-500 font-mono block">Instant Delivery</span>
                      <span className="text-xl sm:text-2xl font-black text-white font-mono">
                        {formatPrice(priceLKR, priceUSD)}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      /{currentDuration.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleBuyNow(product, e)}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all shadow"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Instant Buy</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* Embedded Line Check Diagnostic Tool */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
        <LineCheck />
      </section>

      {/* Official Client Apps Section (NetMod Syna, v2rayNG) */}
      <ClientApps />

      {/* Customer Testimonials & Reviews */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 border-t border-[#181820]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2 font-semibold">
            Customer Feedback
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Verified Customer Reviews
          </h2>
        </div>

        {liveReviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0d0d10] border border-[#1f1f26] text-center space-y-2 max-w-xl mx-auto">
            <p className="text-sm text-zinc-300">No VLESS VPN reviews posted yet.</p>
            <p className="text-xs text-zinc-500">
              Try a package or 24-hour free trial and leave a review on any VLESS product page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-[#0d0d10] border border-[#1f1f26] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-3 text-white">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  {rev.headline && (
                    <div className="text-sm font-semibold text-white mb-1.5">{rev.headline}</div>
                  )}
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{rev.user_name}</div>
                    <div className="text-zinc-500 font-mono text-[11px]">
                      {rev.is_verified_purchase ? 'Verified Purchase' : 'Customer'}
                    </div>
                  </div>
                  <span className="text-zinc-600 font-mono text-[10px]">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 border-t border-[#181820]">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Everything you need to know about NetMod, v2rayNG, and Sri Lankan ISP package bypass.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1f1f26] space-y-2"
            >
              <h4 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* URL Parameter Auto-Open Trigger */}
      <Suspense fallback={null}>
        <TrialUrlTrigger onOpen={() => setIsTrialModalOpen(true)} />
      </Suspense>

      {/* Free Trial Modal */}
      <FreeTrialModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
      />

    </div>
  );
}
