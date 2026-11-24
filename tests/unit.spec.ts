import { test, expect } from '@playwright/test';
import { base32Encode, verifyTotp } from '../src/lib/totp';
import { safeCallbackPath } from '../src/lib/safe-redirect';
import { bundleDiscount } from '../src/lib/bundle-discount';

test.describe('totp (RFC 6238 SHA-1 vectors)', () => {
  const secret = base32Encode(Buffer.from('12345678901234567890'));

  test('accepts the official code for T=59s', () => {
    expect(verifyTotp(secret, '287082', 59_000)).toBe(1);
  });

  test('accepts the official code for T=1111111109s', () => {
    expect(verifyTotp(secret, '081804', 1_111_111_109_000)).toBe(37037036);
  });

  test('allows one 30s step of drift but not more', () => {
    expect(verifyTotp(secret, '287082', 59_000 + 30_000)).toBe(1);
    expect(verifyTotp(secret, '287082', 59_000 + 90_000)).toBeNull();
  });

  test('rejects wrong, short and non-numeric codes', () => {
    expect(verifyTotp(secret, '000000', 59_000)).toBeNull();
    expect(verifyTotp(secret, '12345', 59_000)).toBeNull();
    expect(verifyTotp(secret, 'abcdef', 59_000)).toBeNull();
  });
});

test.describe('safeCallbackPath (open redirect guard)', () => {
  const bad = ['https://evil.example', '//evil.example', '/' + String.fromCharCode(92) + 'evil.example', 'javascript:alert(1)', '/ok\nbad', 'evil.example', ''];
  for (const value of bad) {
    test(`blocks ${JSON.stringify(value)}`, () => {
      expect(safeCallbackPath(value)).toBe('/dashboard');
    });
  }
  test('keeps same-site paths', () => {
    expect(safeCallbackPath('/v2ray/dashboard?tab=1')).toBe('/v2ray/dashboard?tab=1');
    expect(safeCallbackPath(null, '/x')).toBe('/x');
  });
});

test.describe('bundleDiscount', () => {
  const line = (quantity: number, isV2Ray = true) => ({ isV2Ray, quantity, subtotalLKR: quantity * 1000 });

  test('no discount under 3 lines', () => {
    expect(bundleDiscount([line(2)]).discountLKR).toBe(0);
  });
  test('5% at 3 lines, 10% at 5', () => {
    expect(bundleDiscount([line(3)]).discountLKR).toBe(150);
    expect(bundleDiscount([line(2), line(3)]).discountLKR).toBe(500);
  });
  test('shop products never count', () => {
    expect(bundleDiscount([line(5, false)]).discountLKR).toBe(0);
  });
  test('tells how many more lines reach the next tier', () => {
    expect(bundleDiscount([line(3)]).nextTier).toEqual({ moreLines: 2, percent: 10 });
  });
});
