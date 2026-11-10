export type GuideLang = 'en' | 'si' | 'ta';

export type ClientTabId = 'netmod-pc' | 'netmod-android' | 'v2rayng' | 'ios-macos';

export type FaqCategory = 'all' | 'data' | 'speed' | 'devices' | 'orders';

export interface GuideFaqItem {
  id: string;
  category: Exclude<FaqCategory, 'all'>;
  q: string;
  a: string;
}

export interface VisualPackageCard {
  id: string;
  isp: 'SLT' | 'Dialog' | 'Airtel';
  ispLabel: string;
  title: string;
  quotaBadge: string;
  quotaType: 'limited' | 'unlimited';
  activationHint: string;
  sniHost: string;
  image: string;
  productId: string;
}

export interface IspDirectoryEntry {
  id: string;
  name: string;
  networkTag: string;
  productId: string;
  activationCode: string;
  sniHost: string;
  packages: string[];
  note?: string;
}

export interface ClientGuideSpec {
  id: ClientTabId;
  shortLabel: string;
  title: string;
  platform: string;
  badge: string;
  summary: string;
  downloads: { label: string; url: string }[];
  steps: { title: string; body: string }[];
  proTip: string;
}

export const VISUAL_PACKAGES: VisualPackageCard[] = [
  {
    id: 'slt-meet-lite',
    isp: 'SLT',
    ispLabel: 'SLT (WiFi / Fiber)',
    title: '195 Meet Lite (30 GB)',
    quotaBadge: '30 GB Limit',
    quotaType: 'limited',
    activationHint: 'Activate via MySLT App or SLT Portal',
    sniHost: 'zoom.us',
    image: '/images/v2ray-packages/meet_lite.webp',
    productId: 'v2ray-slt-netflix',
  },
  {
    id: 'slt-meet-max',
    isp: 'SLT',
    ispLabel: 'SLT (WiFi / Fiber)',
    title: '490 Meet Max (100 GB)',
    quotaBadge: '100 GB Limit',
    quotaType: 'limited',
    activationHint: 'Activate via MySLT App or SLT Portal',
    sniHost: 'zoom.us',
    image: '/images/v2ray-packages/meet_max.webp',
    productId: 'v2ray-slt-netflix',
  },
  {
    id: 'slt-1990-ent',
    isp: 'SLT',
    ispLabel: 'SLT (WiFi / Fiber)',
    title: 'SLT 1990 Unlimited Entertainment',
    quotaBadge: 'Unlimited',
    quotaType: 'unlimited',
    activationHint: 'Unlimited Netflix / YouTube Entertainment Combo',
    sniHost: 'netflix.com',
    image: '/images/v2ray-packages/slt_1990_ent.webp',
    productId: 'v2ray-slt-netflix',
  },
  {
    id: 'slt-flash-5-10',
    isp: 'SLT',
    ispLabel: 'SLT (4G LTE / Router)',
    title: 'Flash 5 / 10 - Zoom Unlimited',
    quotaBadge: 'Daily 5/10 GB',
    quotaType: 'unlimited',
    activationHint: 'LTE Flash 5 (Rs.2,350) or Flash 10 (Rs.4,090)',
    sniHost: 'zoom.us',
    image: '/images/v2ray-packages/flash510.webp',
    productId: 'v2ray-slt-netflix',
  },
  {
    id: 'airtel-tiktok',
    isp: 'Airtel',
    ispLabel: 'Airtel Sri Lanka',
    title: '297 / 997 TikTok Unlimited',
    quotaBadge: 'Unlimited',
    quotaType: 'unlimited',
    activationHint: 'Reload Rs. 297 (7 Days) or Rs. 997 (30 Days)',
    sniHost: 'tiktokv.com',
    image: '/images/v2ray-packages/airtel_tiktok.webp',
    productId: 'v2ray-airtel-tiktok',
  },
  {
    id: 'dialog-tiktok',
    isp: 'Dialog',
    ispLabel: 'Dialog SIM',
    title: '297 / 997 TikTok Unlimited',
    quotaBadge: 'Unlimited',
    quotaType: 'unlimited',
    activationHint: 'Activate via MyDialog App (One-time / Recurring)',
    sniHost: 'tiktokv.com',
    image: '/images/v2ray-packages/dialog_tiktok.webp',
    productId: 'v2ray-dialog-zoom',
  },
  {
    id: 'dialog-348',
    isp: 'Dialog',
    ispLabel: 'Dialog SIM',
    title: 'Fun Blaster 348 (20 GB Social)',
    quotaBadge: '20 GB Limit',
    quotaType: 'limited',
    activationHint: 'MyDialog App → Fun Blaster Rs. 348 (30 Days)',
    sniHost: 'm.facebook.com',
    image: '/images/v2ray-packages/dialog_348.webp',
    productId: 'v2ray-dialog-zoom',
  },
  {
    id: 'dialog-488',
    isp: 'Dialog',
    ispLabel: 'Dialog SIM',
    title: 'Fun Blaster 488 (Social Media)',
    quotaBadge: '20 GB + 2 GB',
    quotaType: 'limited',
    activationHint: 'MyDialog App → Fun Blaster Rs. 488 (30 Days)',
    sniHost: 'm.facebook.com',
    image: '/images/v2ray-packages/dialog_488.webp',
    productId: 'v2ray-dialog-zoom',
  },
];

export const SUPPORTED_ISPS: IspDirectoryEntry[] = [
  {
    id: 'airtel',
    name: 'Airtel',
    networkTag: '4G / 5G Mobile',
    productId: 'v2ray-airtel-tiktok',
    activationCode: 'Reload Rs. 297 / Rs. 997',
    sniHost: 'tiktokv.com',
    packages: [
      'AIRTEL 135 / 260 YOUTUBE',
      'AIRTEL ZOOM 215',
      'AIRTEL TIKTOK 297 / 997 (UNLIMITED)',
    ],
  },
  {
    id: 'dialog',
    name: 'Dialog',
    networkTag: 'Mobile SIM & HBB Router',
    productId: 'v2ray-dialog-zoom',
    activationCode: 'Dial *678# or MyDialog App',
    sniHost: 'zoom.us',
    packages: [
      'DIALOG SIM VIDEO CONFERENCING 224 / 724',
      'DIALOG SOCIAL MEDIA 348 / 488',
      'DIALOG TIKTOK 297 / 997 (MOBILE SIM)',
      'DIALOG ZOOM 298 / 724 (ROUTER)',
    ],
  },
  {
    id: 'hutch',
    name: 'Hutch',
    networkTag: 'Prepaid / 4G',
    productId: 'v2ray-hutch-zoom',
    activationCode: 'Hutch Self Care App',
    sniHost: 'zoom.us',
    packages: [
      'HUTCH ZOOM 224 (30 GB) / 494 / 794',
      'HUTCH WORK & LEARN PACKS',
    ],
  },
  {
    id: 'mobitel',
    name: 'Mobitel',
    networkTag: 'Prepaid / 4G',
    productId: 'v2ray-mobitel-zoom',
    activationCode: 'Dial #170# → Content Plans → Zoom',
    sniHost: 'zoom.us',
    packages: ['MOBITEL ZOOM 1 / WORK & LEARN'],
    note: 'Android / Tun Setup · Toggle airplane mode (IP Hunt) if a local gateway IP stalls.',
  },
  {
    id: 'slt',
    name: 'SLT-Mobitel',
    networkTag: 'Fiber / 4G LTE / ADSL',
    productId: 'v2ray-slt-netflix',
    activationCode: 'MySLT App or Broadband Portal',
    sniHost: 'netflix.com / zoom.us',
    packages: [
      'SLT ZOOM / MEET LITE (195) & MEET MAX (490)',
      'SLT NETFLIX / 1990 UNLIMITED ENTERTAINMENT',
      'SLT FLASH 5 / FLASH 10 ZOOM UNLIMITED',
      'SLT ZOOM PREPAID 235',
    ],
  },
];

export interface WizardUseCase {
  id: string;
  label: string;
  hint: string;
  recommendedPack: string;
  quotaNote: string;
  productId: string;
  sniHost: string;
}

export const WIZARD_ISP_STEPS: Record<
  string,
  { label: string; tag: string; useCases: WizardUseCase[] }
