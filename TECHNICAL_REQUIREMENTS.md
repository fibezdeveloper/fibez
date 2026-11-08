# TECHNICAL REQUIREMENTS SPECIFICATION
## Project: Fibez — Automated Digital Goods & Subscription Marketplace
**Target Repository:** `https://github.com/AkainPlayzz/fibezv2.git`  
**Architecture:** Next.js 16.4.5 (App Router, React 19, Turbopack, Server-Side Rendering)  
**Database:** Neon Serverless PostgreSQL (Drizzle ORM)  
**Object Storage:** Neon Object Storage (AWS S3 SDK integration)  
**Design Paradigm:** Developer-First Luxury Minimalism (Reverse-Engineered from `https://resend.com/`)

---

## 1. System Overview & Objectives
Fibez is an automated, instant-fulfillment marketplace designed for high-velocity digital products, subscriptions, and network infrastructure assets. The platform automates stock dispensing from an encrypted vault, manages multi-tier product configurations (durations, shared/private licenses, ISP-specific network configs), provides multi-channel payment options (automated gateways + manual bank slip approvals), and features an interactive developer-grade key vault with live countdown timers and dynamic QR code generators.

### Primary Architectural Goals
1. **Sub-400ms Delivery Velocity**: Instant cryptographic delivery of digital license keys, V2Ray connection strings, and VPS root credentials immediately upon confirmed payment.
2. **Atomic Inventory Isolation**: Concurrency-safe FIFO inventory dispensing to eliminate double-selling and stock race conditions using Neon Postgres transactions.
3. **Dual Payment Modality**: Support automated payment rails alongside an asynchronous manual bank transfer verification workflow with receipt uploads and 1-click admin dispatch.
4. **Developer-Grade Key Vault**: A terminal-style user experience for managing licenses, copying V2Ray configs, generating mobile VPN QR codes, and tracking subscription warranty/expiry countdowns.
5. **Admin Command Center**: Rapid inventory ingestion (bulk paste into database vault), receipt audit queue with slip preview, and Discord webhook dispatch.

---

## 2. Technology Stack & Architecture

### 2.1 Core Runtime & Frameworks
| Layer | Technology | Rationale |
|---|---|---|
| **Frontend & SSR** | Next.js 16.4.5 (App Router, React 19) | Server-Side Rendering (SSR) for product SEO, Turbopack compilation, Cache Components |
| **Styling Engine** | Tailwind CSS v4 | Strict `@theme` Resend design tokens, pure `#000000` canvas, 1px `#292d30` hairline borders |
| **3D Rendering** | HTML5 Canvas / WebGL 3D Math | Autonomous rotating sculptural 3D cube with mouse inertia tilt |
| **Database** | Neon Serverless PostgreSQL | `@neondatabase/serverless` connection pool, zero-cold start, branchable database |
| **ORM / Query Builder** | Drizzle ORM | Zero-overhead, end-to-end TypeScript type inference, native support for PostgreSQL transactions |
| **Object Storage** | Neon Object Storage (`@aws-sdk/client-s3`) | Presigned upload URLs for user payment receipts, secure bucket policies |
| **Notifications** | Discord Webhooks API | Real-time sales telemetry, low stock warnings, bank slip submission alerts |
| **QR Code Engine** | `qrcode` | Client/Server-side QR generation for V2Ray / VMess / VLESS connection URIs |

---

## 3. Core Functional Modules

### 3.1 Storefront & Catalog Engine
- **Hero Display**:
  - Sculptural 3D black geometric cube rotating with mouse inertia.
  - Domaine / Playfair editorial serif headline (`Digital delivery for developers.`).
  - Announcement pill (`Announcing Fibez Vault 2.0 →`).
  - Live metrics row (`< 350ms dispatch`, `99.99% uptime`, `AES-256 zero-trust vault`).
- **Category Filter & Navigation**:
  - Filter category pills: `All Assets`, `V2Ray & VPN Reality`, `Cloud NVMe VPS`, `Developer Subscriptions`, `Global Game Keys`.
  - Real-time search bar with instant debounce filtering across title, description, and tags.
- **Product Card System**:
  - Resend 16px radius cards with 1px `#292d30` hairline borders.
  - Real-time stock status pills with 2-3px filled dots (`#3ad389` for In Stock, `#ffca16` for Low Stock).
  - Instant Delivery badge (`< 400ms`).
  - Dual currency pricing: USD ($) and LKR.
  - Outlined ghost button (`Configure ›`).

### 3.2 Product Details & Dynamic Configurator Modal
- **Configurator Engine**:
  - Dynamic duration selector pills (1 Month, 3 Months, 1 Year).
  - Dynamic option selectors:
    - V2Ray VPN: ISP optimization profiles (Dialog Axiata 4G/5G, SLT Fiber / Mobitel, Global Multi-Homed BGP).
    - Subscriptions: Account type (Shared Profile vs. Private Email Invite).
  - Setup guides and zero-trust warranty terms.

### 3.3 Multi-Option Checkout & Receipt Ingestion
- **Payment Methods**:
  - Instant Online Gateway (Visa / MasterCard / AMEX).
  - Crypto Gateway (USDT TRC20, TON, SOL).
  - Manual Bank Transfer (Commercial Bank, Sampath, HNB) with instant slip screenshot upload.
- **Promo Engine**:
  - Instant client-side & server-side discount code validation (e.g. `FIBEZ20`, `RESEND`).

### 3.4 Key Vault & Customer Dashboard
- **Telemetry & Countdown Timers**:
  - Order history with active status tags.
  - Live countdown timers ticking second-by-second toward expiration.
  - One-click copy for license keys, VLESS connection strings, and SSH commands.
  - Dynamic QR code modal for mobile camera scanning in v2rayNG / Shadowrocket / Sing-box.

### 3.5 Admin Command Center
- **Bank Transfer Review Queue**:
  - Displays customer email, amount, bank name, uploaded slip reference.
  - One-click fulfillment & automated Discord webhook notification.
- **Bulk Inventory Ingestion**:
  - Multi-line textarea for bulk pasting license keys, VLESS URIs, or account credentials.
  - Instant encryption into Neon PostgreSQL inventory table.
