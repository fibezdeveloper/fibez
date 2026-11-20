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
    if (typeof window === 'undefined') return false;
    if (Date.now() >= LAUNCH_DATE) return true;
    const hasCookie = document.cookie.includes('fibez_unlocked=true');
    let hasStorage = false;
    try {
      hasStorage = localStorage.getItem('fibez_unlocked') === 'true';
    } catch {}
    return hasCookie || hasStorage;
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncStatus = () => {
      if (Date.now() >= LAUNCH_DATE) {
        setIsUnlocked(true);
        return;
      }
      const hasCookie = typeof document !== 'undefined' && document.cookie.includes('fibez_unlocked=true');
      let hasStorage = false;
      try {
        hasStorage = typeof localStorage !== 'undefined' && localStorage.getItem('fibez_unlocked') === 'true';
      } catch {}

      if (hasCookie || hasStorage) {
        setIsUnlocked(true);
        if (!hasCookie && hasStorage) {
          document.cookie = 'fibez_unlocked=true; path=/; max-age=31536000; SameSite=Lax';
        }
      }
    };

    syncStatus();
    window.addEventListener('storage', syncStatus);
    window.addEventListener('fibez_unlocked', syncStatus);
    return () => {
      window.removeEventListener('storage', syncStatus);
      window.removeEventListener('fibez_unlocked', syncStatus);
    };
  }, [pathname]);

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