> = {
  dialog: {
    label: 'Dialog',
    tag: 'SIM / HBB Router',
    useCases: [
      {
        id: 'dialog-zoom',
        label: 'Work & Learn / Zoom (224 / 724 / Router 298)',
        hint: 'Stable speeds on Dialog 4G SIM & Home Broadband Router',
        recommendedPack: 'Dialog Work & Learn / Zoom (*678#)',
        quotaNote: 'Tracks your active Dialog Zoom / Work & Learn bundle quota.',
        productId: 'v2ray-dialog-zoom',
        sniHost: 'zoom.us',
      },
      {
        id: 'dialog-tiktok',
        label: 'TikTok Unlimited (Rs. 297 / Rs. 997 SIM)',
        hint: 'Continuous monthly browsing without reloading social packs',
        recommendedPack: 'Dialog TikTok 297 (7d) or 997 (30d)',
        quotaNote: 'Unlimited TikTok pack lets your VLESS config run smoothly without mid-month data stops.',
        productId: 'v2ray-dialog-zoom',
        sniHost: 'tiktokv.com',
      },
      {
        id: 'dialog-social',
        label: 'Fun Blaster Social (Rs. 348 / Rs. 488)',
        hint: '20 GB social pack converted into full open internet',
        recommendedPack: 'Dialog Fun Blaster 348 or 488',
        quotaNote: '20 GB usable per reload; reactivate Rs. 348 / 488 when the 20 GB fills.',
        productId: 'v2ray-dialog-zoom',
        sniHost: 'm.facebook.com',
      },
    ],
  },
  slt: {
    label: 'SLT',
    tag: 'Fiber / 4G / ADSL',
    useCases: [
      {
        id: 'slt-meet',
        label: 'Meet Lite (195) / Meet Max (490) / Flash 5-10',
        hint: 'Low-cost 30 GB – 100 GB work/zoom add-ons on SLT WiFi',
        recommendedPack: 'SLT Meet Lite Rs. 195 or Meet Max Rs. 490',
        quotaNote: '30 GB or 100 GB per activation; reactivate add-on cleanly from MySLT.',
        productId: 'v2ray-slt-netflix',
        sniHost: 'zoom.us',
      },
      {
        id: 'slt-ent',
        label: 'SLT 1990 Unlimited Entertainment / Netflix',
        hint: 'Full-speed Fiber streaming & unlimited monthly downloads',
        recommendedPack: 'SLT 1990 Unlimited Entertainment / Netflix Pack',
        quotaNote: 'Runs straight through on your SLT Fiber / ADSL line with SNI bypass.',
        productId: 'v2ray-slt-netflix',
        sniHost: 'netflix.com',
      },
    ],
  },
  airtel: {
    label: 'Airtel',
    tag: '4G / 5G Mobile',
    useCases: [
      {
        id: 'airtel-tiktok',
        label: 'Airtel TikTok Unlimited (Rs. 297 / Rs. 997)',
        hint: 'Most popular budget unlimited option in Sri Lanka',
        recommendedPack: 'Airtel Rs. 297 (7d) or Rs. 997 (30d) TikTok Reload',
        quotaNote: 'Unlimited base package — zero mid-month reloads required.',
        productId: 'v2ray-airtel-tiktok',
        sniHost: 'tiktokv.com',
      },
      {
        id: 'airtel-yt-zoom',
        label: 'Airtel Zoom 215 or YouTube 135 / 260',
        hint: 'Short-term work or YouTube add-on packs',
        recommendedPack: 'Airtel Zoom Rs. 215 or YouTube 135/260',
        quotaNote: 'Usage follows the active Zoom/YouTube pack limit.',
        productId: 'v2ray-airtel-tiktok',
        sniHost: 'zoom.us',
      },
    ],
  },
  hutch: {
    label: 'Hutch',
    tag: '4G Mobile',
    useCases: [
      {
        id: 'hutch-zoom',
        label: 'Hutch Zoom / Work Pack (224 / 494 / 794)',
        hint: '30 GB+ chunks via Hutch Self Care App',
        recommendedPack: 'Hutch Rs. 224 (30 GB Zoom) or Rs. 494 / 794',
        quotaNote: '30 GB per activation on Rs. 224; reactivate the add-on when it ends.',
        productId: 'v2ray-hutch-zoom',
        sniHost: 'zoom.us',
      },
    ],
  },
  mobitel: {
    label: 'Mobitel',
    tag: '4G Mobile',
    useCases: [
      {
        id: 'mobitel-zoom',
        label: 'Mobitel Zoom1 / Content Plan (#170#)',
        hint: 'Android NetMod Syna + quick IP Hunt if needed',
        recommendedPack: 'Mobitel Zoom1 (#170# → Content Based Plans)',
        quotaNote: 'Recommended with NetMod Syna on Android; toggle flight mode once if handshake stalls.',
        productId: 'v2ray-mobitel-zoom',
        sniHost: 'zoom.us',
      },
    ],
  },
  all: {
    label: 'Direct / General',
    tag: 'Multi-ISP / Travel',
    useCases: [
      {
        id: 'direct-global',
        label: 'All-Round High-Speed VLESS Tunnel',
        hint: 'Low-latency Singapore direct VLESS node for any connection',
        recommendedPack: 'Works on standard broadband or multi-SIM setups',
        quotaNote: 'Includes NetMod Syna, Hysteria-compatible routing guidance, and v2rayNG support.',
        productId: 'v2ray-singapore-direct',
        sniHost: 'gateway.fibez.store',
      },
    ],
  },
};

export interface GuideCopyBundle {
  heroBadge: string;
  heroTitle: string;
  heroDesc: string;
  heroCtaFind: string;
  heroCtaPackages: string;
  heroCtaApps: string;
  heroCtaLineCheck: string;
  howEyebrow: string;
  howTitle: string;
  ruleLabel: string;
  ruleBody: string;
  steps: { num: string; title: string; body: string }[];
  pipelineLabel: string;
  pipelineSteps: [string, string, string, string];
  examplesEyebrow: string;
  examplesTitle: string;
  examples: { tag: string; isUnlimited?: boolean; title: string; body: string }[];
  speedDisclaimer: string;
  exitEyebrow: string;
  exitTitle: string;
  exitSubtitle: string;
  exitCards: {
    badge: string;
    title: string;
    body: string;
    note: string;
    availableOnFibez: boolean;
  }[];
  packagesEyebrow: string;
  packagesTitle: string;
  packagesSubtitle: string;
  allPackagesTitle: string;
  browseAllBtn: string;
  clientsEyebrow: string;
  clientsTitle: string;
  clientsSubtitle: string;
  clients: ClientGuideSpec[];
  wizardEyebrow: string;
  wizardTitle: string;
  wizardStepLabels: [string, string, string];
  wizardStep1Q: string;
  wizardStep2Q: string;
  wizardStep2Sub: string;
  wizardStep3Title: string;
  wizardBuyBtn: string;
  wizardTrialBtn: string;
  wizardStartOver: string;
  wizardBack: string;
  faqEyebrow: string;
  faqTitle: string;
  faqSubtitle: string;
  goodToKnowTitle: string;
  goodToKnowPoints: string[];
  faqs: GuideFaqItem[];
  troubleshootTitle: string;
  troubleshootBody: string;
  troubleshootLineCheck: string;
  troubleshootTicket: string;
}

