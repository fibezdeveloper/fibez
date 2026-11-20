'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import BackToTop from '@/components/BackToTop';
import { useStore } from '@/lib/store-context';
import SiteLockCountdown from '@/components/SiteLockCountdown';

const LAUNCH_DATE = new Date('2026-12-12T00:00:00+05:30').getTime();

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/admin');
  const isUnlockRoute = pathname.startsWith('/unlock');

  // Check if site is unlocked
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    // If launch date has arrived, it's public for everyone
    if (Date.now() >= LAUNCH_DATE) return true;
    if (typeof document !== 'undefined') {
      return document.cookie.includes('fibez_unlocked=true');
    }
    return false;
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (Date.now() >= LAUNCH_DATE) {
      setIsUnlocked(true);
      return;
    }

    const hasCookie = document.cookie.includes('fibez_unlocked=true');
    let hasStorage = false;
    try {
      hasStorage = localStorage.getItem('fibez_unlocked') === 'true';
    } catch {}

    if (hasCookie || hasStorage) {
      setIsUnlocked(true);
      if (!hasCookie && hasStorage) {
        document.cookie = 'fibez_unlocked=true; path=/; max-age=2592000; SameSite=Lax';
      }
    }
  }, []);

  // 1. Allow the /unlock terminal route to render freely
  if (isUnlockRoute) {
    return <div className="min-h-screen bg-black">{children}</div>;
  }

  // 2. If locked, render the launch countdown screen
  if (!isUnlocked && Date.now() < LAUNCH_DATE) {
    return <SiteLockCountdown />;
  }

  // 3. On Master Admin routes, remove consumer storefront navbar and footer
  if (isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Persistent Floating Navbar across all pages */}
      <Navbar />

      {/* Main Page Route Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Persistent Minimalist Resend-style Footer */}
      <Footer />

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={store.isAuthOpen}
        initialMode={store.authMode}
        onClose={store.closeAuth}
      />

      {/* Floating React Bits SlingButton Back-To-Top */}
      <BackToTop />
    </div>
  );
}
