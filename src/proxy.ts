import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UNLOCK_COOKIE, isLockExempt, isSiteLocked, verifyUnlockToken } from '@/lib/site-lock';

const isNeonRemote =
  process.env.NEON_AUTH_BASE_URL &&
  !process.env.NEON_AUTH_BASE_URL.includes('localhost') &&
  !process.env.NEON_AUTH_BASE_URL.includes('127.0.0.1');

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Pre-launch lock, enforced on the server before any page or API route runs.
  //    Only an HMAC-signed, expiring, HttpOnly token minted by /api/unlock passes.
  if (isSiteLocked() && !isLockExempt(pathname)) {
    const unlocked = verifyUnlockToken(req.cookies.get(UNLOCK_COOKIE)?.value);
    if (!unlocked) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Site is locked' },
          { status: 401, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      const lockUrl = req.nextUrl.clone();
      lockUrl.pathname = '/lock';
      lockUrl.search = '';
      const res = NextResponse.redirect(lockUrl);
      res.headers.set('Cache-Control', 'no-store');
      return res;
    }
  }

  // 2. Neon Auth session refresh (route authorization is enforced per-route in src/lib/dal.ts).
  if (isNeonRemote && !pathname.startsWith('/lock') && !pathname.startsWith('/unlock')) {
    try {
      return await (auth.middleware({
        loginUrl: '/login',
        publicRoutes: [
          '/',
          '/catalog',
          '/products',
          '/v2ray',
          '/v2ray/dashboard',
          '/cart',
          '/vault',
          '/docs',
          '/infrastructure',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/privacy',
          '/refund',
          '/terms',
          '/tickets',
          '/api',
          '/admin',
          '/dashboard',
        ],
      }) as any)(req);
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|woff2?|webmanifest)$).*)',
  ],
};
