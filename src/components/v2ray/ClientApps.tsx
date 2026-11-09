'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Laptop, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Cpu, 
  ArrowRight,
  Terminal
} from 'lucide-react';

export default function ClientApps() {
  const clients = [
    {
      name: 'NetMod Syna (Windows)',
      tagline: 'Official Recommended Client for PC',
      badge: 'RECOMMENDED FOR PC',
      platforms: ['Windows 10', 'Windows 11'],
      description: 'The most reliable VLESS client in Sri Lanka. Full system-wide Tun Mode, DNS leak prevention, and fast connection to bypass ISP throttles.',
      keyFeatures: [
        'Full system-wide Tun Mode (tunnels all PC apps)',
        'Built-in SNI payload and custom host header support',
        'Works on Dialog, SLT Fiber, Mobitel, and Airtel',
        'Auto-reconnect with fallback routing',
      ],
      downloads: [
        { label: 'Download Windows (64-bit)', url: 'https://sourceforge.net/projects/netmod/' },
      ],
      guideAnchor: '/v2ray/guide#netmod-pc',
    },
    {
      name: 'NetMod Syna (Android)',
      tagline: 'High-Performance Android Client',
      badge: 'RECOMMENDED FOR ANDROID',
      platforms: ['Android 7.0+'],
      description: 'Native Android client with quick clipboard import, mobile hotspot VPN tethering, and stable background connection.',
      keyFeatures: [
        'One-tap clipboard config import',
        'Hotspot tethering to laptops & smart TVs',
        'Per-app proxy filter rules',
        'Low battery consumption',
      ],
      downloads: [
        { label: 'Google Play Store', url: 'https://play.google.com/store/apps/details?id=com.netmod.syna' },
      ],
      guideAnchor: '/v2ray/guide#netmod-android',
    },
    {
      name: 'v2rayNG',
      tagline: 'Lightweight Mobile VLESS Client',
      badge: 'LIGHTWEIGHT',
      platforms: ['Android', 'iOS / macOS'],
      description: 'Standard VLESS mobile client. Supports instant QR code scanning from your confirmation email and live ping checking.',
      keyFeatures: [
        'One-click QR code camera import',
        'Live round-trip ping latency test',
        'Works with Sing-box & Streisand on iOS',
        'Clean open-source interface',
      ],
      downloads: [
        { label: 'v2rayNG (GitHub Android)', url: 'https://github.com/2dust/v2rayNG/releases' },
        { label: 'Google Play Store', url: 'https://play.google.com/store/apps/details?id=com.v2ray.ang' },
      ],
      guideAnchor: '/v2ray/guide#v2rayng',
    },
  ];

  return (
    <div className="w-full py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-3">
            <Cpu className="w-3.5 h-3.5 text-zinc-300" />
            <span>OPEN-SOURCE STANDARD CLIENTS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Connect with Official Open-Source Clients
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            No bloated proprietary VPN apps. Fibez VLESS VPN configs work directly with trusted industry clients: <strong>NetMod Syna</strong> and <strong>v2rayNG</strong>.
          </p>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {clients.map((client, idx) => (
            <div
              key={idx}
              className="bg-[#0e0e12] border border-[#1f1f26] hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                    {client.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                    {client.platforms.join(' · ')}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-zinc-200 transition-colors">
                  {client.name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5 mb-4">
                  {client.tagline}
                </p>

                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {client.description}
                </p>

                {/* Key Features List */}
                <div className="space-y-2 mb-6 pt-4 border-t border-white/5">
                  {client.keyFeatures.map((feat, fIdx) => (
                    <div key={fIdx} className="text-xs text-zinc-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Buttons & Guide Link */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex flex-col gap-2">
                  {client.downloads.map((dl, dIdx) => (
                    <a
                      key={dIdx}
                      href={dl.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 truncate"
                    >
                      <Download className="w-3 h-3 shrink-0" />
                      <span className="truncate">{dl.label}</span>
                    </a>
                  ))}
                </div>

                <Link
                  href={client.guideAnchor}
                  className="w-full py-2 text-center text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Step-by-Step Setup Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Global Guide Callout Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-[#121217] border border-[#22222c] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                New to NetMod in Sri Lanka?
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Learn how to set up NetMod Syna on PC &amp; Android, import your VLESS config, and pick the right SIM package.
              </p>
            </div>
          </div>

          <Link
            href="/v2ray/guide"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold font-mono flex items-center gap-2 shrink-0 transition-all shadow"
          >
            <span>Read Sri Lanka VLESS Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
