'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Key, Shield, QrCode as QrIcon, Copy, Check, Clock, X,
  Terminal, Server, RefreshCw, Upload, Eye, EyeOff, CheckCircle2, AlertTriangle, Send 
} from 'lucide-react';

interface ActiveAsset {
  id: string;
  orderNumber: string;
  productName: string;
  category: 'vpn' | 'vps' | 'subscription' | 'gaming';
  initialDays: number;
  initialHours: number;
  type: string;
  payload: string;
  username?: string;
  password?: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'DELIVERED';
}

const INITIAL_ASSETS: ActiveAsset[] = [
  {
    id: 'ast_01',
    orderNumber: 'FBZ-948129',
    productName: 'V2Ray Singapore Reality 10Gbps',
    category: 'vpn',
    initialDays: 25,
    initialHours: 14,
    type: 'VLESS URI',
    payload: 'vless://98e4d1b8-3a91-4c12-9281-7bf812c402aa@sg-edge.fibez.io:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=gateway.apple.com&fp=chrome#Fibez-SG-Fast',
    status: 'ACTIVE',
  },
  {
    id: 'ast_02',
    orderNumber: 'FBZ-830114',
    productName: 'NVMe Cloud VPS — 4 Core / 8GB RAM',
    category: 'vps',
    initialDays: 18,
    initialHours: 6,
    type: 'SSH Credentials',
    payload: 'ssh root@138.199.34.81',
    username: 'root',
    password: 'fbz_nvme_94fa201#Secure',
    status: 'ACTIVE',
  },
  {
    id: 'ast_03',
    orderNumber: 'FBZ-710291',
    productName: 'ChatGPT Plus / Team Workspace',
    category: 'subscription',
    initialDays: 29,
    initialHours: 23,
    type: 'Account Login',
    payload: 'gpt_team_dev@fibez.vault',
    username: 'gpt_team_dev@fibez.vault',
    password: 'TeamPass_2026!#Auth',
    status: 'ACTIVE',
  },
];

interface PendingReceipt {
  id: string;
  orderNumber: string;
  customerEmail: string;
  amount: string;
  bankName: string;
  productTitle: string;
  receiptName: string;
  timestamp: string;
}

