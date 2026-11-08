'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, ShieldCheck, Scale, ArrowRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8e87aa] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        <span className="text-white">Terms of Service</span>
      </div>

      {/* Header */}
      <div className="mb-12 pb-8 border-b border-[#231e38]">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-2">
          <Scale className="w-3.5 h-3.5" />
          <span>Legal & Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
          Terms of Service & Developer Agreement
        </h1>
        <p className="text-sm text-[#8e87aa] mt-2 leading-relaxed">
          Last revised: November 2026. Please review these terms carefully prior to provisioning digital infrastructure or redeeming licenses through Fibez.
        </p>
      </div>

      {/* Terms Body */}
      <div className="space-y-10 text-sm leading-relaxed text-[#c9c3e0]">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#9281f7]">01.</span>
            <span>Acceptance of Terms</span>
          </h2>
          <p>
            By accessing, browsing, or purchasing digital infrastructure, V2Ray configurations, Cloud VPS virtual machines, software subscriptions, or gaming licenses from Fibez (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Platform&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#9281f7]">02.</span>
            <span>Automated Zero-Trust Delivery & Provisioning</span>
          </h2>
          <p>
            Fibez operates an automated digital delivery engine engineered to mint credentials, configurations, and license keys under 400 milliseconds upon validated payment confirmation. Digital goods are delivered electronically directly into your personal <Link href="/vault" className="text-[#9281f7] hover:underline">Key Vault</Link> and to your designated email address.
          </p>
          <div className="p-4 rounded-[12px] bg-[#0c0919] border border-[#231e38] text-xs font-mono text-[#a1a4a5]">
            <span className="text-emerald-400 font-semibold">Delivery SLA:</span> If automated provisioning fails to dispatch keys within 15 minutes of payment receipt, our automated reconciliation pipeline triggers priority queue dispatch or an immediate wallet refund upon request.
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#9281f7]">03.</span>
            <span>Multi-Currency Billing & Payments</span>
          </h2>
          <p>
            Prices are published in Sri Lankan Rupees (LKR) and United States Dollars (USD). You may toggle currency preferences inside your account settings. All transactions are securely routed through certified payment processors, cryptocurrency smart contract gateways (USDT TRC20, TON, BTC), or local manual bank deposit slips reviewed by our compliance team.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#9281f7]">04.</span>
            <span>100% Replacement Warranty & Availability SLA</span>
          </h2>
          <p>
            All active digital goods include continuous replacement guarantees during their subscribed term:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#a1a4a5] font-mono pl-2">
            <li><strong>V2Ray Nodes:</strong> Instant node rotation or IP migration in the event of upstream carrier blockages.</li>
            <li><strong>Cloud VPS:</strong> 99.99% hardware and hypervisor SLA backed by redundant NVMe storage mirrors.</li>
            <li><strong>Software Subscriptions:</strong> Guaranteed session continuity with replacement slot credentials if third-party provider sessions disconnect.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#9281f7]">05.</span>
            <span>Acceptable Use & Anti-Abuse Standards</span>
          </h2>
          <p>
            You agree not to utilize Fibez infrastructure for:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#a1a4a5] font-mono pl-2">
            <li>Distributed denial-of-service (DDoS) amplification attacks or network probing.</li>
            <li>Unsolicited bulk email dispatch (SPAM) or unauthorized port scanning.</li>
            <li>Distribution of malicious software, ransomware, or infringing materials.</li>
          </ul>
          <p>
            Violations will result in immediate termination of the offending service without eligibility for refund.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#9281f7]">06.</span>
            <span>Limitation of Liability</span>
          </h2>
          <p>
            To the maximum extent permitted by applicable law, Fibez Digital Inc. shall not be liable for any indirect, incidental, punitive, or consequential damages arising out of the use or inability to use our digital assets.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#9281f7]">07.</span>
            <span>Contact & Inquiries</span>
          </h2>
          <p>
            If you have any questions regarding these terms, contact our legal desk at <span className="font-mono text-white">legal@fibez.net</span> or via <a href="https://wa.me/94771234567" className="text-[#9281f7] hover:underline">WhatsApp Support</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
