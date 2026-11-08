# FIBEZ DESIGN SYSTEM & ARCHITECTURAL SPECIFICATION
## Brand: Fibez — Automated Digital Goods & Subscription Marketplace
**Reverse-Engineered Reference Source:** `https://resend.com/` (Black velvet with violet neon)  
**Dominant Aesthetic:** Pure void black canvas, hairline graphite borders, editorial serif hero typography, compressed display sans, and signature Iris Violet code identifiers.

---

## 1. Brand Philosophy & Identity
Fibez re-engineers the digital goods purchasing experience into a developer-first, luxury programmatic interface inspired by **Resend**. Rather than a noisy consumer storefront, Fibez operates like a cryptographic key vault:
- **Pure Black Canvas**: The canvas lives in total darkness (`#000000`). Zero background gradients, zero glowing colored background blobs, and zero decorative meshes.
- **Hairline Graphite Elevation**: Elevation is achieved exclusively through 1px `#292d30` (Graphite Hairline) borders rather than drop shadows. Every card, modal, input, and code block relies on this single hairline rule.
- **Editorial Typography Authority**: The hero pairs an editorial serif headline at 77px – 96px (`Playfair Display` / `Domaine`) with an interactive 3D WebGL geometric cube. Section headlines shift to tight geometric sans with extreme negative tracking (`-0.05em`) for a compressed, confident posture.
- **Developer Identity through Monospace**: `JetBrains Mono` / `Commit Mono` carries the developer identity across code blocks, API keys, terminal badges, and telemetry outputs.
- **Signature Iris Violet Accent (`#9281f7`)**: Strictly reserved for code strings, API tokens, developer identifiers, and syntax highlighting. Never used as a filled background on primary buttons.
- **Outlined Ghost Buttons**: The signature CTA is a transparent ghost button with a 1px `#292d30` border that transitions to crisp white `#ffffff` on hover.

---

## 2. Color Tokens

| Name | Hex Value | Token | Role & Semantics |
|---|---|---|---|
| **Void Black** | `#000000` | `--color-void-black` | Page canvas, card surfaces, overlay scrims — the foundational substrate |
| **Graphite Hairline**| `#292d30` | `--color-graphite-hairline` | 1px borders on cards, inputs, buttons, code blocks, dividers — defines 100% of layer separations |
| **White** | `#ffffff` | `--color-white` | Primary headings, hero text, button labels on hover, icon fills |
| **Bone White** | `#f0f0f0` | `--color-bone-white` | Body copy, secondary headings, stroke outlines on icons — primary reading color |
| **Ash Gray** | `#a1a4a5` | `--color-ash-gray` | Muted body copy, badge labels, secondary metadata, inactive links |
| **Smoke Gray** | `#abafb4` | `--color-smoke-gray` | Link text, inactive button captions |
| **Iron** | `#6e727a` | `--color-iron` | Disabled states, low-emphasis borders, code line numbers |
| **Charcoal** | `#464a4d` | `--color-charcoal` | Border hover highlight, subtle telemetry separators |
| **Iris Violet** | `#9281f7` | `--color-iris-violet` | Violet text accent for API tokens, code strings, URLs, and active syntax tags |
| **Iris Violet Glow** | `#baa7ff` | `--color-iris-violet-glow` | Subtle brand badges and focused syntax highlights |
| **Pulse Green** | `#3ad389` | `--color-pulse-green` | Status indicator dot: `Delivered`, `In Stock`, `Active`, `Operational` |
| **Sky Blue** | `#70b8ff` | `--color-sky-blue` | Protocol labels, timer countdowns, SSH hostname identifiers |
| **Amber** | `#ffca16` | `--color-amber` | Warning indicators: `Low Stock`, `Pending Approval` |
| **Alarm Red** | `#ff9592` | `--color-alarm-red` | Error states, failed dispatches, expired services |

---

## 3. Typography Scale & Hierarchy

### 3.1 Font Families
- **Display Hero**: `Playfair Display` (Substitute for Domaine Display) — weight 400 at 77px – 96px, `-0.01em` tracking.
- **Section Headlines**: `Inter` / `Inter Display` (Substitute for aBC Favorit) — weight 400/500 at 56px, `-0.05em` (`-2.8px`) compressed tracking.
- **Prose & UI Chrome**: `Inter` — weight 400, 500, 600 at 14px / 16px.
- **Developer Identity**: `JetBrains Mono` / `Commit Mono` — weight 400, 500 at 12px – 14px.

### 3.2 Type Scale
```
Display Hero:      84px – 96px | line-height: 1.02 | tracking: -0.01em | Font: Serif
Section Heading:   48px – 56px | line-height: 1.12 | tracking: -0.05em | Font: Sans
Subheading:        20px – 24px | line-height: 1.30 | tracking: -0.02em | Font: Sans
Body Text:         15px – 16px | line-height: 1.50 | tracking: 0.00em  | Font: Sans
Monospace Code:    12px – 14px | line-height: 1.60 | tracking: 0.00em  | Font: Mono
Status Pills:      11px – 12px | line-height: 1.00 | tracking: 0.08em  | Font: Mono
```

---

## 4. Strict Geometry & Border Radii Rules

The design system enforces a strict **two-value radius scale**:
- **6px (`--radius-md`)**: Used for all **buttons**, **inputs**, **badges**, **status pills**, and **tabs**.
- **16px (`--radius-2xl`)**: Used for all **cards**, **modals**, and **code terminal windows**.
- **9999px (Pill)**: Used exclusively for the hero announcement pill (`.hero-pill`).

> **Rule:** Never introduce arbitrary 8px, 10px, or 12px radii on components.

---

## 5. Signature Components & Micro-Interactions

### 5.1 3D Sculptural Hero Cube (`src/components/HeroCube.tsx`)
- WebGL / HTML5 Canvas rendered black geometric cube with subtle `#292d30` and `#464a4d` wireframe edge highlights.
- Slow autonomous rotation with gentle mouse inertia tilt.
- Central Iris Violet pulse dot (`#9281f7`) highlighting the internal core.

### 5.2 Developer Code Terminal (`src/components/CodeWindow.tsx`)
- Black background (`#000000`), 1px `#292d30` border, 16px radius.
- Three 8px traffic-light dots in top-left.
- Interactive language tabs (`Node.js`, `cURL`, `Python`, `Go`).
- Iris Violet (`#9281f7`) highlighting strings and credentials; Pulse Green (`#3ad389`) highlighting `DELIVERED` status.
- Interactive "Test Dispatch" simulator calculating sub-350ms fulfillment.

### 5.3 Automated Inventory Catalog (`src/components/CatalogSection.tsx`)
- Instant real-time search input with 6px radius and 1px `#292d30` border.
- Category filter pills (`All`, `V2Ray & VPN`, `Cloud VPS`, `Subscriptions`, `Game Keys`).
- Real-time stock status pills with 2-3px filled dots (`#3ad389` for In Stock, `#ffca16` for Low Stock).
- Dynamic Configurator & Instant Checkout Modal (`src/components/ProductModal.tsx`) with dynamic QR code generation for mobile VPN setups.

### 5.4 Customer Vault & Admin Command Center (`src/components/VaultDashboard.tsx`)
- Customer Key Vault with live subscription countdown timers (`29d 14h 22m 09s`), QR codes, and one-click copy buttons.
- Admin Command Center with bank transfer slip approval queue, bulk stock inventory injector, and Discord webhook notifications.
