'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FibezMonogram } from './FibezLogo';
import { runCipherDecode } from '@/lib/cipher';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

const RBAC_ROLES = ['CUSTOMER', 'RESELLER', 'ADMIN'];

export default function Navbar() {
  const { currency, toggleCurrency } = useCurrency();
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleRoleUpdate = (e: any) => {
      const role = String(e.detail || '').toUpperCase();
      const idx = RBAC_ROLES.indexOf(role);
      if (idx !== -1) {
        setCurrentRoleIndex(idx);
      }
    };
    window.addEventListener('fibez:rbac-role', handleRoleUpdate);
    return () => window.removeEventListener('fibez:rbac-role', handleRoleUpdate);
  }, []);

  const cycleRole = () => {
    const nextIdx = (currentRoleIndex + 1) % RBAC_ROLES.length;
    setCurrentRoleIndex(nextIdx);
    const nextRole = RBAC_ROLES[nextIdx].toLowerCase();
    window.dispatchEvent(new CustomEvent('fibez:set-role', { detail: nextRole }));
    window.dispatchEvent(new CustomEvent('fibez:rbac-role', { detail: nextRole }));
  };

  const handleBrandHover = (e: React.MouseEvent<HTMLSpanElement>) => {
    runCipherDecode(e.currentTarget, 'FIBEZ', 350);
  };

  const currentRole = RBAC_ROLES[currentRoleIndex];

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-[100] h-[56px] bg-voidBlack border-b border-graphite select-none">
        <div className="w-full h-full grid grid-cols-2 lg:grid-cols-[240px_1fr_190px] xl:grid-cols-[270px_1fr_210px]">
          
          {/* Left Brand Cell: Custom FIBEZ Geometric 'FZ' Monogram + Tech Wordmark */}
          <Link
            href="/#hero-scroll-track"
            className="h-full px-5 lg:px-7 border-r border-graphite flex items-center gap-3.5 group focus:outline-none hover:bg-onyx/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-[2px] bg-onyx border border-graphite group-hover:border-signalLime flex items-center justify-center transition-colors shrink-0">
              <FibezMonogram className="w-5 h-5 text-chalk group-hover:text-signalLime transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                onMouseEnter={handleBrandHover}
                data-text="FIBEZ"
                className="font-mono text-[16px] font-semibold tracking-[0.26em] text-chalk group-hover:text-signalLime transition-colors"
              >
                FIBEZ
              </span>
              <span className="hidden xl:inline-block font-mono text-[8px] tracking-[0.2em] text-ash uppercase">
                v4.2
              </span>
            </div>
          </Link>

          {/* Center 5 Equal-Width Grid Cells */}
          <nav className="hidden lg:grid lg:grid-cols-5 h-full">
            
            {/* Cell 1: PRODUCTS */}
            <div className="relative group h-full border-r border-graphite flex items-center">
              <a
                href="/#provisioning-bench"
                className="w-full h-full px-5 text-left font-sans text-[11px] font-medium tracking-[0.2em] text-chalk group-hover:text-signalLime group-hover:bg-onyx/40 uppercase transition-colors flex items-center justify-between"
              >
                <span
                  onMouseEnter={(e) => runCipherDecode(e.currentTarget, 'PRODUCTS', 350)}
                  data-text="PRODUCTS"
                >
                  PRODUCTS
                </span>
              </a>
              {/* Flush Bordered Dropdown Table */}
              <div className="absolute left-[-1px] right-[-1px] top-[55px] bg-carbon border border-graphite opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-100 divide-y divide-graphite z-50 shadow-2xl">
                <a
                  href="/#provisioning-bench"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  V2RAY / XRAY NODES
                </a>
                <a
                  href="/#provisioning-bench"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  CLOUD VPS INSTANCES
                </a>
                <a
                  href="/#provisioning-bench"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  PREMIUM SUBSCRIPTIONS
                </a>
                <a
                  href="/#provisioning-bench"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  GAME KEYS &amp; GIFT CARDS
                </a>
                <Link
                  href="/admin"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  ADMIN COMMAND CENTER
                </Link>
                <Link
                  href="/dashboard/vault"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  CUSTOMER KEY VAULT
                </Link>
              </div>
            </div>

            {/* Cell 2: TECHNOLOGY */}
            <div className="relative group h-full border-r border-graphite flex items-center">
              <a
                href="/#provisioning-bench"
                className="w-full h-full px-5 text-left font-sans text-[11px] font-medium tracking-[0.2em] text-chalk group-hover:text-signalLime group-hover:bg-onyx/40 uppercase transition-colors flex items-center justify-between"
              >
                <span
                  onMouseEnter={(e) => runCipherDecode(e.currentTarget, 'TECHNOLOGY', 350)}
                  data-text="TECHNOLOGY"
                >
                  TECHNOLOGY
                </span>
              </a>
              <div className="absolute left-[-1px] right-[-1px] top-[55px] bg-carbon border border-graphite opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-100 divide-y divide-graphite z-50 shadow-2xl">
                <a
                  href="/#provisioning-bench"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  VLESS-XTLS REALITY
                </a>
                <a
                  href="/#provisioning-bench"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  AMD EPYC KVM ENGINE
                </a>
                <a
                  href="/#rbac-console"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  ZERO-LOG SECURITY MODEL
                </a>
              </div>
            </div>

            {/* Cell 3: ECOSYSTEM */}
            <div className="relative group h-full border-r border-graphite flex items-center">
              <a
                href="/#storefront-grid"
                className="w-full h-full px-5 font-sans text-[11px] font-medium tracking-[0.2em] text-chalk group-hover:text-signalLime group-hover:bg-onyx/40 uppercase transition-colors flex items-center"
              >
                <span
                  onMouseEnter={(e) => runCipherDecode(e.currentTarget, 'ECOSYSTEM', 350)}
                  data-text="ECOSYSTEM"
                >
                  ECOSYSTEM
                </span>
              </a>
            </div>

            {/* Cell 4: $FBZ · RBAC */}
            <div className="relative group h-full border-r border-graphite flex items-center">
              <div className="w-full h-full px-5 font-sans text-[11px] font-medium tracking-[0.2em] text-chalk group-hover:text-signalLime group-hover:bg-onyx/40 uppercase transition-colors flex items-center justify-between">
                <a href="/#rbac-console" className="flex-1">
                  <span
                    onMouseEnter={(e) => runCipherDecode(e.currentTarget, '$FBZ · RBAC', 350)}
                    data-text="$FBZ · RBAC"
                  >
                    $FBZ · RBAC
                  </span>
                </a>
                <button
                  type="button"
                  onClick={cycleRole}
                  title="Click to cycle RBAC role"
                  className="hidden xl:inline-block font-mono text-[8px] tracking-[0.14em] px-1.5 py-0.5 border border-signalLime/60 text-signalLime rounded-[2px] hover:bg-signalLime hover:text-voidBlack transition-colors"
                >
                  {currentRole}
                </button>
              </div>
            </div>

            {/* Cell 5: RESOURCES */}
            <div className="relative group h-full border-r border-graphite flex items-center">
              <a
                href="/#two-surfaces"
                className="w-full h-full px-5 text-left font-sans text-[11px] font-medium tracking-[0.2em] text-chalk group-hover:text-signalLime group-hover:bg-onyx/40 uppercase transition-colors flex items-center justify-between"
              >
                <span
                  onMouseEnter={(e) => runCipherDecode(e.currentTarget, 'RESOURCES', 350)}
                  data-text="RESOURCES"
                >
                  RESOURCES
                </span>
              </a>
              <div className="absolute left-[-1px] right-[-1px] top-[55px] bg-carbon border border-graphite opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-100 divide-y divide-graphite z-50 shadow-2xl">
                <Link
                  href="/dashboard/vault"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  KEY VAULT
                </Link>
                <Link
                  href="/admin"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  ADMIN COMMAND
                </Link>
                <Link
                  href="/auth/login"
                  className="block px-5 py-3.5 font-sans text-[10px] font-medium tracking-[0.2em] text-bone hover:text-signalLime hover:bg-onyx uppercase transition-colors"
                >
                  AUTHENTICATION
                </Link>
              </div>
            </div>

          </nav>

          {/* Right CTA Cell: Inset Signal Lime LAUNCH Button */}
          <div className="h-full p-2 flex items-center justify-end bg-voidBlack">
            {/* Currency Pill */}
            <button
              onClick={toggleCurrency}
              className="hidden sm:inline-flex mr-2 px-2.5 py-1 text-[10px] font-mono tracking-wider bg-onyx border border-graphite hover:border-signalLime text-white rounded transition-colors"
              title="Switch Currency (USD / LKR)"
            >
              <span className={currency === 'LKR' ? 'text-signalLime font-semibold' : 'text-ash'}>
                LKR
              </span>
              <span className="text-slate mx-1">/</span>
              <span className={currency === 'USD' ? 'text-signalLime font-semibold' : 'text-ash'}>
                USD
              </span>
            </button>

            {/* Desktop Launch Button */}
            <a
              href="/#rbac-console"
              className="hidden lg:flex w-full h-full bg-signalLime text-voidBlack font-sans text-[11px] font-semibold tracking-[0.2em] uppercase px-5 rounded-[2px] glow-lime items-center justify-between hover:brightness-105 transition-all"
            >
              <span
                onMouseEnter={(e) => runCipherDecode(e.currentTarget, 'LAUNCH', 350)}
                data-text="LAUNCH"
              >
                LAUNCH
              </span>
              <span className="font-mono text-sm leading-none">→</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-chalk hover:text-signalLime transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[56px] bg-voidBlack/95 border-b border-graphite z-50 backdrop-blur-xl p-6 divide-y divide-graphite font-mono text-xs uppercase tracking-widest">
          <div className="py-3 flex items-center justify-between">
            <span className="text-ash">ACTIVE ROLE</span>
            <button
              onClick={cycleRole}
              className="border border-signalLime text-signalLime px-3 py-1 rounded-[2px]"
            >
              {currentRole} ↻
            </button>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-ash">CURRENCY</span>
            <button
              onClick={toggleCurrency}
              className="border border-graphite px-3 py-1 text-chalk"
            >
              {currency}
            </button>
          </div>
          <div className="py-3 flex flex-col gap-3">
            <a
              href="/#provisioning-bench"
              onClick={() => setMobileMenuOpen(false)}
              className="text-chalk hover:text-signalLime py-1"
            >
              CLI PROVISIONING BENCH
            </a>
            <a
              href="/#storefront-grid"
              onClick={() => setMobileMenuOpen(false)}
              className="text-chalk hover:text-signalLime py-1"
            >
              DIGITAL SKUS STOREFRONT
            </a>
            <a
              href="/#rbac-console"
              onClick={() => setMobileMenuOpen(false)}
              className="text-chalk hover:text-signalLime py-1"
            >
              RBAC TELEMETRY CONSOLE
            </a>
            <Link
              href="/dashboard/vault"
              onClick={() => setMobileMenuOpen(false)}
              className="text-chalk hover:text-signalLime py-1 flex items-center justify-between"
            >
              <span>KEY VAULT</span>
              <ArrowUpRight className="w-4 h-4 text-signalLime" />
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-chalk hover:text-signalLime py-1 flex items-center justify-between"
            >
              <span>ADMIN COMMAND</span>
              <ArrowUpRight className="w-4 h-4 text-signalLime" />
            </Link>
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-chalk hover:text-signalLime py-1 flex items-center justify-between"
            >
              <span>LOGIN / REGISTER</span>
              <ArrowUpRight className="w-4 h-4 text-signalLime" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
