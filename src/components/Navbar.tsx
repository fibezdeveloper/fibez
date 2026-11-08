'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CardNav, { CardNavItem } from '@/components/CardNav';
import GooeyDropdown, { GooeyDropdownAction } from '@/components/GooeyDropdown';
import SearchMenu from '@/components/SearchMenu';
import { authClient } from '@/lib/auth-client';
import { useStore } from '@/lib/store-context';
import { 
  ShoppingCart, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Globe, 
  KeyRound, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Trash2, 
  Plus, 
  Minus,
  Activity,
  BookOpen
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

export default function Navbar(props: NavbarProps) {
  const router = useRouter();
  
  // Safely attempt to use store context if wrapped in StoreProvider
  let store: ReturnType<typeof useStore> | null = null;
  try {
    store = useStore();
  } catch (e) {
    store = null;
  }

  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [internalCartOpen, setInternalCartOpen] = useState(false);

  // Better Auth session hook
  const { data: session } = authClient.useSession();

  const currentCurrency = props.currency || store?.currency || 'LKR';
  const cartCount = props.cartCount !== undefined ? props.cartCount : (store?.cartCount || 0);
  const isCartDrawerOpen = store ? store.isCartOpen : internalCartOpen;

  const handleCurrencyToggle = (curr: 'LKR' | 'USD') => {
    if (props.onCurrencyChange) {
      props.onCurrencyChange(curr);
    } else if (store) {
      store.setCurrency(curr);
    }
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    if (props.onOpenAuth) {
      props.onOpenAuth(mode);
    } else if (store) {
      store.openAuth(mode);
    }
  };

  const handleCartOpen = () => {
    if (props.onOpenCart) {
      props.onOpenCart();
    } else if (store) {
      store.setIsCartOpen(true);
    } else {
      setInternalCartOpen(true);
    }
  };

  const handleCartClose = () => {
    if (store) {
      store.setIsCartOpen(false);
    } else {
      setInternalCartOpen(false);
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

  // Account dropdown actions (combines Cart, Currency Settings, Vault, Infrastructure, and Auth)
  const dropdownActions: GooeyDropdownAction[] = [
    {
      id: 'cart',
      label: `Shopping Cart (${cartCount})`,
      icon: <ShoppingCart className="w-4 h-4 text-[#9281f7]" />,
      detail: cartCount > 0 ? `${cartCount} item(s) awaiting checkout` : 'Cart is currently empty',
      onSelect: () => handleCartOpen(),
    },
    {
      id: 'currency',
      label: `Settings: ${currentCurrency}`,
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      detail: `Switch currency to ${currentCurrency === 'LKR' ? 'USD ($)' : 'LKR (Rs.)'}`,
      onSelect: () => handleCurrencyToggle(currentCurrency === 'LKR' ? 'USD' : 'LKR'),
    },
    {
      id: 'vault',
      label: 'Key Vault & Orders',
      icon: <KeyRound className="w-4 h-4 text-amber-400" />,
      detail: 'Access credentials and active tokens',
      onSelect: () => {
        router.push('/vault');
      },
    },
    {
      id: 'infrastructure',
      label: 'Network Status',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      detail: 'Global 10Gbps edge telemetry',
      onSelect: () => {
        router.push('/infrastructure');
      },
    },
    {
      id: 'docs',
      label: 'Setup Guides & Docs',
      icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
      detail: 'Client configuration tutorials',
      onSelect: () => {
        router.push('/docs');
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
            divider: true,
            onSelect: () => handleOpenAuthModal('login'),
          },
          {
            id: 'register',
            label: 'Create Account',
            icon: <UserPlus className="w-4 h-4 text-zinc-300" />,
            detail: 'Deploy digital infrastructure',
            onSelect: () => handleOpenAuthModal('register'),
          },
        ]),
  ];

  const dropdownLabel = session?.user
    ? (session.user.name ? session.user.name.split(' ')[0] : session.user.email?.split('@')[0] || 'Account')
    : (cartCount > 0 ? `Account (${cartCount})` : 'Account');

  const navItems: CardNavItem[] = [
    {
      label: 'Store & Catalog',
      description: 'Zero-trust automated fulfillment under 400ms.',
      links: [
        { label: 'All Products & Nodes', href: '/catalog' },
        { label: 'V2Ray Reality (10Gbps)', href: '/catalog?category=vpn' },
        { label: 'Cloud NVMe VPS', href: '/catalog?category=vps' },
        { label: 'Software & AI Subscriptions', href: '/catalog?category=subscription' },
        { label: 'Steam & Global Game Keys', href: '/catalog?category=gaming' },
      ]
    },
    {
      label: 'Key Vault & Orders',
      description: 'Instant credentials and order management.',
      links: [
        { label: 'Personal Key Vault', href: '/vault' },
        { label: 'Track Order Status', href: '/vault?tab=orders' },
        { label: 'Global Network Telemetry', href: '/infrastructure' },
        { label: 'Client Setup Guides', href: '/docs' },
      ]
    },
    {
      label: 'Docs & Community',
      description: 'Tutorials and direct engineer assistance.',
      links: [
        { label: 'Knowledge Base', href: '/docs' },
        { label: 'v2rayNG & Sing-box Guide', href: '/docs#v2ray' },
        { label: 'Ubuntu VPS Hardening', href: '/docs#vps' },
        { label: 'WhatsApp Instant Support', href: 'https://wa.me/94771234567' },
        { label: 'Discord Community', href: 'https://discord.gg/fibez' },
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
                {/* Topbar Search Button — opens Search Menu */}
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

                {/* Gooey Liquid Dropdown: Account, Cart, Settings, Vault */}
                <GooeyDropdown
                  label={dropdownLabel}
                  actions={dropdownActions}
                  anchor="end"
                  menuWidth={280}
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
        onSelectProduct={(product) => {
          router.push(`/products/${product.id}`);
        }}
        onSelectCategory={(category) => {
          router.push(category === 'all' ? '/catalog' : `/catalog?category=${category}`);
        }}
        onSearchSubmit={(q) => {
          router.push(`/catalog?q=${encodeURIComponent(q)}`);
        }}
      />

      {/* Slide-over Cart Drawer */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0a0815] border-l border-[#231e38] p-6 shadow-2xl flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-5 border-b border-[#231e38]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#9281f7]" />
                  <h3 className="text-lg font-semibold text-white">Your Shopping Cart</h3>
                </div>
                <button
                  type="button"
                  onClick={handleCartClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close Cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(!store || store.cart.length === 0) ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#130f24] border border-[#2a2247] flex items-center justify-center mx-auto text-[#9281f7]">
                    <ShoppingCart className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-white">Your cart is currently empty</h4>
                    <p className="text-sm text-[#877f9f] mt-1 max-w-xs mx-auto">
                      Explore V2Ray nodes, cloud VPS, or software licenses to add items.
                    </p>
                  </div>
                  <Link
                    href="/catalog"
                    onClick={handleCartClose}
                    className="inline-flex items-center gap-2 bg-[#9281f7] hover:bg-[#806ff5] text-black text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer shadow-[0_0_15px_rgba(146,129,247,0.4)]"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="py-4 space-y-3">
                  {store.cart.map((item) => {
                    const priceText = currentCurrency === 'USD' 
                      ? `$${(item.priceUSD * item.quantity).toFixed(2)}`
                      : `Rs. ${(item.priceLKR * item.quantity).toLocaleString()}`;

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-[12px] bg-[#120e24] border border-[#261f42] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <Link 
                            href={`/products/${item.productId}`}
                            onClick={handleCartClose}
                            className="text-sm font-medium text-white hover:text-[#9281f7] transition-colors line-clamp-1"
                          >
                            {item.product.title}
                          </Link>
                          <div className="text-xs text-[#8e87aa] mt-0.5">
                            Duration: <span className="text-zinc-300">{item.durationLabel}</span>
                          </div>
                          <div className="text-sm font-mono text-[#9281f7] font-semibold mt-1">
                            {priceText}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-lg bg-[#0a0815] border border-[#2a243d] p-1">
                            <button
                              type="button"
                              onClick={() => store?.updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded text-zinc-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => store?.updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded text-zinc-400 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => store?.removeFromCart(item.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {store && store.cart.length > 0 && (
              <div className="pt-4 border-t border-[#231e38] space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8e87aa]">Subtotal</span>
                  <span className="font-mono text-base font-bold text-white">
                    {currentCurrency === 'USD'
                      ? `$${store.cartTotalUSD.toFixed(2)}`
                      : `Rs. ${store.cartTotalLKR.toLocaleString()}`}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleCartClose();
                      router.push('/cart');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#9281f7] hover:bg-[#806ff5] text-black font-semibold text-xs tracking-wider uppercase text-center transition-all shadow-[0_0_15px_rgba(146,129,247,0.35)]"
                  >
                    View Cart & Checkout ›
                  </button>
                  <button
                    type="button"
                    onClick={() => store.clearCart()}
                    className="p-2.5 rounded-xl border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition-colors"
                    title="Clear Cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#877f9f] justify-center pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Zero-trust fulfillment delivered under 400ms</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
