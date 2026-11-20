import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console — Fibez Control Plane',
  description: 'Fibez Master Control Plane: manage orders, V2Ray inbounds, stock inventory, and user accounts.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
