'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FibezLogo from '@/components/FibezLogo';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Lock, Unlock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function UnlockPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);

  // Check current status on load
  useEffect(() => {
    const hasCookie = typeof document !== 'undefined' && document.cookie.includes('fibez_unlocked=true');
    const hasStorage = typeof localStorage !== 'undefined' && localStorage.getItem('fibez_unlocked') === 'true';

    if (hasCookie || hasStorage) {
      setIsUnlocked(true);
      return;
    }

    fetch('/api/unlock')
      .then((res) => res.json())
      .then((data) => {
        setIsUnlocked(Boolean(data.unlocked));
      })
      .catch(() => {
        setIsUnlocked(false);
      });
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the master unlock password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid master password. Access denied.');
        setIsLoading(false);
        return;
      }

      // Set cookie and localStorage for 1 year
      document.cookie = 'fibez_unlocked=true; path=/; max-age=31536000; SameSite=Lax';
      try {
        localStorage.setItem('fibez_unlocked', 'true');
        window.dispatchEvent(new Event('fibez_unlocked'));
      } catch {}

      setIsSuccess(true);
      setIsUnlocked(true);

      // Perform direct page navigation so all layouts and cookies reload fresh
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please try again.');
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
      window.location.href = '/';
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
                Operator clearance is currently active on this browser.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5 pt-4">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <span>Enter Storefront</span>
                <ArrowRight className="w-4 h-4" />
              </button>

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
                <h2 className="text-base font-semibold text-white">Storefront Unlock</h2>
                <p className="text-xs text-zinc-400">Enter master password to access pre-release</p>
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
                <span>Password verified! Unlocking Fibez...</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="unlock-password">Master Password</Label>
              <div className="relative">
                <Input
                  id="unlock-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password..."
                  autoComplete="current-password"
                  autoFocus
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
                  <span>Verifying Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Website</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
              >
                &larr; Back to Countdown Screen
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
