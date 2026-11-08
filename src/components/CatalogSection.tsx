'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductModal from '@/components/ProductModal';
import { ProductItem, PRODUCTS } from '@/lib/products';
import { Search, Shield, Zap, Server, QrCode, Key, Lock, ArrowRight, Check } from 'lucide-react';

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
                  <Link href={`/products/${product.id}`} className="hover:text-[#9281f7] transition-colors block">
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
