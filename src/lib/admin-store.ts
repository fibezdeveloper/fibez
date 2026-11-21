import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sql as adminSql } from '@/lib/db';
import { PRODUCTS } from '@/lib/products';
import type { ReferralUserRecord } from '@/lib/referrals';
import * as db from '@/lib/store-db';

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  variantTitle?: string;
  quantity: number;
  unitPriceLKR: number;
  subtotalLKR: number;
  dispensedKey?: string | null;
  keyType?: string;
  guideMarkdown?: string;
  warranty?: string;
  status: 'DELIVERED' | 'PENDING' | 'REVOKED';
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp?: string | null;
  totalAmountLKR: number;
  totalAmountUSD: number;
  currency: 'LKR' | 'USD';
  paymentMethod: 'bank_transfer' | 'crypto' | 'gateway' | 'staff_grant' | 'wallet';
  paymentStatus: 'PENDING_PAYMENT' | 'PENDING_REVIEW' | 'VERIFIED' | 'FAILED' | 'REFUNDED';
  fulfillmentStatus: 'PENDING' | 'PROCESSING' | 'MINTED' | 'DELIVERED' | 'REVOKED';
  receiptImageUrl?: string | null;
  receiptUploadedAt?: string | null;
  promoCode?: string | null;
  bankName?: string | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  grantType?: 'FREE_GIFT' | 'MANUAL_CASH' | 'STAFF_GIVEAWAY' | 'WARRANTY_REPLACEMENT' | null;
  renewOrderId?: string | null;
  existingUuid?: string | null;
  referralCode?: string | null;
  referralCreditsAwarded?: number;
  userId?: string | null;
  /** When the product was delivered (starts the refund window). */
  deliveredAt?: string | null;
  /** Customer confirmed they received it and it works (closes the refund window). */
  receivedConfirmedAt?: string | null;
  /** Server-side bookkeeping, e.g. the 3x-ui clients created for this order (so they can be revoked). */
  metadata?: { panelClients?: { email: string; uuid: string }[]; [k: string]: unknown };
  receiptAnalysis?: any;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

export interface AdminInventoryItem {
  id: string;
  productId: string;
  productTitle: string;
  stockType: 'SERIAL_KEY' | 'ACCOUNT_CREDENTIALS' | 'CONNECTION_CONFIG' | 'INVITE_LINK';
  keyPayload: string;
  status: 'AVAILABLE' | 'DISPENSED' | 'RESERVED';
  batchReference?: string;
  dispensedToEmail?: string | null;
  dispensedOrderId?: string | null;
  createdAt: string;
}

