import { createNeonAuth } from '@neon/auth/next/server';

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ||
  (isBuildPhase || process.env.NODE_ENV !== 'production'
    ? 'fibez-dev-build-only-placeholder-secret-32chars'
    : '');

if (!cookieSecret || cookieSecret.length < 32) {
  throw new Error('NEON_AUTH_COOKIE_SECRET must be set and at least 32 characters long');
}

const baseUrl =
  process.env.NEON_AUTH_BASE_URL ||
  (isBuildPhase ? 'https://build-placeholder.invalid/neondb/auth' : '');

if (!baseUrl) {
  throw new Error('NEON_AUTH_BASE_URL must be configured');
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sessionDataTtl: 300,
  },
});
