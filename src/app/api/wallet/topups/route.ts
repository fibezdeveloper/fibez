import { rateLimit } from '@/lib/rate-limit';
import { adminAlerts, notifyAdmins } from '@/lib/telegram-admin';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/dal';
import { dbReady } from '@/lib/db/tx';
import { uploadObject, BUCKET_NAME } from '@/lib/storage';
import { createTopup, listTopups, TOPUP_MIN_LKR, TOPUP_MAX_LKR } from '@/lib/wallet';

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, { ext: string; sig: (b: Buffer) => boolean }> = {
  'image/jpeg': { ext: 'jpg', sig: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', sig: (b) => b[0] === 0x89 && b.subarray(1, 4).toString('ascii') === 'PNG' },
  'image/webp': { ext: 'webp', sig: (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP' },
  'application/pdf': { ext: 'pdf', sig: (b) => b.subarray(0, 5).toString('ascii') === '%PDF-' },
};


// GET: the user's own top-up requests
export async function GET() {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!dbReady()) return NextResponse.json({ error: 'Wallet is unavailable right now' }, { status: 503 });
  const rows = await listTopups({ userId: auth.user.id, limit: 50 });
  return NextResponse.json({ topups: rows.map(({ slip_key, slip_url, ...t }) => t) });
}

// POST (multipart): amount + bank reference + slip -> a PENDING top-up. Money is credited only
// after staff verify the transfer in the bank and approve it.
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!dbReady()) return NextResponse.json({ error: 'Wallet is unavailable right now' }, { status: 503 });
  const user = auth.user;

  if ((await rateLimit('topup', user.id, 6, 3600)).limited) {
    return NextResponse.json({ error: 'Too many top-up requests. Please try again later.' }, { status: 429 });
  }

  try {
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: 'Send the top-up as a form upload.' }, { status: 400 });
    const amount = Math.round(Number(form.get('amount')));
    const bankReference = String(form.get('bankReference') || '').trim();
    const file = form.get('slip') as File | null;

    if (!Number.isFinite(amount) || amount < TOPUP_MIN_LKR || amount > TOPUP_MAX_LKR) {
      return NextResponse.json({ error: `Top-up must be between Rs. ${TOPUP_MIN_LKR} and Rs. ${TOPUP_MAX_LKR.toLocaleString()}.` }, { status: 400 });
    }
    if (!/^[A-Za-z0-9\-_/]{6,40}$/.test(bankReference)) {
      return NextResponse.json({ error: 'Enter the bank transaction reference exactly as shown on your slip (6-40 letters/numbers).' }, { status: 400 });
    }
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Please attach your bank slip.' }, { status: 400 });
    }
    const type = TYPES[file.type];
    if (!type) return NextResponse.json({ error: 'Slip must be a JPG, PNG, WEBP or PDF.' }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Slip is too large (max 8 MB).' }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!type.sig(bytes)) {
      return NextResponse.json({ error: 'That file is not a valid image/PDF.' }, { status: 400 });
    }

    // Same image can back only one live top-up (also catches re-uploads under a different name).
    const slipHash = crypto.createHash('sha256').update(bytes).digest('hex');
    const slipKey = `slips/topup-${Date.now()}-${crypto.randomBytes(5).toString('hex')}.${type.ext}`;
    const slipUrl = await uploadObject({ key: slipKey, body: bytes, contentType: file.type, bucket: BUCKET_NAME });

    const res = await createTopup({
      userId: user.id,
      userEmail: user.email,
      amount,
      bankReference,
      slipUrl,
      slipKey,
      slipHash,
    });
    if (!res.ok) {
      const msg =
        res.reason === 'DUPLICATE_REFERENCE'
          ? 'That bank reference was already submitted.'
          : res.reason === 'DUPLICATE_SLIP'
          ? 'That slip was already submitted.'
          : 'You already have 3 top-ups waiting for review. Please wait for them to be checked.';
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    const alert = adminAlerts.newTopup({ id: res.id, email: user.email, amount, reference: bankReference });
    notifyAdmins(alert.html, alert.rows);
    return NextResponse.json({ success: true, id: res.id, message: 'Top-up submitted. Your wallet is credited after we verify the transfer.' });
  } catch (err) {
    console.error('Top-up failed:', err);
    return NextResponse.json({ error: 'Could not submit the top-up. Please try again.' }, { status: 500 });
  }
}
