'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ValidRole, VerifiedSessionUser } from '@/lib/dal';
import { PRODUCTS } from '@/lib/products';
import TicketCenter from '@/components/TicketCenter';
import { useStore } from '@/lib/store-context';
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
  const [userSubTab, setUserSubTab] = useState<'services' | 'tickets'>('services');
  const [userAssets, setUserAssets] = useState<VaultAssetRow[]>([]);
  const [userOrdersCount, setUserOrdersCount] = useState(0);
  const [userTicketsCount, setUserTicketsCount] = useState(0);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
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
            <span>Fibez Control Console</span>
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

          <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => setUserSubTab('services')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                userSubTab === 'services' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              My Purchased Keys &amp; Configs
            </button>
            <button
              type="button"
              onClick={() => setUserSubTab('tickets')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
                userSubTab === 'tickets' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support Tickets</span>
            </button>
          </div>

          {userSubTab === 'tickets' ? (
            <div className="pt-2">
              <TicketCenter userRole="user" userEmail={currentUser.email} />
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
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Verified Revenue (LKR)</div>
                <div className="text-3xl font-mono font-bold text-white">Rs. {verifiedRevenueLKR.toLocaleString()}</div>
                <div className="text-xs font-mono text-zinc-400 mt-1">{verifiedOrders.length} verified order(s)</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Verified Volume (USD)</div>
                <div className="text-3xl font-mono font-bold text-white">${verifiedRevenueUSD.toFixed(2)}</div>
                <div className="text-xs font-mono text-zinc-400 mt-1">Real USD order sum</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Total Orders</div>
                <div className="text-3xl font-mono font-bold text-white">{rawOrders.length} Orders</div>
                <div className="text-xs font-mono text-zinc-400 mt-1">{pendingReviewCount} pending slip review</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Catalog Stock</div>
                <div className="text-3xl font-mono font-bold text-white">{activeProductsCount} Products</div>
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