export const GUIDE_COPY: Record<GuideLang, GuideCopyBundle> = {
  en: {
    heroBadge: 'SRI LANKA VLESS / V2RAY GUIDE',
    heroTitle: 'VLESS / V2Ray is not a data reload.',
    heroDesc:
      'It takes the restricted data from a package you already have — a Zoom, YouTube, TikTok, Netflix, or social pack — and converts it into normal, unrestricted internet using NetMod Syna or v2rayNG.',
    heroCtaFind: 'Find my plan (3 taps)',
    heroCtaPackages: 'Supported packages & pics',
    heroCtaApps: 'NetMod & app setup',
    heroCtaLineCheck: 'Run Line Check',
    howEyebrow: 'How the data works',
    howTitle: 'Three steps & one rule to remember',
    ruleLabel: 'One rule to remember',
    ruleBody:
      'Your ISP package and your VLESS connection drain data at the exact same rate. If your active add-on has a GB cap (like 20 GB Social or 30 GB Zoom), you can use up to that limit at one time — when it finishes, simply reload the same pack to keep going.',
    steps: [
      {
        num: '01',
        title: 'Activate the ISP package',
        body: 'Turn on one of the exact listed Zoom, TikTok, Netflix, or Social packages on your SIM, router, or SLT broadband first.',
      },
      {
        num: '02',
        title: 'NetMod / VLESS converts it',
        body: 'Import your Fibez config from email or Key Vault into NetMod Syna or v2rayNG. It routes your traffic cleanly using the pack SNI.',
      },
      {
        num: '03',
        title: 'Use it for anything',
        body: 'Browse, download large files, stream, and game on normal internet until your base package (or plan validity) expires.',
      },
    ],
    pipelineLabel: 'Connection Pipeline',
    pipelineSteps: [
      'Your Device (NetMod / v2rayNG)',
      'ISP Sees Allowed SNI (e.g. zoom.us)',
      'Fibez VLESS Node (Singapore)',
      'Unrestricted Open Web',
    ],
    examplesEyebrow: 'How quota behaves',
    examplesTitle: 'Three quick examples',
    examples: [
      {
        tag: 'Limited · 30 GB',
        title: 'Hutch Rs. 224 (30 GB Zoom) + Monthly VLESS',
        body: 'You have an active monthly Fibez plan, but your Hutch Rs. 224 Zoom add-on holds 30 GB at a time. When that 30 GB completes, activate Rs. 224 again to continue right away without waiting for month end.',
      },
      {
        tag: 'Limited · 20 GB',
        title: 'Dialog Rs. 348 (20 GB Social) + Monthly VLESS',
        body: 'Same rule: once the 20 GB Fun Blaster bucket finishes, internet stops so your main anytime balance stays untouched. Reload Rs. 348 (or Rs. 488) to unlock the next 20 GB chunk.',
      },
      {
        tag: 'Unlimited',
        isUnlimited: true,
        title: 'Airtel Rs. 997 TikTok Unlimited + Monthly VLESS',
        body: 'Because the Airtel Rs. 997 TikTok base package has no hard GB cut-off, your connection runs uninterrupted from start to finish with zero mid-month add-on reloads.',
      },
    ],
    speedDisclaimer:
      'V2Ray / VLESS does not artificially boost speed above your SIM or tower capacity. It runs at your line’s normal anytime speed — if a base pack is throttled to 2 Mbps by the ISP, the tunnel will also top out at 2 Mbps.',
    exitEyebrow: 'Choose your exit',
    exitTitle: 'Singapore (SG) Exit vs. Sri Lankan (LK) IP',
    exitSubtitle:
      'Every Fibez VLESS config routes cleanly out of our Singapore node by default. Here is how IP location affects streaming, banking apps, and content reach.',
    exitCards: [
      {
        badge: 'INCLUDED BY DEFAULT',
        title: 'Singapore (SG) — Standard VLESS Exit',
        body: 'Lowest hop latency from Sri Lanka (~35–45 ms), unblocked access to global streaming, AI tools, gaming updates, and downloads. Social platforms see a Singapore exit region.',
        note: 'Included with all Fibez Dialog, SLT, Airtel, Mobitel, Hutch & Direct packages.',
        availableOnFibez: true,
      },
      {
        badge: 'USE-CASE GUIDE',
        title: 'When You Might Want a Local (LK) IP',
        body: 'Live streamers targeting a local Sri Lankan algorithm audience or apps that strictly geo-fence foreign IPs (such as certain local banking portals) prefer an LK IP — or you can simply pause VPN briefly for banking transfers.',
        note: 'Need special routing or advice for streaming? Ask our team via Support Ticket before buying.',
        availableOnFibez: false,
      },
    ],
    packagesEyebrow: 'Every package',
    packagesTitle: 'Packages we support (Visual Reference)',
    packagesSubtitle:
      'Activate the exact operator add-on below on your SIM, router, or SLT account, then pair it with your Fibez VLESS plan. Click any screenshot to inspect full screen.',
    allPackagesTitle: 'All supported packages & quick activation codes',
    browseAllBtn: 'Browse all VLESS plans',
    clientsEyebrow: 'No bloated proprietary app',
    clientsTitle: 'Setup options by device',
    clientsSubtitle:
      'We deliberately rely on trusted open-source clients like NetMod Syna and v2rayNG (plus Streisand / Hysteria-compatible clients on iOS/macOS) so you never deal with battery-draining custom apps.',
    clients: [
      {
        id: 'netmod-pc',
        shortLabel: 'NetMod (Windows PC)',
        title: 'NetMod Syna for Windows 10 & 11',
        platform: 'Windows 64-bit',
        badge: 'RECOMMENDED PC',
        summary: 'Best choice for PC and laptop users needing full system-wide Tun Mode for browsers, downloads, Discord, and games.',
        downloads: [
          { label: 'Download NetMod Syna (SourceForge)', url: 'https://sourceforge.net/projects/netmod/' },
        ],
        steps: [
          {
            title: 'Install NetMod & Wintun driver',
            body: 'Download NetMod Syna (64-bit) and accept the Wintun / TAP adapter install prompt so Windows can tunnel system traffic.',
          },
          {
            title: 'Copy VLESS link from Email / Vault',
            body: 'Open your instant Fibez confirmation email or Key Vault page and copy the vless:// configuration string.',
          },
          {
            title: 'Import from Clipboard',
            body: 'In NetMod, click Profile (top bar) → "Import from Clipboard" (or press Ctrl + V on the home screen).',
          },
          {
            title: 'Enable Tun Mode & click Start',
            body: 'Check "Tun Mode" on the main window so every Windows app tunnels cleanly, then click Start.',
          },
        ],
        proTip: 'On Windows, make sure your main Ethernet/Wi-Fi has an active ISP add-on pack before enabling Start.',
      },
      {
        id: 'netmod-android',
        shortLabel: 'NetMod (Android)',
        title: 'NetMod Syna for Android Phones & Hotspots',
        platform: 'Android 7.0+',
        badge: 'RECOMMENDED ANDROID',
        summary: 'Ideal if you want one-tap clipboard import, rock-solid background stability, or Mobitel / Dialog SIM tunneling.',
        downloads: [
          { label: 'Google Play Store — NetMod Syna', url: 'https://play.google.com/store/apps/details?id=com.netmod.syna' },
        ],
        steps: [
          {
            title: 'Install NetMod Syna',
            body: 'Install NetMod Syna directly from the Google Play Store.',
          },
          {
            title: 'Copy config from Email',
            body: 'Copy the complete vless://... URI from your Fibez order confirmation email or Key Vault.',
          },
          {
            title: 'Tap + / Menu → Import from Clipboard',
            body: 'Open NetMod, tap the top-right menu (or + button), select Import Config → From Clipboard.',
          },
          {
            title: 'Tap START & accept VPN permission',
            body: 'Select your imported profile, tap START, and tap OK on Android’s system VPN request.',
          },
        ],
        proTip: 'Want to share VPN via Mobile Hotspot to another phone or laptop? Both devices must either run NetMod with the same config or use root/proxy sharing.',
      },
      {
        id: 'v2rayng',
        shortLabel: 'v2rayNG (Android)',
        title: 'v2rayNG (QR Scan & Ping Test)',
        platform: 'Android',
        badge: 'LIGHTWEIGHT',
        summary: 'Clean open-source V2Ray / VLESS client with instant camera QR import and built-in real-delay latency checking.',
        downloads: [
          { label: 'v2rayNG GitHub Releases (APK)', url: 'https://github.com/2dust/v2rayNG/releases' },
          { label: 'Google Play Store — v2rayNG', url: 'https://play.google.com/store/apps/details?id=com.v2ray.ang' },
        ],
        steps: [
          {
            title: 'Install v2rayNG',
            body: 'Download from Google Play Store or the official 2dust/v2rayNG GitHub releases.',
          },
          {
            title: 'Scan QR or Paste URI',
            body: 'Tap the + icon at the top right → choose "Import config from QRcode" (scan from PC/Vault) or "Import config from Clipboard".',
          },
          {
            title: 'Test Latency & Connect',
            body: 'Select the profile card, tap the circular V button at the bottom right to connect, and tap the status bar to verify real delay (ms).',
          },
        ],
        proTip: 'If a Mobitel Zoom pack stays stuck at -1ms ping, toggle Airplane Mode ON/OFF once to obtain a fresh local IP before reconnecting.',
      },
      {
        id: 'ios-macos',
        shortLabel: 'iPhone & Mac',
        title: 'Streisand / Sing-box (iOS & macOS)',
        platform: 'iPhone · iPad · Mac',
        badge: 'APPLE DEVICES',
        summary: 'Official App Store VLESS & Hysteria-compatible clients for iPhone, iPad, and Apple Silicon Macs.',
        downloads: [
          { label: 'Streisand on App Store', url: 'https://apps.apple.com/app/streisand/id6450534064' },
          { label: 'sing-box on App Store', url: 'https://apps.apple.com/app/sing-box-vt/id6673731168' },
        ],
        steps: [
          {
            title: 'Install Streisand or sing-box',
            body: 'Search Streisand (free) on the iOS or macOS App Store and install it.',
          },
          {
            title: 'Import VLESS Config',
            body: 'Tap + inside Streisand → "Import from Clipboard" or "Scan QR" using your Fibez email or Key Vault config.',
          },
          {
            title: 'Connect & Test',
            body: 'Allow iOS VPN configuration when prompted, toggle the switch ON, and verify speed with our Line Check tool.',
          },
        ],
        proTip: 'Smart TVs (WebOS / Tizen) cannot install VPN configs natively — connect via a Windows PC hotspot or router gateway, or cast from your device.',
      },
    ],
    wizardEyebrow: 'Not sure?',
    wizardTitle: 'Find your plan in three taps',
    wizardStepLabels: ['Connection', 'ISP Add-on', 'Best Match'],
    wizardStep1Q: 'Which connection do you have?',
    wizardStep2Q: 'Which ISP pack or usage fits you best?',
    wizardStep2Sub: 'Pick the add-on bundle you plan to activate on your SIM or router.',
    wizardStep3Title: 'Your best match on Fibez',
    wizardBuyBtn: 'Configure & Buy Plan',
    wizardTrialBtn: 'Try 24h Free Trial First',
    wizardStartOver: 'Start over',
    wizardBack: 'Back',
    faqEyebrow: 'Questions',
    faqTitle: 'Frequently asked questions',
    faqSubtitle: 'Honest answers covering data rules, speed caps, ISP packs, NetMod/v2rayNG setup, and delivery.',
    goodToKnowTitle: 'Good to know',
    goodToKnowPoints: [
      'Always keep your chosen ISP add-on pack (e.g. Dialog Zoom, SLT Netflix, Airtel TikTok 297/997) active — VLESS converts restricted data rather than creating free SIM balance.',
      'Check our visual cards carefully: some ISP packs are GB-limited (20 GB / 30 GB / 100 GB per activation) while others like Airtel Rs. 997 TikTok are unlimited.',
      'Checkout is 100% automated on the website — your VLESS link & QR code arrive via email in seconds and stay saved inside your Key Vault.',
    ],
    faqs: [
      {
        id: 'not-reload',
        category: 'data',
        q: 'Does V2Ray / VLESS give me free data or add SIM reload GB?',
        a: 'No. We do not sell mobile data reloads — VLESS is a VPN tunneling service. It converts the restricted data from an active add-on package you already have on your SIM or broadband (Zoom, TikTok, Netflix, Social) into normal internet usable for any app.',
      },
      {
        id: 'how-works',
        category: 'data',
        q: 'How does VLESS work with Sri Lankan packages?',
        a: 'For example, if you activate Airtel Rs. 997 TikTok Unlimited, normally your SIM only lets you open TikTok. When you connect NetMod or v2rayNG with a matching Fibez config, traffic carries the expected TikTok SNI handshake so your ISP bills it under the unlimited TikTok bucket while opening the whole internet.',
      },
      {
        id: 'what-apps',
        category: 'data',
        q: 'Can I use anything with the VPN once connected?',
        a: 'Yes — normal browsing, downloads, YouTube, Netflix, cloud work, Zoom, and gaming. Anything you would normally do on unrestricted internet.',
      },
      {
        id: 'why-v2ray',
        category: 'data',
        q: 'What is the main benefit compared to regular data reloads?',
        a: 'Instead of paying high per-GB rates for standard anytime reloads, pairing a low-cost unlimited or high-cap ISP package (like Rs. 490 100GB Meet Max or Rs. 997 Unlimited TikTok) with a Fibez VLESS config gives you far more usable data for a fraction of the price.',
      },
      {
        id: 'gb-limit-vs-unlim',
        category: 'data',
        q: 'If I activate a 30 GB Zoom pack, can I use 100 GB without reloading?',
        a: 'No. Your base SIM/router add-on and your VLESS tunnel consume data 1:1. With a 30 GB pack (like Hutch Rs. 224) or 20 GB pack (like Dialog Rs. 348 Fun Blaster), once that 20 GB or 30 GB runs out, internet stops until you reactivate the same pack. With an unlimited pack like Airtel Rs. 997 TikTok Unlimited, you can surf non-stop without reloading.',
      },
      {
        id: 'why-stopped',
        category: 'data',
        q: 'Why did my internet stop before my Fibez 1-month plan expired?',
        a: 'Almost every time, your underlying ISP package ran out (for instance finishing 20 GB on Fun Blaster 348 or 30 GB on Meet Lite). Once you reload that exact base package, your Fibez VLESS config reconnects immediately.',
      },
      {
        id: 'unlisted-packs',
        category: 'data',
        q: 'Can I use unlisted packages like 797, 909, 1180, or 498?',
        a: 'Only use the exact packages verified in our list. Many unlisted or legacy social bundles either throttle to 1 Mbps or use separate ISP routing rules that drop VPN connections.',
      },
      {
        id: 'speed-boost',
        category: 'speed',
        q: 'Does V2Ray increase my internet speed?',
        a: 'No. VLESS cannot lift hardware or cell-tower bandwidth limits — it runs up to your normal anytime line speed. If an ISP pack is speed-capped at 2 Mbps, the VPN also runs at 2 Mbps.',
      },
      {
        id: 'slower-anytime',
        category: 'speed',
        q: 'Why does speed fluctuate or sometimes feel slower than anytime data?',
        a: 'Telecom towers prioritize traffic differently during peak evening hours (7 PM – 11 PM), and signal strength (RSRP / 4G band congestion) varies. That is line priority on the ISP side; run our Line Check diagnostic tool on /v2ray to measure latency cleanly.',
      },
      {
        id: 'ip-diff',
        category: 'speed',
        q: 'What is the difference between Singapore (SG) IP and Sri Lankan (LK) IP?',
        a: 'Standard SG nodes route via Singapore for top speed and stability, though social feeds may lean regional and rare local banking portals block foreign IPs. Live creators seeking local Sri Lankan audience recommendations or strict LK-only portals specifically use LK IPs — pause VPN briefly for banking apps if ever needed.',
      },
      {
        id: 'no-dedicated-app',
        category: 'devices',
        q: 'Do you have your own Fibez VPN app? Why NetMod and v2rayNG?',
        a: 'We intentionally do not push a closed custom app. Open standards — NetMod Syna (Windows & Android), v2rayNG (Android), and Streisand / Hysteria-capable clients (iOS & macOS) — are lighter on battery, transparent, support proper Tun Mode, and stay resilient against ISP signatures.',
      },
      {
        id: 'which-devices',
        category: 'devices',
        q: 'Which devices can run Fibez VLESS configs?',
        a: 'Windows 10/11 PCs, Android phones & tablets, iPhones, iPads, and macOS laptops all have dedicated apps. Standard Smart TVs cannot run VLESS directly inside their OS.',
      },
      {
        id: 'hotspot',
        category: 'devices',
        q: 'Can I use it over Mobile Hotspot to my laptop or TV?',
        a: 'Yes — connect your second phone or laptop to the hotspot and either run NetMod/v2rayNG on that second device using your config, or enable HTTP proxy sharing in NetMod/v2rayNG settings.',
      },
      {
        id: 'delivery-time',
        category: 'orders',
        q: 'How fast do I get my config after ordering, and how does Free Trial work?',
        a: 'Delivery is 100% automated on the website. Your VLESS URI and QR code arrive at your checkout email in seconds and appear in your Key Vault. Want to test your SIM first? Click "Try 24-Hour Free Trial" on /v2ray to verify compatibility before purchasing.',
      },
      {
        id: 'line-check-usage',
        category: 'orders',
        q: 'How do I check my line speed or get help if my config won’t connect?',
        a: 'Run our 4-hop Line Check diagnostic on /v2ray#line-check to verify whether your SNI host is reaching the gateway or if the issue is local ISP packet loss. If you still need help, open a ticket in /tickets with your ISP and pack name.',
      },
    ],
    troubleshootTitle: 'Still unsure or seeing connection drops?',
    troubleshootBody:
      'Run our 4-hop Line Check diagnostic to see if your SIM SNI reaches the node cleanly, or message our team with your active pack details.',
    troubleshootLineCheck: 'Launch Line Check Diagnostic',
    troubleshootTicket: 'Open Support Ticket',
  },
  si: {
    heroBadge: 'ශ්‍රී ලංකා VLESS / V2RAY මාර්ගෝපදේශය',
    heroTitle: 'V2Ray කියන්නේ ඩේටා රීලෝඩ් එකක් නෙවෙයි.',
    heroDesc:
      'ඔබ දැනටමත් සක්‍රිය කර ඇති පැකේජයක — Zoom, YouTube, TikTok, Netflix හෝ Social පැකේජයක — සීමිත ඩේටා අරගෙන, NetMod Syna හෝ v2rayNG හරහා ඕනෑම දෙයකට පාවිච්චි කළ හැකි සාමාන්‍ය අන්තර්ජාලයක් බවට පත් කරයි.',
    heroCtaFind: 'මගේ ප්ලෑන් එක සොයන්න (ටැප් 3න්)',
    heroCtaPackages: 'සහාය දක්වන පැකේජ & පින්තූර',
    heroCtaApps: 'NetMod & ඇප් සැකසුම',
    heroCtaLineCheck: 'Line Check පරීක්ෂා කරන්න',
    howEyebrow: 'ඩේටා වැඩ කරන හැටි',
    howTitle: 'පියවර 3 සහ මතක තබාගත යුතු එක් නීතියක්',
    ruleLabel: 'මතක තබාගත යුතු එක් නීතියක්',
    ruleBody:
      'ඔබගේ ISP පැකේජය සහ VLESS සම්බන්ධතාවය එකම වේගයෙන් (1:1) ඩේටා භාවිතා කරයි. 20 GB හෝ 30 GB වැනි සීමිත පැකේජයක් නම්, එකවර පාවිච්චි කළ හැක්කේ එම ප්‍රමාණය පමණි — එය ඉවර වූ විට දිගටම යාමට එම පැකේජයම නැවත රීලෝඩ් කරන්න.',
    steps: [
      {
        num: '01',
        title: 'ISP පැකේජය සක්‍රිය කරන්න',
        body: 'අප ලැයිස්තුගත කර ඇති නිශ්චිත Zoom, TikTok, Netflix හෝ Social පැකේජ වලින් එකක් ඔබගේ SIM, රවුටරය හෝ SLT බ්‍රෝඩ්බෑන්ඩ් එකේ සක්‍රිය කරන්න.',
      },
      {
        num: '02',
        title: 'NetMod / VLESS පරිවර්තනය කරයි',
        body: 'ඊමේල් හෝ Key Vault වෙතින් ලැබෙන Fibez config එක NetMod Syna හෝ v2rayNG තුළට import කරන්න. එය අදාළ SNI හරහා ආරක්ෂිතව සම්බන්ධ වේ.',
      },
      {
        num: '03',
        title: 'ඕනෑම දෙයකට පාවිච්චි කරන්න',
        body: 'ඔබගේ පැකේජය හෝ VLESS වලංගු කාලය අවසන් වන තුරු බ්‍රවුස්, ඩවුන්ලෝඩ්, ස්ට්‍රීම් සහ ගේමිං සඳහා භාවිතා කරන්න.',
      },
    ],
    pipelineLabel: 'සම්බන්ධතා ක්‍රියාවලිය',
    pipelineSteps: [
      'ඔබගේ උපාංගය (NetMod / v2rayNG)',
      'ISP අනුමත SNI හඳුනාගනී (උදා: zoom.us)',
      'Fibez VLESS සර්වරය (Singapore)',
      'සීමා රහිත සම්පූර්ණ අන්තර්ජාලය',
    ],
    examplesEyebrow: 'ඩේටා ගණනය වන ආකාරය',
    examplesTitle: 'උදාහරණ තුනක්',
    examples: [
      {
        tag: 'සීමිත · 30 GB',
        title: 'Hutch Rs. 224 (30 GB Zoom) + මාසික VLESS',
        body: 'ඔබ සතුව මාසික Fibez ප්ලෑන් එකක් තිබුණත්, Hutch Rs. 224 පැකේජයෙන් එකවර දෙන්නේ 30 GB පමණි. එම 30 GB අවසන් වූ පසු දිගටම භාවිතා කිරීමට නැවත Rs. 224 ඇක්ටිවේට් කරන්න.',
      },
      {
        tag: 'සීමිත · 20 GB',
        title: 'Dialog Rs. 348 (20 GB Social) + මාසික VLESS',
        body: 'එකම ක්‍රමයයි: Fun Blaster 20 GB අවසන් වූ විට සාමාන්‍ය බැලන්ස් කැපීම වැළැක්වීමට අන්තර්ජාලය නවතී. ඊළඟ 20 GB සඳහා නැවත Rs. 348 හෝ Rs. 488 රීලෝඩ් කරන්න.',
      },
      {
        tag: 'Unlimited',
        isUnlimited: true,
        title: 'Airtel Rs. 997 TikTok Unlimited + මාසික VLESS',
        body: 'Airtel Rs. 997 TikTok පැකේජය අසීමිත නිසා මැදදී නවතින්නේ නැත. මුළු මාසය පුරාම නැවත පැකේජ රීලෝඩ් කිරීමකින් තොරව භාවිතා කළ හැක.',
      },
    ],
    speedDisclaimer:
      'V2Ray / VLESS මඟින් ඔබගේ සිග්නල් ටවර් හෝ පැකේජ වේග සීමාව ඉක්මවා වේගය වැඩි නොකරයි. ඔබගේ සාමාන්‍ය ජාල වේගය 2 Mbps නම් VPN වේගයද 2 Mbps වේ.',
    exitEyebrow: 'IP පිටවීම තෝරන්න',
    exitTitle: 'Singapore (SG) IP එදිරිව ශ්‍රී ලංකා (LK) IP',
    exitSubtitle:
      'සියලුම Fibez VLESS ප්ලෑන් සඳහා වේගවත් Singapore සර්වර් සම්මත ලෙස ලැබේ. පිටවන IP අනුව වෙනස්කම් පහත දැක්වේ.',
    exitCards: [
      {
        badge: 'සම්මතව ඇතුළත්',
        title: 'Singapore (SG) — සාමාන්‍ය VLESS පිටවීම',
        body: 'ශ්‍රී ලංකාවට අඩුම ping අගය (~35–45 ms), වේගවත් ඩවුන්ලෝඩ් සහ ගෝලීය වෙබ් අඩවි සඳහා විශිෂ්ටයි. සමාජ මාධ්‍ය ඔබව සිංගප්පූරු කලාපයෙන් හඳුනාගනී.',
        note: 'සියලුම Fibez Dialog, SLT, Airtel, Mobitel, Hutch සහ Direct ප්ලෑන් සමඟ ඇතුළත් වේ.',
        availableOnFibez: true,
      },
      {
        badge: 'භාවිත මාර්ගෝපදේශය',
        title: 'ශ්‍රී ලංකා (LK) IP අවශ්‍ය වන්නේ කුමන අවස්ථාවලද?',
        body: 'ලංකාවේ ප්‍රේක්ෂකයන් ඉලක්ක කරන live streamers ලට සහ විදේශීය IP අවහිර කරන සමහර දේශීය බැංකු ඇප් සඳහා LK IP ප්‍රයෝජනවත් වේ — බැංකු ගනුදෙනු සඳහා මොහොතකට VPN OFF කළ හැක.',
        note: 'විශේෂ routing අවශ්‍ය නම් මිලදී ගැනීමට පෙර Support Ticket හරහා විමසන්න.',
        availableOnFibez: false,
      },
    ],
    packagesEyebrow: 'සියලු පැකේජ',
    packagesTitle: 'අප සහාය දක්වන පැකේජ (පින්තූර සමඟ)',
    packagesSubtitle:
      'ඔබගේ SIM, රවුටර් හෝ SLT ගිණුමේ පහත නිශ්චිත පැකේජයක් සක්‍රිය කර Fibez VLESS සමඟ භාවිතා කරන්න. විශාල කර බැලීමට පින්තූරය මත ක්ලික් කරන්න.',
    allPackagesTitle: 'සහාය දක්වන සියලු පැකේජ සහ සක්‍රිය කේත',
    browseAllBtn: 'සියලුම VLESS පැකේජ බලන්න',
    clientsEyebrow: 'බර ඇප් නැත',
    clientsTitle: 'උපාංග අනුව සැකසුම් විකල්ප',
    clientsSubtitle:
      'බැටරි ක්ෂය වන වෙනම ඇප් වෙනුවට අපි විශ්වාසදායක open-source ඇප් වන NetMod Syna, v2rayNG සහ iOS/macOS සඳහා Streisand භාවිතා කරමු.',
    clients: [
      {
        id: 'netmod-pc',
        shortLabel: 'NetMod (Windows PC)',
        title: 'Windows 10 සහ 11 සඳහා NetMod Syna',
        platform: 'Windows 64-bit',
        badge: 'PC සඳහා නිර්දේශිතයි',
        summary: 'සියලුම පරිගණක මෘදුකාංග, බ්‍රවුසර් සහ ඩවුන්ලෝඩ් Tun Mode හරහා භාවිතා කිරීමට හොඳම විසඳුම.',
        downloads: [
          { label: 'NetMod Syna (SourceForge) ඩවුන්ලෝඩ්', url: 'https://sourceforge.net/projects/netmod/' },
        ],
        steps: [
          {
            title: 'NetMod සහ Wintun driver install කරන්න',
            body: 'NetMod Syna (64-bit) බාගත කර ස්ථාපනයේදී ඉල්ලන Wintun / TAP driver සඳහා අවසර දෙන්න.',
          },
          {
            title: 'Email / Key Vault වෙතින් config කොපි කරන්න',
            body: 'Fibez තහවුරු කිරීමේ ඊමේල් එකේ හෝ Key Vault හි ඇති vless:// කේතය සම්පූර්ණයෙන් copy කරන්න.',
          },
          {
            title: 'Clipboard වෙතින් Import කරන්න',
            body: 'NetMod හි ඉහළ Profile → "Import from Clipboard" ක්ලික් කරන්න (නැතහොත් Ctrl + V ඔබන්න).',
          },
          {
            title: 'Tun Mode ON කර Start ඔබන්න',
            body: 'ප්‍රධාන තිරයේ "Tun Mode" තෝරා Start බොත්තම ඔබන්න.',
          },
        ],
        proTip: 'Start කිරීමට පෙර ඔබගේ පරිගණකය සම්බන්ධ වී ඇති SIM/රවුටරයේ නිවැරදි ISP පැකේජය සක්‍රිය බව තහවුරු කරන්න.',
      },
      {
        id: 'netmod-android',
        shortLabel: 'NetMod (Android)',
        title: 'Android දුරකථන සඳහා NetMod Syna',
        platform: 'Android 7.0+',
        badge: 'ANDROID නිර්දේශිතයි',
        summary: 'එක් ටැප් එකකින් clipboard import, ස්ථාවර සම්බන්ධතාව සහ Dialog / Mobitel SIM සඳහා ඉතා සුදුසුයි.',
        downloads: [
          { label: 'Google Play Store — NetMod Syna', url: 'https://play.google.com/store/apps/details?id=com.netmod.syna' },
        ],
        steps: [
          {
            title: 'NetMod Syna ස්ථාපනය කරන්න',
            body: 'Google Play Store වෙතින් NetMod Syna ඇප් එක බාගත කරන්න.',
          },
          {
            title: 'vless:// කේතය කොපි කරන්න',
            body: 'ඔබගේ Fibez ඊමේල් හෝ Key Vault වෙතින් vless:// සබැඳිය copy කරන්න.',
          },
          {
            title: 'Menu → Import → From Clipboard',
            body: 'NetMod විවෘත කර ඉහළ දකුණු මෙනුවෙන් Import Config → From Clipboard තෝරන්න.',
          },
          {
            title: 'START ඔබා අවසර දෙන්න',
            body: 'Profile එක තෝරා START ඔබා Android VPN අවසරය ලබා දෙන්න.',
          },
        ],
        proTip: 'Hotspot හරහා වෙනත් උපාංගයකට දෙන්නේ නම්, එම උපාංගයේත් NetMod/v2rayNG දමා එම config එකම භාවිතා කරන්න.',
      },
      {
        id: 'v2rayng',
        shortLabel: 'v2rayNG (Android)',
        title: 'v2rayNG (QR Scan සහ Ping පරීක්ෂාව)',
        platform: 'Android',
        badge: 'සැහැල්ලු ඇප් එක',
        summary: 'QR කේත scan කිරීමට සහ ping වේගය එසැණින් බැලීමට කැමති අය සඳහා ජනප්‍රිය open-source ඇප් එක.',
        downloads: [
          { label: 'v2rayNG GitHub APK', url: 'https://github.com/2dust/v2rayNG/releases' },
          { label: 'Google Play Store — v2rayNG', url: 'https://play.google.com/store/apps/details?id=com.v2ray.ang' },
        ],
        steps: [
          {
            title: 'v2rayNG බාගත කරන්න',
            body: 'Play Store හෝ නිල GitHub releases වෙතින් v2rayNG ස්ථාපනය කරන්න.',
          },
          {
            title: 'QR Scan හෝ Clipboard Paste',
            body: 'ඉහළ + ලකුණ ඔබා "Import config from QRcode" හෝ "Import config from Clipboard" තෝරන්න.',
          },
          {
            title: 'Connect බොත්තම ඔබන්න',
            body: 'පැකේජය තෝරා පහළ V බොත්තම ඔබා සම්බන්ධ වන්න.',
          },
        ],
        proTip: 'Mobitel Zoom පැකේජයේ ping -1ms ලෙස පෙන්වන්නේ නම් Airplane Mode වරක් ON/OFF කර නැවත උත්සාහ කරන්න.',
      },
      {
        id: 'ios-macos',
        shortLabel: 'iPhone & Mac',
        title: 'Streisand / Sing-box (iPhone සහ Mac)',
        platform: 'iOS · iPadOS · macOS',
        badge: 'APPLE උපාංග',
        summary: 'iPhone, iPad සහ Mac සඳහා App Store හරහා ලැබෙන විශ්වාසදායක VLESS ඇප්.',
        downloads: [
          { label: 'Streisand (App Store)', url: 'https://apps.apple.com/app/streisand/id6450534064' },
          { label: 'sing-box (App Store)', url: 'https://apps.apple.com/app/sing-box-vt/id6673731168' },
        ],
        steps: [
          {
            title: 'Streisand ඇප් එක ගන්න',
            body: 'App Store වෙතින් Streisand නොමිලේ බාගත කරන්න.',
          },
          {
            title: 'Config Import කරන්න',
            body: '+ ඔබා "Import from Clipboard" හෝ "Scan QR" හරහා Fibez config එක ඇතුළත් කරන්න.',
          },
          {
            title: 'Connect කරන්න',
            body: 'iOS VPN අවසරය ලබා දී සම්බන්ධ කරන්න.',
          },
        ],
        proTip: 'Smart TV වල VPN ඇප් ස්ථාපනය කළ නොහැකි බැවින් PC Hotspot හෝ Cast පහසුකම භාවිතා කරන්න.',
      },
    ],
    wizardEyebrow: 'විශ්වාස නැද්ද?',
    wizardTitle: 'ටැප් තුනකින් ඔබගේ ප්ලෑන් එක සොයන්න',
    wizardStepLabels: ['සම්බන්ධතාවය', 'පැකේජය', 'නිර්දේශය'],
    wizardStep1Q: 'ඔබට තියෙන්නේ මොන සම්බන්ධතාවයද?',
    wizardStep2Q: 'ඔබ භාවිතා කරන ISP පැකේජය කුමක්ද?',
    wizardStep2Sub: 'ඔබගේ SIM හෝ රවුටරයේ සක්‍රිය කරන පැකේජය තෝරන්න.',
    wizardStep3Title: 'ඔබට ගැලපෙනම Fibez ප්ලෑන් එක',
    wizardBuyBtn: 'මෙම ප්ලෑන් එක ගන්න',
    wizardTrialBtn: 'පළමුව පැය 24 නොමිලේ අත්හදා බලන්න',
    wizardStartOver: 'මුල සිට තෝරන්න',
    wizardBack: 'ආපසු',
    faqEyebrow: 'ප්‍රශ්න',
    faqTitle: 'නිතර අසන ප්‍රශ්න',
    faqSubtitle: 'ඩේටා නීති, වේග සීමා, පැකේජ සහ NetMod / v2rayNG පිළිබඳ සියලු පිළිතුරු.',
    goodToKnowTitle: 'දැනගන්න හොඳ දේවල්',
    goodToKnowPoints: [
      'VLESS භාවිතයට පෙර අපේ ලැයිස්තුවේ ඇති නිශ්චිත ISP පැකේජයක් (උදා: Dialog Zoom, SLT Netflix, Airtel TikTok 297/997) සක්‍රියව තිබිය යුතුය.',
      'සමහර පැකේජ GB සීමාවකට (20 GB / 30 GB / 100 GB) යටත් වන අතර Airtel Rs. 997 TikTok වැනි පැකේජ සම්පූර්ණයෙන්ම Unlimited වේ.',
      'වෙබ් අඩවියෙන් ඕඩර් කළ විගස තත්පර කිහිපයකින් ඔබගේ Email සහ Key Vault වෙත ස්වයංක්‍රීයව VLESS config එක ලැබේ.',
    ],
    faqs: [
      {
        id: 'not-reload',
        category: 'data',
        q: 'V2Ray / VLESS මඟින් නොමිලේ SIM ඩේටා ලැබෙනවාද?',
        a: 'නැත. අපි ඩේටා රීලෝඩ් ලබා නොදේ — මෙය VPN සේවාවකි. ඔබ දැනටමත් SIM හෝ රවුටරයේ සක්‍රිය කර ඇති Zoom, TikTok, Netflix හෝ Social පැකේජයක සීමිත ඩේටා සාමාන්‍ය අන්තර්ජාලය බවට පරිවර්තනය කිරීම මෙහිදී සිදුවේ.',
      },
      {
        id: 'how-works',
        category: 'data',
        q: 'V2Ray වැඩ කරන්නේ කොහොමද?',
        a: 'උදාහරණයක්: ඔබ Airtel Rs. 997 TikTok පැකේජය සක්‍රිය කළහොත් සාමාන්‍යයෙන් එය භාවිතා කළ හැක්කේ TikTok සඳහා පමණි. Fibez VLESS config එක සමඟ NetMod භාවිතා කළ විට එම TikTok ඩේටා ඕනෑම app එකකට භාවිතා කළ හැකි සාමාන්‍ය අන්තර්ජාලය බවට හැරේ.',
      },
      {
        id: 'what-apps',
        category: 'data',
        q: 'VPN සම්බන්ධ කළ පසු ඕනෑම දෙයක් කරන්න පුළුවන්ද?',
        a: 'ඔව් — ස්ට්‍රීමිං, ඩවුන්ලෝඩ්, ගේමිං, YouTube සහ බ්‍රවුසින් ඇතුළු සාමාන්‍ය අන්තර්ජාලයේ කරන ඕනෑම දෙයක් කළ හැක.',
      },
      {
        id: 'why-v2ray',
        category: 'data',
        q: 'සාමාන්‍ය ඩේටා රීලෝඩ් වලට වඩා මෙහි ඇති වාසිය කුමක්ද?',
        a: 'විශාල මුදලක් ගෙවා anytime ඩේටා ගන්නවාට වඩා, අඩු මුදලක ඇති Unlimited TikTok හෝ 100GB Meet Max වැනි පැකේජයක් හරහා වැඩි ඩේටා ප්‍රමාණයක් ඉතා ලාභදායී ලෙස භාවිතා කළ හැක.',
      },
      {
        id: 'gb-limit-vs-unlim',
        category: 'data',
        q: '30 GB Zoom පැකේජයක් දමා 100 GB පාවිච්චි කරන්න පුළුවන්ද?',
        a: 'බැහැ — එකවර පාවිච්චි කළ හැක්කේ එම 30 GB ප්‍රමාණය පමණි. 30 GB අවසන් වූ පසු දිගටම භාවිතා කිරීමට නැවත පැකේජය සක්‍රිය කළ යුතුයි. නමුත් Airtel Rs. 997 TikTok Unlimited වැනි පැකේජයකදී නැවත රීලෝඩ් නොකර දිගටම භාවිතා කළ හැක.',
      },
      {
        id: 'why-stopped',
        category: 'data',
        q: 'මාසික VPN කාලය ඉවර වෙන්න කලින් අන්තර්ජාලය නැවතුණේ ඇයි?',
        a: 'බොහෝ විට ඔබගේ මූලික ISP පැකේජයේ GB සීමාව (උදා: Dialog 348 හි 20 GB හෝ Meet Lite හි 30 GB) අවසන් වී ඇත. එම පැකේජයම නැවත සක්‍රිය කළ විගස VPN නැවත වැඩ කරයි.',
      },
      {
        id: 'unlisted-packs',
        category: 'data',
        q: '797, 909, 1180, 498 වැනි ලැයිස්තුවේ නැති පැකේජ එක්ක වැඩද?',
        a: 'අපි නිර්දේශ කරන්නේ ලැයිස්තුවේ ඇති නිශ්චිත පැකේජ පමණයි. ලැයිස්තුවේ නැති බොහෝ පැකේජ 1 Mbps වේග සීමාවකට යටත් හෝ අසාර්ථක විය හැක.',
      },
      {
        id: 'speed-boost',
        category: 'speed',
        q: 'V2Ray මඟින් අන්තර්ජාල වේගය වැඩි කරනවාද?',
        a: 'නැත. එය ඔබගේ සිග්නල් ශක්තිය සහ පැකේජයේ සාමාන්‍ය වේගය මතම ක්‍රියා කරයි. පැකේජය 2 Mbps සීමා නම් VPN වේගයද 2 Mbps වේ.',
      },
      {
        id: 'slower-anytime',
        category: 'speed',
        q: 'සමහර වෙලාවට වේගය අඩු වැඩි වන්නේ ඇයි?',
        a: 'රාත්‍රී කාලයේ ජාල තදබදය සහ කුළුණේ network priority අනුව වේගය වෙනස් විය හැක. /v2ray හි ඇති Line Check මඟින් සර්වර් latency පරීක්ෂා කළ හැක.',
      },
      {
        id: 'ip-diff',
        category: 'speed',
        q: 'Singapore (SG) IP සහ ශ්‍රී ලංකා (LK) IP අතර වෙනස කුමක්ද?',
        a: 'සම්මත SG IP වේගවත් හා ලාභදායී වේ. Streamers ලාට ලංකාවේ ප්‍රේක්ෂකයන්ට content යැවීමට හෝ විදේශීය IP block කරන බැංකු ඇප් වලට LK IP අවශ්‍ය විය හැක — බැංකු ඇප් සඳහා VPN තාවකාලිකව OFF කළ හැක.',
      },
      {
        id: 'no-dedicated-app',
        category: 'devices',
        q: 'ඔබටම වෙන්වූ VPN ඇප් එකක් නැත්තේ ඇයි?',
        a: 'විවෘත සම්මත ඇප් වන NetMod Syna, v2rayNG සහ Streisand වේගවත්, බැටරි ඉතිරි කරන අතර ISP මඟින් අවහිර වීම අඩුයි.',
      },
      {
        id: 'which-devices',
        category: 'devices',
        q: 'Android, iPhone, Windows සහ Mac වල භාවිතා කළ හැකිද?',
        a: 'ඔව්. සෑම උපාංගයකටම නිල ඇප් ඇත. නමුත් Smart TV වල කෙලින්ම VPN ස්ථාපනය කළ නොහැක.',
      },
      {
        id: 'hotspot',
        category: 'devices',
        q: 'Hotspot එකක් හරහා වෙනත් උපාංගයකට දෙන්න පුළුවන්ද?',
        a: 'ඔව්, නමුත් hotspot එකට සම්බන්ධ වන උපාංගයේත් NetMod හෝ v2rayNG ස්ථාපනය කර එම config එකම දැමිය යුතුය.',
      },
      {
        id: 'delivery-time',
        category: 'orders',
        q: 'ඕඩර් කළ පසු config එක ලැබෙන්න කොපමණ වේලාවක් යනවාද? Free Trial තියෙනවාද?',
        a: 'ගෙවීම තහවුරු වූ විගස තත්පර කිහිපයකින් ඔබගේ Email සහ Key Vault වෙත config එක ලැබේ. මිලදී ගැනීමට පෙර /v2ray හි ඇති පැය 24 නොමිලේ අත්හදා බැලීම භාවිතා කළ හැක.',
      },
      {
        id: 'line-check-usage',
        category: 'orders',
        q: 'සම්බන්ධ වීමේ ගැටළුවක් ඇති වුණොත් මොකද කරන්නේ?',
        a: 'පළමුව /v2ray#line-check හරහා Line Check පරීක්ෂාව සිදු කරන්න. තවමත් ගැටළුවක් ඇත්නම් /tickets හරහා ඔබගේ ISP පැකේජය සඳහන් කර පණිවිඩයක් තබන්න.',
      },
    ],
    troubleshootTitle: 'සම්බන්ධතා ගැටළුවක් හෝ වේගය අඩුද?',
    troubleshootBody:
      'ඔබගේ ISP SNI සර්වරයට ළඟා වේදැයි බැලීමට Line Check පරීක්ෂාව ක්‍රියාත්මක කරන්න, නැතහොත් Support Ticket එකක් විවෘත කරන්න.',
    troubleshootLineCheck: 'Line Check අරඹන්න',
    troubleshootTicket: 'Support Ticket විවෘත කරන්න',
  },
  ta: {
    heroBadge: 'இலங்கை VLESS / V2RAY வழிகாட்டி',
    heroTitle: 'V2Ray என்பது டேட்டா ரீலோட் அல்ல.',
    heroDesc:
      'நீங்கள் ஏற்கனவே செயல்படுத்திய தொகுப்பின் — Zoom, YouTube, TikTok, Netflix அல்லது Social தொகுப்பின் — கட்டுப்படுத்தப்பட்ட டேட்டாவை NetMod Syna அல்லது v2rayNG மூலம் எதற்கும் பயன்படுத்தக்கூடிய சாதாரண இணையமாக மாற்றுகிறது.',
    heroCtaFind: 'எனது திட்டத்தைக் கண்டறி (3 தட்டு)',
    heroCtaPackages: 'தொகுப்புகள் & படங்கள்',
    heroCtaApps: 'NetMod & ஆப் அமைப்பு',
    heroCtaLineCheck: 'Line Check இயக்கு',
    howEyebrow: 'டேட்டா எப்படி வேலை செய்கிறது',
    howTitle: '3 படிகள் & நினைவில் கொள்ள வேண்டிய ஒரு விதி',
    ruleLabel: 'நினைவில் கொள்ள வேண்டிய ஒரு விதி',
    ruleBody:
      'உங்கள் ISP தொகுப்பும் VLESS இணைப்பும் ஒரே விகிதத்தில் (1:1) டேட்டாவைப் பயன்படுத்துகின்றன. 20 GB அல்லது 30 GB வரம்பு தொகுப்பு எனில், ஒரே நேரத்தில் அந்த அளவு மட்டுமே பயன்படுத்த முடியும் — தீர்ந்ததும் தொடர அதே தொகுப்பை மீண்டும் ரீலோட் செய்யவும்.',
    steps: [
      {
        num: '01',
        title: 'ISP தொகுப்பைச் செயல்படுத்து',
        body: 'நாங்கள் பட்டியலிட்ட சரியான Zoom, TikTok, Netflix அல்லது Social தொகுப்புகளில் ஒன்றை உங்கள் SIM, ரவுட்டர் அல்லது SLT இணைப்பில் இயக்கவும்.',
      },
      {
        num: '02',
        title: 'NetMod / VLESS மாற்றுகிறது',
        body: 'மின்னஞ்சல் அல்லது Key Vault-இலிருந்து Fibez config-ஐ NetMod Syna அல்லது v2rayNG-இல் import செய்யவும்.',
      },
      {
        num: '03',
        title: 'எதற்கும் பயன்படுத்துங்கள்',
        body: 'உங்கள் அடிப்படைத் தொகுப்பு அல்லது திட்டக் காலம் முடியும் வரை உலாவுதல், பதிவிறக்கம், ஸ்ட்ரீமிங் அனைத்திற்கும் பயன்படுத்துங்கள்.',
      },
    ],
    pipelineLabel: 'இணைப்பு செயல்முறை',
    pipelineSteps: [
      'உங்கள் சாதனம் (NetMod / v2rayNG)',
      'ISP அனுமதித்த SNI (எ.கா. zoom.us)',
      'Fibez VLESS சர்வர் (Singapore)',
      'தடையற்ற முழு இணையம்',
    ],
    examplesEyebrow: 'டேட்டா பயன்பாடு',
    examplesTitle: 'மூன்று உதாரணங்கள்',
    examples: [
      {
        tag: 'வரம்பு · 30 GB',
        title: 'Hutch Rs. 224 (30 GB Zoom) + மாதாந்திர VLESS',
        body: 'மாதாந்திர Fibez திட்டம் இருந்தாலும், Hutch Rs. 224 ஒரே நேரத்தில் 30 GB மட்டுமே தரும். 30 GB முடிந்ததும் தொடர மீண்டும் Rs. 224-ஐ இயக்கவும்.',
      },
      {
        tag: 'வரம்பு · 20 GB',
        title: 'Dialog Rs. 348 (20 GB Social) + மாதாந்திர VLESS',
        body: '20 GB Fun Blaster முடிந்ததும் சாதாரண பேலன்ஸ் கழியாமல் இருக்க இணையம் நிற்கும். அடுத்த 20 GB-க்கு மீண்டும் Rs. 348 அல்லது Rs. 488 ரீலோட் செய்யவும்.',
      },
      {
        tag: 'வரம்பற்றது',
        isUnlimited: true,
        title: 'Airtel Rs. 997 TikTok Unlimited + மாதாந்திர VLESS',
        body: 'Airtel Rs. 997 TikTok வரம்பற்றது என்பதால் இடையில் நிற்காது — ரீலோட் தேவையின்றி மாதம் முழுவதும் தொடர்ச்சியாகப் பயன்படுத்தலாம்.',
      },
    ],
    speedDisclaimer:
      'V2Ray / VLESS உங்கள் நெட்வொர்க்கின் சாதாரண வேகத்தை விட அதிகரிக்காது. அடிப்படைத் தொகுப்பு 2 Mbps வேக வரம்பில் இருந்தால் VPN-உம் 2 Mbps வேகத்திலேயே இயங்கும்.',
    exitEyebrow: 'வெளியேறலைத் தேர்வுசெய்',
    exitTitle: 'Singapore (SG) IP vs. இலங்கை (LK) IP',
    exitSubtitle:
      'அனைத்து Fibez VLESS திட்டங்களும் வேகமான சிங்கப்பூர் சர்வர் வழியாக இயங்குகின்றன.',
    exitCards: [
      {
        badge: 'இயல்புநிலையில் உள்ளது',
        title: 'Singapore (SG) — நிலையான VLESS வெளியேறல்',
        body: 'இலங்கைக்கு மிகக் குறைந்த ping (~35–45 ms), வேகமான பதிவிறக்கம் மற்றும் அனைத்து உலகளாவிய தளங்களுக்கும் சிறந்தது.',
        note: 'அனைத்து Fibez Dialog, SLT, Airtel, Mobitel, Hutch & Direct திட்டங்களிலும் உள்ளது.',
        availableOnFibez: true,
      },
      {
        badge: 'பயன்பாட்டு வழிகாட்டி',
        title: 'இலங்கை (LK) IP எப்போது தேவைப்படலாம்?',
        body: 'உள்ளூர் பார்வையாளர்களை இலக்காகக் கொண்ட ஸ்ட்ரீமர்கள் அல்லது வெளிநாட்டு IP-ஐத் தடுக்கும் சில உள்ளூர் வங்கி ஆப்களுக்கு LK IP பயனுள்ளது — வங்கிப் பரிவர்த்தனைகளுக்கு VPN-ஐ சிறிது நேரம் நிறுத்தலாம்.',
        note: 'சிறப்பு routing தேவைப்பட்டால் Support Ticket மூலம் தொடர்பு கொள்ளவும்.',
        availableOnFibez: false,
      },
    ],
    packagesEyebrow: 'அனைத்து தொகுப்புகள்',
    packagesTitle: 'நாங்கள் ஆதரிக்கும் தொகுப்புகள் (படங்களுடன்)',
    packagesSubtitle:
      'உங்கள் SIM, ரவுட்டர் அல்லது SLT கணக்கில் கீழே உள்ள சரியான தொகுப்பை இயக்கி Fibez VLESS உடன் இணைக்கவும். பெரிதாக்க படத்தைக் கிளிக் செய்யவும்.',
    allPackagesTitle: 'ஆதரிக்கப்படும் அனைத்து தொகுப்புகள் & செயல்படுத்தும் குறியீடுகள்',
    browseAllBtn: 'அனைத்து VLESS திட்டங்களையும் பார்',
    clientsEyebrow: 'பிரத்யேக ஆப் தேவையில்லை',
    clientsTitle: 'சாதன வாரியான அமைப்பு விருப்பங்கள்',
    clientsSubtitle:
      'பேட்டரி வீணாக்கும் தனியார் ஆப்களுக்கு பதிலாக NetMod Syna, v2rayNG மற்றும் Streisand போன்ற நம்பகமான open-source ஆப்களைப் பயன்படுத்துகிறோம்.',
    clients: [
      {
        id: 'netmod-pc',
        shortLabel: 'NetMod (Windows PC)',
        title: 'Windows 10 & 11-க்கான NetMod Syna',
        platform: 'Windows 64-bit',
        badge: 'PC பரிந்துரை',
        summary: 'முழு கணினி போக்குவரத்தையும் Tun Mode மூலம் இணைக்கச் சிறந்த தேர்வு.',
        downloads: [
          { label: 'NetMod Syna (SourceForge) பதிவிறக்கம்', url: 'https://sourceforge.net/projects/netmod/' },
        ],
        steps: [
          { title: 'NetMod & Wintun நிறுவுக', body: 'NetMod Syna (64-bit)-ஐ நிறுவி Wintun driver-ஐ ஏற்கவும்.' },
          { title: 'மின்னஞ்சலிலிருந்து Config நகலெடுக்க', body: 'Fibez மின்னஞ்சல் அல்லது Key Vault-இலிருந்து vless:// இணைப்பை நகலெடுக்கவும்.' },
          { title: 'Clipboard வழியாக Import செய்க', body: 'Profile → "Import from Clipboard" கிளிக் செய்யவும் (அல்லது Ctrl + V).' },
          { title: 'Tun Mode இயக்கி Start அழுத்தவும்', body: 'Tun Mode-ஐத் தேர்வுசெய்து Start பொத்தானை அழுத்தவும்.' },
        ],
        proTip: 'இணைக்கும் முன் உங்கள் ISP தொகுப்பு செயலில் உள்ளதா என உறுதிசெய்யவும்.',
      },
      {
        id: 'netmod-android',
        shortLabel: 'NetMod (Android)',
        title: 'Android-க்கான NetMod Syna',
        platform: 'Android 7.0+',
        badge: 'ANDROID பரிந்துரை',
        summary: 'ஒரே தட்டலில் config சேர்க்கவும் Dialog / Mobitel SIM-களுக்கும் சிறந்தது.',
        downloads: [
          { label: 'Google Play Store — NetMod Syna', url: 'https://play.google.com/store/apps/details?id=com.netmod.syna' },
        ],
        steps: [
          { title: 'NetMod Syna நிறுவுக', body: 'Google Play Store-இலிருந்து NetMod Syna-ஐப் பதிவிறக்கவும்.' },
          { title: 'vless:// இணைப்பை நகலெடுக்க', body: 'Fibez மின்னஞ்சலிலிருந்து config-ஐ நகலெடுக்கவும்.' },
          { title: 'Menu → Import Config → From Clipboard', body: 'மேல் வலது மெனுவிலிருந்து From Clipboard என்பதைத் தேர்ந்தெடுக்கவும்.' },
          { title: 'START அழுத்தவும்', body: 'START அழுத்தி Android VPN அனுமதியை ஏற்கவும்.' },
        ],
        proTip: 'Hotspot வழியாகப் பகிர இரண்டாவது சாதனத்திலும் அதே config உடன் ஆப்-ஐப் பயன்படுத்தவும்.',
      },
      {
        id: 'v2rayng',
        shortLabel: 'v2rayNG (Android)',
        title: 'v2rayNG (QR Scan & Ping சோதனை)',
        platform: 'Android',
        badge: 'எளிமையான ஆப்',
        summary: 'கேமரா QR ஸ்கேன் மற்றும் நேரடி ping சோதனையுடன் கூடிய எளிய open-source ஆப்.',
        downloads: [
          { label: 'v2rayNG GitHub APK', url: 'https://github.com/2dust/v2rayNG/releases' },
          { label: 'Google Play Store — v2rayNG', url: 'https://play.google.com/store/apps/details?id=com.v2ray.ang' },
        ],
        steps: [
          { title: 'v2rayNG நிறுவுக', body: 'Play Store அல்லது GitHub releases-இலிருந்து நிறுவவும்.' },
          { title: 'QR ஸ்கேன் அல்லது Paste', body: '+ ஐகானை அழுத்தி "Import config from QRcode" அல்லது "Clipboard" தேர்ந்தெடுக்கவும்.' },
          { title: 'V பொத்தானை அழுத்தி இணைக்கவும்', body: 'கீழே உள்ள V பொத்தானை அழுத்தி இணைக்கவும்.' },
        ],
        proTip: 'Mobitel Zoom-இல் ping -1ms காட்டினால் Airplane Mode-ஐ ஒருமுறை ON/OFF செய்து முயற்சிக்கவும்.',
      },
      {
        id: 'ios-macos',
        shortLabel: 'iPhone & Mac',
        title: 'Streisand / Sing-box (iOS & macOS)',
        platform: 'iPhone · iPad · Mac',
        badge: 'APPLE சாதனங்கள்',
        summary: 'iPhone, iPad மற்றும் Mac-க்கு App Store-இல் கிடைக்கும் நம்பகமான ஆப்கள்.',
        downloads: [
          { label: 'Streisand (App Store)', url: 'https://apps.apple.com/app/streisand/id6450534064' },
          { label: 'sing-box (App Store)', url: 'https://apps.apple.com/app/sing-box-vt/id6673731168' },
        ],
        steps: [
          { title: 'Streisand நிறுவுக', body: 'App Store-இலிருந்து Streisand-ஐப் பதிவிறக்கவும்.' },
          { title: 'Config Import செய்க', body: '+ அழுத்தி Clipboard அல்லது QR மூலம் சேர்க்கவும்.' },
          { title: 'இணைக்கவும்', body: 'iOS VPN அனுமதி வழங்கி இயக்கவும்.' },
        ],
        proTip: 'Smart TV-களில் நேரடியாக VPN நிறுவ முடியாது — PC Hotspot மூலம் பகிரவும்.',
      },
    ],
    wizardEyebrow: 'உறுதியாக இல்லையா?',
    wizardTitle: 'மூன்று தட்டல்களில் உங்கள் திட்டத்தைக் கண்டறியுங்கள்',
    wizardStepLabels: ['இணைப்பு', 'தொகுப்பு', 'பரிந்துரை'],
    wizardStep1Q: 'உங்களிடம் எந்த இணைப்பு உள்ளது?',
    wizardStep2Q: 'எந்த ISP தொகுப்பைப் பயன்படுத்துகிறீர்கள்?',
    wizardStep2Sub: 'நீங்கள் உங்கள் சிம் அல்லது ரவுட்டரில் செயல்படுத்தும் தொகுப்பைத் தேர்ந்தெடுக்கவும்.',
    wizardStep3Title: 'உங்களுக்கான சிறந்த Fibez திட்டம்',
    wizardBuyBtn: 'இந்தத் திட்டத்தை வாங்கு',
    wizardTrialBtn: 'முதலில் 24 மணி நேர இலவச சோதனை',
    wizardStartOver: 'மீண்டும் தொடங்கு',
    wizardBack: 'பின்செல்',
    faqEyebrow: 'கேள்விகள்',
    faqTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    faqSubtitle: 'டேட்டா விதிகள், வேக வரம்புகள், ISP தொகுப்புகள் மற்றும் NetMod அமைப்பு குறித்த முழுமையான பதில்கள்.',
    goodToKnowTitle: 'தெரிந்திருக்க வேண்டியவை',
    goodToKnowPoints: [
      'எங்கள் பட்டியலில் உள்ள சரியான ISP தொகுப்பு (எ.கா. Dialog Zoom, SLT Netflix, Airtel TikTok 297/997) செயலில் இருக்க வேண்டும்.',
      'சில தொகுப்புகள் GB வரம்பு (20 GB / 30 GB / 100 GB) கொண்டவை; Airtel Rs. 997 TikTok போன்றவை வரம்பற்றவை.',
      'இணையதளத்தில் ஆர்டர் செய்த நொடிகளில் உங்கள் மின்னஞ்சல் மற்றும் Key Vault-க்கு VLESS config தானாகவே அனுப்பப்படும்.',
    ],
    faqs: [
      {
        id: 'not-reload',
        category: 'data',
        q: 'V2Ray / VLESS இலவச டேட்டா அல்லது SIM ரீலோட் தருமா?',
        a: 'இல்லை. நாங்கள் டேட்டா ரீலோட் விற்பனை செய்வதில்லை — இது ஒரு VPN சேவை. உங்கள் சிம்மில் உள்ள Zoom, TikTok, Netflix அல்லது Social தொகுப்பு டேட்டாவை சாதாரண இணையமாக மாற்றுகிறது.',
      },
      {
        id: 'how-works',
        category: 'data',
        q: 'V2Ray எப்படி வேலை செய்கிறது?',
        a: 'உதாரணமாக, Airtel Rs. 997 TikTok தொகுப்பை இயக்கினால் அது TikTok-க்கு மட்டுமே வேலை செய்யும். Fibez VLESS config உடன் NetMod பயன்படுத்தும்போது அதே டேட்டா அனைத்து ஆப்களுக்கும் வேலை செய்யும்.',
      },
      {
        id: 'what-apps',
        category: 'data',
        q: 'VPN இணைத்த பிறகு எதையும் பயன்படுத்த முடியுமா?',
        a: 'ஆம் — ஸ்ட்ரீமிங், டவுன்லோட், கேமிங், உலாவல் உட்பட சாதாரண இணையத்தில் செய்யும் எதையும் செய்யலாம்.',
      },
      {
        id: 'why-v2ray',
        category: 'data',
        q: 'சாதாரண ரீலோடை விட V2Ray பயன்படுத்துவதன் நன்மை என்ன?',
        a: 'சாதாரண anytime டேட்டா ரீலோடை விடக் குறைந்த செலவில் மிக அதிக GB இணையத்தைப் பெற இது உதவுகிறது.',
      },
      {
        id: 'gb-limit-vs-unlim',
        category: 'data',
        q: '30 GB Zoom தொகுப்பை இயக்கி 100 GB ஒரே நேரத்தில் பயன்படுத்த முடியுமா?',
        a: 'இல்லை — 30 GB மட்டுமே ஒரே நேரத்தில் பயன்படுத்த முடியும். 30 GB முடிந்ததும் மீண்டும் தொகுப்பை இயக்க வேண்டும். ஆனால் Airtel Rs. 997 TikTok Unlimited போன்ற வரம்பற்ற தொகுப்பில் ரீலோட் தேவையின்றி தொடர்ச்சியாகப் பயன்படுத்தலாம்.',
      },
      {
        id: 'why-stopped',
        category: 'data',
        q: 'என் VPN திட்டம் முடியும் முன்பே இணையம் ஏன் நின்றது?',
        a: 'உங்கள் அடிப்படை ISP தொகுப்பு (உதாரணம்: Dialog 348 20 GB அல்லது Meet Lite 30 GB) தீர்ந்துவிட்டது. அதே தொகுப்பை மீண்டும் செயல்படுத்தியதும் உடனே இயங்கும்.',
      },
      {
        id: 'unlisted-packs',
        category: 'data',
        q: '797, 909, 1180, 498 போன்ற பட்டியலில் இல்லாத தொகுப்புகளுடன் வேலை செய்யுமா?',
        a: 'நாங்கள் பட்டியலிட்டுள்ள தொகுப்புகளை மட்டுமே பரிந்துரைக்கிறோம். பட்டியலில் இல்லாத பல தொகுப்புகள் 1 Mbps வேக வரம்புடன் இருக்கும்.',
      },
      {
        id: 'speed-boost',
        category: 'speed',
        q: 'V2Ray இணைய வேகத்தை அதிகரிக்குமா?',
        a: 'இல்லை. உங்கள் நெட்வொர்க்கின் சாதாரண வேகத்திலேயே இயங்கும். அடிப்படைத் தொகுப்பு 2 Mbps எனில் VPN-உம் 2 Mbps வேகத்திலேயே இயங்கும்.',
      },
      {
        id: 'slower-anytime',
        category: 'speed',
        q: 'சில நேரங்களில் வேகம் ஏன் மாறுபடுகிறது?',
        a: 'நெட்வொர்க் நெரிசல் மற்றும் சிக்னல் வலிமை காரணமாக இது நிகழும். /v2ray-இல் உள்ள Line Check கருவி மூலம் latency-ஐச் சரிபார்க்கலாம்.',
      },
      {
        id: 'ip-diff',
        category: 'speed',
        q: 'Singapore (SG) IP மற்றும் இலங்கை (LK) IP வித்தியாசம் என்ன?',
        a: 'SG IP வேகமானது மற்றும் அனைத்து Fibez திட்டங்களிலும் உள்ளது. உள்ளூர் வங்கி ஆப்களுக்கு வெளிநாட்டு IP சிக்கல் இருந்தால் சிறிது நேரம் VPN-ஐ நிறுத்தலாம்.',
      },
      {
        id: 'no-dedicated-app',
        category: 'devices',
        q: 'உங்களிடம் பிரத்யேக ஆப் இல்லையா? ஏன் NetMod மற்றும் v2rayNG?',
        a: 'நம்பகமான open-source ஆப்களான NetMod Syna, v2rayNG மற்றும் Streisand வேகமானவை மற்றும் பேட்டரி சேமிப்பவை.',
      },
      {
        id: 'which-devices',
        category: 'devices',
        q: 'எந்தச் சாதனங்களில் பயன்படுத்த முடியும்?',
        a: 'Windows PC, Android, iPhone, iPad மற்றும் Mac ஆகியவற்றில் பயன்படுத்தலாம். ஆனால் Smart TV-யில் நேரடியாக நிறுவ முடியாது.',
      },
      {
        id: 'hotspot',
        category: 'devices',
        q: 'Hotspot வழியாகப் பயன்படுத்த முடியுமா?',
        a: 'ஆம், hotspot-இல் இணையும் சாதனத்திலும் NetMod அல்லது v2rayNG நிறுவி அதே config-ஐப் பயன்படுத்தவும்.',
      },
      {
        id: 'delivery-time',
        category: 'orders',
        q: 'ஆர்டர் செய்தவுடன் config எப்போது கிடைக்கும்? Free Trial உள்ளதா?',
        a: 'பணம் செலுத்திய நொடிகளில் மின்னஞ்சல் மற்றும் Key Vault-க்கு தானாகவே அனுப்பப்படும். /v2ray-இல் 24 மணி நேர இலவச சோதனையும் உள்ளது.',
      },
      {
        id: 'line-check-usage',
        category: 'orders',
        q: 'இணைப்புச் சிக்கல் இருந்தால் என்ன செய்வது?',
        a: '/v2ray#line-check மூலம் Line Check சோதனை செய்யவும் அல்லது /tickets வழியாக உங்கள் ISP விவரங்களுடன் தொடர்பு கொள்ளவும்.',
      },
    ],
    troubleshootTitle: 'இணைப்பு அல்லது வேகச் சிக்கல்கள் உள்ளனவா?',
    troubleshootBody:
      'உங்கள் SNI சர்வரை அடைகிறதா என அறிய Line Check சோதனையை இயக்கவும் அல்லது Support Ticket திறக்கவும்.',
    troubleshootLineCheck: 'Line Check இயக்கு',
    troubleshootTicket: 'Support Ticket திறக்கவும்',
  },
};
