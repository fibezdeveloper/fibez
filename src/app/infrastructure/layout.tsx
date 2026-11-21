import type { Metadata } from 'next';
import FeatureGate from '@/components/FeatureGate';

export const metadata: Metadata = {
  title: 'Network & Node Infrastructure',
  description: 'Real-time telemetry, uptime status, and edge node health across Singapore Equinix SG3, Tokyo, and Colombo ingress gateways.',
};

export default function InfrastructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureGate page="infrastructure" name="Infrastructure">
      {children}
    </FeatureGate>
  );
}
