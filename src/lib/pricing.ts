import { PRODUCTS, type ProductItem } from '@/lib/products';
import { V2RAY_PLAN_TIERS, DURATION_DISCOUNTS, LIVE_V2RAY_PACKAGES } from '@/lib/v2ray-catalog';
import { resolvePackageProfile } from '@/lib/v2ray-inbounds';

/**
 * Server-side price resolution. The browser's cart prices are NEVER trusted:
 * the checkout API recomputes every line from the catalog using only the product id
 * and variant label the client names.
 */

export interface ResolvedPrice {
  unitPriceLKR: number;
  unitPriceUSD: number;
  catalogProduct: ProductItem | null;
  /** Server-owned display title when the id is a generated V2Ray plan id. */
  generatedTitle?: string;
  isV2Ray: boolean;
  /** The V2Ray package id behind a generated plan id (used to block disabled packages). */
  packageId?: string;
}

const PLAN_IDS = V2RAY_PLAN_TIERS.map((t) => t.id.replace(/[-]/g, '\\-')).join('|');

// V2RayPackageCard: `${pkg.id}-${planId}-${standard|lk_ip}-${months}m`
const CARD_ID_RE = new RegExp(`^(.+)-(${PLAN_IDS})-(standard|lk_ip)-(\\d+)m$`);
// products/[id] page: `${product.id}-${planId}-${standard|lk_ip}`
const PAGE_ID_RE = new RegExp(`^(.+)-(${PLAN_IDS})-(standard|lk_ip)$`);

function usd(lkr: number): number {
  return Number((lkr / 305).toFixed(2));
}

/**
 * `knownPackageIds` (checkout passes the custom packages from the admin store): when given, a V2Ray card id
 * must name a package that really exists, so made-up package keys cannot be bought at plan prices.
 */
export function resolveServerPrice(
  productId: string,
  variantLabel: string,
  knownPackageIds?: string[]
): ResolvedPrice | null {
  // 1. Plain catalog product (+ duration/denomination multiplier chosen by label)
  const product = PRODUCTS.find((p) => p.id === productId);
  if (product) {
    const duration = product.durations.find((d) => d.label === variantLabel) || product.durations[0];
    const multiplier = duration?.multiplier || 1;
    return {
      unitPriceLKR: Math.round(product.priceLKR * multiplier),
      unitPriceUSD: Number((product.priceUSD * multiplier).toFixed(2)),
      catalogProduct: product,
      isV2Ray: product.category === 'vpn',
    };
  }

  // 2. V2Ray package card id (plan x server type x months with duration discount)
  const card = CARD_ID_RE.exec(productId);
  if (card) {
    const plan = V2RAY_PLAN_TIERS.find((t) => t.id === card[2]);
    const months = Number(card[4]);
    const discount = DURATION_DISCOUNTS.find((d) => d.months === months);
    if (knownPackageIds && !LIVE_V2RAY_PACKAGES.some((p) => p.id === card[1]) && !knownPackageIds.includes(card[1])) return null;
    if (plan && discount) {
      const base = card[3] === 'lk_ip' ? plan.lkIpPriceLKR : plan.monthlyPriceLKR;
      const total = Math.round(base * (1 - discount.discountPercent / 100)) * months;
      return {
        unitPriceLKR: total,
        unitPriceUSD: usd(total),
        catalogProduct: null,
        generatedTitle: `V2Ray VLESS ${plan.name} ${plan.quotaLabel} (${card[3] === 'lk_ip' ? 'Sri Lankan IP' : 'Singapore SG3'}) - ${months} Month${months > 1 ? 's' : ''}`,
        isV2Ray: true,
        packageId: card[1],
      };
    }
    return null;
  }

  // 3. V2Ray product page id (catalog vpn product x plan tier x server type)
  const page = PAGE_ID_RE.exec(productId);
  if (page) {
    const baseProduct = PRODUCTS.find((p) => p.id === page[1] && p.category === 'vpn');
    const plan = V2RAY_PLAN_TIERS.find((t) => t.id === page[2]);
    if (baseProduct && plan) {
      const total = page[3] === 'lk_ip' ? plan.lkIpPriceLKR : plan.monthlyPriceLKR;
      return {
        unitPriceLKR: total,
        unitPriceUSD: Number((total / 300).toFixed(2)),
        catalogProduct: baseProduct,
        generatedTitle: `V2Ray VLESS ${baseProduct.title} (${plan.label}) - ${page[3] === 'lk_ip' ? 'LK IP' : 'SG Server'}`,
        isV2Ray: true,
      };
    }
  }

  return null;
}

