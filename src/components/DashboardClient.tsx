'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ValidRole, VerifiedSessionUser } from '@/lib/dal';
import { PRODUCTS } from '@/lib/products';
import TicketCenter from '@/components/TicketCenter';
import { useStore } from '@/lib/store-context';
import { ShareSheet } from '@/components/ui/ShareSheet';
import TechText from '@/components/TechText';
import { Counter } from '@/components/ui/Counter';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import {
  KeyRound,
  Download,
  Copy,
  Check,
  Activity,
  Star,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ExternalLink,
  Plus,
  RefreshCw,
  X,
  LifeBuoy,
  Landmark,
  Trash2,
  Power,
  ShieldCheck,
  User,
  Settings,
  Mail,
  Phone,
  Shield,
  Gift,
  Share2,
  Sparkles,
} from 'lucide-react';

interface RawOrder {
  id: string;
  order_number: string;
  customer_email: string;
  total_amount_lkr: number;
  total_amount_usd: string | number;
  currency: string;
  payment_method: string;
  payment_status: string;
  fulfillment_status: string;
  receipt_image_url?: string;
  created_at: string;
  items?: { product_title?: string }[];
}

interface PendingOrder {
  id: string;
  orderNumber: string;
  customerEmail: string;
  productTitle: string;
  amount: string;
  slipName: string;
  receiptUrl?: string;
  paymentMethod: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  date: string;
}

interface CatalogRow {
  id: string;
  title: string;
  priceLKR: number;
  priceUSD: number;
  stockCount: number;
  category: string;
  active: boolean;
}

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: ValidRole;
  spendLKR: number;
  createdAt: string;
}

interface VaultAssetRow {
  id: string;
  orderNumber: string;
  productName: string;
  type: string;
  status: string;
  variant_title?: string;
  password?: string;
  payload: string;
}

interface ReviewRow {
  id: string;
  product_id: string;
  rating: number;
  status: string;
  comment: string;
  user_name?: string;
  created_at: string;
  admin_reply?: string | null;
}

