import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import FeatureGate from '@/components/FeatureGate';
import { getVerifiedSessionUser, isStaffRole } from '@/lib/dal';
import { getHiddenProductIds } from '@/lib/site-config';
import { PRODUCTS } from '@/lib/products';
import type { Metadata } from 'next';

// Each product page gets its own tab title and description (the catalog is static, so this is cheap).
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return {};
  return {
    title: `${product.title} | Fibez`,
    description: product.description?.slice(0, 160),
  };
}

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
