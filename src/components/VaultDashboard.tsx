'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { authClient } from '@/lib/auth-client';
import { PRODUCTS } from '@/lib/products';
import { 
  Key, QrCode as QrIcon, Copy, Check, Clock, X,
  Eye, EyeOff, CheckCircle2, Send, Search
} from 'lucide-react';

interface ActiveAsset {
  id: string;
  orderNumber: string;
  productName: string;
  category: 'vpn' | 'subscription' | 'gaming' | 'giftcard' | 'software';
  initialDays: number;
  initialHours: number;
  type: string;
  payload: string;
  username?: string;
  password?: string;
  status: string;
}

interface PendingReceipt {
  id: string;
  orderNumber: string;
  customerEmail: string;
  amount: string;
  bankName: string;
  productTitle: string;
  receiptName: string;
  receiptUrl?: string;
  timestamp: string;
}

export default function VaultDashboard() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  const [activeTab, setActiveTab] = useState<'vault' | 'admin'>('vault');
  const [assets, setAssets] = useState<ActiveAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [lookupOrder, setLookupOrder] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [activeQrModal, setActiveQrModal] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  // Admin state
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCTS[0]?.id || 'v2ray-dialog-zoom');
  const [bulkStockType, setBulkStockType] = useState<'CONNECTION_CONFIG' | 'SERIAL_KEY' | 'ACCOUNT_CREDENTIALS'>('CONNECTION_CONFIG');
  const [bulkStockText, setBulkStockText] = useState('');
  const [stockAddedCount, setStockAddedCount] = useState<number | null>(null);
  const [webhookNotice, setWebhookNotice] = useState(false);

  const loadVaultAssets = (queryParam?: string) => {
    setLoadingAssets(true);
    let url = '';
    if (queryParam && queryParam.trim()) {
      url = `/api/vault?order_number=${encodeURIComponent(queryParam.trim().toUpperCase())}`;
    } else if (session?.user?.email) {
      url = `/api/vault?email=${encodeURIComponent(session.user.email)}`;
    } else {
      setAssets([]);
      setLoadingAssets(false);
      return;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.assets)) {
          setAssets(data.assets);
        } else {
          setAssets([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load vault assets:', err);
        setAssets([]);
      })
      .finally(() => setLoadingAssets(false));
  };

  useEffect(() => {
    loadVaultAssets();
  }, [session?.user?.email]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/orders?role=admin')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.orders)) {
          const formatted: PendingReceipt[] = data.orders
            .filter((o: any) => o.payment_status === 'PENDING_REVIEW' || o.payment_status === 'PENDING_PAYMENT')
            .map((o: any) => ({
              id: o.id,
              orderNumber: o.order_number,
              customerEmail: o.customer_email,
              amount: o.currency === 'USD' ? `$${o.total_amount_usd}` : `LKR ${Number(o.total_amount_lkr).toLocaleString()}`,
              bankName: o.payment_method === 'crypto' ? 'Crypto' : 'Bank Transfer / CDM',
              productTitle: o.items?.[0]?.product_title || 'Digital Product',
              receiptName: o.receipt_image_url ? 'Transfer Slip Attached' : 'Awaiting Slip',
              receiptUrl: o.receipt_image_url,
              timestamp: new Date(o.created_at).toLocaleString(),
            }));
          setPendingReceipts(formatted);
        }
      })
      .catch((err) => console.error('Failed to load pending receipts:', err));
  }, [isAdmin]);

  const handleOrderLookup = (e: React.FormEvent) => {
    e.preventDefault();
    loadVaultAssets(lookupOrder);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShowQr = async (payload: string) => {
    try {
      const url = await QRCode.toDataURL(payload, {
        color: { dark: '#000000', light: '#ffffff' },
        margin: 1,
        width: 240,
      });
      setQrCodeDataUrl(url);
      setActiveQrModal(payload);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveReceipt = async (id: string) => {
    setPendingReceipts((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, paymentStatus: 'VERIFIED', fulfillmentStatus: 'DELIVERED' }),
      });
      setWebhookNotice(true);
      setTimeout(() => setWebhookNotice(false), 3000);
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  const handleBulkAddStock = async () => {
    const entries = bulkStockText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (entries.length === 0) return;

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          stockType: bulkStockType,
          entries,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStockAddedCount(data.inserted);
        setBulkStockText('');
        setTimeout(() => setStockAddedCount(null), 3000);
      }
    } catch (e) {
      console.error('Failed to ingest stock:', e);
    }
  };

  return (
    <section id="vault" className="w-full py-12 bg-black">
      <div className="max-w-[1200px] mx-auto px-2 sm:px-6">
        
        {/* Top Header & Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 pb-6 border-b border-[#1f2224]">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Order &amp; Key Vault
            </div>
            <h2 className="text-[32px] sm:text-[44px] font-normal leading-[1.12] tracking-[-0.04em] text-white">
              {activeTab === 'vault' ? 'Personal Key Vault' : 'Admin Verification Queue'}
            </h2>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 bg-[#050505] p-1 rounded-[6px] border border-[#292d30] self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('vault')}
                className={`font-mono text-xs px-4 py-2 rounded-[6px] transition-colors ${
                  activeTab === 'vault'
                    ? 'bg-white text-black font-medium'
                    : 'text-[#a1a4a5] hover:text-white'
                }`}
              >
                My Vault
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`font-mono text-xs px-4 py-2 rounded-[6px] transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-white text-black font-medium'
                    : 'text-[#a1a4a5] hover:text-white'
                }`}
              >
                Admin Queue ({pendingReceipts.length})
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: CUSTOMER KEY VAULT */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-[#a1a4a5]">
                {session?.user?.email
                  ? `Showing delivered keys and configs for ${session.user.email}.`
                  : 'Sign in or enter your Order Number (e.g. FBZ-123456) to view your purchased keys and configs.'}
              </p>

              <form onSubmit={handleOrderLookup} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lookupOrder}
                    onChange={(e) => setLookupOrder(e.target.value)}
                    placeholder="Order # (e.g. FBZ-123456)"
                    className="pl-8 pr-3 py-2 rounded-[6px] bg-[#0a0a0c] border border-[#292d30] text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-ghost-resend text-xs !py-2 !px-3"
                >
                  Look Up
                </button>
              </form>
            </div>

            {loadingAssets ? (
              <div className="resend-card p-12 text-center font-mono text-xs text-zinc-400">
                Loading your vault items...
              </div>
            ) : assets.length === 0 ? (
              <div className="resend-card p-12 text-center space-y-3">
                <div className="w-10 h-10 rounded-full border border-[#292d30] bg-black flex items-center justify-center mx-auto text-zinc-400">
                  <Key className="w-4 h-4" />
                </div>
                <p className="text-sm text-zinc-300">No delivered keys or VLESS configs found.</p>
                <p className="text-xs font-mono text-zinc-500">
                  {session?.user?.email
                    ? 'Any product you purchase or 24-hour VLESS trial you claim will appear here immediately.'
                    : 'Please sign in or enter your Order Number above.'}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link href="/catalog" className="btn-action-resend text-xs !py-2 !px-4">
                    <span>Browse Store</span>
                    <span>›</span>
                  </Link>
                  {!session?.user && (
                    <Link href="/login" className="btn-ghost-resend text-xs !py-2 !px-4">
                      <span>Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="resend-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-zinc-300">
                          {asset.orderNumber}
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-[6px] bg-[#1a1c1e] text-zinc-300 border border-[#292d30]">
                          {asset.status}
                        </span>
                      </div>

                      <h4 className="text-lg font-normal text-white">
                        {asset.productName}
                      </h4>

                      <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Type: {asset.type}</span>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {asset.category === 'vpn' && asset.payload?.startsWith('vless://') && (
                        <button
                          onClick={() => handleShowQr(asset.payload)}
                          className="btn-ghost-resend text-xs !py-2 !px-3 text-[#f0f0f0]"
                        >
                          <QrIcon className="w-3.5 h-3.5 text-white" />
                          <span>Mobile QR</span>
                        </button>
                      )}

                      {asset.password && (
                        <button
                          onClick={() => toggleReveal(asset.id)}
                          className="btn-ghost-resend text-xs !py-2 !px-3 text-[#a1a4a5]"
                        >
                          {revealedIds[asset.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{revealedIds[asset.id] ? 'Hide' : 'Reveal Pass'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(
                          asset.id,
                          asset.password && revealedIds[asset.id]
                            ? `${asset.payload}\nPass: ${asset.password}`
                            : asset.payload
                        )}
                        className="btn-action-resend text-xs !py-2 !px-3.5"
                      >
                        {copiedId === asset.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-black" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-black" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADMIN COMMAND CENTER (Admin/Owner Only) */}
        {activeTab === 'admin' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#292d30]">
                <h3 className="text-lg font-normal text-white">
                  Manual Bank Transfer Review Queue
                </h3>
                <span className="font-mono text-xs text-zinc-400">
                  {pendingReceipts.length} Pending
                </span>
              </div>

              {webhookNotice && (
                <div className="p-3 rounded-[6px] border border-white/20 bg-white/5 text-xs font-mono text-white flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" />
                  <span>Order approved &amp; marked DELIVERED in database!</span>
                </div>
              )}

              {pendingReceipts.length === 0 ? (
                <div className="p-10 rounded-[16px] border border-[#292d30] text-center font-mono text-xs text-[#a1a4a5]">
                  No pending payment receipts awaiting review.
                </div>
              ) : (
                pendingReceipts.map((rcp) => (
                  <div key={rcp.id} className="resend-card p-5 space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-zinc-300">{rcp.orderNumber}</span>
                      <span className="text-[#6e727a]">{rcp.timestamp}</span>
                    </div>

                    <div>
                      <div className="text-white font-medium text-sm">{rcp.productTitle}</div>
                      <div className="font-mono text-xs text-[#a1a4a5] mt-0.5">
                        {rcp.customerEmail} · {rcp.amount} ({rcp.bankName})
                      </div>
                    </div>

                    <div className="p-2.5 rounded-[6px] border border-[#292d30] bg-[#050505] flex items-center justify-between font-mono text-xs">
                      <span className="text-[#a1a4a5] truncate">{rcp.receiptName}</span>
                      {rcp.receiptUrl && (
                        <a href={rcp.receiptUrl} target="_blank" rel="noreferrer" className="text-white hover:underline text-[10px] uppercase">
                          View Slip
                        </a>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => handleApproveReceipt(rcp.id)}
                        className="btn-action-resend !py-1.5 !px-3 text-xs"
                      >
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>Verify &amp; Deliver</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#292d30]">
                <h3 className="text-lg font-normal text-white">
                  Upload Real Stock Keys / VLESS Configs
                </h3>
              </div>

              <div className="resend-card p-6 space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                    Target Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full p-2.5 rounded-[6px] bg-[#050505] border border-[#292d30] text-xs font-mono text-white focus:outline-none focus:border-white"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                    Stock Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'CONNECTION_CONFIG', label: 'VLESS Config' },
                      { id: 'SERIAL_KEY', label: 'Gift / Game Key' },
                      { id: 'ACCOUNT_CREDENTIALS', label: 'Email:Password' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setBulkStockType(t.id as any)}
                        className={`p-2 rounded-[6px] border font-mono text-xs text-center transition-colors ${
                          bulkStockType === t.id
                            ? 'border-white bg-[#141618] text-white'
                            : 'border-[#292d30] text-[#a1a4a5] hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                    Paste Real Keys / Configs (One per line)
                  </label>
                  <textarea
                    rows={5}
                    value={bulkStockText}
                    onChange={(e) => setBulkStockText(e.target.value)}
                    placeholder="Paste real keys, VLESS URIs, or email:password lines..."
                    className="w-full p-3 rounded-[6px] bg-[#050505] border border-[#292d30] font-mono text-xs text-white placeholder-[#6e727a] focus:outline-none focus:border-white"
                  />
                </div>

                {stockAddedCount !== null && (
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved {stockAddedCount} inventory item(s) to database!</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleBulkAddStock}
                    className="btn-action-resend text-xs"
                  >
                    <span>Save Stock to Database</span>
                    <span>›</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {activeQrModal && qrCodeDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-[16px]">
          <div className="relative w-full max-w-sm bg-black border border-[#292d30] rounded-[16px] p-6 text-center space-y-4">
            <button
              onClick={() => setActiveQrModal(null)}
              className="absolute top-4 right-4 p-1 text-[#a1a4a5] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Mobile Quick Connect
            </div>
            <h4 className="text-lg font-normal text-white">Scan VLESS VPN Config</h4>

            <div className="p-3 bg-white rounded-[10px] inline-block shadow-lg">
              <img
                src={qrCodeDataUrl}
                alt="QR Scan"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs text-[#a1a4a5] leading-relaxed">
              Scan with <strong>NetMod Syna</strong> or <strong>v2rayNG</strong> on your phone to import immediately.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
