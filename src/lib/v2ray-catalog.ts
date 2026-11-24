export interface V2RayPlanTier {
  id: string;
  name: string;
  label: string;
  quotaGB: number; // 0 for unlimited
  quotaLabel: string;
  monthlyPriceLKR: number;
  lkIpPriceLKR: number;
  deviceLimit: number;
  configsCount: number;
  nodeType: 'Shared (Panel 5421)' | 'Dedicated (Private Panel 8253)';
  features: string;
  badge?: string;
  isPopular?: boolean;
}

export const V2RAY_PLAN_TIERS: V2RayPlanTier[] = [
  {
    id: 'basic',
    name: 'BASIC',
    label: 'Basic — 150 GB (1 Device)',
    quotaGB: 150,
    quotaLabel: '150 GB',
    monthlyPriceLKR: 250,
    lkIpPriceLKR: 550,
    deviceLimit: 1,
    configsCount: 1,
    nodeType: 'Shared (Panel 5421)',
    features: 'Everyday browsing, social media & standard downloads',
  },
  {
    id: 'standard',
    name: 'STANDARD',
    label: 'Standard — 250 GB (1 Device)',
    quotaGB: 250,
    quotaLabel: '250 GB',
    monthlyPriceLKR: 500,
    lkIpPriceLKR: 800,
    deviceLimit: 1,
    configsCount: 1,
    nodeType: 'Shared (Panel 5421)',
    features: 'Moderate 1080p streaming, fast downloads & remote work',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    label: 'Premium — 500 GB (2 Devices)',
    quotaGB: 500,
    quotaLabel: '500 GB',
    monthlyPriceLKR: 800,
    lkIpPriceLKR: 1100,
    deviceLimit: 2,
    configsCount: 1,
    nodeType: 'Shared (Panel 5421)',
    features: 'Full speed unthrottled, 2 simultaneous devices, heavy usage',
    badge: 'POPULAR',
    isPopular: true,
  },
  {
    id: 'private',
    name: 'PRIVATE',
    label: 'Private VIP — Unlimited (3 Devices)',
    quotaGB: 0,
    quotaLabel: 'Unlimited GB',
    monthlyPriceLKR: 1200,
    lkIpPriceLKR: 1500,
    deviceLimit: 3,
    configsCount: 1,
    nodeType: 'Dedicated (Private Panel 8253)',
    features: 'Isolated private routing instance, zero noisy neighbors, dedicated bandwidth',
    badge: 'DEDICATED',
  },
  {
    id: 'streaming-gaming',
    name: 'STREAMING & GAMING',
    label: 'Streaming & Gaming Dual — Unlimited (3 Devices)',
    quotaGB: 0,
    quotaLabel: 'Unlimited GB (Dual Dedicated Configs)',
    monthlyPriceLKR: 2000,
    lkIpPriceLKR: 2300,
    deviceLimit: 3,
    configsCount: 2,
    nodeType: 'Dedicated (Private Panel 8253)',
    features: 'Dual Dedicated Configs: 1 for streaming bypass + 1 low-Ping gaming',
    badge: 'DUAL DEDICATED CONFIGS',
  },
];

export interface DurationDiscount {
  months: number;
  label: string;
  discountPercent: number;
}

export const DURATION_DISCOUNTS: DurationDiscount[] = [
  { months: 1, label: '1 Month', discountPercent: 0 },
  { months: 3, label: '3 Months (5% OFF)', discountPercent: 5 },
  { months: 6, label: '6 Months (7% OFF)', discountPercent: 7 },
  { months: 12, label: '12 Months (10% OFF)', discountPercent: 10 },
];

export interface V2RayQuotaTier {
  id: string;
  label: string;
  quotaGB: number; // 0 for unlimited
  standardPriceLKR: number;
  lkIpPriceLKR: number;
  deviceLimit?: number;
  nodeType?: string;
}

export const V2RAY_QUOTA_TIERS: V2RayQuotaTier[] = V2RAY_PLAN_TIERS.map((p) => ({
  id: p.id,
  label: p.label,
  quotaGB: p.quotaGB,
  standardPriceLKR: p.monthlyPriceLKR,
  lkIpPriceLKR: p.lkIpPriceLKR,
  deviceLimit: p.deviceLimit,
  nodeType: p.nodeType,
}));

export type V2RayIsp = 'Dialog' | 'SLT' | 'Airtel' | 'Hutch' | 'Mobitel';

export function normalizeIsp(rawIsp?: string): V2RayIsp {
  if (!rawIsp) return 'Dialog';
  const val = rawIsp.trim().toLowerCase();
  if (val.includes('dialog')) return 'Dialog';
  if (val.includes('slt')) return 'SLT';
  if (val.includes('airtel')) return 'Airtel';
  if (val.includes('hutch')) return 'Hutch';
  if (val.includes('mobitel')) return 'Mobitel';
  return 'Dialog';
}

