import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Launching Soon',
  description: 'Fibez v2 is in final calibration. Storefront goes live December 12.',
  robots: { index: false, follow: false },
};

export default function LockLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
