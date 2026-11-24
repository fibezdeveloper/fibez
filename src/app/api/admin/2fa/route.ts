import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getVerifiedSessionUser, isStaffRole } from '@/lib/dal';
import {
  backupCodesLeft,
  beginEnrolment,
  confirmEnrolment,
  hasValidTwoFactorCookie,
  isEnrolled,
  pendingSecret,
  resetTwoFactorForEmail,
  twoFactorCookie,
  twoFactorEnforced,
  verifyTwoFactor,
} from '@/lib/admin-2fa';
import { otpauthUri } from '@/lib/totp';
import { auditLog } from '@/lib/audit';
import { rateLimit, tooMany } from '@/lib/rate-limit';
import { notifyAdmins } from '@/lib/telegram-admin';
import { esc } from '@/lib/telegram';

/**
 * Staff two-factor endpoints. They run with the REAL role (raw: true) because a staff account that has not
 * passed 2FA is otherwise downgraded to a customer everywhere else.
 *
 *   GET                                 -> { enrolled, verified, enforced, backupCodesLeft }
 *   POST { action: 'setup' }            -> { secret, qr (data URL), uri }   start enrolment
 *   POST { action: 'enable', code }     -> { backupCodes }                  confirm first code, turn 2FA on
 *   POST { action: 'verify', code }     -> { ok }                           authenticator or backup code
 *   POST { action: 'reset', email }     -> { ok }                           owner only, after passing 2FA
 */
const noStore = { 'Cache-Control': 'no-store' };

async function staffOr404() {
  const user = await getVerifiedSessionUser({ raw: true });
  if (!user) return { response: NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: noStore }) };
  if (!isStaffRole(user.role)) return { response: NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStore }) };
  return { user };
}

export async function GET() {
  const g = await staffOr404();
  if ('response' in g) return g.response;
  const enrolled = await isEnrolled(g.user.id);
  return NextResponse.json(
    {
      enforced: twoFactorEnforced(),
      enrolled,
      verified: !twoFactorEnforced() || (enrolled && (await hasValidTwoFactorCookie(g.user.id))),
      backupCodesLeft: enrolled ? await backupCodesLeft(g.user.id) : 0,
    },
    { headers: noStore }
  );
}

export async function POST(req: NextRequest) {
  const g = await staffOr404();
  if ('response' in g) return g.response;
  const user = g.user;
  const body = await req.json().catch(() => ({}));
  const action = typeof body.action === 'string' ? body.action : '';
  const code = typeof body.code === 'string' ? body.code.slice(0, 20) : '';

  const rl = await rateLimit('admin-2fa', user.id, 10, 600);
  if (rl.limited) return tooMany(rl.retryAfter, 'Too many attempts. Wait a few minutes and try again.');

  if (action === 'setup') {
    // Enrolment is only offered while 2FA is off. To change a phone, an owner resets the account first.
    if (await isEnrolled(user.id)) {
      return NextResponse.json({ error: 'Two-factor is already on for this account.' }, { status: 409, headers: noStore });
    }
    const started = await beginEnrolment(user.id);
    if (!started) return NextResponse.json({ error: 'Could not start setup.' }, { status: 500, headers: noStore });
    const uri = otpauthUri({ secret: started.secret, account: user.email, issuer: 'Fibez Admin' });
    const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220 });
    return NextResponse.json({ secret: started.secret, uri, qr }, { headers: noStore });
  }

  if (action === 'enable') {
    if (!(await pendingSecret(user.id))) {
      return NextResponse.json({ error: 'Start setup first.' }, { status: 400, headers: noStore });
    }
    const backupCodes = await confirmEnrolment(user.id, code);
    if (!backupCodes) return NextResponse.json({ error: 'That code is not right. Check the app and try again.' }, { status: 400, headers: noStore });
    await auditLog(user, 'TWO_FACTOR_ENABLED', 'USER', user.id, {}, req);
    notifyAdmins(`🔐 <b>2FA turned on</b> for ${esc(user.email)}`);
    const res = NextResponse.json({ ok: true, backupCodes }, { headers: noStore });
    const c = twoFactorCookie(user.id);
    res.cookies.set(c.name, c.value, c.options as never);
    return res;
  }

  if (action === 'verify') {
    const result = await verifyTwoFactor(user.id, code);
    if (!result.ok) {
      await auditLog(user, 'TWO_FACTOR_FAILED', 'USER', user.id, {}, req);
      return NextResponse.json({ error: 'That code is not right or was already used.' }, { status: 400, headers: noStore });
    }
    await auditLog(user, result.usedBackup ? 'TWO_FACTOR_BACKUP_USED' : 'TWO_FACTOR_PASSED', 'USER', user.id, {}, req);
    if (result.usedBackup) notifyAdmins(`🔐 <b>Backup code used</b> by ${esc(user.email)}`);
    const res = NextResponse.json({ ok: true }, { headers: noStore });
    const c = twoFactorCookie(user.id);
    res.cookies.set(c.name, c.value, c.options as never);
    return res;
  }

  if (action === 'reset') {
    // Needs a passed 2FA session as well as the owner role: a stolen password alone can never reset it.
    if (user.role !== 'owner' || !(await hasValidTwoFactorCookie(user.id))) {
      return NextResponse.json({ error: 'Only a verified owner can reset two-factor.' }, { status: 403, headers: noStore });
    }
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400, headers: noStore });
    const done = await resetTwoFactorForEmail(email);
    await auditLog(user, 'TWO_FACTOR_RESET', 'USER', email, { done }, req);
    if (done) notifyAdmins(`🔐 <b>2FA reset</b> for ${esc(email)} by ${esc(user.email)}`);
    return NextResponse.json({ ok: done }, { headers: noStore });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: noStore });
}
