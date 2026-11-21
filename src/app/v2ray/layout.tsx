import type { Metadata } from 'next';
import FeatureGate from '@/components/FeatureGate';

export const metadata: Metadata = {
  title: 'V2Ray Hub — High-Speed VLESS VPN for Sri Lanka',
  description: 'Singapore Equinix Tier-1 VLESS VPN bypass packages for SLT Fiber, Dialog, Hutch, Mobitel and Airtel.',
};

export default function V2RayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureGate page="v2ray" name="V2Ray">
      {children}
    </FeatureGate>
  );
}
