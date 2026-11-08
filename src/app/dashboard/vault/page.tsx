'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  KeyRound,
  Copy,
  Check,
  QrCode,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Download,
  AlertCircle,
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VaultOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerEmail: string;
  productTitle: string;
  variantTitle: string;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING_REVIEW' | 'CANCELLED';
  licenseKey?: string;
  connectionConfig?: string;
  expiresAt: string; // ISO date
}

// Initial default seed vault orders for demonstration
const DEFAULT_DEMO_ORDERS: VaultOrder[] = [
  {
    id: 'ord-v2ray-live',
    orderNumber: 'FBZ-928174',
    createdAt: '2026-11-06T10:00:00.000Z',
    customerEmail: 'operator@fibez.io',
    productTitle: 'Fibez V2Ray Ultra Tunnel',
    variantTitle: '1 Month — SLT Fibre Optimized',
    amount: 1400,
    currency: 'LKR',
    status: 'COMPLETED',
    connectionConfig:
      'vless://550e8400-e29b-41d4-a716-446655440000@sg1.fibez.io:443?encryption=none&security=reality&sni=slt.lk&fp=chrome&pbk=7eA41bK9&sid=6289&type=tcp&headerType=none#Fibez-SLT-VIP-Singapore',
    expiresAt: '2026-12-08T10:00:00.000Z',
  },
  {
    id: 'ord-chatgpt-live',
    orderNumber: 'FBZ-481923',
    createdAt: '2026-11-03T10:00:00.000Z',
    customerEmail: 'operator@fibez.io',
    productTitle: 'ChatGPT Plus & Codex Suite',
    variantTitle: '1 Month — Private Account',
    amount: 6000,
    currency: 'LKR',
    status: 'COMPLETED',
    licenseKey: 'auth_email: chatgpt.user92@fibez-mail.net\nauth_pass: Kx9#mP2!qL98\npin_code: 4821',
    expiresAt: '2026-12-03T10:00:00.000Z',
  },
];

