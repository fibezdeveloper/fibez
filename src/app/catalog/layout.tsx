import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Catalog — Instant Codes & Subscriptions',
  description: 'Explore instant digital keys, gaming cards, PlayStation, Steam, Xbox, and premium streaming subscriptions.',
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
