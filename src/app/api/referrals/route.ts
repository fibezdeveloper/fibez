import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSessionUser } from '@/lib/dal';
import { dbReady } from '@/lib/db/tx';
import { getBalance, getHistory, getOrCreateReferralCode, findReferrerByCode, referralStats, REFERRAL_BONUS_LKR } from '@/lib/wallet';

// Referral rewards are paid into the user's WALLET (see src/lib/wallet.ts). The old "store credits"
// are gone; the response keeps a compatible shape so existing screens keep working.
export async function GET(req: NextRequest) {
  try {
    const user = await getVerifiedSessionUser();
    if (!user) return NextResponse.json({ error: 'Please log in to view referral rewards' }, { status: 401 });
    if (!dbReady()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

    const [code, balance, stats, ledger] = await Promise.all([
      getOrCreateReferralCode(user.id, user.email, user.name),
      getBalance(user.id),
      referralStats(user.id),
      getHistory(user.id, 50),
    ]);

    const host = req.headers.get('host') || 'fibez.store';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');

    return NextResponse.json(
      {
        success: true,
        profile: {
          referralCode: code,
          referralLink: `${proto}://${host}/?ref=${code}`,
          balanceLkr: balance,
          creditValueLKR: balance,
          storeCredits: Math.floor(balance / 10), // legacy display unit (1 credit = Rs. 10)
          invitedCount: stats.rewardedFriends,
          purchasedCount: stats.rewardedFriends,
          totalEarnedCredits: Math.floor(stats.totalEarnedLkr / 10),
          totalEarnedLkr: stats.totalEarnedLkr,
          rewardPerFriendLkr: REFERRAL_BONUS_LKR,
          history: ledger
            .filter((l) => l.entry_type === 'REFERRAL_BONUS')
            .map((l) => ({
              id: l.id,
              type: 'FRIEND_PURCHASED',
              orderNumber: l.ref_id,
              creditsDelta: Math.floor(l.amount_lkr / 10),
              timestamp: l.created_at,
              description: l.reason || 'Referral reward',
            })),
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Referral profile failed:', error);
    return NextResponse.json({ error: 'Failed to fetch referral profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'validate';

    if (action === 'validate') {
      const code = String(body.code || '').trim();
      const referrer = dbReady() && code ? await findReferrerByCode(code) : null;
      const valid = Boolean(referrer);
      return NextResponse.json({
        success: valid,
        valid,
        discountLKR: valid ? 50 : 0,
        message: valid ? `Referral Code "${code}" Applied: Rs. 50 discount!` : 'Invalid or expired referral code',
      });
    }

    if (action === 'redeem') {
      return NextResponse.json({ error: 'Store credits are now your wallet balance: choose "Pay with wallet" at checkout.' }, { status: 410 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Referral operation failed:', error);
    return NextResponse.json({ error: 'Referral operation failed' }, { status: 500 });
  }
}
