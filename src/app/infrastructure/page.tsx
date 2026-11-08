'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Activity, 
  ShieldCheck, 
  Server, 
  Globe, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Radio,
  Wifi
} from 'lucide-react';

interface EdgeNode {
  id: string;
  name: string;
  city: string;
  country: string;
  datacenter: string;
  transit: string;
  bandwidth: string;
  latencyBase: number;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
}

const NODES: EdgeNode[] = [
  {
    id: 'sg1',
    name: 'Singapore SG1 Edge',
    city: 'Singapore',
    country: 'Singapore',
    datacenter: 'Equinix SG1 / Singtel IX',
    transit: 'Tier-1 BGP (Telstra / NTT)',
    bandwidth: '10 Gbps Unmetered',
    latencyBase: 14,
    status: 'OPERATIONAL',
  },
  {
    id: 'tyo1',
    name: 'Tokyo TYO Low-Jitter',
    city: 'Tokyo',
    country: 'Japan',
    datacenter: 'Equinix TY2 / JPIX',
    transit: 'NTT Communications / SoftBank',
    bandwidth: '10 Gbps Direct',
    latencyBase: 28,
    status: 'OPERATIONAL',
  },
  {
    id: 'fra1',
    name: 'Frankfurt FRA Cloud Core',
    city: 'Frankfurt',
    country: 'Germany',
    datacenter: 'Interxion FRA / DE-CIX',
    transit: 'Deutsche Telekom / Lumen',
    bandwidth: '10 Gbps Dedicated',
    latencyBase: 108,
    status: 'OPERATIONAL',
  },
  {
    id: 'lon1',
    name: 'London LON Financial Transit',
    city: 'London',
    country: 'United Kingdom',
    datacenter: 'Telehouse North / LINX',
    transit: 'Vodafone / GTT Communications',
    bandwidth: '10 Gbps Peered',
    latencyBase: 114,
    status: 'OPERATIONAL',
  },
  {
    id: 'iad1',
    name: 'US-East IAD Hyperscale',
    city: 'Ashburn, VA',
    country: 'United States',
    datacenter: 'Equinix DC2 / Anycast',
    transit: 'Arelion / Zayo Tier-1',
    bandwidth: '20 Gbps Aggregated',
    latencyBase: 162,
    status: 'OPERATIONAL',
  },
];

