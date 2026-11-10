import React from 'react';
import Link from 'next/link';

const STORE_HIGHLIGHTS = [
  { label: 'STEAM & PSN', href: '/catalog?category=giftcard' },
  { label: 'NETFLIX 4K', href: '/catalog?category=subscription' },
  { label: 'CHATGPT & AI', href: '/catalog?category=software' },
  { label: 'FREE FIRE & PUBG', href: '/catalog?category=gaming' },
  { label: 'SPOTIFY & NITRO', href: '/catalog?category=subscription' },
  { label: 'SLT · DIALOG · HUTCH', href: '/v2ray' },
];

export default function TrustBar() {
  return (
    <section className="w-full border-y border-[#292d30] py-8 bg-black">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[#6e727a] mb-6">
          Popular brands &amp; local networks in stock
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
          {STORE_HIGHLIGHTS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-mono text-xs sm:text-sm tracking-wider font-medium text-zinc-400 hover:text-white transition-colors text-center"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
