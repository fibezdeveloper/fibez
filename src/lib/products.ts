export interface ProductItem {
  id: string;
  category: 'vpn' | 'vps' | 'subscription' | 'gaming';
  title: string;
  description: string;
  priceUSD: number;
  priceLKR: number;
  stockCount: number;
  badge?: string;
  isInstant: boolean;
  durations: { label: string; days: number; multiplier: number }[];
  options?: { label: string; values: string[] }[];
  guideMarkdown: string;
  warranty: string;
}

export const PRODUCTS: ProductItem[] = [
  {
    id: 'v2ray-singapore-reality',
    category: 'vpn',
    title: 'V2Ray Singapore Reality 10Gbps',
    description: 'High-speed anti-censorship tunnel node with zero-lag routing for games and video streaming. Optimized for ISP bypass.',
    priceUSD: 3.50,
    priceLKR: 1150,
    stockCount: 84,
    badge: 'TOP SELLER',
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.7 },
      { label: '1 Year', days: 365, multiplier: 8.5 },
    ],
    guideMarkdown: 'Supported clients: v2rayNG (Android), Shadowrocket / Streisand (iOS), v2rayN / Sing-box (Windows & Mac). Scan QR code or copy VLESS URI.',
    warranty: 'Full replacement guarantee against IP blockage or network degradation for active term.',
  },
  {
    id: 'v2ray-tokyo-ultra',
    category: 'vpn',
    title: 'V2Ray Tokyo Low-Latency Reality',
    description: 'Ultra-low jitter Tokyo node routed via BGP Tier 1 transit. Ideal for gaming and latency-sensitive trading platforms.',
    priceUSD: 4.00,
    priceLKR: 1300,
    stockCount: 42,
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.7 },
      { label: '1 Year', days: 365, multiplier: 8.5 },
    ],
    guideMarkdown: 'Import clipboard URL in Sing-box or v2rayN. Ensure Reality security and SNI masquerading are enabled in client.',
    warranty: '24/7 automated node failover and dynamic backup gateway access included.',
  },
  {
    id: 'vps-nvme-4c8g',
    category: 'vps',
    title: 'NVMe Cloud VPS — 4 Core / 8GB RAM',
    description: 'Dedicated AMD EPYC 9004 processor, 120GB PCIe 4.0 NVMe SSD, 10Gbps unmetered bandwidth, dedicated clean IPv4 & IPv6.',
    priceUSD: 12.00,
    priceLKR: 3950,
    stockCount: 16,
    badge: 'ENTERPRISE',
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.8 },
      { label: '1 Year', days: 365, multiplier: 9.0 },
    ],
    guideMarkdown: 'Instant SSH credentials delivered upon payment. Root access enabled by default. Clean OS image of Ubuntu 24.04 LTS.',
    warranty: 'Hardware 99.99% SLA backed by automated hypervisor replication.',
  },
  {
    id: 'vps-nvme-2c4g',
    category: 'vps',
    title: 'NVMe Cloud VPS — 2 Core / 4GB RAM',
    description: 'Cost-efficient cloud instance for bot hosting, microservices, and proxy nodes. 60GB NVMe storage and dedicated IP.',
    priceUSD: 7.00,
    priceLKR: 2300,
    stockCount: 29,
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.8 },
      { label: '1 Year', days: 365, multiplier: 9.0 },
    ],
    guideMarkdown: 'Instant SSH access with custom root password. Full control panel for reinstallation and reboot.',
    warranty: 'Standard 99.95% hypervisor uptime guarantee.',
  },
  {
    id: 'chatgpt-plus-team',
    category: 'subscription',
    title: 'ChatGPT Team / Plus Full Workspace',
    description: 'Access to GPT-4o, OpenAI o1-preview, unlimited canvas, DALL-E, custom GPTs, and advanced data analysis.',
    priceUSD: 6.50,
    priceLKR: 2150,
    stockCount: 65,
    badge: 'POPULAR',
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.8 },
      { label: '6 Months', days: 180, multiplier: 5.2 },
    ],
    guideMarkdown: 'Credentials or direct workspace invitation dispatched immediately. Can be used on web, iOS, and Android applications.',
    warranty: '30-day no-questions-asked replacement warranty if session access expires.',
  },
  {
    id: 'netflix-4k-uhd',
    category: 'subscription',
    title: 'Netflix 4K UHD Private Profile',
    description: 'Private PIN-locked profile on premium family plan. Full 4K HDR Dolby Vision streaming across Smart TV, PC, and Mobile.',
    priceUSD: 4.20,
    priceLKR: 1400,
    stockCount: 38,
    isInstant: true,
    durations: [
      { label: '1 Month', days: 30, multiplier: 1 },
      { label: '3 Months', days: 90, multiplier: 2.8 },
      { label: '6 Months', days: 180, multiplier: 5.4 },
    ],
    guideMarkdown: 'Credentials with your dedicated profile slot and custom PIN sent directly to your screen.',
    warranty: 'Continuous renewal warranty. If account logs out, instant automated credential replacement is provided.',
  },
  {
    id: 'discord-nitro-yearly',
    category: 'subscription',
    title: 'Discord Nitro (1 Year Gift Activation)',
    description: 'Full Nitro subscription with 2 free Server Boosts, 500MB upload limits, custom emojis & stickers anywhere, and HD 60fps streaming.',
    priceUSD: 28.00,
    priceLKR: 9200,
    stockCount: 19,
    badge: 'VALUE',
    isInstant: true,
    durations: [
      { label: '1 Year', days: 365, multiplier: 1 },
    ],
    guideMarkdown: 'Direct official Discord gift link dispatched. Redeem directly into your personal Discord account.',
    warranty: '100% genuine official Discord gift link warranty.',
  },
  {
    id: 'steam-game-key-cyberpunk',
    category: 'gaming',
    title: 'Cyberpunk 2077: Ultimate Edition (Steam)',
    description: 'Official digital activation key for Steam. Includes the Phantom Liberty expansion. Region-free worldwide activation.',
    priceUSD: 32.00,
    priceLKR: 10500,
    stockCount: 12,
    isInstant: true,
    durations: [
      { label: 'Lifetime', days: 9999, multiplier: 1 },
    ],
    guideMarkdown: 'Open Steam client -> Games -> Activate a Product on Steam -> Paste the revealed license key.',
    warranty: 'Genuine publisher key with lifetime activation guarantee.',
  },
  {
    id: 'steam-game-key-wukong',
    category: 'gaming',
    title: 'Black Myth: Wukong (Steam Global Key)',
    description: 'Full retail digital game code for Steam. Action RPG inspired by Journey to the West. Global region unblocked.',
    priceUSD: 36.00,
    priceLKR: 11900,
    stockCount: 9,
    badge: 'HOT',
    isInstant: true,
    durations: [
      { label: 'Lifetime', days: 9999, multiplier: 1 },
    ],
    guideMarkdown: 'Redeem directly on Steam desktop client or store.steampowered.com/account/registerkey.',
    warranty: 'Permanent Steam account binding guarantee.',
  },
];
