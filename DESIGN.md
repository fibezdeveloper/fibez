# DESIGN SYSTEM & BRAND SPECIFICATION
## Brand: Fibez — Automated Digital Goods & Subscription Marketplace
**Inspiration Source:** `https://zkpass.org/` (Encrypted Terminal meets Classified Editorial Broadsheet)  
**Dominant Aesthetic:** Near-black carbon canvas, whisper-weight editorial serif typography, classified metadata stamps, and a high-contrast emergency chromatic punctuation.

---

## 1. Brand Philosophy & Identity
Fibez reinterprets the cryptographic terminal aesthetic of zkPass for a next-generation automated digital goods marketplace. Where conventional marketplaces look like crowded consumer storefronts, Fibez projects the atmosphere of a **high-security automated clearance vault**:
- **Whisper-Weight Authority**: Headlines in `PT Serif` weight 300 communicate restraint, precision, and institutional credibility rather than loud commercial noise.
- **Single Chromatic Punctuation**: The primary accent color (`Signal Lime`) acts as an emergency signal light cutting through a monochrome near-black surface stack. It is used strictly for primary CTAs, active status pills, glowing hairline borders, and at most **one single italic word per headline**.
- **Classified Metadata Framing**: Section eyebrows and component tags use uppercase, tracked-out sans typography framed in square brackets: `[ CLASSIFIED VAULT // INSTANT ACCESS ]`.
- **Flexible Palette Architecture**: The color system is completely decoupled using semantic CSS custom properties and Tailwind CSS `@theme` variables, allowing instant restyling to any alternative accent (e.g., Electric Cyan, Infrared, Hyper Violet) with zero code refactoring.

---

## 2. Color Palette & Token System

### 2.1 The Surface Stack & Palette Reference

```
+-----------------------------------------------------------+
| Level 0: Canvas (Carbon #060606 / Void Black #000000)     |
|   +-----------------------------------------------------+ |
|   | Level 1: Card Surface (Onyx #1f1f1f)                | |
|   |   +-----------------------------------------------+ | |
|   |   | Level 2: Raised Panel / Nav (Graphite #252525)| | |
|   |   |   +-----------------------------------------+ | | |
|   |   |   | Level 3: Interactive Hover (Iron #313131)| | | |
|   |   |   +-----------------------------------------+ | | |
|   |   +-----------------------------------------------+ | |
|   +-----------------------------------------------------+ |
+-----------------------------------------------------------+
```

| Token Variable | Hex Value | Name | Semantic Role & Behavior |
|---|---|---|---|
| `--color-void-black` | `#000000` | Void Black | Absolute floor: sticky top navigation, code snippet blocks, deep footers |
| `--color-carbon` | `#060606` | Carbon | Dominant page canvas. Prevents visual harshness of pure black on OLED |
| `--color-onyx` | `#1f1f1f` | Onyx | Level 1 card substrate, feature containers, product card panels |
| `--color-graphite` | `#252525` | Graphite | Level 2 raised surfaces, search input container, top nav chrome |
| `--color-iron` | `#313131` | Iron | Level 3 interactive hover state, active pill background, dropdown menus |
| `--color-slate` | `#3d3d3d` | Slate | Hairline borders on dense tables, row dividers, product card boundaries |
| `--color-fog` | `#525252` | Fog | Disabled state outlines, secondary boundary rules |
| `--color-ash` | `#7a7a7a` | Ash | Muted body text, helper captions, link underlines, metadata bracket text |
| `--color-smoke` | `#8a8a8a` | Smoke | Secondary labels, timestamp indicators, product tag counts |
| `--color-pearl` | `#c5c5c5` | Pearl | Tertiary text, subtle heading tints |
| `--color-bone` | `#e5e5e5` | Bone | High-emphasis body paragraphs, product descriptions (avoids white vibration) |
| `--color-chalk` | `#ffffff` | Chalk | Display text, primary titles, crisp iconography |
| `--color-accent` / `--color-signal-lime` | `#c5ff4a` | Signal Lime | **Primary Chromatic Accent**: CTA fill, glowing borders, single italic accent words |
| `--color-olive-depth` | `#597321` | Olive Depth | Glow attenuation, deep borders, decorative vector shading |
| `--color-moss-shadow` | `#314013` | Moss Shadow | Deepest green used in pointillist globe dots and ambient lighting |

### 2.2 Instant Palette Customization (The Flexibility Matrix)
To swap the accent color across the entire site without touching components, simply adjust `--color-accent` in `globals.css`:

```css
/* Default: zkPass Signal Lime */
:root {
  --color-accent: #c5ff4a;
  --color-accent-glow: rgba(197, 255, 74, 0.45);
  --color-accent-subtle: rgba(197, 255, 74, 0.12);
}

/* Optional Alternate Themes */
[data-theme="cyber-cyan"] {
  --color-accent: #00f0ff;
  --color-accent-glow: rgba(0, 240, 255, 0.45);
  --color-accent-subtle: rgba(0, 240, 255, 0.12);
}

[data-theme="hyper-violet"] {
  --color-accent: #c084fc;
  --color-accent-glow: rgba(192, 132, 252, 0.45);
  --color-accent-subtle: rgba(192, 132, 252, 0.12);
}
```

---

## 3. Typography Architecture

### 3.1 Font Families
1. **Editorial Display Voice: `PT Serif` (Fallback: `Source Serif 4`, `Cormorant Garamond`)**
   - **Weight**: Exclusively `300` (Light).
   - **Usage**: Hero headlines, product titles, section headers, and the signature italic accent word.
   - **Tracking**: Negative letter-spacing (`-0.025em` to `-0.035em`) for dense, authoritative broadsheet rendering.
