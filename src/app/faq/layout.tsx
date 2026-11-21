import type { Metadata } from 'next';
import FeatureGate from '@/components/FeatureGate';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Fibez',
  description: 'Common questions and answers regarding Fibez high-speed VLESS VPN configs, Sri Lankan ISP routing, key delivery, payment methods, and account guarantees.',
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureGate page="faq" name="FAQ">
      {children}
    </FeatureGate>
  );
}