export interface AdminPromoCode {
  id: string;
  code: string;
  discountPercent: number;
  discountFixedLKR: number;
  minSpendLKR: number;
  maxUses: number;
  timesUsed: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface AdminPackageOverride {
  id: string;
  title?: string;
  isp?: string;
  categoryLabel?: string;
  reloadCode?: string;
  carrierSpeedNote?: string;
  sni?: string;
  inboundPort?: number;
  inboundId?: number;
  isActive: boolean;
  standardPriceAdjustmentLKR?: number;
  badge?: string;
  targetMedium?: string;
  serverType?: 'STANDARD' | 'LK_IP';
  isCustom?: boolean;
}

export interface TrialClaim {
  id: string;
  userId: string;
  email: string;
  canonicalEmail: string;
  ip: string;
  deviceId: string;
  fpHash: string;
  uaHash: string;
  orderNumber: string;
  at: string;
}

export interface XuiPanelConfig {
  baseUrl: string;
  username: string;
  password?: string;
  publicHost: string;
  autoSync: boolean;
  syncIntervalSec: number;
  lastSyncedAt?: string;
  lastStatus?: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastLatencyMs?: number;
}

interface AdminStoreState {
  orders: AdminOrder[];
  inventory: AdminInventoryItem[];
  coupons: AdminPromoCode[];
  packages?: Record<string, AdminPackageOverride>;
  customPackages?: any[];
  xuiConfig?: XuiPanelConfig;
  referrals?: Record<string, ReferralUserRecord>;
  trialClaims?: TrialClaim[];
}

const DATA_FILE = path.join(process.cwd(), '.fibez-admin-data.json');

function getSeedOrders(): AdminOrder[] {
  return [
    {
      id: 'ord_sample_receipt_1',
      orderNumber: 'FBZ-92418',
      customerName: 'Kavindu Senanayake',
      customerEmail: 'kavindu.s@gmail.com',
      customerWhatsapp: '+94 77 412 8890',
      totalAmountLKR: 950,
      totalAmountUSD: 3.10,
      currency: 'LKR',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'PENDING_REVIEW',
      fulfillmentStatus: 'PENDING',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80',
      receiptUploadedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      bankName: 'Commercial Bank of Ceylon (Branch 014 - Colombo)',
      reviewNotes: 'Customer transferred 950 LKR via ComBank Online. Reference: TXN-COM-882910.',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      items: [
        {
          id: 'item_sample_1',
          orderId: 'ord_sample_receipt_1',
          productId: 'v2ray-dialog-zoom',
          productTitle: 'Dialog Zoom & Teams Unlimited V2Ray',
          variantTitle: '1 Month - 100 GB Node',
          quantity: 1,
          unitPriceLKR: 950,
          subtotalLKR: 950,
          status: 'PENDING',
        }
      ]
    },
    {
      id: 'ord_sample_receipt_2',
      orderNumber: 'FBZ-73012',
      customerName: 'Dineth Perera',
      customerEmail: 'dineth.designs@gmail.com',
      customerWhatsapp: '+94 71 892 1104',
      totalAmountLKR: 1400,
      totalAmountUSD: 4.60,
      currency: 'LKR',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'PENDING_REVIEW',
      fulfillmentStatus: 'PENDING',
      receiptImageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80',
      receiptUploadedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      bankName: 'Sampath Bank PLC (Vishwa Banking)',
      reviewNotes: 'Sampath Vishwa slip attached. Reference: SMPTH-994102',
      createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      items: [
        {
          id: 'item_sample_2',
          orderId: 'ord_sample_receipt_2',
          productId: 'capcut-pro-private-account',
          productTitle: 'CapCut Pro Subscription (1 Month Private)',
          variantTitle: '1 Month Private Account',
          quantity: 1,
          unitPriceLKR: 1400,
          subtotalLKR: 1400,
          status: 'PENDING',
        }
      ]
    },
    {
      id: 'ord_sample_verified_3',
      orderNumber: 'FBZ-55829',
      customerName: 'Nimasha Fernando',
      customerEmail: 'nimasha.f@outlook.com',
      customerWhatsapp: '+94 76 332 9901',
      totalAmountLKR: 1200,
      totalAmountUSD: 3.90,
      currency: 'LKR',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'VERIFIED',
      fulfillmentStatus: 'DELIVERED',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80',
      receiptUploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      bankName: 'Bank of Ceylon (BOC)',
      reviewedBy: 'akain@fibez.store',
      reviewNotes: 'Slip verified and cleared automatically.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      items: [
        {
          id: 'item_sample_3',
          orderId: 'ord_sample_verified_3',
          productId: 'canva-pro-invite-link',
          productTitle: 'Canva Pro 1 Month Direct Activation',
          variantTitle: '1 Month Direct Invite',
          quantity: 1,
          unitPriceLKR: 1200,
          subtotalLKR: 1200,
          dispensedKey: 'https://www.canva.com/brand/join?token=fbz_vip_7781a9f02&team=fibez_pro',
          keyType: 'INVITE_LINK',
          status: 'DELIVERED',
        }
      ]
    },
    {
      id: 'ord_sample_grant_4',
      orderNumber: 'FBZ-GFT-AKAIN1',
      customerName: 'Akain (Owner Test)',
      customerEmail: 'akain@fibez.store',
      customerWhatsapp: '+94 77 123 4567',
      totalAmountLKR: 0,
      totalAmountUSD: 0,
      currency: 'LKR',
      paymentMethod: 'staff_grant',
      paymentStatus: 'VERIFIED',
      fulfillmentStatus: 'DELIVERED',
      grantType: 'FREE_GIFT',
      reviewedBy: 'Akain (Administrator)',
      reviewNotes: 'VIP Friend node grant.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      items: [
        {
          id: 'item_sample_4',
          orderId: 'ord_sample_grant_4',
          productId: 'v2ray-dialog-zoom',
          productTitle: 'Dialog Zoom & Teams Unlimited V2Ray',
          variantTitle: '1 Month - 100 GB Node',
          quantity: 1,
          unitPriceLKR: 0,
          subtotalLKR: 0,
          dispensedKey: 'vless://a4b1239c-4821-4f11-91a0-9c8df634f190@rv2ray.fibez.store:443?type=tcp&security=tls&sni=zoom.us#Fibez-Dialog-Zoom-VIP',
          keyType: 'CONNECTION_CONFIG',
          status: 'DELIVERED',
        }
      ]
    }
  ];
}

