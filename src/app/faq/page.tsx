'use client';

import { useSiteFlag } from '@/lib/use-site-flags';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  HelpCircle, 
  Search, 
  MessageSquare, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Zap,
  LifeBuoy
} from 'lucide-react';
import TechText from '@/components/TechText';
import { FaqAccordion, FaqItem } from '@/components/ui/FaqAccordion';

const ALL_FAQS: FaqItem[] = [
  {
    question: "How fast are VLESS VPN configs and product keys delivered?",
    answer: "Instantly upon payment verification. Your personalized VLESS URI connection string, QR code, or digital gift card keys are immediately delivered to your verified email address and permanently saved in your Fibez Key Vault.",
  },
  {
    question: "Which client applications work with Fibez High-Speed VLESS?",
    answer: "We support NetMod Syna (Windows & Android), v2rayNG (Android), Shadowrocket & Streisand (iOS / iPadOS), and Clash / Sing-box across desktop and mobile. Step-by-step 1-click import guides and auto-updating subscription URLs are provided inside your dashboard.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept Sri Lankan Commercial Bank direct bank transfers (with instant slip upload and automated optical verification), Cryptocurrencies (USDT TRC20, TON, Bitcoin), and Pre-Funded Wallet balances.",
  },
  {
    question: "Which Sri Lankan ISPs and packages are supported?",
    answer: "Our core nodes are specifically engineered and routed for Sri Lankan telecom networks including SLT Fibre & 4G, Dialog Axiata, Hutch, and Airtel. We feature dedicated masquerades for Zoom / Teams, Netflix & YouTube streaming, and TikTok / social packages for unthrottled throughput.",
  },
  {
    question: "What happens if a node or my digital account credentials degrade?",
    answer: "If a line stops working or a pathway degrades, open a support ticket from your Key Vault or Support Ticket Center and we will replace or fix it within the 24-hour replacement window.",
  },
  {
    question: "Can I connect multiple devices simultaneously?",
    answer: "Yes! Depending on your chosen tier (Basic 1 Device, Premium 2 Devices, Private Dedicated 3 Devices), our nodes enforce strict hardware token separation so your bandwidth remains at line-rate without disconnecting your other devices.",
  },
  {
    question: "How does the Pre-Funded Wallet and Referral bonus work?",
    answer: "You can pre-fund your wallet via local bank deposit (/billing) for 1-click instant subscription renewals. Every user also receives a unique referral link (e.g. 7SEOBCQL) that awards Rs 100.00 wallet credit whenever a referred member activates their first line.",
  },
  {
    question: "Do you offer a free trial before purchasing?",
    answer: "Yes! You can claim a free 24-hour test line directly from the V2Ray portal (/v2ray) to verify ping, streaming speeds, and compatibility with your mobile data or home broadband ISP before subscribing.",
  },
  {
    question: "How do I renew my line when it expires?",
    answer: "Lines can be renewed with 1 click directly inside your V2Ray Dashboard (/v2ray/dashboard) using your Pre-Funded Wallet or direct bank transfer. Your UUID and inbound routing parameters remain the same so you don't need to reconfigure your client apps.",
  },
];

export default function FaqPage() {
  const docsOn = useSiteFlag('docs');
  const ticketsOn = useSiteFlag('tickets');
  const whatsappOn = useSiteFlag('whatsapp');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return ALL_FAQS;
    const q = searchQuery.toLowerCase();
    return ALL_FAQS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        (typeof item.answer === 'string' && item.answer.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#a1a4a5] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        {docsOn && (
          <>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          </>
        )}
        <span className="text-white">FAQ</span>
      </div>

      {/* Header */}
      <div className="mb-10 pb-8 border-b border-[#1f1f23]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[11px] uppercase tracking-[0.2em] text-[#3ad389] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389] animate-pulse" />
          <span>Knowledge Base & Support FAQ</span>
        </div>

        <div className="h-[48px] sm:h-[62px] w-full max-w-[560px] relative -ml-1">
          <h1 className="sr-only">Frequently Asked Questions</h1>
          <TechText
            text="Frequently Asked Questions"
            align="left"
            fontWeight={700}
            fontSize={42}
            color="#ffffff"
            accentColor="#3ad389"
            reveal="letter"
            dashLength={4}
            dashGap={2}
            specks={14}
            intro="none"
            clickKick
            guides={false}
          />
        </div>

        <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Quick answers regarding VLESS VPN setup, Sri Lankan ISP routing, key delivery, payment methods, and account guarantees.
        </p>

        {/* Search Bar */}
        <div className="mt-6 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full bg-[#0c0c0e] border border-white/10 focus:border-[#3ad389] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="mb-16">
        {filteredFaqs.length > 0 ? (
          <FaqAccordion items={filteredFaqs} className="py-0" />
        ) : (
          <div className="p-12 text-center rounded-2xl bg-[#0c0c0e] border border-white/10 font-mono text-sm text-zinc-400">
            No matching questions found for &ldquo;{searchQuery}&rdquo;. Try another search term or ask our team directly.
          </div>
        )}
      </div>

      {/* Direct Assistance CTA Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-[#1f1f23]">
        {docsOn && (
        <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3ad389]">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Client Setup Guides</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Detailed step-by-step guides for NetMod Syna, v2rayNG, and Shadowrocket with config links.
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3ad389] hover:underline pt-1"
          >
            <span>Open Setup Tutorials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        )}

        {ticketsOn && (
        <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3ad389]">
            <LifeBuoy className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Support Ticket Center</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Submit an authenticated ticket to report degraded nodes or request immediate key replacements.
          </p>
          <Link
            href="/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3ad389] hover:underline pt-1"
          >
            <span>Open Help Desk Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        )}

        {whatsappOn && (
        <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-white/10 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3ad389]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">24/7 WhatsApp Engineer</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Direct real-time WhatsApp line for configuration assistance and rapid bank transfer verification.
          </p>
          <a
            href="https://wa.me/94771234567"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3ad389] hover:underline pt-1"
          >
            <span>Chat on WhatsApp</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        )}
      </div>
    </div>
  );
}
