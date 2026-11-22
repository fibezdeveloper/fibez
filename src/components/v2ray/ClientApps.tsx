'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download, Laptop, Monitor, Smartphone, Terminal } from 'lucide-react';
import { APP_PLATFORM_ORDER, CLIENT_APPS, type AppPlatformId } from '@/lib/v2ray-apps';

const PLATFORM_META: Record<AppPlatformId, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  windows: { label: 'Windows PC', icon: Monitor },
  mac: { label: 'Mac OS', icon: Laptop },
  android: { label: 'Android', icon: Smartphone },
  ios: { label: 'iPhone / iOS', icon: Smartphone },
};

const PRICE_LABEL = { free: 'Free', paid: 'Paid' } as const;

export default function ClientApps() {
  return (
    <div className="w-full py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">V2Ray apps for devices</h2>
          <p className="text-sm text-zinc-400 mt-2">
            Pick your device, install one app, then import your Fibez config.
          </p>
        </div>

        {/* One card per device, apps listed inside */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {APP_PLATFORM_ORDER.map((id) => {
            const platform = { ...PLATFORM_META[id], apps: CLIENT_APPS[id] };
            const Icon = platform.icon;
            return (
              <section
                key={id}
                className="rounded-3xl bg-gradient-to-b from-[#14101f]/90 to-[#0b0a12]/90 border border-[#2a2340] p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 border border-[#8b5cf6]/40 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#c4b5fd]" />
                  </span>
                  <h3 className="text-lg font-bold text-white">{platform.label}</h3>
                  <span className="ml-auto text-[11px] font-mono text-zinc-500">
                    {platform.apps.length} apps
                  </span>
                </div>

                <div className="space-y-2.5">
                  {platform.apps.map((app) => (
                    <div
                      key={`${id}-${app.name}`}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/40 border border-white/5"
                    >
                      <Image
                        src={app.icon}
                        alt=""
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-xl shrink-0 bg-white/5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">{app.name}</div>
                        {(app.price || app.subtitle) && (
                          <div className="text-xs text-zinc-400 truncate">{app.price ? PRICE_LABEL[app.price] : app.subtitle}</div>
                        )}
                      </div>
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-xs font-semibold transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Get</span>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Guide callout */}
        <div className="mt-10 p-6 rounded-2xl bg-[#121217]/80 border border-[#22222c] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">New to this?</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Learn how to import your VLESS config and pick the right SIM package.
              </p>
            </div>
          </div>

          <Link
            href="/v2ray/guide"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold font-mono flex items-center gap-2 shrink-0 transition-all shadow"
          >
            <span>Read the Setup Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
