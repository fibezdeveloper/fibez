import { defineConfig } from '@playwright/test';

/**
 * Smoke tests. They call the built app over HTTP (no browser download needed) and check the security
 * behaviour that must never regress: staff and panel routes closed to strangers, no SNI hosts in the
 * public bundles, 2FA and bundle-discount maths.
 *
 *   pnpm build && pnpm test:smoke
 */
const PORT = Number(process.env.SMOKE_PORT) || 3300;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: {
    command: `pnpm exec next start -H 127.0.0.1 -p ${PORT}`,
    // /api/me answers 401 for strangers: any HTTP answer means the server is up.
    url: `http://127.0.0.1:${PORT}/api/me`,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET || 'ci-only-cookie-secret-0123456789abcdef',
      NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL || 'http://127.0.0.1:9/neondb/auth',
      CRON_SECRET: 'ci-only-cron-secret-0123456789',
    },
  },
});
