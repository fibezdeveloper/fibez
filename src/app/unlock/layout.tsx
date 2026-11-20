import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operator Clearance & Unlock | Fibez',
  description: 'Authorized clearance authentication gateway for Fibez storefront and V2Ray telemetry network.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnlockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
