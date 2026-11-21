import type { Metadata } from 'next';
import FeatureGate from '@/components/FeatureGate';

export const metadata: Metadata = {
  title: 'Client Documentation & Setup Guides',
  description: 'Detailed setup guides and client import tutorials for NetMod Syna, V2Box, v2rayNG, and Clash Verge on Windows, iOS, and Android.',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureGate page="docs" name="Docs">
      {children}
    </FeatureGate>
  );
}
