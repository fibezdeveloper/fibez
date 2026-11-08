'use client';

import React, { useState, useMemo } from 'react';
import ProductModal, { ProductItem } from '@/components/ProductModal';
import { Search, Shield, Zap, Server, QrCode, Key, Lock, ArrowRight, Check } from 'lucide-react';

const PRODUCTS: ProductItem[] = [
  {
    id: 'v2ray-singapore-reality',
    category: 'vpn',
    title: 'V2Ray Singapore Reality 10Gbps',
    description: 'High-speed anti-censorship tunnel node with zero-lag routing for games and video streaming. Optimized for ISP bypass.',
    priceUSD: 3.50,
    priceLKR: 1150,
    stockCount: 84,
    badge: 'TOP SELLER',
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.7 },
      { label: '1 Year', days: 365, multiplier: 8.5 },
    ],
    guideMarkdown: 'Supported clients: v2rayNG (Android), Shadowrocket / Streisand (iOS), v2rayN / Sing-box (Windows & Mac). Scan QR code or copy VLESS URI.',
    warranty: 'Full replacement guarantee against IP blockage or network degradation for active term.',
  },
  {
    id: 'v2ray-tokyo-ultra',
    category: 'vpn',
    title: 'V2Ray Tokyo Low-Latency Reality',
    description: 'Ultra-low jitter Tokyo node routed via BGP Tier 1 transit. Ideal for gaming and latency-sensitive trading platforms.',
    priceUSD: 4.00,
    priceLKR: 1300,
    stockCount: 42,
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.7 },
      { label: '1 Year', days: 365, multiplier: 8.5 },
    ],
    guideMarkdown: 'Import clipboard URL in Sing-box or v2rayN. Ensure Reality security and SNI masquerading are enabled in client.',
    warranty: '24/7 automated node failover and dynamic backup gateway access included.',
  },
  {
    id: 'vps-nvme-4c8g',
    category: 'vps',
    title: 'NVMe Cloud VPS — 4 Core / 8GB RAM',
    description: 'Dedicated AMD EPYC 9004 processor, 120GB PCIe 4.0 NVMe SSD, 10Gbps unmetered bandwidth, dedicated clean IPv4 & IPv6.',
    priceUSD: 12.00,
    priceLKR: 3950,
    stockCount: 16,
    badge: 'ENTERPRISE',
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.8 },
      { label: '1 Year', days: 365, multiplier: 9.0 },
    ],
    guideMarkdown: 'Instant SSH credentials delivered upon payment. Root access enabled by default. Clean OS image of Ubuntu 24.04 LTS.',
    warranty: 'Hardware 99.99% SLA backed by automated hypervisor replication.',
  },
  {
    id: 'vps-nvme-2c4g',
    category: 'vps',
    title: 'NVMe Cloud VPS — 2 Core / 4GB RAM',
    description: 'Cost-efficient cloud instance for bot hosting, microservices, and proxy nodes. 60GB NVMe storage and dedicated IP.',
    priceUSD: 7.00,
    priceLKR: 2300,
    stockCount: 29,
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.8 },
      { label: '1 Year', days: 365, multiplier: 9.0 },
    ],
    guideMarkdown: 'Instant SSH access with custom root password. Full control panel for reinstallation and reboot.',
    warranty: 'Standard 99.95% hypervisor uptime guarantee.',
  },
  {
    id: 'chatgpt-plus-team',
    category: 'subscription',
    title: 'ChatGPT Team / Plus Full Workspace',
    description: 'Access to GPT-4o, OpenAI o1-preview, unlimited canvas, DALL-E, custom GPTs, and advanced data analysis.',
    priceUSD: 6.50,
    priceLKR: 2150,
    stockCount: 65,
    badge: 'POPULAR',
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.8 },
      { label: '6 Months', days: 180, multiplier: 5.2 },
    ],
    guideMarkdown: 'Credentials or direct workspace invitation dispatched immediately. Can be used on web, iOS, and Android applications.',
    warranty: '30-day no-questions-asked replacement warranty if session access expires.',
  },
  {
    id: 'netflix-4k-uhd',
    category: 'subscription',
    title: 'Netflix 4K UHD Private Profile',
    description: 'Private PIN-locked profile on premium family plan. Full 4K HDR Dolby Vision streaming across Smart TV, PC, and Mobile.',
    priceUSD: 4.20,
    priceLKR: 1400,
    stockCount: 38,
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.8 },
      { label: '6 Months', days: 180, multiplier: 5.4 },
    ],
    guideMarkdown: 'Credentials with your dedicated profile slot and custom PIN sent directly to your screen.',
    warranty: 'Continuous renewal warranty. If account logs out, instant automated credential replacement is provided.',
  },
  {
    id: 'discord-nitro-yearly',
    category: 'subscription',
    title: 'Discord Nitro (1 Year Gift Activation)',
    description: 'Full Nitro subscription with 2 free Server Boosts, 500MB upload limits, custom emojis & stickers anywhere, and HD 60fps streaming.',
    priceUSD: 28.00,
    priceLKR: 9200,
    stockCount: 19,
    badge: 'VALUE',
    isInstant: true,
    durations: [
      { label: '1 Year', days: 365, multiplier: 1 },
    ],
    guideMarkdown: 'Direct official Discord gift link dispatched. Redeem directly into your personal Discord account.',
    warranty: '100% genuine official Discord gift link warranty.',
  },
  {
    id: 'steam-game-key-cyberpunk',
    category: 'gaming',
    title: 'Cyberpunk 2077: Ultimate Edition (Steam)',
    description: 'Official digital activation key for Steam. Includes the Phantom Liberty expansion. Region-free worldwide activation.',
    priceUSD: 32.00,
    priceLKR: 10500,
    stockCount: 12,
    isInstant: true,
    durations: [
      { label: 'Lifetime', days: 9999, multiplier: 1 },
    ],
    guideMarkdown: 'Open Steam client -> Games -> Activate a Product on Steam -> Paste the revealed license key.',
    warranty: 'Genuine publisher key with lifetime activation guarantee.',
  },
  {
    id: 'steam-game-key-wukong',
    category: 'gaming',
    title: 'Black Myth: Wukong (Steam Global Key)',
    description: 'Full retail digital game code for Steam. Action RPG inspired by Journey to the West. Global region unblocked.',
    priceUSD: 36.00,
    priceLKR: 11900,
    stockCount: 9,
    badge: 'HOT',
    isInstant: true,
    durations: [
      { label: 'Lifetime', days: 9999, multiplier: 1 },
    ],
    guideMarkdown: 'Redeem directly on Steam desktop client or store.steampowered.com/account/registerkey.',
    warranty: 'Permanent Steam account binding guarantee.',
  },
];

