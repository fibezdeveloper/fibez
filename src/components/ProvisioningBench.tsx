'use client';

import React, { useState, useEffect } from 'react';
import { copyToClipboardWithToast, runCipherDecode } from '@/lib/cipher';

interface BenchItem {
  id: number;
  counter: string;
  cmd: string;
  runtime: string;
  tls: string;
  mpc: string;
  zk: string;
}

const BENCH_METADATA: BenchItem[] = [
  {
    id: 0,
    counter: '01 / 04',
    cmd: 'fibez provision --sku v2ray-reality-sg01 --protocol vless-xtls --bandwidth 10gbps',
    runtime: '0.38s',
    tls: '0.11s',
    mpc: '0.19s',
    zk: '0.08s',
  },
  {
    id: 1,
    counter: '02 / 04',
    cmd: 'fibez deploy --instance kvm-epyc-nvme-16g --region de-fra02 --os ubuntu-24.04-lts',
    runtime: '0.74s',
    tls: '0.18s',
    mpc: '0.41s',
    zk: '0.15s',
  },
  {
    id: 2,
    counter: '03 / 04',
    cmd: 'fibez issue-seat --bundle [netflix-4k,chatgpt-plus,discord-nitro] --warranty 30d',
    runtime: '0.42s',
    tls: '0.12s',
    mpc: '0.21s',
    zk: '0.09s',
  },
  {
    id: 3,
    counter: '04 / 04',
    cmd: 'fibez decrypt-key --sku steam-global-uk29 --region global --drm steam-cdkey',
    runtime: '0.29s',
    tls: '0.09s',
    mpc: '0.13s',
    zk: '0.07s',
  },
];

