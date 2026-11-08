'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FibezLogo from '@/components/FibezLogo';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({
  onOpenAuth,
}: {
  onOpenAuth?: (mode: 'login' | 'register') => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Products', href: '#catalog' },
    { name: 'Infrastructure', href: '#infrastructure' },
    { name: 'Code API', href: '#api' },
    { name: 'Pricing', href: '#catalog' },
    { name: 'Documentation', href: '#docs' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-[20px] transition-all">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <FibezLogo withVersion={true} />
        </Link>

        {/* Center: Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[14px] text-[#f0f0f0] hover:text-[#ffffff] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => onOpenAuth ? onOpenAuth('login') : window.location.href = '#catalog'}
            className="btn-ghost-resend"
          >
            Log in
          </button>
          <button
            onClick={() => onOpenAuth ? onOpenAuth('register') : window.location.href = '#catalog'}
            className="btn-action-resend"
          >
            <span>Get started</span>
            <span className="text-xs">›</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-[#f0f0f0] hover:text-white"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#292d30] bg-black px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[15px] text-[#f0f0f0] hover:text-white py-1"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-3 border-t border-[#292d30] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAuth) onOpenAuth('login');
              }}
              className="btn-ghost-resend w-full"
            >
              Log in
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAuth) onOpenAuth('register');
              }}
              className="btn-action-resend w-full"
            >
              Get started ›
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