function getSeedInventory(): AdminInventoryItem[] {
  return [
    {
      id: 'inv_1',
      productId: 'canva-pro-activation',
      productTitle: 'Canva Pro 1 Month Subscription Activation Link',
      stockType: 'INVITE_LINK',
      keyPayload: 'https://www.canva.com/brand/join?token=fbz_team_c891ff4a&team=fibez_pro',
      status: 'AVAILABLE',
      batchReference: 'BATCH-CANVA-MAY-01',
      createdAt: new Date().toISOString()
    },
    {
      id: 'inv_2',
      productId: 'canva-pro-activation',
      productTitle: 'Canva Pro 1 Month Subscription Activation Link',
      stockType: 'INVITE_LINK',
      keyPayload: 'https://www.canva.com/brand/join?token=fbz_team_b120da33&team=fibez_pro',
      status: 'AVAILABLE',
      batchReference: 'BATCH-CANVA-MAY-01',
      createdAt: new Date().toISOString()
    },
    {
      id: 'inv_3',
      productId: 'capcut-pro-subscription',
      productTitle: 'CapCut Pro Subscription (iOS, Android, PC)',
      stockType: 'ACCOUNT_CREDENTIALS',
      keyPayload: 'Account: capcut_prem_01@fibez.store | Pass: CapCutPro#8841',
      status: 'AVAILABLE',
      batchReference: 'BATCH-CAPCUT-MAY-01',
      createdAt: new Date().toISOString()
    },
    {
      id: 'inv_4',
      productId: 'capcut-pro-subscription',
      productTitle: 'CapCut Pro Subscription (iOS, Android, PC)',
      stockType: 'ACCOUNT_CREDENTIALS',
      keyPayload: 'Account: capcut_prem_02@fibez.store | Pass: CapCutPro#9914',
      status: 'AVAILABLE',
      batchReference: 'BATCH-CAPCUT-MAY-01',
      createdAt: new Date().toISOString()
    },
    {
      id: 'inv_5',
      productId: 'steam-wallet-code-global',
      productTitle: 'Steam Wallet $10 Digital Code',
      stockType: 'SERIAL_KEY',
      keyPayload: 'STM-8841-9920-KLMA-7741',
      status: 'AVAILABLE',
      batchReference: 'BATCH-STEAM-01',
      createdAt: new Date().toISOString()
    }
  ];
}

