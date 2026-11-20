import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy & Guarantee',
  description: 'Fibez digital asset replacement and refund policy for unredeemed keys and service satisfaction.',
};

export default function RefundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
