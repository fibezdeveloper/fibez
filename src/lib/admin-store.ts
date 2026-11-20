import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sql as adminSql } from '@/lib/db';
import { PRODUCTS } from '@/lib/products';

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
  paymentMethod: 'bank_transfer' | 'crypto' | 'gateway' | 'staff_grant';
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
      reviewNotes: 'VIP Friend node grant with Singapore Equinix 10Gbps line.',
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

class AdminStore {
  private state: AdminStoreState = {
    orders: [],
    inventory: [],
    coupons: []
  };
  private isLoaded = false;

  private load() {
    if (this.isLoaded) return;
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.state = {
          orders: Array.isArray(parsed.orders) ? parsed.orders : getSeedOrders(),
          inventory: Array.isArray(parsed.inventory) ? parsed.inventory : getSeedInventory(),
          coupons: Array.isArray(parsed.coupons) ? parsed.coupons : getSeedCoupons(),
        };
      } else {
        this.state = {
          orders: getSeedOrders(),
          inventory: getSeedInventory(),
          coupons: getSeedCoupons(),
        };
        this.save();
      }
    } catch (e) {
      console.warn('AdminStore load fallback:', e);
      this.state = {
        orders: getSeedOrders(),
        inventory: getSeedInventory(),
        coupons: getSeedCoupons(),
      };
    }
    this.isLoaded = true;
  }

  private save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.warn('AdminStore save error:', e);
    }
  }

  public getOrders(): AdminOrder[] {
    this.load();
    return [...this.state.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrder(orderIdOrNumber: string): AdminOrder | undefined {
    this.load();
    const query = orderIdOrNumber.trim().toUpperCase();
    return this.state.orders.find(
      (o) => o.id === orderIdOrNumber || o.orderNumber.toUpperCase() === query
    );
  }

  public addOrder(order: AdminOrder): AdminOrder {
    this.load();
    this.state.orders.unshift(order);
    this.save();
    return order;
  }

  public updateOrderStatus(
    orderIdOrNumber: string,
    updates: {
      paymentStatus?: AdminOrder['paymentStatus'];
      fulfillmentStatus?: AdminOrder['fulfillmentStatus'];
      reviewNotes?: string;
      reviewedBy?: string;
      dispensedKey?: string;
    }
  ): AdminOrder | null {
    this.load();
    const order = this.getOrder(orderIdOrNumber);
    if (!order) return null;

    if (updates.paymentStatus) order.paymentStatus = updates.paymentStatus;
    if (updates.fulfillmentStatus) order.fulfillmentStatus = updates.fulfillmentStatus;
    if (updates.reviewNotes !== undefined) order.reviewNotes = updates.reviewNotes;
    if (updates.reviewedBy) order.reviewedBy = updates.reviewedBy;
    if (updates.dispensedKey && order.items.length > 0) {
      order.items[0].dispensedKey = updates.dispensedKey;
      order.items[0].status = 'DELIVERED';
    }
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  public getInventory(): AdminInventoryItem[] {
    this.load();
    return [...this.state.inventory];
  }

  public addInventoryBatch(
    productId: string,
    productTitle: string,
    stockType: AdminInventoryItem['stockType'],
    rawKeys: string[],
    batchRef?: string
  ): number {
    this.load();
    let count = 0;
    const batch = batchRef || `BATCH-${Date.now().toString().slice(-6)}`;

    for (const key of rawKeys) {
      const trimmed = key.trim();
      if (!trimmed) continue;
      this.state.inventory.unshift({
        id: `inv_${crypto.randomUUID().slice(0, 8)}`,
        productId,
        productTitle,
        stockType,
        keyPayload: trimmed,
        status: 'AVAILABLE',
        batchReference: batch,
        createdAt: new Date().toISOString()
      });
      count++;
    }
    this.save();
    return count;
  }

  public dispenseStockItem(productId: string, orderId: string, email: string): AdminInventoryItem | null {
    this.load();
    const item = this.state.inventory.find(
      (i) => (i.productId === productId || i.productId.includes(productId)) && i.status === 'AVAILABLE'
    );
    if (!item) return null;
    item.status = 'DISPENSED';
    item.dispensedOrderId = orderId;
    item.dispensedToEmail = email;
    this.save();
    return item;
  }

  public deleteInventoryItem(id: string): boolean {
    this.load();
    const prev = this.state.inventory.length;
    this.state.inventory = this.state.inventory.filter((i) => i.id !== id);
    this.save();
    return this.state.inventory.length < prev;
  }

  public clearAllInventory(): void {
    this.load();
    this.state.inventory = [];
    this.save();
  }

  public resetInventoryToSeed(): void {
    this.load();
    this.state.inventory = getSeedInventory();
    this.save();
  }

  public clearDispensedInventory(): number {
    this.load();
    const prev = this.state.inventory.length;
    this.state.inventory = this.state.inventory.filter((i) => i.status !== 'DISPENSED');
    this.save();
    return prev - this.state.inventory.length;
  }

  public getCoupons(): AdminPromoCode[] {
    this.load();
    return [...this.state.coupons];
  }

  public addCoupon(coupon: Omit<AdminPromoCode, 'id' | 'timesUsed' | 'createdAt'>): AdminPromoCode {
    this.load();
    const newCoupon: AdminPromoCode = {
      ...coupon,
      id: `cpn_${crypto.randomUUID().slice(0, 8)}`,
      code: coupon.code.toUpperCase().trim(),
      timesUsed: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.coupons.unshift(newCoupon);
    this.save();
    return newCoupon;
  }

  public toggleCoupon(id: string): boolean {
    this.load();
    const cpn = this.state.coupons.find((c) => c.id === id);
    if (!cpn) return false;
    cpn.isActive = !cpn.isActive;
    this.save();
    return cpn.isActive;
  }

  public deleteCoupon(id: string): boolean {
    this.load();
    const prev = this.state.coupons.length;
    this.state.coupons = this.state.coupons.filter((c) => c.id !== id);
    this.save();
    return this.state.coupons.length < prev;
  }

  public getPackageOverrides(): Record<string, AdminPackageOverride> {
    this.load();
    return this.state.packages || {};
  }

  public updatePackageOverride(id: string, updates: Partial<AdminPackageOverride>): AdminPackageOverride {
    this.load();
    if (!this.state.packages) this.state.packages = {};
    const existing = this.state.packages[id] || { id, isActive: true };
    this.state.packages[id] = { ...existing, ...updates };
    this.save();
    return this.state.packages[id];
  }

  public togglePackageActive(id: string): boolean {
    this.load();
    if (!this.state.packages) this.state.packages = {};
    const existing = this.state.packages[id] || { id, isActive: true };
    existing.isActive = !existing.isActive;
    this.state.packages[id] = existing;
    this.save();
    return existing.isActive;
  }

  public getCustomPackages(): any[] {
    this.load();
    return this.state.customPackages || [];
  }

  public addCustomPackage(pkg: any): any {
    this.load();
    if (!this.state.customPackages) this.state.customPackages = [];
    const idx = this.state.customPackages.findIndex((p: any) => p.id === pkg.id);
    if (idx >= 0) {
      this.state.customPackages[idx] = { ...this.state.customPackages[idx], ...pkg };
    } else {
      this.state.customPackages.unshift(pkg);
    }
    this.save();
    return pkg;
  }

  public deletePackage(id: string): boolean {
    this.load();
    if (this.state.customPackages) {
      this.state.customPackages = this.state.customPackages.filter((p: any) => p.id !== id);
    }
    if (!this.state.packages) this.state.packages = {};
    this.state.packages[id] = {
      ...(this.state.packages[id] || { id }),
      isActive: false,
    };
    this.save();
    return true;
  }

  public resetPackages(): void {
    this.load();
    this.state.packages = {};
    this.state.customPackages = [];
    this.save();
  }

  public getXuiConfig(): XuiPanelConfig {
    this.load();
    if (!this.state.xuiConfig) {
      this.state.xuiConfig = {
        baseUrl: process.env.XUI_BASE_URL || 'https://rv2ray.fibez.store:6767',
        username: process.env.XUI_USERNAME || 'akain',
        password: process.env.XUI_PASSWORD || 'kariwesi',
        publicHost: process.env.XUI_PUBLIC_HOST || 'rv2ray.fibez.store',
        autoSync: true,
        syncIntervalSec: 30,
        lastSyncedAt: new Date().toISOString(),
        lastStatus: 'CONNECTED',
        lastLatencyMs: 18,
      };
      this.save();
    }
    return this.state.xuiConfig;
  }

  public updateXuiConfig(config: Partial<XuiPanelConfig>): XuiPanelConfig {
    this.load();
    const current = this.getXuiConfig();
    this.state.xuiConfig = { ...current, ...config };
    this.save();
    return this.state.xuiConfig;
  }
}

export const adminStore = new AdminStore();
