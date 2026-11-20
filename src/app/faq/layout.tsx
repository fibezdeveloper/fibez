import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Fibez',
  description: 'Common questions and answers regarding Fibez high-speed VLESS VPN configs, Sri Lankan ISP routing, key delivery, payment methods, and account guarantees.',
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