export default function CatalogSection({
  currency = 'LKR',
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  activeCategory: externalCategory,
  onCategoryChange,
}: {
  currency?: 'USD' | 'LKR';
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  activeCategory?: 'all' | 'vpn' | 'vps' | 'subscription' | 'gaming';
  onCategoryChange?: (category: 'all' | 'vpn' | 'vps' | 'subscription' | 'gaming') => void;
} = {}) {
  const [internalCategory, setInternalCategory] = useState<'all' | 'vpn' | 'vps' | 'subscription' | 'gaming'>('all');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const activeCategory = externalCategory !== undefined ? externalCategory : internalCategory;
  const setActiveCategory = onCategoryChange || setInternalCategory;

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchQueryChange || setInternalSearchQuery;

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="catalog" className="w-full py-24 bg-black border-t border-[#292d30]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-3">
              Automated Inventory Vault
            </div>
            <h2 className="text-[40px] sm:text-[56px] font-normal leading-[1.12] tracking-[-0.05em] text-white">
              Instant digital goods.
            </h2>
            <p className="text-[17px] leading-relaxed text-[#a1a4a5] mt-3">
              Browse real-time stock, configure durations, and receive keys, credentials, or configs in under 400ms.
            </p>
          </div>

          {/* Search Bar: 6px radius, 1px #292d30 border */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e727a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search V2Ray, VPS, Netflix..."
              className="w-full pl-10 pr-4 py-2.5 rounded-[6px] bg-black border border-[#292d30] text-sm text-white placeholder-[#6e727a] focus:outline-none focus:border-white font-mono transition-colors"
            />
          </div>
        </div>

        {/* Filter Category Pills: 6px radius */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-[#1f2224]">
          {[
            { id: 'all', label: 'All Assets' },
            { id: 'vpn', label: 'V2Ray & VPN Reality' },
            { id: 'vps', label: 'Cloud NVMe VPS' },
            { id: 'subscription', label: 'Developer Subscriptions' },
            { id: 'gaming', label: 'Global Game Keys' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`font-mono text-xs px-4 py-2 rounded-[6px] border transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[#141618] border-white text-white'
                  : 'bg-transparent border-[#292d30] text-[#a1a4a5] hover:text-white hover:border-[#464a4d]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid: Resend 16px radius cards */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-[#292d30] rounded-[16px] bg-black">
            <p className="font-mono text-sm text-[#a1a4a5]">No digital assets found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="resend-card p-6 flex flex-col justify-between group hover:border-[#464a4d] transition-colors"
              >
                <div>
                  
                  {/* Top Meta Row */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#6e727a]">
                      {product.category}
                    </span>

                    {/* Stock Status Pill */}
                    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#3ad389]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                      <span>{product.stockCount} in Vault</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-normal tracking-[-0.03em] text-white group-hover:text-white transition-colors mb-2">
                    {product.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-[#a1a4a5] mb-6 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-[#1f2224] font-mono text-xs text-[#6e727a] mb-6">
                    <div className="flex items-center justify-between">
                      <span>Delivery Velocity:</span>
                      <span className="text-[#3ad389]">&lt; 400ms Instant</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Warranty Guard:</span>
                      <span className="text-[#f0f0f0]">Zero-Trust 100%</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Pricing & Action */}
                <div className="pt-4 border-t border-[#292d30] flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xl font-medium text-white">
                      {currency === 'LKR' ? `LKR ${product.priceLKR.toLocaleString()}` : `$${product.priceUSD.toFixed(2)}`}
                    </div>
                    <div className="font-mono text-[11px] text-[#6e727a]">
                      {currency === 'LKR' ? `$${product.priceUSD.toFixed(2)} USD` : `LKR ${product.priceLKR.toLocaleString()}`}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="btn-ghost-resend text-xs !py-1.5 !px-3"
                  >
                    <span>Configure</span>
                    <span>›</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Product Configurator & Checkout Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
