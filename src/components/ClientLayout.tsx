'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import BackToTop from '@/components/BackToTop';
import { useStore } from '@/lib/store-context';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const store = useStore();

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
