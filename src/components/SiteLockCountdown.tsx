'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Counter } from '@/components/ui/Counter';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Meteors } from '@/components/ui/meteors';
import FibezLogo from '@/components/FibezLogo';
import { useDevicePerf } from '@/lib/use-device-perf';
import { ShieldCheck, Lock, Zap, Radio, Sparkles, ArrowRight } from 'lucide-react';

// Target launch date: December 12, 2026 at 12:00 AM Sri Lanka Time (GMT+5:30)
const LAUNCH_DATE = new Date('2026-12-12T00:00:00+05:30').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isLive: boolean;
}

function calculateTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = LAUNCH_DATE - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isLive: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const totalSeconds = Math.floor(diff / 1000);

  return { days, hours, minutes, seconds, totalSeconds, isLive: false };
}

export function SiteLockCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);
  const [mounted, setMounted] = useState(false);
  const { isLowTier, blurEnabled } = useDevicePerf();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const next = calculateTimeLeft();
      setTimeLeft(next);
      if (next.isLive) window.location.href = '/';
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-between overflow-hidden selection:bg-[#3ad389] selection:text-black px-4 py-8 md:py-12">
      {/* Background Ambient Beams */}
      <BackgroundBeams className="opacity-75" />

      {/* Meteors effect across the dark background */}
      <Meteors number={isLowTier ? 4 : 12} />

      {/* Top Header Badge */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <FibezLogo />
          <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
            Platform Security Gateway
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PRE-LAUNCH LOCK
          </span>
          <Link
            href="/unlock"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono transition-colors"
            title="Authorized Operator Clearance"
          >
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden xs:inline">Operator</span> Unlock
          </Link>
        </div>
      </header>

      {/* Main Countdown Center Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-4xl text-center my-6 md:my-10">
        {/* Release Announcement Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs md:text-sm font-mono text-zinc-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#3ad389]" />
          <span>V2Ray Reality Engine &amp; Storefront Goes Live Dec 12</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-white mb-4">
          The Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Fibez v2</span>
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 mb-8 sm:mb-10 px-2 font-light">
          Our unthrottled Singapore Tier-1 VLESS gateways, SLT Fiber zero-limit routing, and instant digital key delivery are in final calibration.
        </p>

        {/* 4-Box Physics Animated Counter Grid */}
        <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {/* Days */}
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-[#0a0a0c]/80 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
            <div className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-white tracking-tighter">
              {mounted ? (
                <Counter
                  value={timeLeft.days}
                  fontSize={isLowTier ? 42 : 54}
                  fontWeight={700}
                  direction="auto"
                  duration={0.7}
                  bounce={0.2}
                  stagger={0.04}
                  fade={0.3}
                  gap={0}
                  decimals={0}
                  minDigits={2}
                  motionBlur={blurEnabled}
                  tabular
                />
              ) : (
                <span>{String(timeLeft.days).padStart(2, '0')}</span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 mt-2">
              Days
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-[#0a0a0c]/80 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
            <div className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-white tracking-tighter">
              {mounted ? (
                <Counter
                  value={timeLeft.hours}
                  fontSize={isLowTier ? 42 : 54}
                  fontWeight={700}
                  direction="auto"
                  duration={0.7}
                  bounce={0.2}
                  stagger={0.04}
                  fade={0.3}
                  gap={0}
                  decimals={0}
                  minDigits={2}
                  motionBlur={blurEnabled}
                  tabular
                />
              ) : (
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 mt-2">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-[#0a0a0c]/80 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
            <div className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-white tracking-tighter">
              {mounted ? (
                <Counter
                  value={timeLeft.minutes}
                  fontSize={isLowTier ? 42 : 54}
                  fontWeight={700}
                  direction="auto"
                  duration={0.7}
                  bounce={0.2}
                  stagger={0.04}
                  fade={0.3}
                  gap={0}
                  decimals={0}
                  minDigits={2}
                  motionBlur={blurEnabled}
                  tabular
                />
              ) : (
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 mt-2">
              Minutes
            </span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-[#0a0a0c]/80 border border-emerald-500/20 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.06] to-transparent pointer-events-none" />
            <div className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-[#3ad389] tracking-tighter">
              {mounted ? (
                <Counter
                  value={timeLeft.seconds}
                  fontSize={isLowTier ? 42 : 54}
                  fontWeight={700}
                  direction="auto"
                  duration={0.7}
                  bounce={0.2}
                  stagger={0.04}
                  fade={0.3}
                  gap={0}
                  decimals={0}
                  minDigits={2}
                  motionBlur={blurEnabled}
                  tabular
                />
              ) : (
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-emerald-400 mt-2">
              Seconds
            </span>
          </div>
        </div>

        {/* Launch Details Card */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3 rounded-2xl bg-[#111114] border border-white/10 text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-2 text-emerald-400">
            <Radio className="w-4 h-4" />
            <span>Target Launch: December 12, 2026 at 12:00 AM (GMT+5:30)</span>
          </div>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="text-zinc-400">Sri Lanka High-Speed Telemetry Live</span>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-xl text-[11px] font-mono text-zinc-400">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">⚡ 948 Mbps Download</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">🛡️ VLESS Reality TLS</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">🌐 Singapore 35ms Ping</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">🎮 Instant Game Keys</span>
        </div>
      </main>

      {/* Footer Operator Entry */}
      <footer className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-500 font-mono gap-3">
        <div>&copy; 2026 Fibez Digital Store &amp; V2Ray Hub. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link
            href="/unlock"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Operator Access Portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default SiteLockCountdown;
