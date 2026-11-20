import { PRODUCTS, type ProductItem } from '@/lib/products';
import { V2RAY_PLAN_TIERS, DURATION_DISCOUNTS } from '@/lib/v2ray-catalog';

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
}

const PLAN_IDS = V2RAY_PLAN_TIERS.map((t) => t.id.replace(/[-]/g, '\\-')).join('|');

// V2RayPackageCard: `${pkg.id}-${planId}-${standard|lk_ip}-${months}m`
const CARD_ID_RE = new RegExp(`^(.+)-(${PLAN_IDS})-(standard|lk_ip)-(\\d+)m$`);
// products/[id] page: `${product.id}-${planId}-${standard|lk_ip}`
const PAGE_ID_RE = new RegExp(`^(.+)-(${PLAN_IDS})-(standard|lk_ip)$`);

function usd(lkr: number): number {
  return Number((lkr / 305).toFixed(2));
}

export function resolveServerPrice(productId: string, variantLabel: string): ResolvedPrice | null {
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
    if (plan && discount) {
      const base = card[3] === 'lk_ip' ? plan.lkIpPriceLKR : plan.monthlyPriceLKR;
      const total = Math.round(base * (1 - discount.discountPercent / 100)) * months;
      return {
        unitPriceLKR: total,
        unitPriceUSD: usd(total),
        catalogProduct: null,
        generatedTitle: `V2Ray VLESS ${plan.name} ${plan.quotaLabel} (${card[3] === 'lk_ip' ? 'Sri Lankan IP' : 'Singapore SG3'}) - ${months} Month${months > 1 ? 's' : ''}`,
        isV2Ray: true,
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
