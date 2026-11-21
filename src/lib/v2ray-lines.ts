import { LIVE_V2RAY_PACKAGES, V2RayPackageDef, normalizeIsp } from '@/lib/v2ray-catalog';
import { buildVlessUri, parseVlessUri } from '@/lib/v2ray-inbounds';

export interface PurchasedV2RayLine {
  id: string;
  orderNumber: string;
  packageId: string;
  title: string;
  isp: string;
  ispTag: string;
  sni: string;
  port: number;
  inboundId?: number;
  serverType: 'STANDARD' | 'LK_IP';
  location: string;
  quotaLabel: string;
  /** Data cap in GB from the panel; 0 means unlimited. */
  quotaGB: number;
  /** Days left on the panel (0 = expired or no expiry). */
  validityDays: number;
  usedGB?: number;
  vlessUri: string;
  uuid: string;
  purchasedAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
  notes?: string;
  /** When the line expires on the panel (ISO). */
  expiresAt?: string | null;
  /** True when this line can be renewed online from the wallet. */
  renewable?: boolean;
  /** True while the order can still be refunded (24h after delivery, not confirmed as working). */
  refundable?: boolean;
  refundDeadline?: string | null;
}

// No demo lines: a line only exists if it was really delivered to the signed-in account.
export const DEFAULT_PURCHASED_LINES: PurchasedV2RayLine[] = [];

export const V2RAY_LINES_STORAGE_KEY = 'fibez_v2ray_lines';
export const V2RAY_ACTIVE_LINE_STORAGE_KEY = 'fibez_active_line_id';

/**
 * Find matched catalog definition by packageId or title substring
 */
export function findCatalogPackage(packageId?: string, title?: string): V2RayPackageDef | undefined {
  if (!packageId && !title) return undefined;
  
  const cleanId = (packageId || '').toLowerCase().replace(/^v2ray-/, '');
  
  // 1. Direct id match
  let matched = LIVE_V2RAY_PACKAGES.find(
    (p) => p.id.toLowerCase() === cleanId || p.id.toLowerCase() === (packageId || '').toLowerCase()
  );
  if (matched) return matched;

  // 2. Title match
  if (title) {
    const cleanTitle = title.toLowerCase();
    matched = LIVE_V2RAY_PACKAGES.find((p) => {
      const pTitle = p.title.toLowerCase();
      return cleanTitle.includes(pTitle) || pTitle.includes(cleanTitle);
    });
    if (matched) return matched;
  }

  // 3. Fallback partial match on isp and keywords
  if (packageId) {
    matched = LIVE_V2RAY_PACKAGES.find((p) => cleanId.includes(p.id) || p.id.includes(cleanId));
    if (matched) return matched;
  }

  return undefined;
}

/**
 * Creates a PurchasedV2RayLine object from cart item details and order number
 */
export function createPurchasedLineFromCartItem(params: {
  orderNumber: string;
  productId: string;
  title: string;
  variantTitle?: string;
  selectedIsp?: string;
  customUuid?: string;
  dispensedKey?: string | null;
}): PurchasedV2RayLine {
  const { orderNumber, productId, title, variantTitle, selectedIsp, customUuid, dispensedKey } = params;
  const catalogPkg = findCatalogPackage(productId, title);

  // The uuid must match the delivered config, otherwise telemetry/ownership checks would fail.
  const deliveredUuid = dispensedKey && dispensedKey.startsWith('vless://') ? parseVlessUri(dispensedKey)?.uuid : undefined;
  const uuid = customUuid || deliveredUuid || crypto.randomUUID();
  const safeIsp = catalogPkg ? normalizeIsp(catalogPkg.isp) : normalizeIsp(selectedIsp || 'Dialog');
  const isLkIp = Boolean(
    catalogPkg?.serverType === 'LK_IP' ||
    productId.includes('lk-ip') ||
    (title || '').toLowerCase().includes('sri lankan ip')
  );

  const port = catalogPkg?.inboundPort || (safeIsp === 'SLT' ? 445 : 443);
  const sni = catalogPkg?.sni || (safeIsp === 'SLT' ? 'm.zoom.us' : 'zoom.us');
  const location = isLkIp ? 'Sri Lanka Residential Gateway' : 'Singapore Equinix SG3';
  const host = isLkIp ? 'lk-rv2ray.fibez.store' : 'rv2ray.fibez.store';

  // Extract quota numbers from label (e.g. "150 GB (30 Days)" -> 150)
  let quotaGB = 100;
  if (variantTitle) {
    const match = variantTitle.match(/(\d+)\s*GB/i);
    if (match) {
      quotaGB = parseInt(match[1], 10);
    } else if (variantTitle.toLowerCase().includes('unlimited')) {
      quotaGB = 9999;
    }
  }

  const vless = dispensedKey && dispensedKey.startsWith('vless://')
    ? dispensedKey
    : buildVlessUri({
        uuid,
        host,
        port,
        sni,
        remark: `Fibez - ${title.split('[')[0].trim()}`,
      });

  const uniqueId = `line_${orderNumber.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  return {
    id: uniqueId,
    orderNumber,
    packageId: catalogPkg?.id || productId,
    title: catalogPkg?.title || title,
    isp: safeIsp === 'SLT' ? 'SLT Mobitel Fiber' : `${safeIsp} 4G/5G`,
    ispTag: safeIsp,
    sni,
    port,
    inboundId: catalogPkg?.inboundId || (port === 445 ? 1 : port === 444 ? 2 : 3),
    serverType: isLkIp ? 'LK_IP' : 'STANDARD',
    location,
    quotaLabel: variantTitle || '100 GB (30d)',
    quotaGB,
    validityDays: 30,
    uuid,
    vlessUri: vless,
    purchasedAt: new Date().toISOString(),
    status: 'ACTIVE',
  };
}

/**
 * Loads purchased lines from localStorage with fallback to default lines
 */
export function loadPurchasedLines(): PurchasedV2RayLine[] {
  if (typeof window === 'undefined') return DEFAULT_PURCHASED_LINES;
  try {
    const saved = localStorage.getItem(V2RAY_LINES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved V2Ray lines from localStorage:', e);
  }
  return DEFAULT_PURCHASED_LINES;
}

/**
 * Saves lines to localStorage
 */
export function savePurchasedLines(lines: PurchasedV2RayLine[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(V2RAY_LINES_STORAGE_KEY, JSON.stringify(lines));
  } catch (e) {
    console.warn('Failed to save V2Ray lines to localStorage:', e);
  }
}

/**
 * Appends or prepends newly purchased lines and marks the first as active
 */
export function recordPurchasedLines(newLines: PurchasedV2RayLine[]): void {
  if (typeof window === 'undefined' || newLines.length === 0) return;
  try {
    const existing = loadPurchasedLines();
    // Filter out duplicates with same orderNumber and packageId
    const filteredExisting = existing.filter(
      (oldLine) => !newLines.some((nl) => nl.id === oldLine.id || (nl.orderNumber === oldLine.orderNumber && nl.packageId === oldLine.packageId))
    );
    const combined = [...newLines, ...filteredExisting];
    savePurchasedLines(combined);
    localStorage.setItem(V2RAY_ACTIVE_LINE_STORAGE_KEY, newLines[0].id);
  } catch (e) {
    console.warn('Failed to record purchased lines:', e);
  }
}
