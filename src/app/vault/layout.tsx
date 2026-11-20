import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Vault & Orders',
  description: 'Access your purchased license keys, instant redemption tokens, VLESS credentials, and receipts.',
};

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
