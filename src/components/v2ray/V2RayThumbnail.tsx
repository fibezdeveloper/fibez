'use client';

import React from 'react';
import { Zap, ShieldCheck, Radio, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import { normalizeIsp, V2RayIsp } from '@/lib/v2ray-catalog';

interface V2RayThumbnailProps {
  isp: V2RayIsp | string;
  title?: string;
  badge?: string;
  inboundPort?: number;
  port?: number;
  sni?: string;
  categoryLabel?: string;
  category?: string;
  packageId?: string;
  hasSriLankanIp?: boolean;
  serverType?: string;
}

function getIspLogoPath(isp: string): string {
  const norm = normalizeIsp(isp);
  switch (norm) {
    case 'Dialog':
      return '/images/isps/dialog.svg';
    case 'SLT':
      return '/images/isps/slt.svg';
    case 'Airtel':
      return '/images/isps/airtel.svg';
    case 'Hutch':
      return '/images/isps/hutch.svg';
    case 'Mobitel':
      return '/images/isps/mobitel.svg';
    default:
      return '/images/isps/dialog.svg';
  }
}

export default function V2RayThumbnail({
  isp,
  title,
  badge,
  inboundPort,
  port,
  categoryLabel,
  category,
  packageId,
  hasSriLankanIp,
  serverType,
}: V2RayThumbnailProps) {
  const safeIsp = normalizeIsp(isp);
  const ispLogo = getIspLogoPath(safeIsp);
  const displayPort = inboundPort ?? port ?? 443;
  const displayCategory = categoryLabel || category || (safeIsp === 'SLT' ? 'Fiber & Broadband' : 'Mobile 4G/5G');
  const isLkIp = serverType === 'LK_IP' || hasSriLankanIp || displayCategory.toLowerCase().includes('lk ip');

  // High-end ISP corporate color themes
  const themeMap: Record<V2RayIsp, {
    accentGlow: string;
    border: string;
    gradient: string;
    glowColor: string;
    badgeBg: string;
    circuitStroke: string;
    networkTag: string;
  }> = {
    Dialog: {
      accentGlow: 'rgba(255, 121, 0, 0.22)',
      border: 'border-orange-500/30 hover:border-orange-500/50',
      gradient: 'from-[#1a0e05] via-[#100803] to-[#070709]',
      glowColor: '#ff7900',
      badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      circuitStroke: 'rgba(255, 121, 0, 0.12)',
      networkTag: 'DIALOG AXIATA NETWORK',
    },
    SLT: {
      accentGlow: 'rgba(0, 180, 235, 0.22)',
      border: 'border-cyan-500/30 hover:border-cyan-500/50',
      gradient: 'from-[#031522] via-[#020b12] to-[#070709]',
      glowColor: '#00b4eb',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      circuitStroke: 'rgba(0, 180, 235, 0.12)',
      networkTag: 'SLT FIBER & BROADBAND',
    },
    Airtel: {
      accentGlow: 'rgba(237, 28, 36, 0.22)',
      border: 'border-rose-500/30 hover:border-rose-500/50',
      gradient: 'from-[#1f0308] via-[#120204] to-[#070709]',
      glowColor: '#ed1c24',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      circuitStroke: 'rgba(237, 28, 36, 0.12)',
      networkTag: 'BHARTI AIRTEL 4G',
    },
    Hutch: {
      accentGlow: 'rgba(255, 102, 0, 0.22)',
      border: 'border-amber-500/30 hover:border-amber-500/50',
      gradient: 'from-[#1c0f00] via-[#0f0800] to-[#070709]',
      glowColor: '#ff6600',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      circuitStroke: 'rgba(255, 102, 0, 0.12)',
      networkTag: 'HUTCH 4G BROADBAND',
    },
    Mobitel: {
      accentGlow: 'rgba(0, 91, 170, 0.25)',
      border: 'border-blue-500/30 hover:border-blue-500/50',
      gradient: 'from-[#031122] via-[#020914] to-[#070709]',
      glowColor: '#005baa',
      badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      circuitStroke: 'rgba(0, 91, 170, 0.12)',
      networkTag: 'SLT MOBITEL MOBILE',
    },
  };

  const theme = themeMap[safeIsp] || themeMap.Dialog;
  const gridPatternId = `grid-${packageId ? packageId.replace(/[^a-zA-Z0-9_-]/g, '_') : safeIsp}-${displayPort}`;

  return (
    <div
      className={`w-full h-44 rounded-2xl bg-gradient-to-br ${theme.gradient} border ${theme.border} relative overflow-hidden flex flex-col justify-between p-4 group/thumb select-none shadow-xl transition-all duration-300`}
    >
      {/* 1. Ambient Carrier Glow Orbs */}
      <div
        className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover/thumb:scale-125"
        style={{ backgroundColor: theme.accentGlow }}
      />
      <div
        className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover/thumb:scale-110"
        style={{ backgroundColor: theme.accentGlow }}
      />

      {/* 2. Crisp Telecom Geometric Grid (Pure SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={gridPatternId}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={theme.circuitStroke}
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
      </svg>

      {/* 3. Top Row: Telecom Network Pill + Live Inbound Port */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389] animate-pulse" />
          <span className="text-[9px] font-mono tracking-wider font-semibold text-zinc-300 uppercase">
            {theme.networkTag}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/10 text-[10px] font-mono text-zinc-300 backdrop-blur-md">
          <Radio className="w-3 h-3 text-[#3ad389]" />
          <span>Port {displayPort}</span>
        </div>
      </div>

      {/* 4. Center Hero: LARGE, HIGH-RESOLUTION OFFICIAL ISP LOGO */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1">
        {/* Prominent White Frosted Logo Showcase Badge */}
        <div className="px-6 py-2.5 rounded-2xl bg-white/95 border border-white/40 shadow-2xl flex items-center justify-center backdrop-blur-md transition-transform duration-300 group-hover/thumb:scale-105">
          <img
            src={ispLogo}
            alt={`${safeIsp} Official Logo`}
            className="h-10 sm:h-11 w-auto max-w-[180px] object-contain drop-shadow-sm"
          />
        </div>

        {/* Category Label below the Logo */}
        <div className="mt-2 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold">
            {displayCategory}
          </span>
        </div>
      </div>

      {/* 5. Bottom Technical Strip: High-Performance Verification Specs */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/10 backdrop-blur-xs">
        <div>
          {badge && (
            <span className="font-bold text-white px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{badge}</span>
            </span>
          )}
        </div>

        <div className="text-zinc-300 font-mono flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
          <span>{isLkIp ? '🇱🇰 Sri Lanka IP' : 'Equinix SG3'}</span>
        </div>
      </div>
    </div>
  );
}
