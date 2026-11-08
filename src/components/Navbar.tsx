'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CardNav, { CardNavItem } from '@/components/CardNav';
import FibezLogo from '@/components/FibezLogo';
import { ShoppingCart, User, X, ArrowRight, ShieldCheck, Search } from 'lucide-react';

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
  const [internalCurrency, setInternalCurrency] = useState<'LKR' | 'USD'>(currency);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const currentCurrency = onCurrencyChange ? currency : internalCurrency;

  const handleCurrencyToggle = (curr: 'LKR' | 'USD') => {
    if (onCurrencyChange) {
      onCurrencyChange(curr);
    } else {
      setInternalCurrency(curr);
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
  };

  const handleCartClick = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      setCartDrawerOpen(true);
    }
  };

  const navItems: CardNavItem[] = [
    {
      label: 'Shop & Vault',
      description: 'Instant zero-trust digital fulfillment under 400ms.',
      links: [
        { label: 'Home', href: '/' },
        { 
          label: 'Shop All Products', 
          href: '#catalog', 
          onClick: () => handleCategoryClick('all') 
        },
        { 
          label: 'V2Ray Reality (10Gbps)', 
          href: '#catalog', 
          onClick: () => handleCategoryClick('vpn') 
        },
        { 
          label: 'VPN Bypass Nodes', 
          badge: 'FREE', 
          href: '#catalog', 
          onClick: () => handleCategoryClick('vpn') 
        },
        { 
          label: 'Cloud NVMe VPS', 
          href: '#catalog', 
          onClick: () => handleCategoryClick('vps') 
        }
      ]
    },
    {
      label: 'Key Vault & Orders',
      description: 'Instant credentials and order management.',
      links: [
        { 
          label: 'Track Order', 
          href: '#vault',
          onClick: () => {
            document.getElementById('vault')?.scrollIntoView({ behavior: 'smooth' });
          }
        },
        { 
          label: 'Personal Key Vault', 
          href: '#vault',
          onClick: () => {
            document.getElementById('vault')?.scrollIntoView({ behavior: 'smooth' });
          }
        },
        { 
          label: 'Customer Reviews', 
          href: '#reviews',
          onClick: () => {
            document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
          }
        },
        { 
          label: 'Admin Command Center', 
          href: '#vault',
          onClick: () => {
            document.getElementById('vault')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      ]
    },
    {
      label: 'Support & Community',
      description: 'Direct engineer contact and platform guides.',
      links: [
        { 
          label: 'Search Products', 
          href: '#catalog',
          onClick: () => {
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
          }
        },
        { label: 'WhatsApp Instant Support', href: 'https://wa.me/94771234567' },
        { label: 'Discord Community', href: 'https://discord.gg/fibez' },
        { 
          label: 'Infrastructure Status', 
          href: '#catalog',
          onClick: () => {
            document.getElementById('infrastructure')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      ]
    }
  ];

  return (
    <>
      <header className="sticky top-3 z-50 w-full px-4 sm:px-6 pointer-events-none">
        <div className="pointer-events-auto">
          <CardNav
            maxWidth={1120}
            theme="dark"
            surface="glass"
            cardEffect="rise"
            stagger={0.1}
            speed={1}
            logo={
              <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
                <FibezLogo withVersion={true} />
              </Link>
            }
            items={navItems}
            actions={
              <div className="flex items-center gap-2 mr-1">
                {/* Search Bar Shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    const input = document.querySelector('#catalog input') as HTMLInputElement | null;
                    if (input) input.focus();
                  }}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0f0c1c]/80 border border-white/10 text-xs text-[#8e87aa] hover:text-white hover:border-[#635BFF]/50 transition-all cursor-pointer"
                  title="Search products..."
                >
                  <Search className="w-3.5 h-3.5 text-[#8e87aa]" />
                  <span className="hidden lg:inline text-[12px]">Search products...</span>
                </button>

                {/* Currency Switcher: Rs. LKR | $ USD */}
                <div className="flex items-center bg-[#0f0c1c]/80 border border-white/10 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleCurrencyToggle('LKR')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentCurrency === 'LKR'
                        ? 'bg-[#635BFF] text-white shadow-[0_0_10px_rgba(99,91,255,0.45)]'
                        : 'text-[#8e87aa] hover:text-white'
                    }`}
                  >
                    Rs. LKR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurrencyToggle('USD')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentCurrency === 'USD'
                        ? 'bg-[#635BFF] text-white shadow-[0_0_10px_rgba(99,91,255,0.45)]'
                        : 'text-[#8e87aa] hover:text-white'
                    }`}
                  >
                    $ USD
                  </button>
                </div>

                {/* Shopping Cart Button */}
                <button
                  type="button"
                  onClick={handleCartClick}
                  className="p-2 rounded-xl bg-[#0f0c1c]/80 border border-white/10 text-[#c9c3e0] hover:text-white hover:border-[#635BFF]/50 transition-colors flex items-center justify-center relative cursor-pointer"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#635BFF] text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(99,91,255,0.8)]">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            }
            cta={{
              label: (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </span>
              ),
              onClick: () => {
                if (onOpenAuth) onOpenAuth('login');
              }
            }}
          />
        </div>
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
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
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
