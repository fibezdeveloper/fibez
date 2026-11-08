'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext';
import { KeyRound, ShieldCheck, MessageCircle, Menu, X, Terminal } from 'lucide-react';

export default function Navbar() {
  const { currency, toggleCurrency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--color-void-black)]/95 backdrop-blur-md border-b border-[var(--color-graphite)] transition-all">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Wordmark & Emblem */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-[4px] overflow-hidden bg-[var(--color-onyx)] border border-[var(--color-graphite)] flex items-center justify-center group-hover:border-[var(--color-accent)] transition-colors">
            <Image
              src="/brand/fibez-logo-dark.png"
              alt="Fibez Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-[-0.03em] font-normal text-white group-hover:text-[var(--color-accent)] transition-colors">
              FIBEZ
            </span>
            <span className="text-[9px] tracking-[0.24em] uppercase text-[var(--color-ash)] -mt-1 font-mono">
              AUTOMATED VAULT
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium tracking-[0.14em] uppercase">
          <Link
            href="/#catalog"
            className="text-[var(--color-bone)] hover:text-[var(--color-accent)] transition-colors"
          >
            CATALOG
          </Link>
          <Link
            href="/#v2ray"
            className="text-[var(--color-bone)] hover:text-[var(--color-accent)] transition-colors"
          >
            V2RAY / VPN
          </Link>
          <Link
            href="/#vps"
            className="text-[var(--color-bone)] hover:text-[var(--color-accent)] transition-colors"
          >
            CLOUD VPS
          </Link>
          <Link
            href="/#subscriptions"
            className="text-[var(--color-bone)] hover:text-[var(--color-accent)] transition-colors"
          >
            SUBSCRIPTIONS
          </Link>
          <Link
            href="/#gaming"
            className="text-[var(--color-bone)] hover:text-[var(--color-accent)] transition-colors"
          >
            GAME KEYS
          </Link>
        </nav>

        {/* Action Controls & Utilities */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Currency Toggle */}
          <button
            onClick={toggleCurrency}
            className="px-2.5 py-1 text-[11px] font-mono tracking-wider bg-[var(--color-onyx)] border border-[var(--color-graphite)] hover:border-[var(--color-accent)] text-white rounded transition-colors"
            title="Switch Currency (USD / LKR)"
          >
            <span className={currency === 'LKR' ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-ash)]'}>
              LKR
            </span>
            <span className="text-[var(--color-slate)] mx-1">/</span>
            <span className={currency === 'USD' ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-ash)]'}>
              USD
            </span>
          </button>

          {/* WhatsApp Direct Assist */}
          <a
            href="https://wa.me/?text=Hello%20Fibez%20Support,%20I%20have%20an%20inquiry%20regarding%20orders."
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[var(--color-ash)] hover:text-[var(--color-accent)] hover:bg-[var(--color-onyx)] rounded transition-colors"
            title="WhatsApp Support & Inquiries"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
          </a>

          {/* Key Vault CTA */}
          <Link
            href="/dashboard/vault"
            className="btn-outlined text-[12px] py-1.5 px-3 flex items-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>[ KEY VAULT ]</span>
          </Link>

          {/* Admin Command Portal */}
          <Link
            href="/admin"
            className="text-[11px] font-mono tracking-wider text-[var(--color-ash)] hover:text-white px-2 py-1 border border-transparent hover:border-[var(--color-graphite)] rounded flex items-center gap-1.5 transition-colors"
            title="Admin Command Center"
          >
            <Terminal className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>ADMIN</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggleCurrency}
            className="px-2 py-1 text-[10px] font-mono bg-[var(--color-onyx)] border border-[var(--color-graphite)] text-white rounded"
          >
            {currency}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[var(--color-bone)] hover:text-[var(--color-accent)]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[var(--color-void-black)] border-b border-[var(--color-graphite)] px-4 py-6 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3 text-sm tracking-wider uppercase">
            <Link
              href="/#catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--color-bone)] hover:text-[var(--color-accent)] py-1"
            >
              All Products
            </Link>
            <Link
              href="/#v2ray"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--color-bone)] hover:text-[var(--color-accent)] py-1"
            >
              V2Ray / VPN Tunnels
            </Link>
            <Link
              href="/#vps"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--color-bone)] hover:text-[var(--color-accent)] py-1"
            >
              Cloud VPS Compute
            </Link>
            <Link
              href="/#subscriptions"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--color-bone)] hover:text-[var(--color-accent)] py-1"
            >
              Software Subscriptions
            </Link>
            <Link
              href="/#gaming"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--color-bone)] hover:text-[var(--color-accent)] py-1"
            >
              Game Keys & Wallet
            </Link>
          </nav>

          <div className="pt-4 border-t border-[var(--color-graphite)] flex flex-col gap-3">
            <Link
              href="/dashboard/vault"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-signal text-center text-xs py-2.5 w-full flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>ACCESS KEY VAULT</span>
            </Link>

            <div className="flex items-center justify-between text-xs pt-2 font-mono text-[var(--color-ash)]">
              <a
                href="https://wa.me/?text=Hello%20Fibez%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#25D366]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Desk</span>
              </a>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white"
              >
                Admin Command
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
