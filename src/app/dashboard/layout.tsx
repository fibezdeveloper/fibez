import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Portal & Account Overview',
  description: 'Manage your Fibez account, security settings, linked sessions, and order history.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
