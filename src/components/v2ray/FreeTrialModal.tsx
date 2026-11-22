'use client';

import { getDeviceSignals } from '@/lib/device-fp';
import React, { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Zap, 
  Clock, 
  Database, 
  ShieldCheck,
  Laptop,
  UserPlus,
  ArrowRight,
  Lock,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Smartphone
} from 'lucide-react';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TrialPackageOption {
  id: string;
  title: string;
  isp: 'Dialog' | 'SLT' | 'Airtel' | 'Hutch' | 'Mobitel';
  badge: string;
  reloadDesc: string;
  sni: string;
  port: number;
  inboundId: number;
  inboundName: string;
  tag: string;
}

export const TRIAL_PACKAGES: TrialPackageOption[] = [
  {
    id: 'dialog-zoom-router',
    title: 'Dialog Zoom (Router & 4G)',
    isp: 'Dialog',
    badge: '#678# Video Conf',
    reloadDesc: 'Dialog 298 / 724 Zoom & Router pack',
    sni: 'zoom.us',
    port: 443,
    inboundId: 3,
    inboundName: 'Port 443 · Inbound #3 (Dialog Gateway)',
    tag: 'Home Broadband & 4G',
  },
  {
    id: 'dialog-tiktok-sim',
    title: 'Dialog TikTok (Mobile SIM)',
    isp: 'Dialog',
    badge: '297 / 997 TikTok',
    reloadDesc: 'Dialog Rs. 297 / 997 TikTok Unlimited',
    sni: 'm.tiktok.com',
    port: 443,
    inboundId: 3,
    inboundName: 'Port 443 · Inbound #3 (Dialog Gateway)',
    tag: 'Mobile 4G/5G SIM',
  },
  {
    id: 'dialog-social-media',
    title: 'Dialog Social Media Blaster',
    isp: 'Dialog',
    badge: '348 / 488 Social',
    reloadDesc: 'Facebook, Insta & WhatsApp bundle',
    sni: 'm.facebook.com',
    port: 443,
    inboundId: 3,
    inboundName: 'Port 443 · Inbound #3 (Dialog Gateway)',
    tag: 'Social Bundle',
  },
  {
    id: 'slt-zoom-meet-fiber',
    title: 'SLT Fiber Zoom & Meet',
    isp: 'SLT',
    badge: 'Meet / Flash / Pre 235',
    reloadDesc: 'SLT Fiber, 4G & ADSL Meet / Zoom',
    sni: 'teams.microsoft.com',
    port: 445,
    inboundId: 1,
    inboundName: 'Port 445 · Inbound #1 (SLT Meet Gateway)',
    tag: 'Fiber / 4G / ADSL',
  },
  {
    id: 'slt-netflix-entertainment',
    title: 'SLT Netflix & Streaming',
    isp: 'SLT',
    badge: '1,990 Ent. Pack',
    reloadDesc: 'SLT Fiber & 4G Netflix unthrottled',
    sni: 'api.netflix.com',
    port: 444,
    inboundId: 2,
    inboundName: 'Port 444 · Inbound #2 (SLT Netflix Gateway)',
    tag: 'Fiber & 4G',
  },
  {
    id: 'airtel-tiktok-unlimited',
    title: 'Airtel TikTok (297 / 997)',
    isp: 'Airtel',
    badge: '297 / 997 Unlimited',
    reloadDesc: 'Airtel 4G/5G TikTok unlimited pack',
    sni: 'm.tiktok.com',
    port: 443,
    inboundId: 3,
    inboundName: 'Port 443 · Inbound #3 (Singapore SG3)',
    tag: 'Airtel 4G/5G',
  },
  {
    id: 'airtel-youtube-pack',
    title: 'Airtel YouTube (135 / 260)',
    isp: 'Airtel',
    badge: '135 / 260 Pack',
    reloadDesc: 'Airtel 135 / 260 YouTube data reload',
    sni: 'm.youtube.com',
    port: 443,
    inboundId: 3,
    inboundName: 'Port 443 · Inbound #3 (Singapore SG3)',
    tag: 'Airtel 4G/5G',
  },
  {
    id: 'hutch-zoom-work',
    title: 'Hutch Zoom & Work',
    isp: 'Hutch',
    badge: '224 / 494 / 794',
    reloadDesc: 'Hutch 4G Non-Stop Work & Zoom reload',
    sni: 'zoom.us',
    port: 443,
    inboundId: 3,
    inboundName: 'Port 443 · Inbound #3 (Singapore SG3)',
    tag: 'Hutch 4G',
  },
  {
    id: 'mobitel-zoom-sim',
    title: 'Mobitel Zoom & Education',
    isp: 'Mobitel',
    badge: '#170# Education',
    reloadDesc: 'Mobitel Port 4445 (Android IP Hunt)',
    sni: 'gateway.icloud.com',
    port: 4445,
    inboundId: 4,
    inboundName: 'Port 4445 · Inbound #4 (Mobitel Port)',
    tag: 'Mobitel 4G',
  },
];

