/**
 * Fibez V2Ray Inbound & Dynamic SNI Routing Configuration
 * 
 * Maps specific customer ISP packages to 3x-ui inbounds:
 * - Inbound 1: Port 445 (SLT Fiber Zoom / Meet / Work & Learn) -> optimal Zoom SNI
 * - Inbound 2: Port 444 (SLT Fiber Netflix / Entertainment) -> optimal Netflix SNI
 * - Inbound 3: Port 443 (Dialog Zoom, Dialog TikTok, Dialog Social, Hutch Blaster, etc.)
 *              -> Dynamically applies package-specific SNI (e.g. m.tiktok.com) and remark name
 */

export interface V2RayInboundDefinition {
  inboundId: number;
  port: number;
  defaultSni: string;
  network: 'tcp' | 'ws';
  security: 'tls';
  remark: string;
}

export const INBOUND_DEFINITIONS: Record<number, V2RayInboundDefinition> = {
  1: {
    inboundId: 1,
    port: 445,
    defaultSni: 'teams.microsoft.com',
    network: 'tcp',
    security: 'tls',
    remark: 'Fibez - SLT Meet',
  },
  2: {
    inboundId: 2,
    port: 444,
    defaultSni: 'api.netflix.com',
    network: 'tcp',
    security: 'tls',
    remark: 'Fibez - SLT Entertainment',
  },
  3: {
    inboundId: 3,
    port: 443,
    defaultSni: 'zoom.us',
    network: 'tcp',
    security: 'tls',
    remark: 'Fibez - Dialog Zoom',
  },
  4: {
    inboundId: 4,
    port: 4445,
    defaultSni: 'gateway.icloud.com',
    network: 'tcp',
    security: 'tls',
    remark: 'mobitel zoom sim',
  },
  5: {
    inboundId: 5,
    port: 443,
    defaultSni: 'zoom.us',
    network: 'tcp',
    security: 'tls',
    remark: 'NORMAL METHOD',
  },
};

export interface PackageRoutingProfile {
  packageId: string;
  title: string;
  ispTag: string;
  inboundId: number;
  port: number;
  sni: string;
  remarkName: string;
  description: string;
}

