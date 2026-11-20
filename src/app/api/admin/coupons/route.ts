import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-store';

export async function GET() {
  try {
    const coupons = adminStore.getCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    const discountPercent = Number(body.discountPercent) || 0;
    const discountFixedLKR = Number(body.discountFixedLKR) || 0;
    const minSpendLKR = Number(body.minSpendLKR) || 0;
    const maxUses = Number(body.maxUses) || 500;
    const expiresAt = body.expiresAt || null;

    if (!code) {
      return NextResponse.json({ error: 'Promo code string is required' }, { status: 400 });
    }

    if (discountPercent <= 0 && discountFixedLKR <= 0) {
      return NextResponse.json(
        { error: 'Either discount percentage or fixed LKR amount must be greater than 0' },
        { status: 400 }
      );
    }

    const created = adminStore.addCoupon({
      code,
      discountPercent,
      discountFixedLKR,
      minSpendLKR,
      maxUses,
      isActive: true,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: `Promo code "${code}" created successfully!`,
      coupon: created,
    });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const toggle = searchParams.get('toggle') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    if (toggle) {
      const activeState = adminStore.toggleCoupon(id);
      return NextResponse.json({
        success: true,
        message: `Promo code status toggled to ${activeState ? 'ACTIVE' : 'PAUSED'}`,
      });
    }

    const deleted = adminStore.deleteCoupon(id);
    return NextResponse.json({
      success: true,
      message: deleted ? 'Promo code deleted' : 'Promo code not found',
    });
  } catch (error: any) {
    console.error('Error mutating coupon:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
