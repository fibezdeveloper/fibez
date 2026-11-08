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
