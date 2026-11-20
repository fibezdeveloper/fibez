import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const isNeonRemote =
  process.env.NEON_AUTH_BASE_URL &&
  !process.env.NEON_AUTH_BASE_URL.includes('localhost') &&
  !process.env.NEON_AUTH_BASE_URL.includes('127.0.0.1');

export default async function middleware(req: NextRequest) {
  // 1. Check local session cookie fallback
  const fibezSession = req.cookies.get('fibez_session')?.value;
  if (fibezSession) {
    try {
      const parsed = JSON.parse(Buffer.from(fibezSession, 'base64url').toString('utf-8'));
      if (parsed?.user?.id) {
        return NextResponse.next();
      }
    } catch {}
  }

  // 2. If remote Neon Auth is active, run auth.middleware
  if (isNeonRemote) {
    try {
      return (auth.middleware({
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
          '/unlock',
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
