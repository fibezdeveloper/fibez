import * as crypto from 'crypto';

/**
 * RFC 6238 time-based one-time passwords (Google Authenticator, Authy, 1Password...).
 * SHA-1, 6 digits, 30 second step: the combination every authenticator app supports.
 */
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx < 0) throw new Error('Invalid base32 secret');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** 160-bit random secret, base32 encoded (what authenticator apps expect). */
export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

function hotp(secret: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', secret).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(bin % 10 ** DIGITS).padStart(DIGITS, '0');
}

/** The code an authenticator app would show right now. Used by tests; the server only ever verifies. */
export function generateTotp(secretB32: string, nowMs = Date.now()): string {
  return hotp(base32Decode(secretB32), currentStep(nowMs));
}

export function currentStep(nowMs = Date.now()): number {
  return Math.floor(nowMs / 1000 / STEP_SECONDS);
}

/**
 * Checks a 6-digit code against the secret, allowing one step of clock drift either way.
 * Returns the matching step number (so the caller can refuse to accept the same step twice) or null.
 */
export function verifyTotp(secretB32: string, code: string, nowMs = Date.now()): number | null {
  const clean = String(code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean)) return null;
  let secret: Buffer;
  try {
    secret = base32Decode(secretB32);
  } catch {
    return null;
  }
  const now = currentStep(nowMs);
  let matched: number | null = null;
  // Check every window (no early exit) so timing does not reveal which step matched.
  for (const drift of [-1, 0, 1]) {
    const step = now + drift;
    const want = Buffer.from(hotp(secret, step));
    const got = Buffer.from(clean);
    if (want.length === got.length && crypto.timingSafeEqual(want, got)) matched = step;
  }
  return matched;
}

export function otpauthUri(params: { secret: string; account: string; issuer: string }): string {
  const label = `${encodeURIComponent(params.issuer)}:${encodeURIComponent(params.account)}`;
  const q = new URLSearchParams({
    secret: params.secret,
    issuer: params.issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${q.toString()}`;
}