2. **UI Chrome & Body Voice: `Inter Tight` (Fallback: `Inter`)**
   - **Weights**: `400` (Regular), `500` (Medium), `600` (Semibold).
   - **Usage**: Navigation links, buttons, body copy, product descriptions, pricing figures, and form inputs.
   - **Classified Metadata**: Uppercase with wide tracking (`0.18em` to `0.26em`).
3. **Evidence & Terminal Voice: `JetBrains Mono` (Fallback: `ui-monospace`)**
   - **Weights**: `400`, `500`.
   - **Usage**: License keys, V2Ray connection strings, hashes, timestamps, order IDs, inventory payloads.

### 3.2 Typographic Hierarchy
| Role | Font Family | Weight | Size | Line Height | Letter Spacing | Case |
|---|---|---|---|---|---|---|
| **Display Hero** | PT Serif | 300 | 72px – 89px | 0.94 | -0.035em | Title Case (Italic Accent) |
| **Section Title** | PT Serif | 300 | 40px – 49px | 1.05 | -0.025em | Title Case |
| **Card Header** | PT Serif | 300 | 24px – 32px | 1.15 | -0.015em | Title Case |
| **Metadata Stamp**| Inter Tight | 500 | 10px – 11px | 1.20 | +0.22em | UPPERCASE with `[ ... ]` |
| **Body Paragraph**| Inter Tight | 400 | 14px | 1.55 | 0.00em | Sentence Case |
| **CTA / Buttons** | Inter Tight | 500 | 13px – 14px | 1.08 | +0.06em | UPPERCASE / Title Case |
| **Key & Config**  | JetBrains Mono| 400 | 12px – 13px | 1.55 | +0.02em | Monospace Raw |

---

## 4. UI Components & Architectural Rules

### 4.1 Signal Lime CTA Button
- **Structure**:
  - Background: `var(--color-accent)` (`#c5ff4a`)
  - Text: `#000000` (Pure Black)
  - Typography: `Inter Tight`, 500, 14px, tracking `0.04em`
  - Padding: `14px 24px`
  - Border Radius: `4px`
  - Elevation Glow: `box-shadow: 0 0 8px 0 var(--color-accent-glow)`
- **Behavior**: The only filled chromatic button in the application. Acts as the primary trigger for checkout, purchasing, or key reveals.

### 4.2 Sharp Product & Feature Cards
- **Structure**:
  - Background: `#1f1f1f`
  - Border: 1px solid `#252525`
  - Border Radius: `0px` (or razor-sharp `2px`)
  - Padding: `32px` to `40px`
  - Elevation: No drop shadow; depth achieved through hairline border and step in surface luminance.
  - Eyebrow: `[ CATEGORY // SUBCATEGORY ]` in `#7a7a7a` with tracked uppercase.
  - Footer: Monospace price tag and stock availability badge.

### 4.3 Stock & Status Indicators
- **In Stock Pill**:
  - Border: 1px solid `var(--color-accent)`
  - Text: `var(--color-accent)`
  - Background: `rgba(197, 255, 74, 0.08)`
  - Radius: `9999px` (Pill shape)
  - Copy: `✓ IN STOCK (42)`
- **Out of Stock Pill**:
  - Border: 1px solid `#3d3d3d`
  - Text: `#7a7a7a`
  - Background: `transparent`
  - Copy: `● OUT OF STOCK`

### 4.4 Neon Section Divider Bar
- A full-width `6px` solid `var(--color-accent)` bar used strictly **once** between the Hero section and the Product Catalog grid. Represents a classified security clearance barrier.

### 4.5 Dotted Globe Background Visual
- Pointillist vector map composed of white circular dots (`1.5px`) floating at `0.4` to `0.7` opacity behind the hero headline. Generates the atmosphere of a decentralized global infrastructure network.

---

## 5. Visual Effects & Animations (Motion Engine)

### 5.1 Terminal Decode & Matrix Reveal
- When license keys or connection configs are revealed in the Customer Key Vault, text undergoes a 400ms cryptographic character scramble (random alphanumeric symbols resolving into the real decrypted key).

### 5.2 Glowing Border Sweep (Card Hover)
- On card hover, a subtle CSS gradient sweep runs along the hairline border, transitioning from `#252525` through `#c5ff4a` back to `#252525`.

### 5.3 Live Countdown Clock
- For active subscriptions, a high-precision ticking countdown formatted in `JetBrains Mono` (`29d 14h 32m 08s remaining`) with a neon pulse animation when expiring within 48 hours.

### 5.4 Instant QR Code Vector Modal
- For V2Ray/VPN connection strings, tapping "Show QR" renders a high-contrast dark-mode QR code inside a terminal-framed modal for camera scanning with mobile clients.

---

## 6. Brand Assets & Logo Integration

### 6.1 Uploaded Assets
The repository contains the official 512x512 master logo assets:
- **Dark Background Master**: `for dark backgrond.png` -> Target path: `public/brand/fibez-logo-dark.png`
  - Used in top navigation bar, invoice headers, and customer dashboard.
- **Light/White Background Master**: `for white background.png` -> Target path: `public/brand/fibez-logo-light.png`
  - Used for printable invoices, receipt export sheets, and light-mode email notifications.

### 6.2 Top Navigation Header Implementation
- Height: `64px` sticky top bar.
- Background: `#000000` with `1px` bottom border in `#252525`.
- Left: Fibez emblem (`32x32`) + Wordmark in `PT Serif` 300 at 20px.
- Center: Ghost nav links (`STORE`, `VPN & V2RAY`, `CLOUD VPS`, `SUBSCRIPTIONS`, `DOCS`).
- Right: Cart badge (`JetBrains Mono` count indicator) + `[ KEY VAULT ]` accent button.
