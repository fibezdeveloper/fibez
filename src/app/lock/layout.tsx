import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Launching Soon',
  description: 'Fibez v2 is in final calibration. Storefront goes live 22 November at 12:00 PM.',
  robots: { index: false, follow: false },
};

export default function LockLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
