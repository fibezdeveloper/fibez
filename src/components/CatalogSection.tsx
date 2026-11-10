'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProductModal from '@/components/ProductModal';
import { ProductItem, PRODUCTS } from '@/lib/products';
import { Search, ArrowRight } from 'lucide-react';

const FEATURED_IDS = [
  'steam-wallet-code-global',
  'netflix-4k-uhd',
  'chatgpt-plus-team',
  'freefire-diamonds-1080',
  'pubg-mobile-uc-660',
  'spotify-premium-private',
  'psn-wallet-card-us',
  'valorant-points-1000',
  'microsoft-365-proplus',
];

const CATEGORY_LABELS: Record<string, string> = {
  giftcard: 'Gift Card',
  subscription: 'Subscription',
  gaming: 'Game Top-Up',
  software: 'Software',
};

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
  activeCategory?: 'all' | 'subscription' | 'gaming' | 'giftcard' | 'software';
  onCategoryChange?: (category: 'all' | 'subscription' | 'gaming' | 'giftcard' | 'software') => void;
} = {}) {
  const [internalCategory, setInternalCategory] = useState<'all' | 'subscription' | 'gaming' | 'giftcard' | 'software'>('all');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [productList, setProductList] = useState<ProductItem[]>(PRODUCTS.filter((p) => p.category !== 'vpn'));

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          const mapped: ProductItem[] = data.products.map((p: any) => ({
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
          }));
          setProductList(mapped.filter((p) => p.category !== 'vpn'));
        }
      })
      .catch((err) => console.error('Failed to fetch catalog from DB:', err));
  }, []);

  const activeCategory = externalCategory !== undefined ? externalCategory : internalCategory;
  const setActiveCategory = onCategoryChange || setInternalCategory;

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchQueryChange || setInternalSearchQuery;

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // When on default Featured tab without search, show curated in-stock bestsellers across all catalog categories
    if (activeCategory === 'all' && !query) {
      const featured = FEATURED_IDS.map((id) => productList.find((p) => p.id === id && p.stockCount > 0 && p.category !== 'vpn')).filter(Boolean) as ProductItem[];
      return featured.length > 0 ? featured : productList.filter((p) => p.stockCount > 0 && p.category !== 'vpn').slice(0, 9);
    }

    const matches = productList.filter((item) => {
      if (item.category === 'vpn') return false;
      const matchesCategory =
        activeCategory === 'all' ||
        item.category === activeCategory;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.brand?.toLowerCase().includes(query) ?? false);
      return matchesCategory && matchesSearch && item.stockCount > 0;
    });

    return matches.slice(0, 9);
  }, [activeCategory, searchQuery, productList]);

  const viewAllHref =
    activeCategory === 'all'
      ? '/catalog'
      : `/catalog?category=${activeCategory}`;

  return (
    <section id="catalog" className="w-full py-20 bg-black">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-xl">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Featured Store
            </div>
            <h2 className="text-[36px] sm:text-[50px] font-normal leading-[1.12] tracking-[-0.04em] text-white">
              Shop instant digital products.
            </h2>
            <p className="text-[16px] leading-relaxed text-[#a1a4a5] mt-3">
              Select a product, pick your plan or top-up amount, and receive your code or credentials in seconds.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e727a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Steam, Netflix, ChatGPT, Free Fire..."
              className="w-full pl-10 pr-4 py-2.5 rounded-[6px] bg-black border border-[#292d30] text-sm text-white placeholder-[#6e727a] focus:outline-none focus:border-white font-mono transition-colors"
            />
          </div>
        </div>

        {/* Filter Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-[#1f2224]">
          <div className="flex flex-wrap items-center gap-2.5">
            {[
              { id: 'all', label: 'Featured' },
              { id: 'giftcard', label: 'Gift Cards' },
              { id: 'subscription', label: 'Subscriptions' },
              { id: 'gaming', label: 'Game Top-ups' },
              { id: 'software', label: 'Software' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`text-xs px-5 py-2.5 rounded-full border transition-all duration-150 cursor-pointer select-none font-sans font-medium ${
                  activeCategory === cat.id
                    ? 'bg-white text-black font-semibold border-white shadow-sm'
                    : 'bg-[#0c0d16] border-[#212338] text-[#d6d6de] hover:border-zinc-500 hover:text-white hover:bg-[#141522]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <span>Browse All ({productList.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-[#292d30] rounded-[16px] bg-black">
            <p className="font-mono text-sm text-[#a1a4a5]">No products found matching your search.</p>
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
                      {CATEGORY_LABELS[product.category] || product.category}
                    </span>

                    {/* Stock Status Pill */}
                    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${product.stockCount > 0 ? 'bg-[#3ad389]' : 'bg-zinc-600'}`} />
                      <span>{product.stockCount > 0 ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <Link href={`/products/${product.id}`} className="hover:text-zinc-300 transition-colors block">
                    <h3 className="text-xl font-normal tracking-[-0.03em] text-white transition-colors mb-2">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-[14px] leading-relaxed text-[#a1a4a5] mb-6 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-[#1f2224] font-mono text-xs text-[#6e727a] mb-6">
                    <div className="flex items-center justify-between">
                      <span>Delivery:</span>
                      <span className="text-zinc-300">Instant Email &amp; Vault</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Warranty:</span>
                      <span className="text-[#f0f0f0]">Full Term Replacement</span>
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
                    className="btn-ghost-resend text-xs !py-1.5 !px-3.5"
                  >
                    <span>Buy Now</span>
                    <span>›</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-12">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111114] border border-[#222226] hover:border-white/40 text-white text-sm font-medium transition-all hover:bg-[#18181c]"
          >
            <span>
              Browse All {productList.length} Products in Catalog
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>

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
