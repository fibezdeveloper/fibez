import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

// All authentication is handled by Neon Auth (Better Auth). Sessions are issued and
// verified by the auth server; nothing here mints sessions or trusts client cookies.
const handler = auth.handler();

export const GET = handler.GET;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}

/**
 * Sign-up and sign-in pass through a per-connection limit first, so a script cannot mass-create
 * throwaway accounts (as a scanner did on 2026-11-26) or guess passwords.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const path = req.nextUrl.pathname;
  const ip = clientIp(req);
  if (path.includes('/sign-up')) {
    if ((await rateLimit('signup', ip, 5, 3600)).limited || (await rateLimit('signup-day', ip, 12, 86400)).limited) {
      return NextResponse.json({ message: 'Too many new accounts from this connection. Please try again later.' }, { status: 429 });
    }
  } else if (path.includes('/sign-in')) {
    if ((await rateLimit('signin', ip, 20, 900)).limited) {
      return NextResponse.json({ message: 'Too many sign-in attempts. Please wait a few minutes.' }, { status: 429 });
    }
  }
  return handler.POST(req, ctx as never);
}
