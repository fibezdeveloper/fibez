import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSessionUser } from '@/lib/dal';
import {
  getOrCreateReferralProfile,
  validateReferralCode,
  redeemUserCredits,
} from '@/lib/referrals';

export async function GET(req: NextRequest) {
  try {
    const user = await getVerifiedSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to view referral rewards' }, { status: 401 });
    }

    const profile = await getOrCreateReferralProfile(user.email, user.name);
    const host = req.headers.get('host') || 'fibez.store';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = `${proto}://${host}`;

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        referralLink: `${origin}/?ref=${profile.referralCode}`,
        creditValueLKR: profile.storeCredits * 10,
        rewardPerFriend: 10, // 10 credits
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch referral profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'validate';

    if (action === 'validate') {
      const code = String(body.code || '').trim();
      const result = await validateReferralCode(code);
      return NextResponse.json({
        success: result.valid,
        valid: result.valid,
        discountLKR: result.discountLKR,
        message: result.valid
          ? `Referral Code "${code}" Applied: Rs. ${result.discountLKR} discount!`
          : 'Invalid or expired referral code',
      });
    }

    if (action === 'redeem') {
      const user = await getVerifiedSessionUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const credits = Number(body.credits) || 0;
      if (credits <= 0) {
        return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 });
      }

      const result = await redeemUserCredits(user.email, credits);
      if (!result.success) {
        return NextResponse.json({ error: 'Insufficient store credits' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        discountLKR: result.discountLKR,
        message: `Applied ${credits} Fibez Credits (Rs. ${result.discountLKR} discount)!`,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Referral operation failed' }, { status: 500 });
  }
}
