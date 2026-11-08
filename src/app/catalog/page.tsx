'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS, ProductItem } from '@/lib/products';
import { useStore } from '@/lib/store-context';
import ProductModal from '@/components/ProductModal';
import { 
  Search, 
  Shield, 
  Server, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  ShoppingCart, 
  Check, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: null },
  { id: 'vpn', label: 'V2Ray VPN Nodes', icon: Shield },
  { id: 'vps', label: 'Cloud NVMe VPS', icon: Server },
  { id: 'subscription', label: 'Subscriptions', icon: Sparkles },
  { id: 'gaming', label: 'Game Keys', icon: Zap },
] as const;

function CatalogContent() {
  const searchParams = useSearchParams();
  const { currency, addToCart } = useStore();

  const initialCat = (searchParams.get('category') as any) || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'stock'>('recommended');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let list = PRODUCTS.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });

    if (sortBy === 'price-asc') {
      list.sort((a, b) => (currency === 'USD' ? a.priceUSD - b.priceUSD : a.priceLKR - b.priceLKR));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (currency === 'USD' ? b.priceUSD - a.priceUSD : b.priceLKR - a.priceLKR));
    } else if (sortBy === 'stock') {
      list.sort((a, b) => b.stockCount - a.stockCount);
    }

    return list;
  }, [activeCategory, searchQuery, sortBy, currency]);

  const handleQuickAdd = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 0);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8e87aa] mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        <span className="text-white">Product Catalog</span>
        {activeCategory !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
            <span className="text-[#9281f7] capitalize">{activeCategory}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-2">
          Automated Digital Inventory
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
          Digital Goods & Infrastructure Catalog
        </h1>
        <p className="text-sm text-[#8e87aa] mt-2 max-w-2xl">
          High-performance V2Ray reality nodes, AMD EPYC NVMe cloud servers, zero-trust subscriptions, and verified game keys with sub-400ms delivery.
        </p>
      </div>

      {/* Control Bar: Categories & Search & Sort */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#231e38]">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#9281f7] text-black font-semibold shadow-[0_0_15px_rgba(146,129,247,0.35)]'
                    : 'bg-[#0e0b1c] text-[#8e87aa] hover:text-white hover:bg-[#18132d] border border-white/5'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#8e87aa] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0e0b1c] border border-white/10 text-xs text-white placeholder-[#6e6884] focus:outline-none focus:border-[#9281f7] font-mono transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0e0b1c] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-[#8e87aa]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9281f7]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer font-mono"
            >
              <option value="recommended" className="bg-[#0e0b1c]">Recommended</option>
              <option value="price-asc" className="bg-[#0e0b1c]">Price: Low to High</option>
              <option value="price-desc" className="bg-[#0e0b1c]">Price: High to Low</option>
              <option value="stock" className="bg-[#0e0b1c]">Stock Availability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-[#231e38] rounded-2xl">
          <p className="text-base text-zinc-300">No products found matching your filter</p>
          <p className="text-xs text-[#8e87aa] mt-1">Try resetting the search query or switching categories.</p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-[#18132d] hover:bg-[#251e45] text-xs font-mono text-[#9281f7] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const priceFormatted =
              currency === 'USD'
                ? `$${product.priceUSD.toFixed(2)}`
                : `Rs. ${product.priceLKR.toLocaleString()}`;

            const isJustAdded = addedId === product.id;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between rounded-[20px] bg-[#0c0919] border border-[#231e38] hover:border-[#9281f7]/60 transition-all p-6 shadow-xl hover:shadow-[0_10px_30px_-10px_rgba(146,129,247,0.15)]"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[12px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-[#9281f7] shrink-0">
                      {product.category === 'vpn' && <Shield className="w-5 h-5" />}
                      {product.category === 'vps' && <Server className="w-5 h-5" />}
                      {product.category === 'subscription' && <Sparkles className="w-5 h-5" />}
                      {product.category === 'gaming' && <Zap className="w-5 h-5" />}
                    </div>

                    <div className="flex items-center gap-2">
                      {product.badge && (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#9281f7]/15 border border-[#9281f7]/30 text-[#9281f7]">
                          {product.badge}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        {product.stockCount} in stock
                      </span>
                    </div>
                  </div>

                  {/* Title & Detail Link */}
                  <Link href={`/products/${product.id}`} className="block group-hover:text-[#9281f7] transition-colors">
                    <h3 className="text-lg font-medium text-white mb-2 leading-snug">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#8e87aa] line-clamp-3 mb-6 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Footer Price & Actions */}
                <div className="pt-4 border-t border-[#1e1930] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono text-[#6e6884]">Starting from</div>
                    <div className="text-lg font-mono font-bold text-white tracking-tight">
                      {priceFormatted}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isJustAdded
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-[#151126] border-white/10 hover:border-[#9281f7]/50 text-white'
                      }`}
                      title="Quick Add to Cart"
                    >
                      {isJustAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>

                    <Link
                      href={`/products/${product.id}`}
                      className="px-3.5 py-2.5 rounded-xl bg-[#9281f7] hover:bg-[#806ff5] text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_10px_rgba(146,129,247,0.3)] inline-flex items-center gap-1.5"
                    >
                      <span>Configure</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for quick configure if triggered */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-32 text-center font-mono text-sm text-[#8e87aa]">Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
