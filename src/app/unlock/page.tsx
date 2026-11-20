'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FibezLogo from '@/components/FibezLogo';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Lock, Unlock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export default function UnlockPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);

  // Check current status on load
  useEffect(() => {
    // Check cookie or API status
    fetch('/api/unlock')
      .then((res) => res.json())
      .then((data) => {
        setIsUnlocked(Boolean(data.unlocked));
      })
      .catch(() => {
        const hasCookie = typeof document !== 'undefined' && document.cookie.includes('fibez_unlocked=true');
        setIsUnlocked(hasCookie);
      });
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both operator username and master key.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid operator credentials. Access denied.');
        setIsLoading(false);
        return;
      }

      // Also set client cookie and localStorage fallback
      document.cookie = 'fibez_unlocked=true; path=/; max-age=2592000; SameSite=Lax';
      try {
        localStorage.setItem('fibez_unlocked', 'true');
      } catch {}

      setIsSuccess(true);
      setIsUnlocked(true);

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate clearance. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelock = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/unlock', { method: 'DELETE' });
      document.cookie = 'fibez_unlocked=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      try {
        localStorage.removeItem('fibez_unlocked');
      } catch {}
      setIsUnlocked(false);
      setIsSuccess(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-4 selection:bg-[#3ad389] selection:text-black overflow-hidden">
      {/* Background illumination */}
      <BackgroundBeams className="opacity-60" />

      {/* Top Brand Logo */}
      <div className="relative z-10 mb-8 flex flex-col items-center">
        <FibezLogo />
        <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase mt-2">
          Operator Clearance Terminal
        </span>
      </div>

      {/* Unlock Terminal Card */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0c0c0e]/90 border border-white/10 shadow-2xl backdrop-blur-2xl">
        {/* Glow accent */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#3ad389] to-transparent" />

        {isUnlocked ? (
          <div className="flex flex-col items-center text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#3ad389]">
              <Unlock className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Platform Unlocked</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                You have active operator clearance. You can browse all store pages, test orders, and configure V2Ray nodes.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5 pt-4">
              <Link
                href="/"
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>Enter Storefront</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleRelock}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Re-lock Storefront For Public</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUnlock} className="space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Authorized Access</h2>
                <p className="text-xs text-zinc-400">Pre-release authorization verification</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Clearance verified. Redirecting to Fibez...</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="unlock-username">Operator Username</Label>
              <Input
                id="unlock-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nuthara"
                autoComplete="username"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unlock-password">Master Key</Label>
              <div className="relative">
                <Input
                  id="unlock-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Master unlock key"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Clearance...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate &amp; Unlock</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
              >
                &larr; Back to Public Countdown Screen
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Security notice */}
      <p className="relative z-10 text-[11px] font-mono text-zinc-600 mt-6 text-center">
        Zero-trust clearance • IP rate-limited • Encrypted session token
      </p>
    </div>
  );
}
