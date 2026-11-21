'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { authClient } from '@/lib/auth-client';
import LineActions from '@/components/v2ray/LineActions';
import { buildVlessUri, parseVlessUri } from '@/lib/v2ray-inbounds';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import TechText from '@/components/TechText';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { 
  Radio,
  Server, 
  Zap, 
  Copy, 
  Check, 
  QrCode as QrIcon, 
  ExternalLink, 
  RefreshCw, 
  ChevronRight, 
  Terminal, 
  Layers,
  Laptop,
  Smartphone,
  Gauge,
  ArrowDown,
  ArrowUp,
  Clock,
  Trash2,
  CheckCircle2,
  X,
  FileCode,
  Activity,
  PackageCheck,
  Star,
  UploadCloud,
  Image as ImageIcon,
  Eye,
  ShieldCheck,
  Sparkles,
  Filter,
  KeyRound,
  Unlink,
  Plus,
  User,
  Wallet,
  Gift
} from 'lucide-react';
import DailyUsageBars from '@/components/v2ray/DailyUsageBars';
import WindsterAreaChart, { ChartDataPoint } from '@/components/admin/WindsterAreaChart';
import { LIVE_V2RAY_PACKAGES, normalizeIsp } from '@/lib/v2ray-catalog';
import {
  PurchasedV2RayLine,
  DEFAULT_PURCHASED_LINES,
  loadPurchasedLines,
  savePurchasedLines,
  recordPurchasedLines,
  findCatalogPackage,
  createPurchasedLineFromCartItem,
  V2RAY_ACTIVE_LINE_STORAGE_KEY,
} from '@/lib/v2ray-lines';

interface V2RayPackage {
  id: string;
  title: string;
  isp: string;
  ispTag: string;
  description: string;
  sni: string;
  port: number;
  badge?: string;
  configUri: string;
}

interface LineConnection {
  ip: string;
  isp: string | null;
  lastSeen: string;
  status: 'online' | 'seen';
}

export interface SpeedtestReview {
  id: string;
  clientName: string;
  isp: string;
  ispCategory: 'Dialog' | 'SLT' | 'Mobitel' | 'Airtel' | 'Hutch' | 'Other';
  packageTitle: string;
  downloadMbps: number;
  uploadMbps?: number;
  pingMs: number;
  rating: number;
  comment: string;
  date: string;
  imageSrc: string;
  verified: boolean;
}

// No seeded/fake community reviews: only real submissions are ever shown.
const INITIAL_REVIEWS: SpeedtestReview[] = [];

// All infrastructure is based on 3x-ui Singapore Equinix Tier-1 & Sri Lanka IP Gateways.
// Dynamically built from all 24 carrier-optimized ISP packages in the Fibez Catalog:
const ALL_PACKAGES: V2RayPackage[] = LIVE_V2RAY_PACKAGES.map((pkg) => {
  const safeIsp = normalizeIsp(pkg.isp);
  const host = pkg.serverType === 'LK_IP' ? 'lk-rv2ray.fibez.store' : 'rv2ray.fibez.store';
  return {
    id: pkg.id,
    title: pkg.title,
    isp: safeIsp === 'SLT' ? 'SLT Mobitel Fiber' : `${safeIsp} 4G/5G`,
    ispTag: safeIsp,
    description: pkg.description || `Inbound ${pkg.inboundId || 3} (Port ${pkg.inboundPort || 443}): High-speed carrier bypass tunnel.`,
    sni: pkg.sni,
    port: pkg.inboundPort || 443,
    badge: pkg.badge,
    configUri: buildVlessUri({
      uuid: '00000000-0000-0000-0000-000000000000', // placeholder: catalog cards never carry a working credential
      host,
      port: pkg.inboundPort || 443,
      sni: pkg.sni,
      remark: `Fibez - ${pkg.title}`,
    }),
  };
});

const PACKAGES: V2RayPackage[] = ALL_PACKAGES;


const EMPTY_LINE: PurchasedV2RayLine = {
  id: 'none', orderNumber: '', packageId: '', title: 'No active line', isp: '', ispTag: '', sni: '', port: 443,
  serverType: 'STANDARD', location: '', quotaLabel: '', quotaGB: 0, validityDays: 0, vlessUri: '', uuid: '',
  purchasedAt: new Date(0).toISOString(), status: 'EXPIRED',
};