export const PACKAGE_ROUTING_PROFILES: Record<string, PackageRoutingProfile> = {
  // --- INBOUND 1: Port 445 (SLT Fiber Meet / Zoom / Work & Learn) ---
  'slt-zoom': {
    packageId: 'slt-zoom',
    title: 'SLT Fiber Zoom & Meet Unlimited',
    ispTag: 'SLT Fiber',
    inboundId: 1,
    port: 445,
    sni: 'm.zoom.us',
    remarkName: 'Fibez - SLT Fiber Zoom & Meet',
    description: 'Bypasses SLT Fiber Zoom/Meet bucket with unmetered high-speed Singapore tunnel.',
  },
  'v2ray-slt-zoom': {
    packageId: 'v2ray-slt-zoom',
    title: 'SLT Fiber Zoom & Meet Unlimited',
    ispTag: 'SLT Fiber',
    inboundId: 1,
    port: 445,
    sni: 'm.zoom.us',
    remarkName: 'Fibez - SLT Fiber Zoom & Meet',
    description: 'Bypasses SLT Fiber Zoom/Meet bucket with unmetered high-speed Singapore tunnel.',
  },
  'slt-work-learn': {
    packageId: 'slt-work-learn',
    title: 'SLT Fiber Work & Learn Package',
    ispTag: 'SLT Fiber',
    inboundId: 1,
    port: 445,
    sni: 'm.zoom.us',
    remarkName: 'Fibez - SLT Fiber Work & Learn',
    description: 'Bypasses SLT Fiber educational & Work and Learn quotas with full unmetered speed.',
  },

  // --- INBOUND 2: Port 444 (SLT Fiber Netflix & Entertainment) ---
  'slt-netflix': {
    packageId: 'slt-netflix',
    title: 'SLT Fiber Netflix & Streaming Unlimited',
    ispTag: 'SLT Fiber',
    inboundId: 2,
    port: 444,
    sni: 'netflix.com',
    remarkName: 'Fibez - SLT Fiber Netflix',
    description: 'Bypasses evening throttling through SLT Netflix/YouTube streaming data bundle.',
  },
  'v2ray-slt-netflix': {
    packageId: 'v2ray-slt-netflix',
    title: 'SLT Fiber Netflix & Streaming Unlimited',
    ispTag: 'SLT Fiber',
    inboundId: 2,
    port: 444,
    sni: 'netflix.com',
    remarkName: 'Fibez - SLT Fiber Netflix',
    description: 'Bypasses evening throttling through SLT Netflix/YouTube streaming data bundle.',
  },
  'slt-youtube': {
    packageId: 'slt-youtube',
    title: 'SLT Fiber YouTube & Social Unlimited',
    ispTag: 'SLT Fiber',
    inboundId: 2,
    port: 444,
    sni: 'netflix.com',
    remarkName: 'Fibez - SLT Fiber YouTube & Streaming',
    description: 'Bypasses SLT YouTube bucket for unmetered 4K streaming and low-latency gaming.',
  },

  // --- INBOUND 3: Port 443 (Dialog Zoom, Dialog TikTok, Social Blaster, Hutch, Airtel) ---
  'dialog-zoom': {
    packageId: 'dialog-zoom',
    title: 'Dialog Zoom & Router Unlimited',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Dialog Zoom Unlimited',
    description: 'Optimized for Dialog 4G, 5G and Home Broadband Zoom / Work & Learn package (*678#).',
  },
  'v2ray-dialog-zoom': {
    packageId: 'v2ray-dialog-zoom',
    title: 'Dialog Zoom & Router Unlimited',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Dialog Zoom Unlimited',
    description: 'Optimized for Dialog 4G, 5G and Home Broadband Zoom / Work & Learn package (*678#).',
  },
  'dialog-tiktok': {
    packageId: 'dialog-tiktok',
    title: 'Dialog TikTok Mobile SIM Unlimited',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'm.tiktok.com',
    remarkName: 'Fibez - Dialog TikTok Unlimited',
    description: 'Bypasses Dialog TikTok mobile SIM package with dedicated m.tiktok.com SNI masquerade.',
  },
  'v2ray-dialog-tiktok': {
    packageId: 'v2ray-dialog-tiktok',
    title: 'Dialog TikTok Mobile SIM Unlimited',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'm.tiktok.com',
    remarkName: 'Fibez - Dialog TikTok Unlimited',
    description: 'Bypasses Dialog TikTok mobile SIM package with dedicated m.tiktok.com SNI masquerade.',
  },
  'dialog-social': {
    packageId: 'dialog-social',
    title: 'Dialog Social Media Blaster',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'm.facebook.com',
    remarkName: 'Fibez - Dialog Social Blaster',
    description: 'Bypasses Dialog Social Media Blaster reload bundle for unlimited browsing.',
  },
  'v2ray-dialog-social': {
    packageId: 'v2ray-dialog-social',
    title: 'Dialog Social Media Blaster',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'm.facebook.com',
    remarkName: 'Fibez - Dialog Social Blaster',
    description: 'Bypasses Dialog Social Media Blaster reload bundle for unlimited browsing.',
  },
  'hutch-social': {
    packageId: 'hutch-social',
    title: 'Hutch Social Media Blaster',
    ispTag: 'Hutch',
    inboundId: 3,
    port: 443,
    sni: 'm.tiktok.com',
    remarkName: 'Fibez - Hutch Social Blaster',
    description: 'Optimized for Hutch Social Media Blaster & TikTok bundle unmetered tunneling.',
  },
  'v2ray-hutch-social': {
    packageId: 'v2ray-hutch-social',
    title: 'Hutch Social Media Blaster',
    ispTag: 'Hutch',
    inboundId: 3,
    port: 443,
    sni: 'm.tiktok.com',
    remarkName: 'Fibez - Hutch Social Blaster',
    description: 'Optimized for Hutch Social Media Blaster & TikTok bundle unmetered tunneling.',
  },
  'hutch-zoom': {
    packageId: 'hutch-zoom',
    title: 'Hutch Zoom & Work Pack',
    ispTag: 'Hutch',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Hutch Zoom & Work',
    description: 'Optimized for Hutch 4G Work & Zoom bundles with sub-25ms latency to Singapore.',
  },
  'v2ray-hutch-zoom': {
    packageId: 'v2ray-hutch-zoom',
    title: 'Hutch Zoom & Work Pack',
    ispTag: 'Hutch',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Hutch Zoom & Work',
    description: 'Optimized for Hutch 4G Work & Zoom bundles with sub-25ms latency to Singapore.',
  },
  'airtel-tiktok': {
    packageId: 'airtel-tiktok',
    title: 'Airtel TikTok 297/997 Unlimited',
    ispTag: 'Airtel',
    inboundId: 3,
    port: 443,
    sni: 'm.tiktok.com',
    remarkName: 'Fibez - Airtel TikTok Unlimited',
    description: 'Unlocks unmetered internet through Airtel 297 or 997 TikTok unlimited reload.',
  },
  'v2ray-airtel-tiktok': {
    packageId: 'v2ray-airtel-tiktok',
    title: 'Airtel TikTok 297/997 Unlimited',
    ispTag: 'Airtel',
    inboundId: 3,
    port: 443,
    sni: 'm.tiktok.com',
    remarkName: 'Fibez - Airtel TikTok Unlimited',
    description: 'Unlocks unmetered internet through Airtel 297 or 997 TikTok unlimited reload.',
  },
  'mobitel-zoom': {
    packageId: 'mobitel-zoom',
    title: 'Mobitel Zoom1 & Higher Education',
    ispTag: 'Mobitel',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Mobitel Zoom & Learn',
    description: 'Optimized for Mobitel prepaid and postpaid Zoom1 & Higher Education packages (#170#).',
  },
  'v2ray-mobitel-zoom': {
    packageId: 'v2ray-mobitel-zoom',
    title: 'Mobitel Zoom1 & Higher Education',
    ispTag: 'Mobitel',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Mobitel Zoom & Learn',
    description: 'Optimized for Mobitel prepaid and postpaid Zoom1 & Higher Education packages (#170#).',
  },
  'dialog-zoom-router': {
    packageId: 'dialog-zoom-router',
    title: 'Dialog Zoom (298 / 724 Router)',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Dialog Zoom Router',
    description: 'High-speed tunnel designed for Dialog Home Broadband routers.',
  },
  'dialog-tiktok-sim': {
    packageId: 'dialog-tiktok-sim',
    title: 'Dialog TikTok (297 / 997 Mobile SIM)',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'm.tiktok.com',
    remarkName: 'Fibez - Dialog TikTok SIM',
    description: 'Optimized for Dialog mobile prepaid/postpaid SIMs using TikTok unlimited reload.',
  },
  'dialog-social-media': {
    packageId: 'dialog-social-media',
    title: 'Dialog Social Media (348 / 488)',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'm.facebook.com',
    remarkName: 'Fibez - Dialog Social Media',
    description: 'Bypasses Facebook, Instagram, WhatsApp & YouTube Quotas.',
  },
  'dialog-video-conferencing': {
    packageId: 'dialog-video-conferencing',
    title: 'Dialog Video Conferencing (224 / 724 SIM)',
    ispTag: 'Dialog',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Dialog Video Conferencing',
    description: 'Bypasses Dialog 224/724 Video Conferencing SIM quotas.',
  },
  'slt-zoom-meet-fiber': {
    packageId: 'slt-zoom-meet-fiber',
    title: 'SLT Zoom & Meet (Fiber / 4G / ADSL)',
    ispTag: 'SLT',
    inboundId: 1,
    port: 445,
    sni: 'teams.microsoft.com',
    remarkName: 'Fibez - SLT Meet & Zoom',
    description: 'Dedicated Port 445 for SLT Fiber, 4G & ADSL Meet / Zoom packages.',
  },
  'slt-netflix-entertainment': {
    packageId: 'slt-netflix-entertainment',
    title: 'SLT Netflix (1,990 Pack - Fiber & 4G)',
    ispTag: 'SLT',
    inboundId: 2,
    port: 444,
    sni: 'api.netflix.com',
    remarkName: 'Fibez - SLT Netflix',
    description: 'Dedicated Port 444 for SLT Fiber & 4G Netflix unthrottled streaming.',
  },
  'slt-zoom-prepaid-235': {
    packageId: 'slt-zoom-prepaid-235',
    title: 'SLT Zoom Prepaid (235 SIM)',
    ispTag: 'SLT',
    inboundId: 1,
    port: 445,
    sni: 'teams.microsoft.com',
    remarkName: 'Fibez - SLT Zoom 235',
    description: 'Budget prepaid mobile unmetered tunnel on Port 445.',
  },
  'airtel-tiktok-unlimited': {
    packageId: 'airtel-tiktok-unlimited',
    title: 'Airtel TikTok (297 / 997 Unlimited)',
    ispTag: 'Airtel',
    inboundId: 3,
    port: 443,
    sni: 'm.tiktok.com',
    remarkName: 'Fibez - Airtel TikTok Unlimited',
    description: 'Unlocks unmetered internet through Airtel 297 or 997 TikTok unlimited reload.',
  },
  'airtel-youtube-pack': {
    packageId: 'airtel-youtube-pack',
    title: 'Airtel YouTube (135 / 260 Pack)',
    ispTag: 'Airtel',
    inboundId: 3,
    port: 443,
    sni: 'm.youtube.com',
    remarkName: 'Fibez - Airtel YouTube Pack',
    description: 'Bypasses Airtel YouTube data reload bundle.',
  },
  'airtel-zoom-work': {
    packageId: 'airtel-zoom-work',
    title: 'Airtel Zoom (215 Pack)',
    ispTag: 'Airtel',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Airtel Zoom Pack',
    description: 'Bypasses Airtel 215 Work & Learn pack.',
  },
  'hutch-zoom-work': {
    packageId: 'hutch-zoom-work',
    title: 'Hutch Zoom & Work (224 / 494 / 794)',
    ispTag: 'Hutch',
    inboundId: 3,
    port: 443,
    sni: 'zoom.us',
    remarkName: 'Fibez - Hutch Zoom & Work',
    description: 'Optimized for Hutch 4G Work & Zoom bundles.',
  },
  'mobitel-zoom-sim': {
    packageId: 'mobitel-zoom-sim',
    title: 'Mobitel Zoom (Android Only - IP Hunt)',
    ispTag: 'Mobitel',
    inboundId: 4,
    port: 4445,
    sni: 'gateway.icloud.com',
    remarkName: 'Fibez - Mobitel Zoom SIM',
    description: 'Optimized for Mobitel Port 4445 IP Hunt.',
  },
  'singapore-vip': {
    packageId: 'singapore-vip',
    title: 'Universal Singapore Direct VIP',
    ispTag: 'All ISPs',
    inboundId: 3,
    port: 443,
    sni: 'speed.cloudflare.com',
    remarkName: 'Fibez - Singapore VIP Direct',
    description: 'Universal Singapore Equinix SG3 connection with Cloudflare Speed SNI for all providers.',
  },
  'v2ray-singapore-direct': {
    packageId: 'v2ray-singapore-direct',
    title: 'Universal Singapore Direct VIP',
    ispTag: 'All ISPs',
    inboundId: 3,
    port: 443,
    sni: 'speed.cloudflare.com',
    remarkName: 'Fibez - Singapore VIP Direct',
    description: 'Universal Singapore Equinix SG3 connection with Cloudflare Speed SNI for all providers.',
  },
};

