import type { Metadata } from 'next';
import RequireAuth from '@/components/RequireAuth';

export const metadata: Metadata = {
  title: 'Billing & Wallet — Commercial Bank Deposit',
  description: 'Fund your pre-funded Fibez wallet, upload Commercial Bank transfer slips, and manage active subscription billing.',
  robots: { index: false, follow: false },
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth callbackUrl="/billing">{children}</RequireAuth>;
}