export default function V2RayDashboardPage() {
  useEffect(() => {
    document.title = "Fibez V2Ray Dash";
  }, []);

  const [purchasedLines, setPurchasedLines] = useState<PurchasedV2RayLine[]>([]);
  const [linesLoaded, setLinesLoaded] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<{ orderNumber: string; title: string; status: string }[]>([]);
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState<{ referralCode: string; referralLink: string; creditValueLKR: number } | null>(null);
  const [walletLkr, setWalletLkr] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeLineId, setActiveLineId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<'netmod' | 'v2box'>('netmod');
  const [activeTab, setActiveTab] = useState<'config' | 'usage' | 'reviews'>('config');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // Real data from the panel (via /api/v2ray/telemetry); nothing is pre-filled.
  const [connections, setConnections] = useState<LineConnection[]>([]);
  const [registeredDevices, setRegisteredDevices] = useState<Record<string, unknown>[]>([]);
  const [limits, setLimits] = useState<{ ip: number; hwid: number }>({ ip: 0, hwid: 0 });
  const [lastOnlineMs, setLastOnlineMs] = useState<number>(0);
  const [liveEnabled, setLiveEnabled] = useState<boolean | null>(null);
  const [usageHistory, setUsageHistory] = useState<{
    series: { date: string; downGB: number; upGB: number; known: boolean }[];
    trackingSince: string | null;
  }>({ series: [], trackingSince: null });

  // QR Code Modal State
  const [activeQrPackage, setActiveQrPackage] = useState<V2RayPackage | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Client Reviews & Speedtests State
  const [reviews, setReviews] = useState<SpeedtestReview[]>(INITIAL_REVIEWS);
  const [reviewIspFilter, setReviewIspFilter] = useState<string>('All');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [clientNameInput, setClientNameInput] = useState<string>('');
  const [ispInput, setIspInput] = useState<string>('Dialog 4G LTE');
  const [packageInput, setPackageInput] = useState<string>('Dialog Zoom Unlimited');
  const [downloadInput, setDownloadInput] = useState<string>('');
  const [pingInput, setPingInput] = useState<string>('');
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);
  const [inspectImage, setInspectImage] = useState<SpeedtestReview | null>(null);
  const [liveUsageGB, setLiveUsageGB] = useState<number | null>(null);
  const [liveServerHost, setLiveServerHost] = useState<string>('rv2ray.fibez.store');

  // User Credential & Line Synchronization State
  const [mountedTime, setMountedTime] = useState<number>(0);
  const [customVlessUri, setCustomVlessUri] = useState<string | null>(null);
  const [customClientUuid, setCustomClientUuid] = useState<string | null>(null);
  const [customClientEmail, setCustomClientEmail] = useState<string | null>(null);
  const [customClientRemark, setCustomClientRemark] = useState<string | null>(null);
  const [isTrialClient, setIsTrialClient] = useState<boolean>(false);
  const [customQuotaGB, setCustomQuotaGB] = useState<number | null>(null);
  const [customExpiryTime, setCustomExpiryTime] = useState<number | null>(null);

  // Fetch telemetry for current client / server (synced with 3x-ui Singapore node)
  const fetchTelemetryForClient = async (identifier?: string) => {
    try {
      const q = identifier ? `?uuid=${encodeURIComponent(identifier)}` : '';
      const res = await fetch(`/api/v2ray/telemetry${q}`);
      const data = await res.json();
      if (data?.success) {
        if (data.server?.host) setLiveServerHost(data.server.host);
        if (data.client) {
          if (data.client.usedGB !== undefined) setLiveUsageGB(data.client.usedGB);
          if (data.client.totalGB !== undefined) setCustomQuotaGB(data.client.totalGB);
          if (data.client.isTrial !== undefined) setIsTrialClient(data.client.isTrial);
          if (data.client.expiryTime) setCustomExpiryTime(data.client.expiryTime);
          if (data.client.uuid && !customClientUuid) setCustomClientUuid(data.client.uuid);
          if (data.client.email && !customClientEmail) setCustomClientEmail(data.client.email);
          if (data.client.clientRemark && !customClientRemark) setCustomClientRemark(data.client.clientRemark);
        }
        setConnections(Array.isArray(data.connections) ? data.connections : []);
        setRegisteredDevices(Array.isArray(data.registeredDevices) ? data.registeredDevices : []);
        if (data.limits) setLimits({ ip: Number(data.limits.ip) || 0, hwid: Number(data.limits.hwid) || 0 });
        setLastOnlineMs(Number(data.lastOnline) || 0);
        if (data.client) setLiveEnabled(data.client.enable !== false);
        if (data.usageHistory) setUsageHistory(data.usageHistory);
      }
    } catch (err) {
      console.warn('Failed to fetch client telemetry:', err);
    }
  };

  const applyVlessCredential = (vlessString: string) => {
    const parsed = parseVlessUri(vlessString);
    if (!parsed) {
      return false;
    }
    setCustomVlessUri(vlessString.trim());
    setCustomClientUuid(parsed.uuid);
    setCustomClientRemark(parsed.remark || null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fibez_active_vless', vlessString.trim());
    }

    // Match package by port, sni, or remark
    const matched = PACKAGES.find((p) => {
      if (parsed.port && p.port === parsed.port && parsed.sni && p.sni.toLowerCase() === parsed.sni.toLowerCase()) {
        return true;
      }
      if (
        parsed.remark &&
        (p.title.toLowerCase().includes(parsed.remark.toLowerCase()) ||
          parsed.remark.toLowerCase().includes(p.ispTag.toLowerCase()))
      ) {
        return true;
      }
      return false;
    });

    if (matched) {
      setSelectedPackageId(matched.id);
    }

    const isTrial =
      (parsed.remark || '').toLowerCase().includes('trial') ||
      (parsed.remark || '').toLowerCase().includes('free') ||
      (parsed.remark || '').includes('24H');
    setIsTrialClient(isTrial);
    if (isTrial) {
      setCustomQuotaGB(10);
    }

    fetchTelemetryForClient(parsed.uuid);
    return true;
  };

  const handleDisconnectCredential = () => {
    setCustomVlessUri(null);
    setCustomClientUuid(null);
    setCustomClientEmail(null);
    setCustomClientRemark(null);
    setIsTrialClient(false);
    setCustomQuotaGB(null);
    setCustomExpiryTime(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fibez_active_vless');
    }
    fetchTelemetryForClient();
  };

  // Load THIS account's lines from the server (never from localStorage / demo data)
  useEffect(() => {
    setMountedTime(Date.now());
    const params = new URLSearchParams(window.location.search);
    const lineIdParam = params.get('lineId');
    const orderParam = params.get('order');
    const tabParam = params.get('tab');
    if (tabParam === 'reviews' || tabParam === 'usage' || tabParam === 'config') {
      setActiveTab(tabParam as 'config' | 'usage' | 'reviews');
    }

    fetch('/api/v2ray/lines', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const lines: PurchasedV2RayLine[] = data?.success && Array.isArray(data.lines) ? data.lines : [];
        setPurchasedLines(lines);
        setPendingOrders(Array.isArray(data?.pendingOrders) ? data.pendingOrders : []);
        let target: PurchasedV2RayLine | undefined = lines[0];
        if (lineIdParam) target = lines.find((l) => l.id === lineIdParam) || target;
        else if (orderParam) {
          target = lines.find((l) => l.orderNumber?.toUpperCase() === orderParam.toUpperCase()) || target;
        }
        if (target) {
          setActiveLineId(target.id);
          setSelectedPackageId(target.packageId);
          setCustomClientUuid(target.uuid);
          fetchTelemetryForClient(target.uuid);
        }
      })
      .catch(() => {})
      .finally(() => setLinesLoaded(true));

    fetch('/api/wallet', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && typeof d.balanceLkr === 'number' && setWalletLkr(d.balanceLkr))
      .catch(() => {});

    fetch('/api/referrals', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success && d.profile) {
          setProfile({
            referralCode: d.profile.referralCode,
            referralLink: d.profile.referralLink,
            creditValueLKR: Number(d.profile.creditValueLKR) || 0,
          });
        }
      })
      .catch(() => {});
  }, [reloadKey]);
  // Handler to switch between user's purchased lines
  const handleSelectLine = (lineId: string) => {
    setActiveLineId(lineId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(V2RAY_ACTIVE_LINE_STORAGE_KEY, lineId);
    }
    const line = purchasedLines.find((l) => l.id === lineId);
    if (line) {
      setSelectedPackageId(line.packageId);
      setCustomClientUuid(line.uuid);
      setCustomVlessUri(line.vlessUri);
      // Clear the previous line's live numbers before loading this one.
      setLiveUsageGB(null);
      setCustomQuotaGB(null);
      setCustomExpiryTime(null);
      setIsTrialClient(false);
      setCustomClientEmail(null);
      setCustomClientRemark(null);
      setLiveEnabled(null);
      setLastOnlineMs(0);
      setConnections([]);
      setRegisteredDevices([]);
      setLimits({ ip: 0, hwid: 0 });
      setUsageHistory({ series: [], trackingSince: null });
      fetchTelemetryForClient(line.uuid);
    }
  };

  // Active purchased line object with all metadata
  const activePurchasedLine: PurchasedV2RayLine = useMemo(() => {
    const found = purchasedLines.find((l) => l.id === activeLineId);
    return found || purchasedLines[0] || EMPTY_LINE;
  }, [purchasedLines, activeLineId]);

  // Active selected package dynamically customized with real client credentials
  const selectedPackage = useMemo(() => {
    const activeUuid = customClientUuid || activePurchasedLine.uuid || '';
    const isLkIp = activePurchasedLine.serverType === 'LK_IP';
    const effectiveHost = isLkIp ? 'lk-rv2ray.fibez.store' : (liveServerHost || 'rv2ray.fibez.store');

    if (customVlessUri) {
      const parsed = parseVlessUri(customVlessUri);
      return {
        id: activePurchasedLine.packageId,
        title: customClientRemark || activePurchasedLine.title,
        isp: activePurchasedLine.isp,
        ispTag: activePurchasedLine.ispTag,
        description: `Inbound ${activePurchasedLine.inboundId || 3} (Port ${parsed?.port || activePurchasedLine.port}): High-speed carrier bypass tunnel.`,
        configUri: customVlessUri,
        port: parsed?.port || activePurchasedLine.port,
        sni: parsed?.sni || activePurchasedLine.sni,
        badge: activePurchasedLine.quotaLabel,
      };
    }

    const uri = activePurchasedLine.vlessUri || buildVlessUri({
      uuid: activeUuid,
      host: effectiveHost,
      port: activePurchasedLine.port,
      sni: activePurchasedLine.sni,
      remark: `Fibez - ${activePurchasedLine.title.split('[')[0].trim()}`,
    });

    return {
      id: activePurchasedLine.packageId,
      title: activePurchasedLine.title,
      isp: activePurchasedLine.isp,
      ispTag: activePurchasedLine.ispTag,
      description: `Inbound ${activePurchasedLine.inboundId || 3} (Port ${activePurchasedLine.port}): High-speed carrier bypass tunnel.`,
      configUri: uri,
      port: activePurchasedLine.port,
      sni: activePurchasedLine.sni,
      badge: activePurchasedLine.quotaLabel,
    };
  }, [activePurchasedLine, customClientUuid, customVlessUri, customClientRemark, liveServerHost]);

  // Quota and usage come from the panel. 0 = unlimited (never invent a limit).
  const totalLimitGB = useMemo(() => {
    if (activePurchasedLine.quotaGB && activePurchasedLine.quotaGB > 0) return activePurchasedLine.quotaGB;
    return customQuotaGB && customQuotaGB > 0 ? customQuotaGB : 0;
  }, [activePurchasedLine, customQuotaGB]);

  const totalUsedGB = liveUsageGB ?? 0;
  const usagePercentage = totalLimitGB > 0 ? Math.min(100, Math.round((totalUsedGB / totalLimitGB) * 100)) : 0;

  // Days until the line expires (null = no expiry set)
  const expiryDaysLeft = useMemo(() => {
    if (!customExpiryTime || customExpiryTime <= 0) return null;
    return Math.ceil((customExpiryTime - (mountedTime || Date.now())) / 86400000);
  }, [customExpiryTime, mountedTime]);

  // Windster 7-Day Usage Telemetry for Client Dashboard
  const [clientUsageRange, setClientUsageRange] = useState<'7d' | '30d'>('7d');

  // Real daily usage derived from stored panel snapshots (see /api/cron/usage-snapshot).
  const clientTelemetryChartData: ChartDataPoint[] = useMemo(() => {
    const days = clientUsageRange === '7d' ? 7 : 14;
    return usageHistory.series.slice(-days).map((d) => ({
      date: new Date(`${d.date}T00:00:00`).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      primaryValue: d.downGB,
      secondaryValue: d.upGB,
    }));
  }, [clientUsageRange, usageHistory]);

  // Dynamic subscription URL tailored to the user's purchased package
  // Dynamic subscription URL tailored to the user's purchased package and connected credentials
  const subBaseUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fibez.store';
    const lineUuid = customClientUuid || activePurchasedLine.uuid;
    if (!lineUuid) return '';
    return `${origin}/api/v2ray/sub?pkg=${encodeURIComponent(selectedPackage.id)}&uuid=${encodeURIComponent(lineUuid)}`;
  }, [selectedPackage.id, customClientUuid, activePurchasedLine.uuid]);
  const subscriptionLink = useMemo(() => {
    return subBaseUrl ? `${subBaseUrl}&client=${selectedClient}&format=base64` : '';
  }, [selectedClient, subBaseUrl]);

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Open QR modal
  const handleOpenQr = async (pkg: V2RayPackage) => {
    setActiveQrPackage(pkg);
    try {
      const url = await QRCode.toDataURL(pkg.configUri, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  // Image dropzone handlers
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setUploadedImagePreview(url);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setUploadedImagePreview(url);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedImagePreview || !downloadInput || !pingInput) return;
    setIsSubmittingReview(true);
    setTimeout(() => {
      let ispCat: SpeedtestReview['ispCategory'] = 'Other';
      if (ispInput.toLowerCase().includes('dialog')) ispCat = 'Dialog';
      else if (ispInput.toLowerCase().includes('slt')) ispCat = 'SLT';
      else if (ispInput.toLowerCase().includes('mobitel')) ispCat = 'Mobitel';
      else if (ispInput.toLowerCase().includes('airtel')) ispCat = 'Airtel';
      else if (ispInput.toLowerCase().includes('hutch')) ispCat = 'Hutch';

      const newRev: SpeedtestReview = {
        id: `rev-client-${Date.now()}`,
        clientName: clientNameInput.trim() || 'Customer',
        isp: ispInput,
        ispCategory: ispCat,
        packageTitle: packageInput,
        downloadMbps: parseFloat(downloadInput),
        pingMs: parseInt(pingInput, 10),
        rating: ratingInput,
        comment: commentInput.trim(),
        date: 'Just now',
        imageSrc: uploadedImagePreview || '',
        verified: false,
      };

      setReviews((prev) => [newRev, ...prev]);
      setIsSubmittingReview(false);
      setReviewSuccessMessage('Speedtest screenshot verified & published to community showcase!');
      setUploadedImagePreview(null);
      setDownloadInput('');
      setPingInput('');
      setCommentInput('');
      setTimeout(() => setReviewSuccessMessage(null), 5000);
    }, 600);
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (reviewIspFilter === 'All') return reviews;
    return reviews.filter((r) => r.ispCategory === reviewIspFilter);
  }, [reviews, reviewIspFilter]);

  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Account';
  const referralUrl = profile
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://fibez.store'}/register?ref=${profile.referralCode}`
    : '';

  if (!linesLoaded) {
    return (
      <div className="min-h-screen bg-black text-zinc-400 pt-32 text-center font-mono text-xs">
        Loading your lines...
      </div>
    );
  }

  if (purchasedLines.length === 0) {
    return (
      <div className="min-h-screen bg-black text-[#ededed] pt-32 pb-24 px-4">
        <div className="max-w-xl mx-auto text-center p-8 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23]">
          <h1 className="text-xl font-bold text-white">No V2Ray lines on {session?.user?.email || 'this account'} yet</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Lines appear here after an order is approved, or when you claim a free trial.
          </p>
          {pendingOrders.length > 0 && (
            <div className="mt-5 text-left p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs font-mono text-amber-300 mb-2">Your orders waiting for approval</div>
              {pendingOrders.map((o) => (
                <div key={o.orderNumber + o.title} className="text-xs text-zinc-300 flex justify-between gap-3">
                  <span className="truncate">{o.orderNumber} - {o.title}</span>
                  <span className="text-amber-300 shrink-0">{o.status}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/v2ray" className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-mono font-semibold">
              Browse V2Ray plans
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono">
              Account dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed] pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#a1a4a5] mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link href="/v2ray" className="hover:text-white transition-colors">V2Ray Hub</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#3ad389] flex items-center gap-1.5 font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Fibez V2Ray Dash
          </span>
        </div>

        {/* Dashboard Top Header */}
        <div className="pb-4">
          <LayoutTextFlip
            text="Welcome to "
            words={[
              "Fibez V2Ray",
              "Abroad",
              "Singapore Tier-1 Node",
              "Airflight"
            ]}
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#1f1f23]">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#3ad389] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#3ad389] animate-ping" />
              <span>Singapore Tier-1 VLESS Gateway</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0c0c0e] border border-white/15 flex items-center justify-center p-2 shadow-lg shadow-[#3ad389]/20 shrink-0">
                <img
                  src="/logo-mark.png"
                  alt="Fibez"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              <div className="h-[44px] sm:h-[52px] w-[270px] sm:w-[360px] relative -ml-1">
                <h1 className="sr-only">Fibez V2Ray Dash</h1>
                <TechText
                  text="Fibez V2Ray Dash"
                  align="left"
                  fontWeight={700}
                  fontSize={38}
                  color="#ffffff"
                  accentColor="#3ad389"
                  reveal="letter"
                  dashLength={4}
                  dashGap={2}
                  specks={12}
                  intro="none"
                  clickKick
                  guides={false}
                />
              </div>
            </div>
            <p className="text-sm text-[#a1a4a5] mt-2.5 max-w-2xl leading-relaxed">
              Your personalized VLESS connection config, live server speed benchmark, and real-time device usage telemetry.
            </p>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 0. MEMBER PROFILE & PRE-FUNDED WALLET STATUS (VMex Style) */}
        {/* ======================================================== */}
        <section className="mt-8 p-6 rounded-[20px] bg-gradient-to-b from-[#0e0e12] to-[#070709] border border-[#1f1f23] shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* User Identity & Member ID */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#141418] border border-[#2b2b35] flex items-center justify-center text-[#3ad389] font-mono text-xl font-bold shadow-inner shrink-0">
                <User className="w-7 h-7 text-[#3ad389]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3ad389]/10 border border-[#3ad389]/20 text-[11px] font-mono font-semibold text-[#3ad389]">
                    Fibez Account
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#16161b] border border-[#252530] text-[10px] font-mono text-zinc-400">
                    ID: {String(session?.user?.id || '').slice(0, 8)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                    Verified Customer
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <h2 className="text-xl font-bold text-white tracking-tight">{displayName}</h2>
                  <span className="text-xs font-mono text-zinc-500">/ {session?.user?.email}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pre-funded billing account &middot; Commercial Bank Direct Settlement
                </p>
              </div>
            </div>

            {/* Wallet Balance & Configurations Grid */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Wallet Balance Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#0c0c0f] border border-[#24242d] flex items-center gap-3.5 min-w-[200px]">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a22] border border-[#2e2e3a] flex items-center justify-center text-emerald-400 shrink-0">
                  <Wallet className="w-5 h-5 text-[#3ad389]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Wallet Balance</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                    <span>Rs {walletLkr.toLocaleString()}</span>
                    <span className="text-[11px] font-normal text-zinc-400">LKR</span>
                  </div>
                </div>
                <AnimatedButton
                  as="a"
                  href="/billing"
                  variant="emerald"
                  size="sm"
                  className="ml-auto text-xs font-semibold font-mono"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </AnimatedButton>
              </div>

              {/* Active Configurations Counter */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#0c0c0f] border border-[#24242d] flex items-center gap-3.5 min-w-[170px]">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a22] border border-[#2e2e3a] flex items-center justify-center text-blue-400 shrink-0">
                  <Layers className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Active Configs</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {purchasedLines.length} <span className="text-xs font-normal text-zinc-400">/ {purchasedLines.length}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {purchasedLines.length > 0 ? 'Active lines' : 'No purchased lines'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Reward Banner Strip */}
          <div className="mt-5 pt-4 border-t border-[#18181f] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Gift className="w-4 h-4 text-[#ffca16] shrink-0" />
              <div className="text-zinc-300">
                <span className="font-semibold text-white">Earn Rs 100.00 Wallet Credit</span> per friend who subscribes using your referral link.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-[#070709] border border-[#202028] font-mono text-[11px] text-zinc-300 select-all truncate max-w-[280px] sm:max-w-none">
                {referralUrl || 'Loading your referral link...'}
              </div>
              <button
                type="button"
                onClick={() => referralUrl && copyToClipboard(referralUrl, 'referral-link')}
                className="px-3 py-1.5 rounded-lg bg-[#18181f] hover:bg-[#23232c] border border-[#282833] text-zinc-200 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {copiedKey === 'referral-link' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#3ad389]" />
                    <span className="text-[#3ad389]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 1. LINE STATUS (live from the panel)                      */}
        {/* ======================================================== */}
        <section className="mt-8 p-6 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-[10px] bg-[#16161a] border border-[#26262b] flex items-center justify-center text-[#3ad389]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white">Line status</h3>
              <p className="text-xs text-[#a1a4a5] mt-0.5">Read directly from the V2Ray panel for your line.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-[14px] bg-[#070709] border border-[#1b1b20]">
              <div className="text-xs font-mono text-zinc-400">Status</div>
              <div className="text-xl font-mono font-semibold text-white mt-1">
                {liveEnabled === null ? '—' : !liveEnabled ? 'Disabled' : expiryDaysLeft !== null && expiryDaysLeft <= 0 ? 'Expired' : connections.some((c) => c.status === 'online') ? 'Online' : 'Idle'}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {lastOnlineMs ? `Last online ${new Date(lastOnlineMs).toLocaleString()}` : 'No connection seen yet'}
              </div>
            </div>
            <div className="p-4 rounded-[14px] bg-[#070709] border border-[#1b1b20]">
              <div className="text-xs font-mono text-zinc-400">Data used</div>
              <div className="text-xl font-mono font-semibold text-white mt-1">
                {liveUsageGB === null ? '—' : `${liveUsageGB} GB`}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {customQuotaGB === null ? '' : customQuotaGB === 0 ? 'Unlimited plan' : `of ${customQuotaGB} GB`}
              </div>
            </div>
            <div className="p-4 rounded-[14px] bg-[#070709] border border-[#1b1b20]">
              <div className="text-xs font-mono text-zinc-400">Expires</div>
              <div className="text-xl font-mono font-semibold text-white mt-1">
                {expiryDaysLeft === null ? 'No expiry' : expiryDaysLeft <= 0 ? 'Expired' : `${expiryDaysLeft} day${expiryDaysLeft === 1 ? '' : 's'}`}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {customExpiryTime ? new Date(customExpiryTime).toLocaleDateString() : ''}
              </div>
            </div>
            <div className="p-4 rounded-[14px] bg-[#070709] border border-[#1b1b20]">
              <div className="text-xs font-mono text-zinc-400">Devices</div>
              <div className="text-xl font-mono font-semibold text-white mt-1">
                {registeredDevices.length}
                {limits.hwid > 0 ? ` / ${limits.hwid}` : ''}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {limits.ip > 0 ? `${limits.ip} IP${limits.ip > 1 ? 's' : ''} at a time` : 'No IP limit'}
              </div>
            </div>
          </div>
        </section>

        {/* Line switcher: sits above the tabs because it drives config, usage and devices */}
        {purchasedLines.length > 0 && (
          <div className="mt-8 p-4 sm:p-5 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23] shadow-xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#3ad389]/10 border border-[#3ad389]/20 flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4 text-[#3ad389]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      My Purchased V2Ray Lines ({purchasedLines.length})
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#3ad389]/10 text-[#3ad389] border border-[#3ad389]/20 font-bold">
                      Multi-Line Switcher
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Pick a line: the config, usage and devices below all follow the line you select.
                  </p>
                </div>
              </div>

              <Link
                href="/v2ray"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3ad389] hover:bg-[#32be7a] text-black shadow-md shadow-[#3ad389]/15 transition-all self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Buy Another Line</span>
              </Link>
            </div>

            {/* Line Selection Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              {purchasedLines.map((line, idx) => {
                const isCurrent = line.id === activeLineId;
                return (
                  <button
                    key={line.id}
                    onClick={() => handleSelectLine(line.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0 ${
                      isCurrent
                        ? 'bg-[#18181f] text-white border border-[#3ad389] shadow-md shadow-[#3ad389]/15 font-bold'
                        : 'bg-[#121215] text-zinc-400 hover:text-white border border-[#1f1f23] hover:border-zinc-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-[#3ad389] animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="font-semibold text-white">Line {idx + 1}: {line.title.split('(')[0].trim()}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-400">
                      {line.ispTag} • Port {line.port}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3 Focused Main Tabs: V2Ray Config, Usage & Reviews */}
        <div className="flex items-center gap-2 mt-6 border-b border-[#1f1f23] pb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2.5 px-6 py-3 text-xs sm:text-sm font-mono uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-[#3ad389] text-white font-medium bg-white/[0.03]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-[#3ad389]" />
            <span>V2Ray Config</span>
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-2.5 px-6 py-3 text-xs sm:text-sm font-mono uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'usage'
                ? 'border-[#3ad389] text-white font-medium bg-white/[0.03]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gauge className="w-4 h-4 text-[#3ad389]" />
            <span>Usage &amp; Devices</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#3ad389]/10 text-[#3ad389] text-[10px] border border-[#3ad389]/20">
              {connections.filter((c) => c.status === 'online').length} Online
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2.5 px-6 py-3 text-xs sm:text-sm font-mono uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-[#3ad389] text-white font-medium bg-white/[0.03]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Star className="w-4 h-4 text-[#ffca16]" />
            <span>Reviews &amp; Drop SS</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#ffca16]/10 text-[#ffca16] text-[10px] border border-[#ffca16]/20">
              {reviews.length} Verified
            </span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: V2RAY CONFIG (Purchased Plan & Dedicated URI) */}
        {/* ======================================================== */}
        {activeTab === 'config' && (
          <div className="mt-8 space-y-6">
            {/* Active Purchased Subscription Profile (Locked to user's purchased order) */}
            <div className="p-6 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#18181c]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-[12px] bg-[#141418] border border-[#24242b] flex items-center justify-center text-[#3ad389] shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#3ad389]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#3ad389] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389] animate-pulse" />
                        {isTrialClient ? '24-Hour Free Trial Line' : 'Active Purchased Package'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#17171d] border border-[#272733] text-[10px] font-mono text-zinc-300">
                        {isTrialClient ? 'Trial (2 Devices / 10 GB)' : (customClientUuid ? `Client: ${customClientUuid.slice(0, 8)}...` : `Order #${activePurchasedLine.orderNumber}`)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#3ad389]/10 border border-[#3ad389]/20 text-[10px] font-mono text-[#3ad389]">
                        {activePurchasedLine.quotaLabel}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-normal text-white mt-1">
                      {activePurchasedLine.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-[8px] bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-[#3ad389] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                    <span>{isTrialClient ? '24 Hours Validity' : `${activePurchasedLine.validityDays} Days Active`}</span>
                  </span>
                  <Link
                    href="/v2ray"
                    className="px-3 py-1 rounded-[8px] bg-[#16161a] hover:bg-[#202026] border border-[#26262d] text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                  >
                    <span>{isTrialClient ? 'Upgrade VIP' : 'Add New Line'}</span>
                  </Link>
                </div>
              </div>

              <LineActions line={activePurchasedLine} onChanged={() => setReloadKey((k) => k + 1)} />

              {/* Package Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
                <div className="p-3.5 rounded-[12px] bg-[#070709] border border-[#1b1b20]">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Target ISP</div>
                  <div className="text-xs font-mono font-medium text-white mt-1">
                    {activePurchasedLine.isp}
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-[#070709] border border-[#1b1b20]">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">SNI Masquerade</div>
                  <div className="text-xs font-mono font-medium text-[#3ad389] mt-1 truncate">
                    {activePurchasedLine.sni}
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-[#070709] border border-[#1b1b20]">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Node &amp; Uplink</div>
                  <div className="text-xs font-mono font-medium text-white mt-1">
                    {activePurchasedLine.serverType === 'LK_IP' ? '🇱🇰 lk-rv2ray.fibez.store (LK IP)' : '🇸🇬 rv2ray.fibez.store'}
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-[#070709] border border-[#1b1b20]">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Security &amp; Port</div>
                  <div className="text-xs font-mono font-medium text-white mt-1">
                    VLESS TLS • Port {activePurchasedLine.port}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Config Copy Box */}
            <div className="p-6 rounded-[20px] bg-gradient-to-b from-[#0e0e11] to-[#070709] border border-[#26262b] shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#3ad389] uppercase tracking-wider mb-1">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Your VLESS Connection Config</span>
                  </div>
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <span>🇸🇬 {selectedPackage.title}</span>
                  </h3>
                  <p className="text-xs text-[#a1a4a5] mt-1">
                    {selectedPackage.description}
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2">
                  <AnimatedButton
                    variant="emerald"
                    size="md"
                    onClick={() => copyToClipboard(selectedPackage.configUri, 'hero-copy')}
                    className="text-xs font-semibold"
                  >
                    {copiedKey === 'hero-copy' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy VLESS Config</span>
                      </>
                    )}
                  </AnimatedButton>

                  <AnimatedButton
                    variant="default"
                    size="md"
                    onClick={() => handleOpenQr(selectedPackage)}
                    className="font-mono text-xs text-white"
                  >
                    <QrIcon className="w-4 h-4 text-zinc-300" />
                    <span>Scan QR</span>
                  </AnimatedButton>
                </div>
              </div>

              {/* Raw Config Code Display */}
              <div className="relative group">
                <pre className="p-4 rounded-[12px] bg-[#050507] border border-[#202025] text-xs font-mono text-[#3ad389]/90 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-all">
                  {selectedPackage.configUri}
                </pre>
              </div>

              {/* 1-Tap Client Launch Links */}
              <div className="mt-4 pt-4 border-t border-[#1a1a1f] flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <span className="text-zinc-400 font-mono text-[11px]">1-Tap Client Launch:</span>
                
                <a
                  href={`v2box://install-sub?url=${encodeURIComponent(selectedPackage.configUri)}&name=${encodeURIComponent('Fibez ' + selectedPackage.ispTag)}`}
                  className="px-3 py-1.5 rounded-[8px] bg-[#121215] border border-[#222227] hover:border-zinc-500 text-zinc-300 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors group"
                >
                  <ExternalLink className="w-3 h-3 text-[#3ad389] group-hover:scale-110 transition-transform" />
                  <span>Open in V2Box (iOS / Mac)</span>
                </a>

                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedPackage.configUri, 'netmod-raw-btn')}
                  className="px-3 py-1.5 rounded-[8px] bg-[#121215] border border-[#222227] hover:border-zinc-500 text-zinc-300 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'netmod-raw-btn' ? (
                    <>
                      <Check className="w-3 h-3 text-[#3ad389]" />
                      <span className="text-[#3ad389]">Copied for NetMod!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#3ad389]" />
                      <span>Copy for NetMod (PC &amp; Android)</span>
                    </>
                  )}
                </button>

                <Link
                  href="/v2ray/guide"
                  className="px-3 py-1.5 rounded-[8px] bg-[#121215] border border-[#222227] hover:border-zinc-500 text-zinc-400 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors ml-auto"
                >
                  <span>NetMod &amp; V2Box Setup Guide</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Auto-Sync Universal Subscription (One Link to Sync VLESS) */}
            <div className="p-6 rounded-[20px] bg-gradient-to-b from-[#0e0e11] to-[#070709] border border-[#26262b] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#3ad389]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#3ad389] uppercase tracking-wider mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Auto-Sync Universal Subscription</span>
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    One Link to Sync Your {selectedPackage.ispTag} Package
                  </h3>
                  <p className="text-xs text-[#a1a4a5] mt-1">
                    Import this link into NetMod (Windows &amp; Android) or V2Box (iOS &amp; Mac) to automatically pull fresh configs whenever server settings update.
                  </p>
                </div>

                {/* Client App Switcher: NetMod & V2Box */}
                <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-[#151518] border border-[#26262b] self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedClient('netmod')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-[7px] transition-all flex items-center gap-1.5 ${
                      selectedClient === 'netmod'
                        ? 'bg-[#2b2b32] text-white shadow-sm font-medium border border-white/10'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 text-[#3ad389]" />
                    <span>NetMod</span>
                    <span className="text-[10px] text-zinc-400 hidden sm:inline">(PC / Android)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedClient('v2box')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-[7px] transition-all flex items-center gap-1.5 ${
                      selectedClient === 'v2box'
                        ? 'bg-[#2b2b32] text-white shadow-sm font-medium border border-white/10'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#3ad389]" />
                    <span>V2Box</span>
                    <span className="text-[10px] text-zinc-400 hidden sm:inline">(iOS / Mac)</span>
                  </button>
                </div>
              </div>

              {/* Subscription URL Field */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#050507] p-2 rounded-[14px] border border-[#202025]">
                <div className="flex-1 font-mono text-xs text-zinc-300 px-3 py-2 truncate select-all">
                  {subscriptionLink}
                </div>
                
                <AnimatedButton
                  variant="emerald"
                  size="sm"
                  onClick={() => copyToClipboard(subscriptionLink, 'sub-url')}
                  className="font-medium text-xs whitespace-nowrap shadow-lg shadow-[#3ad389]/15"
                >
                  {copiedKey === 'sub-url' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Subscription URL</span>
                    </>
                  )}
                </AnimatedButton>
              </div>

              {/* 1-Tap Client Launch Links */}
              <div className="mt-4 pt-4 border-t border-[#1a1a1f] flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <span className="text-zinc-400 font-mono text-[11px]">1-Tap Client Import:</span>
                
                <a
                  href={`v2box://install-sub?url=${encodeURIComponent(subscriptionLink)}&name=${encodeURIComponent('Fibez ' + selectedPackage.ispTag)}`}
                  className="px-2.5 py-1 rounded-[8px] bg-[#121215] border border-[#222227] hover:border-zinc-500 text-zinc-300 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors group"
                >
                  <ExternalLink className="w-3 h-3 text-[#3ad389] group-hover:scale-110 transition-transform" />
                  <span>V2Box (1-Tap iOS / Mac)</span>
                </a>

                <button
                  type="button"
                  onClick={() => copyToClipboard(subscriptionLink, 'netmod-sub-quick')}
                  className="px-2.5 py-1 rounded-[8px] bg-[#121215] border border-[#222227] hover:border-zinc-500 text-zinc-300 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'netmod-sub-quick' ? (
                    <>
                      <Check className="w-3 h-3 text-[#3ad389]" />
                      <span className="text-[#3ad389]">Copied for NetMod!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#3ad389]" />
                      <span>NetMod (Copy Subscription)</span>
                    </>
                  )}
                </button>

                <Link
                  href="/v2ray/guide"
                  className="px-2.5 py-1 rounded-[8px] bg-[#121215] border border-[#222227] hover:border-zinc-500 text-zinc-400 hover:text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors ml-auto"
                >
                  <span>NetMod &amp; V2Box Setup Guide</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: USAGE & CONNECTED DEVICES                     */}
        {/* ======================================================== */}
        {activeTab === 'usage' && (
          <div className="mt-8 space-y-6">
            {/* Top Telemetry & Bandwidth Meter */}
            <div className="p-6 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#3ad389] uppercase tracking-wider mb-1">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Account Quota</span>
                  </div>
                  <h3 className="text-2xl font-normal text-white">
                    {totalUsedGB} GB <span className="text-sm font-normal text-zinc-400">{totalLimitGB > 0 ? `used of ${totalLimitGB} GB total` : 'used · unlimited plan'}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-[#ffca16]" />
                      <span>Plan Validity</span>
                    </div>
                    <div className="text-lg font-mono font-semibold text-white mt-0.5">
                      {expiryDaysLeft === null ? 'No expiry' : expiryDaysLeft <= 0 ? 'Expired' : `${expiryDaysLeft} day${expiryDaysLeft === 1 ? '' : 's'} left`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#16161a] h-3 rounded-full overflow-hidden border border-[#242429]">
                <div 
                  className="bg-gradient-to-r from-[#3ad389] to-[#2fb373] h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mt-2.5">
                <span>{totalLimitGB > 0 ? `${usagePercentage}% Quota Consumed` : 'No data cap'}</span>
                <span>{totalLimitGB > 0 ? `${Math.max(0, totalLimitGB - totalUsedGB).toFixed(1)} GB Remaining` : ''}</span>
              </div>
            </div>

            {/* Daily data usage (real: derived from stored panel snapshots) */}
            <DailyUsageBars series={usageHistory.series} trackingSince={usageHistory.trackingSince} />

            {/* Connections (real: panel IP log) and registered devices */}
            <div className="p-6 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23]">
              <div className="mb-5 pb-4 border-b border-[#18181c]">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <span>Connections</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#3ad389]/10 text-[#3ad389] text-xs font-mono border border-[#3ad389]/20">
                    {connections.filter((c) => c.status === 'online').length} online
                  </span>
                </h3>
                <p className="text-xs text-[#a1a4a5] mt-1">
                  IP addresses the panel has seen on your line. The panel does not report device names or per-device speed.
                </p>
              </div>

              <div className="space-y-3">
                {connections.map((c) => (
                  <div
                    key={c.ip}
                    className="p-4 rounded-[14px] bg-[#070709] border border-[#1b1b20] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white">{c.ip}</span>
                        <span
                          className={`px-2 py-0.5 rounded-[6px] text-[10px] font-mono flex items-center gap-1 ${
                            c.status === 'online'
                              ? 'bg-[#3ad389]/10 text-[#3ad389] border border-[#3ad389]/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'online' ? 'bg-[#3ad389]' : 'bg-zinc-500'}`} />
                          {c.status === 'online' ? 'Online now' : 'Seen'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-1">
                        {c.isp ? `Likely ${c.isp}` : 'Carrier unknown'}
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">{c.lastSeen ? `Last seen ${c.lastSeen}` : ''}</div>
                  </div>
                ))}
                {connections.length === 0 && (
                  <div className="text-center py-6 text-zinc-500 text-xs font-mono">
                    No connections recorded yet. Import your config and connect to see it here.
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#18181c]">
                <div className="text-sm font-medium text-white mb-2">
                  Registered devices {limits.hwid > 0 ? `(${registeredDevices.length} of ${limits.hwid})` : `(${registeredDevices.length})`}
                </div>
                {registeredDevices.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-mono">
                    {limits.hwid > 0 ? 'No device has registered with this line yet.' : 'This line has no device limit.'}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {registeredDevices.map((d, i) => (
                      <li key={i} className="text-xs font-mono text-zinc-300 px-3 py-2 rounded-lg bg-[#070709] border border-[#1b1b20] break-all">
                        {String(d.deviceModel || d.name || d.model || d.hwid || d.id || `Device ${i + 1}`)}
                        {d.os ? ` · ${String(d.os)}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: REVIEWS & CLIENT SPEEDTEST SCREENSHOTS DROP   */}
        {/* ======================================================== */}
        {activeTab === 'reviews' && (
          <div className="mt-8 space-y-8">
            {/* Top Stat Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-[14px] bg-[#0c0c0e] border border-[#1f1f23]">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Verified Tests</div>
                <div className="text-xl sm:text-2xl font-mono font-semibold text-white mt-1">
                  {reviews.length} <span className="text-xs font-normal text-zinc-500">Speedtests</span>
                </div>
                <div className="text-[10px] font-mono text-[#3ad389] mt-0.5">100% Sri Lankan Clients</div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#0c0c0e] border border-[#1f1f23]">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Average Download</div>
                <div className="text-xl sm:text-2xl font-mono font-semibold text-white mt-1">
                  {(reviews.reduce((acc, r) => acc + r.downloadMbps, 0) / reviews.length).toFixed(1)}{' '}
                  <span className="text-xs font-normal text-zinc-500">Mbps</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 mt-0.5">Peak at 412 Mbps (5G)</div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#0c0c0e] border border-[#1f1f23]">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Average Latency</div>
                <div className="text-xl sm:text-2xl font-mono font-semibold text-white mt-1">
                  {Math.round(reviews.reduce((acc, r) => acc + r.pingMs, 0) / reviews.length)}{' '}
                  <span className="text-xs font-normal text-zinc-500">ms</span>
                </div>
                <div className="text-[10px] font-mono text-[#3ad389] mt-0.5">Direct SG BGP Ingress</div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#0c0c0e] border border-[#1f1f23]">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Satisfaction</div>
                <div className="text-xl sm:text-2xl font-mono font-semibold text-[#ffca16] mt-1 flex items-center gap-1.5">
                  <span>5.0</span>
                  <div className="flex items-center text-[#ffca16]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 mt-0.5">Based on client reports</div>
              </div>
            </div>

            {/* Notification Banner when user submits review */}
            {reviewSuccessMessage && (
              <div className="p-4 rounded-[14px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-4 h-4 text-[#3ad389] shrink-0" />
                <span className="flex-1">{reviewSuccessMessage}</span>
                <button 
                  onClick={() => setReviewSuccessMessage(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Client Screenshot Dropzone & Form */}
            <div className="p-6 sm:p-8 rounded-[20px] bg-gradient-to-b from-[#0e0e12] to-[#070709] border border-[#26262d] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#3ad389]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-3xl mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-[#3ad389] uppercase tracking-wider mb-1">
                  <UploadCloud className="w-4 h-4" />
                  <span>Client Screenshot Dropzone</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-normal text-white">
                  Drop Your Speedtest Screenshot
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Tested your VLESS connection on NetMod or v2rayNG? Drag &amp; drop your Ookla Speedtest screenshot here to showcase your speeds to the community.
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Drag and Drop Area */}
                  <div className="lg:col-span-6">
                    <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-2">
                      Speedtest Screenshot (PNG or JPEG)
                    </label>

                    {uploadedImagePreview ? (
                      <div className="relative rounded-[16px] border border-[#3ad389]/40 bg-[#09090c] p-2 overflow-hidden group">
                        <img
                          src={uploadedImagePreview}
                          alt="Speedtest Preview"
                          className="w-full h-56 object-cover rounded-[12px]"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setUploadedImagePreview(null)}
                            className="px-3 py-1.5 rounded-[8px] bg-red-500/20 border border-red-500/40 text-red-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Image</span>
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur text-[10px] font-mono text-[#3ad389] border border-[#3ad389]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Image Loaded</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        className={`relative rounded-[16px] border-2 border-dashed p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[224px] ${
                          isDragging
                            ? 'border-[#3ad389] bg-[#3ad389]/5 scale-[0.99]'
                            : 'border-[#26262d] hover:border-[#3ad389]/50 bg-[#09090c]'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 rounded-full bg-[#141418] border border-[#26262d] flex items-center justify-center text-zinc-400 group-hover:text-white mb-3">
                          <UploadCloud className="w-6 h-6 text-[#3ad389]" />
                        </div>
                        <div className="text-sm font-medium text-white mb-1">
                          Drop screenshot here, or <span className="text-[#3ad389] underline underline-offset-4">browse files</span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">
                          Supports PNG, JPEG, WebP from Speedtest.net or Fast.com
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Fields */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name / Handle */}
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                          Your Nickname / Handle
                        </label>
                        <input
                          type="text"
                          value={clientNameInput}
                          onChange={(e) => setClientNameInput(e.target.value)}
                          placeholder="e.g. Nipuna_Colombo"
                          className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#09090c] border border-[#26262d] focus:border-[#3ad389] focus:outline-none text-xs font-mono text-white placeholder-zinc-600 transition-colors"
                        />
                      </div>

                      {/* ISP Network */}
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                          ISP Network
                        </label>
                        <select
                          value={ispInput}
                          onChange={(e) => setIspInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#09090c] border border-[#26262d] focus:border-[#3ad389] focus:outline-none text-xs font-mono text-white transition-colors"
                        >
                          <option value="Dialog 4G LTE">Dialog 4G LTE</option>
                          <option value="Dialog 5G Trial">Dialog 5G Trial</option>
                          <option value="SLT Mobitel Fiber">SLT Mobitel Fiber</option>
                          <option value="Mobitel 4G LTE">Mobitel 4G LTE</option>
                          <option value="Airtel 4G">Airtel 4G</option>
                          <option value="Hutch 4G">Hutch 4G</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Package Name */}
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                          Purchased Package
                        </label>
                        <select
                          value={packageInput}
                          onChange={(e) => setPackageInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#09090c] border border-[#26262d] focus:border-[#3ad389] focus:outline-none text-xs font-mono text-white transition-colors"
                        >
                          <option value="Dialog Zoom Unlimited">Dialog Zoom Unlimited</option>
                          <option value="SLT YouTube Unlimited">SLT YouTube Unlimited</option>
                          <option value="SLT Work & Learn">SLT Work &amp; Learn</option>
                          <option value="Mobitel Gaming Profile">Mobitel Gaming Profile</option>
                          <option value="Singapore VIP Direct">Singapore VIP Direct</option>
                        </select>
                      </div>

                      {/* Speed Metrics */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                            Down (Mbps)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={downloadInput}
                            onChange={(e) => setDownloadInput(e.target.value)}
                            placeholder="e.g. 182.4"
                            className="w-full px-3 py-2.5 rounded-[12px] bg-[#09090c] border border-[#26262d] focus:border-[#3ad389] focus:outline-none text-xs font-mono text-white placeholder-zinc-600 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                            Ping (ms)
                          </label>
                          <input
                            type="number"
                            value={pingInput}
                            onChange={(e) => setPingInput(e.target.value)}
                            placeholder="e.g. 16"
                            className="w-full px-3 py-2.5 rounded-[12px] bg-[#09090c] border border-[#26262d] focus:border-[#3ad389] focus:outline-none text-xs font-mono text-white placeholder-zinc-600 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rating Stars & Comment */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                          Connection Rating
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingInput(star)}
                              className="p-1 focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= ratingInput
                                    ? 'text-[#ffca16] fill-current'
                                    : 'text-zinc-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Share your experience (app used, buffering status, ping in games, router model)..."
                        className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#09090c] border border-[#26262d] focus:border-[#3ad389] focus:outline-none text-xs font-mono text-white placeholder-zinc-600 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview || (!uploadedImagePreview && !downloadInput)}
                      className="w-full py-3 rounded-[12px] bg-[#3ad389] hover:bg-[#34bd7a] text-black font-semibold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#3ad389]/10"
                    >
                      {isSubmittingReview ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Publishing Speedtest...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 fill-current" />
                          <span>Submit Speedtest for Showcase</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Community Gallery / Showcase */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <span>Verified Community Speedtests</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#3ad389] text-[11px] font-mono border border-emerald-500/20">
                      Live Feed
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Click any screenshot card to inspect the full test report in high resolution.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-[#111114] border border-[#202025] overflow-x-auto">
                  {(['All', 'Dialog', 'SLT', 'Mobitel', 'Airtel', 'Hutch'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setReviewIspFilter(cat)}
                      className={`px-3 py-1 rounded-[7px] text-xs font-mono transition-all whitespace-nowrap ${
                        reviewIspFilter === cat
                          ? 'bg-[#26262d] text-white font-medium shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-[18px] bg-[#0c0c0e] border border-[#1f1f23] hover:border-zinc-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: User & Verification */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#16161a] border border-[#26262d] flex items-center justify-center font-mono text-xs font-semibold text-white">
                            {rev.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-white flex items-center gap-1.5">
                              <span>{rev.clientName}</span>
                              {rev.verified && (
                                <span title="Verified Client" className="text-[#3ad389]">
                                  <ShieldCheck className="w-3.5 h-3.5 fill-[#3ad389]/20" />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-zinc-500">{rev.date}</div>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center text-[#ffca16]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>

                      {/* Speedtest Image Preview Thumbnail */}
                      <div
                        onClick={() => setInspectImage(rev)}
                        className="relative rounded-[14px] overflow-hidden border border-[#1e1e24] bg-black/40 h-44 mb-3.5 cursor-pointer group/img"
                      >
                        <img
                          src={rev.imageSrc}
                          alt={`${rev.clientName} Speedtest`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-mono backdrop-blur-[2px]">
                          <Eye className="w-4 h-4 text-[#3ad389]" />
                          <span>Inspect Report</span>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-[6px] bg-black/80 backdrop-blur text-[10px] font-mono text-white border border-white/10">
                          {rev.isp}
                        </div>
                      </div>

                      {/* Speed Metrics Pills */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2.5 rounded-[10px] bg-[#070709] border border-[#1b1b20]">
                          <div className="text-[10px] font-mono text-zinc-400">Download</div>
                          <div className="text-sm font-mono font-semibold text-[#3ad389] mt-0.5">
                            ↓ {rev.downloadMbps} <span className="text-[10px] text-zinc-500">Mbps</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-[10px] bg-[#070709] border border-[#1b1b20]">
                          <div className="text-[10px] font-mono text-zinc-400">Latency / Ping</div>
                          <div className="text-sm font-mono font-semibold text-white mt-0.5">
                            ⚡ {rev.pingMs} <span className="text-[10px] text-zinc-500">ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Review Comment */}
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans mb-3 line-clamp-3">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    {/* Bottom Tags */}
                    <div className="pt-3 border-t border-[#16161b] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span className="truncate max-w-[190px] text-zinc-400">{rev.packageTitle}</span>
                      <button
                        onClick={() => setInspectImage(rev)}
                        className="text-[#3ad389] hover:underline flex items-center gap-1"
                      >
                        <span>Zoom</span>
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredReviews.length === 0 && (
                <div className="text-center py-12 p-8 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] text-zinc-500 text-xs font-mono">
                  No speedtest reports submitted under this network filter yet. Be the first to drop yours!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* High-Resolution Speedtest Screenshot Lightbox Modal */}
      {inspectImage && (
        <div 
          onClick={() => setInspectImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-[24px] bg-[#0e0e11] border border-[#26262b] p-6 shadow-2xl relative cursor-default max-h-[92vh] flex flex-col"
          >
            <button
              onClick={() => setInspectImage(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#18181c] border border-[#2a2a30] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#16161a] border border-[#26262d] flex items-center justify-center font-mono text-sm font-semibold text-white">
                {inspectImage.clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-white">{inspectImage.clientName}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#3ad389] text-[10px] font-mono border border-emerald-500/20">
                    Verified Speedtest
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">
                  {inspectImage.isp} • {inspectImage.packageTitle}
                </div>
              </div>
            </div>

            {/* High Res Image */}
            <div className="rounded-[16px] overflow-hidden border border-[#202026] bg-black flex-1 flex items-center justify-center mb-4 max-h-[60vh]">
              <img
                src={inspectImage.imageSrc}
                alt={`${inspectImage.clientName} Screenshot`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Footer Metrics */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#181820] text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="text-[#3ad389] font-semibold text-sm">
                  ↓ {inspectImage.downloadMbps} Mbps
                </span>
                <span className="text-zinc-400">
                  ⚡ {inspectImage.pingMs} ms Ping
                </span>
                <span className="text-zinc-500">
                  {inspectImage.date}
                </span>
              </div>
              <p className="text-xs text-zinc-300 italic font-sans max-w-md truncate">
                &ldquo;{inspectImage.comment}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* High-Resolution QR Code Modal */}
      {activeQrPackage && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[24px] bg-[#0e0e11] border border-[#26262b] p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setActiveQrPackage(null);
                setQrDataUrl(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#18181c] border border-[#2a2a30] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="text-2xl mb-1">🇸🇬</div>
              <h3 className="text-base font-medium text-white">{activeQrPackage.title}</h3>
              <p className="text-xs font-mono text-[#3ad389] mt-0.5">
                Scan with v2rayNG or Streisand
              </p>
            </div>

            {/* QR Image Box */}
            <div className="bg-white p-4 rounded-[16px] mx-auto w-fit shadow-inner mb-4">
              <img
                src={qrDataUrl}
                alt={`${activeQrPackage.title} QR Code`}
                className="w-56 h-56 mx-auto block"
              />
            </div>

            <div className="text-[11px] font-mono text-zinc-400 text-center mb-4">
              SNI: <span className="text-white">{activeQrPackage.sni}</span> • Port {activeQrPackage.port}
            </div>

            <button
              onClick={() => copyToClipboard(activeQrPackage.configUri, 'modal-copy')}
              className="w-full py-2.5 rounded-[12px] bg-[#3ad389] hover:bg-[#34bd7a] text-black font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copiedKey === 'modal-copy' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Config Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Raw VLESS Config</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
