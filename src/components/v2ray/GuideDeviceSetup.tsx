'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ExternalLink, Laptop, Monitor, Smartphone, Tv } from 'lucide-react';
import type { DeviceSetupCopy } from '@/lib/v2ray-guide-data';
import { APP_PLATFORM_ORDER, CLIENT_APPS, type AppPlatformId } from '@/lib/v2ray-apps';

const PLATFORM_ICON: Record<AppPlatformId, React.ComponentType<{ className?: string }>> = {
  windows: Monitor,
  mac: Laptop,
  android: Smartphone,
  ios: Smartphone,
};

// Old deep links (#netmod-pc and friends) still land on the right device.
const HASH_TO_PLATFORM: Record<string, AppPlatformId> = {
  '#netmod-pc': 'windows',
  '#netmod-android': 'android',
  '#v2rayng': 'android',
  '#ios-macos': 'ios',
};

export default function GuideDeviceSetup({ copy }: { copy: DeviceSetupCopy }) {
  const [platform, setPlatform] = useState<AppPlatformId>('windows');

  useEffect(() => {
    // Open on the visitor's own device, unless a deep link says otherwise.
    const fromHash = HASH_TO_PLATFORM[window.location.hash];
    if (fromHash) {
      setPlatform(fromHash);
      return;
    }
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) setPlatform('android');
    else if (/iphone|ipad|ipod/i.test(ua)) setPlatform('ios');
    else if (/macintosh|mac os x/i.test(ua)) setPlatform('mac');
  }, []);

  useEffect(() => {
    const onHash = () => {
      const target = HASH_TO_PLATFORM[window.location.hash];
      if (target) setPlatform(target);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const apps = CLIENT_APPS[platform];

  return (
    <div className="space-y-6">
      {/* Device tabs */}
      <div role="tablist" aria-label={copy.title} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {APP_PLATFORM_ORDER.map((id) => {
          const Icon = PLATFORM_ICON[id];
          const active = platform === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPlatform(id)}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-white text-black border-white'
                  : 'bg-[#0e0e12]/80 border-[#1f1f26] text-zinc-300 hover:border-white/30 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{copy.platforms[id]}</span>
            </button>
          );
        })}
      </div>

      {/* Apps for the chosen device */}
      <div className={`grid grid-cols-1 gap-3 ${apps.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {apps.map((app) => (
          <a
            key={`${platform}-${app.name}`}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 rounded-2xl bg-[#0e0e12]/80 border border-[#1f1f26] hover:border-white/30 hover:bg-[#13131a] transition-colors"
          >
            <Image src={app.icon} alt="" width={48} height={48} className="w-12 h-12 rounded-xl shrink-0 bg-white/5" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">{app.name}</div>
              <div className="text-xs text-zinc-400 truncate">
                {app.price ? copy[app.price] : app.subtitle}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 group-hover:text-white shrink-0">
              <span className="hidden sm:inline">{copy.download}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </a>
        ))}
      </div>

      {/* Same three steps for every app */}
      <div className="rounded-2xl bg-[#0e0e12]/80 border border-[#1f1f26] p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">{copy.stepsTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {copy.steps.map((step, i) => (
            <div key={i} className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[11px] font-bold shrink-0">
                  {i + 1}
                </span>
                <span>{step.title}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed pl-7">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2.5 text-xs text-zinc-300 bg-[#09090d] border border-white/10 rounded-xl p-3.5">
          <CheckCircle2 className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
          <span>{copy.tip}</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-zinc-400">
          <Tv className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
          <span>{copy.tvNote}</span>
        </div>
      </div>
    </div>
  );
}
