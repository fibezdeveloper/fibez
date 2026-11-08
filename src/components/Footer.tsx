import React from 'react';
import Link from 'next/link';
import FibezLogo from '@/components/FibezLogo';

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-[#292d30] py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Top Row: Brand & Status Dot */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-10 border-b border-[#1f2224] gap-6">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <FibezLogo withVersion={true} />
          </Link>

          {/* Resend Status Indicator Dot */}
          <Link href="/infrastructure" className="flex items-center gap-2 font-mono text-xs text-[#a1a4a5] hover:text-white transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#3ad389] animate-pulse" />
            <span>All systems operational · 10Gbps edge transit active</span>
          </Link>
        </div>

        {/* Bottom Row: Links & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#a1a4a5]">
            <Link href="/catalog" className="hover:text-white transition-colors">Products</Link>
            <Link href="/vault" className="hover:text-white transition-colors">Key Vault</Link>
            <Link href="/infrastructure" className="hover:text-white transition-colors">Infrastructure</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <a href="https://wa.me/94771234567" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Support</a>
          </div>

          <div className="font-mono text-xs text-[#6e727a]">
            © 2026 FIBEZ DIGITAL INC. ALL RIGHTS RESERVED.
          </div>

        </div>

      </div>
    </footer>
  );
}
