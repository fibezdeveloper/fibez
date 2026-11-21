import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import LineCheck from '@/components/v2ray/LineCheck';

export const metadata: Metadata = {
  title: 'Line Check — Fibez V2Ray',
  description: 'Find out in under a minute whether the problem is your internet or your VLESS line.',
};

export default function LineCheckPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-4">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <Link href="/v2ray" className="hover:text-white transition-colors">V2Ray</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-white">Line Check</span>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Line Check</h1>
        <p className="text-zinc-400 mt-2 max-w-xl">
          VPN not working? Two quick tests show whether the problem is your internet or your line, so you know what to fix.
        </p>
      </header>

      <LineCheck />
    </div>
  );
}
