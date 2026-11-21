'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FibezLogo from '@/components/FibezLogo';
import CardNav, { CardNavItem } from '@/components/CardNav';
import GooeyDropdown, { GooeyDropdownAction } from '@/components/GooeyDropdown';
import { authClient } from '@/lib/auth-client';
import { useStore } from '@/lib/store-context';
import { PRODUCTS } from '@/lib/products';
import { 
  ShoppingCart, 
  Search, 
  Globe, 
  KeyRound,
  Wallet,
  LogOut,
  LogIn, 
  UserPlus, 
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  Radio,
  X,
} from 'lucide-react';

export interface NavbarProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
  currency?: 'LKR' | 'USD';
  onCurrencyChange?: (currency: 'LKR' | 'USD') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelectCategory?: (category: 'all' | 'vpn' | 'subscription' | 'gaming' | 'giftcard' | 'software') => void;
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Navbar(props: NavbarProps) {
  const router = useRouter();
  
  // Store context
  let store: ReturnType<typeof useStore> | null = null;
  try {
    store = useStore();
  } catch (e) {
    store = null;
  }

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Shrink / expand with hysteresis (two thresholds) so the bar never flickers around one scroll
  // position. State only changes when the threshold is crossed, so this is cheap per scroll event.
  React.useEffect(() => {
    let scrolled = window.scrollY > 40;
    setIsScrolled(scrolled);
    const onScroll = () => {
      const y = window.scrollY;
      const next = scrolled ? y > 12 : y > 48;
      if (next !== scrolled) {
        scrolled = next;
        setIsScrolled(next);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Better Auth session hook
  const { data: session } = authClient.useSession();

  // Wallet balance (server ledger) shown in the account menu
  const [walletLkr, setWalletLkr] = useState<number | null>(null);
  useEffect(() => {
    if (!session?.user) {
      setWalletLkr(null);
      return;
    }
    let cancelled = false;
    fetch('/api/wallet', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && typeof d.balanceLkr === 'number') setWalletLkr(d.balanceLkr);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  // Staff get an Admin Console shortcut. Display only: /admin and its APIs re-check the role on the server.
  const [isStaff, setIsStaff] = useState(false);
  useEffect(() => {
    if (!session?.user) {
      setIsStaff(false);
      return;
    }
    let cancelled = false;
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const role = d?.user?.role;
        if (!cancelled) setIsStaff(role === 'admin' || role === 'owner');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  // Which sections are open (Admin -> Site pages) and which shop products are visible. Display only:
  // the pages and APIs enforce the same switches on the server.
  const [pageFlags, setPageFlags] = useState<{ shop: boolean; v2ray: boolean; tickets: boolean; docs: boolean; faq: boolean; infrastructure: boolean } | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    let cancelled = false;
    fetch('/api/site-pages', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        if (d.pages) setPageFlags(d.pages);
        if (Array.isArray(d.hiddenProducts)) setHiddenIds(new Set(d.hiddenProducts.map((x: unknown) => String(x))));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const shopOpen = pageFlags ? pageFlags.shop : true;
  const productVisible = (id: string, category: string) =>
    category === 'vpn' ? (pageFlags ? pageFlags.v2ray : true) : shopOpen && !hiddenIds.has(id);

  const currentCurrency = props.currency || store?.currency || 'LKR';
  const cartCount = props.cartCount !== undefined ? props.cartCount : (store?.cartCount || 0);

  const handleCurrencyToggle = (curr: 'LKR' | 'USD') => {
    if (props.onCurrencyChange) {
      props.onCurrencyChange(curr);
    } else if (store) {
      store.setCurrency(curr);
    }
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    router.push(mode === 'register' ? '/login?mode=register' : '/login');
  };

  // Account dropdown: a short, grouped list. Signed-in: wallet, orders, V2Ray, account, support,
  // then currency and sign out. Cart only shows when it has items (the navbar already has a cart).
  const dropdownActions: GooeyDropdownAction[] = session?.user
    ? [
        {
          id: 'wallet',
          label: walletLkr === null ? 'Wallet' : `Wallet: Rs. ${walletLkr.toLocaleString()}`,
          icon: <Wallet className="w-4 h-4 text-[#3ad389]" />,
          detail: 'Top up & history',
          onSelect: () => router.push('/billing'),
        },
        ...(cartCount > 0
          ? [
              {
                id: 'cart',
                label: `Cart (${cartCount})`,
                icon: <ShoppingCart className="w-4 h-4 text-zinc-300" />,
                onSelect: () => router.push('/cart'),
              },
            ]
          : []),
        {
          id: 'dashboard',
          label: 'Account & Settings',
          icon: <LayoutDashboard className="w-4 h-4 text-zinc-300" />,
          divider: true,
          onSelect: () => router.push('/dashboard'),
        },
        {
          id: 'tickets',
          label: 'Support',
          icon: <LifeBuoy className="w-4 h-4 text-zinc-300" />,
          onSelect: () => router.push('/tickets'),
        },
        ...(isStaff
          ? [
              {
                id: 'admin',
                label: 'Admin Console',
                icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
                onSelect: () => router.push('/admin'),
              },
            ]
          : []),
        {
          id: 'currency',
          label: `Currency: ${currentCurrency}`,
          icon: <Globe className="w-4 h-4 text-zinc-300" />,
          divider: true,
          onSelect: () => handleCurrencyToggle(currentCurrency === 'LKR' ? 'USD' : 'LKR'),
        },
        {
          id: 'signout',
          label: 'Sign Out',
          icon: <LogOut className="w-4 h-4 text-[#ff453a]" />,
          detail: session.user.email || session.user.name,
          destructive: true,
          onSelect: async () => {
            await authClient.signOut();
          },
        },
      ]
    : [
        {
          id: 'signin',
          label: 'Sign In',
          icon: <LogIn className="w-4 h-4 text-zinc-300" />,
          detail: 'Access your orders & keys',
          onSelect: () => handleOpenAuthModal('login'),
        },
        {
          id: 'register',
          label: 'Create Account',
          icon: <UserPlus className="w-4 h-4 text-zinc-300" />,
          onSelect: () => handleOpenAuthModal('register'),
        },
        ...(cartCount > 0
          ? [
              {
                id: 'cart',
                label: `Cart (${cartCount})`,
                icon: <ShoppingCart className="w-4 h-4 text-zinc-300" />,
                divider: true,
                onSelect: () => router.push('/cart'),
              },
            ]
          : []),
        {
          id: 'currency',
          label: `Currency: ${currentCurrency}`,
          icon: <Globe className="w-4 h-4 text-zinc-300" />,
          divider: cartCount === 0,
          onSelect: () => handleCurrencyToggle(currentCurrency === 'LKR' ? 'USD' : 'LKR'),
        },
      ];

  const dropdownLabel = session?.user
    ? (session.user.name ? session.user.name.split(' ')[0] : session.user.email?.split('@')[0] || 'Account')
    : (cartCount > 0 ? `Cart (${cartCount})` : 'Account');

  // Three clear groups: what to buy, your account, and help. Each page appears once.
  const navItems: CardNavItem[] = [
    {
      label: shopOpen ? 'Shop' : 'V2Ray',
      description: shopOpen ? 'Browse everything we sell.' : 'High-speed VLESS VPN for Sri Lanka.',
      links: [
        ...(shopOpen ? [{ label: 'All Products', href: '/catalog' }] : []),
        { label: 'VLESS VPN Packages', href: '/v2ray' },
        ...(shopOpen
          ? [
              { label: 'Gift Cards & Gaming', href: '/catalog?category=giftcard' },
              { label: 'Subscriptions & Software', href: '/catalog?category=subscription' },
            ]
          : [{ label: '24-Hour Free Trial', href: '/v2ray' }]),
      ]
    },
    {
      label: 'My Account',
      description: 'Orders, lines and money.',
      links: [
        { label: 'Orders & Keys', href: '/vault' },
        { label: 'V2Ray Dashboard', href: '/v2ray/dashboard' },
        { label: 'Wallet & Top-up', href: '/billing' },
        { label: 'Cart', href: '/cart' },
      ]
    },
    {
      label: 'Help',
      description: 'Setup guides and support.',
      links: [
        { label: 'Setup Guide (NetMod / v2rayNG)', href: '/v2ray/guide' },
        { label: 'VLESS Line Check', href: '/v2ray#line-check' },
        ...(!pageFlags || pageFlags.tickets ? [{ label: 'Support Tickets', href: '/tickets' }] : []),
        { label: 'WhatsApp Support', href: 'https://wa.me/94771234567' },
      ]
    }
  ];

  // Clean 3-Card Default Search Suggestions
  const defaultSearchCards: CardNavItem[] = [
    {
      label: 'VLESS VPN',
      description: 'Optimised for SLT, Dialog, Hutch & Airtel.',
      links: [
        { label: 'All VLESS Packages ›', href: '/v2ray' },
        { label: 'Dialog Zoom VLESS VPN', href: '/products/v2ray-dialog-zoom' },
        { label: 'SLT Fiber Netflix Bypass', href: '/products/v2ray-slt-netflix' },
        { label: 'Free 24-Hour Trial', href: '/v2ray' },
      ]
    },
    {
      label: 'Gift Cards & Gaming',
      description: 'Steam, PSN, Free Fire, PUBG UC & top-ups.',
      links: [
        { label: 'Steam Wallet $10', href: '/products/steam-wallet-code-global' },
        { label: 'Free Fire 1,080 Diamonds', href: '/products/freefire-diamonds-1080' },
        { label: 'PUBG Mobile 660 UC', href: '/products/pubg-mobile-uc-660' },
        { label: 'All Gift Cards & Games ›', href: '/catalog?category=giftcard' },
      ]
    },
    {
      label: 'Subscriptions & Software',
      description: 'Netflix, ChatGPT Plus, Spotify & Microsoft 365.',
      links: [
        { label: 'Netflix 4K UHD', href: '/products/netflix-4k-uhd' },
        { label: 'ChatGPT Plus / Team', href: '/products/chatgpt-plus-team' },
        { label: 'Microsoft 365 ProPlus', href: '/products/microsoft-365-proplus' },
        { label: 'All Subscriptions & Software ›', href: '/catalog?category=subscription' },
      ]
    }
  ];

  // Dynamically filtered search cards when user types a query
  const searchCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return defaultSearchCards
        .map((card) => ({
          ...card,
          links: (card.links || []).filter((l) => {
            const m = /^\/products\/(.+)$/.exec(l.href || '');
            if (!m) return shopOpen || !/^\/catalog/.test(l.href || '');
            const prod = PRODUCTS.find((x) => x.id === m[1]);
            return prod ? productVisible(prod.id, prod.category) : true;
          }),
        }))
        .filter((card) => (card.links || []).length > 0);
    }

    const matches = PRODUCTS.filter((p) => productVisible(p.id, p.category)).filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      return [
        {
          label: 'No Exact Matches',
          description: `No products matching "${searchQuery}". Press Enter to search catalog.`,
          links: [
            { label: `Search for "${searchQuery}" in full catalog ›`, href: `/catalog?q=${encodeURIComponent(searchQuery)}` }
          ]
        }
      ];
    }

    // Split matches into categorized result cards
    const vpnMatches = matches.filter(m => m.category === 'vpn');
    const giftMatches = matches.filter(m => m.category === 'giftcard');
    const subMatches = matches.filter(m => m.category === 'subscription');
    const gameMatches = matches.filter(m => m.category === 'gaming');
    const softwareMatches = matches.filter(m => m.category === 'software');

    const resultCards: CardNavItem[] = [];

    if (vpnMatches.length > 0) {
      resultCards.push({
        label: `VLESS VPN (${vpnMatches.length})`,
        description: 'High-speed VLESS VPN packages',
        links: vpnMatches.slice(0, 4).map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }
    if (giftMatches.length > 0) {
      resultCards.push({
        label: `Gift Cards (${giftMatches.length})`,
        description: 'Official digital wallet codes',
        links: giftMatches.slice(0, 4).map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }
    if (subMatches.length > 0) {
      resultCards.push({
        label: `Subscriptions (${subMatches.length})`,
        description: 'Streaming, music & accounts',
        links: subMatches.slice(0, 4).map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }
    if (gameMatches.length > 0) {
      resultCards.push({
        label: `Game Top-ups (${gameMatches.length})`,
        description: 'In-game diamonds, UC & keys',
        links: gameMatches.slice(0, 4).map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }
    if (softwareMatches.length > 0) {
      resultCards.push({
        label: `Software & AI (${softwareMatches.length})`,
        description: 'Licenses & productivity tools',
        links: softwareMatches.slice(0, 4).map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }

    if (resultCards.length === 0) {
      resultCards.push({
        label: `Matching Products (${matches.length})`,
        description: `Direct results for "${searchQuery}"`,
        links: [
          ...matches.slice(0, 4).map(m => ({ label: m.title, href: `/products/${m.id}` })),
          { label: `View all results for "${searchQuery}" in Catalog ›`, href: `/catalog?q=${encodeURIComponent(searchQuery)}` }
        ]
      });
    }

    return resultCards.slice(0, 3);
  }, [searchQuery, pageFlags, hiddenIds]);

  // Full-width search bar taking up the whole top bar when search is active
  const searchBarElement = (
    <div className="w-full h-full flex items-center gap-3 px-3">
      <Search className="w-4 h-4 text-zinc-400 shrink-0" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsSearchOpen(false);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (searchQuery.trim()) {
              router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
              setIsSearchOpen(false);
            }
          }
        }}
        placeholder="Search VLESS VPN, Steam, Netflix, ChatGPT, Free Fire..."
        className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none font-sans"
        autoFocus
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Clear query"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => setIsSearchOpen(false)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer select-none shrink-0"
      >
        <span>Close</span>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <header
      className={`sticky z-50 w-full pointer-events-none transition-[top,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isScrolled ? 'top-2 px-5 sm:px-8' : 'top-3 px-4 sm:px-6'
      }`}
    >
      <div className="pointer-events-auto">
        <CardNav
          defaultOpen={false}
          maxWidth={isScrolled ? 860 : 1120}
          scrolled={isScrolled}
          theme="dark"
          surface="glass"
          cardEffect="rise"
          stagger={0.1}
          speed={1}
          /* FIBEZ wordmark: enlarged with wide character spacing, uniform typography, no icon */
          logo={
            <Link
              href="/"
              className="font-mono text-[24px] sm:text-[27px] font-bold tracking-[0.38em] text-white hover:opacity-85 transition-opacity select-none pl-[0.18em]"
            >
              FIBEZ
            </Link>
          }
          logoHref="/"
          items={navItems}
          searchOpen={isSearchOpen}
          onSearchOpenChange={setIsSearchOpen}
          searchBar={searchBarElement}
          searchItems={searchCards}
          actions={
            <div className="flex items-center gap-2 mr-1">
              {/* Search: ONLY an icon button, no text, no colors */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Search"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Gooey Liquid Dropdown: Dedicated Cart, Settings, Vault, Auth */}
              <GooeyDropdown
                label={dropdownLabel}
                actions={dropdownActions}
                anchor="end"
                menuWidth={280}
                fill="#111215"
                ink="#ffffff"
                danger="#ff453a"
                gap={12}
              />
            </div>
          }
        />
      </div>
    </header>
  );
}
