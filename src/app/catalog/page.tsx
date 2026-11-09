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
  ChevronRight,
  Gift,
  Cpu
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: null },
  { id: 'vpn', label: 'V2Ray', icon: Shield },
  { id: 'giftcard', label: 'Gift Cards', icon: Gift },
  { id: 'subscription', label: 'Subscriptions', icon: Sparkles },
  { id: 'gaming', label: 'Game Top-ups', icon: Zap },
  { id: 'software', label: 'Software', icon: Cpu },
] as const;

function CatalogContent() {
  const searchParams = useSearchParams();
  const { currency, addToCart } = useStore();

  const initialCat = (searchParams.get('category') as any) || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [productList, setProductList] = useState<ProductItem[]>(PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'stock'>('recommended');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

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
          setProductList(mapped);
        }
      })
      .catch((err) => console.error('Failed to fetch catalog from DB:', err));
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let list = productList.filter((item) => {
      const matchesCat =
        activeCategory === 'all' ||
        item.category === activeCategory ||
        (activeCategory === 'vpn' && item.category === 'vps');
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
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-zinc-300">Catalog</span>
        {activeCategory !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-white capitalize">{activeCategory}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Automated Digital Delivery · 24/7 SLA</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-normal tracking-[-0.04em] text-white">
          Shop Everything Digital
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Official gaming top-ups, digital gift cards, entertainment subscriptions, software licenses, and secure cloud networking with sub-400ms instant dispatch.
        </p>
      </div>

      {/* Control Bar: Categories & Search & Sort */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-[#0c0d16] border border-[#212338] text-[#d6d6de] hover:border-zinc-500 hover:text-white hover:bg-[#141522]'
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
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-300" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer font-mono"
            >
              <option value="recommended" className="bg-[#121214]">Recommended</option>
              <option value="price-asc" className="bg-[#121214]">Price: Low to High</option>
              <option value="price-desc" className="bg-[#121214]">Price: High to Low</option>
              <option value="stock" className="bg-[#121214]">Stock Availability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl">
          <p className="text-base text-zinc-300">No products found matching your filter</p>
          <p className="text-xs text-zinc-500 mt-1">Try resetting the search query or switching categories.</p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-colors"
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
                className="group relative flex flex-col justify-between rounded-[16px] bg-[#111114] border border-white/10 hover:border-white/25 transition-all p-6 shadow-lg"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                      {product.category === 'vpn' && <Shield className="w-5 h-5 text-indigo-400" />}
                      {product.category === 'vps' && <Server className="w-5 h-5 text-cyan-400" />}
                      {product.category === 'subscription' && <Sparkles className="w-5 h-5 text-purple-400" />}
                      {product.category === 'gaming' && <Zap className="w-5 h-5 text-amber-400" />}
                      {product.category === 'giftcard' && <Gift className="w-5 h-5 text-emerald-400" />}
                      {product.category === 'software' && <Cpu className="w-5 h-5 text-sky-400" />}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {product.badge && (
                        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-200">
                          {product.badge}
                        </span>
                      )}
                      <span className="font-mono text-[9px] text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        {product.stockCount} in stock
                      </span>
                    </div>
                  </div>

                  {/* Brand & Region meta */}
                  <div className="flex items-center gap-2 mb-1.5">
                    {product.brand && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                        {product.brand}
                      </span>
                    )}
                    {product.region && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                        {product.region}
                      </span>
                    )}
                  </div>

                  {/* Title & Detail Link */}
                  <Link href={`/products/${product.id}`} className="block group-hover:text-zinc-200 transition-colors">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2 leading-snug line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-6 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Footer Price & Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono text-zinc-500">Starting from</div>
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
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 border-white/10 hover:border-white/30 text-white'
                      }`}
                      title="Quick Add to Cart"
                    >
                      {isJustAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>

                    <Link
                      href={`/products/${product.id}`}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-wider uppercase transition-all inline-flex items-center gap-1.5"
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
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-32 text-center font-mono text-sm text-zinc-400">Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
