import { adminStore } from '@/lib/admin-store';

export interface ReferralUserRecord {
  userEmail: string;
  userName: string;
  referralCode: string;
  storeCredits: number; // 1 credit = 10 LKR
  invitedCount: number;
  purchasedCount: number;
  totalEarnedCredits: number;
  referredByCode?: string | null;
  history: {
    id: string;
    type: 'FRIEND_JOINED' | 'FRIEND_PURCHASED' | 'CREDITS_REDEEMED';
    friendEmail?: string;
    orderNumber?: string;
    creditsDelta: number;
    timestamp: string;
    description: string;
  }[];
}

// Referral data lives in the same Postgres-backed store as orders (see admin-store.ts) so it
// persists on Vercel, and every change is an atomic read-modify-write: credits cannot be
// double-spent by two simultaneous checkouts.

/** Gets or initializes the referral profile for a user. */
export async function getOrCreateReferralProfile(
  userEmail: string,
  userName?: string
): Promise<ReferralUserRecord> {
  const email = userEmail.trim().toLowerCase();

  return adminStore.mutateReferrals((db) => {
    if (db[email]) return db[email];

    const prefix =
      (userName || email.split('@')[0])
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6) || 'FIBEZ';
    let code = `${prefix}-${Math.floor(10 + Math.random() * 90)}`;

    const existingCodes = new Set(Object.values(db).map((u) => u.referralCode));
    while (existingCodes.has(code)) {
      code = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const record: ReferralUserRecord = {
      userEmail: email,
      userName: userName || email.split('@')[0],
      referralCode: code,
      storeCredits: 0,
      invitedCount: 0,
      purchasedCount: 0,
      totalEarnedCredits: 0,
      history: [],
    };
    db[email] = record;
    return record;
  });
}

/** Validates a referral code and looks up the referrer. */
export async function validateReferralCode(
  code: string
): Promise<{ valid: boolean; discountLKR: number; referrerEmail?: string }> {
  if (!code) return { valid: false, discountLKR: 0 };
  const cleanCode = code.trim().toUpperCase();
  const db = await adminStore.getReferrals();

  for (const record of Object.values(db)) {
    if (record.referralCode === cleanCode) {
      return {
        valid: true,
        discountLKR: 50, // Friend gets 50 LKR off their purchase
        referrerEmail: record.userEmail,
      };
    }
  }
  return { valid: false, discountLKR: 0 };
}

/** Awards 10 Fibez store credits to the referrer when an order is verified. */
export async function awardReferralCredits(params: {
  referralCode: string;
  orderNumber: string;
  buyerEmail: string;
}): Promise<{ success: boolean; creditsAwarded: number; referrerEmail?: string }> {
  const { referralCode, orderNumber, buyerEmail } = params;
  if (!referralCode) return { success: false, creditsAwarded: 0 };
  const cleanCode = referralCode.trim().toUpperCase();

  return adminStore.mutateReferrals((db) => {
    for (const record of Object.values(db)) {
      if (record.referralCode !== cleanCode) continue;

      if (record.userEmail.toLowerCase() === buyerEmail.toLowerCase()) {
        return { success: false, creditsAwarded: 0 }; // no self-referral
      }
      if (record.history.some((h) => h.orderNumber === orderNumber)) {
        return { success: true, creditsAwarded: 0, referrerEmail: record.userEmail };
      }

      const creditsToAward = 10;
      record.storeCredits += creditsToAward;
      record.purchasedCount += 1;
      record.totalEarnedCredits += creditsToAward;
      record.history.unshift({
        id: `ref_award_${Date.now()}`,
        type: 'FRIEND_PURCHASED',
        friendEmail: buyerEmail,
        orderNumber,
        creditsDelta: creditsToAward,
        timestamp: new Date().toISOString(),
        description: `Earned 10 Fibez Credits! Friend (${buyerEmail}) completed Order ${orderNumber}`,
      });
      return { success: true, creditsAwarded: creditsToAward, referrerEmail: record.userEmail };
    }
    return { success: false, creditsAwarded: 0 };
  });
}

/** Redeems store credits for a discount at checkout (atomic check + debit). */
export async function redeemUserCredits(
  userEmail: string,
  creditsToUse: number
): Promise<{ success: boolean; discountLKR: number }> {
  const email = userEmail.trim().toLowerCase();
  const credits = Math.floor(creditsToUse);
  if (!Number.isFinite(credits) || credits <= 0) return { success: false, discountLKR: 0 };

  return adminStore.mutateReferrals((db) => {
    const record = db[email];
    if (!record || record.storeCredits < credits) {
      return { success: false, discountLKR: 0 };
    }
    const discountLKR = credits * 10; // 1 credit = 10 LKR
    record.storeCredits -= credits;
    record.history.unshift({
      id: `ref_redeem_${Date.now()}`,
      type: 'CREDITS_REDEEMED',
      creditsDelta: -credits,
      timestamp: new Date().toISOString(),
      description: `Redeemed ${credits} Credits for Rs. ${discountLKR} discount at checkout`,
    });
    return { success: true, discountLKR };
  });
}
