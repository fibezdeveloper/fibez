# TECHNICAL REQUIREMENTS SPECIFICATION
## Project: Fibez — Automated Digital Goods & Subscription Marketplace
**Target Repository:** `https://github.com/AkainPlayzz/fibezv2.git`  
**Architecture:** Next.js (App Router, React 19, Server-Side Rendering)  
**Database:** Neon Serverless PostgreSQL  
**Design Paradigm:** Encrypted Terminal / Minimalist Cyberpunk (derived from zkPass)

---

## 1. System Overview & Objectives
Fibez is an automated, instant-fulfillment e-commerce platform designed for high-velocity digital products and service subscriptions. The platform automates stock dispensing from an encrypted vault, manages multi-tier product configurations (durations, shared/private licenses, ISP-specific configs), provides multi-channel payment options (automated gateways + manual bank slip approvals), and features an interactive customer key vault with live timers and QR code generators.

### Primary Goals
1. **Zero-Latency Fulfillment**: Instant cryptographic delivery of digital license keys, V2Ray connection strings, and credential sets immediately upon confirmed payment.
2. **Atomic Inventory Isolation**: Concurrency-safe FIFO inventory dispensing to eliminate double-selling and stock race conditions.
3. **Dual Payment Modality**: Support automated payment rails alongside an asynchronous manual bank transfer verification workflow with receipt uploads and 1-click admin dispatch.
4. **Interactive Customer Vault**: A terminal-grade user experience for managing licenses, copying V2Ray configs, generating mobile VPN QR codes, and tracking subscription warranty/expiry countdowns.
5. **Admin Operations Hub**: Rapid inventory ingestion (bulk paste with syntax parsers), receipt audit queue, real-time analytics, and Discord webhook dispatch.

---

## 2. Technology Stack & Architecture

### 2.1 Core Runtime & Frameworks
| Layer | Technology | Rationale |
|---|---|---|
| **Frontend & SSR** | Next.js 15 (App Router, React 19) | Server-Side Rendering (SSR) for product SEO, streaming server components for low TTFB, dynamic OG metadata |
| **Styling Engine** | Tailwind CSS v4 + PostCSS | Zero-runtime CSS variables, strict `@theme` design tokens, rapid responsiveness |
| **Animation Engine** | Motion / Framer Motion | High-performance terminal typing effects, staggered grid reveals, subtle glowing border sweeps |
| **Database** | Neon Serverless PostgreSQL | Branching capabilities, connection pooling with `@neondatabase/serverless`, sub-10ms query response |
| **ORM / Query Builder** | Drizzle ORM | Zero-overhead, end-to-end TypeScript type inference, native support for PostgreSQL transactions and row locking |
| **Authentication** | Better-Auth or Auth.js (NextAuth v5) | Secure session management, Discord OAuth, Google OAuth, Email/Password with Argon2id hashing |
| **File Storage** | Cloudflare R2 / AWS S3 / UploadThing | Presigned upload URLs for user payment receipts, strict MIME type isolation |
| **Notifications** | Discord Webhooks API | Real-time sales telemetry, low stock warnings, bank slip submission alerts |
| **QR Code Engine** | `qrcode` (SVG renderer) | Client/Server-side vector QR generation for V2Ray / VMess / VLess connection URIs |

---

## 3. Core Functional Modules

### 3.1 Storefront & Catalog Engine
- **Hero Display**:
  - Pointillist SVG dotted globe background.
  - Typographic headline hierarchy featuring whisper-weight PT Serif with single *Signal Lime* italic accent word.
  - Live search bar with instant debounce filtering across title, category, and tags.
  - Real-time trust stats (orders completed, verified stock items, average delivery latency: `< 3s`).
- **Category Filter & Navigation**:
  - Filter tabs: `All Products`, `V2Ray / VPN`, `Cloud VPS`, `Subscriptions`, `Gaming Keys`.
  - Filter state synchronized with URL query params (`?cat=v2ray&sort=trending`) for bookmarking and SEO.
