export type GuideLang = 'en';

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

export interface DeviceSetupCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  platforms: { windows: string; mac: string; android: string; ios: string };
  stepsTitle: string;
  steps: { title: string; body: string }[];
  tip: string;
  tvNote: string;
  download: string;
  free: string;
  paid: string;
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
  heroCtaLineCheck: string;
  /** Section chips: find plan, how it works, set up, packages, good to know, FAQ. */
  navLabels: [string, string, string, string, string, string];
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
  deviceSetup: DeviceSetupCopy;
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
    heroCtaLineCheck: 'Run Line Check',
    navLabels: ['Find my plan', 'How it works', 'Set up your device', 'Packages', 'Good to know', 'FAQ'],
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
    deviceSetup: {
      eyebrow: 'Set up your device',
      title: 'Pick your device, get the app',
      subtitle: 'Any of these apps works with your Fibez config. Install one, import your config, connect.',
      platforms: { windows: 'Windows PC', mac: 'Mac', android: 'Android', ios: 'iPhone / iPad' },
      stepsTitle: 'Then, in 3 steps',
      steps: [
        { title: 'Install an app', body: 'Download one of the apps above and open it.' },
        {
          title: 'Import your config',
          body: 'Copy the vless:// link from your Fibez email or Key Vault, then choose "Import from Clipboard" (or scan the QR code) in the app.',
        },
        {
          title: 'Connect & test',
          body: 'Turn the connection on, allow the VPN prompt, then check it with our Line Check.',
        },
      ],
      tip: 'Keep your ISP add-on pack active while you connect.',
      tvNote: 'Smart TVs (WebOS / Tizen) cannot install VPN configs natively. Connect through a Windows PC hotspot or a router gateway, or cast from your device.',
      download: 'Download',
      free: 'Free',
      paid: 'Paid',
    },
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
        a: 'We intentionally do not push a closed custom app. Open standards — NetMod (Windows & Android), Netch (Windows), v2rayNG (Android), and Npv Tunnel, INCY, Fair VPN or Shadowrocket (iPhone & Mac) — are lighter on battery, transparent, support proper Tun Mode, and stay resilient against ISP signatures.',
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
        a: 'Run the Line Check on /v2ray/line-check. It tests your own internet first, then checks that our server accepts your line, so you can tell which one is the problem. If you still need help, open a ticket in /tickets with your ISP and pack name.',
      },
    ],
    troubleshootTitle: 'Still unsure or seeing connection drops?',
    troubleshootBody:
      'Run our 4-hop Line Check diagnostic to see if your SIM SNI reaches the node cleanly, or message our team with your active pack details.',
    troubleshootLineCheck: 'Launch Line Check Diagnostic',
    troubleshootTicket: 'Open Support Ticket',
  },
};
