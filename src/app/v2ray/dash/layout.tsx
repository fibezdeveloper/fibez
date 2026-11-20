import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fibez V2Ray Dash',
  description: 'Singapore Tier-1 VLESS high-speed config, real-time bandwidth telemetry, server speed benchmarks, and active device management.',
};

export default function V2RayDashShortcutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
