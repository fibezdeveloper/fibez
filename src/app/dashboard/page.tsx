import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getVerifiedSessionUser } from '@/lib/dal';
import DashboardClient from '@/components/DashboardClient';

async function DashboardGate() {
  const currentUser = await getVerifiedSessionUser();

  if (!currentUser) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return <DashboardClient currentUser={currentUser} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-32 text-center font-mono text-xs text-zinc-400">
          Verifying session &amp; permissions...
        </div>
      }
    >
      <DashboardGate />
    </Suspense>
  );
}
