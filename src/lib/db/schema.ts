import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['CUSTOMER', 'SUPPORT', 'ADMIN']);
export const orderStatusEnum = pgEnum('order_status', [
  'PENDING_PAYMENT',
  'PENDING_REVIEW',
  'PAID',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
]);
export const paymentMethodEnum = pgEnum('payment_method', ['GATEWAY', 'CRYPTO', 'BANK_TRANSFER']);
export const stockTypeEnum = pgEnum('stock_type', [
  'SERIAL_KEY',
  'ACCOUNT_CREDENTIALS',
  'CONNECTION_CONFIG',
  'CUSTOM_TOKEN',
]);
export const stockStatusEnum = pgEnum('stock_status', ['AVAILABLE', 'RESERVED', 'DISPENSED', 'REVOKED']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  passwordHash: text('password_hash'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('CUSTOMER'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const categories = pgTable('categories', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  description: text('description'),
  iconName: varchar('icon_name', { length: 50 }),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: varchar('category_id', { length: 50 }).references(() => categories.id),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description').notNull(),
  guideMarkdown: text('guide_markdown'),
  warrantyTerms: text('warranty_terms'),
  imageUrl: text('image_url'),
  isFeatured: boolean('is_featured').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  durationDays: integer('duration_days'),
  accountType: varchar('account_type', { length: 50 }),
  ispNetwork: varchar('isp_network', { length: 50 }),
  priceUSD: integer('price_usd_cents').notNull(),
  priceLKR: integer('price_lkr').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  productVariantId: uuid('product_variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  stockType: stockTypeEnum('stock_type').notNull(),
  encryptedPayload: text('encrypted_payload').notNull(),
  iv: varchar('iv', { length: 64 }).notNull(),
  tag: varchar('tag', { length: 64 }).notNull(),
  status: stockStatusEnum('status').default('AVAILABLE'),
  batchReference: varchar('batch_reference', { length: 100 }),
  reservedUntil: timestamp('reserved_until', { withTimezone: true }),
  orderId: uuid('order_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  dispensedAt: timestamp('dispensed_at', { withTimezone: true }),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 32 }).unique().notNull(),
  userId: uuid('user_id').references(() => users.id),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerWhatsapp: varchar('customer_whatsapp', { length: 50 }),
  totalAmount: integer('total_amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('LKR'),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  status: orderStatusEnum('status').default('PENDING_REVIEW'),
  receiptImageUrl: text('receipt_image_url'),
  receiptUploadedAt: timestamp('receipt_uploaded_at', { withTimezone: true }),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewNotes: text('review_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});


// Better Auth Database Tables for Neon PostgreSQL
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Support Ticket System Tables
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

// Product Reviews and Ratings Table
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
