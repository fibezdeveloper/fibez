'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Laptop, Monitor, Smartphone, Terminal } from 'lucide-react';

interface AppEntry {
  name: string;
  note?: string;
  icon: string;
  url: string;
}

interface Platform {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  apps: AppEntry[];
}

// Where each app is downloaded from. Icons are served from /public/apps.
const APP_STORE = {
  shadowrocket: 'https://apps.apple.com/app/shadowrocket/id932747118',
  npvTunnel: 'https://apps.apple.com/app/npv-tunnel/id1629465476',
  incy: 'https://apps.apple.com/app/incy/id6756943388',
  fairVpn: 'https://apps.apple.com/app/fair-vpn/id1533873488',
} as const;

const PLATFORMS: Platform[] = [
  {
    label: 'Windows PC',
    icon: Monitor,
    apps: [
      { name: 'NetMod', note: 'VPN client (V2Ray / SSH)', icon: '/apps/netmod.png', url: 'https://sourceforge.net/projects/netmod/' },
      { name: 'Netch', note: 'Proxy client', icon: '/apps/netch.png', url: 'https://github.com/netchx/netch/releases' },
    ],
  },
  {
    label: 'Mac OS',
    icon: Laptop,
    apps: [
      { name: 'Fair VPN', note: 'Free', icon: '/apps/fair-vpn.jpg', url: APP_STORE.fairVpn },
      { name: 'Shadowrocket', note: 'Paid', icon: '/apps/shadowrocket.jpg', url: APP_STORE.shadowrocket },
    ],
  },
  {
    label: 'Android',
    icon: Smartphone,
    apps: [
      { name: 'NetMod', note: 'VPN client (V2Ray / SSH)', icon: '/apps/netmod.png', url: 'https://play.google.com/store/apps/details?id=com.netmod.syna' },
      { name: 'v2rayNG', note: 'Proxy client (GitHub)', icon: '/apps/v2rayng.png', url: 'https://github.com/2dust/v2rayNG/releases' },
    ],
  },
  {
    label: 'iPhone / iOS',
    icon: Smartphone,
    apps: [
      { name: 'Npv Tunnel', note: 'Free', icon: '/apps/npv-tunnel.jpg', url: APP_STORE.npvTunnel },
      { name: 'INCY', note: 'Free', icon: '/apps/incy.jpg', url: APP_STORE.incy },
      { name: 'Shadowrocket', note: 'Paid', icon: '/apps/shadowrocket.jpg', url: APP_STORE.shadowrocket },
    ],
  },
];

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
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <section key={platform.label}>
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
                        {app.note && <div className="text-xs text-zinc-400 truncate">{app.note}</div>}
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
