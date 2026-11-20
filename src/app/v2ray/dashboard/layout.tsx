import type { Metadata } from 'next';
import RequireAuth from '@/components/RequireAuth';

export const metadata: Metadata = {
  title: 'Fibez V2Ray Dash',
  description: 'Singapore Tier-1 VLESS high-speed config, real-time bandwidth telemetry, server speed benchmarks, and active device management.',
  robots: { index: false, follow: false },
};

export default function V2RayDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth callbackUrl="/v2ray/dashboard">{children}</RequireAuth>;
}