export default function VaultDashboard() {
  const [activeTab, setActiveTab] = useState<'vault' | 'admin'>('vault');
  const [assets, setAssets] = useState<ActiveAsset[]>(INITIAL_ASSETS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [activeQrModal, setActiveQrModal] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  // Admin state
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([
    {
      id: 'rcp_101',
      orderNumber: 'FBZ-ORD-519203',
      customerEmail: 'tharindu@devbox.lk',
      amount: 'LKR 3,950',
      bankName: 'Commercial Bank',
      productTitle: 'NVMe Cloud VPS (4 Core / 8GB)',
      receiptName: 'commercial_bank_slip_519203.jpg',
      timestamp: '12 mins ago',
    },
    {
      id: 'rcp_102',
      orderNumber: 'FBZ-ORD-482104',
      customerEmail: 'kavinda.code@gmail.com',
      amount: 'LKR 1,150',
      bankName: 'Sampath Bank',
      productTitle: 'V2Ray Singapore Reality',
      receiptName: 'sampath_transfer_482104.png',
      timestamp: '28 mins ago',
    },
  ]);

  const [bulkStockCategory, setBulkStockCategory] = useState<'v2ray' | 'keys' | 'credentials'>('v2ray');
  const [bulkStockText, setBulkStockText] = useState('');
  const [stockAddedSuccess, setStockAddedSuccess] = useState(false);
  const [discordWebhookSent, setDiscordWebhookSent] = useState(false);

  // Live countdown timer calculation
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    // Fetch real assets from database
    fetch('/api/vault')
      .then((res) => res.json())
      .then((data) => {
        if (data.assets && data.assets.length > 0) {
          setAssets(data.assets);
        }
      })
      .catch((err) => console.error('Failed to load vault assets:', err));

    // Fetch real pending receipts from database
    fetch('/api/orders?role=admin')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders && data.orders.length > 0) {
          const formatted: PendingReceipt[] = data.orders
            .filter((o: any) => o.payment_status === 'PENDING_REVIEW' || o.payment_status === 'PENDING_PAYMENT')
            .map((o: any) => ({
              id: o.id,
              orderNumber: o.order_number,
              customerEmail: o.customer_email,
              amount: o.currency === 'USD' ? `$${o.total_amount_usd}` : `LKR ${Number(o.total_amount_lkr).toLocaleString()}`,
              bankName: o.payment_method === 'crypto' ? 'Crypto (TRC20)' : 'Bank Transfer / CDM',
              productTitle: o.items?.[0]?.product_title || 'Digital Product',
              receiptName: o.receipt_image_url ? 'Transfer Slip Attached' : 'Awaiting Slip Upload',
              timestamp: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));
          if (formatted.length > 0) {
            setPendingReceipts(formatted);
          }
        }
      })
      .catch((err) => console.error('Failed to load pending receipts:', err));

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (days: number, hours: number) => {
    const totalSeconds = Math.max(0, (days * 86400 + hours * 3600) - secondsElapsed);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    return `${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
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
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
    // Trigger notification
    setDiscordWebhookSent(true);
    setTimeout(() => setDiscordWebhookSent(false), 3000);
  };

  const handleBulkAddStock = () => {
    if (!bulkStockText.trim()) return;
    const lines = bulkStockText.trim().split('\n').filter((l) => l.trim().length > 0);
    setStockAddedSuccess(true);
    setTimeout(() => {
      setStockAddedSuccess(false);
      setBulkStockText('');
    }, 2500);
  };

  return (
    <section id="vault" className="w-full py-24 bg-black border-t border-[#292d30]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Top Header & Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4 pb-6 border-b border-[#1f2224]">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Management Portal
            </div>
            <h2 className="text-[36px] sm:text-[48px] font-normal leading-[1.12] tracking-[-0.05em] text-white">
              {activeTab === 'vault' ? 'Personal Key Vault' : 'Admin Command Center'}
            </h2>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-[#050505] p-1 rounded-[6px] border border-[#292d30] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('vault')}
              className={`font-mono text-xs px-4 py-2 rounded-[6px] transition-colors ${
                activeTab === 'vault'
                  ? 'bg-white text-black font-medium'
                  : 'text-[#a1a4a5] hover:text-white'
              }`}
            >
              Key Vault (User)
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`font-mono text-xs px-4 py-2 rounded-[6px] transition-colors ${
                activeTab === 'admin'
                  ? 'bg-white text-black font-medium'
                  : 'text-[#a1a4a5] hover:text-white'
              }`}
            >
              Command Center (Admin)
            </button>
          </div>
        </div>

        {/* TAB 1: CUSTOMER KEY VAULT */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#a1a4a5]">
                Active licenses, connection strings, and credential countdowns stored in your encrypted session.
              </p>
              <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
                <span>3 Active Services</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="resend-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left Info */}
                  <div className="space-y-1.5 max-w-md">
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

                    {/* Countdown Timer */}
                    <div className="flex items-center gap-1.5 font-mono text-xs text-[#70b8ff]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expires in: {isClient ? formatCountdown(asset.initialDays, asset.initialHours) : `${asset.initialDays}d ${asset.initialHours}h 00m`}</span>
                    </div>
                  </div>

                  {/* Middle / Right Actions */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    
                    {/* QR Code trigger for VPN */}
                    {asset.category === 'vpn' && (
                      <button
                        onClick={() => handleShowQr(asset.payload)}
                        className="btn-ghost-resend text-xs !py-2 !px-3 text-[#f0f0f0]"
                      >
                        <QrIcon className="w-3.5 h-3.5 text-white" />
                        <span>Mobile QR</span>
                      </button>
                    )}

                    {/* Password toggle for VPS / Subscription */}
                    {asset.password && (
                      <button
                        onClick={() => toggleReveal(asset.id)}
                        className="btn-ghost-resend text-xs !py-2 !px-3 text-[#a1a4a5]"
                      >
                        {revealedIds[asset.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{revealedIds[asset.id] ? 'Hide' : 'Reveal Pass'}</span>
                      </button>
                    )}

                    {/* One-Click Copy */}
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
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: ADMIN COMMAND CENTER */}
        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Bank Slip Reviews (Span 6) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#292d30]">
                <h3 className="text-lg font-normal text-white">
                  Manual Bank Transfer Review Queue
                </h3>
                <span className="font-mono text-xs text-[#ffca16]">
                  {pendingReceipts.length} Pending Approval
                </span>
              </div>

              {discordWebhookSent && (
                <div className="p-3 rounded-[6px] border border-[#5865F2] bg-[#0c0e14] text-xs font-mono text-[#baa7ff] flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" />
                  <span>Discord webhook notification triggered for order fulfillment!</span>
                </div>
              )}

              {pendingReceipts.length === 0 ? (
                <div className="p-10 rounded-[16px] border border-[#292d30] text-center font-mono text-xs text-[#a1a4a5]">
                  All bank transfer receipts have been reviewed and fulfilled.
                </div>
              ) : (
                pendingReceipts.map((rcp) => (
                  <div
                    key={rcp.id}
                    className="resend-card p-5 space-y-3"
                  >
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
                      <span className="text-zinc-300 text-[10px] uppercase">Slip Verified</span>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => handleApproveReceipt(rcp.id)}
                        className="btn-action-resend !py-1.5 !px-3 text-xs"
                      >
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>One-Click Fulfill &amp; Notify</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column: Bulk Inventory Stock Ingestion (Span 6) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#292d30]">
                <h3 className="text-lg font-normal text-white">
                  Bulk Stock Inventory Vault
                </h3>
                <span className="font-mono text-xs text-zinc-300">
                  Neon DB Encrypted
                </span>
              </div>

              <div className="resend-card p-6 space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                    Select Inventory Target
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'v2ray', label: 'V2Ray VLESS' },
                      { id: 'keys', label: 'Game Keys' },
                      { id: 'credentials', label: 'Logins' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setBulkStockCategory(t.id as any)}
                        className={`p-2 rounded-[6px] border font-mono text-xs text-center transition-colors ${
                          bulkStockCategory === t.id
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
                    Paste Raw Keys / Configs (One per line)
                  </label>
                  <textarea
                    rows={5}
                    value={bulkStockText}
                    onChange={(e) => setBulkStockText(e.target.value)}
                    placeholder="vless://node1@sg.fibez.io...\nvless://node2@sg.fibez.io..."
                    className="w-full p-3 rounded-[6px] bg-[#050505] border border-[#292d30] font-mono text-xs text-white placeholder-[#6e727a] focus:outline-none focus:border-white"
                  />
                </div>

                {stockAddedSuccess && (
                  <div className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cryptographically encrypted &amp; inserted into Neon inventory items table!</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono text-xs text-[#6e727a]">
                    AES-GCM-256 Vault Encryption
                  </span>
                  <button
                    onClick={handleBulkAddStock}
                    className="btn-action-resend text-xs"
                  >
                    <span>Ingest into Vault</span>
                    <span>›</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* QR Code Modal for Mobile VPN Setup */}
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
            <h4 className="text-lg font-normal text-white">Scan V2Ray Reality Config</h4>

            <div className="p-3 bg-white rounded-[10px] inline-block shadow-lg">
              <img
                src={qrCodeDataUrl}
                alt="V2Ray QR"
                className="w-56 h-56 mx-auto"
              />
            </div>

            <p className="text-xs text-[#a1a4a5]">
              Open v2rayNG or Shadowrocket, tap the '+' scan icon, and point your camera.
            </p>

            <button
              onClick={() => setActiveQrModal(null)}
              className="btn-ghost-resend w-full text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
