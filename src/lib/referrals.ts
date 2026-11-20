import fs from 'fs';
import path from 'path';

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

const REFERRALS_FILE = path.join(process.cwd(), '.fibez-referrals.json');

function getSeedReferrals(): Record<string, ReferralUserRecord> {
  return {
    'akain@fibez.store': {
      userEmail: 'akain@fibez.store',
      userName: 'Akain (Owner)',
      referralCode: 'AKAIN-89',
      storeCredits: 20,
      invitedCount: 3,
      purchasedCount: 2,
      totalEarnedCredits: 20,
      history: [
        {
          id: 'ref_init_1',
          type: 'FRIEND_PURCHASED',
          friendEmail: 'dev.tester@gmail.com',
          orderNumber: 'FBZ-558291',
          creditsDelta: 10,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          description: 'Earned 10 Fibez Credits! Friend (dev.tester@gmail.com) completed Order FBZ-558291',
        },
        {
          id: 'ref_init_2',
          type: 'FRIEND_PURCHASED',
          friendEmail: 'lankan.netmod@hotmail.com',
          orderNumber: 'FBZ-619204',
          creditsDelta: 10,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          description: 'Earned 10 Fibez Credits! Friend (lankan.netmod@hotmail.com) completed Order FBZ-619204',
        }
      ]
    }
  };
}

function loadReferrals(): Record<string, ReferralUserRecord> {
  try {
    if (fs.existsSync(REFERRALS_FILE)) {
      const content = fs.readFileSync(REFERRALS_FILE, 'utf-8');
      return JSON.parse(content);
    } else {
      const seeds = getSeedReferrals();
      saveReferrals(seeds);
      return seeds;
    }
  } catch (e) {
    console.error('Error reading referrals file:', e);
  }
  return getSeedReferrals();
}

function saveReferrals(data: Record<string, ReferralUserRecord>) {
  try {
    fs.writeFileSync(REFERRALS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving referrals file:', e);
  }
}

/**
 * Gets or initializes the referral profile for a user
 */
export function getOrCreateReferralProfile(userEmail: string, userName?: string): ReferralUserRecord {
  const email = userEmail.trim().toLowerCase();
  const db = loadReferrals();

  if (db[email]) {
    return db[email];
  }

  // Generate unique clean referral code: e.g. "AKAIN-89"
  const prefix = (userName || email.split('@')[0])
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || 'FIBEZ';
  const suffix = Math.floor(10 + Math.random() * 90);
  let code = `${prefix}-${suffix}`;

  // Ensure unique
  const existingCodes = new Set(Object.values(db).map((u) => u.referralCode));
  while (existingCodes.has(code)) {
    code = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const newRecord: ReferralUserRecord = {
    userEmail: email,
    userName: userName || email.split('@')[0],
    referralCode: code,
    storeCredits: 0,
    invitedCount: 0,
    purchasedCount: 0,
    totalEarnedCredits: 0,
    history: [],
  };

  db[email] = newRecord;
  saveReferrals(db);
  return newRecord;
}

/**
 * Validates a referral code and looks up the referrer
 */
export function validateReferralCode(code: string): { valid: boolean; discountLKR: number; referrerEmail?: string } {
  if (!code) return { valid: false, discountLKR: 0 };
  const cleanCode = code.trim().toUpperCase();
  const db = loadReferrals();

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

/**
 * Awards 10 Fibez Store Credits to the referring user when an order is verified
 */
export function awardReferralCredits(params: {
  referralCode: string;
  orderNumber: string;
  buyerEmail: string;
}): { success: boolean; creditsAwarded: number; referrerEmail?: string } {
  const { referralCode, orderNumber, buyerEmail } = params;
  if (!referralCode) return { success: false, creditsAwarded: 0 };

  const cleanCode = referralCode.trim().toUpperCase();
  const db = loadReferrals();

  for (const record of Object.values(db)) {
    if (record.referralCode === cleanCode) {
      // Prevent self-referral
      if (record.userEmail.toLowerCase() === buyerEmail.toLowerCase()) {
        return { success: false, creditsAwarded: 0 };
      }

      // Check if already awarded for this order
      const alreadyAwarded = record.history.some((h) => h.orderNumber === orderNumber);
      if (alreadyAwarded) {
        return { success: true, creditsAwarded: 0, referrerEmail: record.userEmail };
      }

      const creditsToAward = 10; // Exactly 10 Fibez store credits!
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

      saveReferrals(db);
      return { success: true, creditsAwarded: creditsToAward, referrerEmail: record.userEmail };
    }
  }

  return { success: false, creditsAwarded: 0 };
}

/**
 * Redeems store credits for a discount at checkout
 */
export function redeemUserCredits(userEmail: string, creditsToUse: number): { success: boolean; discountLKR: number } {
  const email = userEmail.trim().toLowerCase();
  const db = loadReferrals();
  const record = db[email];

  if (!record || record.storeCredits < creditsToUse) {
    return { success: false, discountLKR: 0 };
  }

  const discountLKR = creditsToUse * 10; // 1 credit = 10 LKR
  record.storeCredits -= creditsToUse;
  record.history.unshift({
    id: `ref_redeem_${Date.now()}`,
    type: 'CREDITS_REDEEMED',
    creditsDelta: -creditsToUse,
    timestamp: new Date().toISOString(),
    description: `Redeemed ${creditsToUse} Credits for Rs. ${discountLKR} discount at checkout`,
  });

  saveReferrals(db);
  return { success: true, discountLKR };
}
