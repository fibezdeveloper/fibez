import { pgTable, text, integer, boolean, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';

// ========================================================================
// BETTER AUTH DATABASE TABLES (Neon PostgreSQL)
// ========================================================================
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ========================================================================
// PRODUCT CATALOG & CATEGORIES
// ========================================================================
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  iconName: text('icon_name'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(), // Slugs like 'steam-wallet-code-global', 'psn-wallet-card-us'
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  brand: text('brand'),
  region: text('region'),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description').notNull(),
  priceUSD: numeric('price_usd', { precision: 10, scale: 2 }).notNull().default('0.00'),
  priceLKR: integer('price_lkr').notNull().default(0),
  stockCount: integer('stock_count').notNull().default(50),
  badge: text('badge'),
  isInstant: boolean('is_instant').default(true),
  durations: jsonb('durations').default([]),
  options: jsonb('options').default([]),
  guideMarkdown: text('guide_markdown'),
  warrantyTerms: text('warranty_terms'),
  imageUrl: text('image_url'),
  isFeatured: boolean('is_featured').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productVariants = pgTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  durationDays: integer('duration_days'),
  priceUSD: numeric('price_usd', { precision: 10, scale: 2 }).notNull().default('0.00'),
  priceLKR: integer('price_lkr').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ========================================================================
// DIGITAL INVENTORY & PRE-MINTED STOCK
// ========================================================================
export const inventoryItems = pgTable('inventory_items', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }),
  variantTitle: text('variant_title'),
  stockType: text('stock_type').notNull().default('SERIAL_KEY'), // 'SERIAL_KEY', 'ACCOUNT_CREDENTIALS', 'CONNECTION_CONFIG', 'CUSTOM_TOKEN'
  keyPayload: text('key_payload').notNull(),
  credentialUser: text('credential_user'),
  credentialPass: text('credential_pass'),
  status: text('status').notNull().default('AVAILABLE'), // 'AVAILABLE', 'RESERVED', 'DISPENSED', 'REVOKED'
  batchReference: text('batch_reference'),
  orderId: text('order_id'),
  assignedUserId: text('assigned_user_id'),
  assignedUserEmail: text('assigned_user_email'),
  dispensedAt: timestamp('dispensed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ========================================================================
// ORDERS & ORDER LINE ITEMS
// ========================================================================
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').unique().notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  customerEmail: text('customer_email').notNull(),
  customerWhatsapp: text('customer_whatsapp'),
  customerName: text('customer_name'),
  totalAmountLKR: integer('total_amount_lkr').notNull(),
  totalAmountUSD: numeric('total_amount_usd', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('LKR'),
  paymentMethod: text('payment_method').notNull(), // 'bank_transfer', 'crypto', 'gateway'
  paymentStatus: text('payment_status').default('PENDING_REVIEW'), // 'PENDING_PAYMENT', 'PENDING_REVIEW', 'VERIFIED', 'FAILED', 'REFUNDED'
  fulfillmentStatus: text('fulfillment_status').default('MINTED'), // 'PENDING', 'PROCESSING', 'MINTED', 'DELIVERED', 'REVOKED'
  receiptImageUrl: text('receipt_image_url'),
  receiptUploadedAt: timestamp('receipt_uploaded_at', { withTimezone: true }),
  promoCode: text('promo_code'),
  discountAmountLKR: integer('discount_amount_lkr').default(0),
  reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
  reviewNotes: text('review_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  productTitle: text('product_title').notNull(),
  variantTitle: text('variant_title'),
  quantity: integer('quantity').notNull().default(1),
  unitPriceLKR: integer('unit_price_lkr').notNull(),
  unitPriceUSD: numeric('unit_price_usd', { precision: 10, scale: 2 }).notNull(),
  subtotalLKR: integer('subtotal_lkr').notNull(),
  subtotalUSD: numeric('subtotal_usd', { precision: 10, scale: 2 }).notNull(),
  dispensedKey: text('dispensed_key'),
  credentialUser: text('credential_user'),
  credentialPass: text('credential_pass'),
  keyType: text('key_type').default('SERIAL_KEY'),
  guideMarkdown: text('guide_markdown'),
  warranty: text('warranty'),
  status: text('status').default('DELIVERED'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ========================================================================
// PROMO CODES & VOUCHERS
// ========================================================================
export const promoCodes = pgTable('promo_codes', {
  id: text('id').primaryKey(),
  code: text('code').unique().notNull(),
  discountPercent: integer('discount_percent').default(0),
  discountFixedLKR: integer('discount_fixed_lkr').default(0),
  minSpendLKR: integer('min_spend_lkr').default(0),
  maxUses: integer('max_uses').default(1000),
  timesUsed: integer('times_used').default(0),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ========================================================================
// STORE CONFIGURATION & OWNER SETTINGS
// ========================================================================
export const storeSettings = pgTable('store_settings', {
  key: text('key').primaryKey(), // e.g. 'bank_accounts', 'crypto_wallets', 'social_links', 'exchange_rate'
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  updatedBy: text('updated_by'),
});

// ========================================================================
// INFRASTRUCTURE & EDGE NODES TELEMETRY
// ========================================================================
export const servers = pgTable('servers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  countryCode: text('country_code').notNull(),
  ipAddressMasked: text('ip_address_masked'),
  cpuUsage: text('cpu_usage').default('20%'),
  ramUsage: text('ram_usage').default('4.2 / 16 GB'),
  bandwidthUsed: text('bandwidth_used').default('10 TB'),
  status: text('status').default('Healthy'),
  coreVersion: text('core_version').default('Xray v1.8.8'),
  pingMs: integer('ping_ms').default(15),
  speedGbps: numeric('speed_gbps', { precision: 5, scale: 2 }).default('9.80'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ========================================================================
// SUPPORT TICKETS & MESSAGES
// ========================================================================
export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  ticketNumber: text('ticket_number').unique().notNull(),
  userId: text('user_id'),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  subject: text('subject').notNull(),
  category: text('category').notNull().default('General'),
  priority: text('priority').notNull().default('MEDIUM'),
  status: text('status').notNull().default('OPEN'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const ticketMessages = pgTable('ticket_messages', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  senderId: text('sender_id'),
  senderName: text('sender_name').notNull(),
  senderRole: text('sender_role').notNull().default('user'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ========================================================================
// PRODUCT REVIEWS & RATINGS
// ========================================================================
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  userId: text('user_id'),
  userName: text('user_name').notNull(),
  userEmail: text('user_email'),
  rating: integer('rating').notNull(),
  headline: text('headline').notNull(),
  comment: text('comment').notNull(),
  isVerifiedPurchase: boolean('is_verified_purchase').default(true),
  status: text('status').notNull().default('APPROVED'),
  helpfulCount: integer('helpful_count').default(0),
  adminReply: text('admin_reply'),
  adminReplyAt: timestamp('admin_reply_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ========================================================================
// AUDIT LOGS FOR SECURITY & OWNER OPERATIONS
// ========================================================================
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userEmail: text('user_email'),
  action: text('action').notNull(), // 'ORDER_APPROVED', 'SETTINGS_UPDATED', 'KEY_MINTED', 'ROLE_CHANGED'
  entityType: text('entity_type').notNull(), // 'ORDER', 'PRODUCT', 'SETTINGS', 'USER'
  entityId: text('entity_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ========================================================================
// EXPORT TYPES
// ========================================================================
export type User = typeof user.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
export type StoreSetting = typeof storeSettings.$inferSelect;
export type ServerNode = typeof servers.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