- **Product Card System**:
  - Real-time stock status badge: `✓ IN STOCK (n)` vs `● OUT OF STOCK`.
  - Delivery badge: `⚡ INSTANT DELIVERY`.
  - Variant starting price calculation (`From $X.XX` or `LKR Y,YYY`).
  - Terminal-style hover elevation with hairline border highlighting.

### 3.2 Product Details & Dynamic Configurator
- **Multi-Dimension Variant Selector**:
  - **Subscription Duration**: 1 Month, 3 Months, 6 Months, 1 Year, Lifetime.
  - **Account Modality**: Shared (profile-allocated) vs Private (full account credentials).
  - **Network / ISP Routing (for V2Ray/VPN)**: Routing configs tailored for specific ISPs (Dialog, Mobitel, SLT, Starlink, Global Anycast) or streaming protocols.
- **Dynamic Pricing Engine**:
  - Real-time price recalculation based on selected configuration matrix.
  - Dynamic stock check for the specific variant combination.
- **Collapsible Terminal Drawers**:
  - Setup Guide & Configuration instructions (e.g. how to import V2Ray in v2rayNG / Streisand / Clash).
  - Warranty terms & Replacement policy guarantees.

### 3.3 Inventory Engine & Encrypted Vault
- **Stock Types**:
  1. `SERIAL_KEY`: Single-line alphanumeric strings (e.g., Windows keys, Steam codes).
  2. `ACCOUNT_CREDENTIALS`: Multiline username/email + password + backup codes + profile pin.
  3. `CONNECTION_CONFIG`: V2Ray URI formats (`vless://...`, `vmess://...`, `ss://...`, WireGuard config blocks).
  4. `CUSTOM_TOKEN`: API keys or invitation tokens.
- **Automated Dispensing (FIFO)**:
  - Database row-level locking (`FOR UPDATE SKIP LOCKED`) ensures zero concurrency race conditions when two customers buy the last item at the exact same millisecond.
  - Status progression: `AVAILABLE` -> `RESERVED` (held during checkout session, 15 min TTL) -> `DISPENSED` (tied to `order_id`).

### 3.4 Checkout & Payment Workflow
- **Supported Payment Modalities**:
  1. **Instant Automated Gateways**:
     - Webhook-verified payment rails (Crypto / Cards).
     - Upon webhook validation, order status shifts immediately to `PAID` and vault stock is atomically assigned.
  2. **Manual Bank Transfer & Direct Deposit**:
     - Displays merchant bank details (Bank Name, Account Holder, Account Number, Branch, Reference Code).
     - Receipt Upload: Drag-and-drop screenshot uploader with client-side preview and image compression.
     - Creates order in `PENDING_REVIEW` status.
- **Promo Code Engine**:
  - Percentage or flat discount rules.
  - Usage caps and minimum order amounts.

### 3.5 Customer Key Vault & Dashboard
- **Customer Control Center**:
  - **Order History**: Filterable list of all orders with statuses (`COMPLETED`, `PENDING_REVIEW`, `CANCELLED`).
  - **Active Subscription Watcher**: Real-time visual countdown timers showing time remaining on active subscriptions.
- **Key & Config Reveal Matrix**:
  - Security mask on sensitive data by default (`••••••••••••••••`).
  - "Reveal" toggle with automatic 30-second re-mask timer.
  - One-click copy with terminal-style toast notification.
  - **QR Code Modal**: Click-to-view QR code rendered dynamically for mobile V2Ray / WireGuard scanning.
  - Downloadable `.txt` / `.json` connection profile backup.

### 3.6 Authentication & Account System
- **Provider Matrix**:
  - Email + Password (with Argon2id hashing and email verification).
  - Google OAuth 2.0.
  - Discord OAuth 2.0 (convenient for gamers and VPN users).
