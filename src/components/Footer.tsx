import React from 'react';
import Link from 'next/link';
import FibezLogo from '@/components/FibezLogo';

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-[#292d30] py-14">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Top Row: Brand & Status Dot */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-10 border-b border-[#1f2224] gap-6">
          <FibezLogo withVersion={true} />

          {/* Resend Status Indicator Dot */}
          <div className="flex items-center gap-2 font-mono text-xs text-[#a1a4a5]">
            <span className="w-2 h-2 rounded-full bg-[#3ad389]" />
            <span>All systems operational · Neon PostgreSQL active</span>
          </div>
        </div>

        {/* Bottom Row: Links & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#a1a4a5]">
            <a href="#catalog" className="hover:text-white transition-colors">Products</a>
            <a href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</a>
            <a href="#api" className="hover:text-white transition-colors">API Docs</a>
            <a href="#catalog" className="hover:text-white transition-colors">Key Vault</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
          </div>

          <div className="font-mono text-xs text-[#6e727a]">
            © 2026 FIBEZ DIGITAL INC. ALL RIGHTS RESERVED.
          </div>

        </div>

      </div>
    </footer>
  );
}