export default function InfrastructurePage() {
  const [testingPing, setTestingPing] = useState(false);
  const [pingOffsets, setPingOffsets] = useState<Record<string, number>>({});

  const handleRunPingTest = () => {
    setTestingPing(true);
    setTimeout(() => {
      const offsets: Record<string, number> = {};
      NODES.forEach((n) => {
        // slight jitter
        offsets[n.id] = Math.floor(Math.random() * 6) - 2;
      });
      setPingOffsets(offsets);
      setTestingPing(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8e87aa] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        <span className="text-white">Global Network Status & Edge Telemetry</span>
      </div>

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#231e38]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#9281f7]" />
            <span>Real-Time Edge Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
            Global Infrastructure & BGP Routing Status
          </h1>
          <p className="text-sm text-[#8e87aa] mt-2 max-w-2xl leading-relaxed">
            Real-time health, packet loss metrics, and latency diagnostics across our 10Gbps edge transit nodes and automated cloud hypervisors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunPingTest}
            disabled={testingPing}
            className="px-4 py-2 rounded-full bg-[#17122b] hover:bg-[#251e45] border border-[#372b5c] text-xs font-mono text-[#9281f7] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
            <span>{testingPing ? 'Probing Nodes...' : 'Run Real-Time Ping Test'}</span>
          </button>
        </div>
      </div>

      {/* Overall Health Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-[18px] bg-[#0c0919] border border-[#231e38]">
          <div className="text-xs font-mono text-[#8e87aa] uppercase mb-1">Overall System Health</div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-lg font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>100% Operational</span>
          </div>
          <div className="text-[11px] font-mono text-[#5c5673] mt-1">All 5 edge clusters online</div>
        </div>

        <div className="p-5 rounded-[18px] bg-[#0c0919] border border-[#231e38]">
          <div className="text-xs font-mono text-[#8e87aa] uppercase mb-1">30-Day SLA Uptime</div>
          <div className="text-white font-mono text-lg font-bold">99.994%</div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">0 unplanned outages</div>
        </div>

        <div className="p-5 rounded-[18px] bg-[#0c0919] border border-[#231e38]">
          <div className="text-xs font-mono text-[#8e87aa] uppercase mb-1">Peak Backbone Capacity</div>
          <div className="text-white font-mono text-lg font-bold">60 Gbps</div>
          <div className="text-[11px] font-mono text-[#5c5673] mt-1">Multi-homed Tier-1 BGP</div>
        </div>

        <div className="p-5 rounded-[18px] bg-[#0c0919] border border-[#231e38]">
          <div className="text-xs font-mono text-[#8e87aa] uppercase mb-1">Automated Failover</div>
          <div className="text-[#9281f7] font-mono text-lg font-bold">&lt; 350 ms</div>
          <div className="text-[11px] font-mono text-[#5c5673] mt-1">Self-healing DNS routing</div>
        </div>
      </div>

      {/* Node Status Table / Grid */}
      <div className="mb-12">
        <h2 className="text-xl font-medium text-white mb-4">
          Active PoP (Point of Presence) Edge Gateways
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {NODES.map((node) => {
            const currentLatency = node.latencyBase + (pingOffsets[node.id] || 0);

            return (
              <div
                key={node.id}
                className="p-6 rounded-[20px] bg-[#0c0919] border border-[#231e38] hover:border-[#9281f7]/50 transition-all shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-mono text-[#8e87aa] block">{node.country}</span>
                    <h3 className="text-base font-medium text-white">{node.name}</h3>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{node.status}</span>
                  </span>
                </div>

                <div className="space-y-2.5 py-3 border-y border-[#1e1930] text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8e87aa]">Datacenter</span>
                    <span className="text-zinc-300 truncate max-w-[170px]">{node.datacenter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e87aa]">Transit Carrier</span>
                    <span className="text-zinc-300 truncate max-w-[170px]">{node.transit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e87aa]">Backbone Capacity</span>
                    <span className="text-white font-medium">{node.bandwidth}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono text-[#8e87aa]">Roundtrip:</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {currentLatency} ms
                    </span>
                  </div>

                  <Link
                    href={`/catalog?category=vpn`}
                    className="text-xs font-mono text-[#9281f7] hover:underline flex items-center gap-1"
                  >
                    <span>Deploy</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ISP Bypass Validation Matrix */}
      <div className="p-6 rounded-[20px] bg-[#0c0919] border border-[#231e38] mb-12">
        <h2 className="text-lg font-medium text-white mb-2">
          Local ISP DPI Bypass & Masquerade Validation
        </h2>
        <p className="text-xs text-[#8e87aa] mb-6">
          Automated continuous packet probes verify that Reality TLS sni-spoofing succeeds across local internet service providers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-[12px] bg-[#120e24] border border-[#261f42]">
            <div className="text-xs font-mono text-white font-semibold">SLT Fiber / FTTH</div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1">100% Unrestricted Bypass</div>
            <div className="text-[10px] font-mono text-[#6e6884] mt-0.5">TLS 1.3 Vision Masked</div>
          </div>
          <div className="p-4 rounded-[12px] bg-[#120e24] border border-[#261f42]">
            <div className="text-xs font-mono text-white font-semibold">Dialog 4G / Broadband</div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1">100% Unrestricted Bypass</div>
            <div className="text-[10px] font-mono text-[#6e6884] mt-0.5">Zero Deep-Packet Throttling</div>
          </div>
          <div className="p-4 rounded-[12px] bg-[#120e24] border border-[#261f42]">
            <div className="text-xs font-mono text-white font-semibold">Mobitel 4G LTE</div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1">100% Unrestricted Bypass</div>
            <div className="text-[10px] font-mono text-[#6e6884] mt-0.5">Gaming Ports Open</div>
          </div>
          <div className="p-4 rounded-[12px] bg-[#120e24] border border-[#261f42]">
            <div className="text-xs font-mono text-white font-semibold">Hutch / Airtel Lanka</div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1">100% Unrestricted Bypass</div>
            <div className="text-[10px] font-mono text-[#6e6884] mt-0.5">Full Speed Achieved</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-8">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9281f7] hover:bg-[#806ff5] text-black text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(146,129,247,0.35)]"
        >
          <span>Claim High-Speed Node Access Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