function VaultContent() {
  const searchParams = useSearchParams();
  const createdRef = searchParams.get('orderCreated');

  const [orders, setOrders] = useState<VaultOrder[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrModalContent, setQrModalContent] = useState<{ title: string; qrDataUrl: string } | null>(null);

  // Time remaining state ticker initialized to null for hydration safety
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    // Load persisted orders from localStorage
    const saved = localStorage.getItem('fibez_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with demo orders
        setOrders([...parsed, ...DEFAULT_DEMO_ORDERS]);
      } catch {
        setOrders(DEFAULT_DEMO_ORDERS);
      }
    } else {
      setOrders(DEFAULT_DEMO_ORDERS);
    }

    if (createdRef) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c5ff4a', '#ffffff', '#252525'],
      });
    }

    // Timer ticker every second
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [createdRef]);

  const toggleReveal = (orderId: string) => {
    setRevealedKeys((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleShowQr = async (config: string, title: string) => {
    try {
      const url = await QRCode.toDataURL(config, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#c5ff4a', // Brand Signal Lime background
        },
      });
      setQrModalContent({ title, qrDataUrl: url });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadBackup = (order: VaultOrder) => {
    const payload = order.connectionConfig || order.licenseKey || 'No payload';
    const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.orderNumber}-credentials.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to format remaining time
  const formatCountdown = (expiresAtStr: string) => {
    if (!now) return 'SYNCING VAULT...';
    const expiresAt = new Date(expiresAtStr).getTime();
    const diff = expiresAt - now;
    if (diff <= 0) return 'EXPIRED';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
      
      {/* Toast Notification for new order */}
      {createdRef && (
        <div className="mb-8 p-4 bg-[var(--color-onyx)] border border-[var(--color-accent)] rounded-[2px] flex items-center justify-between shadow-[0_0_12px_rgba(197,255,74,0.2)]">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[var(--color-accent)] shrink-0" />
            <div>
              <span className="font-mono text-xs uppercase font-bold text-white block">
                ORDER {createdRef} REGISTERED
              </span>
              <span className="text-xs text-[var(--color-smoke)] font-mono">
                Your payment slip is currently queued for audit. Once verified, this vault item will automatically unlock.
              </span>
            </div>
          </div>
          <span className="pill-in-stock text-[9px]">PENDING AUDIT</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[var(--color-graphite)]">
        <div>
          <span className="metadata-stamp text-[10px]">
            [ SECURE CUSTOMER TERMINAL // AES-256 VAULT ]
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white mt-1">
            Customer Key Vault
          </h1>
          <p className="text-xs font-mono text-[var(--color-ash)] mt-2">
            Encrypted repository of active licenses, V2Ray configurations, and root credentials.
          </p>
        </div>

        {/* Quick Vault Stats */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="p-3 bg-[var(--color-onyx)] border border-[var(--color-graphite)] rounded-[2px]">
            <span className="text-[10px] text-[var(--color-ash)] block uppercase">Active Vault Items</span>
            <span className="text-lg font-bold text-[var(--color-accent)]">{orders.length}</span>
          </div>
          <div className="p-3 bg-[var(--color-onyx)] border border-[var(--color-graphite)] rounded-[2px]">
            <span className="text-[10px] text-[var(--color-ash)] block uppercase">Zero-Log Encryption</span>
            <span className="text-lg font-bold text-white">AES-256</span>
          </div>
        </div>
      </div>

      {/* Orders & Secrets Matrix */}
      <div className="space-y-6">
        {orders.map((order) => {
          const isRevealed = revealedKeys[order.id];
          const isCompleted = order.status === 'COMPLETED';
          const payload = order.connectionConfig || order.licenseKey || '';
          const hasV2RayConfig = order.connectionConfig?.startsWith('vless://') || order.connectionConfig?.startsWith('vmess://');

          return (
            <div
              key={order.id}
              className="card-sharp p-6 sm:p-8 bg-[var(--color-onyx)] border border-[var(--color-graphite)] space-y-6"
            >
              
              {/* Card Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-graphite)] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-white tracking-wider">
                      REF: {order.orderNumber}
                    </span>
                    <span className="text-[var(--color-ash)]">•</span>
                    <span className="text-[10px] font-mono text-[var(--color-ash)]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-white font-normal">
                    {order.productTitle}
                  </h3>
                  <div className="text-xs font-mono text-[var(--color-ash)]">
                    {order.variantTitle}
                  </div>
                </div>

                {/* Status & Subscription Timer */}
                <div className="flex flex-col sm:items-end gap-1.5">
                  {isCompleted ? (
                    <span className="pill-in-stock text-[10px] py-1 px-3">
                      ✓ VAULT UNLOCKED // ACTIVE
                    </span>
                  ) : (
                    <span className="pill-out-stock text-[10px] py-1 px-3 border-amber-500/40 text-amber-400">
                      ⏳ PENDING OPERATOR VERIFICATION
                    </span>
                  )}

                  {order.expiresAt && isCompleted && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-accent)] bg-[var(--color-carbon)] px-2.5 py-1 rounded-[2px] border border-[var(--color-slate)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatCountdown(order.expiresAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Secret Payload Container */}
              {isCompleted ? (
                <div className="space-y-4">
                  
                  <div className="p-4 bg-[var(--color-carbon)] border border-[var(--color-slate)] rounded-[2px] font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-ash)] border-b border-[var(--color-graphite)] pb-2">
                      <span>DECRYPTED CLEARANCE PAYLOAD:</span>
                      <button
                        onClick={() => toggleReveal(order.id)}
                        className="flex items-center gap-1.5 text-white hover:text-[var(--color-accent)]"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>MASK</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                            <span>REVEAL KEY</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative break-all font-mono py-2 text-xs select-all">
                      {isRevealed ? (
                        <div className="text-[var(--color-accent)] whitespace-pre-line leading-relaxed">
                          {payload}
                        </div>
                      ) : (
                        <div className="text-[var(--color-ash)] tracking-widest">
                          ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handleCopy(payload, order.id)}
                      className="btn-signal text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      {copiedKey === order.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>COPIED TO CLIPBOARD</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY CONFIG / KEY</span>
                        </>
                      )}
                    </button>

                    {hasV2RayConfig && (
                      <button
                        onClick={() => handleShowQr(order.connectionConfig!, order.productTitle)}
                        className="btn-outlined text-xs py-2 px-3 flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>GENERATE MOBILE QR</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadBackup(order)}
                      className="btn-outlined text-xs py-2 px-3 flex items-center gap-1.5 text-[var(--color-ash)] border-[var(--color-graphite)] hover:text-white"
                      title="Download as Text File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>BACKUP (.TXT)</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* Pending Verification Notice */
                <div className="p-4 bg-[var(--color-carbon)] border border-dashed border-[var(--color-slate)] rounded-[2px] font-mono text-xs text-[var(--color-smoke)] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold uppercase">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>PAYSLIP SUBMITTED // AWAITING DISPATCH AUDIT</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Our admin verification engine processes uploaded bank transfer slips within 5–15 minutes. Once confirmed, your license key or V2Ray connection profile will automatically decrypt in this vault slot.
                  </p>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* QR Code Inspection Modal */}
      {qrModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card-sharp max-w-sm w-full p-6 bg-[var(--color-onyx)] border-[var(--color-accent)] shadow-[0_0_24px_rgba(197,255,74,0.3)] space-y-4 text-center">
            
            <div className="flex items-center justify-between border-b border-[var(--color-graphite)] pb-3">
              <span className="metadata-stamp text-[10px]">
                [ SCAN TO IMPORT CONFIG ]
              </span>
              <button
                onClick={() => setQrModalContent(null)}
                className="text-[var(--color-ash)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-serif text-lg text-white">
              {qrModalContent.title}
            </h3>

            {/* Rendered QR Image */}
            <div className="p-4 bg-[var(--color-accent)] rounded-[4px] inline-block shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrModalContent.qrDataUrl}
                alt="V2Ray QR Code"
                className="w-56 h-56 mx-auto block"
              />
            </div>

            <p className="text-[11px] font-mono text-[var(--color-smoke)] leading-relaxed">
              Open v2rayNG, Streisand, or Shadowrocket on your mobile device, tap <span className="text-[var(--color-accent)]">&quot;Scan QR Code&quot;</span>, and point your camera here.
            </p>

            <button
              onClick={() => setQrModalContent(null)}
              className="btn-signal w-full py-2.5 text-xs uppercase"
            >
              CLOSE QR TERMINAL
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function VaultPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-[var(--color-ash)]">DECRYPTING KEY VAULT ENGINES...</div>}>
      <VaultContent />
    </Suspense>
  );
}
