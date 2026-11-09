'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Laptop, 
  Smartphone, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  ArrowRight,
  Terminal,
  Activity,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Radio,
  Wifi,
  ChevronRight,
  Mail
} from 'lucide-react';

export default function V2RayGuidePage() {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-300">
      
      {/* Header / Hero */}
      <section className="relative pt-12 pb-14 border-b border-[#181820] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1f1f2a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <Terminal className="w-3.5 h-3.5 text-white" />
            <span>SRI LANKA VLESS VPN SETUP GUIDE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            High-speed VLESS VPN Setup Guide
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-medium max-w-2xl">
            Optimised for SLT, Dialog, Hutch &amp; Airtel.
          </p>

          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Instant delivery. Config sent to your email in seconds. Follow these quick steps to import your VLESS configuration into NetMod or v2rayNG.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              href="/v2ray"
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono flex items-center gap-1.5 hover:bg-zinc-200 transition-all shadow"
            >
              <span>← Browse VLESS Packages</span>
            </Link>

            <Link
              href="/v2ray#line-check"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Run Line Check Diagnostic</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Main Guide Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        
        {/* Core Architecture Explanation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold">
            <Layers className="w-4 h-4 text-white" />
            <span>How VLESS Works in Sri Lanka</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            SNI Masquerading &amp; Unlimited ISP Data Bundles
          </h2>

          <div className="p-6 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            <p>
              Sri Lankan telecom operators (Dialog, SLT-Mobitel, Airtel, Hutch) offer zero-rated unlimited packages for specific services like Zoom, Teams, Netflix, or TikTok.
            </p>

            <div className="p-4 rounded-xl bg-[#141419] border border-white/5 font-mono text-xs space-y-2">
              <div className="text-white font-bold flex items-center gap-2">
                <span>The Connection Workflow:</span>
              </div>
              <div className="text-zinc-400 flex flex-col sm:flex-row sm:items-center gap-2 text-[11px]">
                <span className="px-2 py-1 rounded bg-white/10 text-white">Your PC / Mobile (NetMod)</span>
                <span className="text-zinc-600">─►</span>
                <span className="px-2 py-1 rounded bg-white/10 text-white">ISP reads SNI (e.g. zoom.us)</span>
                <span className="text-zinc-600">─►</span>
                <span className="px-2 py-1 rounded bg-[#3ad389]/20 text-[#3ad389] font-bold">VLESS Server</span>
                <span className="text-zinc-600">─►</span>
                <span className="px-2 py-1 rounded bg-white/10 text-white">Unrestricted Web</span>
              </div>
            </div>

            <p>
              Our <strong>VLESS</strong> VPN technology sends traffic with the exact SNI and handshake fingerprints of your active package (such as Zoom or Netflix). The ISP counts your usage under your unlimited package, letting you browse and download freely without burning standard data.
            </p>
          </div>
        </section>

        {/* Section 1: NetMod Syna for Windows */}
        <section id="netmod-pc" className="space-y-6 pt-4 border-t border-[#181820]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1">
              <Laptop className="w-4 h-4 text-white" />
              <span>Section 1</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              NetMod Syna Setup for Windows 10 &amp; 11
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Recommended for PC users who want full-system VPN tunneling with Tun Mode.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">1</span>
                  <span>Install NetMod Syna on Windows</span>
                </h3>
                <a
                  href="https://sourceforge.net/projects/netmod/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1 border border-white/10 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Windows (64-bit)</span>
                </a>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Download and install NetMod Syna. Accept the prompt to install the Wintun driver / TAP adapter so it can tunnel traffic for all your applications.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-2">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">2</span>
                <span>Copy Config from Email</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Open the confirmation email sent to you after checkout (or open your Key Vault). Copy the <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">vless://...</code> link.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-2">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">3</span>
                <span>Import into NetMod Syna</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                In NetMod, go to <strong>Profile</strong> (top menu) → click <strong>&quot;Import from Clipboard&quot;</strong> (or press <kbd className="bg-white/10 px-1 rounded text-white">Ctrl + V</kbd>).
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">4</span>
                <span>Check Tun Mode &amp; Start</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ensure <strong>&quot;Tun Mode&quot;</strong> is checked on the main window. Click <strong>Start</strong>. All browser, download, and desktop traffic will now route cleanly through your VLESS VPN.
              </p>
            </div>

          </div>
        </section>

        {/* Section 2: Android Setup */}
        <section id="netmod-android" className="space-y-6 pt-4 border-t border-[#181820]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1">
              <Smartphone className="w-4 h-4 text-white" />
              <span>Section 2</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              NetMod Syna &amp; v2rayNG Setup for Android
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Quick mobile setup with one-tap clipboard import or camera QR scan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">NetMod Syna (Android)</h3>
              <ol className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">1.</span>
                  <span>Install NetMod Syna from Google Play Store.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">2.</span>
                  <span>Tap Menu (top right) → <strong>Import Config</strong> → <strong>From Clipboard</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">3.</span>
                  <span>Tap <strong>START</strong> and allow the Android VPN connection prompt.</span>
                </li>
              </ol>
            </div>

            <div id="v2rayng" className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-3">
              <h3 className="text-sm font-bold text-white font-mono">v2rayNG (Android)</h3>
              <ol className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">1.</span>
                  <span>Install v2rayNG from Google Play or GitHub.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">2.</span>
                  <span>Tap <strong>+</strong> at the top → choose <strong>Scan QR code</strong> (scan from email) or <strong>Import from Clipboard</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-white">3.</span>
                  <span>Tap the circular <strong>V</strong> connect button at the bottom.</span>
                </li>
              </ol>
            </div>

          </div>
        </section>

        {/* Section 3: Sri Lankan ISP Package Activation Codes */}
        <section id="isp-codes" className="space-y-6 pt-4 border-t border-[#181820]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1">
              <Radio className="w-4 h-4 text-white" />
              <span>Section 3</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Sri Lankan ISP Package Codes &amp; SIM Activation
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Make sure one of these zero-rated unlimited packages is active on your SIM or Router before connecting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Dialog Axiata</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">4G / Router</span>
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div>• <strong>Package:</strong> Work and Learn / Zoom Unlimited</div>
                <div>• <strong>How to Activate:</strong> Dial <code>*678#</code> → Packages → Work &amp; Learn, or via MyDialog App.</div>
                <div>• <strong>Target SNI:</strong> <code>zoom.us</code></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">SLT-Mobitel Fiber</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">Fiber / ADSL</span>
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div>• <strong>Package:</strong> Netflix / YouTube Data Bundle</div>
                <div>• <strong>How to Activate:</strong> Via SLT Broadband Portal or MySLT App.</div>
                <div>• <strong>Target SNI:</strong> <code>netflix.com</code></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Airtel Sri Lanka</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">4G / 5G</span>
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div>• <strong>Package:</strong> TikTok Unlimited 297 or 997</div>
                <div>• <strong>How to Activate:</strong> Reload Rs. 297 (7 Days) or Rs. 997 (30 Days).</div>
                <div>• <strong>Target SNI:</strong> <code>tiktokv.com</code></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Mobitel / Hutch</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">Prepaid / 4G</span>
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <div>• <strong>Mobitel:</strong> Dial <code>#170#</code> → Content Based Plans → Zoom.</div>
                <div>• <strong>Hutch:</strong> Activate Work &amp; Learn pack via Hutch App.</div>
                <div>• <strong>Target SNI:</strong> <code>zoom.us</code></div>
              </div>
            </div>

          </div>
        </section>

        {/* Section 4: Troubleshooting & Line Check Link */}
        <section className="p-6 rounded-2xl bg-[#121217] border border-[#22222c] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Having Connection or Speed Issues?
              </h3>
              <p className="text-xs text-zinc-400">
                Run our real-time diagnostic to check whether your SNI is reaching the server or if your local ISP line is lagging.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/v2ray#line-check"
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              <span>Launch Line Check Diagnostic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/tickets"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-mono transition-all"
            >
              Open Support Ticket
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
