import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Strangers (no session) must never reach staff, panel or customer-only routes.
test.describe('anonymous access is refused', () => {
  const staffGets = ['/api/admin/2fa', '/api/admin/audit', '/api/admin/insights', '/api/admin/v2ray', '/api/admin/wallet', '/api/admin/orders'];
  for (const url of staffGets) {
    test(`GET ${url}`, async ({ request }) => {
      const res = await request.get(url);
      expect([401, 403, 404]).toContain(res.status());
    });
  }

  test('POST admin client_uri', async ({ request }) => {
    const res = await request.post('/api/admin/v2ray', { data: { action: 'client_uri', uuid: '11111111-2222-3333-4444-555555555555', port: 443 } });
    expect([401, 403]).toContain(res.status());
  });

  test('POST admin 2fa verify', async ({ request }) => {
    const res = await request.post('/api/admin/2fa', { data: { action: 'verify', code: '123456' } });
    expect([401, 403, 404]).toContain(res.status());
  });

  test('POST line-check needs sign-in', async ({ request }) => {
    const res = await request.post('/api/v2ray/line-check', { data: { port: 443, sni: 'example.com' } });
    expect(res.status()).toBe(401);
  });

  test('cron endpoints reject a missing or wrong secret', async ({ request }) => {
    for (const p of ['/api/cron/panel-backup', '/api/cron/telegram-reminders', '/api/cron/usage-snapshot']) {
      expect((await request.get(p)).status()).toBe(401);
      expect((await request.get(p, { headers: { authorization: 'Bearer wrong-secret-wrong-secret' } })).status()).toBe(401);
    }
  });
});

test('subscription endpoint never 500s on junk input', async ({ request }) => {
  for (const q of ['', '?uuid=nope', '?uuid=11111111-2222-3333-4444-555555555555&pkg=dialog-zoom-router']) {
    const res = await request.get(`/api/v2ray/sub${q}`);
    expect(res.status()).toBeLessThan(500);
  }
});

test('security headers are set', async ({ request }) => {
  const res = await request.get('/api/me');
  const h = res.headers();
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['content-security-policy']).toBeTruthy();
});

// The SNI hostnames are the product's secret sauce. They live in server-only code; if a client bundle ever
// imports that code again they would be public, so scan everything shipped to browsers.
test('SNI hosts are absent from client bundles', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/v2ray-sni.ts'), 'utf-8');
  const hosts = [...new Set([...source.matchAll(/'([a-z0-9-]+(?:\.[a-z0-9-]+)+)'/g)].map((m) => m[1]))];
  expect(hosts.length).toBeGreaterThan(5);

  const root = path.join(__dirname, '../.next/static');
  test.skip(!fs.existsSync(root), 'run `pnpm build` first');
  const leaks: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(js|css|html|json|txt)$/.test(entry.name)) {
        const text = fs.readFileSync(p, 'utf-8');
        for (const h of hosts) if (text.includes(h)) leaks.push(`${h} in ${path.relative(root, p)}`);
      }
    }
  };
  walk(root);
  expect(leaks).toEqual([]);
});

// Probes seen against production on 2026-11-26: each must be a clean 4xx, never accepted or a 500.
test.describe('checkout and form hardening', () => {
  // A fresh address per run so the checkout rate limit (10 per 10 min per connection) doesn't trip between runs.
  const ip = { 'x-real-ip': `198.51.100.${Math.floor(Math.random() * 250) + 1}` };
  test('crypto payment is refused (no Fibez wallet address exists)', async ({ request }) => {
    const res = await request.post('/api/checkout', { headers: ip, data: { paymentMethod: 'crypto', customerEmail: 'a@b.co', cart: [{ productId: 'x' }] } });
    expect(res.status()).toBe(400);
  });

  test('crafted slip paths are refused', async ({ request }) => {
    for (const receiptUrl of [
      'https://x.storage.c-2.ap-southeast-1.aws.neon.tech/uploads/slips/../../etc/passwd',
      'https://x.storage.c-2.ap-southeast-1.aws.neon.tech/uploads/slips/%2e%2e/%2e%2e/etc/passwd',
      'https://evil.example/uploads/slips/a.png',
      'javascript:alert(1)',
    ]) {
      const res = await request.post('/api/checkout', { headers: ip, data: { paymentMethod: 'bank_transfer', customerEmail: 'a@b.co', receiptUrl, cart: [{ productId: 'x' }] } });
      expect(res.status(), receiptUrl).toBe(400);
      expect((await res.json()).error).toContain('slip');
    }
  });

  test('junk promo codes are a 400, not a database error', async ({ request }) => {
    expect((await request.get('/api/coupons?code=%00abc')).status()).toBe(400);
    expect((await request.post('/api/coupons', { data: { code: "x' OR '1'='1" } })).status()).toBe(400);
  });

  test('upload without a form body is a 400', async ({ request }) => {
    const res = await request.post('/api/upload', { data: { file: 'x' } });
    expect([400, 429]).toContain(res.status());
  });
});

test('blocked scanner address is refused everywhere', async ({ request }) => {
  for (const p of ['/', '/api/me', '/api/checkout']) {
    const res = await request.get(p, { headers: { 'x-real-ip': '82.29.129.168' } });
    expect(res.status(), p).toBe(403);
  }
});
