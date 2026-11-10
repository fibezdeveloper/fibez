import * as crypto from 'crypto';
import { connection, NextRequest, NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import { auth } from '@/lib/auth';
import { sql as adminSql } from '@/lib/db';
import type { RlsContext } from '@/lib/db/rls';

export type ValidRole = 'user' | 'admin' | 'owner';

export interface VerifiedSessionUser {
  id: string;
  email: string;
  name: string;
  role: ValidRole;
}

export const RECENT_ORDER_COOKIE_NAME = 'fibez_recent_order';
const RECENT_ORDER_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function getHmacSecret(): string {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET || process.env.AUTH_SECRET || '';
  if (!secret || secret.length < 32) {
    throw new Error('NEON_AUTH_COOKIE_SECRET must be configured for cryptographic signing');
  }
  return secret;
}

/**
 * Verifies the Neon Auth session AND resolves the user's live authoritative role
 * and ban status from PostgreSQL (`neon_auth."user"`).
 */
export async function getVerifiedSessionUser(): Promise<VerifiedSessionUser | null> {
  await connection();
  try {
    const { data: sessionData } = await auth.getSession();
    const sessionUser = sessionData?.user;
    if (!sessionUser?.id) {
      return null;
    }

    if (!adminSql) {
      return null;
    }

    const rows = await adminSql`
      SELECT id::text AS id, email, name, role, banned, "banExpires" AS ban_expires
      FROM neon_auth."user"
      WHERE id::text = ${sessionUser.id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    if (row.banned) {
      const expiresAt = row.ban_expires ? new Date(row.ban_expires).getTime() : null;
      if (expiresAt === null || expiresAt > Date.now()) {
        return null;
      }
    }

    const email = String(row.email || sessionUser.email || '').trim().toLowerCase();
    if (!email) {
      return null;
    }

    const normalizedRole: ValidRole =
      row.role === 'owner' ? 'owner' : row.role === 'admin' ? 'admin' : 'user';

    return {
      id: String(row.id),
      email,
      name: String(row.name || sessionUser.name || email.split('@')[0]),
      role: normalizedRole,
    };
  } catch (err) {
    unstable_rethrow(err);
    console.error('Failed to verify session user:', err);
    return null;
  }
}

export async function requireAuth(): Promise<
  { user: VerifiedSessionUser } | { response: NextResponse }
> {
  const user = await getVerifiedSessionUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  return { user };
}

export async function requireRole(
  allowedRoles: ValidRole[]
): Promise<{ user: VerifiedSessionUser } | { response: NextResponse }> {
  const authResult = await requireAuth();
  if ('response' in authResult) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.user.role)) {
    return {
      response: NextResponse.json(
        { error: 'Forbidden: insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

export function buildRlsContext(
  user: VerifiedSessionUser | null,
  extras?: Pick<RlsContext, 'recentOrderNumber' | 'checkoutOrderId'>
): RlsContext {
  return {
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    userRole: user ? user.role : 'anonymous',
    recentOrderNumber: extras?.recentOrderNumber ?? null,
    checkoutOrderId: extras?.checkoutOrderId ?? null,
  };
}

export function isStaffRole(role: ValidRole | string | undefined | null): boolean {
  return role === 'admin' || role === 'owner';
}

export function signRecentOrderToken(orderNumber: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      orderNumber: orderNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      exp: Date.now() + RECENT_ORDER_TTL_MS,
    }),
    'utf-8'
  ).toString('base64url');

  const sig = crypto
    .createHmac('sha256', getHmacSecret())
    .update(payload)
    .digest('base64url');

  return `${payload}.${sig}`;
}

export function verifyRecentOrderToken(
  token: string | undefined | null
): { orderNumber: string; email: string } | null {
  if (!token || !token.includes('.')) return null;

  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;

    const expectedSig = crypto
      .createHmac('sha256', getHmacSecret())
      .update(payload)
      .digest('base64url');

    const sigBuf = Buffer.from(sig, 'utf-8');
    const expectedBuf = Buffer.from(expectedSig, 'utf-8');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      orderNumber?: string;
      email?: string;
      exp?: number;
    };

    if (!decoded.orderNumber || !decoded.email || typeof decoded.exp !== 'number') {
      return null;
    }
    if (decoded.exp < Date.now()) {
      return null;
    }

    return {
      orderNumber: decoded.orderNumber.toUpperCase(),
      email: decoded.email.toLowerCase(),
    };
  } catch {
    return null;
  }
}

export function getRecentOrderNumberFromRequest(req: NextRequest): string | null {
  const cookieVal = req.cookies.get(RECENT_ORDER_COOKIE_NAME)?.value;
  const parsed = verifyRecentOrderToken(cookieVal);
  return parsed ? parsed.orderNumber : null;
}

export { adminSql };
