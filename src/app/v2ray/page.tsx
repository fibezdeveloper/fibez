'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRODUCTS, ProductItem } from '@/lib/products';
import { useStore } from '@/lib/store-context';
import FreeTrialModal from '@/components/v2ray/FreeTrialModal';
import ClientApps from '@/components/v2ray/ClientApps';
import TechText from '@/components/TechText';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import FlexCarousel, { FlexCarouselItem } from '@/components/FlexCarousel';
import V2RayPackageCard from '@/components/v2ray/V2RayPackageCard';
import { LIVE_V2RAY_PACKAGES, V2RayPackageDef } from '@/lib/v2ray-catalog';

const SPEEDTEST_ITEMS: FlexCarouselItem[] = [
  {
    src: '/speedtests/speedtest-1.jpeg',
    alt: 'Dialog 4G Speedtest - 84 Mbps Download',
    title: 'Dialog 4G LTE — 84.2 Mbps',
    subtitle: 'VLESS Reality • Colombo Direct',
  },
  {
    src: '/speedtests/speedtest-2.jpeg',
    alt: 'SLT Fiber Speedtest - 282 Mbps Download',
    title: 'SLT Fiber Pro — 282.5 Mbps',
    subtitle: 'YouTube Bypass • Low Jitter',
  },
  {
    src: '/speedtests/speedtest-3.jpeg',
    alt: 'Mobitel 4G Speedtest - 68 Mbps Download',
    title: 'Mobitel 4G — 68.4 Mbps',
    subtitle: 'Apple SNI Ingress • 18ms Ping',
  },
  {
    src: '/speedtests/speedtest-4.jpeg',
    alt: 'Dialog Broadband - 92 Mbps Download',
    title: 'Dialog Broadband — 92.1 Mbps',
    subtitle: 'Zoom & Teams Unlimited Tunnel',
  },
  {
    src: '/speedtests/speedtest-5.jpeg',
    alt: 'SLT Fiber Netflix Bypass - 195 Mbps',
    title: 'SLT Fiber — 195.8 Mbps',
    subtitle: 'Singapore Equinix SG3 Node',
  },
  {
    src: '/speedtests/speedtest-6.jpeg',
    alt: 'Airtel 4G Speedtest - 54 Mbps Download',
    title: 'Airtel 4G — 54.3 Mbps',
    subtitle: 'Sub-25ms Latency • NetMod Syna',
  },
  {
    src: '/speedtests/speedtest-7.jpeg',
    alt: 'Dialog 5G Trial Speedtest - 412 Mbps',
    title: 'Dialog 5G Trial — 412.0 Mbps',
    subtitle: '10 Gbps Uplink Pier',
  },
  {
    src: '/speedtests/speedtest-8.jpeg',
    alt: 'SLT Fiber Gaming Speedtest - 14ms Ping',
    title: 'SLT Fiber Gaming — 14ms Ping',
    subtitle: 'Singapore Direct Route',
  },
  {
    src: '/speedtests/speedtest-9.jpeg',
    alt: 'Hutch 4G Speedtest - 45 Mbps Download',
    title: 'Hutch 4G — 45.6 Mbps',
    subtitle: 'v2rayNG Mobile Hotspot',
  },
];
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
  Send,
  Radio
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
  const [packages, setPackages] = useState<V2RayPackageDef[]>(LIVE_V2RAY_PACKAGES);
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);
  const [dbVpnProducts, setDbVpnProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    fetch('/api/admin/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages)) {
          setPackages(data.packages);
        }
      })
      .catch(() => {});

    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.reviews)) {
          setLiveReviews(data.reviews.filter((r: any) => String(r.product_id || '').startsWith('v2ray')).slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const activePackages = useMemo(() => {
    return packages.filter((p) => p.isActive);
  }, [packages]);

  const filteredPackages = useMemo(() => {
    if (activeIspFilter === 'all') return activePackages;
    return activePackages.filter((p) => p.isp.toLowerCase() === activeIspFilter.toLowerCase());
  }, [activePackages, activeIspFilter]);

  const ispTabs = [
    { id: 'all', label: 'All Packages', count: activePackages.length },
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
      q: 'How fast are your VLESS nodes?',
      a: 'Our Singapore Tier-1 nodes feature 10 Gbps symmetric uplinks with sub-20ms ping to Sri Lanka. Customers regularly achieve 200+ Mbps on SLT Fiber and 80+ Mbps on Dialog 4G, as shown in our live Speedtest showcase above.',
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

            {/* LayoutTextFlip Animated Welcome Header */}
            <div className="pt-2">
              <LayoutTextFlip
                text="Welcome to "
                words={[
                  "Fibez V2Ray",
                  "Airflight Tier-1 Nodes",
                  "Zero-Trust Cloud",
                  "The Matrix"
                ]}
              />
            </div>

            {/* Interactive TechText Wordmark */}
            <div className="w-full h-[140px] sm:h-[200px] md:h-[260px] lg:h-[320px] relative max-w-5xl mx-auto flex items-center justify-center -my-2 sm:-my-4">
              <TechText
                text="High-speed v2ray"
                fontWeight={700}
                fontSize={160}
                color="#ffffff"
                accentColor="#3ad389"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={15}
                intro="none"
                introDuration={2}
                clickKick
                guides={false}
              />
            </div>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              Optimised for SLT, Dialog, Hutch &amp; Airtel. Config sent to your email and Key Vault in seconds.
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
                href="#speedtests"
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white font-medium text-xs sm:text-sm font-mono flex items-center gap-2 transition-all"
              >
                <Activity className="w-4 h-4 text-[#3ad389]" />
                <span>View Speedtest Showcase</span>
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

        {/* Technical & Network Policy Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#0c0c0f] border border-[#1f1f26] mb-8 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Torrent Policy</span>
              <span className="text-white font-bold">100% Blocked</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Device Logins</span>
              <span className="text-white font-bold">Unlimited Devices</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Plan Validity</span>
              <span className="text-white font-bold">1 Month (30 Days)</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-[#3ad389] shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Renewal Guarantee</span>
              <span className="text-white font-bold">Keep Same UUID</span>
            </div>
          </div>
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

        {/* Dynamic V2Ray Package Cards Grid (items-start prevents empty stretching of sibling cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredPackages.map((pkg) => (
            <V2RayPackageCard
              key={pkg.id}
              pkg={pkg}
              defaultServerType="standard"
              isExpanded={expandedPackageId === pkg.id}
              onToggleExpand={() =>
                setExpandedPackageId((prev) => (prev === pkg.id ? null : pkg.id))
              }
            />
          ))}
        </div>

      </section>

      {/* Real Customer Speedtest Showcase with FlexCarousel */}
      <section id="speedtests" className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-[#3ad389] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389] animate-pulse" />
              <span>COMMUNITY VERIFIED SPEEDTESTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Real Performance Across Sri Lanka
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Authentic Speedtest results captured by real clients across SLT Fiber, Dialog 4G, and Mobitel. Interactive liquid carousel powered by WebGL.
            </p>
          </div>
          <Link
            href="/v2ray/dashboard?tab=reviews"
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-all group"
          >
            <span>Drop Your Speedtest SS</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#3ad389] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="relative w-full rounded-2xl border border-[#1f1f26] bg-[#09090c] overflow-hidden p-2 sm:p-4">
          <div style={{ width: '100%', height: '560px', position: 'relative' }}>
            <FlexCarousel
              items={SPEEDTEST_ITEMS}
              preset="liquid"
              intro="rise"
              cardHeight={0.65}
              gap={14}
              squeeze={0.2}
              focusOnClick
              captions
              autoplay
              interval={4}
            />
          </div>
          <div className="mt-4 pt-3 border-t border-[#181820] flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500 px-2 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              9 Real Speedtest Captures Verified • Drag horizontally or scroll to explore
            </span>
            <span className="text-zinc-600">Click any card to focus &amp; expand</span>
          </div>
        </div>
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
