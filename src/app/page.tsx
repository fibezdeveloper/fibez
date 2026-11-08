'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import CatalogSection from '@/components/CatalogSection';
import CodeWindow from '@/components/CodeWindow';
import FeaturesGrid from '@/components/FeaturesGrid';
import VaultDashboard from '@/components/VaultDashboard';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-[#f0f0f0] font-sans selection:bg-[#9281f7] selection:text-black">
      
      {/* Top Navigation */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Content Sections */}
      <main className="flex flex-col">
        {/* Hero with Domaine Editorial Typography & 3D Cube */}
        <Hero
          onExploreCatalog={() => {
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Monochromatic Infrastructure Trust Proof */}
        <TrustBar />

        {/* Automated Digital Goods Inventory Vault & Configurator */}
        <CatalogSection />

        {/* Developer Terminal Code Window & Live Provisioning Simulator */}
        <CodeWindow />

        {/* Resend 16px Bento Feature Pillars */}
        <FeaturesGrid />

        {/* Customer Key Vault Portal & Admin Command Center */}
        <VaultDashboard />

        {/* Developer Experience Testimonial Quotes */}
        <Testimonials />
      </main>

      {/* Minimalist Resend Footer with Status Dot */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}
