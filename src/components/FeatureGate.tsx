import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { getVerifiedSessionUser, isStaffRole } from '@/lib/dal';
import { getPageFlags, type PageKey } from '@/lib/site-config';

function ComingSoon({ name }: { name: string }) {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md text-center space-y-4">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">{name}</div>
        <h1 className="text-3xl font-normal tracking-tight text-white">Coming soon</h1>
        <p className="text-sm text-[#a1a4a5] leading-relaxed">
          This part of Fibez is not open yet. The V2Ray store is live in the meantime.
        </p>
        <div className="pt-2">
          <Link
            href="/v2ray"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            Go to V2Ray
          </Link>
        </div>
      </div>
    </main>
  );
}

async function Gate({ page, name, children }: { page: PageKey; name: string; children: React.ReactNode }) {
  await connection(); // request-time data: never prerendered
  const flags = await getPageFlags();
  if (!flags[page]) {
    const user = await getVerifiedSessionUser();
    if (!isStaffRole(user?.role)) return <ComingSoon name={name} />;
  }
  return <>{children}</>;
}

/** Server-side switch for a section of the site (see Admin → Site pages). Staff always get through. */
export default function FeatureGate({ page, name, children }: { page: PageKey; name: string; children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Gate page={page} name={name}>
        {children}
      </Gate>
    </Suspense>
  );
}
