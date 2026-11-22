'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Laptop, Monitor, Smartphone, Terminal } from 'lucide-react';
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
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Compatible Apps</h2>
          <p className="text-sm text-zinc-400 mt-2">
            Download a recommended client for your device, then import your Fibez config.
          </p>
        </div>

        <div className="space-y-9">
          {APP_PLATFORM_ORDER.map((id) => {
            const platform = { ...PLATFORM_META[id], apps: CLIENT_APPS[id] };
            const Icon = platform.icon;
            return (
              <section key={id}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-5 h-5 text-zinc-300 shrink-0" />
                  <h3 className="text-lg font-bold text-white">{platform.label}</h3>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platform.apps.map((app) => (
                    <a
                      key={`${platform.label}-${app.name}`}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-[#0e0e12]/80 border border-[#1f1f26] hover:border-white/30 hover:bg-[#13131a] transition-colors"
                    >
                      <Image
                        src={app.icon}
                        alt=""
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-xl shrink-0 bg-white/5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">{app.name}</div>
                        {(app.price || app.subtitle) && (
                          <div className="text-xs text-zinc-400 truncate">{app.price ? PRICE_LABEL[app.price] : app.subtitle}</div>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0 transition-colors" />
                    </a>
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
