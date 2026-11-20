import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing & Wallet — Commercial Bank Deposit | Fibez',
  description: 'Fund your pre-funded Fibez wallet, upload Commercial Bank transfer slips, and manage active subscription billing.',
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
