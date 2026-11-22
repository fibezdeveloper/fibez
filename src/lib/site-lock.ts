import crypto from 'crypto';
import { LAUNCH_DATE } from '@/lib/launch-date';

/**
 * Server-side pre-launch lock.
 *
 * The lock is enforced in `src/proxy.ts` BEFORE any page or API route is served.
 * Nothing the browser can set on its own (plain cookies, localStorage) grants access:
 * only an HMAC-signed, expiring, HttpOnly token minted by `POST /api/unlock` does.
 *
 * Required environment variables (the lock fails CLOSED if any is missing):
 *   UNLOCK_USERNAME  operator username
 *   UNLOCK_PASSWORD  operator password
 *   UNLOCK_SECRET    random signing secret, 32+ chars
 */

export { LAUNCH_DATE };
export const UNLOCK_COOKIE = 'fibez_unlocked_token';
export const UNLOCK_TTL_SECONDS = 60 * 60 * 4; // 4 hours, then the operator must log in again

export function isSiteLocked(now: number = Date.now()): boolean {
  return now < LAUNCH_DATE;
}

function getSecret(): string | null {
  const secret = process.env.UNLOCK_SECRET || '';
  return secret.length >= 32 ? secret : null;
}

function hmac(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ah = crypto.createHash('sha256').update(a).digest();
  const bh = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ah, bh);
}

/** Constant-time check of the operator username + password against env config. */
export function verifyOperatorCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.UNLOCK_USERNAME || '';
  const expectedPass = process.env.UNLOCK_PASSWORD || '';
  if (!expectedUser || !expectedPass || !getSecret()) return false;

  // Evaluate both comparisons before combining so timing does not reveal which failed.
  const userOk = safeEqual(username.trim().toLowerCase(), expectedUser.trim().toLowerCase());
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

/** Mint a signed, expiring unlock token. Returns null if the secret is not configured. */
export function createUnlockToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + UNLOCK_TTL_SECONDS * 1000,
      n: crypto.randomBytes(12).toString('hex'),
    }),
    'utf-8'
  ).toString('base64url');
  return `${payload}.${hmac(payload, secret)}`;
}

/** Verify signature and expiry of an unlock token. */
export function verifyUnlockToken(token?: string | null): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!payload || !sig) return false;

  try {
    if (!safeEqual(sig, hmac(payload, secret))) return false;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as { exp?: number };
    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

/** Paths reachable while the site is locked. Everything else needs a valid token. */
export function isLockExempt(pathname: string): boolean {
  return (
    pathname === '/lock' ||
    pathname === '/unlock' ||
    pathname === '/api/unlock' ||
    // Vercel Cron cannot hold the unlock cookie; the route itself requires CRON_SECRET.
    pathname === '/api/cron/usage-snapshot' ||
    pathname === '/api/cron/telegram-reminders' ||
    // Telegram's servers cannot hold the unlock cookie; the route itself checks the webhook secret.
    pathname === '/api/telegram/webhook' ||
    pathname === '/api/telegram/admin-webhook' ||
    pathname.startsWith('/_next/')
  );
}
