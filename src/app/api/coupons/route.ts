import { NextRequest, NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import { buildRlsContext, getVerifiedSessionUser } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

async function validatePromoCode(code: string) {
  const actor = await getVerifiedSessionUser();

  return withRlsTransaction(buildRlsContext(actor), async (client) => {
    const res = await client.query(
      `SELECT code, discount_percent, discount_fixed_lkr, min_spend_lkr, max_uses, times_used, expires_at
       FROM public.promo_codes
       WHERE UPPER(code) = $1 AND is_active = TRUE
       LIMIT 1`,
      [code]
    );

    if (res.rows.length === 0) {
      return { error: 'Invalid promo code', status: 404 as const };
    }

    const coupon = res.rows[0];
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { error: 'Promo code has expired', status: 400 as const };
    }

    if ((coupon.times_used ?? 0) >= (coupon.max_uses ?? 1000)) {
      return { error: 'Promo code usage limit reached', status: 400 as const };
    }

    return {
      status: 200 as const,
      coupon: {
        valid: true,
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        discountFixedLKR: coupon.discount_fixed_lkr,
        minSpendLKR: coupon.min_spend_lkr,
      },
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Promo code required' }, { status: 400 });
    }

    const result = await validatePromoCode(code);
    if ('error' in result) {
      return NextResponse.json({ valid: false, message: result.error }, { status: result.status });
    }
    return NextResponse.json(result.coupon);
  } catch (error: unknown) {
    unstable_rethrow(error);
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    if (!code) {
      return NextResponse.json({ error: 'Valid code required' }, { status: 400 });
    }

    const result = await validatePromoCode(code);
    if ('error' in result) {
      return NextResponse.json({ valid: false, message: result.error }, { status: result.status });
    }
    return NextResponse.json(result.coupon);
  } catch (error: unknown) {
    unstable_rethrow(error);
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}
