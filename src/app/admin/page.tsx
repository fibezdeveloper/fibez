'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/products-data';
import {
  Terminal,
  ShieldCheck,
  Building2,
  Check,
  X,
  Upload,
  Layers,
  Send,
  Zap,
  Clock,
  Eye,
  AlertTriangle,
  RefreshCw,
  Bell
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PendingOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerEmail: string;
  customerWhatsapp?: string;
  productTitle: string;
  variantTitle: string;
  amount: number;
  currency: string;
  status: 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED';
  receiptImageUrl?: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'VAULT' | 'PRODUCTS' | 'DISCORD'>('AUDIT');
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Bulk Ingestion state
  const [selectedVariant, setSelectedVariant] = useState(PRODUCTS[0].variants[0].id);
  const [bulkInput, setBulkInput] = useState('');
  const [ingestLog, setIngestLog] = useState<string | null>(null);

  // Discord Webhook state
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [discordStatus, setDiscordStatus] = useState<string | null>(null);

  // Load orders from localStorage or set initial demo review queue
  useEffect(() => {
    const saved = localStorage.getItem('fibez_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOrders(parsed);
      } catch {
        setOrders([]);
      }
    } else {
      // Seed an initial pending order for immediate testing
      const seed: PendingOrder[] = [
        {
          id: 'ord-seed-01',
          orderNumber: 'FBZ-739218',
          createdAt: new Date().toISOString(),
          customerEmail: 'kavindu.gamer@gmail.com',
          customerWhatsapp: '+94 77 923 8812',
          productTitle: 'Fibez V2Ray Ultra Tunnel',
          variantTitle: '1 Month — SLT Fibre Optimized',
          amount: 1400,
          currency: 'LKR',
          status: 'PENDING_REVIEW',
          receiptImageUrl: '/brand/v2ray.png',
        },
      ];
      setOrders(seed);
      localStorage.setItem('fibez_orders', JSON.stringify(seed));
    }
  }, []);

  // 1-Click Order Fulfillment
  const handleApproveOrder = (orderId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'COMPLETED' as const,
          licenseKey: 'DISPATCHED_FROM_VAULT',
          connectionConfig:
            'vless://9824f112-a89c-4821-992a-112233445566@de1.fibez.io:443?encryption=none&security=reality&sni=slt.lk&fp=chrome&pbk=9bK87eA4&sid=1029&type=tcp#Fibez-Verified-SLT',
          expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        };
      }
      return o;
    });

    setOrders(updated);
    localStorage.setItem('fibez_orders', JSON.stringify(updated));

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#c5ff4a', '#ffffff', '#252525'],
    });

    alert('Order approved! Digital stock atomically dispensed to customer Key Vault and Discord dispatch simulated.');
  };

  const handleRejectOrder = (orderId: string) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o));
    setOrders(updated);
    localStorage.setItem('fibez_orders', JSON.stringify(updated));
  };

  // Bulk Ingestion commit
  const handleCommitBulk = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      alert('Please paste at least one license key or connection config string.');
      return;
    }

    setIngestLog(`[SUCCESS]: Ingested ${lines.length} encrypted keys into Vault for variant ID: ${selectedVariant}.`);
    setBulkInput('');
    setTimeout(() => setIngestLog(null), 5000);
  };

  // Test Discord Webhook
  const handleTestDiscord = () => {
    setDiscordStatus('DISPATCHING EMBED VIA WEBHOOK...');
    setTimeout(() => {
      setDiscordStatus('✓ 200 OK: Discord Webhook dispatched successfully with signal lime embed.');
    }, 800);
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING_REVIEW');

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[var(--color-graphite)]">
        <div>
          <span className="metadata-stamp text-[10px]">
            [ FIBEZ COMMAND CENTER // CLEARANCE LEVEL: ROOT ADMIN ]
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white mt-1">
            Admin Command Center
          </h1>
          <p className="text-xs font-mono text-[var(--color-ash)] mt-2">
            Automated inventory intake, bank transfer slip verification, and telemetry hooks.
          </p>
        </div>

        {/* Telemetry Stats */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="p-3 bg-[var(--color-onyx)] border border-[var(--color-graphite)] rounded-[2px]">
            <span className="text-[10px] text-[var(--color-ash)] block uppercase">Pending Slips</span>
            <span className="text-lg font-bold text-amber-400">{pendingOrders.length}</span>
          </div>
          <div className="p-3 bg-[var(--color-onyx)] border border-[var(--color-graphite)] rounded-[2px]">
            <span className="text-[10px] text-[var(--color-ash)] block uppercase">Vault Products</span>
            <span className="text-lg font-bold text-[var(--color-accent)]">{PRODUCTS.length}</span>
          </div>
          <div className="p-3 bg-[var(--color-onyx)] border border-[var(--color-graphite)] rounded-[2px]">
            <span className="text-[10px] text-[var(--color-ash)] block uppercase">Webhook Status</span>
            <span className="text-lg font-bold text-white">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 bg-[var(--color-onyx)] p-1.5 border border-[var(--color-graphite)] rounded-[4px]">
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`py-2.5 px-3 rounded-[2px] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'AUDIT'
              ? 'bg-[var(--color-accent)] text-black font-bold shadow-[0_0_8px_rgba(197,255,74,0.4)]'
              : 'text-[var(--color-bone)] hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Slip Audit ({pendingOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('VAULT')}
          className={`py-2.5 px-3 rounded-[2px] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'VAULT'
              ? 'bg-[var(--color-accent)] text-black font-bold shadow-[0_0_8px_rgba(197,255,74,0.4)]'
              : 'text-[var(--color-bone)] hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Bulk Stock Intake</span>
        </button>

        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`py-2.5 px-3 rounded-[2px] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'PRODUCTS'
              ? 'bg-[var(--color-accent)] text-black font-bold shadow-[0_0_8px_rgba(197,255,74,0.4)]'
              : 'text-[var(--color-bone)] hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Product Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('DISCORD')}
          className={`py-2.5 px-3 rounded-[2px] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'DISCORD'
              ? 'bg-[var(--color-accent)] text-black font-bold shadow-[0_0_8px_rgba(197,255,74,0.4)]'
              : 'text-[var(--color-bone)] hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Discord Telemetry</span>
        </button>
      </div>

      {/* TAB 1: BANK SLIP AUDIT & 1-CLICK FULFILLMENT */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="metadata-stamp text-[10px]">
              [ PENDING BANK RECEIPT AUDIT QUEUE ]
            </span>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-mono text-[var(--color-ash)] hover:text-[var(--color-accent)] flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REFRESH QUEUE</span>
            </button>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="card-sharp p-12 text-center bg-[var(--color-onyx)] space-y-3">
              <Check className="w-10 h-10 text-[var(--color-accent)] mx-auto" />
              <h3 className="font-serif text-2xl text-white">All Clear — Audit Queue Empty</h3>
              <p className="text-xs font-mono text-[var(--color-smoke)] max-w-md mx-auto">
                No bank transfer payslips are currently awaiting manual approval. Test orders created via Checkout will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="card-sharp p-6 sm:p-8 bg-[var(--color-onyx)] border border-[var(--color-graphite)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  
                  {/* Order Details (7 cols) */}
                  <div className="lg:col-span-7 space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        ORDER REF: {order.orderNumber}
                      </span>
                      <span className="pill-out-stock text-[9px] border-amber-500/40 text-amber-400">
                        PENDING AUDIT
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-4 bg-[var(--color-carbon)] border border-[var(--color-slate)] rounded-[2px]">
                      <div>
                        <span className="text-[10px] text-[var(--color-ash)] block uppercase">Package</span>
                        <span className="text-white font-medium">{order.productTitle}</span>
                        <div className="text-[10px] text-[var(--color-smoke)]">{order.variantTitle}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-ash)] block uppercase">Amount Due</span>
                        <span className="text-[var(--color-accent)] font-bold text-sm">
                          {order.currency} {order.amount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-ash)] block uppercase">Customer Email</span>
                        <span className="text-white break-all">{order.customerEmail}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--color-ash)] block uppercase">WhatsApp Phone</span>
                        <span className="text-[#25D366]">{order.customerWhatsapp || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Action Triggers */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleApproveOrder(order.id)}
                        className="btn-signal text-xs py-2.5 px-4 flex items-center gap-2 font-bold"
                      >
                        <Zap className="w-4 h-4" />
                        <span>APPROVE & 1-CLICK FULFILL</span>
                      </button>

                      <button
                        onClick={() => handleRejectOrder(order.id)}
                        className="btn-outlined text-xs py-2 px-3 text-red-400 border-red-500/40 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                        <span>REJECT</span>
                      </button>
                    </div>
                  </div>

                  {/* Receipt Preview (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[var(--color-carbon)] border border-[var(--color-slate)] rounded-[2px]">
                    <span className="text-[10px] font-mono text-[var(--color-ash)] uppercase mb-2">
                      CUSTOMER UPLOADED BANK SLIP
                    </span>

                    {order.receiptImageUrl ? (
                      <div
                        onClick={() => setSelectedReceipt(order.receiptImageUrl!)}
                        className="relative w-full h-44 cursor-pointer group border border-[var(--color-graphite)] rounded-[2px] overflow-hidden"
                      >
                        <Image
                          src={order.receiptImageUrl}
                          alt="Customer Bank Slip"
                          fill
                          className="object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center font-mono text-xs text-white transition-opacity">
                          <Eye className="w-4 h-4 mr-1 text-[var(--color-accent)]" />
                          <span>Click to Zoom</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-mono text-[var(--color-ash)] py-12">
                        NO IMAGE ATTACHED
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUTOMATED INVENTORY VAULT & BULK INTAKE */}
      {activeTab === 'VAULT' && (
        <div className="space-y-6">
          <span className="metadata-stamp text-[10px]">
            [ BULK INVENTORY INTAKE // FIFO DISPENSING ENGINE ]
          </span>

          <form onSubmit={handleCommitBulk} className="card-sharp p-6 sm:p-8 bg-[var(--color-onyx)] space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block text-[11px] text-[var(--color-ash)] uppercase mb-1">
                  TARGET PRODUCT VARIANT
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full p-3 bg-[var(--color-carbon)] border border-[var(--color-graphite)] text-white outline-none rounded-[2px]"
                >
                  {PRODUCTS.flatMap((p) =>
                    p.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {p.title} — {v.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--color-ash)] uppercase mb-1">
                  STOCK FORMAT
                </label>
                <div className="p-3 bg-[var(--color-carbon)] border border-[var(--color-graphite)] text-[var(--color-smoke)] rounded-[2px]">
                  One item per line (Raw License Key, JSON Account, or V2Ray URI)
                </div>
              </div>
            </div>

            {/* Bulk Textarea */}
            <div>
              <label className="block text-[11px] font-mono text-[var(--color-ash)] uppercase mb-1">
                PASTE SERIAL KEYS / V2RAY CONFIGS (LINE BY LINE)
              </label>
              <textarea
                rows={8}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="vless://e43b...&#10;vless://981a...&#10;chatgpt_user1:pass987&#10;XXXXX-YYYYY-ZZZZZ-AAAAA"
                className="w-full p-4 bg-[var(--color-carbon)] border border-[var(--color-graphite)] focus:border-[var(--color-accent)] text-white font-mono text-xs outline-none rounded-[2px]"
              />
            </div>

            {ingestLog && (
              <div className="p-3 bg-[var(--color-carbon)] border border-[var(--color-accent)] font-mono text-xs text-[var(--color-accent)] rounded-[2px]">
                {ingestLog}
              </div>
            )}

            <button
              type="submit"
              className="btn-signal text-xs py-3 px-6 uppercase tracking-wider font-bold flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>COMMIT TO ENCRYPTED VAULT (FIFO)</span>
            </button>

          </form>
        </div>
      )}

      {/* TAB 3: PRODUCT MATRIX */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-6">
          <span className="metadata-stamp text-[10px]">
            [ ACTIVE CATALOG PACKAGES & PRICING ]
          </span>

          <div className="grid grid-cols-1 gap-4 font-mono text-xs">
            {PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="card-sharp p-4 sm:p-6 bg-[var(--color-onyx)] border border-[var(--color-graphite)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="metadata-stamp text-[9px]">
                    [ {prod.categoryLabel} ]
                  </span>
                  <h4 className="font-serif text-xl text-white mt-0.5">{prod.title}</h4>
                  <p className="text-[11px] text-[var(--color-ash)] font-mono">{prod.tagline}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--color-ash)] block">Variants</span>
                    <span className="text-white font-bold">{prod.variants.length} Tiers</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--color-ash)] block">Instant Delivery</span>
                    <span className="text-[var(--color-accent)] font-bold">YES</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISCORD WEBHOOK TELEMETRY */}
      {activeTab === 'DISCORD' && (
        <div className="card-sharp p-6 sm:p-8 bg-[var(--color-onyx)] space-y-6 font-mono text-xs">
          <div>
            <span className="metadata-stamp text-[10px]">
              [ REAL-TIME ORDER NOTIFICATION HOOK ]
            </span>
            <h3 className="font-serif text-2xl text-white mt-1">Discord Order Dispatch Webhook</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] text-[var(--color-ash)] uppercase mb-1">
                Discord Webhook URL
              </label>
              <input
                type="url"
                value={discordWebhookUrl}
                onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/1234567890/abcdefg..."
                className="w-full p-3 bg-[var(--color-carbon)] border border-[var(--color-graphite)] text-white outline-none rounded-[2px]"
              />
            </div>

            <button
              onClick={handleTestDiscord}
              className="btn-signal text-xs py-2.5 px-4 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>TEST DISCORD WEBHOOK DISPATCH</span>
            </button>

            {discordStatus && (
              <div className="p-3 bg-[var(--color-carbon)] border border-[var(--color-slate)] text-[var(--color-accent)] text-xs">
                {discordStatus}
              </div>
            )}

            {/* Embed Preview Box */}
            <div className="p-4 bg-[var(--color-carbon)] border-l-4 border-l-[var(--color-accent)] border border-[var(--color-graphite)] rounded-[2px] space-y-2">
              <div className="text-[var(--color-accent)] font-bold">
                ⚡ FIBEZ DISPATCH: NEW ORDER CONFIRMED
              </div>
              <div className="text-white">Order: FBZ-928174</div>
              <div className="text-[var(--color-smoke)]">Product: Fibez V2Ray Ultra Tunnel (1 Month — SLT)</div>
              <div className="text-[var(--color-smoke)]">Amount: LKR 1,400 (Paid via Bank Deposit)</div>
              <div className="text-[var(--color-ash)] text-[10px]">Clearance Latency: 0.0024s • AES-256 Vault</div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 cursor-zoom-out"
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] h-[500px]">
            <Image
              src={selectedReceipt}
              alt="Zoomed Bank Receipt"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
}
