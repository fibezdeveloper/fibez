'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, CreditCard, MailCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: ShoppingBag,
    title: 'Choose Product & Plan',
    description:
      'Pick any VLESS VPN package, official gift card, streaming subscription, game top-up, or software license and add it to your cart.',
    detail: '50+ Digital Products',
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Checkout in LKR or USD',
    description:
      'Complete checkout quickly using Sri Lankan bank transfer with instant receipt slip upload, or pay securely in USD.',
    detail: 'Verified Cloud Slip Storage',
  },
  {
    step: '03',
    icon: MailCheck,
    title: 'Instant Email & Vault Delivery',
    description:
      'Your VLESS config link, QR code, gift card code, or login credentials are sent to your email and unlocked inside your Key Vault.',
    detail: 'Delivered in Seconds',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-24 bg-black border-t border-[#292d30]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Simple Checkout
            </div>
            <h2 className="text-[36px] sm:text-[52px] font-normal leading-[1.12] tracking-[-0.04em] text-white">
              Order in seconds. <br />
              Receive immediately.
            </h2>
            <p className="text-[16px] leading-relaxed text-[#a1a4a5] mt-4">
              No waiting around for manual WhatsApp replies. Every order is tracked, verified, and delivered automatically to your inbox and Key Vault.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/v2ray"
              className="btn-ghost-resend text-xs sm:text-sm px-4 py-2.5"
            >
              <span>Try VLESS VPN Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="resend-card p-8 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-[6px] border border-[#292d30] bg-black flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-mono text-xs text-zinc-500">
                      STEP {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-normal tracking-[-0.03em] text-white mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-[#a1a4a5]">
                    {item.description}
                  </p>
                </div>

                <div className="pt-5 mt-6 border-t border-[#1f2224] font-mono text-xs text-zinc-400">
                  {item.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
