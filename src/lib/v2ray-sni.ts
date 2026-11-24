import 'server-only';

/**
 * Package id -> SNI masquerade host. Server-only: never import from a client component,
 * the build will fail. Customers only ever receive the SNI inside their own delivered config.
 */
export const CATALOG_SNI: Record<string, string> = {
  'dialog-zoom-router': 'zoom.us',
  'dialog-tiktok-sim': 'm.tiktok.com',
  'dialog-social-media': 'zoom.us',
  'dialog-video-conferencing': 'zoom.us',
  'slt-zoom-meet-fiber': 'teams.microsoft.com',
  'slt-netflix-entertainment': 'api.netflix.com',
  'slt-zoom-prepaid-235': 'teams.microsoft.com',
  'airtel-tiktok-unlimited': 'm.tiktok.com',
  'airtel-youtube-pack': 'm.youtube.com',
  'airtel-zoom-work': 'zoom.us',
  'hutch-zoom-work': 'zoom.us',
  'mobitel-zoom-sim': 'gateway.icloud.com',
};

export function catalogSni(packageId?: string | null): string | undefined {
  return packageId ? CATALOG_SNI[packageId] : undefined;
}
