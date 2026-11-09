import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Promo code required' }, { status: 400 });
    }

    const rows = await sql`
      SELECT * FROM promo_codes 
      WHERE UPPER(code) = ${code} AND is_active = TRUE
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ valid: false, message: 'Invalid promo code' }, { status: 404 });
    }

    const coupon = rows[0];
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: 'Promo code has expired' }, { status: 400 });
    }

    if (coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ valid: false, message: 'Promo code usage limit reached' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discount_percent,
      discountFixedLKR: coupon.discount_fixed_lkr,
      minSpendLKR: coupon.min_spend_lkr,
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code?.trim().toUpperCase();
    if (!code || !sql) {
      return NextResponse.json({ error: 'Valid code required' }, { status: 400 });
    }

    const rows = await sql`
      SELECT * FROM promo_codes 
      WHERE UPPER(code) = ${code} AND is_active = TRUE
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ valid: false, message: 'Invalid promo code' }, { status: 404 });
    }

    const coupon = rows[0];
    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discount_percent,
      discountFixedLKR: coupon.discount_fixed_lkr,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
