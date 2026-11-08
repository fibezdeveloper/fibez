'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FibezLogo from '@/components/FibezLogo';
import { Menu, X, Search, ShoppingCart, User, ArrowRight, ShieldCheck } from 'lucide-react';

export interface NavbarProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
  currency?: 'LKR' | 'USD';
  onCurrencyChange?: (currency: 'LKR' | 'USD') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelectCategory?: (category: 'all' | 'vpn' | 'vps' | 'subscription' | 'gaming') => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Navbar({
  onOpenAuth,
  currency = 'LKR',
  onCurrencyChange,
  searchQuery = '',
  onSearchChange,
  onSelectCategory,
  cartCount = 0,
  onOpenCart,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalCurrency, setInternalCurrency] = useState<'LKR' | 'USD'>(currency);
  const [internalSearch, setInternalSearch] = useState(searchQuery);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const currentCurrency = onCurrencyChange ? currency : internalCurrency;
  const currentSearch = onSearchChange ? searchQuery : internalSearch;

  const handleCurrencyToggle = (curr: 'LKR' | 'USD') => {
    if (onCurrencyChange) {
      onCurrencyChange(curr);
    } else {
      setInternalCurrency(curr);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const handleCategoryClick = (cat: 'all' | 'vpn' | 'vps' | 'subscription' | 'gaming') => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleCartClick = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      setCartDrawerOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#07050d]/90 backdrop-blur-[20px] border-b border-[#1b172a] transition-all">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90 shrink-0">
            <FibezLogo withVersion={true} />
          </Link>

          {/* Center-Left: Nav Links */}
          <nav className="hidden xl:flex items-center gap-6 2xl:gap-7">
            <Link
              href="/"
              className="text-[14px] font-medium text-[#ece8f7] hover:text-white transition-colors"
            >
              Home
            </Link>

            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('all');
              }}
              className="text-[14px] font-medium text-[#ece8f7] hover:text-white transition-colors cursor-pointer"
            >
              Shop
            </a>

            <a
              href="#reviews"
              className="text-[14px] font-medium text-[#ece8f7] hover:text-white transition-colors"
            >
              Reviews
            </a>

            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('vpn');
              }}
              className="text-[14px] font-medium text-[#ece8f7] hover:text-white transition-colors cursor-pointer"
            >
              V2Ray
            </a>

            {/* FREE VPN Pill Link */}
            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('vpn');
              }}
              className="text-[14px] font-medium text-[#ece8f7] hover:text-white transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
            >
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/40 rounded-[4px] uppercase leading-none shadow-[0_0_8px_rgba(16,185,129,0.25)] group-hover:border-[#10b981]/80 transition-colors">
                FREE
              </span>
              <span>VPN</span>
            </a>

            <a
              href="#vault"
              className="text-[14px] font-medium text-[#ece8f7] hover:text-white transition-colors"
            >
              Track Order
            </a>
          </nav>

          {/* Right: Search, Currency Switcher, Cart, Sign In */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Search Input */}
            <div className="relative hidden md:flex items-center">
              <Search className="w-4 h-4 text-[#756d94] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={currentSearch}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                placeholder="Search products..."
                className="w-36 lg:w-52 xl:w-60 bg-[#0e0b1a] border border-[#231e38] text-white text-[13px] placeholder-[#6e6787] pl-9 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-[#635BFF] transition-all"
              />
            </div>

            {/* Currency Switcher: Rs. LKR | $ USD */}
            <div className="flex items-center bg-[#0e0b1a] border border-[#231e38] p-0.5 sm:p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleCurrencyToggle('LKR')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentCurrency === 'LKR'
                    ? 'bg-[#635BFF] text-white shadow-[0_0_12px_rgba(99,91,255,0.45)]'
                    : 'text-[#877f9f] hover:text-white'
                }`}
              >
                Rs. LKR
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyToggle('USD')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentCurrency === 'USD'
                    ? 'bg-[#635BFF] text-white shadow-[0_0_12px_rgba(99,91,255,0.45)]'
                    : 'text-[#877f9f] hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={handleCartClick}
              className="p-2 sm:p-2.5 rounded-xl bg-[#0e0b1a] border border-[#231e38] text-[#c9c3e0] hover:text-white hover:border-[#635BFF]/50 transition-colors flex items-center justify-center relative cursor-pointer group"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#635BFF] text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(99,91,255,0.8)]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={() => (onOpenAuth ? onOpenAuth('login') : (window.location.href = '#catalog'))}
              className="inline-flex items-center gap-2 bg-[#635BFF] hover:bg-[#5249e6] active:scale-[0.98] text-white text-[13px] sm:text-[14px] font-semibold px-3.5 sm:px-4 py-2 rounded-full shadow-[0_0_18px_rgba(99,91,255,0.45)] hover:shadow-[0_0_25px_rgba(99,91,255,0.65)] transition-all cursor-pointer whitespace-nowrap"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-[#ebe8f7] hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-b border-[#231e38] bg-[#090714] px-6 py-5 space-y-4">
            {/* Mobile Search */}
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 text-[#756d94] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={currentSearch}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setMobileMenuOpen(false);
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                placeholder="Search products..."
                className="w-full bg-[#0e0b1a] border border-[#231e38] text-white text-sm placeholder-[#6e6787] pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-[#635BFF]"
              />
            </div>

            {/* Nav Links in Mobile */}
            <div className="space-y-2 pt-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[15px] font-medium text-[#ece8f7] hover:text-white py-1"
              >
                Home
              </Link>
              <a
                href="#catalog"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick('all');
                }}
                className="block text-[15px] font-medium text-[#ece8f7] hover:text-white py-1"
              >
                Shop
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[15px] font-medium text-[#ece8f7] hover:text-white py-1"
              >
                Reviews
              </a>
              <a
                href="#catalog"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick('vpn');
                }}
                className="block text-[15px] font-medium text-[#ece8f7] hover:text-white py-1"
              >
                V2Ray
              </a>
              <a
                href="#catalog"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick('vpn');
                }}
                className="flex items-center gap-2 text-[15px] font-medium text-[#ece8f7] hover:text-white py-1"
              >
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/40 rounded-[4px] uppercase leading-none">
                  FREE
                </span>
                <span>VPN</span>
              </a>
              <a
                href="#vault"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[15px] font-medium text-[#ece8f7] hover:text-white py-1"
              >
                Track Order
              </a>
            </div>

            <div className="pt-3 border-t border-[#231e38] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth('login');
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#635BFF] hover:bg-[#5249e6] text-white text-sm font-semibold py-2.5 rounded-full"
              >
                <User className="w-4 h-4" />
                <span>Sign In to Account</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Slide-over Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="relative w-full max-w-md bg-[#0a0815] border-l border-[#231e38] p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#231e38]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#635BFF]" />
                  <h3 className="text-lg font-semibold text-white">Your Shopping Cart</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cartCount === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#130f24] border border-[#2a2247] flex items-center justify-center mx-auto text-[#635BFF]">
                    <ShoppingCart className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-white">Your cart is currently empty</h4>
                    <p className="text-sm text-[#877f9f] mt-1 max-w-xs mx-auto">
                      Browse our high-performance V2Ray nodes, cloud VPS, or software licenses to add items.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCartDrawerOpen(false);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 bg-[#635BFF] hover:bg-[#5249e6] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer shadow-[0_0_15px_rgba(99,91,255,0.4)]"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="py-4 space-y-3">
                  <p className="text-sm text-zinc-300">You have {cartCount} item(s) ready for checkout.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#231e38]">
              <div className="flex items-center gap-2 text-xs text-[#877f9f] justify-center">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                <span>Instant automated provisioning under 400ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