- **Security & Roles**:
  - Role-Based Access Control: `CUSTOMER`, `SUPPORT`, `ADMIN`.
  - Secure session cookies (HTTP-Only, Secure, SameSite=Strict).

### 3.7 Admin Command Center
- **Inventory Intake Tool**:
  - Bulk textarea paste tool that automatically splits input by newlines or JSON objects.
  - Instant duplicate detection and stock count preview before committing to the vault.
- **Manual Payment Verification Queue**:
  - Side-by-side view: Customer uploaded bank receipt screenshot vs. Order amount and expected reference number.
  - 1-Click Action: `[APPROVE & FULFILL]` (automatically pulls stock from vault and sends delivery email/Discord message) or `[REJECT & NOTIFY]`.
- **Product & Variant Matrix Manager**:
  - Create products, upload images, define duration tiers, set ISP presets, and manage pricing.
- **Discord Webhook Telemetry**:
  - `#orders-log`: Fires embed upon order completion with buyer tag, item name, and revenue.
  - `#bank-slips-queue`: Alert sent when a new receipt is uploaded.
  - `#stock-alerts`: Ping `@admin` when stock count for any product dips below threshold.

---

## 4. Database Schema Specification (Neon PostgreSQL)

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'SUPPORT', 'ADMIN');
CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'PENDING_REVIEW', 'PAID', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE payment_method AS ENUM ('GATEWAY', 'CRYPTO', 'BANK_TRANSFER');
CREATE TYPE stock_type AS ENUM ('SERIAL_KEY', 'ACCOUNT_CREDENTIALS', 'CONNECTION_CONFIG', 'CUSTOM_TOKEN');
CREATE TYPE stock_status AS ENUM ('AVAILABLE', 'RESERVED', 'DISPENSED', 'REVOKED');

-- Users & Auth
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'CUSTOMER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories & Products
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50)
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50) REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    guide_markdown TEXT,
    warranty_terms TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variants (Duration, Account Type, ISP Routing)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL, -- e.g. "1 Month - Private - SLT Optimized"
    duration_days INT,          -- e.g. 30, 90, 365, NULL for lifetime
    account_type VARCHAR(50),   -- "Shared", "Private", "Dedicated"
    isp_network VARCHAR(50),    -- "Dialog", "Mobitel", "SLT", "Global"
    price_cents INT NOT NULL,   -- e.g. 1500 for $15.00 or LKR in lowest denomination
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypted Inventory Vault
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    stock_type stock_type NOT NULL,
    encrypted_payload TEXT NOT NULL, -- AES-256-GCM encrypted payload
    iv VARCHAR(64) NOT NULL,         -- Initialization vector
    tag VARCHAR(64) NOT NULL,        -- Authentication tag
    status stock_status DEFAULT 'AVAILABLE',
    batch_reference VARCHAR(100),
    reserved_until TIMESTAMPTZ,
    order_id UUID,                   -- Linked upon sale
    created_at TIMESTAMPTZ DEFAULT NOW(),
    dispensed_at TIMESTAMPTZ
);

-- Orders & Items
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    customer_email VARCHAR(255) NOT NULL,
    total_amount INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method payment_method NOT NULL,
    status order_status DEFAULT 'PENDING_PAYMENT',
    receipt_image_url TEXT,
    receipt_uploaded_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES product_variants(id),
    inventory_item_id UUID REFERENCES inventory_items(id),
    unit_price INT NOT NULL,
    revealed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);
```

---

## 5. Non-Functional & Operational Requirements
1. **Performance**: Initial load Core Web Vitals LCP `< 1.2s`, FID `< 100ms`, CLS `0.0`.
2. **SEO & OpenGraph**: Dynamic SSR tags generating classified-style cryptographic social cards for every product.
3. **Database Concurrency**: Neon serverless connection pooling using `@neondatabase/serverless` with connection timeouts configured for burst traffic.
4. **Discord Dispatch Resilience**: Webhook requests handled through background retry queues to ensure no dropped sales logs.
