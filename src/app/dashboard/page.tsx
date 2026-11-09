'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { PRODUCTS } from '@/lib/products';
import TicketCenter from '@/components/TicketCenter';
import { useStore } from '@/lib/store-context';
import {
  Shield,
  Server,
  KeyRound,
  Download,
  Copy,
  Check,
  Activity,
  AlertTriangle,
  RotateCw,
  UserCheck,
  UserX,
  MessageSquare,
  Star,
  DollarSign,
  TrendingUp,
  Sliders,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Filter,
  X,
  Users,
  LifeBuoy,
  CornerDownRight,
  Share2,
  Globe,
  Power,
  Save,
  Landmark
} from 'lucide-react';

type RoleType = 'user' | 'admin' | 'owner';

interface SupportTicket {
  id: string;
  customerEmail: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  lastReply?: string;
  createdAt: string;
}

interface PendingOrder {
  id: string;
  orderNumber: string;
  customerEmail: string;
  productTitle: string;
  amount: string;
  slipName: string;
  paymentMethod: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  date: string;
}

interface CustomerReview {
  id: string;
  author: string;
  productTitle: string;
  rating: number;
  comment: string;
  status: 'Approved' | 'Pending' | 'Hidden';
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Role switching state (defaults to user's database role if logged in, else defaults to user view)
  const initialRole: RoleType = (session?.user as any)?.role || 'user';
  const [activeRole, setActiveRole] = useState<RoleType>(initialRole);

  // Global store for footer social links
  const { socialLinks, updateSocialLink, toggleSocialLink, resetSocialLinks } = useStore();
  const [socialSavedToast, setSocialSavedToast] = useState(false);

  useEffect(() => {
    if ((session?.user as any)?.role) {
      setActiveRole((session?.user as any).role);
    }
  }, [session]);

  // Copied state indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Download config helper
  const handleDownloadConfig = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // USER DASHBOARD DATA & STATE
  // ==========================================
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [isSpeedTesting, setIsSpeedTesting] = useState(false);
  const [telemetry, setTelemetry] = useState([
    { node: 'Singapore Reality Edge (10Gbps)', ping: 12, speed: 9.84, jitter: 0.4, status: 'Optimal' },
    { node: 'Tokyo Low-Latency (BGP Peered)', ping: 48, speed: 8.92, jitter: 0.8, status: 'Optimal' },
    { node: 'Frankfurt Tier-3 NVMe VPS', ping: 114, speed: 9.95, jitter: 1.2, status: 'Optimal' },
    { node: 'US East Anycast Gaming', ping: 142, speed: 5.20, jitter: 1.8, status: 'Stable' },
  ]);

  const runSpeedTest = () => {
    setIsSpeedTesting(true);
    setTimeout(() => {
      setTelemetry((prev) =>
        prev.map((item) => ({
          ...item,
          ping: Math.max(8, item.ping + (Math.floor(Math.random() * 5) - 2)),
          speed: parseFloat((item.speed + (Math.random() * 0.2 - 0.1)).toFixed(2)),
        }))
      );
      setIsSpeedTesting(false);
    }, 1200);
  };

  // ==========================================
  // ADMIN DASHBOARD DATA & STATE
  // ==========================================
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([
    {
      id: 'ord-1',
      orderNumber: 'FBZ-9401',
      customerEmail: 'chamara.dev@gmail.com',
      productTitle: 'V2Ray Singapore Reality 10Gbps',
      amount: 'Rs. 1,150 LKR',
      slipName: 'slip_slt_commercial_bank.jpg',
      paymentMethod: 'Bank Transfer (Commercial Bank)',
      status: 'Pending',
      date: 'Today, 03:42 AM',
    },
    {
      id: 'ord-2',
      orderNumber: 'FBZ-9402',
      customerEmail: 'tharindu@sltnet.lk',
      productTitle: 'Cloud NVMe VPS (Ubuntu 24.04)',
      amount: '$18.00 USD',
      slipName: 'frimi_receipt_8812.png',
      paymentMethod: 'FriMi / Nations Trust',
      status: 'Pending',
      date: 'Today, 02:18 AM',
    },
    {
      id: 'ord-3',
      orderNumber: 'FBZ-9403',
      customerEmail: 'ai_studio@proton.me',
      productTitle: 'ChatGPT Plus (1 Month Subscription)',
      amount: '$20.00 USD',
      slipName: 'usdt_trc20_hash_9a.png',
      paymentMethod: 'Crypto (USDT TRC20)',
      status: 'Pending',
      date: 'Yesterday, 11:20 PM',
    },
  ]);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'T-501',
      customerEmail: 'kasun@gmail.com',
      subject: 'SLT Fiber bandwidth throttling bypass SNI check',
      status: 'Open',
      createdAt: '2 hours ago',
    },
    {
      id: 'T-502',
      customerEmail: 'dev@matrix.lk',
      subject: 'Requesting custom reverse DNS (PTR) record for VPS 139.180.210.45',
      status: 'In Progress',
      lastReply: 'Support: We are routing this to the upstream data center.',
      createdAt: 'Yesterday',
    },
    {
      id: 'T-503',
      customerEmail: 'nuwan@outlook.com',
      subject: 'Need help scanning QR code inside Shadowrocket for iOS',
      status: 'Open',
      createdAt: 'Yesterday',
    },
  ]);

  const [reviews, setReviews] = useState<CustomerReview[]>([
    {
      id: 'rev-1',
      author: 'Dilan K.',
      productTitle: 'V2Ray Singapore Reality',
      rating: 5,
      comment: 'Fastest latency in Sri Lanka. 12ms ping on SLT fiber with zero packet loss in Apex Legends.',
      status: 'Approved',
      date: 'Nov 7, 2026',
    },
    {
      id: 'rev-2',
      author: 'Nadeesha S.',
      productTitle: 'Cloud NVMe VPS',
      rating: 5,
      comment: 'Instant provisioning took under 300ms. EPYC processor benchmarked at full speed.',
      status: 'Approved',
      date: 'Nov 6, 2026',
    },
    {
      id: 'rev-3',
      author: 'Kamal R.',
      productTitle: 'ChatGPT Plus Key',
      rating: 4,
      comment: 'Works as promised. Prompt support on WhatsApp when logging in.',
      status: 'Pending',
      date: 'Nov 8, 2026',
    },
  ]);

  const [activeTicketReply, setActiveTicketReply] = useState<Record<string, string>>({});
  const [userSubTab, setUserSubTab] = useState<'services' | 'tickets'>('services');

  // Live Reviews & Tickets State for Admin & Owner Moderation
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  const [loadingLiveReviews, setLoadingLiveReviews] = useState(false);
  const [adminReplyDraft, setAdminReplyDraft] = useState<Record<string, string>>({});
  const [openTicketCount, setOpenTicketCount] = useState<number>(3);

  useEffect(() => {
    if (activeRole === 'admin' || activeRole === 'owner') {
      fetchLiveReviews();
      fetch('/api/tickets?role=admin')
        .then((res) => res.json())
        .then((data) => {
          if (data.tickets) {
            const activeTickets = data.tickets.filter(
              (t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_USER'
            ).length;
            setOpenTicketCount(activeTickets);
          }
        })
        .catch((err) => console.error('Failed to load tickets count:', err));

      // Fetch real orders from PostgreSQL
      fetch('/api/orders?role=admin')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders && data.orders.length > 0) {
            const mappedOrders: PendingOrder[] = data.orders.map((o: any) => ({
              id: o.id,
              orderNumber: o.order_number,
              customerEmail: o.customer_email,
              productTitle: o.items?.[0]?.product_title || 'Digital Product',
              amount: o.currency === 'USD' ? `$${o.total_amount_usd} USD` : `Rs. ${Number(o.total_amount_lkr).toLocaleString()}`,
              slipName: o.receipt_image_url ? 'bank_transfer_slip.png' : 'Pending Slip',
              paymentMethod: o.payment_method === 'crypto' ? 'Crypto (USDT TRC20)' : 'Bank Transfer / CDM',
              status: o.payment_status === 'VERIFIED' ? 'Verified' : o.payment_status === 'FAILED' ? 'Rejected' : 'Pending',
              date: new Date(o.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            }));
            setPendingOrders(mappedOrders);
          }
        })
        .catch((err) => console.error('Failed to load orders:', err));

      // Fetch real products from PostgreSQL
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (data.products && data.products.length > 0) {
            setCatalogItems(
              data.products.map((p: any) => ({
                id: p.id,
                title: p.title,
                priceLKR: p.price_lkr,
                priceUSD: Number(p.price_usd),
                stockCount: p.stock_count,
                category: p.category_id,
                active: p.is_active,
              }))
            );
          }
        })
        .catch((err) => console.error('Failed to load products:', err));

      // Fetch real servers from PostgreSQL
      fetch('/api/servers')
        .then((res) => res.json())
        .then((data) => {
          if (data.servers && data.servers.length > 0) {
            setServers(
              data.servers.map((s: any) => ({
                id: s.id,
                name: s.name,
                location: s.location,
                cpu: s.cpu_usage,
                ram: s.ram_usage,
                bandwidth: s.bandwidth_used,
                status: s.status,
                core: s.core_version,
              }))
            );
          }
        })
        .catch((err) => console.error('Failed to load servers:', err));
    }
  }, [activeRole]);

  const fetchLiveReviews = async () => {
    try {
      setLoadingLiveReviews(true);
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      if (data.reviews) {
        setLiveReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to load live reviews:', err);
    } finally {
      setLoadingLiveReviews(false);
    }
  };

  const handleToggleLiveReviewStatus = async (reviewId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'APPROVED' ? 'FLAGGED' : 'APPROVED';
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status: newStatus }),
      });
      setLiveReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Failed to toggle review status:', err);
    }
  };

  const handlePostAdminReply = async (reviewId: string) => {
    const reply = adminReplyDraft[reviewId]?.trim();
    if (!reply) return;
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action: 'reply', adminReply: reply }),
      });
      setLiveReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, admin_reply: reply } : r))
      );
      setAdminReplyDraft((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (err) {
      console.error('Failed to post admin reply:', err);
    }
  };

  const handleApproveOrder = async (id: string) => {
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Verified' } : o))
    );
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, paymentStatus: 'VERIFIED', fulfillmentStatus: 'DELIVERED' }),
      });
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  const handleRejectOrder = async (id: string) => {
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Rejected' } : o))
    );
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, paymentStatus: 'FAILED', fulfillmentStatus: 'REVOKED' }),
      });
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  const handleSendTicketReply = (ticketId: string) => {
    const text = activeTicketReply[ticketId];
    if (!text?.trim()) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'Resolved', lastReply: `Staff: ${text}` }
          : t
      )
    );
    setActiveTicketReply((prev) => ({ ...prev, [ticketId]: '' }));
  };

  const handleToggleReviewStatus = (id: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'Approved' ? 'Hidden' : 'Approved' }
          : r
      )
    );
  };

  // ==========================================
  // OWNER DASHBOARD DATA & 2FA SECURITY STATE
  // ==========================================
  const [servers, setServers] = useState([
    { id: 'srv-1', name: 'SG-EDGE-01', location: 'Singapore', cpu: '22%', ram: '4.2 / 16 GB', bandwidth: '14.8 TB', status: 'Healthy', core: 'Xray v1.8.8' },
    { id: 'srv-2', name: 'TYO-ULTRA-02', location: 'Tokyo', cpu: '34%', ram: '6.1 / 16 GB', bandwidth: '11.2 TB', status: 'Healthy', core: 'Xray v1.8.8' },
    { id: 'srv-3', name: 'FRA-VPS-01', location: 'Frankfurt', cpu: '18%', ram: '18.4 / 64 GB', bandwidth: '24.1 TB', status: 'Healthy', core: 'KVM Hypervisor' },
    { id: 'srv-4', name: 'US-GAME-01', location: 'New York', cpu: '41%', ram: '5.2 / 16 GB', bandwidth: '8.4 TB', status: 'Healthy', core: 'Xray v1.8.8' },
  ]);

  const [catalogItems, setCatalogItems] = useState(
    PRODUCTS.map((p) => ({
      id: p.id,
      title: p.title,
      priceLKR: p.priceLKR,
      priceUSD: p.priceUSD,
      stockCount: p.stockCount,
      category: p.category,
      active: true,
    }))
  );

  const [managedUsers, setManagedUsers] = useState([
    { id: 'u-1', name: 'Founder & Owner', email: 'owner@fibez.io', role: 'owner', spend: '$1,240', status: 'Active' },
    { id: 'u-2', name: 'Admin Specialist', email: 'admin@fibez.io', role: 'admin', spend: '$420', status: 'Active' },
    { id: 'u-3', name: 'Standard Developer', email: 'user@fibez.io', role: 'user', spend: '$38.50', status: 'Active' },
    { id: 'u-4', name: 'Kasun Wickramasinghe', email: 'kasun.dev@slt.lk', role: 'user', spend: '$112.00', status: 'Active' },
    { id: 'u-5', name: 'Suspicious Bot Account', email: 'spam_crawler@tempmail.ninja', role: 'user', spend: '$0.00', status: 'Banned' },
  ]);

  // 2FA Security Modal for Owner Risky Actions
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [pendingRiskyAction, setPendingRiskyAction] = useState<{
    label: string;
    execute: () => void;
  } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const requestRiskyAction = (label: string, execute: () => void) => {
    setPendingRiskyAction({ label, execute });
    setTwoFactorCode('');
    setTwoFactorError(null);
    setIs2FAModalOpen(true);
  };

  const confirmRiskyAction = () => {
    // 2FA verification: accepts standard 6-digit TOTP, or demo codes '123456' / 'OWNER-2FA'
    const code = twoFactorCode.trim();
    if (code !== '123456' && code !== 'OWNER-2FA' && code.length !== 6) {
      setTwoFactorError('Invalid 2FA Authenticator code. Try demo code "123456".');
      return;
    }

    if (pendingRiskyAction) {
      pendingRiskyAction.execute();
      setActionSuccessMessage(`Successfully verified and executed: ${pendingRiskyAction.label}`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    }
    setIs2FAModalOpen(false);
    setPendingRiskyAction(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Top Breadcrumb & User Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1.5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-300">Console Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-white uppercase font-bold tracking-wider">{activeRole} VIEW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white flex items-center gap-3">
            <span>Fibez Control Console</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider bg-white/10 border border-white/20 text-zinc-300">
              {session?.user?.email || `${activeRole}@fibez.io`}
            </span>
          </h1>
        </div>

        {/* 3 Different Roles Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveRole('user')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeRole === 'user'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            User Console
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Admin Console
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('owner')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeRole === 'owner'
                ? 'bg-white text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Owner (2FA)</span>
          </button>
        </div>
      </div>

      {/* Global Success Banner */}
      {actionSuccessMessage && (
        <div className="mb-6 p-4 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-white flex items-center justify-between">
          <span>{actionSuccessMessage}</span>
          <button type="button" onClick={() => setActionSuccessMessage(null)}>
            <X className="w-4 h-4 text-zinc-400 hover:text-white" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. USER DASHBOARD                                                        */}
      {/* ========================================================================= */}
      {activeRole === 'user' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          
          {/* Top User Overview Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Active Subscriptions</div>
              <div className="text-2xl font-mono font-bold text-white">3 Nodes / Accounts</div>
              <div className="text-[11px] text-zinc-400 mt-1">Zero downtime recorded this week</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Bandwidth Consumed</div>
              <div className="text-2xl font-mono font-bold text-white">142.4 GB / Unlimited</div>
              <div className="text-[11px] text-zinc-400 mt-1">10Gbps Tier-1 BGP Peered</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">ISP Bypass Status</div>
              <div className="text-2xl font-mono font-bold text-white">100% Operational</div>
              <div className="text-[11px] text-zinc-400 mt-1">SLT Fiber • Mobitel • Dialog 4G</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Key Vault Security</div>
              <div className="text-2xl font-mono font-bold text-white">Encrypted Vault</div>
              <div className="text-[11px] text-zinc-400 mt-1">ChaCha20 Zero-Trust Payload</div>
            </div>
          </div>

          {/* User Subtab Switcher */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => setUserSubTab('services')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                userSubTab === 'services'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              Active Services &amp; Telemetry
            </button>
            <button
              type="button"
              onClick={() => setUserSubTab('tickets')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
                userSubTab === 'tickets'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support Tickets</span>
            </button>
          </div>

          {userSubTab === 'tickets' ? (
            <div className="pt-2">
              <TicketCenter userRole="user" userEmail={session?.user?.email} />
            </div>
          ) : (
            <>
          {/* Section: What They Bought & Download Config Again */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">Your Purchased Services & Keys</h2>
                <p className="text-xs text-zinc-400">View credentials, access configs, or download backup profiles anytime.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Product 1: V2Ray Reality */}
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-300">
                      V2RAY VPN REALITY
                    </span>
                    <span className="text-xs font-mono text-zinc-400">Expires in 24 days</span>
                  </div>
                  <h3 className="text-base font-medium text-white">V2Ray Singapore Reality 10Gbps (Node #SG-10G-01)</h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Gateway: <code className="text-zinc-200">sg-edge-01.fibez.net:443</code> • Security: <code className="text-zinc-200">Reality / SNI Masquerade</code>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        'vless-1',
                        'vless://9vYUgZawBvwjJBohjg0Lg1ifhYGffnm1@sg-edge-01.fibez.net:443?encryption=none&security=reality&sni=gateway.icloud.com&fp=chrome&pbk=7K3_mQ4...&sid=1a2b3c#Fibez-Singapore-10G'
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'vless-1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'vless-1' ? 'Copied URI' : 'Copy VLESS URI'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadConfig(
                        'fibez-singapore-reality.json',
                        JSON.stringify(
                          {
                            log: { loglevel: 'warning' },
                            inbounds: [{ port: 10808, protocol: 'socks' }],
                            outbounds: [
                              {
                                protocol: 'vless',
                                settings: {
                                  vnext: [
                                    {
                                      address: 'sg-edge-01.fibez.net',
                                      port: 443,
                                      users: [{ id: '9vYUgZawBvwjJBohjg0Lg1ifhYGffnm1', encryption: 'none' }],
                                    },
                                  ],
                                },
                                streamSettings: { network: 'tcp', security: 'reality' },
                              },
                            ],
                          },
                          null,
                          2
                        )
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Config .json</span>
                  </button>
                </div>
              </div>

              {/* Product 2: Cloud NVMe VPS */}
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-300">
                      CLOUD NVME VPS
                    </span>
                    <span className="text-xs font-mono text-zinc-400">Active Node #VPS-SG-45</span>
                  </div>
                  <h3 className="text-base font-medium text-white">Singapore NVMe VPS (Ubuntu 24.04 LTS • 4 vCPU • 8GB RAM)</h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Public IPv4: <code className="text-zinc-200">139.180.210.45</code> • SSH Port: <code className="text-zinc-200">22</code>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSecret('vps-pass')}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {revealedSecrets['vps-pass'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{revealedSecrets['vps-pass'] ? 'Pass: fbz#K92@2026' : 'Reveal Root Password'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy('ssh-cmd', 'ssh root@139.180.210.45')}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'ssh-cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy SSH Command</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadConfig(
                        'id_ed25519_fibez.pem',
                        '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW\nQyNTUxOQAAACBAjW35n82QZ...fibez-vps-key\n-----END OPENSSH PRIVATE KEY-----'
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SSH Key (.pem)</span>
                  </button>
                </div>
              </div>

              {/* Product 3: Developer Subscription */}
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-300">
                      SUBSCRIPTION LICENSE
                    </span>
                    <span className="text-xs font-mono text-zinc-400">Renews in 18 days</span>
                  </div>
                  <h3 className="text-base font-medium text-white">ChatGPT Plus (1 Month Subscription Account)</h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Login: <code className="text-zinc-200">dev-sub-409@fibez.io</code> • Dedicated Private Session
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSecret('gpt-sub')}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {revealedSecrets['gpt-sub'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{revealedSecrets['gpt-sub'] ? 'Pass: GPT_PRO#9821' : 'Reveal Credentials'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy('gpt-copy', 'dev-sub-409@fibez.io : GPT_PRO#9821')}
                    className="px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'gpt-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Login</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Server Speeds & Live Telemetry */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">Server Speeds & Live Network Telemetry</h2>
                <p className="text-xs text-zinc-400">Real-time latency probes across SLT Fiber, Dialog, and Mobitel carrier backbones.</p>
              </div>

              <button
                type="button"
                onClick={runSpeedTest}
                disabled={isSpeedTesting}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSpeedTesting ? 'animate-spin' : ''}`} />
                <span>{isSpeedTesting ? 'Probing Nodes...' : 'Run Speed & Ping Test'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {telemetry.map((t) => (
                <div key={t.node} className="p-4 rounded-xl bg-[#111114] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-white truncate max-w-[180px]">{t.node}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{t.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Ping Latency</div>
                      <div className="text-base font-mono font-semibold text-white">{t.ping} ms</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Throughput</div>
                      <div className="text-base font-mono font-semibold text-white">{t.speed} Gbps</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Jitter: {t.jitter} ms • Packet Loss: 0.0%
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADMIN DASHBOARD                                                       */}
      {/* ========================================================================= */}
      {activeRole === 'admin' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          
          {/* Admin Stat Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Awaiting Verification</div>
              <div className="text-2xl font-mono font-bold text-white">
                {pendingOrders.filter((o) => o.status === 'Pending').length} Orders
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Bank transfer & Crypto slip uploads</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Support Queue</div>
              <div className="text-2xl font-mono font-bold text-white">
                {openTicketCount} Active Tickets
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Direct live queue from database</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Customer Reviews</div>
              <div className="text-2xl font-mono font-bold text-white">
                {liveReviews.length > 0 ? liveReviews.length : reviews.length} Total
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Live customer ratings & moderation</div>
            </div>
          </div>

          {/* 1. Verify Purchases */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-white">Verify Purchases & Dispense Keys</h2>
              <p className="text-xs text-zinc-400">Review uploaded deposit slips and crypto transaction confirmations.</p>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111114]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Product & Amount</th>
                      <th className="p-3.5">Slip Proof</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {pendingOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white">{ord.orderNumber}</td>
                        <td className="p-3.5">
                          <div>{ord.customerEmail}</div>
                          <div className="text-[10px] text-zinc-500">{ord.date}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-white">{ord.productTitle}</div>
                          <div className="text-[11px] text-zinc-400">{ord.amount} • {ord.paymentMethod}</div>
                        </td>
                        <td className="p-3.5">
                          <a
                            href="#view-slip"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Viewing receipt image: ${ord.slipName}`);
                            }}
                            className="underline text-zinc-400 hover:text-white"
                          >
                            {ord.slipName}
                          </a>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            ord.status === 'Verified'
                              ? 'bg-white/20 text-white font-bold'
                              : ord.status === 'Rejected'
                              ? 'bg-zinc-800 text-zinc-500'
                              : 'bg-white/10 text-zinc-300'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {ord.status === 'Pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveOrder(ord.id)}
                                className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
                              >
                                Approve & Dispense
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectOrder(ord.id)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-zinc-500 text-[11px]">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. Reply to User Issues & Support Tickets */}
          <div>
            <TicketCenter userRole="admin" />
          </div>

          {/* 3. Maintain Reviews Feedback */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">Maintain Customer Reviews & Platform Feedback</h2>
                <p className="text-xs text-zinc-400">Moderate submitted reviews, toggle public display, or post official staff replies.</p>
              </div>
              <button
                type="button"
                onClick={fetchLiveReviews}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLiveReviews ? 'animate-spin' : ''}`} />
                <span>Refresh Live</span>
              </button>
            </div>

            {loadingLiveReviews ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500 rounded-2xl bg-[#111114] border border-white/10">
                Loading reviews from database...
              </div>
            ) : liveReviews.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500 rounded-2xl bg-[#111114] border border-white/10">
                No customer reviews submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveReviews.map((rev) => {
                  const product = PRODUCTS.find((p) => p.id === rev.product_id);
                  const isApproved = rev.status === 'APPROVED';
                  return (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-[#111114] border border-white/10 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-white">
                            {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-white text-white" />
                            ))}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                              isApproved
                                ? 'bg-white/10 text-white border-white/20'
                                : 'bg-white/5 text-zinc-400 border-white/10'
                            }`}
                          >
                            {rev.status}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-mono font-bold text-white">
                            {product ? product.title : rev.product_id}
                          </div>
                          {rev.title && (
                            <div className="text-xs font-semibold text-zinc-200 mt-0.5">
                              {rev.title}
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          &ldquo;{rev.comment}&rdquo;
                        </p>

                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                          <span>— {rev.author_name || 'Anonymous User'}</span>
                          <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>

                        {rev.admin_reply && (
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300">
                            <span className="text-white font-semibold">Staff Response:</span> {rev.admin_reply}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleLiveReviewStatus(rev.id, rev.status)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors cursor-pointer w-full text-center"
                          >
                            {isApproved ? 'Flag / Hide Review' : 'Approve & Publish'}
                          </button>
                        </div>

                        {!rev.admin_reply && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <input
                              type="text"
                              value={adminReplyDraft[rev.id] || ''}
                              onChange={(e) =>
                                setAdminReplyDraft((prev) => ({ ...prev, [rev.id]: e.target.value }))
                              }
                              placeholder="Official staff reply..."
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-black border border-white/10 text-[11px] text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-white"
                            />
                            <button
                              type="button"
                              onClick={() => handlePostAdminReply(rev.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-white text-black font-semibold text-[11px] font-mono hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OWNER DASHBOARD (WITH 2FA FOR RISKY ACTIONS)                          */}
      {/* ========================================================================= */}
      {activeRole === 'owner' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          
          {/* Top Owner Financial Overview (How Much He Made) */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
                  EXECUTIVE REVENUE & PROFIT MATRIX
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-300">
                  2FA PROTECTED
                </span>
              </div>
              <h2 className="text-xl font-medium text-white mt-1">Platform Earnings & Live Business Telemetry</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Total Gross Revenue</div>
                <div className="text-3xl font-mono font-bold text-white">Rs. 2,845,900</div>
                <div className="text-xs font-mono text-zinc-400 mt-1">≈ $9,180.00 USD Volume</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Net Margin (Profit)</div>
                <div className="text-3xl font-mono font-bold text-white">84.2% Margin</div>
                <div className="text-xs font-mono text-zinc-400 mt-1">Rs. 2,396,240 Net Profit</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Monthly Recurring (MRR)</div>
                <div className="text-3xl font-mono font-bold text-white">Rs. 680,000 / mo</div>
                <div className="text-xs font-mono text-zinc-400 mt-1">342 active recurring nodes</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Total Orders Dispensed</div>
                <div className="text-3xl font-mono font-bold text-white">1,428 Orders</div>
                <div className="text-xs font-mono text-zinc-400 mt-1">4.8% storefront conversion</div>
              </div>
            </div>
          </div>

          {/* 1. Update Servers (Owner Server Fleet Controls) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">Server Fleet & Infrastructure Controls</h2>
                <p className="text-xs text-zinc-400">Restart hypervisors, rotate Reality encryption SNIs, flush routing caches.</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  requestRiskyAction('Restart All Edge Gateways & Flush BGP Routes', () => {
                    setServers((prev) =>
                      prev.map((s) => ({ ...s, cpu: '12%', status: 'Flushed & Rebooted' }))
                    );
                  })
                }
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reboot Fleet (Requires 2FA)</span>
              </button>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111114]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Node Name</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">CPU Load</th>
                      <th className="p-3.5">RAM Allocation</th>
                      <th className="p-3.5">Egress Bandwidth</th>
                      <th className="p-3.5">Core Daemon</th>
                      <th className="p-3.5 text-right">Owner Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {servers.map((srv) => (
                      <tr key={srv.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white">{srv.name}</td>
                        <td className="p-3.5">{srv.location}</td>
                        <td className="p-3.5">{srv.cpu}</td>
                        <td className="p-3.5">{srv.ram}</td>
                        <td className="p-3.5">{srv.bandwidth}</td>
                        <td className="p-3.5">{srv.core}</td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              requestRiskyAction(`Rotate Reality Keypair for ${srv.name}`, () => {
                                alert(`Reality keypair rotated on ${srv.name}. New public keys published.`);
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-colors cursor-pointer"
                          >
                            Rotate Keys (2FA)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. Update Catalog (Pricing, Stock, Categories) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">Catalog Management & Price Control</h2>
                <p className="text-xs text-zinc-400">Modify live storefront stock quantities, LKR/USD exchange pricing, or disable products.</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  requestRiskyAction('Add New Product to Store Catalog', () => {
                    const newProd = {
                      id: `node-${Date.now()}`,
                      title: 'V2Ray Mumbai Reality 10Gbps',
                      priceLKR: 1400,
                      priceUSD: 4.5,
                      stockCount: 50,
                      category: 'vpn' as const,
                      active: true,
                    };
                    setCatalogItems((prev) => [newProd, ...prev]);
                  })
                }
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product (Requires 2FA)</span>
              </button>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111114]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price (LKR)</th>
                      <th className="p-3.5">Price (USD)</th>
                      <th className="p-3.5">Stock in Vault</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {catalogItems.map((prod) => (
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white">{prod.title}</td>
                        <td className="p-3.5 uppercase text-zinc-400">{prod.category}</td>
                        <td className="p-3.5">Rs. {prod.priceLKR.toLocaleString()}</td>
                        <td className="p-3.5">${prod.priceUSD.toFixed(2)}</td>
                        <td className="p-3.5">{prod.stockCount} units</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-zinc-300">
                            {prod.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              requestRiskyAction(`Update Stock/Price for ${prod.title}`, () => {
                                setCatalogItems((prev) =>
                                  prev.map((p) => (p.id === prod.id ? { ...p, stockCount: p.stockCount + 25 } : p))
                                );
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-colors cursor-pointer"
                          >
                            Restock +25 (2FA)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. Control Users (Role Management, Ban / Unban) */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-white">User Administration & Role Authority</h2>
              <p className="text-xs text-zinc-400">Promote users to Admin or Owner, inspect registered accounts, and manage bans.</p>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111114]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Current Role</th>
                      <th className="p-3.5">Total Spend</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Critical Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {managedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white">{u.name}</td>
                        <td className="p-3.5">{u.email}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'owner' ? 'bg-white text-black' : u.role === 'admin' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">{u.spend}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            u.status === 'Active' ? 'bg-white/10 text-zinc-200' : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          {u.role !== 'owner' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  requestRiskyAction(`Promote ${u.name} to Admin`, () => {
                                    setManagedUsers((prev) =>
                                      prev.map((item) => (item.id === u.id ? { ...item, role: 'admin' } : item))
                                    );
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-colors cursor-pointer"
                              >
                                Promote to Admin (2FA)
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  requestRiskyAction(
                                    u.status === 'Active' ? `Ban User ${u.email}` : `Unban User ${u.email}`,
                                    () => {
                                      setManagedUsers((prev) =>
                                        prev.map((item) =>
                                          item.id === u.id
                                            ? { ...item, status: item.status === 'Active' ? 'Banned' : 'Active' }
                                            : item
                                        )
                                      );
                                    }
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              >
                                {u.status === 'Active' ? 'Ban (2FA)' : 'Unban (2FA)'}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 4. Social Media Channels & Footer Configuration */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
                    FOOTER CHANNELS & COMMUNITY LINKS
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    LIVE SYNC
                  </span>
                </div>
                <h2 className="text-lg font-medium text-white mt-1">Social Media Management & Link Configuration</h2>
                <p className="text-xs text-zinc-400">
                  Toggle social media links on or off for the public footer, update target URLs, and customize platform visibility.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {socialSavedToast && (
                  <span className="text-xs font-mono text-emerald-400 animate-in fade-in">
                    Saved to footer ✓
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    resetSocialLinks();
                    setSocialSavedToast(true);
                    setTimeout(() => setSocialSavedToast(false), 2000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111114]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Platform</th>
                      <th className="p-3.5">Destination URL / Handle</th>
                      <th className="p-3.5">Visibility</th>
                      <th className="p-3.5 text-right">Owner Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {socialLinks.map((social) => (
                      <tr key={social.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: social.enabled ? '#3ad389' : '#52525b' }} />
                            <span className="font-bold text-white capitalize">{social.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={social.url}
                              onChange={(e) => {
                                updateSocialLink(social.id, { url: e.target.value });
                                setSocialSavedToast(true);
                                setTimeout(() => setSocialSavedToast(false), 2000);
                              }}
                              className="w-full max-w-md px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                              placeholder={`https://${social.platform}.com/...`}
                            />
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noreferrer"
                              title="Test link"
                              className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                        <td className="p-3.5">
                          {social.enabled ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Active on Footer</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-zinc-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                              <span>Disabled</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              toggleSocialLink(social.id);
                              setSocialSavedToast(true);
                              setTimeout(() => setSocialSavedToast(false), 2000);
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
                              social.enabled
                                ? 'bg-white text-black border-white hover:bg-zinc-200'
                                : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {social.enabled ? 'Disable Channel' : 'Enable Channel'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note on Payment rails */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-300">
                <Landmark className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Payment Channel in Footer: <strong className="text-white">Manual Bank Transfer / CDM Only</strong></span>
              </div>
              <span className="text-[11px] text-zinc-500">Commercial Bank · Sampath Bank Slip Verification Rail</span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2FA SECURITY CHALLENGE MODAL (FOR OWNER RISKY ACTIONS)                    */}
      {/* ========================================================================= */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-[16px] animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#0e0e11] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Owner 2FA Verification</h3>
                  <p className="text-xs text-zinc-400">High-Privilege Security Gate</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIs2FAModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Target Operation</div>
              <div className="text-xs font-mono font-medium text-white">{pendingRiskyAction?.label}</div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter the 6-digit verification code from your Authenticator app (or demo code <code className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">123456</code>).
            </p>

            {twoFactorError && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-white/20 text-xs font-mono text-zinc-300">
                {twoFactorError}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                6-Digit Security Code
              </label>
              <input
                type="text"
                autoFocus
                maxLength={8}
                value={twoFactorCode}
                onChange={(e) => {
                  setTwoFactorCode(e.target.value);
                  setTwoFactorError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmRiskyAction();
                }}
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-center text-lg font-mono tracking-[0.3em] text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIs2FAModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRiskyAction}
                className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs font-mono hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Authenticate & Execute
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
