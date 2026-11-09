'use client';

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
  AlertCircle
} from 'lucide-react';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FreeTrialModal({ isOpen, onClose }: FreeTrialModalProps) {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [selectedIsp, setSelectedIsp] = useState('Dialog');
  const [isLoading, setIsLoading] = useState(false);
  const [trialData, setTrialData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isps = [
    { id: 'Dialog', label: 'Dialog Axiata', desc: 'Zoom & Router (*678#)' },
    { id: 'SLT', label: 'SLT Fiber', desc: 'Netflix & Streaming' },
    { id: 'Airtel', label: 'Airtel 4G/5G', desc: 'TikTok 297/997 Unlimited' },
    { id: 'Mobitel', label: 'Mobitel', desc: 'Zoom1 & Higher Education' },
    { id: 'Hutch', label: 'Hutch 4G', desc: 'Zoom & Non-stop Work' },
    { id: 'Direct', label: 'Direct (Global)', desc: 'Unmetered browsing' },
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v2ray/free-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isp: selectedIsp,
          protocol: 'vless',
          userEmail: session?.user?.email,
          userId: session?.user?.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTrialData(data.trial);
      } else {
        setErrorMsg(data.error || 'Failed to generate trial config. Please try again.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0e0e12] border border-[#23232d] rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        
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
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>What you get in your trial:</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] shrink-0">✓</span>
                  <span><strong>24 Hours Unmetered Access</strong> on Singapore 10Gbps Tier-1 backbone</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] shrink-0">✓</span>
                  <span><strong>Saved to Key Vault</strong> — access credentials anytime from your dashboard</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] shrink-0">✓</span>
                  <span><strong>Optimized SNI Masks</strong> for Dialog, SLT Fiber, Airtel, Mobitel &amp; Hutch</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] shrink-0">✓</span>
                  <span><strong>Zero payment required</strong> — no credit card, no phone number verification</span>
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
          /* STATE 2: AUTHENTICATED - SELECT ISP & GENERATE TRIAL         */
          /* ------------------------------------------------------------- */
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AUTHENTICATED · NO PAYMENT REQUIRED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Generate 24-Hour Free VLESS Trial
              </h2>
              <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-[#141418] border border-[#23232d] text-xs font-mono text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Claiming trial as: <strong className="text-white">{session?.user?.email}</strong></span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Select ISP */}
            <div>
              <label className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 block mb-3 font-semibold">
                Select Your Sri Lankan Network / Package
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {isps.map((isp) => (
                  <button
                    key={isp.id}
                    type="button"
                    onClick={() => setSelectedIsp(isp.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedIsp === isp.id
                        ? 'bg-white text-black border-white'
                        : 'bg-[#141418] border-[#24242e] text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm">{isp.label}</div>
                    <div className={`text-[10px] mt-0.5 truncate ${selectedIsp === isp.id ? 'text-zinc-700' : 'text-zinc-500'}`}>
                      {isp.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Generating VLESS Configuration...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Generate 24-Hour VLESS Trial Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* STATE 3: TRIAL GENERATED & STORED IN USER'S KEY VAULT        */
          /* ------------------------------------------------------------- */
          <div className="space-y-6 animate-fadeIn">
            
            {/* Vault Synced Notice */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Trial Activated!</strong> Linked to <code className="text-white font-mono">{session?.user?.email}</code> &amp; saved in your Key Vault.
                </span>
              </div>
              <Link
                href="/vault"
                onClick={onClose}
                className="px-2.5 py-1 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-200 text-[11px] font-mono transition-colors flex items-center gap-1 shrink-0"
              >
                <span>View Vault</span>
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
                    Trial Active: VLESS VPN ({trialData.isp})
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    SNI: {trialData.sni} · Ref: {trialData.id}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>24 Hours</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Database className="w-4 h-4 text-zinc-400" />
                  <span>{trialData.bandwidthLimit}</span>
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
                  className="w-full bg-[#121216] border border-[#23232c] rounded-xl p-3 pr-24 text-xs font-mono text-zinc-300 resize-none outline-none focus:border-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(trialData.configUri)}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-white text-black font-medium text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-all shadow"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
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
                  <QrCode className="w-4 h-4" />
                  <span>{showQr ? 'Hide QR Code' : 'Show Mobile QR Code (v2rayNG / NetMod)'}</span>
                </button>
              </div>

              {showQr && trialData.qrDataUrl && (
                <div className="p-4 rounded-xl bg-white border border-zinc-300 flex flex-col items-center justify-center max-w-xs mx-auto">
                  <img
                    src={trialData.qrDataUrl}
                    alt="Config QR Code"
                    className="w-48 h-48 rounded-lg"
                  />
                  <p className="text-[11px] text-zinc-600 mt-2 text-center font-mono">
                    Scan with v2rayNG or NetMod Syna on Android
                  </p>
                </div>
              )}
            </div>

            {/* Quick 3-Step Setup Advice */}
            <div className="p-4 rounded-xl bg-[#121216] border border-[#22222b]">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 mb-3 font-semibold flex items-center gap-2">
                <Laptop className="w-4 h-4" />
                <span>How to use in NetMod Syna:</span>
              </div>
              <ol className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-white font-bold">1.</span>
                  <span>Copy the VLESS config link above.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-white font-bold">2.</span>
                  <span>Open NetMod Syna on Windows/Android and click <strong>&quot;Import from Clipboard&quot;</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-white font-bold">3.</span>
                  <span>Ensure <strong>Tun Mode</strong> is checked in NetMod and press <strong>Start</strong>.</span>
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
                ← Test Another Network
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="/vault"
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
