import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/dal';
import { dbReady } from '@/lib/db/tx';
import { getBalance, getHistory, listTopups, listRefunds, TOPUP_MIN_LKR, TOPUP_MAX_LKR } from '@/lib/wallet';

// GET /api/wallet: the signed-in user's balance, recent activity and open requests.
export async function GET() {
  const auth = await requireAuth();
  if ('response' in auth) return auth.response;
  if (!dbReady()) return NextResponse.json({ error: 'Wallet is unavailable right now' }, { status: 503 });

  try {
    const uid = auth.user.id;
    const [balanceLkr, history, topups, refunds] = await Promise.all([
      getBalance(uid),
      getHistory(uid, 30),
      listTopups({ userId: uid, limit: 20 }),
      listRefunds({ userId: uid }),
    ]);
    return NextResponse.json(
      {
        balanceLkr,
        history,
        topups: topups.map(({ slip_key, slip_url, ...t }) => t),
        refunds,
        limits: { topupMinLkr: TOPUP_MIN_LKR, topupMaxLkr: TOPUP_MAX_LKR },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Wallet read failed:', err);
    return NextResponse.json({ error: 'Failed to load wallet' }, { status: 500 });
  }
}
