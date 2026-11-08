'use client';

import React, { useState } from 'react';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import ProtocolMarquee from '@/components/ProtocolMarquee';
import VaultArchitectureSection from '@/components/VaultArchitectureSection';
import ComparisonTable from '@/components/ComparisonTable';
import { PRODUCTS } from '@/lib/products-data';
import Link from 'next/link';
import { ShieldCheck, Cpu, KeyRound, Terminal, Lock, Globe2 } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="w-full">
      
      {/* Hero Section with Pointillist Globe & Search */}
      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Infinite Protocol & Security Marquee */}
      <ProtocolMarquee />

      {/* Main Product Catalog Grid */}
      <ProductGrid
        products={PRODUCTS}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />

      {/* Interactive Sliding Rows (zkPass N3 & N9 Architecture) */}
      <VaultArchitectureSection />

      {/* Side-by-Side Paradigm Comparison Matrix (zkPass Ns) */}
      <ComparisonTable />

      {/* Editorial Feature Section: The Fibez Cryptographic Vault (Inspired by zkPass two-column content cards) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-20 border-t border-[var(--color-graphite)]">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Editorial Statement */}
          <div className="space-y-6">
            <div className="metadata-stamp">
              [ VAULT SPECIFICATION // HOW FIBEZ OPERATES ]
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.05] tracking-[-0.02em] text-white">
              Instantaneous delivery,{' '}
              <span className="italic text-[var(--color-accent)]">
                zero intermediaries.
              </span>
            </h2>

            <p className="text-sm leading-relaxed text-[var(--color-smoke)]">
              Traditional marketplaces subject buyers to manual dispatch delays, shared password exposure, and insecure communication channels. Fibez provisions digital goods through an encrypted automated inventory engine.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-serif text-lg">
                  <Cpu className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>Atomic FIFO Vault</span>
                </div>
                <p className="text-xs text-[var(--color-ash)] leading-relaxed">
                  PostgreSQL row locks prevent duplicate key assignment under high concurrency.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-serif text-lg">
                  <Globe2 className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>SNI Bypass Routing</span>
                </div>
                <p className="text-xs text-[var(--color-ash)] leading-relaxed">
                  V2Ray edge nodes configured specifically for Dialog, Mobitel, and SLT networks.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/dashboard/vault" className="btn-outlined text-xs">
                EXPLORE CUSTOMER VAULT DEMO
              </Link>
            </div>
          </div>

          {/* Right Column: Code Block Proof Panel (Directly matching zkPass style reference) */}
          <div className="bg-[var(--color-graphite)] p-6 sm:p-8 rounded-[4px] border border-[var(--color-iron)] font-mono text-xs text-[var(--color-bone)] space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-iron)]">
              <span className="text-[10px] tracking-wider text-[var(--color-ash)] uppercase">
                VAULT_DISPATCH_PROTOCOL.SH
              </span>
              <span className="pill-in-stock text-[9px] py-0.5 px-2">
                ✓ ATOMIC_LOCK_ACTIVE
              </span>
            </div>

            <pre className="text-xs leading-relaxed overflow-x-auto text-[var(--color-bone)] space-y-1">
              <div><span className="text-[var(--color-ash)]"># 1. Initiating order transaction</span></div>
              <div><span className="text-[var(--color-accent)]">BEGIN</span> TRANSACTION ISOLATION LEVEL <span className="text-[#38bdf8]">SERIALIZABLE</span>;</div>
              <div className="text-[var(--color-ash)] mt-2"># 2. Reserving single unassigned stock slot</div>
              <div><span className="text-[var(--color-accent)]">SELECT</span> id <span className="text-[var(--color-accent)]">FROM</span> inventory_items</div>
              <div><span className="text-[var(--color-accent)]">WHERE</span> product_variant = <span className="text-[#fbbf24]">&apos;v2ray-slt-1m&apos;</span></div>
              <div><span className="text-[var(--color-accent)]">FOR UPDATE SKIP LOCKED</span>;</div>
              <div className="text-[var(--color-ash)] mt-2"># 3. Decrypting payload with AES-256-GCM</div>
              <div>payload = <span className="text-[var(--color-accent)]">decrypt</span>(encrypted_bytes, iv, auth_tag);</div>
              <div className="text-[var(--color-ash)] mt-2"># 4. Immediate key dispatch to Key Vault</div>
              <div className="text-[var(--color-accent)]">vault.dispatch(order_ref, payload);</div>
            </pre>

            <div className="pt-3 border-t border-[var(--color-iron)] flex items-center justify-between text-[11px] text-[var(--color-ash)]">
              <span>LATENCY: 0.0028s</span>
              <span className="text-[var(--color-accent)]">ZERO LOG RETENTION</span>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
