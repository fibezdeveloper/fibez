'use client';

import React from 'react';
import PortalHero from '@/components/PortalHero';
import ProtocolMarquee from '@/components/ProtocolMarquee';
import TwoSurfacesSection from '@/components/TwoSurfacesSection';
import ProvisioningBench from '@/components/ProvisioningBench';
import StorefrontGrid from '@/components/StorefrontGrid';
import RbacConsole from '@/components/RbacConsole';
import VaultArchitectureSection from '@/components/VaultArchitectureSection';
import ComparisonTable from '@/components/ComparisonTable';
import ToastNotification from '@/components/ToastNotification';

export default function HomePage() {
  return (
    <div className="w-full relative">
      {/* 1. Hero + Clean Rectangular Portal Zoom (Sticky 300vh) */}
      <PortalHero />

      {/* 2. Neon Section Divider & Horizontal Marquee Ticker */}
      <ProtocolMarquee />

      {/* 3. Two Surfaces, One Engine — Cipher Scramble Cards */}
      <TwoSurfacesSection />

      {/* 4. Interactive CLI Provisioning Bench (4 FIBEZ Verticals) */}
      <ProvisioningBench />

      {/* 5. Live Marketplace Catalog Grid (Instant Checkout & Mint) */}
      <StorefrontGrid />

      {/* 6. Interactive Sliding Rows Architecture */}
      <VaultArchitectureSection />

      {/* 7. Side-by-Side Paradigm Comparison Matrix */}
      <ComparisonTable />

      {/* 8. Role-Based Access Control (RBAC) Live Command Console */}
      <RbacConsole />

      {/* 9. Instant Delivery Floating Toast Notification */}
      <ToastNotification />
    </div>
  );
}
