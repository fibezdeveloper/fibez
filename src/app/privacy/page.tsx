'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Lock, EyeOff, ArrowRight } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#a1a4a5] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        <span className="text-white">Privacy Policy</span>
      </div>

      {/* Header */}
      <div className="mb-12 pb-8 border-b border-[#1f1f23]">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#ffffff] mb-2">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Zero-Knowledge Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
          Privacy Policy & Data Security
        </h1>
        <p className="text-sm text-[#a1a4a5] mt-2 leading-relaxed">
          Effective Date: November 2026. Fibez is committed to zero-trust principles, minimal data collection, and strict non-logging infrastructure.
        </p>
      </div>

      {/* Privacy Body */}
      <div className="space-y-10 text-sm leading-relaxed text-[#a1a4a5]">
        
        {/* Section 1: Strict Zero-Logs Guarantee */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#ffffff]">01.</span>
            <span>Strict Zero-Logs Network Policy</span>
          </h2>
          <p>
            When utilizing Fibez VLESS VPN servers or digital delivery gateways, we enforce an absolute, non-negotiable zero-logging policy. We do not inspect, log, retain, or monitor:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#a1a4a5] font-mono pl-2">
            <li>Browsing history, accessed domains, or destination IP addresses.</li>
            <li>DNS query requests or protocol payload metadata.</li>
            <li>Connection timestamps or source IP bandwidth correlation graphs.</li>
          </ul>
          <p>
            Network traffic is routed entirely in-memory (RAM) with no persistent logging daemons enabled on server nodes.
          </p>
        </section>

        {/* Section 2: Account Data Collected */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#ffffff]">02.</span>
            <span>Data Collected for Order Fulfillment</span>
          </h2>
          <p>
            We collect solely the minimal information essential to manage your account and deliver zero-trust digital goods:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#a1a4a5] font-mono pl-2">
            <li><strong>Account Identity:</strong> Your email address and hashed passwords managed securely by Better Auth.</li>
            <li><strong>Transaction Records:</strong> Order ID, purchased SKU, payment receipt confirmation, and subscription expiration timestamp.</li>
            <li><strong>Key Vault Payloads:</strong> Client-side encrypted license credentials and configuration URIs accessible only when authenticated.</li>
          </ul>
        </section>

        {/* Section 3: Data Security Standards */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#ffffff]">03.</span>
            <span>Data Security & Serverless Encryption</span>
          </h2>
          <p>
            Your account and subscription state is stored in Neon PostgreSQL database clusters featuring:
          </p>
          <div className="p-4 rounded-[12px] bg-[#0c0c0e] border border-[#1f1f23] text-xs font-mono text-[#a1a4a5] space-y-2">
            <div><span className="text-emerald-400 font-semibold">Encryption at Rest:</span> Industry standard AES-256 database volume encryption.</div>
            <div><span className="text-emerald-400 font-semibold">Encryption in Transit:</span> Strict TLS 1.3 encryption across all API handlers and edge routes.</div>
            <div><span className="text-emerald-400 font-semibold">Key Obfuscation:</span> Keys in the personal Key Vault are masked by default and only decrypted in your active browser DOM session.</div>
          </div>
        </section>

        {/* Section 4: Third-Party Processors */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#ffffff]">04.</span>
            <span>Third-Party Payment Processors</span>
          </h2>
          <p>
            We do not store complete credit card numbers or banking secrets on our servers. When executing payments, data is handled by certified gateway partners complying with PCI-DSS Level 1 standards or processed peer-to-peer across decentralized blockchain networks.
          </p>
        </section>

        {/* Section 5: Data Retention & Erasure */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="font-mono text-xs text-[#ffffff]">05.</span>
            <span>Your Rights & Permanent Account Erasure</span>
          </h2>
          <p>
            You retain complete ownership over your digital footprint. At any time, you may request full, permanent deletion of your account, purchase records, and key vault history by emailing <span className="font-mono text-white">privacy@fibez.net</span>. All related database rows are purged within 24 hours.
          </p>
        </section>

      </div>
    </div>
  );
}
