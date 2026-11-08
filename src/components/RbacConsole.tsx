'use client';

import React, { useState, useEffect } from 'react';
import { copyToClipboardWithToast } from '@/lib/cipher';

export type RbacRole = 'customer' | 'reseller' | 'admin';

export default function RbacConsole() {
  const [role, setRole] = useState<RbacRole>('customer');

  const handleRoleChange = (newRole: RbacRole) => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fibez:rbac-role', { detail: newRole }));
    }
  };

  useEffect(() => {
    const handleExternalRole = (e: any) => {
      if (e.detail && ['customer', 'reseller', 'admin'].includes(e.detail)) {
        setRole(e.detail);
      }
    };
    window.addEventListener('fibez:set-role', handleExternalRole);
    return () => window.removeEventListener('fibez:set-role', handleExternalRole);
  }, []);

  return (
    <section id="rbac-console" className="relative z-40 bg-carbon bg-dot-matrix py-24 lg:py-32 px-4 sm:px-8 border-b border-graphite">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Header + Role Switcher Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-7">
            <div className="metadata-stamp mb-4">
              [ &nbsp; ROLE-BASED ACCESS CONTROL · RBAC ARCHITECTURE &nbsp; ]
            </div>
            <h2 className="font-editorial text-chalk text-[44px] sm:text-[60px] leading-[0.98] tracking-[-0.022em]">
              One dashboard, <span className="italic text-signalLime">three permission tiers.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:items-end justify-end">
            <div className="font-mono text-[10px] tracking-[0.2em] text-ash uppercase mb-2.5">
              SWITCH ACTIVE SESSION ROLE:
            </div>
            <div className="inline-grid grid-cols-3 border border-graphite bg-voidBlack p-1 rounded-[4px] w-full sm:w-auto">
              <button
                onClick={() => handleRoleChange('customer')}
                className={`px-4 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] rounded-[2px] transition-all ${
                  role === 'customer'
                    ? 'bg-signalLime text-voidBlack glow-lime'
                    : 'text-bone hover:text-signalLime'
                }`}
              >
                CUSTOMER
              </button>
              <button
                onClick={() => handleRoleChange('reseller')}
                className={`px-4 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] rounded-[2px] transition-all ${
                  role === 'reseller'
                    ? 'bg-signalLime text-voidBlack glow-lime'
                    : 'text-bone hover:text-signalLime'
                }`}
              >
                RESELLER
              </button>
              <button
                onClick={() => handleRoleChange('admin')}
                className={`px-4 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] rounded-[2px] transition-all ${
                  role === 'admin'
                    ? 'bg-signalLime text-voidBlack glow-lime'
                    : 'text-bone hover:text-signalLime'
                }`}
              >
                ADMIN
              </button>
            </div>
          </div>
        </div>

        {/* RBAC Interactive Dashboard Frame */}
        <div className="border border-graphite bg-voidBlack">
          {/* Top Console Chrome */}
          <div className="px-6 py-4 border-b border-graphite bg-onyx flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-signalLime glow-lime"></span>
              <span className="text-chalk tracking-[0.18em] uppercase">
                {role === 'customer' && 'SESSION // CUSTOMER VAULT (TIER 01 · BUYER)'}
                {role === 'reseller' && 'SESSION // RESELLER WHOLESALE NODE (TIER 02 · PARTNER)'}
                {role === 'admin' && 'SESSION // ROOT ADMIN COMMAND (TIER 03 · SUPERUSER)'}
              </span>
            </div>
            <div className="flex items-center gap-6 text-ash text-[10px] tracking-[0.18em]">
              <span>
                JWT SCOPE:{' '}
                <strong className="text-signalLime">
                  {role === 'customer' && 'vault:read, order:create, node:qr'}
                  {role === 'reseller' && 'api:bulk_mint, sub_users:manage, webhook:sign'}
                  {role === 'admin' && 'root:all, xui_nodes:write, stock_vault:encrypt, rbac:grant'}
                </strong>
              </span>
              <span className="hidden sm:inline">
                WALLET:{' '}
                <strong className="text-chalk">
                  {role === 'customer' && '$142.50 USDT'}
                  {role === 'reseller' && '$2,840.00 CREDIT (35% OFF)'}
                  {role === 'admin' && 'TREASURY: $94,120.00'}
                </strong>
              </span>
            </div>
          </div>

          {/* Dynamic Role View Content */}
          <div className="p-6 sm:p-10 bg-carbon">
            {role === 'customer' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase mb-2">ACTIVE V2RAY TUNNELS</div>
                    <div className="font-mono font-bold text-[36px] sm:text-[40px] text-white tracking-tight leading-none mb-2">
                      03 <span className="text-signalLime text-sm font-semibold tracking-wider font-mono">ONLINE</span>
                    </div>
                    <div className="font-mono text-[12px] text-zinc-300">Bandwidth used: 418 GB / 2,000 GB</div>
                  </div>
                  <div className="p-6 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase mb-2">CLOUD VPS INSTANCES</div>
                    <div className="font-mono font-bold text-[36px] sm:text-[40px] text-white tracking-tight leading-none mb-2">
                      01 <span className="text-signalLime text-sm font-semibold tracking-wider font-mono">RUNNING</span>
                    </div>
                    <div className="font-mono text-[12px] text-zinc-300">epyc-fra02 · 185.212.44.91 (99.99% SLA)</div>
                  </div>
                  <div className="p-6 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase mb-2">SUBSCRIPTIONS &amp; KEYS</div>
                    <div className="font-mono font-bold text-[36px] sm:text-[40px] text-white tracking-tight leading-none mb-2">
                      04 <span className="text-signalLime text-sm font-semibold tracking-wider font-mono">WARRANTIED</span>
                    </div>
                    <div className="font-mono text-[12px] text-zinc-300">Netflix 4K, ChatGPT Plus, Nitro, Steam</div>
                  </div>
                </div>

                <div className="border border-graphite bg-voidBlack">
                  <div className="px-6 py-3.5 border-b border-graphite flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
                    <span>DECRYPTED BUYER DELIVERABLES</span>
                    <span className="text-signalLime">● ZERO-WAIT VAULT</span>
                  </div>
                  <div className="divide-y divide-graphite font-mono text-xs">
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-chalk font-sans font-medium text-sm">VLESS-Reality Singapore CN2-GIA (sg01.fibez.io)</div>
                        <div className="text-ash text-[11px] mt-0.5">UUID: 9f8e7d6c-5b4a-11ef · Port 443 · SNI: cloudflare.com</div>
                      </div>
                      <button
                        onClick={() => copyToClipboardWithToast('VLESS URI', 'vless://9f8e7d6c-5b4a-11ef@sg01.fibez.io:443?security=reality#FIBEZ-SG01')}
                        className="px-4 py-2 border border-signalLime text-signalLime hover:bg-signalLime hover:text-voidBlack rounded-[2px] text-[10px] tracking-[0.18em] uppercase transition-colors"
                      >
                        COPY VLESS URI
                      </button>
                    </div>
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-chalk font-sans font-medium text-sm">KVM Cloud VPS · 8 vCPU AMD EPYC (Frankfurt)</div>
                        <div className="text-ash text-[11px] mt-0.5">IPv4: 185.212.44.91 · Ubuntu 24.04 LTS · Root SSH Ready</div>
                      </div>
                      <button
                        onClick={() => copyToClipboardWithToast('VPS Root Credentials', 'ssh root@185.212.44.91 # Pass: Fbz#99xK!v2')}
                        className="px-4 py-2 border border-graphite bg-onyx text-bone hover:border-signalLime hover:text-signalLime rounded-[2px] text-[10px] tracking-[0.18em] uppercase transition-colors"
                      >
                        COPY ROOT SSH
                      </button>
                    </div>
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-chalk font-sans font-medium text-sm">ChatGPT Plus + Netflix 4K UHD Bundle</div>
                        <div className="text-ash text-[11px] mt-0.5">Auto-replacement warranty active · 28 days remaining</div>
                      </div>
                      <button
                        onClick={() => copyToClipboardWithToast('Subscription Credentials', 'Netflix: nf_uhd@fibez.io / Pass: Fbz#8821 (PIN 4099) | ChatGPT Plus: https://chat.openai.com/invite/fbz-9941a8c')}
                        className="px-4 py-2 border border-graphite bg-onyx text-bone hover:border-signalLime hover:text-signalLime rounded-[2px] text-[10px] tracking-[0.18em] uppercase transition-colors"
                      >
                        REVEAL SEATS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === 'reseller' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase mb-2">WHOLESALE TIER DISCOUNT</div>
                    <div className="font-mono font-bold text-[36px] sm:text-[40px] text-signalLime tracking-tight leading-none mb-2">
                      -35% <span className="text-white text-sm font-semibold font-mono tracking-wider">BULK RATE</span>
                    </div>
                    <div className="font-mono text-[12px] text-zinc-300">Applies to all V2Ray, VPS &amp; Key SKUs</div>
                  </div>
                  <div className="p-6 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase mb-2">API SUB-ACCOUNTS</div>
                    <div className="font-mono font-bold text-[36px] sm:text-[40px] text-white tracking-tight leading-none mb-2">
                      1,284 <span className="text-signalLime text-sm font-semibold font-mono tracking-wider">ACTIVE</span>
                    </div>
                    <div className="font-mono text-[12px] text-zinc-300">Webhook dispatch latency: 190ms avg</div>
                  </div>
                  <div className="p-6 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase mb-2">30D RESELLER MARGIN</div>
                    <div className="font-mono font-bold text-[36px] sm:text-[40px] text-white tracking-tight leading-none mb-2">
                      $6,490 <span className="text-signalLime text-sm font-semibold font-mono tracking-wider">+24%</span>
                    </div>
                    <div className="font-mono text-[12px] text-zinc-300">Automated Telegram &amp; Discord Bot synced</div>
                  </div>
                </div>

                <div className="p-6 bg-graphite border border-iron rounded-[4px] font-mono text-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] tracking-[0.2em] text-signalLime uppercase">RESELLER BULK MINT API ENDPOINT</span>
                    <button
                      onClick={() => copyToClipboardWithToast('Reseller API Key', 'fbz_live_reseller_99481a7c2e10f88b')}
                      className="text-[10px] border border-signalLime px-2.5 py-1 text-signalLime hover:bg-signalLime hover:text-voidBlack transition-colors"
                    >
                      COPY API KEY
                    </button>
                  </div>
                  <pre className="text-bone overflow-x-auto leading-relaxed">
{`POST https://api.fibez.io/v1/reseller/bulk-mint
Authorization: Bearer fbz_live_reseller_99481a7c2e10f88b
{
  "sku": "v2ray-reality-sg01",
  "quantity": 50,
  "custom_sni": "cdn.yourdomain.com",
  "webhook_url": "https://store.yourdomain.com/webhooks/fibez"
}`}
                  </pre>
                </div>
              </div>
            )}

            {role === 'admin' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
                  <div className="p-5 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 uppercase mb-1.5">XRAY / V2RAY CLUSTER</div>
                    <div className="font-mono font-bold text-[32px] sm:text-[36px] text-signalLime tracking-tight leading-none mb-1">42 / 42</div>
                    <div className="font-mono text-[11px] text-zinc-300">Nodes Healthy · 184 Gbps Load</div>
                  </div>
                  <div className="p-5 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 uppercase mb-1.5">KVM HYPERVISORS</div>
                    <div className="font-mono font-bold text-[32px] sm:text-[36px] text-white tracking-tight leading-none mb-1">16 RACKS</div>
                    <div className="font-mono text-[11px] text-zinc-300">FRA / AMS / SG / TYO / NYC</div>
                  </div>
                  <div className="p-5 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 uppercase mb-1.5">ENCRYPTED KEY STOCK</div>
                    <div className="font-mono font-bold text-[32px] sm:text-[36px] text-white tracking-tight leading-none mb-1">14,820</div>
                    <div className="font-mono text-[11px] text-zinc-300">Auto-replenish threshold: 500</div>
                  </div>
                  <div className="p-5 bg-onyx border border-graphite">
                    <div className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 uppercase mb-1.5">RBAC AUDIT LOG</div>
                    <div className="font-mono font-bold text-[32px] sm:text-[36px] text-signalLime tracking-tight leading-none mb-1">0 ALERTS</div>
                    <div className="font-mono text-[11px] text-zinc-300">HSM Key Rotation: Verified</div>
                  </div>
                </div>

                <div className="border border-graphite bg-voidBlack p-6 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-graphite">
                    <span className="text-[10px] tracking-[0.2em] text-signalLime uppercase">LIVE INFRASTRUCTURE &amp; STOCK POOL CONTROLS</span>
                    <button
                      onClick={() => copyToClipboardWithToast('Admin Cluster Command', 'fibez-admin cluster --rebalance-xray --rotate-reality-keys --status ok')}
                      className="bg-signalLime text-voidBlack font-sans font-semibold text-[10px] tracking-[0.18em] uppercase px-4 py-2 rounded-[2px] glow-lime hover:brightness-105 transition-all"
                    >
                      ROTATE REALITY SHORT-IDS ↻
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                    <div className="p-4 bg-onyx border border-graphite">
                      <div className="text-ash mb-1">XRAY-CORE SG-01..08</div>
                      <div className="text-chalk font-semibold mb-2">CPU: 34% · RAM: 41.2 GB</div>
                      <div className="text-signalLime text-[10px]">✓ TLS REALITY HANDSHAKE OK</div>
                    </div>
                    <div className="p-4 bg-onyx border border-graphite">
                      <div className="text-ash mb-1">PROXMOX / KVM FRA-CLUSTER</div>
                      <div className="text-chalk font-semibold mb-2">NVMe Pool: 18.4 TB Free</div>
                      <div className="text-signalLime text-[10px]">✓ CLOUD-INIT TEMPLATES SYNCED</div>
                    </div>
                    <div className="p-4 bg-onyx border border-graphite">
                      <div className="text-ash mb-1">SUBSCRIPTION WARRANTY BOT</div>
                      <div className="text-chalk font-semibold mb-2">Queue: 0 Pending Claims</div>
                      <div className="text-signalLime text-[10px]">✓ IMAP / 2FA SOLVER ONLINE</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
