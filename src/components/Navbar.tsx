'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CardNav, { CardNavItem } from '@/components/CardNav';
import GooeyDropdown, { GooeyDropdownAction } from '@/components/GooeyDropdown';
import SearchMenu from '@/components/SearchMenu';
import { authClient } from '@/lib/auth-client';
import { 
  ShoppingCart, 
  User, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Globe, 
  KeyRound, 
  LogOut, 
  LogIn, 
  UserPlus 
} from 'lucide-react';

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
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);

  // Better Auth session hook
  const { data: session } = authClient.useSession();

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

  // Keyboard shortcut ⌘K / Ctrl+K for search menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Account dropdown actions (combines Cart, Currency Settings, Vault, and Auth)
  const dropdownActions: GooeyDropdownAction[] = [
    {
      id: 'cart',
      label: `Shopping Cart (${cartCount})`,
      icon: <ShoppingCart className="w-4 h-4 text-[#9281f7]" />,
      detail: cartCount > 0 ? `${cartCount} item(s) awaiting checkout` : 'Cart is currently empty',
      shortcut: 'C',
      onSelect: () => handleCartClick(),
    },
    {
      id: 'currency',
      label: `Settings: ${currentCurrency}`,
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      detail: `Switch currency to ${currentCurrency === 'LKR' ? 'USD ($)' : 'LKR (Rs.)'}`,
      shortcut: '$',
      onSelect: () => handleCurrencyToggle(currentCurrency === 'LKR' ? 'USD' : 'LKR'),
    },
    {
      id: 'vault',
      label: 'Key Vault & Orders',
      icon: <KeyRound className="w-4 h-4 text-amber-400" />,
      detail: 'Access credentials and active tokens',
      shortcut: 'V',
      onSelect: () => {
        document.getElementById('vault')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    ...(session?.user
      ? [
          {
            id: 'signout',
            label: 'Sign Out',
            icon: <LogOut className="w-4 h-4 text-[#ff453a]" />,
            detail: session.user.email || session.user.name,
            destructive: true,
            shortcut: 'X',
            divider: true,
            onSelect: async () => {
              await authClient.signOut();
            },
          },
        ]
      : [
          {
            id: 'signin',
            label: 'Sign In',
            icon: <LogIn className="w-4 h-4 text-[#9281f7]" />,
            detail: 'Access developer console & keys',
            shortcut: 'S',
            divider: true,
            onSelect: () => onOpenAuth?.('login'),
          },
          {
            id: 'register',
            label: 'Create Account',
            icon: <UserPlus className="w-4 h-4 text-zinc-300" />,
            detail: 'Deploy digital infrastructure',
            onSelect: () => onOpenAuth?.('register'),
          },
        ]),
  ];

  const dropdownLabel = session?.user
    ? (session.user.name ? session.user.name.split(' ')[0] : session.user.email?.split('@')[0] || 'Account')
    : (cartCount > 0 ? `Account (${cartCount})` : 'Account');

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
            setSearchMenuOpen(true);
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
            defaultOpen={false}
            maxWidth={1120}
            theme="dark"
            surface="glass"
            cardEffect="rise"
            stagger={0.1}
            speed={1}
            /* Strictly FIBEZ wordmark only — no icon box, no monogram, no VAULT */
            logo={
              <Link
                href="/"
                className="font-mono text-[16px] font-semibold tracking-[0.24em] text-white hover:text-[#9281f7] transition-colors select-none"
              >
                FIBEZ
              </Link>
            }
            logoHref="/"
            items={navItems}
            actions={
              <div className="flex items-center gap-2 mr-1">
                {/* Topbar Search Button — opens Search Menu just like menu opening */}
                <button
                  type="button"
                  onClick={() => setSearchMenuOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141026]/90 border border-white/10 text-xs text-[#8e87aa] hover:text-white hover:border-[#9281f7]/50 transition-all cursor-pointer shadow-sm"
                  title="Search products (⌘K)"
                >
                  <Search className="w-3.5 h-3.5 text-[#9281f7]" />
                  <span className="hidden sm:inline text-[12px]">Search</span>
                  <kbd className="hidden md:inline-block font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                    ⌘K
                  </kbd>
                </button>

                {/* Gooey Liquid Dropdown: Account, Cart, Currency Settings, Vault */}
                <GooeyDropdown
                  label={dropdownLabel}
                  actions={dropdownActions}
                  anchor="end"
                  menuWidth={270}
                  fill="#151224"
                  ink="#ffffff"
                  danger="#ff453a"
                  gap={12}
                />
              </div>
            }
          />
        </div>
      </header>

      {/* Topbar Search Menu (opens just like menu opening) */}
      <SearchMenu
        isOpen={searchMenuOpen}
        onClose={() => setSearchMenuOpen(false)}
        currency={currentCurrency}
        onSelectCategory={handleCategoryClick}
        onSearchSubmit={(q) => {
          if (onSearchChange) onSearchChange(q);
        }}
      />

      {/* Slide-over Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="relative w-full max-w-md bg-[#0a0815] border-l border-[#231e38] p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#231e38]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#9281f7]" />
                  <h3 className="text-lg font-semibold text-white">Your Shopping Cart</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close Cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cartCount === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#130f24] border border-[#2a2247] flex items-center justify-center mx-auto text-[#9281f7]">
                    <ShoppingCart className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-white">Your cart is currently empty</h4>
                    <p className="text-sm text-[#877f9f] mt-1 max-w-xs mx-auto">
                      Browse high-performance V2Ray nodes, cloud VPS, or software licenses to add items.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCartDrawerOpen(false);
                      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 bg-[#9281f7] hover:bg-[#806ff5] text-black text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer shadow-[0_0_15px_rgba(146,129,247,0.4)]"
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
