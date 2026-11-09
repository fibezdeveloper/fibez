'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  RefreshCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Mail, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  FileText
} from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#a1a4a5] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        <span className="text-white">Refund & Return Policy</span>
      </div>

      {/* Header */}
      <div className="mb-12 pb-8 border-b border-[#1f1f23]">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white mb-2">
          <RefreshCcw className="w-3.5 h-3.5 text-white" />
          <span>Customer Protection & Warranty</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
          Refund & Return Policy
        </h1>
        <p className="text-sm text-[#a1a4a5] mt-2 leading-relaxed">
          Effective date: November 2026 · Official digital goods fulfillment agreement for Fibez.
        </p>
      </div>

      {/* Core Policy Highlight Banner */}
      <div className="p-6 rounded-[18px] bg-[#0c0c0e] border border-[#1f1f23] mb-10 space-y-4">
        <div className="flex items-center gap-2.5 text-white font-mono text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Digital Nature of Products</span>
        </div>
        <p className="text-base text-zinc-200 leading-relaxed font-normal">
          Due to the instant and digital nature of our products, <strong className="text-white font-semibold">all sales are final</strong>. We do not offer refunds once a digital product has been delivered and revealed.
        </p>
      </div>

      {/* When Replacement or Refund is Offered */}
      <div className="space-y-6 mb-12">
        <h2 className="text-xl font-medium text-white flex items-center gap-2">
          <span>Eligible Replacement & Refund Cases</span>
        </h2>
        <p className="text-sm text-[#a1a4a5]">
          However, we will offer a replacement or refund in the following cases:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Case 1 */}
          <div className="p-5 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-mono text-xs font-bold">
              01
            </div>
            <h3 className="text-sm font-semibold text-white">
              Invalid or Used Key
            </h3>
            <p className="text-xs text-[#a1a4a5] leading-relaxed">
              The product code/key is invalid or already used. <strong className="text-white">Must be reported within 24 hours of delivery.</strong>
            </p>
          </div>

          {/* Case 2 */}
          <div className="p-5 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
              02
            </div>
            <h3 className="text-sm font-semibold text-white">
              Delivery Failure
            </h3>
            <p className="text-xs text-[#a1a4a5] leading-relaxed">
              We were unable to deliver the product after payment was confirmed by our automated gateway or bank reconciliation team.
            </p>
          </div>

          {/* Case 3 */}
          <div className="p-5 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
              03
            </div>
            <h3 className="text-sm font-semibold text-white">
              Duplicate Charge
            </h3>
            <p className="text-xs text-[#a1a4a5] leading-relaxed">
              A duplicate charge occurred on your account due to a gateway timeout or network error during checkout processing.
            </p>
          </div>
        </div>
      </div>

      {/* How to Request Section */}
      <div className="p-8 rounded-[20px] bg-[#0c0c0e] border border-white/10 mb-12 space-y-6">
        <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider">
          <Mail className="w-4 h-4 text-white" />
          <span>How to Request a Replacement or Refund</span>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          To request a refund or replacement, contact us at{' '}
          <a 
            href="mailto:support@fibez.store" 
            className="text-white underline underline-offset-4 font-mono font-medium hover:text-zinc-300 transition-colors"
          >
            support@fibez.store
          </a>{' '}
          with your order number and proof of the issue.
        </p>

        <div className="space-y-3 pt-2 border-t border-[#1f1f23]">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Required Verification Proof:
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-[#a1a4a5]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Fibez Order Number (e.g. FBZ-ORD-...)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Account email used at checkout</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Full screenshot showing exact error code</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Timestamp on official redemption portal</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4">
          <a
            href="mailto:support@fibez.store?subject=Refund%20or%20Replacement%20Request"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold text-xs font-mono uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email support@fibez.store</span>
          </a>
          <a
            href="https://wa.me/94771234567"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
          >
            <span>Live WhatsApp Desk</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>
      </div>

      {/* SLA Timeline */}
      <div className="space-y-4 text-xs font-mono text-[#a1a4a5]">
        <div className="flex items-center gap-2 text-white text-sm font-sans font-medium">
          <Clock className="w-4 h-4 text-white" />
          <span>Resolution Timeline & SLA</span>
        </div>
        <p className="text-sm font-sans leading-relaxed text-[#a1a4a5]">
          All replacement requests for reported defective codes within the 24-hour guarantee window are reviewed by our operations desk with a target resolution window under 2 hours. If a valid replacement key cannot be issued within 12 hours, a full refund to your original payment method or instant account credit will be automatically processed.
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-8 border-t border-[#1f1f23] flex items-center justify-between text-xs font-mono text-[#a1a4a5]">
        <Link href="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>Terms of Service</span>
        </Link>
        <Link href="/cart" className="hover:text-white transition-colors flex items-center gap-1.5">
          <span>Back to Shopping Cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
