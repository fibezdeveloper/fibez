import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import FeatureGate from '@/components/FeatureGate';
import { getVerifiedSessionUser, isStaffRole } from '@/lib/dal';
import { getHiddenProductIds } from '@/lib/site-config';

async function HiddenCheck({ id, children }: { id: string; children: React.ReactNode }) {
  await connection();
  // A product the owner switched off must not be reachable by its URL either.
  if ((await getHiddenProductIds()).has(id)) {
    const user = await getVerifiedSessionUser();
    if (!isStaffRole(user?.role)) notFound();
  }
  return <>{children}</>;
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isVpn = id.startsWith('v2ray-');
  return (
    <FeatureGate page={isVpn ? 'v2ray' : 'shop'} name={isVpn ? 'V2Ray' : 'Shop'}>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <HiddenCheck id={id}>{children}</HiddenCheck>
      </Suspense>
    </FeatureGate>
  );
}
