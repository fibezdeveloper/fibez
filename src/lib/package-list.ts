import { adminStore } from '@/lib/admin-store';
import { LIVE_V2RAY_PACKAGES, normalizeIsp, V2RayPackageDef } from '@/lib/v2ray-catalog';

/** Every package (custom ones first) with the owner's edits applied. Includes routing details: staff only. */
export async function getResolvedPackages() {
  const overrides = await adminStore.getPackageOverrides();
  const customPackages = await adminStore.getCustomPackages();

  const allDefs: V2RayPackageDef[] = [...customPackages, ...LIVE_V2RAY_PACKAGES];

  // Deduplicate in case a custom package overrides by ID
  const seenIds = new Set<string>();
  const uniqueDefs = allDefs.filter((p) => {
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });

  return uniqueDefs.map((pkg) => {
    const ovr = overrides[pkg.id];
    const rawIsp = ovr?.isp || pkg.isp;
    const normalizedIsp = normalizeIsp(rawIsp);
    const port = Number(ovr?.inboundPort || pkg.inboundPort || (pkg as any).port || 443);
    const inboundId = Number(ovr?.inboundId || pkg.inboundId || 3);

    return {
      ...pkg,
      title: ovr?.title || pkg.title,
      isp: normalizedIsp,
      categoryLabel: ovr?.categoryLabel || pkg.categoryLabel || 'Carrier Bypass',
      reloadCode: ovr?.reloadCode !== undefined ? ovr.reloadCode : pkg.reloadCode,
      carrierSpeedNote: ovr?.carrierSpeedNote !== undefined ? ovr.carrierSpeedNote : pkg.carrierSpeedNote,
      sni: ovr?.sni || pkg.sni || 'zoom.us',
      inboundPort: port,
      port: port, // alias for backwards compatibility
      inboundId: inboundId,
      isActive: ovr?.isActive !== undefined ? ovr.isActive : pkg.isActive,
      badge: ovr?.badge !== undefined ? ovr.badge : pkg.badge,
      standardPriceAdjustmentLKR:
        ovr?.standardPriceAdjustmentLKR !== undefined ? ovr.standardPriceAdjustmentLKR : pkg.standardPriceAdjustmentLKR || 0,
      serverType: ovr?.serverType || pkg.serverType || 'STANDARD',
      targetMedium: ovr?.targetMedium || pkg.targetMedium || 'Home Broadband Router',
      isCustom: Boolean(pkg.isCustom || (ovr as any)?.isCustom),
    };
  });
}

/** What the storefront may see. An allow-list, so a new internal field is private until added here. */
export function toPublicPackage(pkg: Awaited<ReturnType<typeof getResolvedPackages>>[number]) {
  return {
    id: pkg.id,
    title: pkg.title,
    isp: pkg.isp,
    categoryLabel: pkg.categoryLabel,
    reloadCode: pkg.reloadCode,
    targetMedium: pkg.targetMedium,
    carrierSpeedNote: pkg.carrierSpeedNote,
    badge: pkg.badge,
    isPopular: pkg.isPopular,
    isActive: pkg.isActive,
    description: pkg.description,
    hasSriLankanIpOption: pkg.hasSriLankanIpOption,
    serverType: pkg.serverType,
    torrentPolicy: pkg.torrentPolicy,
    deviceLogins: pkg.deviceLogins,
    validityDays: pkg.validityDays,
    standardPriceAdjustmentLKR: pkg.standardPriceAdjustmentLKR,
    // Shown on the card as "Port 443"; it is in every customer's config anyway.
    inboundPort: pkg.inboundPort,
  };
}