function getSeedCoupons(): AdminPromoCode[] {
  return [
    {
      id: 'cpn_1',
      code: 'FIBEZ10',
      discountPercent: 10,
      discountFixedLKR: 0,
      minSpendLKR: 1000,
      maxUses: 500,
      timesUsed: 42,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cpn_2',
      code: 'FRIEND500',
      discountPercent: 0,
      discountFixedLKR: 500,
      minSpendLKR: 1500,
      maxUses: 50,
      timesUsed: 12,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cpn_3',
      code: 'VIP100',
      discountPercent: 100,
      discountFixedLKR: 0,
      minSpendLKR: 0,
      maxUses: 10,
      timesUsed: 4,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
  ];
}

const STATE_ID = 'main';

function emptyState(): AdminStoreState {
  return { orders: [], inventory: [], coupons: [] };
}

function seededState(): AdminStoreState {
  return { orders: getSeedOrders(), inventory: getSeedInventory(), coupons: getSeedCoupons() };
}

function normalizeState(raw: any): AdminStoreState {
  return {
    orders: Array.isArray(raw?.orders) ? raw.orders : [],
    inventory: Array.isArray(raw?.inventory) ? raw.inventory : [],
    coupons: Array.isArray(raw?.coupons) ? raw.coupons : [],
    packages: raw?.packages && typeof raw.packages === 'object' ? raw.packages : undefined,
    customPackages: Array.isArray(raw?.customPackages) ? raw.customPackages : undefined,
    xuiConfig: raw?.xuiConfig && typeof raw.xuiConfig === 'object' ? raw.xuiConfig : undefined,
    referrals: raw?.referrals && typeof raw.referrals === 'object' ? raw.referrals : undefined,
    trialClaims: Array.isArray(raw?.trialClaims) ? raw.trialClaims : undefined,
  };
}

let tableReady = false;
async function ensureTable() {
  if (!adminSql || tableReady) return;
  await adminSql`
    CREATE TABLE IF NOT EXISTS public.admin_state (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      version INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Holds customer data and stock keys: deny all non-owner roles (e.g. Data API anon/authenticated).
  await adminSql`ALTER TABLE public.admin_state ENABLE ROW LEVEL SECURITY`;
  tableReady = true;
}

/**
 * Admin state (orders, stock, coupons, package overrides, panel config).
 *
 * - With DATABASE_URL: persisted in Postgres (`public.admin_state`, one JSONB row) so it
 *   survives serverless cold starts and is shared by every instance. Every change uses
 *   optimistic concurrency (version check + retry), so two simultaneous requests cannot
 *   silently overwrite each other or dispense the same stock key twice.
 * - Without DATABASE_URL (local dev): falls back to the gitignored .fibez-admin-data.json.
 *
 * All methods are async. Note: this is a single-document store, fine for a small shop;
 * move orders/stock to real tables if volume grows.
 */
class AdminStore {
  private async read(): Promise<{ state: AdminStoreState; version: number }> {
    if (adminSql) {
      await ensureTable();
      for (let i = 0; i < 2; i++) {
        const rows = await adminSql`SELECT data, version FROM public.admin_state WHERE id = ${STATE_ID}`;
        if (rows.length > 0) {
          return { state: normalizeState(rows[0].data), version: Number(rows[0].version) };
        }
        await adminSql`
          INSERT INTO public.admin_state (id, data, version)
          VALUES (${STATE_ID}, ${JSON.stringify(emptyState())}::jsonb, 0)
          ON CONFLICT (id) DO NOTHING
        `;
      }
      throw new Error('Could not initialise admin state');
    }

    // Local file fallback (development)
    try {
      if (fs.existsSync(DATA_FILE)) {
        return { state: normalizeState(JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))), version: 0 };
      }
    } catch (e) {
      console.warn('AdminStore file read fallback:', e);
    }
    const seeded = seededState();
    this.writeFile(seeded);
    return { state: seeded, version: 0 };
  }

  private writeFile(state: AdminStoreState) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.warn('AdminStore file save error:', e);
    }
  }

  private async write(state: AdminStoreState, version: number): Promise<boolean> {
    if (adminSql) {
      const rows = await adminSql`
        UPDATE public.admin_state
        SET data = ${JSON.stringify(state)}::jsonb, version = version + 1, updated_at = NOW()
        WHERE id = ${STATE_ID} AND version = ${version}
        RETURNING version
      `;
      return rows.length > 0;
    }
    this.writeFile(state);
    return true;
  }

  private async mutate<T>(fn: (state: AdminStoreState) => T): Promise<T> {
    for (let attempt = 0; attempt < 6; attempt++) {
      const { state, version } = await this.read();
      const result = fn(state);
      if (await this.write(state, version)) return result;
    }
    throw new Error('Admin store is busy, please retry');
  }

  // ---- Orders -------------------------------------------------------------

  public async getOrders(): Promise<AdminOrder[]> {
    if (adminSql) return db.dbGetOrders();
    const { state } = await this.read();
    return [...state.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getOrder(orderIdOrNumber: string): Promise<AdminOrder | undefined> {
    if (adminSql) return db.dbGetOrder(orderIdOrNumber);
    const { state } = await this.read();
    const query = orderIdOrNumber.trim().toUpperCase();
    return state.orders.find((o) => o.id === orderIdOrNumber || o.orderNumber.toUpperCase() === query);
  }

  /** Pass a transaction client to create the order in the same transaction as a wallet debit. */
  public async addOrder(order: AdminOrder, client?: import('@neondatabase/serverless').PoolClient): Promise<AdminOrder> {
    if (adminSql) return db.dbAddOrder(order, client);
    await this.mutate((s) => {
      s.orders.unshift(order);
    });
    return order;
  }

  public async updateOrderStatus(
    orderIdOrNumber: string,
    updates: {
      paymentStatus?: AdminOrder['paymentStatus'];
      fulfillmentStatus?: AdminOrder['fulfillmentStatus'];
      reviewNotes?: string;
      reviewedBy?: string;
      dispensedKey?: string;
      /** Per-item delivered key/config, keyed by item id (multi-item orders). */
      itemKeys?: Record<string, string>;
      metadata?: AdminOrder['metadata'];
    }
  ): Promise<AdminOrder | null> {
    if (adminSql) return db.dbUpdateOrderStatus(orderIdOrNumber, updates);
    const query = orderIdOrNumber.trim().toUpperCase();
    return this.mutate((s) => {
      const order = s.orders.find((o) => o.id === orderIdOrNumber || o.orderNumber.toUpperCase() === query);
      if (!order) return null;

      if (updates.paymentStatus) order.paymentStatus = updates.paymentStatus;
      if (updates.fulfillmentStatus) order.fulfillmentStatus = updates.fulfillmentStatus;
      if (updates.reviewNotes !== undefined) order.reviewNotes = updates.reviewNotes;
      if (updates.reviewedBy) order.reviewedBy = updates.reviewedBy;
      if (updates.dispensedKey && order.items.length > 0) {
        order.items[0].dispensedKey = updates.dispensedKey;
        order.items[0].status = 'DELIVERED';
      }
      if (updates.itemKeys) {
        for (const item of order.items) {
          const key = updates.itemKeys[item.id];
          if (key) {
            item.dispensedKey = key;
            item.status = 'DELIVERED';
          }
        }
      }
      if (updates.metadata) order.metadata = { ...(order.metadata || {}), ...updates.metadata };
      order.updatedAt = new Date().toISOString();
      return order;
    });
  }

  /** Customer confirms receipt (closes the refund window). */
  public async confirmReceived(orderNumber: string, email: string): Promise<boolean> {
    if (adminSql) return db.dbConfirmReceived(orderNumber, email);
    return this.mutate((s) => {
      const o = s.orders.find((x) => x.orderNumber.toUpperCase() === orderNumber.toUpperCase() && x.customerEmail.toLowerCase() === email.toLowerCase());
      if (!o || o.receivedConfirmedAt) return false;
      o.receivedConfirmedAt = new Date().toISOString();
      return true;
    });
  }

  // ---- Inventory ----------------------------------------------------------

  public async getInventory(): Promise<AdminInventoryItem[]> {
    if (adminSql) return db.dbGetInventory();
    const { state } = await this.read();
    return [...state.inventory];
  }

  public async addInventoryBatch(
    productId: string,
    productTitle: string,
    stockType: AdminInventoryItem['stockType'],
    rawKeys: string[],
    batchRef?: string
  ): Promise<number> {
    const batch = batchRef || `BATCH-${Date.now().toString().slice(-6)}`;
    if (adminSql) return db.dbAddInventoryBatch(productId, productTitle, stockType, rawKeys, batch);
    return this.mutate((s) => {
      let count = 0;
      for (const key of rawKeys) {
        const trimmed = key.trim();
        if (!trimmed) continue;
        s.inventory.unshift({
          id: `inv_${crypto.randomUUID().slice(0, 8)}`,
          productId,
          productTitle,
          stockType,
          keyPayload: trimmed,
          status: 'AVAILABLE',
          batchReference: batch,
          createdAt: new Date().toISOString(),
        });
        count++;
      }
      return count;
    });
  }

  public async dispenseStockItem(
    productId: string,
    orderId: string,
    email: string
  ): Promise<AdminInventoryItem | null> {
    if (adminSql) return db.dbDispenseStockItem(productId, orderId, email);
    return this.mutate((s) => {
      const item = s.inventory.find(
        (i) => (i.productId === productId || i.productId.includes(productId)) && i.status === 'AVAILABLE'
      );
      if (!item) return null;
      item.status = 'DISPENSED';
      item.dispensedOrderId = orderId;
      item.dispensedToEmail = email;
      return { ...item };
    });
  }

  public async deleteInventoryItem(id: string): Promise<boolean> {
    if (adminSql) return db.dbDeleteInventoryItem(id);
    return this.mutate((s) => {
      const prev = s.inventory.length;
      s.inventory = s.inventory.filter((i) => i.id !== id);
      return s.inventory.length < prev;
    });
  }

  public async clearAllInventory(): Promise<void> {
    if (adminSql) return db.dbClearInventory();
    await this.mutate((s) => {
      s.inventory = [];
    });
  }

  public async resetInventoryToSeed(): Promise<void> {
    if (adminSql) return db.dbClearInventory(); // seed stock is demo data: never load it into a live database
    await this.mutate((s) => {
      // Seed stock contains demo placeholder keys: never load them into a live database.
      s.inventory = adminSql ? [] : getSeedInventory();
    });
  }

  public async clearDispensedInventory(): Promise<number> {
    if (adminSql) return db.dbClearDispensed();
    return this.mutate((s) => {
      const prev = s.inventory.length;
      s.inventory = s.inventory.filter((i) => i.status !== 'DISPENSED');
      return prev - s.inventory.length;
    });
  }

  // ---- Coupons ------------------------------------------------------------

  public async getCoupons(): Promise<AdminPromoCode[]> {
    if (adminSql) return db.dbGetCoupons();
    const { state } = await this.read();
    return [...state.coupons];
  }

  public async addCoupon(
    coupon: Omit<AdminPromoCode, 'id' | 'timesUsed' | 'createdAt'>
  ): Promise<AdminPromoCode> {
    if (adminSql) return db.dbAddCoupon(coupon);
    const newCoupon: AdminPromoCode = {
      ...coupon,
      id: `cpn_${crypto.randomUUID().slice(0, 8)}`,
      code: coupon.code.toUpperCase().trim(),
      timesUsed: 0,
      createdAt: new Date().toISOString(),
    };
    await this.mutate((s) => {
      s.coupons.unshift(newCoupon);
    });
    return newCoupon;
  }

  public async toggleCoupon(id: string): Promise<boolean> {
    if (adminSql) return db.dbToggleCoupon(id);
    return this.mutate((s) => {
      const cpn = s.coupons.find((c) => c.id === id);
      if (!cpn) return false;
      cpn.isActive = !cpn.isActive;
      return cpn.isActive;
    });
  }

  public async deleteCoupon(id: string): Promise<boolean> {
    if (adminSql) return db.dbDeleteCoupon(id);
    return this.mutate((s) => {
      const prev = s.coupons.length;
      s.coupons = s.coupons.filter((c) => c.id !== id);
      return s.coupons.length < prev;
    });
  }

  // ---- Package overrides --------------------------------------------------

  public async getPackageOverrides(): Promise<Record<string, AdminPackageOverride>> {
    const { state } = await this.read();
    return state.packages || {};
  }

  public async updatePackageOverride(
    id: string,
    updates: Partial<AdminPackageOverride>
  ): Promise<AdminPackageOverride> {
    return this.mutate((s) => {
      if (!s.packages) s.packages = {};
      const existing = s.packages[id] || { id, isActive: true };
      s.packages[id] = { ...existing, ...updates };
      return s.packages[id];
    });
  }

  public async togglePackageActive(id: string): Promise<boolean> {
    return this.mutate((s) => {
      if (!s.packages) s.packages = {};
      const existing = s.packages[id] || { id, isActive: true };
      existing.isActive = !existing.isActive;
      s.packages[id] = existing;
      return existing.isActive;
    });
  }

  public async getCustomPackages(): Promise<any[]> {
    const { state } = await this.read();
    return state.customPackages || [];
  }

  public async addCustomPackage(pkg: any): Promise<any> {
    await this.mutate((s) => {
      if (!s.customPackages) s.customPackages = [];
      const idx = s.customPackages.findIndex((p: any) => p.id === pkg.id);
      if (idx >= 0) {
        s.customPackages[idx] = { ...s.customPackages[idx], ...pkg };
      } else {
        s.customPackages.unshift(pkg);
      }
    });
    return pkg;
  }

  public async deletePackage(id: string): Promise<boolean> {
    return this.mutate((s) => {
      if (s.customPackages) {
        s.customPackages = s.customPackages.filter((p: any) => p.id !== id);
      }
      if (!s.packages) s.packages = {};
      s.packages[id] = { ...(s.packages[id] || { id }), isActive: false };
      return true;
    });
  }

  public async resetPackages(): Promise<void> {
    await this.mutate((s) => {
      s.packages = {};
      s.customPackages = [];
    });
  }

  // ---- Referrals ------------------------------------------------------------

  public async getReferrals(): Promise<Record<string, ReferralUserRecord>> {
    const { state } = await this.read();
    return state.referrals || {};
  }

  /** Atomic read-modify-write of the referral table (credits can never be double-spent). */
  public async mutateReferrals<T>(fn: (db: Record<string, ReferralUserRecord>) => T): Promise<T> {
    return this.mutate((s) => {
      if (!s.referrals) s.referrals = {};
      return fn(s.referrals);
    });
  }

  // ---- Free-trial anti-abuse ---------------------------------------------------

  public async getTrialClaims(): Promise<TrialClaim[]> {
    const { state } = await this.read();
    return state.trialClaims || [];
  }

  /**
   * Atomically decide whether this person may take a free trial, and record the claim.
   * One trial per account, per (canonical) email, per device. A single IP can hold a few
   * claims (mobile networks share IPs) but not unlimited.
   */
  public async tryClaimTrial(
    claim: Omit<TrialClaim, 'id' | 'at'>,
    opts: { maxPerIp: number; ipWindowDays: number }
  ): Promise<{ ok: true; claimId: string } | { ok: false; reason: 'ACCOUNT' | 'EMAIL' | 'DEVICE' | 'IP' }> {
    return this.mutate((s) => {
      const claims = s.trialClaims || (s.trialClaims = []);
      if (claims.some((c) => c.userId === claim.userId)) return { ok: false as const, reason: 'ACCOUNT' as const };
      if (claims.some((c) => c.canonicalEmail === claim.canonicalEmail)) return { ok: false as const, reason: 'EMAIL' as const };
      if (
        claims.some(
          (c) => (claim.fpHash && c.fpHash === claim.fpHash) || (claim.deviceId && c.deviceId === claim.deviceId)
        )
      ) {
        return { ok: false as const, reason: 'DEVICE' as const };
      }
      if (claim.ip && claim.ip !== 'unknown') {
        const since = Date.now() - opts.ipWindowDays * 24 * 60 * 60 * 1000;
        const sameIp = claims.filter((c) => c.ip === claim.ip && new Date(c.at).getTime() > since).length;
        if (sameIp >= opts.maxPerIp) return { ok: false as const, reason: 'IP' as const };
      }
      const id = `trial_${crypto.randomUUID().slice(0, 10)}`;
      claims.push({ ...claim, id, at: new Date().toISOString() });
      return { ok: true as const, claimId: id };
    });
  }

  /** Give the claim back (e.g. the panel was down, so no trial was actually delivered). */
  public async releaseTrialClaim(claimId: string): Promise<void> {
    await this.mutate((s) => {
      s.trialClaims = (s.trialClaims || []).filter((c) => c.id !== claimId);
    });
  }

  // ---- 3x-ui panel config -------------------------------------------------

  public async getXuiConfig(): Promise<XuiPanelConfig> {
    const { state } = await this.read();
    const stored: XuiPanelConfig = state.xuiConfig || {
      baseUrl: process.env.XUI_BASE_URL || 'https://rv2ray.fibez.store:6767',
      username: '',
      publicHost: process.env.XUI_PUBLIC_HOST || 'rv2ray.fibez.store',
      autoSync: true,
      syncIntervalSec: 30,
    };
    // Environment variables always win over anything persisted, so rotating XUI_* in the
    // host's env takes effect immediately. The panel password is NEVER persisted.
    return {
      ...stored,
      baseUrl: process.env.XUI_BASE_URL || stored.baseUrl,
      username: process.env.XUI_USERNAME || stored.username,
      password: process.env.XUI_PASSWORD || '',
      publicHost: process.env.XUI_PUBLIC_HOST || stored.publicHost,
    };
  }

  public async updateXuiConfig(config: Partial<XuiPanelConfig>): Promise<XuiPanelConfig> {
    await this.mutate((s) => {
      const merged: XuiPanelConfig = {
        ...(s.xuiConfig || {
          baseUrl: process.env.XUI_BASE_URL || 'https://rv2ray.fibez.store:6767',
          username: '',
          publicHost: process.env.XUI_PUBLIC_HOST || 'rv2ray.fibez.store',
          autoSync: true,
          syncIntervalSec: 30,
        }),
        ...config,
      };
      delete merged.password;
      s.xuiConfig = merged;
    });
    return this.getXuiConfig();
  }
}

export const adminStore = new AdminStore();