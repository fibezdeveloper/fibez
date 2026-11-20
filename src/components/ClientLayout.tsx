'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import BackToTop from '@/components/BackToTop';
import { useStore } from '@/lib/store-context';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/admin');
  // The pre-launch lock itself is enforced server-side in src/proxy.ts.
  // /lock (countdown) and /unlock (operator login) render without the storefront chrome.
  const isBareRoute = pathname.startsWith('/unlock') || pathname.startsWith('/lock');

  if (isBareRoute) {
    return <div className="min-h-screen bg-black">{children}</div>;
  }

  // On Master Admin routes, remove consumer storefront navbar and footer
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