export default function DashboardClient({
  currentUser,
}: {
  currentUser: VerifiedSessionUser;
}) {
  const canAccessAdmin = currentUser.role === 'admin' || currentUser.role === 'owner';
  const canAccessOwner = currentUser.role === 'owner';

  const [requestedRole, setRequestedRole] = useState<ValidRole>(currentUser.role);
  const activeRole: ValidRole =
    requestedRole === 'owner' && canAccessOwner
      ? 'owner'
      : requestedRole === 'admin' && canAccessAdmin
      ? 'admin'
      : 'user';

  const { socialLinks, updateSocialLink, toggleSocialLink, resetSocialLinks } = useStore();
  const [socialSavedToast, setSocialSavedToast] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleDownloadConfig = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
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
  // USER CONSOLE STATE (REAL DB DATA)
  // ==========================================
  const [userSubTab, setUserSubTab] = useState<'services' | 'tickets' | 'referrals' | 'profile'>('services');
  const [userAssets, setUserAssets] = useState<VaultAssetRow[]>([]);
  const [userOrdersCount, setUserOrdersCount] = useState(0);
  const [userTicketsCount, setUserTicketsCount] = useState(0);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Referral Rewards State
  const [referralProfile, setReferralProfile] = useState<any>(null);
  const [copiedReferralLink, setCopiedReferralLink] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profileUsername, setProfileUsername] = useState(currentUser.name || currentUser.email.split('@')[0]);
  const [profileEmail, setProfileEmail] = useState(currentUser.email || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'profile') {
        setUserSubTab('profile');
      } else if (params.get('tab') === 'tickets') {
        setUserSubTab('tickets');
      } else if (params.get('tab') === 'referrals') {
        setUserSubTab('referrals');
      }
    }

    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (data.user.name) setProfileName(data.user.name);
          if (data.user.username) setProfileUsername(data.user.username);
          if (data.user.email) setProfileEmail(data.user.email);
          if (data.user.phone) setProfilePhone(data.user.phone);
        }
      })
      .catch(() => {});

    fetch('/api/referrals')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.profile) {
          setReferralProfile(data.profile);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setProfileError('New passwords do not match');
      setProfileSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          username: profileUsername,
          email: profileEmail,
          phone: profilePhone,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProfileSuccess(data.message || 'Profile updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
      } else {
        setProfileError(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Network error updating profile');
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    fetch('/api/vault')
      .then((res) => (res.ok ? res.json() : { assets: [] }))
      .then((data) => {
        if (Array.isArray(data.assets)) setUserAssets(data.assets);
      })
      .catch(() => {});

    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((data) => {
        if (Array.isArray(data.orders)) setUserOrdersCount(data.orders.length);
      })
      .catch(() => {});

    fetch('/api/tickets')
      .then((res) => (res.ok ? res.json() : { tickets: [] }))
      .then((data) => {
        if (Array.isArray(data.tickets)) {
          setUserTicketsCount(
            data.tickets.filter(
              (t: { status: string }) =>
                t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_USER'
            ).length
          );
        }
      })
      .catch(() => {});
  }, [currentUser.id]);

  // ==========================================
  // ADMIN & OWNER STATE (REAL DB DATA)
  // ==========================================
  const [rawOrders, setRawOrders] = useState<RawOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [liveReviews, setLiveReviews] = useState<ReviewRow[]>([]);
  const [loadingLiveReviews, setLoadingLiveReviews] = useState(false);
  const [adminReplyDraft, setAdminReplyDraft] = useState<Record<string, string>>({});
  const [openTicketCount, setOpenTicketCount] = useState<number>(0);

  const [catalogItems, setCatalogItems] = useState<CatalogRow[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<
    'vpn' | 'giftcard' | 'subscription' | 'gaming' | 'software'
  >('vpn');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdPriceLKR, setNewProdPriceLKR] = useState('1150');
  const [newProdPriceUSD, setNewProdPriceUSD] = useState('3.50');
  const [newProdStock, setNewProdStock] = useState('50');
  const [newProdDescription, setNewProdDescription] = useState('');

  const fetchLiveReviews = async () => {
    if (!canAccessAdmin) return;
    try {
      setLoadingLiveReviews(true);
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      if (res.ok && Array.isArray(data.reviews)) {
        setLiveReviews(data.reviews);
      } else {
        setLiveReviews([]);
      }
    } catch (err) {
      console.error('Failed to load live reviews:', err);
    } finally {
      setLoadingLiveReviews(false);
    }
  };

  const fetchAllOrders = async () => {
    if (!canAccessAdmin) return;
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok && Array.isArray(data.orders)) {
        setRawOrders(data.orders);
        setPendingOrders(
          data.orders.map((o: RawOrder) => ({
            id: o.id,
            orderNumber: o.order_number,
            customerEmail: o.customer_email,
            productTitle: o.items?.[0]?.product_title || 'Digital Product',
            amount:
              o.currency === 'USD'
                ? `$${o.total_amount_usd} USD`
                : `Rs. ${Number(o.total_amount_lkr).toLocaleString()}`,
            slipName: o.receipt_image_url ? 'View Uploaded Slip' : 'No Slip',
            receiptUrl: o.receipt_image_url,
            paymentMethod: o.payment_method === 'crypto' ? 'Crypto' : 'Bank Transfer / CDM',
            status:
              o.payment_status === 'VERIFIED'
                ? 'Verified'
                : o.payment_status === 'FAILED'
                ? 'Rejected'
                : 'Pending',
            date: new Date(o.created_at).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }))
        );
      } else {
        setRawOrders([]);
        setPendingOrders([]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const fetchCatalog = async () => {
    if (!canAccessOwner) return;
    try {
      const res = await fetch('/api/products?all=true');
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setCatalogItems(
          data.products.map(
            (p: {
              id: string;
              title: string;
              price_lkr: number | string;
              price_usd: number | string;
              stock_count: number | string;
              category_id: string;
              is_active?: boolean;
            }) => ({
              id: p.id,
              title: p.title,
              priceLKR: Number(p.price_lkr),
              priceUSD: Number(p.price_usd),
              stockCount: Number(p.stock_count),
              category: p.category_id,
              active: p.is_active !== false,
            })
          )
        );
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const fetchUsers = async () => {
    if (!canAccessOwner) return;
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        setManagedUsers(
          data.users.map(
            (u: {
              id: string;
              name: string;
              email: string;
              role?: ValidRole;
              total_spend_lkr?: number | string;
              created_at: string;
            }) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role || 'user',
              spendLKR: Number(u.total_spend_lkr || 0),
              createdAt: new Date(u.created_at).toLocaleDateString(),
            })
          )
        );
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    if (canAccessAdmin && (activeRole === 'admin' || activeRole === 'owner')) {
      fetchLiveReviews();
      fetchAllOrders();
      fetch('/api/tickets')
        .then((res) => (res.ok ? res.json() : { tickets: [] }))
        .then((data) => {
          if (Array.isArray(data.tickets)) {
            setOpenTicketCount(
              data.tickets.filter(
                (t: { status: string }) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'
              ).length
            );
          }
        })
        .catch(() => {});
    }

    if (canAccessOwner && activeRole === 'owner') {
      fetchCatalog();
      fetchUsers();
    }
  }, [activeRole, canAccessAdmin, canAccessOwner]);

  const handleToggleLiveReviewStatus = async (reviewId: string, currentStatus: string) => {
    if (!canAccessAdmin) return;
    const newStatus = currentStatus === 'APPROVED' ? 'FLAGGED' : 'APPROVED';
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status: newStatus }),
      });
      if (res.ok) {
        setLiveReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error('Failed to toggle review status:', err);
    }
  };

  const handlePostAdminReply = async (reviewId: string) => {
    if (!canAccessAdmin) return;
    const reply = adminReplyDraft[reviewId]?.trim();
    if (!reply) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action: 'reply', adminReply: reply }),
      });
      if (res.ok) {
        setLiveReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, admin_reply: reply } : r))
        );
        setAdminReplyDraft((prev) => ({ ...prev, [reviewId]: '' }));
      }
    } catch (err) {
      console.error('Failed to post admin reply:', err);
    }
  };

  const handleApproveOrder = async (id: string) => {
    if (!canAccessAdmin) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, paymentStatus: 'VERIFIED', fulfillmentStatus: 'DELIVERED' }),
      });
      if (res.ok) {
        setPendingOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'Verified' } : o)));
        fetchAllOrders();
      }
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  const handleRejectOrder = async (id: string) => {
    if (!canAccessAdmin) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, paymentStatus: 'FAILED', fulfillmentStatus: 'REVOKED' }),
      });
      if (res.ok) {
        setPendingOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'Rejected' } : o)));
        fetchAllOrders();
      }
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  // Real Owner Revenue Computation
  const verifiedOrders = rawOrders.filter((o) => o.payment_status === 'VERIFIED');
  const verifiedRevenueLKR = verifiedOrders.reduce(
    (acc, o) => acc + Number(o.total_amount_lkr || 0),
    0
  );
  const verifiedRevenueUSD = verifiedOrders.reduce(
    (acc, o) => acc + Number(o.total_amount_usd || 0),
    0
  );
  const pendingReviewCount = rawOrders.filter((o) => o.payment_status === 'PENDING_REVIEW').length;
  const activeProductsCount = catalogItems.filter((p) => p.active).length;
  const inStockCount = catalogItems.filter((p) => p.active && p.stockCount > 0).length;

  // Owner Confirmation Modal for Privileged Operations
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingRiskyAction, setPendingRiskyAction] = useState<{
    label: string;
    execute: () => void | Promise<void>;
  } | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const requestRiskyAction = (label: string, execute: () => void | Promise<void>) => {
    if (!canAccessOwner) return;
    setPendingRiskyAction({ label, execute });
    setConfirmError(null);
    setIsConfirmModalOpen(true);
  };

  const confirmRiskyAction = async () => {
    if (!canAccessOwner || !pendingRiskyAction) return;
    try {
      await pendingRiskyAction.execute();
      setActionSuccessMessage(`Executed: ${pendingRiskyAction.label}`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      setIsConfirmModalOpen(false);
      setPendingRiskyAction(null);
    } catch {
      setConfirmError('Failed to execute privileged action. Verify permissions and retry.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1.5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-300">Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-white uppercase font-bold tracking-wider">{activeRole} VIEW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white flex items-center gap-3 flex-wrap">
            <div className="h-[38px] sm:h-[44px] w-[260px] sm:w-[320px] relative -ml-1">
              <span className="sr-only">Fibez Control Console</span>
              <TechText
                text="Fibez Control Console"
                align="left"
                fontWeight={700}
                fontSize={34}
                color="#ffffff"
                accentColor="#3ad389"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={10}
                intro="none"
                clickKick
                guides={false}
              />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 border border-white/20 text-zinc-300">
              {currentUser.email}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/5 border border-white/15 text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Role: {currentUser.role}</span>
            </span>
          </h1>
        </div>

        {/* Role Switcher (only shown to verified admin/owner accounts) */}
        {canAccessAdmin && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setRequestedRole('user')}
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
              onClick={() => setRequestedRole('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Admin Console
            </button>
            {canAccessOwner && (
              <button
                type="button"
                onClick={() => setRequestedRole('owner')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeRole === 'owner'
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Owner Console</span>
              </button>
            )}
          </div>
        )}
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
      {/* 1. USER DASHBOARD (100% REAL USER DATA)                                  */}
      {/* ========================================================================= */}
      {activeRole === 'user' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Delivered Items</div>
              <div className="text-2xl font-mono font-bold text-white">{userAssets.length}</div>
              <div className="text-[11px] text-zinc-400 mt-1">Keys &amp; VLESS configs in vault</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Total Orders</div>
              <div className="text-2xl font-mono font-bold text-white">{userOrdersCount}</div>
              <div className="text-[11px] text-zinc-400 mt-1">Orders linked to your account</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Open Support Tickets</div>
              <div className="text-2xl font-mono font-bold text-white">{userTicketsCount}</div>
              <div className="text-[11px] text-zinc-400 mt-1">Active support conversations</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">VLESS Diagnostic</div>
              <Link href="/v2ray#line-check" className="text-base font-mono font-semibold text-[#3ad389] hover:underline inline-flex items-center gap-1.5 mt-1">
                <Activity className="w-4 h-4" />
                <span>Run Line Check →</span>
              </Link>
              <div className="text-[11px] text-zinc-400 mt-1">Test your Sri Lankan ISP route</div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setUserSubTab('services')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                userSubTab === 'services' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              My Purchased Keys &amp; Configs
            </button>
            <button
              type="button"
              onClick={() => setUserSubTab('tickets')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                userSubTab === 'tickets' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support Tickets</span>
            </button>
            <button
              type="button"
              onClick={() => setUserSubTab('referrals')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                userSubTab === 'referrals' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Referrals &amp; Rewards</span>
              {referralProfile?.balanceLkr > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#3ad389] text-black font-bold">
                  Rs. {referralProfile.balanceLkr}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setUserSubTab('profile')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                userSubTab === 'profile' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account Profile &amp; Settings</span>
            </button>
          </div>

          {userSubTab === 'profile' ? (
            <div className="space-y-6 pt-2 animate-in fade-in duration-200">
              {/* Profile Alerts */}
              {profileSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs font-mono flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-mono flex items-center gap-2.5">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* User Identity Overview Banner */}
              <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3ad389] to-emerald-400 flex items-center justify-center text-black font-mono font-bold text-xl shadow-lg shadow-[#3ad389]/15">
                    {profileName ? profileName.slice(0, 2).toUpperCase() : currentUser.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        {profileName || 'Valued Client'}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3ad389]/10 text-[#3ad389] border border-[#3ad389]/20 uppercase">
                        {currentUser.role === 'owner' ? 'Store Owner' : currentUser.role === 'admin' ? 'Admin' : 'Verified Client'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">
                      @{profileUsername || currentUser.email.split('@')[0]} • {currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-zinc-400 bg-[#121215] px-4 py-2.5 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Client Account ID</span>
                    <span className="text-zinc-200">{currentUser.id}</span>
                  </div>
                </div>
              </div>

              {/* Two-Column Edit Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 7 Columns: Personal Identity Details */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-5">
                  <div className="border-b border-[#1f1f23] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-[#3ad389]" />
                      <span>Personal Information &amp; Contact</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Update how your name and identity appear on receipts, invoices, and support conversations.
                    </p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                        Full Display Name
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="e.g. Akain Kariwesi"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                          Client Username / Handle
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono">@</span>
                          <input
                            type="text"
                            value={profileUsername}
                            onChange={(e) => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            placeholder="username"
                            className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                          WhatsApp / Mobile (Sri Lanka)
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="+94 7X XXX XXXX"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none transition-all font-mono"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                          Used for bank slip verification &amp; order notifications.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                        Email Address (Digital Key Delivery)
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          required
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none transition-all font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        All purchased keys, VLESS configs, and receipts will be dispatched here.
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="px-5 py-2.5 rounded-xl bg-[#3ad389] hover:bg-[#32be7a] text-black font-semibold text-xs font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#3ad389]/15 disabled:opacity-50"
                      >
                        {profileSaving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right 5 Columns: Security & Password */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-5">
                  <div className="border-b border-[#1f1f23] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Security &amp; Password</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Ensure your account remains safe and protected with strong credentials.
                    </p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-amber-400 focus:outline-none transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-amber-400 focus:outline-none transition-all font-mono"
                      />
                    </div>

                    {newPassword && (
                      <div className="p-3 rounded-xl bg-[#141417] border border-white/5 space-y-1 text-[11px] font-mono text-zinc-400">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Check className={`w-3 h-3 ${newPassword.length >= 8 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <span>At least 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Check className={`w-3 h-3 ${newPassword === confirmPassword && confirmPassword ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <span>Passwords match</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={profileSaving || !newPassword}
                        className="w-full py-2.5 rounded-xl bg-[#1a1a1f] hover:bg-[#22222a] border border-[#2e2e38] text-white font-semibold text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>

                  {/* Trust & Guarantee Indicators */}
                  <div className="pt-4 border-t border-[#1f1f23] space-y-2 text-[11px] font-mono text-zinc-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3ad389]" />
                      <span>TLS 1.3 Encrypted Session Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                      <span>PostgreSQL RLS Protected Data</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : userSubTab === 'tickets' ? (
            <div className="pt-2">
              <TicketCenter userRole="user" userEmail={currentUser.email} />
            </div>
          ) : userSubTab === 'referrals' ? (
            <div className="space-y-6 pt-2 animate-in fade-in duration-200">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0c1f15] border border-[#3ad389]/30 shadow-lg shadow-[#3ad389]/5">
                  <div className="text-xs font-mono text-[#3ad389] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Wallet Balance</span>
                  </div>
                  <div className="text-3xl font-mono font-bold text-white">
                    Rs. {(referralProfile?.balanceLkr || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-300 mt-1 font-mono">
                    Spend it at checkout with &quot;Pay with wallet&quot;
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Bonus Per Friend
                  </div>
                  <div className="text-3xl font-mono font-bold text-white">
                    Rs. {referralProfile?.rewardPerFriendLkr || 100}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Paid to your wallet per verified first order
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Completed Purchases
                  </div>
                  <div className="text-3xl font-mono font-bold text-[#3ad389]">
                    {referralProfile?.purchasedCount || 0}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Friends whose orders verified
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Total Lifetime Earned
                  </div>
                  <div className="text-3xl font-mono font-bold text-amber-400">
                    Rs. {(referralProfile?.totalEarnedLkr || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Referral bonuses earned
                  </div>
                </div>
              </div>

              {/* Unique Referral Link & 1-Click WhatsApp Share */}
              <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>Your Unique Referral Link</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Friends get <strong className="text-white">Rs. 50 OFF</strong> their purchase, and you earn <strong className="text-[#3ad389]">Rs. 100 in your wallet</strong> for every friend&apos;s verified first order!
                    </p>
                  </div>
                  <div className="font-mono text-xs px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold self-start sm:self-auto">
                    Code: {referralProfile?.referralCode || 'GENERATING'}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#141417] border border-white/10 text-xs font-mono text-zinc-200">
                    <span className="truncate">
                      {referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const link = referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`);
                        navigator.clipboard.writeText(link);
                        setCopiedReferralLink(true);
                        setTimeout(() => setCopiedReferralLink(false), 2000);
                      }}
                      className="ml-3 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      {copiedReferralLink ? <Check className="w-4 h-4 text-[#3ad389]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const link = referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`);
                        navigator.clipboard.writeText(link);
                        setCopiedReferralLink(true);
                        setTimeout(() => setCopiedReferralLink(false), 2000);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copiedReferralLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedReferralLink ? 'Copied Link!' : 'Copy Link'}</span>
                    </button>

                    <ShareSheet
                      url={referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`)}
                      title="🚀 Get Rs. 50 OFF your high-speed Sri Lankan V2Ray node or digital subscription on Fibez!"
                      trigger={
                        <button
                          type="button"
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#3ad389] hover:bg-[#32be7a] text-black text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3ad389]/20 transition-all cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share Invite Sheet</span>
                        </button>
                      }
                    />

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `🚀 Get Rs. 50 OFF your high-speed Sri Lankan V2Ray node or digital subscription on Fibez!\n\nUse my invite link:\n${referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl bg-[#1c2028] hover:bg-[#252a35] text-zinc-300 hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all"
                      title="Direct WhatsApp link"
                    >
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* 3 Step Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#1f1f23] text-xs">
                  <div className="p-3 rounded-xl bg-[#141417] border border-white/5 space-y-1">
                    <div className="font-mono text-[10px] text-[#3ad389] uppercase font-bold">Step 1</div>
                    <div className="font-semibold text-white">Share Your Link</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Send your link to friends looking for Dialog Zoom, SLT Netflix, or gaming configs.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141417] border border-white/5 space-y-1">
                    <div className="font-mono text-[10px] text-amber-400 uppercase font-bold">Step 2</div>
                    <div className="font-semibold text-white">Friend Gets Rs. 50 OFF</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Your friend receives an automatic Rs. 50 discount deducted at checkout on their first order.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141417] border border-white/5 space-y-1">
                    <div className="font-mono text-[10px] text-sky-400 uppercase font-bold">Step 3</div>
                    <div className="font-semibold text-white">Earn Rs. 100</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      As soon as their order is verified, Rs. 100 is credited to your wallet. Wallet money can be spent in the store but not withdrawn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Credits Redemption & Usage Tip */}
              <div className="p-4 rounded-xl bg-[#141417] border border-[#222228] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3ad389]" />
                  <span className="text-zinc-300">
                    Your wallet is at <Link href="/billing" className="text-white underline font-semibold">Billing</Link>. Pay with it in the <Link href="/cart" className="text-white underline font-semibold">Shopping Cart</Link> or renew a line in one click.
                  </span>
                </div>
                <Link
                  href="/catalog"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  Shop Now →
                </Link>
              </div>

              {/* History Table */}
              <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-4">
                <h4 className="text-sm font-semibold text-white">
                  Referral Earnings
                </h4>
                {(!referralProfile?.history || referralProfile.history.length === 0) ? (
                  <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                    No referral activity yet. Share your invite link to start earning wallet money!
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 font-mono text-xs">
                    {referralProfile.history.map((h: any) => (
                      <div key={h.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-white font-medium">{h.description}</div>
                          <div className="text-[10px] text-zinc-500">
                            {new Date(h.timestamp).toLocaleDateString()} at {new Date(h.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="font-bold text-sm text-[#3ad389]">
                          +Rs. {(h.creditsDelta * 10).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-white">Your Purchased Products &amp; Configs</h2>
                  <p className="text-xs text-zinc-400">Copy keys, VLESS URIs, or credentials delivered to your account.</p>
                </div>
                <Link href="/v2ray/guide" className="text-xs font-mono text-zinc-300 hover:text-white underline">
                  NetMod &amp; v2rayNG Guide
                </Link>
              </div>

              {userAssets.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#111114] border border-white/10 text-center space-y-3">
                  <KeyRound className="w-6 h-6 text-zinc-400 mx-auto" />
                  <p className="text-sm text-zinc-300">No purchased products or configs found for {currentUser.email}.</p>
                  <div className="flex justify-center gap-3 pt-1">
                    <Link href="/catalog" className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-semibold">
                      Browse Catalog
                    </Link>
                    <Link href="/v2ray" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs">
                      Free VLESS Trial
                    </Link>
                  </div>
                </div>
              ) : (
                userAssets.map((asset) => (
                  <div key={asset.id} className="p-5 rounded-2xl bg-[#111114] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-300">
                          {asset.type}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">{asset.orderNumber}</span>
                        <span className="text-xs font-mono text-emerald-400">{asset.status}</span>
                      </div>
                      <h3 className="text-base font-medium text-white">{asset.productName}</h3>
                      {asset.variant_title && (
                        <p className="text-xs font-mono text-zinc-400">{asset.variant_title}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* 1-Click Renewal Button */}
                      <Link
                        href={`/cart?renew=${asset.orderNumber}`}
                        onClick={() => {
                          const match = asset.payload?.match(/vless:\/\/([a-f0-9-]+)@/i);
                          if (match?.[1]) {
                            localStorage.setItem(`fibez_uuid_${asset.orderNumber}`, match[1]);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#3ad389]/10 hover:bg-[#3ad389]/20 border border-[#3ad389]/30 text-xs font-mono text-[#3ad389] flex items-center gap-1.5 transition-colors font-semibold"
                        title="Renew 30 days keeping existing VLESS UUID"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>1-Click Renew</span>
                      </Link>

                      {asset.password && (
                        <button
                          type="button"
                          onClick={() => toggleSecret(asset.id)}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          {revealedSecrets[asset.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{revealedSecrets[asset.id] ? `Pass: ${asset.password}` : 'Reveal Password'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopy(asset.id, asset.payload || '')}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey === asset.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === asset.id ? 'Copied' : 'Copy Key / Config'}</span>
                      </button>

                      {asset.payload?.startsWith('vless://') && (
                        <button
                          type="button"
                          onClick={() => handleDownloadConfig(`${asset.orderNumber}-vless.txt`, asset.payload)}
                          className="px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download .txt</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADMIN DASHBOARD (ROLE VERIFIED ON SERVER)                              */}
      {/* ========================================================================= */}
      {canAccessAdmin && activeRole === 'admin' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Awaiting Verification</div>
              <div className="text-2xl font-mono font-bold text-white">
                {pendingOrders.filter((o) => o.status === 'Pending').length} Orders
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Bank transfer &amp; Crypto slip uploads</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Support Queue</div>
              <div className="text-2xl font-mono font-bold text-white">{openTicketCount} Active Tickets</div>
              <div className="text-[11px] text-zinc-400 mt-1">Direct live queue from database</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Customer Reviews</div>
              <div className="text-2xl font-mono font-bold text-white">{liveReviews.length} Total</div>
              <div className="text-[11px] text-zinc-400 mt-1">Live customer ratings &amp; moderation</div>
            </div>
          </div>

          {/* 1. Verify Purchases */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-white">Orders &amp; Payment Verification</h2>
              <p className="text-xs text-zinc-400">Review uploaded bank slips and verify orders stored in PostgreSQL.</p>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111114]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Product &amp; Amount</th>
                      <th className="p-3.5">Slip Proof</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {pendingOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500">
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      pendingOrders.map((ord) => (
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
                            {ord.receiptUrl ? (
                              <a
                                href={ord.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 underline text-zinc-300 hover:text-white font-mono text-xs"
                              >
                                <span>{ord.slipName}</span>
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </a>
                            ) : (
                              <span className="text-zinc-600 font-mono text-xs">No Slip</span>
                            )}
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
                                  Approve
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. Support Tickets */}
          <div>
            <TicketCenter userRole={currentUser.role} userEmail={currentUser.email} />
          </div>

          {/* 3. Maintain Reviews Feedback */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">Customer Reviews Moderation</h2>
                <p className="text-xs text-zinc-400">Moderate submitted reviews or post staff replies.</p>
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
                    <div key={rev.id} className="p-5 rounded-2xl bg-[#111114] border border-white/10 flex flex-col justify-between gap-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-white">
                            {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-white text-white" />
                            ))}
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border bg-white/10 text-white border-white/20">
                            {rev.status}
                          </span>
                        </div>

                        <div className="text-xs font-mono font-bold text-white">
                          {product ? product.title : rev.product_id}
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          &ldquo;{rev.comment}&rdquo;
                        </p>

                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                          <span>— {rev.user_name || 'Customer'}</span>
                          <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>

                        {rev.admin_reply && (
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300">
                            <span className="text-white font-semibold">Staff Reply:</span> {rev.admin_reply}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/5 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleToggleLiveReviewStatus(rev.id, rev.status)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors cursor-pointer w-full text-center"
                        >
                          {isApproved ? 'Flag / Hide Review' : 'Approve & Publish'}
                        </button>

                        {!rev.admin_reply && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <input
                              type="text"
                              value={adminReplyDraft[rev.id] || ''}
                              onChange={(e) => setAdminReplyDraft((prev) => ({ ...prev, [rev.id]: e.target.value }))}
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
      {/* 3. OWNER DASHBOARD (STRICTLY OWNER ROLE VERIFIED ON SERVER)               */}
      {/* ========================================================================= */}
      {canAccessOwner && activeRole === 'owner' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* Real Revenue & Store Overview */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
                  LIVE STORE ANALYTICS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-300">
                  OWNER RBAC + POSTGRES RLS
                </span>
              </div>
              <h2 className="text-xl font-medium text-white mt-1">Store Revenue &amp; Inventory Summary</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative overflow-hidden p-5 rounded-2xl bg-[#111114] border border-white/10 group">
                <GlowingEffect color="emerald" proximity={60} />
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Verified Revenue (LKR)</div>
                <div className="text-3xl font-mono font-bold text-white flex items-baseline">
                  <span className="text-lg text-zinc-400 font-normal mr-1.5">Rs.</span>
                  <Counter
                    value={verifiedRevenueLKR}
                    fontSize={28}
                    fontWeight={700}
                    direction="auto"
                    duration={0.7}
                    bounce={0.2}
                    tabular
                  />
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1">{verifiedOrders.length} verified order(s)</div>
              </div>

              <div className="relative overflow-hidden p-5 rounded-2xl bg-[#111114] border border-white/10 group">
                <GlowingEffect color="emerald" proximity={60} />
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Verified Volume (USD)</div>
                <div className="text-3xl font-mono font-bold text-white flex items-baseline">
                  <span className="text-lg text-zinc-400 font-normal mr-1">$</span>
                  <Counter
                    value={Math.round(verifiedRevenueUSD * 100) / 100}
                    fontSize={28}
                    fontWeight={700}
                    decimals={2}
                    direction="auto"
                    duration={0.7}
                    bounce={0.2}
                    tabular
                  />
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1">Real USD order sum</div>
              </div>

              <div className="relative overflow-hidden p-5 rounded-2xl bg-[#111114] border border-white/10 group">
                <GlowingEffect color="emerald" proximity={60} />
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Total Orders</div>
                <div className="text-3xl font-mono font-bold text-white flex items-baseline">
                  <Counter
                    value={rawOrders.length}
                    fontSize={28}
                    fontWeight={700}
                    direction="auto"
                    duration={0.7}
                    bounce={0.2}
                    tabular
                  />
                  <span className="text-lg text-zinc-400 font-normal ml-1.5">Orders</span>
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1">{pendingReviewCount} pending slip review</div>
              </div>

              <div className="relative overflow-hidden p-5 rounded-2xl bg-[#111114] border border-white/10 group">
                <GlowingEffect color="emerald" proximity={60} />
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Catalog Stock</div>
                <div className="text-3xl font-mono font-bold text-white flex items-baseline">
                  <Counter
                    value={activeProductsCount}
                    fontSize={28}
                    fontWeight={700}
                    direction="auto"
                    duration={0.7}
                    bounce={0.2}
                    tabular
                  />
                  <span className="text-lg text-zinc-400 font-normal ml-1.5">Products</span>
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1">{inStockCount} currently in stock</div>
              </div>
            </div>
          </div>

          {/* 1. Real Catalog Management */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">Catalog &amp; Stock Control (PostgreSQL)</h2>
                <p className="text-xs text-zinc-400">Add new products, toggle In Stock / Out of Stock, adjust quantities, or remove items.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Product</span>
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
                      <th className="p-3.5">Stock</th>
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
                        <td className="p-3.5">
                          <span className={prod.stockCount > 0 ? 'text-emerald-400' : 'text-zinc-500'}>
                            {prod.stockCount > 0 ? `${prod.stockCount} (In Stock)` : '0 (Out of Stock)'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-zinc-300">
                            {prod.active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              requestRiskyAction(`Restock +25 units for ${prod.title}`, async () => {
                                const newStock = prod.stockCount + 25;
                                const res = await fetch('/api/products', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: prod.id, stockCount: newStock }),
                                });
                                if (!res.ok) throw new Error('Update failed');
                                fetchCatalog();
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white cursor-pointer"
                          >
                            +25 Stock
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              requestRiskyAction(
                                prod.stockCount > 0 ? `Mark Out of Stock: ${prod.title}` : `Mark In Stock (10): ${prod.title}`,
                                async () => {
                                  const nextStock = prod.stockCount > 0 ? 0 : 10;
                                  const res = await fetch('/api/products', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: prod.id, stockCount: nextStock }),
                                  });
                                  if (!res.ok) throw new Error('Update failed');
                                  fetchCatalog();
                                }
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 cursor-pointer"
                          >
                            {prod.stockCount > 0 ? 'Set 0' : 'Set In Stock'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              requestRiskyAction(`Toggle visibility for ${prod.title}`, async () => {
                                const res = await fetch('/api/products', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: prod.id, isActive: !prod.active }),
                                });
                                if (!res.ok) throw new Error('Update failed');
                                fetchCatalog();
                              })
                            }
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 cursor-pointer inline-flex items-center"
                            title={prod.active ? 'Hide product' : 'Show product'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              requestRiskyAction(`Delete product ${prod.title}`, async () => {
                                const res = await fetch(`/api/products?id=${encodeURIComponent(prod.id)}`, {
                                  method: 'DELETE',
                                });
                                if (!res.ok) throw new Error('Delete failed');
                                fetchCatalog();
                              })
                            }
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 text-zinc-400 hover:text-red-300 cursor-pointer inline-flex items-center"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. Real User Administration */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-white">Registered Users (Neon PostgreSQL)</h2>
              <p className="text-xs text-zinc-400">Real accounts registered via Better Auth with real verified order spend.</p>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111114]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Verified Spend</th>
                      <th className="p-3.5">Joined</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {managedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500">
                          No registered users found.
                        </td>
                      </tr>
                    ) : (
                      managedUsers.map((u) => (
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
                          <td className="p-3.5">Rs. {u.spendLKR.toLocaleString()}</td>
                          <td className="p-3.5 text-zinc-500">{u.createdAt}</td>
                          <td className="p-3.5 text-right">
                            {u.role !== 'owner' && (
                              <button
                                type="button"
                                onClick={() =>
                                  requestRiskyAction(
                                    u.role === 'admin' ? `Demote ${u.email} to user` : `Promote ${u.email} to admin`,
                                    async () => {
                                      const nextRole = u.role === 'admin' ? 'user' : 'admin';
                                      const res = await fetch('/api/users', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: u.id, role: nextRole }),
                                      });
                                      if (!res.ok) throw new Error('Role change failed');
                                      fetchUsers();
                                    }
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white cursor-pointer"
                              >
                                {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. Social Media Channels & Footer Configuration */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-white">Footer Social Links</h2>
                <p className="text-xs text-zinc-400">Toggle social links on/off in the public footer or update URLs.</p>
              </div>
              <div className="flex items-center gap-2">
                {socialSavedToast && (
                  <span className="text-xs font-mono text-emerald-400">Saved ✓</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    resetSocialLinks();
                    setSocialSavedToast(true);
                    setTimeout(() => setSocialSavedToast(false), 2000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 cursor-pointer"
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
                      <th className="p-3.5">URL</th>
                      <th className="p-3.5">Visibility</th>
                      <th className="p-3.5 text-right">Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {socialLinks.map((social) => (
                      <tr key={social.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white capitalize">{social.name}</td>
                        <td className="p-3.5">
                          <input
                            type="text"
                            value={social.url}
                            onChange={(e) => {
                              updateSocialLink(social.id, { url: e.target.value });
                              setSocialSavedToast(true);
                              setTimeout(() => setSocialSavedToast(false), 2000);
                            }}
                            className="w-full max-w-md px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs font-mono text-white"
                          />
                        </td>
                        <td className="p-3.5">{social.enabled ? 'Active' : 'Disabled'}</td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              toggleSocialLink(social.id);
                              setSocialSavedToast(true);
                              setTimeout(() => setSocialSavedToast(false), 2000);
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer ${
                              social.enabled
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 text-zinc-400 border-white/10'
                            }`}
                          >
                            {social.enabled ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-300">
                <Landmark className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Payment Channel: <strong className="text-white">Manual Bank Transfer / CDM</strong></span>
              </div>
              <span className="text-[11px] text-zinc-500">Receipts stored persistently in Neon Object Storage</span>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL (Owner Only) */}
      {canAccessOwner && isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-[16px]">
          <div className="relative w-full max-w-md bg-[#0e0e11] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Add Product to Store</h3>
              <button type="button" onClick={() => setIsAddProductOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Product Title *</label>
                <input
                  type="text"
                  value={newProdTitle}
                  onChange={(e) => setNewProdTitle(e.target.value)}
                  placeholder="e.g. Dialog Zoom VLESS 1 Month"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as typeof newProdCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  >
                    <option value="vpn">VLESS VPN</option>
                    <option value="giftcard">Gift Cards</option>
                    <option value="subscription">Subscriptions</option>
                    <option value="gaming">Game Top-ups</option>
                    <option value="software">Software</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Brand</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    placeholder="e.g. Fibez Net"
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    value={newProdPriceLKR}
                    onChange={(e) => setNewProdPriceLKR(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProdPriceUSD}
                    onChange={(e) => setNewProdPriceUSD(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Instant delivery. Config sent to your email in seconds."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newProdTitle.trim()) return;
                  setIsAddProductOpen(false);
                  requestRiskyAction(`Create product "${newProdTitle.trim()}"`, async () => {
                    const res = await fetch('/api/products', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: newProdTitle.trim(),
                        category: newProdCategory,
                        brand: newProdBrand.trim() || 'Fibez',
                        description: newProdDescription.trim(),
                        priceLKR: Number(newProdPriceLKR) || 0,
                        priceUSD: Number(newProdPriceUSD) || 0,
                        stockCount: Number(newProdStock) || 0,
                      }),
                    });
                    if (!res.ok) throw new Error('Create failed');
                    setNewProdTitle('');
                    setNewProdDescription('');
                    fetchCatalog();
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs font-mono cursor-pointer"
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OWNER CONFIRMATION MODAL */}
      {canAccessOwner && isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-[16px]">
          <div className="relative w-full max-w-md bg-[#0e0e11] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Confirm Privileged Operation</h3>
                  <p className="text-xs text-zinc-400">Verified Owner Action ({currentUser.email})</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="text-zinc-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Target Operation</div>
              <div className="text-xs font-mono font-medium text-white">{pendingRiskyAction?.label}</div>
            </div>

            {confirmError && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-white/20 text-xs font-mono text-zinc-300">
                {confirmError}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRiskyAction}
                className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs font-mono hover:bg-zinc-200 cursor-pointer"
              >
                Confirm &amp; Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
