import 'server-only';
import * as crypto from 'crypto';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { generateTotpSecret, verifyTotp } from '@/lib/totp';

/**
 * Two-factor sign-in for staff (admin / owner), Google Authenticator compatible.
 *
 *  - Signing in with the password is not enough to act as staff. Until the one-time code is entered, a
 *    staff account is treated as an ordinary customer by getVerifiedSessionUser (see dal.ts).
 *  - The TOTP secret is stored AES-256-GCM encrypted. The "2FA passed" marker is an HMAC-signed,
 *    HttpOnly, SameSite=Strict cookie bound to the user id, valid for 8 hours.
 *  - Each authenticator code works once (replay protection). 8 one-time backup codes are issued at setup.
 *  - Emergency switch: set ADMIN_2FA_DISABLED=1 in the server env (only someone with Vercel access can).
 */
export const TWO_FA_COOKIE = 'fibez_admin_2fa';
const COOKIE_TTL_MS = 8 * 60 * 60 * 1000;
const BACKUP_CODE_COUNT = 8;

export const twoFactorEnforced = () => process.env.ADMIN_2FA_DISABLED !== '1';

function rootSecret(): string {
  const s = process.env.NEON_AUTH_COOKIE_SECRET || process.env.AUTH_SECRET || '';
  if (s.length < 32) throw new Error('NEON_AUTH_COOKIE_SECRET must be configured for 2FA');
  return s;
}

function derive(label: string): Buffer {
  return Buffer.from(crypto.hkdfSync('sha256', rootSecret(), 'fibez-admin-2fa', label, 32));
}

function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', derive('secret-key'), iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString('base64');
}