/**
 * Resolves the appropriate routing profile based on package ID or ISP query
 */
export function resolvePackageProfile(packageKeyOrIsp?: string | null): PackageRoutingProfile {
  if (!packageKeyOrIsp) {
    return PACKAGE_ROUTING_PROFILES['dialog-zoom'];
  }

  const key = packageKeyOrIsp.trim().toLowerCase();

  // Exact match
  if (PACKAGE_ROUTING_PROFILES[key]) {
    return PACKAGE_ROUTING_PROFILES[key];
  }

  // Substring matching
  if (key.includes('tiktok') && (key.includes('airtel') || key.includes('297') || key.includes('997'))) {
    return PACKAGE_ROUTING_PROFILES['airtel-tiktok'];
  }
  if (key.includes('tiktok')) {
    return PACKAGE_ROUTING_PROFILES['dialog-tiktok'];
  }
  if (key.includes('netflix') || (key.includes('slt') && key.includes('ent'))) {
    return PACKAGE_ROUTING_PROFILES['slt-netflix'];
  }
  if (key.includes('slt') && (key.includes('meet') || key.includes('zoom') || key.includes('work'))) {
    return PACKAGE_ROUTING_PROFILES['slt-zoom'];
  }
  if (key.includes('hutch') && (key.includes('social') || key.includes('blaster'))) {
    return PACKAGE_ROUTING_PROFILES['hutch-social'];
  }
  if (key.includes('hutch')) {
    return PACKAGE_ROUTING_PROFILES['hutch-zoom'];
  }
  if (key.includes('social') || key.includes('blaster')) {
    return PACKAGE_ROUTING_PROFILES['dialog-social'];
  }
  if (key.includes('mobitel')) {
    return PACKAGE_ROUTING_PROFILES['mobitel-zoom'];
  }
  if (key.includes('dialog')) {
    return PACKAGE_ROUTING_PROFILES['dialog-zoom'];
  }

  return PACKAGE_ROUTING_PROFILES['dialog-zoom'];
}