// Each network wears its own brand colour while it is selected. `on` is the text colour that reads on top of it.
const NETWORK_THEME: Record<string, { accent: string; on: string }> = {
  Dialog: { accent: '#ff7900', on: '#1a0d00' },
  SLT: { accent: '#00b4eb', on: '#00131c' },
  Airtel: { accent: '#ed1c24', on: '#ffffff' },
  Hutch: { accent: '#f5b01a', on: '#1a1000' },
  Mobitel: { accent: '#2f84ff', on: '#ffffff' },
};

export default function FreeTrialModal({ isOpen, onClose }: FreeTrialModalProps) {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [selectedPackageId, setSelectedPackageId] = useState<string>('dialog-zoom-router');
  const [selectedIsp, setSelectedIsp] = useState<TrialPackageOption['isp']>('Dialog');
  const [isLoading, setIsLoading] = useState(false);
  const [trialData, setTrialData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPkg = TRIAL_PACKAGES.find((p) => p.id === selectedPackageId) || TRIAL_PACKAGES[0];
  const networks = Array.from(new Set(TRIAL_PACKAGES.map((p) => p.isp)));
  const networkPackages = TRIAL_PACKAGES.filter((p) => p.isp === selectedIsp);

  const pickNetwork = (isp: TrialPackageOption['isp']) => {
    setSelectedIsp(isp);
    const first = TRIAL_PACKAGES.find((p) => p.isp === isp);
    if (first) setSelectedPackageId(first.id);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { deviceId, fp } = await getDeviceSignals();
      const res = await fetch('/api/v2ray/free-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          fp,
          packageId: selectedPkg.id,
          title: selectedPkg.title,
          isp: selectedPkg.isp,
          sni: selectedPkg.sni,
          port: selectedPkg.port,
          inboundId: selectedPkg.inboundId,
          protocol: 'vless',
          userEmail: session?.user?.email,
          userId: session?.user?.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTrialData(data.trial);
      } else {
        setErrorMsg(data.error || 'Failed to generate trial configuration. Please try again.');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Network error while generating trial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAuthenticated = Boolean(session?.user);
  // Brand colours only while picking a line; the sign-up and success screens keep the Fibez green.
  const theme = isAuthenticated && !trialData ? NETWORK_THEME[selectedIsp] || NETWORK_THEME.Dialog : { accent: '#3ad389', on: '#001a0d' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        style={{ ...( { '--ta': theme.accent, '--ta-on': theme.on } as React.CSSProperties ) }}
        className="relative w-full max-w-xl bg-[#0e0e12] border border-[color-mix(in_srgb,var(--ta)_30%,#23232d)] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-[color-mix(in_srgb,var(--ta)_12%,transparent)] overflow-hidden max-h-[92vh] overflow-y-auto transition-colors duration-300"
      >
        {/* brand glow along the top edge */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,color-mix(in_srgb,var(--ta)_22%,transparent),transparent)]" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ------------------------------------------------------------- */}
        {/* STATE 1: GATED - USER MUST SIGN UP / SIGN IN TO TRY TRIAL     */}
        {/* ------------------------------------------------------------- */}
        {!isAuthenticated && !sessionLoading ? (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 mb-3">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>SIGN UP REQUIRED · 100% FREE TRIAL</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Sign Up to Claim 24-Hour Free Trial
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                To try a free trial you must have an active Fibez account. We link your high-speed VLESS configuration directly to your personal Key Vault so your keys, expiration timer, and setup guides are never lost.
              </p>
            </div>

            {/* Trial Feature Highlights */}
            <div className="p-4 rounded-xl bg-[#131318] border border-[#23232d] space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#3ad389]" />
                <span>What you get in your trial:</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#3ad389] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                  <span><strong>10 GB of fast data</strong> — enough to try streaming, calls and browsing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#3ad389] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                  <span><strong>24 hours free</strong> — your line is ready in seconds</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#3ad389] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                  <span><strong>2 devices at once</strong> — use your phone and PC together</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#3ad389] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                  <span><strong>Saved to Key Vault</strong> — access credentials anytime from your dashboard</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[#3ad389] flex items-center justify-center text-[10px] shrink-0 font-bold">✓</span>
                  <span><strong>Zero payment required</strong> — no credit card or payment slip required</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              <Link
                href="/login?mode=register&callbackUrl=/v2ray?openTrial=true"
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Free Account to Claim</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              <Link
                href="/login?mode=login&callbackUrl=/v2ray?openTrial=true"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-[#141418] hover:bg-[#1a1a20] border border-[#252530] text-zinc-300 hover:text-white text-xs font-mono transition-all flex items-center justify-center gap-2"
              >
                <span>Already have an account? Sign In</span>
              </Link>
            </div>

            <p className="text-[11px] text-zinc-500 text-center font-mono">
              Takes less than 15 seconds. Instant config generation immediately upon sign-up.
            </p>
          </div>
        ) : !trialData ? (
          /* ------------------------------------------------------------- */
          /* STATE 2: AUTHENTICATED - SELECT REAL PACKAGE & GENERATE TRIAL */
          /* ------------------------------------------------------------- */
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white pr-10">
                Get your free 24-hour trial
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Pick the SIM or internet you use. We set up your line in seconds.
              </p>
              <p className="text-xs text-zinc-500 mt-2 truncate">
                Trial will be saved to <span className="text-zinc-300">{session?.user?.email}</span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: network */}
            <div>
              <div className="text-sm font-semibold text-white mb-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--ta)] text-[color:var(--ta-on)] text-[11px] font-bold flex items-center justify-center">1</span>
                Which network do you use?
              </div>
              <div className="flex flex-wrap gap-2">
                {networks.map((isp) => {
                  const active = selectedIsp === isp;
                  return (
                    <button
                      key={isp}
                      type="button"
                      onClick={() => pickNetwork(isp)}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-[var(--ta)] border-[var(--ta)] text-[color:var(--ta-on)]'
                          : 'bg-[#121216] border-[#2a2a33] text-zinc-300 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      {isp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: package */}
            <div>
              <div className="text-sm font-semibold text-white mb-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--ta)] text-[color:var(--ta-on)] text-[11px] font-bold flex items-center justify-center">2</span>
                Which package do you have?
              </div>
              <div className="grid gap-2">
                {networkPackages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-colors ${
                        isSelected
                          ? 'bg-[color-mix(in_srgb,var(--ta)_12%,transparent)] border-[var(--ta)]'
                          : 'bg-[#121216] border-[#22222a] hover:border-zinc-600'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[var(--ta)] bg-[var(--ta)]' : 'border-zinc-600'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--ta-on)]" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white truncate">{pkg.title}</span>
                        <span className="block text-xs text-zinc-400 truncate">{pkg.reloadDesc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What you get */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-[#131318] border border-[#23232d]">
                <Database className="w-4 h-4 text-[var(--ta)] mx-auto mb-1" />
                <div className="text-sm font-bold text-white">10 GB</div>
                <div className="text-[11px] text-zinc-500">data</div>
              </div>
              <div className="p-3 rounded-xl bg-[#131318] border border-[#23232d]">
                <Clock className="w-4 h-4 text-[var(--ta)] mx-auto mb-1" />
                <div className="text-sm font-bold text-white">24 hours</div>
                <div className="text-[11px] text-zinc-500">free access</div>
              </div>
              <div className="p-3 rounded-xl bg-[#131318] border border-[#23232d]">
                <Smartphone className="w-4 h-4 text-[var(--ta)] mx-auto mb-1" />
                <div className="text-sm font-bold text-white">2 devices</div>
                <div className="text-[11px] text-zinc-500">at once</div>
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[var(--ta)] hover:brightness-110 text-[color:var(--ta-on)] font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[color-mix(in_srgb,var(--ta)_30%,transparent)] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[color:var(--ta-on)] border-t-transparent rounded-full animate-spin" />
                    <span>Setting up your line...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Get my free trial</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* STATE 3: TRIAL GENERATED & STORED IN USER'S KEY VAULT        */
          /* ------------------------------------------------------------- */
          <div className="space-y-5 animate-fadeIn">
            
            {/* Vault Synced Notice */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Trial Activated!</strong> Saved to Key Vault for <code className="text-white font-mono">{session?.user?.email}</code>.
                </span>
              </div>
              <Link
                href="/v2ray/dashboard"
                onClick={onClose}
                className="px-2.5 py-1 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-200 text-[11px] font-mono transition-colors flex items-center gap-1 shrink-0 font-bold"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Success Summary Pill */}
            <div className="p-4 rounded-xl bg-[#141419] border border-[#272733] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3ad389]/10 border border-[#3ad389]/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#3ad389]" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">
                    {trialData.title || `VLESS VPN (${trialData.isp})`}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {selectedPkg.reloadDesc}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0e0e12] border border-[#22222a] text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>24 Hours</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0e0e12] border border-[#22222a] text-zinc-300">
                  <Database className="w-3.5 h-3.5 text-[#3ad389]" />
                  <span>10 GB</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0e0e12] border border-[#22222a] text-cyan-300">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2 Devices</span>
                </div>
              </div>
            </div>

            {/* Config String & Copy Box */}
            <div>
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 block mb-2 font-semibold">
                Configuration String (Copy to Clipboard)
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={3}
                  value={trialData.configUri}
                  className="w-full bg-[#121216] border border-[#23232c] rounded-xl p-3 pr-24 text-xs font-mono text-zinc-300 resize-none outline-none focus:border-zinc-500 select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(trialData.configUri)}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-all shadow"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Toggle for Mobile Users */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 font-mono"
                >
                  <QrCode className="w-4 h-4 text-[#3ad389]" />
                  <span className="underline underline-offset-4">
                    {showQr ? 'Hide QR Code' : 'Show Mobile QR Code (Scan with v2rayNG / NetMod)'}
                  </span>
                </button>
              </div>

              {showQr && trialData.qrDataUrl && (
                <div className="p-4 rounded-xl bg-white border border-zinc-300 flex flex-col items-center justify-center max-w-xs mx-auto animate-fadeIn">
                  <img
                    src={trialData.qrDataUrl}
                    alt="Config QR Code"
                    className="w-48 h-48 rounded-lg"
                  />
                  <p className="text-[11px] text-zinc-700 mt-2 text-center font-mono font-medium">
                    Scan with v2rayNG, NetMod Syna, or Nekobox
                  </p>
                </div>
              )}
            </div>

            {/* Quick Setup Instructions */}
            <div className="p-3.5 rounded-xl bg-[#121216] border border-[#22222b]">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2 font-semibold flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#3ad389]" />
                <span>Quick Setup (NetMod Syna &amp; v2rayNG):</span>
              </div>
              <ol className="space-y-1.5 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-white font-bold">1.</span>
                  <span>Click <strong>Copy URI</strong> above or scan the QR Code on your mobile app.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-white font-bold">2.</span>
                  <span>In NetMod Syna (Windows/Android) click <strong>&quot;Import from Clipboard&quot;</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-white font-bold">3.</span>
                  <span>Toggle <strong>Tun Mode ON</strong> in settings and click <strong>Start</strong> to connect!</span>
                </li>
              </ol>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setTrialData(null)}
                className="text-xs font-mono text-zinc-400 hover:text-white underline underline-offset-4"
              >
                ← Test Another Package
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="/v2ray/dashboard"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Open Key Vault</span>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#1d1d24] hover:bg-[#252530] text-zinc-200 text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