function decrypt(blob: string): string {
  const raw = Buffer.from(blob, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', derive('secret-key'), raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
}

const hashCode = (code: string) =>
  crypto.createHmac('sha256', derive('backup-code')).update(code.toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex');

let ready = false;
async function ensureTable() {
  if (!sql || ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS public.admin_2fa (
      user_id       TEXT        PRIMARY KEY,
      secret_enc    TEXT        NOT NULL,
      enabled       BOOLEAN     NOT NULL DEFAULT FALSE,
      last_step     BIGINT      NOT NULL DEFAULT 0,
      backup_hashes TEXT[]      NOT NULL DEFAULT '{}',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      enabled_at    TIMESTAMPTZ
    )
  `;
  await sql`ALTER TABLE public.admin_2fa ENABLE ROW LEVEL SECURITY`;
  ready = true;
}

// ------------------------------------------------------------------ session cookie

function sign(payload: string): string {
  return crypto.createHmac('sha256', derive('cookie')).update(payload).digest('base64url');
}

export function twoFactorCookie(userId: string): { name: string; value: string; options: Record<string, unknown> } {
  const exp = Date.now() + COOKIE_TTL_MS;
  const payload = `${userId}.${exp}`;
  return {
    name: TWO_FA_COOKIE,
    value: `${payload}.${sign(payload)}`,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: Math.floor(COOKIE_TTL_MS / 1000),
    },
  };
}

function cookieValidFor(userId: string, value: string | undefined): boolean {
  if (!value) return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [uid, exp, sig] = parts;
  if (uid !== userId || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const want = Buffer.from(sign(`${uid}.${exp}`));
  const got = Buffer.from(sig);
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}

/** True when this browser has passed the code check for this user (reads the request cookies). */
export async function hasValidTwoFactorCookie(userId: string): Promise<boolean> {
  try {
    const store = await cookies();
    return cookieValidFor(userId, store.get(TWO_FA_COOKIE)?.value);
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------ enrolment + verification

export async function isEnrolled(userId: string): Promise<boolean> {
  if (!sql) return false;
  await ensureTable();
  const rows = await sql`SELECT 1 FROM public.admin_2fa WHERE user_id = ${userId} AND enabled = TRUE`;
  return rows.length > 0;
}

/** Starts (or restarts) enrolment. Refuses when 2FA is already active: reset it first. */
export async function beginEnrolment(userId: string): Promise<{ secret: string } | null> {
  if (!sql) return null;
  await ensureTable();
  const secret = generateTotpSecret();
  const rows = await sql`
    INSERT INTO public.admin_2fa (user_id, secret_enc, enabled, last_step)
    VALUES (${userId}, ${encrypt(secret)}, FALSE, 0)
    ON CONFLICT (user_id) DO UPDATE SET secret_enc = EXCLUDED.secret_enc, last_step = 0, created_at = now()
    WHERE public.admin_2fa.enabled = FALSE
    RETURNING user_id
  `;
  return rows.length > 0 ? { secret } : null;
}

export async function pendingSecret(userId: string): Promise<string | null> {
  if (!sql) return null;
  await ensureTable();
  const rows = await sql`SELECT secret_enc FROM public.admin_2fa WHERE user_id = ${userId} AND enabled = FALSE`;
  if (rows.length === 0) return null;
  try {
    return decrypt(String(rows[0].secret_enc));
  } catch {
    return null;
  }
}

function makeBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_COUNT }, () => {
    const hex = crypto.randomBytes(5).toString('hex').toUpperCase();
    return `${hex.slice(0, 5)}-${hex.slice(5)}`;
  });
}

/** Confirms the first code from the app, turns 2FA on and returns the backup codes (shown once). */
export async function confirmEnrolment(userId: string, code: string): Promise<string[] | null> {
  const secret = await pendingSecret(userId);
  if (!sql || !secret) return null;
  const step = verifyTotp(secret, code);
  if (step === null) return null;
  const codes = makeBackupCodes();
  const rows = await sql`
    UPDATE public.admin_2fa
    SET enabled = TRUE, enabled_at = now(), last_step = ${step}, backup_hashes = ${codes.map(hashCode)}
    WHERE user_id = ${userId} AND enabled = FALSE
    RETURNING user_id
  `;
  return rows.length > 0 ? codes : null;
}

/** Checks an authenticator code (once per 30s step) or a backup code (once ever). */
export async function verifyTwoFactor(userId: string, code: string): Promise<{ ok: boolean; usedBackup?: boolean }> {
  if (!sql) return { ok: false };
  await ensureTable();
  const rows = await sql`SELECT secret_enc FROM public.admin_2fa WHERE user_id = ${userId} AND enabled = TRUE`;
  if (rows.length === 0) return { ok: false };

  const trimmed = String(code || '').trim();
  if (/^\d{3}\s?\d{3}$/.test(trimmed)) {
    let secret: string;
    try {
      secret = decrypt(String(rows[0].secret_enc));
    } catch {
      return { ok: false };
    }
    const step = verifyTotp(secret, trimmed);
    if (step === null) return { ok: false };
    // Atomic: the same step can never be accepted twice.
    const claimed = await sql`
      UPDATE public.admin_2fa SET last_step = ${step}
      WHERE user_id = ${userId} AND enabled = TRUE AND last_step < ${step}
      RETURNING user_id
    `;
    return { ok: claimed.length > 0 };
  }

  if (/^[A-Fa-f0-9]{5}-?[A-Fa-f0-9]{5}$/.test(trimmed)) {
    const h = hashCode(trimmed);
    const used = await sql`
      UPDATE public.admin_2fa SET backup_hashes = array_remove(backup_hashes, ${h})
      WHERE user_id = ${userId} AND enabled = TRUE AND ${h} = ANY(backup_hashes)
      RETURNING user_id
    `;
    return { ok: used.length > 0, usedBackup: used.length > 0 };
  }
  return { ok: false };
}

export async function backupCodesLeft(userId: string): Promise<number> {
  if (!sql) return 0;
  await ensureTable();
  const rows = await sql`SELECT cardinality(backup_hashes) AS n FROM public.admin_2fa WHERE user_id = ${userId} AND enabled = TRUE`;
  return rows.length ? Number(rows[0].n) : 0;
}

/** Owner tool: wipe a staff member's 2FA (lost phone and backup codes). They must enrol again. */
export async function resetTwoFactorForEmail(email: string): Promise<boolean> {
  if (!sql) return false;
  await ensureTable();
  const rows = await sql`
    DELETE FROM public.admin_2fa
    WHERE user_id IN (SELECT id::text FROM neon_auth."user" WHERE lower(email) = ${email.trim().toLowerCase()})
    RETURNING user_id
  `;
  return rows.length > 0;
}