/**
 * Builds the customized VLESS URI for a client
 */
export function buildVlessUri({
  uuid,
  host = process.env.XUI_PUBLIC_HOST || 'rv2ray.fibez.store',
  port,
  sni,
  remark,
  fingerprint = 'chrome',
}: {
  uuid: string;
  host?: string;
  port: number;
  sni: string;
  remark: string;
  fingerprint?: string;
}): string {
  const encodedRemark = encodeURIComponent(remark);
  return `vless://${uuid}@${host}:${port}?type=tcp&security=tls&sni=${sni}&fp=${fingerprint}#${encodedRemark}`;
}

export interface ParsedVlessUri {
  uuid: string;
  host: string;
  port: number;
  sni: string;
  type: string;
  security: string;
  remark: string;
  fingerprint: string;
}

/**
 * Parses any incoming VLESS URI to extract UUID, host, port, SNI and remark
 */
export function parseVlessUri(vlessUri: string): ParsedVlessUri | null {
  try {
    const raw = vlessUri.trim();
    if (!raw.startsWith('vless://')) return null;

    const withoutProto = raw.slice(8);
    const atIdx = withoutProto.indexOf('@');
    if (atIdx === -1) return null;

    const uuid = withoutProto.slice(0, atIdx);
    const remainder = withoutProto.slice(atIdx + 1);

    const hashIdx = remainder.indexOf('#');
    const remark = hashIdx !== -1 ? decodeURIComponent(remainder.slice(hashIdx + 1)) : '';
    const mainPart = hashIdx !== -1 ? remainder.slice(0, hashIdx) : remainder;

    const questionIdx = mainPart.indexOf('?');
    const hostPort = questionIdx !== -1 ? mainPart.slice(0, questionIdx) : mainPart;
    const queryString = questionIdx !== -1 ? mainPart.slice(questionIdx + 1) : '';

    const colonIdx = hostPort.lastIndexOf(':');
    const host = colonIdx !== -1 ? hostPort.slice(0, colonIdx) : hostPort;
    const port = colonIdx !== -1 ? parseInt(hostPort.slice(colonIdx + 1), 10) : 443;

    const params = new URLSearchParams(queryString);
    const sni = params.get('sni') || params.get('host') || host;
    const type = params.get('type') || 'tcp';
    const security = params.get('security') || 'tls';
    const fingerprint = params.get('fp') || 'chrome';

    return {
      uuid,
      host,
      port: isNaN(port) ? 443 : port,
      sni,
      type,
      security,
      remark,
      fingerprint,
    };
  } catch (e) {
    console.error('Error parsing VLESS URI:', e);
    return null;
  }
}
