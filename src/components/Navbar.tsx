'use client';

import React, { useState, useMemo } from 'react';
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
  LogOut, 
  LogIn, 
  UserPlus, 
  Activity,
  BookOpen,
  LayoutDashboard,
  LifeBuoy,
  X
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
  
  // Store context
  let store: ReturnType<typeof useStore> | null = null;
  try {
    store = useStore();
  } catch (e) {
    store = null;
  }

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Better Auth session hook
  const { data: session } = authClient.useSession();

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
    if (props.onOpenAuth) {
      props.onOpenAuth(mode);
    } else if (store) {
      store.openAuth(mode);
    }
  };

  // Account dropdown actions (Cart, Currency Settings, Vault, Infrastructure, and Auth)
  const dropdownActions: GooeyDropdownAction[] = [
    {
      id: 'dashboard',
      label: 'Control Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 text-zinc-300" />,
      detail: 'User, Admin & Owner consoles',
      onSelect: () => {
        router.push('/dashboard');
      },
    },
    {
      id: 'cart',
      label: `Shopping Cart (${cartCount})`,
      icon: <ShoppingCart className="w-4 h-4 text-zinc-300" />,
      detail: cartCount > 0 ? `${cartCount} item(s) in dedicated cart` : 'View dedicated cart',
      onSelect: () => {
        router.push('/cart');
      },
    },
    {
      id: 'currency',
      label: `Settings: ${currentCurrency}`,
      icon: <Globe className="w-4 h-4 text-zinc-300" />,
      detail: `Switch currency to ${currentCurrency === 'LKR' ? 'USD ($)' : 'LKR (Rs.)'}`,
      onSelect: () => handleCurrencyToggle(currentCurrency === 'LKR' ? 'USD' : 'LKR'),
    },
    {
      id: 'vault',
      label: 'Key Vault & Orders',
      icon: <KeyRound className="w-4 h-4 text-zinc-300" />,
      detail: 'Access credentials and active tokens',
      onSelect: () => {
        router.push('/vault');
      },
    },
    {
      id: 'infrastructure',
      label: 'Network Status',
      icon: <Activity className="w-4 h-4 text-zinc-300" />,
      detail: 'Global 10Gbps edge telemetry',
      onSelect: () => {
        router.push('/infrastructure');
      },
    },
    {
      id: 'docs',
      label: 'Setup Guides & Docs',
      icon: <BookOpen className="w-4 h-4 text-zinc-300" />,
      detail: 'Client configuration tutorials',
      onSelect: () => {
        router.push('/docs');
      },
    },
    {
      id: 'tickets',
      label: 'Support Tickets',
      icon: <LifeBuoy className="w-4 h-4 text-zinc-300" />,
      detail: 'Open tickets & 24/7 staff helpdesk',
      onSelect: () => {
        router.push('/tickets');
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
            icon: <LogIn className="w-4 h-4 text-zinc-300" />,
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
    : (cartCount > 0 ? `Cart (${cartCount})` : 'Account');

  // Standard Menu Navigation Cards
  const navItems: CardNavItem[] = [
    {
      label: 'Store & Catalog',
      description: 'Zero-trust automated fulfillment under 400ms.',
      links: [
        { label: 'All Products & Items', href: '/catalog' },
        { label: 'Dedicated Shopping Cart', href: '/cart' },
        { label: 'V2Ray Reality (10Gbps)', href: '/catalog?category=vpn' },
        { label: 'Gift Cards (Steam, PSN)', href: '/catalog?category=giftcard' },
        { label: 'Subscriptions (AI & Streaming)', href: '/catalog?category=subscription' },
        { label: 'Game Top-ups (Free Fire, UC)', href: '/catalog?category=gaming' },
        { label: 'Software Licenses (Win 11, IDM)', href: '/catalog?category=software' },
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
      label: 'Docs & Support',
      description: 'Tutorials and direct engineer assistance.',
      links: [
        { label: 'Support Tickets & Helpdesk', href: '/tickets' },
        { label: 'Knowledge Base', href: '/docs' },
        { label: 'v2rayNG & Sing-box Guide', href: '/docs#v2ray' },
        { label: 'Ubuntu VPS Hardening', href: '/docs#vps' },
        { label: 'WhatsApp Instant Support', href: 'https://wa.me/94771234567' },
        { label: 'Discord Community', href: 'https://discord.gg/fibez' },
      ]
    }
  ];

  // Default Search Category Cards: V2Ray, Gift Cards, Subscriptions, Game Top-ups, Software
  const defaultSearchCards: CardNavItem[] = [
    {
      label: 'V2Ray Reality VPN',
      description: 'Anti-DPI BGP bypass nodes for SLT, Dialog, Mobitel.',
      links: [
        { label: 'V2Ray Singapore Reality 10Gbps', href: '/products/v2ray-singapore-reality' },
        { label: 'V2Ray Tokyo Low-Latency', href: '/products/v2ray-tokyo-ultra' },
        { label: 'V2Ray US Anycast Gaming', href: '/products/v2ray-us-gaming' },
        { label: 'Browse All V2Ray Nodes ›', href: '/catalog?category=vpn' },
      ]
    },
    {
      label: 'Gift Cards',
      description: 'Instant official digital store codes & wallet top-ups.',
      links: [
        { label: 'Steam Wallet $10 Digital Code', href: '/products/steam-wallet-code-global' },
        { label: 'PlayStation Store $25 Card', href: '/products/psn-wallet-card-us' },
        { label: 'Nintendo eShop $20 Card', href: '/products/nintendo-eshop-gift-card' },
        { label: 'Browse All Gift Cards ›', href: '/catalog?category=giftcard' },
      ]
    },
    {
      label: 'Subscriptions',
      description: 'Verified AI models, developer tooling & streaming.',
      links: [
        { label: 'ChatGPT Plus 1 Month', href: '/products/chatgpt-plus-shared' },
        { label: 'Claude Pro 1 Month', href: '/products/claude-pro-shared' },
        { label: 'Spotify Premium 1 Year', href: '/products/spotify-premium-1y' },
        { label: 'Browse All Subscriptions ›', href: '/catalog?category=subscription' },
      ]
    },
    {
      label: 'Game Top-ups',
      description: 'Direct in-game diamond, UC, and coin top-ups.',
      links: [
        { label: 'Free Fire 1080+108 Diamonds', href: '/products/freefire-diamonds-topup' },
        { label: 'PUBG Mobile 660 UC', href: '/products/pubg-mobile-uc-topup' },
        { label: 'Valorant 2050 VP Points', href: '/products/valorant-points-topup' },
        { label: 'Browse All Game Top-ups ›', href: '/catalog?category=gaming' },
      ]
    },
    {
      label: 'Software',
      description: 'Genuine digital licenses and productivity tools.',
      links: [
        { label: 'Windows 11 Pro Retail License', href: '/products/windows-11-pro-retail' },
        { label: 'Internet Download Manager (IDM)', href: '/products/idm-internet-download-manager' },
        { label: 'Microsoft Office 365 ProPlus', href: '/products/office-365-proplus' },
        { label: 'Browse All Software ›', href: '/catalog?category=software' },
      ]
    }
  ];

  // Dynamically filtered search cards when user types a query
  const searchCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return defaultSearchCards;

    const matches = PRODUCTS.filter((p) =>
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
    const vpnMatches = matches.filter(m => m.category === 'vpn' || m.category === 'vps');
    const giftMatches = matches.filter(m => m.category === 'giftcard');
    const subMatches = matches.filter(m => m.category === 'subscription');
    const gameMatches = matches.filter(m => m.category === 'gaming');
    const softwareMatches = matches.filter(m => m.category === 'software');

    const resultCards: CardNavItem[] = [];

    if (vpnMatches.length > 0) {
      resultCards.push({
        label: `V2Ray Results (${vpnMatches.length})`,
        description: 'Matching V2Ray tunnel nodes',
        links: vpnMatches.map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }
    if (giftMatches.length > 0) {
      resultCards.push({
        label: `Gift Cards (${giftMatches.length})`,
        description: 'Matching digital wallet codes',
        links: giftMatches.map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }
    if (subMatches.length > 0) {
      resultCards.push({
        label: `Subscriptions (${subMatches.length})`,
        description: 'Matching accounts & licenses',
        links: subMatches.map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }
    if (gameMatches.length > 0) {
      resultCards.push({
        label: `Game Top-ups (${gameMatches.length})`,
        description: 'Matching game currencies & gems',
        links: gameMatches.map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }
    if (softwareMatches.length > 0) {
      resultCards.push({
        label: `Software (${softwareMatches.length})`,
        description: 'Matching licenses & tools',
        links: softwareMatches.map(m => ({ label: m.title, href: `/products/${m.id}` }))
      });
    }

    if (resultCards.length === 0) {
      resultCards.push({
        label: `Matching Products (${matches.length})`,
        description: `Direct results for "${searchQuery}"`,
        links: [
          ...matches.slice(0, 5).map(m => ({ label: m.title, href: `/products/${m.id}` })),
          { label: `View all results for "${searchQuery}" in Catalog ›`, href: `/catalog?q=${encodeURIComponent(searchQuery)}` }
        ]
      });
    }

    return resultCards;
  }, [searchQuery]);

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
        placeholder="Search all products, VPN nodes, cloud VPS, subscriptions..."
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
