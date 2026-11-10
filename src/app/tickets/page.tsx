import React, { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight, LifeBuoy, ShieldCheck, MessageSquare } from 'lucide-react';
import TicketCenter from '@/components/TicketCenter';

export const metadata = {
  title: 'Support Desk & Ticket System — Fibez',
  description: 'Submit questions, report VLESS connection issues, get replacement keys, or verify bank payment slips.',
};

export default function TicketsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#a1a4a5] mb-8">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-white">Help Desk &amp; Tickets</span>
      </div>

      {/* Header Bar */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#1f1f23]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>24/7 Operations Help Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
            Support Ticket Center
          </h1>
          <p className="text-sm text-[#a1a4a5] mt-2 max-w-2xl leading-relaxed">
            Get help with High-Speed VLESS VPN setup (NetMod &amp; v2rayNG), gift card redemption, subscriptions, and bank slip payment verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16161a] border border-[#26262b] text-xs font-mono text-white">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Avg Response &lt; 15 mins</span>
          </div>
        </div>
      </div>

      {/* Ticket Center Component */}
      <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-[#a1a4a5]">Loading help desk...</div>}>
        <TicketCenter userRole="user" />
      </Suspense>
    </main>
  );
}
