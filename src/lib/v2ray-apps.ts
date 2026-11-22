// The V2Ray / VLESS client apps we recommend, by device. Icons live in /public/apps.
export type AppPlatformId = 'windows' | 'mac' | 'android' | 'ios';

export interface ClientApp {
  name: string;
  /** What the app is, in English (product descriptor, not translated). */
  subtitle?: string;
  price?: 'free' | 'paid';
  icon: string;
  url: string;
}

export const APP_PLATFORM_ORDER: AppPlatformId[] = ['windows', 'mac', 'android', 'ios'];

const APP_STORE = {
  shadowrocket: 'https://apps.apple.com/app/shadowrocket/id932747118',
  npvTunnel: 'https://apps.apple.com/app/npv-tunnel/id1629465476',
  incy: 'https://apps.apple.com/app/incy/id6756943388',
  fairVpn: 'https://apps.apple.com/app/fair-vpn/id1533873488',
} as const;

export const CLIENT_APPS: Record<AppPlatformId, ClientApp[]> = {
  windows: [
    { name: 'NetMod', subtitle: 'VPN client (V2Ray / SSH)', icon: '/apps/netmod.png', url: 'https://sourceforge.net/projects/netmod/' },
    { name: 'Netch', subtitle: 'Proxy client', icon: '/apps/netch.png', url: 'https://github.com/netchx/netch/releases' },
  ],
  mac: [
    { name: 'Fair VPN', price: 'free', icon: '/apps/fair-vpn.jpg', url: APP_STORE.fairVpn },
    { name: 'Shadowrocket', price: 'paid', icon: '/apps/shadowrocket.jpg', url: APP_STORE.shadowrocket },
  ],
  android: [
    { name: 'NetMod', subtitle: 'VPN client (V2Ray / SSH)', icon: '/apps/netmod.png', url: 'https://play.google.com/store/apps/details?id=com.netmod.syna' },
    { name: 'v2rayNG', subtitle: 'Proxy client (GitHub)', icon: '/apps/v2rayng.png', url: 'https://github.com/2dust/v2rayNG/releases' },
  ],
  ios: [
    { name: 'Npv Tunnel', price: 'free', icon: '/apps/npv-tunnel.jpg', url: APP_STORE.npvTunnel },
    { name: 'INCY', price: 'free', icon: '/apps/incy.jpg', url: APP_STORE.incy },
    { name: 'Shadowrocket', price: 'paid', icon: '/apps/shadowrocket.jpg', url: APP_STORE.shadowrocket },
  ],
};