export default function ProvisioningBench() {
  const [activeTab, setActiveTab] = useState(0);
  const [pipelineProgress, setPipelineProgress] = useState({ auth: 100, mint: 100, vault: 100 });
  const [status, setStatus] = useState('DELIVERED');

  const runPipelineAnimation = (tabIndex: number) => {
    setActiveTab(tabIndex);
    setStatus('PROVISIONING');
    setPipelineProgress({ auth: 0, mint: 0, vault: 0 });

    setTimeout(() => {
      setPipelineProgress(prev => ({ ...prev, auth: 100 }));
    }, 40);

    setTimeout(() => {
      setPipelineProgress(prev => ({ ...prev, mint: 100 }));
    }, 180);

    setTimeout(() => {
      setPipelineProgress(prev => ({ ...prev, vault: 100 }));
      setStatus('DELIVERED');
    }, 340);
  };

  const currentItem = BENCH_METADATA[activeTab];

  return (
    <section id="provisioning-bench" className="relative z-40 bg-carbon bg-dot-matrix py-24 lg:py-32 px-4 sm:px-8 border-b border-graphite">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
          <div className="lg:col-span-7">
            <div className="metadata-stamp mb-5">
              [ &nbsp; AUTOMATED FULFILLMENT BENCH &nbsp; ]
            </div>
            <h2 className="font-editorial text-chalk text-[46px] sm:text-[64px] md:text-[75px] leading-[0.98] tracking-[-0.02em]">
              Four verticals, <span className="italic text-signalLime">instant dispatch.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="font-sans text-[13px] sm:text-[14px] text-ash leading-[1.65] max-w-[440px]">
              Select any FIBEZ product line below to watch the automated provisioning pipeline lock encrypted stock, generate credentials, and deliver to the user&apos;s vault in real time.
            </p>
          </div>
        </div>

        {/* Working Bench Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-graphite bg-carbon">
          
          {/* Left Column: 4 Product Vertical Tabs */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-graphite flex flex-col justify-between">
            <div>
              {/* Header Bar */}
              <div className="px-6 py-4 border-b border-graphite flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-ash uppercase">
                <span>CATALOG VERTICALS</span>
                <span className="text-bone">{currentItem.counter}</span>
              </div>

              {/* Vertical 01: VPN & V2Ray Configs */}
              <button
                onClick={() => runPipelineAnimation(0)}
                className={`relative w-full text-left p-6 sm:p-7 border-b border-graphite transition-colors focus:outline-none group ${
                  activeTab === 0 ? 'bg-onyx/60' : 'hover:bg-onyx/30'
                }`}
              >
                <div className={`font-mono text-[10px] tracking-[0.22em] uppercase mb-2 ${activeTab === 0 ? 'text-signalLime' : 'text-ash'}`}>
                  VERTICAL · 01
                </div>
                <div className="font-sans text-[19px] font-medium text-chalk mb-1.5">
                  VPN &amp; V2Ray Configs
                </div>
                <p className="font-sans text-[12px] text-ash leading-[1.5]">
                  VLESS-XTLS Reality, Trojan, &amp; dedicated SNI tunnels with instant QR/URI dispatch.
                </p>
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-signalLime transition-all duration-300"
                  style={{ width: activeTab === 0 ? '100%' : '0%' }}
                />
              </button>

              {/* Vertical 02: Cloud VPS Instances */}
              <button
                onClick={() => runPipelineAnimation(1)}
                className={`relative w-full text-left p-6 sm:p-7 border-b border-graphite transition-colors focus:outline-none group ${
                  activeTab === 1 ? 'bg-onyx/60' : 'hover:bg-onyx/30'
                }`}
              >
                <div className={`font-mono text-[10px] tracking-[0.22em] uppercase mb-2 ${activeTab === 1 ? 'text-signalLime' : 'text-ash'}`}>
                  VERTICAL · 02
                </div>
                <div className="font-sans text-[19px] font-medium text-chalk mb-1.5">
                  Cloud VPS Instances
                </div>
                <p className="font-sans text-[12px] text-ash leading-[1.5]">
                  Dedicated NVMe KVM root servers on AMD EPYC with 10Gbps port &amp; instant SSH.
                </p>
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-signalLime transition-all duration-300"
                  style={{ width: activeTab === 1 ? '100%' : '0%' }}
                />
              </button>

              {/* Vertical 03: Premium Subscriptions */}
              <button
                onClick={() => runPipelineAnimation(2)}
                className={`relative w-full text-left p-6 sm:p-7 border-b border-graphite transition-colors focus:outline-none group ${
                  activeTab === 2 ? 'bg-onyx/60' : 'hover:bg-onyx/30'
                }`}
              >
                <div className={`font-mono text-[10px] tracking-[0.22em] uppercase mb-2 ${activeTab === 2 ? 'text-signalLime' : 'text-ash'}`}>
                  VERTICAL · 03
                </div>
                <div className="font-sans text-[19px] font-medium text-chalk mb-1.5">
                  Premium Subscriptions
                </div>
                <p className="font-sans text-[12px] text-ash leading-[1.5]">
                  Netflix 4K UHD, ChatGPT Plus, Discord Nitro &amp; Spotify seats with auto-warranty.
                </p>
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-signalLime transition-all duration-300"
                  style={{ width: activeTab === 2 ? '100%' : '0%' }}
                />
              </button>

              {/* Vertical 04: Game Keys & Gift Cards */}
              <button
                onClick={() => runPipelineAnimation(3)}
                className={`relative w-full text-left p-6 sm:p-7 transition-colors focus:outline-none group ${
                  activeTab === 3 ? 'bg-onyx/60' : 'hover:bg-onyx/30'
                }`}
              >
                <div className={`font-mono text-[10px] tracking-[0.22em] uppercase mb-2 ${activeTab === 3 ? 'text-signalLime' : 'text-ash'}`}>
                  VERTICAL · 04
                </div>
                <div className="font-sans text-[19px] font-medium text-chalk mb-1.5">
                  Game Keys &amp; Gift Cards
                </div>
                <p className="font-sans text-[12px] text-ash leading-[1.5]">
                  Steam, PlayStation, Xbox &amp; Riot global activation keys from encrypted vaults.
                </p>
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-signalLime transition-all duration-300"
                  style={{ width: activeTab === 3 ? '100%' : '0%' }}
                />
              </button>
            </div>

            {/* Bottom Replay Trigger */}
            <div className="px-6 py-4 border-t border-graphite bg-voidBlack flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-ash uppercase">
              <span>FIBEZ CORE v4.2</span>
              <button
                onClick={() => runPipelineAnimation(activeTab)}
                className="text-signalLime hover:underline flex items-center gap-1.5"
              >
                <span>↻ RE-PROVISION</span>
              </button>
            </div>
          </div>

          {/* Right Column: Terminal Output & Provisioned Payload */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-carbon">
            <div>
              {/* Status Header Bar */}
              <div className="px-6 py-4 border-b border-graphite flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 ${status === 'DELIVERED' ? 'bg-signalLime glow-lime' : 'bg-amber-400'} inline-block`} />
                  <span className="text-bone">{status}</span>
                </div>
                <div className="text-ash">
                  DISPATCH TIME &nbsp;<span className="text-chalk">{currentItem.runtime}</span>
                </div>
              </div>

              {/* CLI Command Prompt Row */}
              <div className="px-6 py-5 border-b border-graphite font-mono text-[12px] sm:text-[13px] overflow-x-auto whitespace-nowrap bg-voidBlack/60">
                <span className="text-signalLime mr-2.5">$</span>
                <span className="text-bone">{currentItem.cmd}</span>
              </div>

              {/* Stepped Pipeline Progress Bar */}
              <div className="px-6 py-4 border-b border-graphite font-mono text-[11px] grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                <div className="sm:col-span-2 text-[10px] tracking-[0.22em] text-ash uppercase">
                  PIPELINE
                </div>
                <div className="sm:col-span-10 grid grid-cols-3 gap-3 items-center">
                  {/* Step 1: AUTH */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-1.5 h-1.5 bg-signalLime shrink-0" />
                    <span className="text-bone text-[10px] tracking-wider">AUTH</span>
                    <span className="text-ash text-[10px]">{currentItem.tls}</span>
                    <div className="flex-1 h-[3px] bg-graphite overflow-hidden">
                      <div
                        className="h-full bg-signalLime transition-all duration-150"
                        style={{ width: `${pipelineProgress.auth}%` }}
                      />
                    </div>
                  </div>
                  {/* Step 2: MINT */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-1.5 h-1.5 bg-signalLime shrink-0" />
                    <span className="text-bone text-[10px] tracking-wider">MINT</span>
                    <span className="text-ash text-[10px]">{currentItem.mpc}</span>
                    <div className="flex-1 h-[3px] bg-graphite overflow-hidden">
                      <div
                        className="h-full bg-signalLime transition-all duration-150"
                        style={{ width: `${pipelineProgress.mint}%` }}
                      />
                    </div>
                  </div>
                  {/* Step 3: VAULT */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-1.5 h-1.5 bg-signalLime shrink-0" />
                    <span className="text-bone text-[10px] tracking-wider">VAULT</span>
                    <span className="text-ash text-[10px]">{currentItem.zk}</span>
                    <div className="flex-1 h-[3px] bg-graphite overflow-hidden">
                      <div
                        className="h-full bg-signalLime transition-all duration-150"
                        style={{ width: `${pipelineProgress.vault}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Provisioned Payload Container */}
            <div className="p-6 sm:p-10 flex-1 flex flex-col justify-between">
              {activeTab === 0 && (
                <div>
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase mb-3">
                      VERTICAL 01 · V2RAY / VLESS-XTLS REALITY TUNNEL
                    </div>
                    <div className="font-editorial text-chalk text-[40px] sm:text-[54px] leading-[1.02] tracking-[-0.02em] mb-6">
                      Singapore CN2-GIA<br />
                      <span className="text-signalLime">10Gbps Reality Node</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 border border-graphite bg-voidBlack mb-6">
                      <div className="sm:col-span-8 p-5 border-b sm:border-b-0 sm:border-r border-graphite">
                        <div className="font-mono text-[9px] tracking-[0.22em] text-ash uppercase mb-1.5">
                          TUNNEL URI (VLESS + XTLS-RPRX-VISION)
                        </div>
                        <div className="font-mono text-[13px] text-signalLime font-medium flex items-center gap-2.5 truncate">
                          <span>→</span>
                          <span className="truncate">vless://9f8e7d6c-5b4a-11ef@sg01.fibez.io:443?security=reality#FIBEZ-SG01</span>
                        </div>
                      </div>
                      <div className="sm:col-span-4 p-5 flex flex-col justify-between">
                        <div className="font-mono text-[9px] tracking-[0.22em] text-ash uppercase mb-1.5">ACTION</div>
                        <button
                          onClick={() => copyToClipboardWithToast('VLESS Reality URI', 'vless://9f8e7d6c-5b4a-11ef@sg01.fibez.io:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=www.cloudflare.com&fp=chrome#FIBEZ-SG01')}
                          className="w-full py-2 bg-signalLime text-voidBlack font-sans text-[11px] font-semibold uppercase tracking-[0.18em] rounded-[2px] hover:brightness-105 transition-all"
                        >
                          COPY VLESS URI
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-graphite font-mono text-[11px]">
                    <div>
                      <div className="text-[9px] tracking-[0.18em] text-ash uppercase mb-1">Protocol</div>
                      <div className="text-bone">VLESS Reality XTLS</div>
                    </div>
                    <div>
                      <div className="text-[9px] tracking-[0.18em] text-ash uppercase mb-1">SNI Camouflage</div>
                      <div className="text-bone">TLS 1.3 / Chrome FP</div>
                    </div>
                    <div>
                      <div className="text-[9px] tracking-[0.18em] text-ash uppercase mb-1">Quota / Speed</div>
                      <div className="text-signalLime">2,000 GB · 10Gbps</div>
                    </div>
                    <div>
                      <div className="text-[9px] tracking-[0.18em] text-ash uppercase mb-1">Client Apps</div>
                      <div className="text-bone">v2rayNG / Streisand</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div>
                        <div className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase mb-2">
                          VERTICAL 02 · DEDICATED KVM NVME CLOUD VPS
                        </div>
                        <div className="font-editorial text-[38px] sm:text-[50px] text-chalk leading-none">
                          epyc-fra02 <span className="text-ash">·</span> <span className="text-signalLime">185.212.44.91</span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboardWithToast('SSH Root Login', 'ssh root@185.212.44.91 -p 22 # Pass: Fbz#99xK!v2')}
                        className="border border-signalLime bg-voidBlack px-4 py-2.5 font-mono text-right hover:bg-signalLime/10 transition-colors"
                      >
                        <div className="text-[9px] tracking-[0.2em] text-signalLime uppercase">✓ KVM ACTIVE</div>
                        <div className="text-[11px] text-chalk">COPY SSH ROOT →</div>
                      </button>
                    </div>

                    <div className="divide-y divide-graphite border-t border-b border-graphite mb-6">
                      <div className="py-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-5">
                          <span className="font-mono text-fog">01</span>
                          <span className="font-sans text-bone">Processor &amp; Cores</span>
                        </div>
                        <div className="flex items-center gap-2.5 font-mono text-chalk">
                          <span>8 vCPU AMD EPYC 9654</span>
                          <span className="text-signalLime border border-signalLime/50 px-1 text-[10px]">✓</span>
                        </div>
                      </div>
                      <div className="py-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-5">
                          <span className="font-mono text-fog">02</span>
                          <span className="font-sans text-bone">Memory &amp; Storage</span>
                        </div>
                        <div className="flex items-center gap-2.5 font-mono text-chalk">
                          <span>16 GB DDR5 · 320 GB NVMe</span>
                          <span className="text-signalLime border border-signalLime/50 px-1 text-[10px]">✓</span>
                        </div>
                      </div>
                      <div className="py-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-5">
                          <span className="font-mono text-fog">03</span>
                          <span className="font-sans text-bone">Network Uplink</span>
                        </div>
                        <div className="flex items-center gap-2.5 font-mono text-chalk">
                          <span>10 Gbps Unmetered + DDoS Shield</span>
                          <span className="text-signalLime border border-signalLime/50 px-1 text-[10px]">✓</span>
                        </div>
                      </div>
                      <div className="py-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-5">
                          <span className="font-mono text-fog">04</span>
                          <span className="font-sans text-bone">Root Credentials</span>
                        </div>
                        <div className="flex items-center gap-2.5 font-mono text-signalLime">
                          <span>root@185.212.44.91 (SSH Key + Pass)</span>
                          <span className="text-signalLime border border-signalLime/50 px-1 text-[10px]">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
                    <span>FULL ROOT KVM · INSTANT OS REBUILD · PTR/RDNS</span>
                    <a href="#rbac-console" className="text-bone hover:text-signalLime">MANAGE IN RBAC CONSOLE →</a>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div>
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                      <div>
                        <div className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase mb-2">
                          VERTICAL 03 · PREMIUM SOFTWARE &amp; STREAMING SUBSCRIPTIONS
                        </div>
                        <div className="font-editorial text-[38px] sm:text-[50px] text-chalk leading-none">
                          3 seats <span className="text-ash">·</span> <span className="text-signalLime">instant activation</span>
                        </div>
                      </div>
                      <div className="border border-graphite bg-voidBlack px-4 py-2.5 font-mono text-right">
                        <div className="text-[9px] tracking-[0.2em] text-ash uppercase">WARRANTY GUARD</div>
                        <div className="text-[11px] text-signalLime">AUTO-REPLACE ACTIVE</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 border border-graphite divide-y md:divide-y-0 md:divide-x divide-graphite bg-voidBlack/50 mb-8">
                      <div className="p-5 flex flex-col justify-between min-h-[172px]">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-fog">01</span>
                          <span className="text-signalLime tracking-[0.16em]">✓ SEAT READY</span>
                        </div>
                        <div className="my-4">
                          <div className="font-mono text-[9px] tracking-[0.2em] text-ash uppercase mb-1.5">STREAMING · UHD</div>
                          <div className="font-editorial text-[26px] text-chalk">Netflix 4K UHD</div>
                        </div>
                        <button
                          onClick={() => copyToClipboardWithToast('Netflix 4K Seat', 'User: vault_nf88@fibez.io | Pass: Nf4K#8821 | Profile PIN: 4099')}
                          className="font-mono text-[10px] text-left text-signalLime hover:underline"
                        >
                          COPY LOGIN + PIN →
                        </button>
                      </div>

                      <div className="p-5 flex flex-col justify-between min-h-[172px]">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-fog">02</span>
                          <span className="text-signalLime tracking-[0.16em]">✓ SEAT READY</span>
                        </div>
                        <div className="my-4">
                          <div className="font-mono text-[9px] tracking-[0.2em] text-ash uppercase mb-1.5">AI WORKSPACE</div>
                          <div className="font-editorial text-[26px] text-chalk">ChatGPT Plus</div>
                        </div>
                        <button
                          onClick={() => copyToClipboardWithToast('ChatGPT Plus Seat', 'Workspace Invite: https://chat.openai.com/invite/fbz-9941a8c | 2FA Token: 718290')}
                          className="font-mono text-[10px] text-left text-signalLime hover:underline"
                        >
                          COPY WORKSPACE TOKEN →
                        </button>
                      </div>

                      <div className="p-5 flex flex-col justify-between min-h-[172px]">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-fog">03</span>
                          <span className="text-signalLime tracking-[0.16em]">✓ GIFT LINK</span>
                        </div>
                        <div className="my-4">
                          <div className="font-mono text-[9px] tracking-[0.2em] text-ash uppercase mb-1.5">COMMUNITY · 2X BOOST</div>
                          <div className="font-editorial text-[26px] text-chalk">Discord Nitro</div>
                        </div>
                        <button
                          onClick={() => copyToClipboardWithToast('Discord Nitro Gift', 'https://discord.gift/fbz9KmP4xQv82Lz1')}
                          className="font-mono text-[10px] text-left text-signalLime hover:underline"
                        >
                          CLAIM GIFT URL →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-[0.2em] text-ash uppercase">
                    <span>PRIVATE PROFILES · ZERO PASSWORD SHARING CONFLICT</span>
                    <a href="#storefront-grid" className="text-bone hover:text-signalLime">BROWSE ALL SUBSCRIPTIONS →</a>
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div>
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase mb-3">
                      VERTICAL 04 · ENCRYPTED GAME KEYS &amp; WALLET CODES
                    </div>
                    <div className="font-editorial text-chalk text-[40px] sm:text-[54px] leading-[1.02] tracking-[-0.02em] mb-6">
                      Global Steam &amp; Riot<br />
                      <span className="text-signalLime">Activation Vault</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 border border-graphite bg-voidBlack mb-6">
                      <div className="sm:col-span-8 p-5 border-b sm:border-b-0 sm:border-r border-graphite">
                        <div className="font-mono text-[9px] tracking-[0.22em] text-ash uppercase mb-1.5">
                          DECRYPTED LICENSE KEY (REGION-FREE GLOBAL)
                        </div>
                        <div className="font-mono text-[16px] text-signalLime font-semibold tracking-[0.14em] flex items-center gap-2.5">
                          <span>→</span>
                          <span>FBZ9X-74KLM-92PQR-W881V</span>
                        </div>
                      </div>
                      <div className="sm:col-span-4 p-5 flex flex-col justify-between">
                        <div className="font-mono text-[9px] tracking-[0.22em] text-ash uppercase mb-1.5">INSTANT CLAIM</div>
                        <button
                          onClick={() => copyToClipboardWithToast('Steam Global Key', 'FBZ9X-74KLM-92PQR-W881V')}
                          className="w-full py-2 bg-signalLime text-voidBlack font-sans text-[11px] font-semibold uppercase tracking-[0.18em] rounded-[2px] hover:brightness-105 transition-all"
                        >
                          COPY CD-KEY
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-graphite font-mono text-[11px]">
                    <div>
                      <div className="text-[9px] tracking-[0.18em] text-ash uppercase mb-1">Platforms</div>
                      <div className="text-bone">Steam / PSN / Xbox</div>
                    </div>
                    <div>
                      <div className="text-[9px] tracking-[0.18em] text-ash uppercase mb-1">Stock Encryption</div>
                      <div className="text-bone">AES-256-GCM</div>
                    </div>
                    <div>
                      <div className="text-[9px] tracking-[0.18em] text-ash uppercase mb-1">Region Lock</div>
                      <div className="text-signalLime">Global / Worldwide</div>
                    </div>
                    <div>
                      <div className="text-[9px] tracking-[0.18em] text-ash uppercase mb-1">Batch API</div>
                      <div className="text-bone">Reseller Webhook</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
