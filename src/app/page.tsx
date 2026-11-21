import { Suspense } from 'react';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { getVerifiedSessionUser, isStaffRole } from '@/lib/dal';
import { getPageFlags } from '@/lib/site-config';
import HomeContent from '@/components/HomeContent';

async function HomeGate() {
  await connection(); // request-time data: never prerendered
  const flags = await getPageFlags();

  // Home switched off (Admin -> Site pages): visitors land on the V2Ray hub. Staff still see the home page.
  if (!flags.home && flags.v2ray) {
    const user = await getVerifiedSessionUser();
    if (!isStaffRole(user?.role)) redirect('/v2ray');
  }

  return <HomeContent shopOn={flags.shop} v2rayOn={flags.v2ray} ticketsOn={flags.tickets} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeGate />
    </Suspense>
  );
}
