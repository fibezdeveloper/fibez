import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getVerifiedSessionUser, isStaffRole } from '@/lib/dal';

/**
 * Server-side sign-in gate. Wrap a route's layout children with this so the page is only
 * rendered for a verified session (checked against Neon Auth + the database role, never
 * against anything the browser can set itself).
 *
 *  - not signed in            -> redirect to /login?callbackUrl=<path>
 *  - staffOnly and not staff  -> redirect to /
 */
async function Gate({
  children,
  callbackUrl,
  staffOnly,
}: {
  children: React.ReactNode;
  callbackUrl: string;
  staffOnly?: boolean;
}) {
  const user = await getVerifiedSessionUser();
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (staffOnly && !isStaffRole(user.role)) {
    // Signed in but not staff: pretend the page does not exist.
    notFound();
  }
  return <>{children}</>;
}

export default function RequireAuth({
  children,
  callbackUrl,
  staffOnly = false,
}: {
  children: React.ReactNode;
  callbackUrl: string;
  staffOnly?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-zinc-400">
          Verifying session &amp; permissions...
        </div>
      }
    >
      <Gate callbackUrl={callbackUrl} staffOnly={staffOnly}>
        {children}
      </Gate>
    </Suspense>
  );
}
