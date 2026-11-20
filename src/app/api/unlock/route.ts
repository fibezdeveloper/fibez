import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const UNLOCK_USERNAME = 'Nuthara';
const UNLOCK_PASSWORD = 'R1MT2N6E8FB';
const UNLOCK_SECRET = process.env.UNLOCK_SECRET || 'fibez_operator_clearance_master_key_2026';

// In-memory rate limiting map (IP -> { count, resetTime })
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) return false;
  if (now > entry.resetTime) {
    rateLimitMap.delete(ip);
    return false;
  }
  return entry.count >= 5;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 10 * 60 * 1000 }); // 10 minutes window
  } else {
    entry.count += 1;
  }
}

function clearRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}

function generateUnlockToken(): string {
  return crypto
    .createHmac('sha256', UNLOCK_SECRET)
    .update('fibez-unlocked-operator-nuthara')
    .digest('hex');
}

export function verifyUnlockToken(token?: string | null): boolean {
  if (!token) return false;
  const expected = generateUnlockToken();
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

// GET: Check unlock status
export async function GET(req: NextRequest) {
  const token = req.cookies.get('fibez_unlocked_token')?.value;
  const unlocked = verifyUnlockToken(token);
  return NextResponse.json({ unlocked });
}

// POST: Authenticate and unlock
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many unauthorized unlock attempts. Please wait 10 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const username = (body.username || '').toString().trim();
    const password = (body.password || '').toString().trim();

    const isUserValid = username.toLowerCase() === UNLOCK_USERNAME.toLowerCase();
    const isPassValid = password === UNLOCK_PASSWORD;

    if (!isUserValid || !isPassValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Invalid operator credentials. Access denied.' },
        { status: 401 }
      );
    }

    clearRateLimit(ip);
    const token = generateUnlockToken();

    const response = NextResponse.json({
      success: true,
      message: 'Operator clearance granted. Storefront unlocked.',
    });

    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = 60 * 60 * 24 * 30; // 30 days

    // Secure HttpOnly HMAC token
    response.cookies.set('fibez_unlocked_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    // Client-readable cookie
    response.cookies.set('fibez_unlocked', 'true', {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Server authentication error' },
      { status: 500 }
    );
  }
}

// DELETE: Re-lock the website
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Storefront re-locked for public mode.',
  });

  response.cookies.delete('fibez_unlocked_token');
  response.cookies.delete('fibez_unlocked');

  return response;
}
