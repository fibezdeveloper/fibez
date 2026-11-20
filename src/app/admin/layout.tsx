import type { Metadata } from 'next';
import RequireAuth from '@/components/RequireAuth';

export const metadata: Metadata = {
  title: 'Admin Console — Fibez Control Plane',
  description: 'Fibez Master Control Plane: manage orders, V2Ray inbounds, stock inventory, and user accounts.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth callbackUrl="/admin" staffOnly>
      {children}
    </RequireAuth>
  );
}
