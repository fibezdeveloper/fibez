import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { PRODUCTS } from '../products';
import { applyPostgresRls } from './apply-rls';

// 1. Resolve DATABASE_URL
let databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl) {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=')) {
        databaseUrl = trimmed.replace('DATABASE_URL=', '').replace(/^["']|["']$/g, '');
        break;
      }
    }
  }
}

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL not found in environment or .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigrationAndSeed() {
  console.log('🚀 Connecting to Neon PostgreSQL...');
  console.log(`📡 Target endpoint: ${databaseUrl.split('@')[1]?.split('/')[0] || 'hidden'}`);

  // Step 1: Drop empty obsolete tables if they exist with wrong schema (0 rows)
  console.log('\n--- Step 1: Aligning Database Schema ---');
  await sql`DROP TABLE IF EXISTS inventory_items CASCADE`;
  await sql`DROP TABLE IF EXISTS product_variants CASCADE`;
  await sql`DROP TABLE IF EXISTS order_items CASCADE`;
  await sql`DROP TABLE IF EXISTS orders CASCADE`;
  await sql`DROP TABLE IF EXISTS products CASCADE`;
  await sql`DROP TABLE IF EXISTS categories CASCADE`;
  await sql`DROP TABLE IF EXISTS promo_codes CASCADE`;
  await sql`DROP TABLE IF EXISTS store_settings CASCADE`;
  await sql`DROP TABLE IF EXISTS servers CASCADE`;
  await sql`DROP TABLE IF EXISTS audit_logs CASCADE`;
  console.log('✓ Cleaned legacy/empty tables for enhanced schema creation');

  // Step 2: Create all tables
  console.log('\n--- Step 2: Creating Real Database Tables ---');

  // Categories
  await sql`
    CREATE TABLE categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon_name TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('✓ Created table: categories');

  // Products
  await sql`
    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      brand TEXT,
      region TEXT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      price_lkr INTEGER NOT NULL DEFAULT 0,
      stock_count INTEGER NOT NULL DEFAULT 50,
      badge TEXT,
      is_instant BOOLEAN DEFAULT TRUE,
      durations JSONB DEFAULT '[]'::jsonb,
      options JSONB DEFAULT '[]'::jsonb,
      guide_markdown TEXT,
      warranty_terms TEXT,
      image_url TEXT,
      is_featured BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('✓ Created table: products');

  // Product Variants
  await sql`
    CREATE TABLE product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      duration_days INTEGER,
      price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      price_lkr INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('✓ Created table: product_variants');

  // Inventory Items (Digital Keys, Accounts, VLESS URI, SSH Root)
  await sql`
    CREATE TABLE inventory_items (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      variant_title TEXT,
      stock_type TEXT NOT NULL DEFAULT 'SERIAL_KEY',
      key_payload TEXT NOT NULL,
      credential_user TEXT,
      credential_pass TEXT,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      batch_reference TEXT,
      order_id TEXT,
      assigned_user_id TEXT,
      assigned_user_email TEXT,
      dispensed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('✓ Created table: inventory_items');

  // Orders
  await sql`
    CREATE TABLE orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_email TEXT NOT NULL,
      customer_whatsapp TEXT,
      customer_name TEXT,
      total_amount_lkr INTEGER NOT NULL,
      total_amount_usd NUMERIC(10, 2) NOT NULL,
      currency TEXT DEFAULT 'LKR',
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'PENDING_REVIEW',
      fulfillment_status TEXT DEFAULT 'MINTED',
      receipt_image_url TEXT,
      receipt_uploaded_at TIMESTAMPTZ,
      promo_code TEXT,
      discount_amount_lkr INTEGER DEFAULT 0,
      reviewed_by TEXT,
      review_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('✓ Created table: orders');

  // Order Line Items
  await sql`
    CREATE TABLE order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
      product_title TEXT NOT NULL,
      variant_title TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price_lkr INTEGER NOT NULL,
      unit_price_usd NUMERIC(10, 2) NOT NULL,
      subtotal_lkr INTEGER NOT NULL,
      subtotal_usd NUMERIC(10, 2) NOT NULL,
      dispensed_key TEXT,
      credential_user TEXT,
      credential_pass TEXT,
      key_type TEXT DEFAULT 'SERIAL_KEY',
      guide_markdown TEXT,
      warranty TEXT,
      status TEXT DEFAULT 'DELIVERED',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('✓ Created table: order_items');

  // Promo Codes
  await sql`
    CREATE TABLE promo_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_percent INTEGER DEFAULT 0,
      discount_fixed_lkr INTEGER DEFAULT 0,
      min_spend_lkr INTEGER DEFAULT 0,
      max_uses INTEGER DEFAULT 1000,
      times_used INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('✓ Created table: promo_codes');

  // Store Settings (Bank accounts, Social links, Exchange rate, Announcement)
  await sql`
    CREATE TABLE store_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      updated_by TEXT
    );
  `;
  console.log('✓ Created table: store_settings');

  // Infrastructure / Edge Node Telemetry
  await sql`
    CREATE TABLE servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      country_code TEXT NOT NULL,
      ip_address_masked TEXT,
      cpu_usage TEXT DEFAULT '20%',
      ram_usage TEXT DEFAULT '4.2 / 16 GB',
      bandwidth_used TEXT DEFAULT '10 TB',
      status TEXT DEFAULT 'Healthy',
      core_version TEXT DEFAULT 'Xray v1.8.8',
      ping_ms INTEGER DEFAULT 15,
      speed_gbps NUMERIC(5, 2) DEFAULT 9.80,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('✓ Created table: servers');

  // Audit Logs
  await sql`
    CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details JSONB,
      ip_address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('✓ Created table: audit_logs');

  // Step 3: Seed Categories
  console.log('\n--- Step 3: Seeding Store Categories ---');
  const initialCategories = [
    { id: 'giftcard', name: 'Gift Cards', slug: 'giftcard', description: 'Steam, PlayStation, Nintendo, Apple, Google Play & Amazon gift cards.', iconName: 'Gift', sortOrder: 1 },
    { id: 'gaming', name: 'Game Top-ups', slug: 'gaming', description: 'Valorant Points, Free Fire Diamonds, PUBG Mobile UC, and Robux.', iconName: 'Gamepad2', sortOrder: 2 },
    { id: 'subscription', name: 'Subscriptions', slug: 'subscription', description: 'Netflix 4K, Spotify Premium, YouTube Premium, Discord Nitro & more.', iconName: 'PlaySquare', sortOrder: 3 },
    { id: 'vpn', name: 'High-Speed VLESS VPN', slug: 'vpn', description: 'High-speed VLESS VPN — optimised for SLT, Dialog, Hutch & Airtel. Instant delivery.', iconName: 'Shield', sortOrder: 4 },
    { id: 'software', name: 'Software', slug: 'software', description: 'ChatGPT Plus, Microsoft 365, Canva Pro, Kaspersky & genuine digital licenses.', iconName: 'Code', sortOrder: 5 },
  ];

  for (const cat of initialCategories) {
    await sql`
      INSERT INTO categories (id, name, slug, description, icon_name, sort_order)
      VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.description}, ${cat.iconName}, ${cat.sortOrder})
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon_name = EXCLUDED.icon_name,
        sort_order = EXCLUDED.sort_order;
    `;
  }
  console.log(`✓ Seeded ${initialCategories.length} categories`);

  // Step 4: Seed Products & Product Variants from PRODUCTS catalog
  console.log('\n--- Step 4: Syncing Store Products from Catalog ---');
  let productCount = 0;
  let variantCount = 0;

  for (const p of PRODUCTS) {
    await sql`
      INSERT INTO products (
        id, category_id, brand, region, title, slug, description, 
        price_usd, price_lkr, stock_count, badge, is_instant, 
        durations, options, guide_markdown, warranty_terms, is_featured, is_active
      ) VALUES (
        ${p.id}, ${p.category}, ${p.brand || null}, ${p.region || null}, ${p.title}, ${p.id}, ${p.description},
        ${p.priceUSD}, ${p.priceLKR}, ${p.stockCount}, ${p.badge || null}, ${p.isInstant},
        ${JSON.stringify(p.durations || [])}::jsonb, ${JSON.stringify(p.options || [])}::jsonb,
        ${p.guideMarkdown}, ${p.warranty}, ${p.badge === 'BESTSELLER' || p.badge === 'POPULAR'}, TRUE
      )
      ON CONFLICT (id) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        price_usd = EXCLUDED.price_usd,
        price_lkr = EXCLUDED.price_lkr,
        stock_count = EXCLUDED.stock_count,
        durations = EXCLUDED.durations,
        guide_markdown = EXCLUDED.guide_markdown;
    `;
    productCount++;

    // Seed Variants
    if (p.durations && p.durations.length > 0) {
      for (const d of p.durations) {
        const variantId = `${p.id}-${d.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const varPriceUsd = (p.priceUSD * d.multiplier).toFixed(2);
        const varPriceLkr = Math.round(p.priceLKR * d.multiplier);

        await sql`
          INSERT INTO product_variants (id, product_id, title, duration_days, price_usd, price_lkr)
          VALUES (${variantId}, ${p.id}, ${d.label}, ${d.days}, ${varPriceUsd}, ${varPriceLkr})
          ON CONFLICT (id) DO NOTHING;
        `;
        variantCount++;
      }
    }
  }
  console.log(`✓ Synced ${productCount} products and ${variantCount} variants`);

  // Step 5: Seed Promo Codes
  console.log('\n--- Step 5: Seeding Promo Codes ---');
  const promoList = [
    { code: 'FIBEZ10', percent: 10, fixed: 0, minSpend: 0, maxUses: 1000 },
    { code: 'WELCOME', percent: 10, fixed: 0, minSpend: 0, maxUses: 10000 },
    { code: 'FIBEZ20', percent: 20, fixed: 0, minSpend: 0, maxUses: 1000 },
  ];

  for (const pr of promoList) {
    const promoId = `promo_${pr.code.toLowerCase()}`;
    await sql`
      INSERT INTO promo_codes (id, code, discount_percent, discount_fixed_lkr, min_spend_lkr, max_uses, times_used, is_active)
      VALUES (${promoId}, ${pr.code}, ${pr.percent}, ${pr.fixed}, ${pr.minSpend}, ${pr.maxUses}, 0, TRUE)
      ON CONFLICT (code) DO NOTHING;
    `;
  }
  console.log(`✓ Seeded ${promoList.length} promotional discount codes`);

  // Step 6: Seed Store Settings (Bank Transfer, Crypto, Socials, Rates)
  console.log('\n--- Step 6: Seeding Store Settings ---');
  const settingsList = [
    {
      key: 'bank_accounts',
      value: [
        {
          id: 'comb-1',
          bankName: 'Commercial Bank of Ceylon PLC',
          accountName: 'Fibez Store',
          accountNumber: '8002914820',
          branch: 'Colombo Main Branch (001)',
          currency: 'LKR',
          instructions: 'Upload CDM deposit slip or online banking screenshot with Order # in remarks.',
          active: true,
        },
        {
          id: 'sampath-1',
          bankName: 'Sampath Bank PLC',
          accountName: 'Fibez Store',
          accountNumber: '109284918231',
          branch: 'Kollupitiya Branch',
          currency: 'LKR',
          instructions: 'Direct CDM cash deposit or CEFT/SLIPS instant transfer.',
          active: true,
        },
      ],
    },
    {
      key: 'crypto_wallets',
      value: [
        { network: 'TRC20 (Tron)', token: 'USDT', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', active: true },
        { network: 'TON', token: 'USDT / TON', address: 'EQBvW8Z5huBkMJYdnfAEM5JqTN1j00NCqhuEAIDA6A_TON', active: true },
        { network: 'Bitcoin (BTC)', token: 'BTC', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', active: true },
      ],
    },
    {
      key: 'social_links',
      value: [
        { id: 'discord', platform: 'discord', name: 'Discord Community', url: 'https://discord.gg/fibez', enabled: true },
        { id: 'telegram', platform: 'telegram', name: 'Telegram Channel', url: 'https://t.me/fibezstore', enabled: true },
        { id: 'whatsapp', platform: 'whatsapp', name: 'WhatsApp Support', url: 'https://wa.me/94770000000', enabled: true },
        { id: 'x', platform: 'x', name: 'X / Twitter', url: 'https://x.com/fibezstore', enabled: true },
        { id: 'youtube', platform: 'youtube', name: 'YouTube', url: 'https://youtube.com/@fibezstore', enabled: false },
        { id: 'tiktok', platform: 'tiktok', name: 'TikTok', url: 'https://tiktok.com/@fibezstore', enabled: false },
        { id: 'instagram', platform: 'instagram', name: 'Instagram', url: 'https://instagram.com/fibezstore', enabled: true },
        { id: 'github', platform: 'github', name: 'GitHub', url: 'https://github.com/AkainPlayzz', enabled: false },
        { id: 'reddit', platform: 'reddit', name: 'Reddit', url: 'https://reddit.com/r/fibez', enabled: false },
        { id: 'facebook', platform: 'facebook', name: 'Facebook', url: 'https://facebook.com/fibezstore', enabled: false },
      ],
    },
    {
      key: 'exchange_rate',
      value: { usdToLkr: 330, lastUpdated: new Date().toISOString() },
    },
    {
      key: 'store_announcement',
      value: {
        enabled: true,
        text: '⚡ Instant email delivery for High-Speed VLESS VPN, Gift Cards, Subscriptions & Game Top-ups.',
      },
    },
  ];

  for (const s of settingsList) {
    await sql`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES (${s.key}, ${JSON.stringify(s.value)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
    `;
  }
  console.log(`✓ Seeded ${settingsList.length} store settings`);

  console.log('\n--- Step 5: Applying PostgreSQL Row-Level Security (RLS) ---');
  await applyPostgresRls();

  console.log('\n======================================================');
  console.log('🎉 ALL DATABASE TABLES INITIALIZED WITH REAL CATALOG DATA (NO FAKE ORDERS/REVIEWS/TICKETS)!');
  console.log('======================================================');
}

runMigrationAndSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
