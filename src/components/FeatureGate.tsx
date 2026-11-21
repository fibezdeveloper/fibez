import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { getVerifiedSessionUser, isStaffRole } from '@/lib/dal';
import { getPageFlags, type PageKey } from '@/lib/site-config';

async function Gate({ page, children }: { page: PageKey; children: React.ReactNode }) {
  await connection(); // request-time data: never prerendered
  const flags = await getPageFlags();
  if (!flags[page]) {
    const user = await getVerifiedSessionUser();
    // A switched-off section does not exist for visitors: plain 404. Staff still get through.
    if (!isStaffRole(user?.role)) notFound();
  }
  return <>{children}</>;
}

/** Server-side switch for a section of the site (see Admin → Site pages). Staff always get through. */
export default function FeatureGate({ page, children }: { page: PageKey; name?: string; children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Gate page={page}>
        {children}
      </Gate>
    </Suspense>
  );
}
