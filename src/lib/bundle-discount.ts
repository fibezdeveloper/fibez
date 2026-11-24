/**
 * Multi-line bundle discount: buying several V2Ray lines in one order is cheaper per line.
 * Used by checkout (the real price, server side) and the cart page (the preview the customer sees),
 * so both always agree. It applies to the V2Ray lines only, never to shop products.
 *
 *   3 or 4 lines in one order -> 5% off those lines
 *   5 or more lines           -> 10% off those lines
 */
export const BUNDLE_TIERS: { minLines: number; percent: number }[] = [
  { minLines: 5, percent: 10 },
  { minLines: 3, percent: 5 },
];

export interface BundleLine {
  isV2Ray: boolean;
  quantity: number;
  subtotalLKR: number;
}

export interface BundleResult {
  lines: number;
  percent: number;
  discountLKR: number;
  /** Lines still needed for the next tier (null when already on the top tier or none apply). */
  nextTier: { moreLines: number; percent: number } | null;
}

export function bundleDiscount(items: BundleLine[]): BundleResult {
  const v2 = items.filter((i) => i.isV2Ray);
  const lines = v2.reduce((n, i) => n + Math.max(0, Math.floor(i.quantity)), 0);
  const subtotal = v2.reduce((n, i) => n + Math.max(0, i.subtotalLKR), 0);
  const tier = BUNDLE_TIERS.find((t) => lines >= t.minLines);
  const percent = tier?.percent ?? 0;
  const next = [...BUNDLE_TIERS].reverse().find((t) => lines < t.minLines) ?? null;
  return {
    lines,
    percent,
    discountLKR: Math.floor((subtotal * percent) / 100),
    nextTier: next ? { moreLines: next.minLines - lines, percent: next.percent } : null,
  };
}
