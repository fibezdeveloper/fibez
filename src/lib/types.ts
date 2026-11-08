export type Currency = 'USD' | 'LKR';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  duration: string; // "1 Month", "3 Months", "1 Year", "Lifetime"
  durationDays: number;
  accountType?: 'Shared' | 'Private' | 'Dedicated';
  ispNetwork?: 'Dialog' | 'Mobitel' | 'SLT' | 'Global Anycast';
  priceUSD: number;
  priceLKR: number;
  stockCount: number;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: 'v2ray' | 'vps' | 'subscriptions' | 'gaming';
  categoryLabel: string;
  tagline: string;
  description: string;
  features: string[];
  setupGuide: string[];
  warrantyTerms: string;
  imageUrl: string;
  isFeatured?: boolean;
  instantDelivery: boolean;
  variants: ProductVariant[];
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerEmail: string;
  customerWhatsapp?: string;
  productTitle: string;
  variantTitle: string;
  amount: number;
  currency: Currency;
  status: OrderStatus;
  paymentMethod: 'BANK_TRANSFER' | 'WHATSAPP' | 'INSTANT_GATEWAY';
  receiptImageUrl?: string;
  licenseKey?: string;
  connectionConfig?: string;
  expiresAt?: string;
}
