'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, ShieldCheck, Zap, Server, Shield, Sparkles } from 'lucide-react';
import { PRODUCTS, ProductItem } from '@/lib/products';

export interface SearchMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: 'LKR' | 'USD';
  onSelectProduct?: (product: ProductItem) => void;
  onSelectCategory?: (category: 'all' | 'vpn' | 'vps' | 'subscription' | 'gaming' | 'giftcard' | 'software') => void;
  onSearchSubmit?: (query: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'giftcard', label: 'Gift Cards' },
  { id: 'subscription', label: 'Subscriptions' },
  { id: 'gaming', label: 'Gaming & Top-Ups' },
  { id: 'software', label: 'Software & AI' },
  { id: 'vpn', label: 'VPN & Cloud' },
] as const;

export default function SearchMenu({
  isOpen,
  onClose,
  currency = 'LKR',
  onSelectProduct,
  onSelectCategory,
  onSearchSubmit,
}: SearchMenuProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Filter products based on query and category
  const filteredProducts = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });
  }, [query, selectedCategory]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, filteredProducts.length - 1)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts[selectedIndex]) {
        handleProductClick(filteredProducts[selectedIndex]);
      } else if (query.trim()) {
        if (onSearchSubmit) onSearchSubmit(query.trim());
        onClose();
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleProductClick = (product: ProductItem) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      if (onSearchSubmit) onSearchSubmit(product.title);
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    }
    onClose();
  };

  const handleCategoryClick = (catId: 'all' | 'vpn' | 'vps' | 'subscription' | 'gaming') => {
    setSelectedCategory(catId);
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-[12px]"
          />

          {/* Search Dropdown Menu Panel (Opens right from the topbar) */}
          <div className="relative z-10 w-full max-w-2xl mx-auto pt-16 sm:pt-20 px-4">
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: 'spring', visualDuration: 0.28, bounce: 0 }}
              onKeyDown={handleKeyDown}
              className="bg-[#0c0c0e] border border-[#1f1f23] rounded-[16px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden"
            >
              {/* Search Header Bar */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1f1f23]">
                <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search products, VPN nodes, cloud VPS, subscriptions..."
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none font-sans"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1 rounded text-[#a1a4a5] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#16161a] border border-[#26262b] text-[#a1a4a5]">
                    ESC
                  </kbd>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#1f1f23] overflow-x-auto no-scrollbar bg-[#08080a]">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-white text-black font-semibold'
                        : 'bg-[#16161a] text-[#a1a4a5] hover:text-white hover:bg-[#202026]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Results List */}
              <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
                {filteredProducts.length === 0 ? (
                  <div className="py-12 text-center text-sm text-[#a1a4a5]">
                    <p>No products matching &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-zinc-500 mt-1">Try searching for &quot;v2ray&quot;, &quot;vps&quot;, or &quot;chatgpt&quot;</p>
                  </div>
                ) : (
                  filteredProducts.map((product, idx) => {
                    const isSelected = idx === selectedIndex;
                    const priceFormatted =
                      currency === 'USD'
                        ? `$${product.priceUSD.toFixed(2)}`
                        : `Rs. ${product.priceLKR.toLocaleString()}`;

                    return (
                      <div
                        key={product.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => handleProductClick(product)}
                        className={`flex items-center justify-between p-3 rounded-[10px] transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#18181c] border border-white/20'
                            : 'hover:bg-[#121215] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <div className="w-8 h-8 rounded-[8px] bg-[#16161a] border border-[#26262b] flex items-center justify-center shrink-0 text-white">
                            {product.category === 'vpn' && <Shield className="w-4 h-4" />}
                            {product.category === 'vps' && <Server className="w-4 h-4" />}
                            {product.category === 'subscription' && <Sparkles className="w-4 h-4" />}
                            {product.category === 'gaming' && <Zap className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">
                                {product.title}
                              </span>
                              {product.badge && (
                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-zinc-300">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#a1a4a5] truncate mt-0.5 max-w-md">
                              {product.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-mono font-medium text-white">
                              {priceFormatted}
                            </div>
                            <div className="text-[10px] font-mono text-zinc-400">
                              Instant ({product.stockCount} in stock)
                            </div>
                          </div>
                          <ArrowRight
                            className={`w-4 h-4 transition-transform ${
                              isSelected ? 'text-white translate-x-0.5' : 'text-zinc-600'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Guide Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#08080a] border-t border-[#1f1f23] text-[11px] font-mono text-zinc-500">
                <div className="flex items-center gap-4">
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#16161a] text-zinc-300">↑↓</kbd> navigate
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#16161a] text-zinc-300">↵</kbd> select
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#16161a] text-zinc-300">esc</kbd> close
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero-trust vault</span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