export interface V2RayProvisionSpec {
  inboundId: number;
  port: number;
  sni: string;
  remarkName: string;
  /** null = use the panel's default public host */
  host: string | null;
  totalBytes: number; // 0 = unlimited
  expiryDays: number;
  limitIp: number;
}

/**
 * What to create on the 3x-ui panel for a purchased V2Ray product id: the package's inbound /
 * port / SNI, plus the plan's quota, device limit and the months that were actually paid for.
 */
export function resolveV2RayProvisioning(
  productId: string,
  /** Admin-panel edits (package overrides / custom packages) win over the built-in catalog. */
  extra?: {
    overrides?: Record<string, { inboundId?: number; inboundPort?: number; sni?: string; title?: string }>;
    customPackages?: { id: string; title?: string; inboundId?: number; inboundPort?: number; sni?: string; serverType?: string }[];
  }
): V2RayProvisionSpec {
  const GB = 1024 * 1024 * 1024;
  let pkgKey = productId;
  let planId: string | null = null;
  let months = 1;
  let lkIp = false;

  const card = CARD_ID_RE.exec(productId);
  const page = PAGE_ID_RE.exec(productId);
  if (card) {
    pkgKey = card[1];
    planId = card[2];
    months = Number(card[4]) || 1;
    lkIp = card[3] === 'lk_ip';
  } else if (page) {
    pkgKey = page[1];
    planId = page[2];
    lkIp = page[3] === 'lk_ip';
  }

  const plan = planId ? V2RAY_PLAN_TIERS.find((t) => t.id === planId) : undefined;
  const catalogPkg =
    LIVE_V2RAY_PACKAGES.find((p) => p.id === pkgKey) || extra?.customPackages?.find((p) => p.id === pkgKey);
  const ovr = extra?.overrides?.[pkgKey];
  const profile = resolvePackageProfile(pkgKey);
  lkIp = lkIp || catalogPkg?.serverType === 'LK_IP';

  return {
    inboundId: ovr?.inboundId ?? catalogPkg?.inboundId ?? profile.inboundId,
    port: ovr?.inboundPort ?? catalogPkg?.inboundPort ?? profile.port,
    sni: ovr?.sni ?? catalogPkg?.sni ?? profile.sni,
    remarkName: catalogPkg ? `Fibez - ${ovr?.title || catalogPkg.title}` : profile.remarkName,
    host: lkIp ? 'lk-rv2ray.fibez.store' : null,
    totalBytes: plan ? plan.quotaGB * GB : 100 * GB,
    expiryDays: 30 * months,
    limitIp: plan?.deviceLimit ?? 2,
  };
}
/**
 * Price of renewing a line you bought as a V2Ray plan: the same package + plan + server type,
 * for 1, 3, 6 or 12 months (with the normal duration discount). Null if it was not bought as a plan.
 */
export function renewalQuote(productId: string, months: number): { productId: string; title: string; priceLKR: number } | null {
  if (!DURATION_DISCOUNTS.some((d) => d.months === months)) return null;
  const card = CARD_ID_RE.exec(productId);
  const page = PAGE_ID_RE.exec(productId);
  const parts = card ? [card[1], card[2], card[3]] : page ? [page[1], page[2], page[3]] : null;
  if (!parts) return null;
  const id = `${parts[0]}-${parts[1]}-${parts[2]}-${months}m`;
  const priced = resolveServerPrice(id, '');
  if (!priced || !priced.generatedTitle) return null;
  return { productId: id, title: `Renewal: ${priced.generatedTitle}`, priceLKR: priced.unitPriceLKR };
}