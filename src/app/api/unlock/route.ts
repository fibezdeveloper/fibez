import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import {
  UNLOCK_COOKIE,
  UNLOCK_TTL_SECONDS,
  createUnlockToken,
  verifyOperatorCredentials,
  verifyUnlockToken,
} from '@/lib/site-lock';

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const FAIL_DELAY_MS = 800;

// Per-instance fallback limiter (used if the database is unavailable).
const memoryAttempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}

let tableReady = false;
async function ensureTable() {
  if (!sql || tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS public.unlock_attempts (
      ip TEXT PRIMARY KEY,
      fails INTEGER NOT NULL DEFAULT 0,
      reset_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`ALTER TABLE public.unlock_attempts ENABLE ROW LEVEL SECURITY`;
  tableReady = true;
}

async function isRateLimited(ip: string): Promise<boolean> {
  const mem = memoryAttempts.get(ip);
  if (mem && mem.resetAt > Date.now() && mem.count >= MAX_FAILS) return true;

  if (sql) {
    try {
      await ensureTable();
      const rows = await sql`
        SELECT fails FROM public.unlock_attempts WHERE ip = ${ip} AND reset_at > NOW()
      `;
      if (rows.length > 0 && Number(rows[0].fails) >= MAX_FAILS) return true;
    } catch (err) {
      console.warn('unlock rate-limit db check failed, using memory only:', err);
    }
  }
  return false;
}

async function recordFailure(ip: string) {
  const now = Date.now();
  const mem = memoryAttempts.get(ip);
  if (!mem || mem.resetAt <= now) {
    memoryAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    mem.count += 1;
  }

  if (sql) {
    try {
      await ensureTable();
      await sql`
        INSERT INTO public.unlock_attempts (ip, fails, reset_at)
        VALUES (${ip}, 1, NOW() + (${WINDOW_MS / 1000} * INTERVAL '1 second'))
        ON CONFLICT (ip) DO UPDATE SET
          fails = CASE WHEN public.unlock_attempts.reset_at > NOW()
                       THEN public.unlock_attempts.fails + 1 ELSE 1 END,
          reset_at = CASE WHEN public.unlock_attempts.reset_at > NOW()
                          THEN public.unlock_attempts.reset_at
                          ELSE NOW() + (${WINDOW_MS / 1000} * INTERVAL '1 second') END
      `;
    } catch (err) {
      console.warn('unlock rate-limit db write failed:', err);
    }
  }
}

async function clearFailures(ip: string) {
  memoryAttempts.delete(ip);
  if (sql) {
    try {
      await ensureTable();
      await sql`DELETE FROM public.unlock_attempts WHERE ip = ${ip}`;
    } catch {}
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// GET: is this browser currently unlocked? (server-verified, cookie is HttpOnly)
export async function GET(req: NextRequest) {
  const unlocked = verifyUnlockToken(req.cookies.get(UNLOCK_COOKIE)?.value);
  return NextResponse.json({ unlocked }, { headers: { 'Cache-Control': 'no-store' } });
}

// POST: username + password -> signed, expiring HttpOnly unlock cookie
export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const username = typeof body?.username === 'string' ? body.username.slice(0, 200) : '';
  const password = typeof body?.password === 'string' ? body.password.slice(0, 500) : '';

  if (!verifyOperatorCredentials(username, password)) {
    await recordFailure(ip);
    await sleep(FAIL_DELAY_MS);
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const token = createUnlockToken();
  if (!token) {
    return NextResponse.json({ error: 'Unlock is not configured on the server.' }, { status: 503 });
  }

  await clearFailures(ip);

  const response = NextResponse.json({ success: true });
  response.headers.set('Cache-Control', 'no-store');
  response.cookies.set(UNLOCK_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: UNLOCK_TTL_SECONDS,
  });
  return response;
}

// DELETE: re-lock this browser
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(UNLOCK_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