export interface V2RayPackageDef {
  id: string;
  title: string;
  isp: V2RayIsp;
  categoryLabel: string;
  reloadCode: string;
  targetMedium: 'Home Broadband Router' | 'Mobile 4G/5G SIM' | 'Fiber & 4G' | 'Android Only';
  carrierSpeedNote: string;
  inboundPort: number;
  inboundId: number;
  badge?: string;
  isPopular?: boolean;
  isActive: boolean;
  description: string;
  hasSriLankanIpOption: boolean;
  serverType?: 'STANDARD' | 'LK_IP';
  torrentPolicy: 'Blocked';
  deviceLogins: 'Unlimited Devices (Shared Quota)';
  validityDays: 30;
  standardPriceAdjustmentLKR?: number;
  isCustom?: boolean;
  createdAt?: string;
}

export const LIVE_V2RAY_PACKAGES: V2RayPackageDef[] = [
  // ==========================================
  // A. DIALOG PACKAGES (8 Live Variants)
  // ==========================================
  {
    id: 'dialog-zoom-router',
    title: 'Dialog Zoom (298 / 724 Router)',
    isp: 'Dialog',
    categoryLabel: 'Home Broadband',
    reloadCode: '#678# -> Video Conferencing (298 / 724)',
    targetMedium: 'Home Broadband Router',
    carrierSpeedNote: 'Unmetered · No Carrier Speed Limit on Routers',
    inboundPort: 443,
    inboundId: 3,
    badge: 'NO SPEED LIMIT',
    isPopular: true,
    isActive: true,
    serverType: 'STANDARD',
    description: 'High-speed tunnel designed for Dialog Home Broadband routers. Unlocks uncapped, unmetered internet through Dialog 298/724 Zoom pack.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },
  {
    id: 'dialog-tiktok-sim',
    title: 'Dialog TikTok (297 / 997 Mobile SIM)',
    isp: 'Dialog',
    categoryLabel: 'Mobile 4G/5G',
    reloadCode: 'Reload Rs. 297 or Rs. 997 TikTok Pack',
    targetMedium: 'Mobile 4G/5G SIM',
    carrierSpeedNote: '2 Mbps Carrier Cap on SIM (Bypassed with VLESS)',
    inboundPort: 443,
    inboundId: 3,
    badge: 'BESTSELLER',
    isPopular: true,
    isActive: true,
    serverType: 'STANDARD',
    description: 'Optimized for Dialog mobile prepaid/postpaid SIMs using TikTok unlimited reload. Routes directly to Singapore Equinix.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },
  {
    id: 'dialog-social-media',
    title: 'Dialog Social Media (348 / 488)',
    isp: 'Dialog',
    categoryLabel: 'Mobile Social',
    reloadCode: '#678# -> Social Media Bundle (348 / 488)',
    targetMedium: 'Mobile 4G/5G SIM',
    carrierSpeedNote: 'Bypasses Facebook, Instagram, WhatsApp & YouTube Quotas',
    inboundPort: 443,
    inboundId: 3,
    badge: 'POPULAR',
    isActive: true,
    serverType: 'STANDARD',
    description: 'Unlocks full internet through Dialog official social media bundles. Clean low-jitter connection for daily web and streaming.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },
  {
    id: 'dialog-video-conferencing',
    title: 'Dialog Video Conferencing (224 / 724 SIM)',
    isp: 'Dialog',
    categoryLabel: 'Work & Study',
    reloadCode: '#678# -> Work & Learn SIM Bundle (224 / 724)',
    targetMedium: 'Mobile 4G/5G SIM',
    carrierSpeedNote: 'Zero-rated Teams & Zoom bucket forwarding',
    inboundPort: 443,
    inboundId: 3,
    isActive: true,
    serverType: 'STANDARD',
    description: 'Masquerades TLS connections through educational and conferencing pools for high-priority routing.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },

  // ==========================================
  // B. SLT MOBITEL FIBER & ADSL (6 Live Variants)
  // ==========================================
  {
    id: 'slt-zoom-meet-fiber',
    title: 'SLT Zoom & Meet (Fiber / 4G / ADSL)',
    isp: 'SLT',
    categoryLabel: 'Fiber & ADSL',
    reloadCode: 'Meet Lite / Meet Max / Flash 5 & 10',
    targetMedium: 'Fiber & 4G',
    carrierSpeedNote: 'Unthrottled Fiber Speeds · Up to 300+ Mbps',
    inboundPort: 445,
    inboundId: 1,
    badge: 'ULTRA FAST',
    isPopular: true,
    isActive: true,
    serverType: 'STANDARD',
    description: 'Dedicated Inbound on Port 445 for SLT Fiber. Delivers raw unthrottled fiber line speeds to Singapore.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },
  {
    id: 'slt-netflix-entertainment',
    title: 'SLT Netflix (1,990 Pack - Fiber & 4G)',
    isp: 'SLT',
    categoryLabel: 'Streaming Bypass',
    reloadCode: 'SLT 1,990 LKR Entertainment Streaming Addon',
    targetMedium: 'Fiber & 4G',
    carrierSpeedNote: 'Routes via Inbound 444 · 4K UHD Streaming Unlocked',
    inboundPort: 444,
    inboundId: 2,
    badge: '4K STREAMING',
    isPopular: true,
    isActive: true,
    serverType: 'STANDARD',
    description: 'Dedicated Inbound on Port 444 for SLT Entertainment. Overcomes evening bandwidth throttling for high-bitrate video, gaming, and downloads.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },
  {
    id: 'slt-zoom-prepaid-235',
    title: 'SLT Zoom Prepaid (235 SIM)',
    isp: 'SLT',
    categoryLabel: 'SLT 4G Prepaid',
    reloadCode: 'Reload Rs. 235 on SLT Prepaid SIM',
    targetMedium: 'Mobile 4G/5G SIM',
    carrierSpeedNote: 'Budget prepaid mobile pack unmetered tunnel',
    inboundPort: 445,
    inboundId: 1,
    isActive: true,
    serverType: 'STANDARD',
    description: 'Tailored for SLT 4G prepaid SIM users holding the 235 Zoom card.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },

  // ==========================================
  // C. AIRTEL PACKAGES (6 Live Variants)
  // ==========================================
  {
    id: 'airtel-tiktok-unlimited',
    title: 'Airtel TikTok (297 / 997 Unlimited)',
    isp: 'Airtel',
    categoryLabel: 'Budget Unlimited',
    reloadCode: 'Reload Rs. 297 or Rs. 997 Airtel TikTok',
    targetMedium: 'Mobile 4G/5G SIM',
    carrierSpeedNote: 'Highest Cost-Efficiency',
    inboundPort: 443,
    inboundId: 3,
    badge: 'HOT DEAL',
    isPopular: true,
    isActive: true,
    serverType: 'STANDARD',
    description: 'Sri Lanka’s most popular budget reload. Unlocks true unrestricted 4G/5G speeds across the whole internet through Airtel TikTok bundle.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },
  {
    id: 'airtel-youtube-pack',
    title: 'Airtel YouTube (135 / 260 Pack)',
    isp: 'Airtel',
    categoryLabel: 'YouTube Unlimited',
    reloadCode: 'Reload Rs. 135 or Rs. 260 YouTube Pack',
    targetMedium: 'Mobile 4G/5G SIM',
    carrierSpeedNote: 'YouTube tunnel with fast video buffering',
    inboundPort: 443,
    inboundId: 3,
    isActive: true,
    serverType: 'STANDARD',
    description: 'Ideal for legacy Airtel SIMs holding YouTube streaming bundles.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },
  {
    id: 'airtel-zoom-work',
    title: 'Airtel Zoom (215 Pack)',
    isp: 'Airtel',
    categoryLabel: 'Work & Learn',
    reloadCode: 'Reload Rs. 215 Work & Study Pack',
    targetMedium: 'Mobile 4G/5G SIM',
    carrierSpeedNote: 'Education bucket forwarding',
    inboundPort: 443,
    inboundId: 3,
    isActive: true,
    serverType: 'STANDARD',
    description: 'Converts student and remote work data allotments into unrestricted web browsing.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },

  // ==========================================
  // D. HUTCH PACKAGES (2 Live Variants)
  // ==========================================
  {
    id: 'hutch-zoom-work',
    title: 'Hutch Zoom & Work (224 / 494 / 794)',
    isp: 'Hutch',
    categoryLabel: 'Work & Learn',
    reloadCode: 'Reload Rs. 224 (No limit) or 494 / 794 (2 Mbps limit)',
    targetMedium: 'Mobile 4G/5G SIM',
    carrierSpeedNote: '224 has No speed limit (30GB cap) · 494/794 has 2 Mbps speed limit',
    inboundPort: 443,
    inboundId: 3,
    badge: 'TRANSPARENT SPEED',
    isPopular: true,
    isActive: true,
    serverType: 'STANDARD',
    description: 'Transparent disclosure: 224 reload delivers unthrottled speeds; 494/794 has carrier-enforced 2 Mbps capping.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },

  // ==========================================
  // E. MOBITEL PACKAGES (2 Live Variants)
  // ==========================================
  {
    id: 'mobitel-zoom-sim',
    title: 'Mobitel Zoom (Android Only - IP Hunt)',
    isp: 'Mobitel',
    categoryLabel: 'Higher Education',
    reloadCode: 'Mobitel Higher Education / Zoom 1 Pack',
    targetMedium: 'Android Only',
    carrierSpeedNote: 'IP Hunt Required on Android',
    inboundPort: 4445,
    inboundId: 4,
    badge: 'IP HUNT NEEDED',
    isActive: true,
    serverType: 'STANDARD',
    description: 'Notice: Requires IP hunt in NetMod on Android to lock into the zero-rated carrier gateway. Delivers ultra low ping once locked.',
    hasSriLankanIpOption: true,
    torrentPolicy: 'Blocked',
    deviceLogins: 'Unlimited Devices (Shared Quota)',
    validityDays: 30,
  },
];
