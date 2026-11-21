'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  LayoutDashboard,
  Gift,
  Receipt,
  Server,
  Package,
  TicketPercent,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Plus,
  AlertTriangle,
  ChevronRight,
  Eye,
  EyeOff,
  Radio,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Layers,
  Database,
  Sliders,
  Share2,
  Trash2,
  RotateCcw,
  Info,
  DollarSign,
  TrendingUp,
  Cpu,
  Globe2,
  Terminal,
  LifeBuoy,
  Activity,
  Wifi,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import TicketCenter from '@/components/TicketCenter';
import WindsterAreaChart, { ChartDataPoint } from '@/components/admin/WindsterAreaChart';
import V2RayThumbnail from '@/components/v2ray/V2RayThumbnail';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Counter } from '@/components/ui/Counter';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { normalizeIsp, V2RayIsp, V2RAY_PLAN_TIERS, LIVE_V2RAY_PACKAGES } from '@/lib/v2ray-catalog';
import { PRODUCTS, ProductItem } from '@/lib/products';
import WalletAdmin from '@/components/admin/WalletAdmin';
import DigitalProductThumbnail, { ProductBrandBadge, resolveBrandMeta } from '@/components/DigitalProductThumbnail';

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  variantTitle?: string;
  quantity: number;
  unitPriceLKR: number;
  subtotalLKR: number;
  dispensedKey?: string | null;
  keyType?: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp?: string | null;
  totalAmountLKR: number;
  totalAmountUSD: number;
  currency: 'LKR' | 'USD';
  paymentMethod: string;
  paymentStatus: 'PENDING_PAYMENT' | 'PENDING_REVIEW' | 'VERIFIED' | 'FAILED' | 'REFUNDED';
  fulfillmentStatus: string;
  receiptImageUrl?: string | null;
  receiptUploadedAt?: string | null;
  bankName?: string | null;
  reviewNotes?: string | null;
  grantType?: string | null;
  renewOrderId?: string | null;
  existingUuid?: string | null;
  referralCode?: string | null;
  receiptAnalysis?: {
    bankName: string;
    bankLogoText: string;
    referenceNumber: string;
    detectedAmountLKR: number | null;
    amountMatches: boolean;
    isDuplicate: boolean;
    duplicateOrderNumber?: string;
    slipType: 'PDF' | 'IMAGE';
    confidenceScore: number;
    notes: string[];
  } | null;
  whatsAppUrl?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface InboundClient {
  id: string;
  inboundId: number;
  email: string;
  enable: boolean;
  totalGB: number | string;
  upGB: number;
  downGB: number;
  usedGB: number;
  expiryTime: string;
}

interface InboundNode {
  id: number;
  port: number;
  protocol: string;
  remark: string;
  enable: boolean;
  upGB: number;
  downGB: number;
  totalTrafficGB: number;
  clients: InboundClient[];
}

interface InventoryItem {
  id: string;
  productId: string;
  productTitle: string;
  matchedProductId?: string;
  productBrand?: string;
  productCategory?: string;
  productRegion?: string;
  productPriceUSD?: number;
  productPriceLKR?: number;
  stockType: string;
  keyPayload: string;
  status: 'AVAILABLE' | 'DISPENSED' | 'RESERVED';
  batchReference?: string;
  dispensedOrderId?: string;
  dispensedToEmail?: string;
  createdAt: string;
}

interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  discountFixedLKR: number;
  minSpendLKR: number;
  maxUses: number;
  timesUsed: number;
  isActive: boolean;
  expiresAt?: string | null;
}

interface PackagePreset {
  id: string;
  name: string;
  inboundId: number;
  sni: string;
  remark: string;
  defaultGB: number;
  tag: string;
}

const PACKAGE_PRESETS: PackagePreset[] = [
  {
    id: 'dialog_zoom',
    name: 'Dialog Zoom & Teams (298 / 724 Router)',
    inboundId: 3,
    sni: 'zoom.us',
    remark: 'Fibez - Dialog Zoom Router',
    defaultGB: 100,
    tag: 'Dialog',
  },
  {
    id: 'dialog_tiktok',
    name: 'Dialog TikTok (297 / 997 Mobile SIM)',
    inboundId: 3,
    sni: 'm.tiktok.com',
    remark: 'Fibez - Dialog TikTok Mobile',
    defaultGB: 100,
    tag: 'Dialog',
  },
  {
    id: 'dialog_social',
    name: 'Dialog Social Media Blaster (#678#)',
    inboundId: 3,
    sni: 'm.facebook.com',
    remark: 'Fibez - Dialog Social Blaster',
    defaultGB: 100,
    tag: 'Dialog',
  },
  {
    id: 'dialog_video',
    name: 'Dialog Video Conferencing (224 / 724)',
    inboundId: 3,
    sni: 'zoom.us',
    remark: 'Fibez - Dialog Video Conferencing',
    defaultGB: 100,
    tag: 'Dialog',
  },
  {
    id: 'slt_meet',
    name: 'SLT Fiber Zoom & Meet (Meet Lite / Max / Flash)',
    inboundId: 1,
    sni: 'zoom.us',
    remark: 'Fibez - SLT Fiber Zoom & Meet',
    defaultGB: 100,
    tag: 'SLT Fiber',
  },
  {
    id: 'slt_netflix',
    name: 'SLT Fiber Netflix & Streaming (1990 Pack)',
    inboundId: 2,
    sni: 'api.netflix.com',
    remark: 'Fibez - SLT Fiber Netflix 4K',
    defaultGB: 100,
    tag: 'SLT Fiber',
  },
  {
    id: 'slt_prepaid_zoom',
    name: 'SLT 4G Prepaid Zoom 235',
    inboundId: 1,
    sni: 'zoom.us',
    remark: 'Fibez - SLT 4G Prepaid Zoom',
    defaultGB: 100,
    tag: 'SLT 4G',
  },
  {
    id: 'airtel_tiktok',
    name: 'Airtel TikTok (297 / 997 Reload)',
    inboundId: 3,
    sni: 'm.tiktok.com',
    remark: 'Fibez - Airtel TikTok Unlimited',
    defaultGB: 100,
    tag: 'Airtel',
  },
  {
    id: 'airtel_youtube',
    name: 'Airtel YouTube (135 / 260 Pack)',
    inboundId: 3,
    sni: 'm.youtube.com',
    remark: 'Fibez - Airtel YouTube Pack',
    defaultGB: 100,
    tag: 'Airtel',
  },
  {
    id: 'hutch_social',
    name: 'Hutch Social Media Blaster',
    inboundId: 3,
    sni: 'm.tiktok.com',
    remark: 'Fibez - Hutch Social Blaster',
    defaultGB: 100,
    tag: 'Hutch',
  },
  {
    id: 'hutch_zoom',
    name: 'Hutch Zoom (224 / 494 / 794)',
    inboundId: 3,
    sni: 'zoom.us',
    remark: 'Fibez - Hutch Zoom Unlimited',
    defaultGB: 100,
    tag: 'Hutch',
  },
  {
    id: 'mobitel_zoom',
    name: 'Mobitel Zoom SIM (Port 4445 / Android IP Hunt)',
    inboundId: 4,
    sni: 'zoom.us',
    remark: 'Fibez - Mobitel Zoom SIM',
    defaultGB: 100,
    tag: 'Mobitel',
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'grant' | 'orders' | 'v2ray' | 'packages' | 'inventory' | 'tickets' | 'coupons' | 'wallet'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [myRole, setMyRole] = useState<'user' | 'admin' | 'owner' | null>(null);
  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setMyRole(d?.user?.role ?? null))
      .catch(() => setMyRole(null));
  }, []);

  // V2Ray Packages Catalog State
  const [adminPackages, setAdminPackages] = useState<any[]>([]);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [packageSavingId, setPackageSavingId] = useState<string | null>(null);
  const [packageIspFilter, setPackageIspFilter] = useState<'ALL' | V2RayIsp>('ALL');

  // Add Package Modal & Form State
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);
  const [newPackage, setNewPackage] = useState<{
    title: string;
    isp: V2RayIsp;
    categoryLabel: string;
    reloadCode: string;
    targetMedium: 'Home Broadband Router' | 'Mobile 4G/5G SIM' | 'Fiber & 4G' | 'Android Only';
    carrierSpeedNote: string;
    sni: string;
    inboundPort: number;
    inboundId: number;
    badge: string;
    isActive: boolean;
    serverType: 'STANDARD' | 'LK_IP';
    standardPriceAdjustmentLKR: number;
  }>({
    title: '',
    isp: 'Dialog',
    categoryLabel: 'Home Broadband',
    reloadCode: '',
    targetMedium: 'Home Broadband Router',
    carrierSpeedNote: 'Unmetered · No Carrier Speed Limit on Routers',
    sni: 'zoom.us',
    inboundPort: 443,
    inboundId: 3,
    badge: '',
    isActive: true,
    serverType: 'STANDARD',
    standardPriceAdjustmentLKR: 0,
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderMetrics, setOrderMetrics] = useState({
    totalOrders: 0,
    pendingReviewCount: 0,
    verifiedCount: 0,
    totalRevenueLKR: 0,
  });
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'VERIFIED' | 'FAILED'>('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [receiptReviewNote, setReceiptReviewNote] = useState('');
  const [orderProcessingId, setOrderProcessingId] = useState<string | null>(null);

  // V2Ray 3x-ui State
  const [inbounds, setInbounds] = useState<InboundNode[]>([]);
  const [v2raySummary, setV2raySummary] = useState({
    inboundsCount: 0,
    totalClients: 0,
    totalUpGB: 0,
    totalDownGB: 0,
    totalTrafficGB: 0,
  });
  const [v2rayPublicHost, setV2rayPublicHost] = useState('rv2ray.fibez.store');
  const [v2rayActionLoading, setV2rayActionLoading] = useState<string | null>(null);

  // Windster Analytics & Filter Controls State
  const [overviewMetricTab, setOverviewMetricTab] = useState<'traffic' | 'revenue'>('traffic');
  const [overviewTimeRange, setOverviewTimeRange] = useState<'7d' | '30d'>('7d');
  const [v2rayTimeRange, setV2rayTimeRange] = useState<'7d' | '30d'>('7d');
  const [v2raySearch, setV2raySearch] = useState('');
  const [v2rayIspFilter, setV2rayIspFilter] = useState<'ALL' | 'DIALOG' | 'SLT' | 'AIRTEL' | 'HUTCH' | 'MOBITEL'>('ALL');
  const [v2rayUsageFilter, setV2rayUsageFilter] = useState<'ALL' | 'UNMETERED' | 'NORMAL' | 'HEAVY' | 'FULL'>('ALL');

  // Quick V2Ray Client Modal
  const [isAddV2rayOpen, setIsAddV2rayOpen] = useState(false);
  const [newV2rayPreset, setNewV2rayPreset] = useState<string>('dialog_zoom');
  const [newV2rayEmail, setNewV2rayEmail] = useState('');
  const [newV2rayInbound, setNewV2rayInbound] = useState(3);
  const [newV2rayQuotaGB, setNewV2rayQuotaGB] = useState(100);
  const [newV2rayDays, setNewV2rayDays] = useState(30);
  const [newV2raySni, setNewV2raySni] = useState('zoom.us');

  // 3x-ui Panel Connection & Auto-Sync State
  const [isConnectXuiOpen, setIsConnectXuiOpen] = useState(false);
  const [xuiBaseUrlInput, setXuiBaseUrlInput] = useState('');
  const [xuiUsernameInput, setXuiUsernameInput] = useState('');
  const [xuiPasswordInput, setXuiPasswordInput] = useState('');
  const [xuiPublicHostInput, setXuiPublicHostInput] = useState('rv2ray.fibez.store');
  const [xuiAutoSyncEnabled, setXuiAutoSyncEnabled] = useState(true);
  const [xuiSyncIntervalSec, setXuiSyncIntervalSec] = useState(30);
  const [xuiConnectionStatus, setXuiConnectionStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('CONNECTED');
  const [xuiLastSyncedAt, setXuiLastSyncedAt] = useState<string | null>(null);
  const [xuiLatencyMs, setXuiLatencyMs] = useState<number>(18);
  const [isTestingXui, setIsTestingXui] = useState(false);
  const [isSavingXui, setIsSavingXui] = useState(false);
  const [xuiModalError, setXuiModalError] = useState<string | null>(null);
  const [showXuiPassword, setShowXuiPassword] = useState(false);

  // Inventory State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [bulkProduct, setBulkProduct] = useState(
    PRODUCTS.find((p) => p.category !== 'vpn')?.id || 'canva-pro-activation'
  );
  const [bulkStockType, setBulkStockType] = useState('INVITE_LINK');
  const [bulkKeysText, setBulkKeysText] = useState('');
  const [bulkBatchRef, setBulkBatchRef] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  // Upgraded Inventory Controls State
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'DISPENSED'>('ALL');
  const [inventoryProductFilter, setInventoryProductFilter] = useState<string>('ALL');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('ALL');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [addStockMode, setAddStockMode] = useState<'bulk' | 'single'>('bulk');
  const [singleKeyInput, setSingleKeyInput] = useState('');
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);
  const [inventoryConfirmModal, setInventoryConfirmModal] = useState<{
    isOpen: boolean;
    mode: 'clear_all' | 'reset_seed' | 'clear_dispensed' | 'single';
    itemId?: string;
    itemTitle?: string;
  }>({ isOpen: false, mode: 'clear_all' });

  // Coupons State
  const [coupons, setCoupons] = useState<PromoCode[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState(10);
  const [newCouponFixedLKR, setNewCouponFixedLKR] = useState(0);
  const [newCouponMinSpend, setNewCouponMinSpend] = useState(1000);
  const [newCouponMaxUses, setNewCouponMaxUses] = useState(100);

  // Grant Product State (The Headline Feature)
  const [grantEmail, setGrantEmail] = useState('');
  const [grantName, setGrantName] = useState('');
  const [grantWhatsapp, setGrantWhatsapp] = useState('');
  const [grantProductId, setGrantProductId] = useState('dialog-zoom-router');
  const [grantVariantTitle, setGrantVariantTitle] = useState('Basic - 150 GB (1 Device)');
  const [grantType, setGrantType] = useState<'FREE_GIFT' | 'MANUAL_CASH' | 'STAFF_GIVEAWAY' | 'WARRANTY_REPLACEMENT'>('FREE_GIFT');
  const [grantNotes, setGrantNotes] = useState('VIP Friend Access - Enjoy!');
  const [grantCustomKey, setGrantCustomKey] = useState('');
  const [grantV2rayInbound, setGrantV2rayInbound] = useState(3);
  const [grantV2raySni, setGrantV2raySni] = useState('zoom.us');
  const [grantV2rayRemark, setGrantV2rayRemark] = useState('Fibez VIP Speedline');
  const [grantV2rayQuota, setGrantV2rayQuota] = useState(100);
  const [grantV2rayDays, setGrantV2rayDays] = useState(30);
  const [grantPlanId, setGrantPlanId] = useState<string>('basic'); // a plan tier id, or 'custom'
  const [grantIpLimit, setGrantIpLimit] = useState(1);
  const [grantHwidLimit, setGrantHwidLimit] = useState(0);
  const [grantLoading, setGrantLoading] = useState(false);
  const [showAdvancedV2Ray, setShowAdvancedV2Ray] = useState(false);
  const [grantSuccessData, setGrantSuccessData] = useState<any | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  // Toast / Feedback message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const copyToClipboard = (text: string, label = 'Copied!') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    showToast(label, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Selected Product for Grant Form
  const selectedGrantProduct = useMemo(() => {
    return PRODUCTS.find((p) => p.id === grantProductId) || PRODUCTS[0];
  }, [grantProductId]);

  // Only packages that are ENABLED in the Packages tab (with your edits and custom packages).
  // Before the list loads, fall back to the built-in catalog.
  const grantPackages = useMemo(
    () => (adminPackages.length > 0 ? adminPackages.filter((p) => p.isActive) : LIVE_V2RAY_PACKAGES),
    [adminPackages]
  );
  const selectedGrantPackage = useMemo(() => grantPackages.find((p: any) => p.id === grantProductId) || null, [grantPackages, grantProductId]);

  // If the selected package gets disabled, move the form to the first enabled one.
  useEffect(() => {
    if (adminPackages.length === 0 || grantPackages.length === 0) return;
    const isLive = LIVE_V2RAY_PACKAGES.some((p) => p.id === grantProductId) || adminPackages.some((p) => p.id === grantProductId);
    if (isLive && !grantPackages.some((p: any) => p.id === grantProductId)) setGrantProductId(grantPackages[0].id);
  }, [adminPackages, grantPackages, grantProductId]);

  const isSelectedProductV2Ray = useMemo(() => {
    if (selectedGrantPackage) return true;
    if (!selectedGrantProduct) return false;
    return (
      selectedGrantProduct.category === 'vpn' ||
      selectedGrantProduct.id.startsWith('v2ray') ||
      selectedGrantProduct.title.toLowerCase().includes('v2ray') ||
      selectedGrantProduct.title.toLowerCase().includes('vless')
    );
  }, [selectedGrantProduct, selectedGrantPackage]);

  // Selecting one of OUR packages fills the inbound / SNI / label from the live catalog.
  useEffect(() => {
    if (!selectedGrantPackage) return;
    setGrantV2rayInbound(selectedGrantPackage.inboundId);
    setGrantV2raySni(selectedGrantPackage.sni);
    setGrantV2rayRemark(`Fibez - ${selectedGrantPackage.title}`);
  }, [selectedGrantPackage]);

  // Selecting a plan tier fills quota / device limits (Custom leaves them for you to type).
  const handleGrantPlanChange = (planId: string) => {
    setGrantPlanId(planId);
    if (planId === 'custom') {
      setGrantVariantTitle('Custom');
      setShowAdvancedV2Ray(true);
      return;
    }
    const plan = V2RAY_PLAN_TIERS.find((x) => x.id === planId);
    if (!plan) return;
    setGrantVariantTitle(` - ${plan.quotaLabel} (${plan.deviceLimit} Device${plan.deviceLimit > 1 ? 's' : ''})`);
    setGrantV2rayQuota(plan.quotaGB); // 0 = unlimited
    setGrantIpLimit(plan.deviceLimit);
    setGrantHwidLimit(0);
  };

  // Legacy product ids only (live packages are handled above)
  useEffect(() => {
    if (selectedGrantPackage) return;
    if (isSelectedProductV2Ray) {
      if (grantProductId.includes('slt-meet') || grantProductId.includes('slt-zoom')) {
        setGrantV2rayInbound(1);
        setGrantV2raySni('teams.microsoft.com');
        setGrantV2rayRemark('Fibez SLT Meet SG Node');
      } else if (grantProductId.includes('netflix') || grantProductId.includes('entertainment')) {
        setGrantV2rayInbound(2);
        setGrantV2raySni('api.netflix.com');
        setGrantV2rayRemark('Fibez SLT Netflix 4K');
      } else if (grantProductId.includes('tiktok')) {
        setGrantV2rayInbound(3);
        setGrantV2raySni('m.tiktok.com');
        setGrantV2rayRemark('Fibez Dialog TikTok Speed');
      } else if (grantProductId.includes('dialog')) {
        setGrantV2rayInbound(3);
        setGrantV2raySni('zoom.us');
        setGrantV2rayRemark('Fibez Dialog Zoom VIP');
      } else if (grantProductId.includes('hutch')) {
        setGrantV2rayInbound(3);
        setGrantV2raySni('zoom.us');
        setGrantV2rayRemark('Fibez Hutch Social VIP');
      } else {
        setGrantV2rayInbound(3);
        setGrantV2raySni('speed.cloudflare.com');
        setGrantV2rayRemark('Fibez Universal SG VIP');
      }
    }
  }, [grantProductId, isSelectedProductV2Ray, selectedGrantPackage]);

  // Load Data
  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      const [ordersRes, v2rayRes, invRes, cpnRes, pkgRes] = await Promise.all([
        fetch('/api/admin/orders').then((r) => r.json()),
        fetch('/api/admin/v2ray').then((r) => r.json()),
        fetch('/api/admin/inventory').then((r) => r.json()),
        fetch('/api/admin/coupons').then((r) => r.json()),
        fetch('/api/admin/packages').then((r) => r.json()),
      ]);

      if (pkgRes.success) {
        setAdminPackages(pkgRes.packages || []);
      }

      if (ordersRes.success) {
        setOrders(ordersRes.orders || []);
        if (ordersRes.metrics) setOrderMetrics(ordersRes.metrics);
      }
      if (v2rayRes.success) {
        setInbounds(v2rayRes.inbounds || []);
        if (v2rayRes.summary) setV2raySummary(v2rayRes.summary);
        if (v2rayRes.publicHost) setV2rayPublicHost(v2rayRes.publicHost);
        if (v2rayRes.xuiConfig) {
          setXuiBaseUrlInput(v2rayRes.xuiConfig.baseUrl || '');
          setXuiUsernameInput(v2rayRes.xuiConfig.username || 'akain');
          setXuiPublicHostInput(v2rayRes.xuiConfig.publicHost || 'rv2ray.fibez.store');
          setXuiAutoSyncEnabled(v2rayRes.xuiConfig.autoSync ?? true);
          setXuiSyncIntervalSec(v2rayRes.xuiConfig.syncIntervalSec || 30);
          setXuiConnectionStatus(v2rayRes.xuiConfig.lastStatus || 'CONNECTED');
          setXuiLastSyncedAt(v2rayRes.xuiConfig.lastSyncedAt || new Date().toISOString());
          if (v2rayRes.xuiConfig.lastLatencyMs) setXuiLatencyMs(v2rayRes.xuiConfig.lastLatencyMs);
        }
      } else if (v2rayRes?.xuiConfig) {
        setXuiConnectionStatus('ERROR');
      }
      if (invRes.success) {
        setInventoryItems(invRes.items || []);
        if (invRes.summary) setStockSummary(invRes.summary);
      }
      if (cpnRes.success) {
        setCoupons(cpnRes.coupons || []);
      }
    } catch (e: any) {
      console.error('Failed to load admin data:', e);
      showToast('Error syncing with backend', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    refreshAllData();
  }, []);

  // Handle Approve / Reject Order
  const handleOrderAction = async (orderNumber: string, action: 'APPROVE' | 'REJECT', notes?: string) => {
    setOrderProcessingId(orderNumber);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          action,
          reviewNotes: notes || receiptReviewNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Order ${orderNumber} updated!`, 'success');
        setSelectedReceiptOrder(null);
        setReceiptReviewNote('');
        refreshAllData();
      } else {
        showToast(data.error || 'Action failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to update order', 'error');
    } finally {
      setOrderProcessingId(null);
    }
  };

  // Handle Grant Product Submit
  const handleGrantProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail || !grantEmail.includes('@')) {
      showToast('Please enter a valid recipient email', 'error');
      return;
    }

    setGrantLoading(true);
    setGrantSuccessData(null);
    setQrCodeDataUrl(null);

    try {
      const res = await fetch('/api/admin/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: grantEmail,
          recipientName: grantName || grantEmail.split('@')[0],
          productId: grantProductId,
          ...(selectedGrantPackage ? { category: 'vpn', productTitle: selectedGrantPackage.title } : {}),
          planId: grantPlanId,
          limitIp: grantIpLimit,
          limitHwid: grantHwidLimit,
          variantTitle: grantVariantTitle,
          grantType,
          staffNotes: grantNotes,
          customKey: grantCustomKey,
          v2rayInboundId: grantV2rayInbound,
          v2raySni: grantV2raySni,
          v2rayRemark: grantV2rayRemark,
          quotaGb: grantV2rayQuota,
          validityDays: grantV2rayDays,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGrantSuccessData(data);
        showToast(`🎉 Granted "${data.productTitle}" to ${data.recipientEmail}!`, 'success');
        refreshAllData();

        // If it's a VLESS URI, generate QR Code
        if (data.dispensedPayload && data.dispensedPayload.startsWith('vless://')) {
          QRCode.toDataURL(data.dispensedPayload, {
            margin: 1,
            width: 280,
            color: { dark: '#000000', light: '#ffffff' },
          }).then((url) => setQrCodeDataUrl(url)).catch(() => {});
        }
      } else {
        showToast(data.error || 'Failed to grant product', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error granting product', 'error');
    } finally {
      setGrantLoading(false);
    }
  };

  // Reset 3x-ui client traffic
  const handleResetV2rayTraffic = async (email: string) => {
    if (!confirm(`Reset bandwidth traffic usage to 0 GB for client ${email}?`)) return;
    setV2rayActionLoading(email);
    try {
      const res = await fetch('/api/admin/v2ray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_traffic', email }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        refreshAllData();
      } else {
        showToast(data.error || 'Reset failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setV2rayActionLoading(null);
    }
  };

  // Delete 3x-ui client
  const handleDeleteV2rayClient = async (email: string) => {
    if (!confirm(`Permanently delete client ${email} from 3x-ui node? This cannot be undone.`)) return;
    setV2rayActionLoading(email);
    try {
      const res = await fetch('/api/admin/v2ray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_client', email }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        refreshAllData();
      } else {
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setV2rayActionLoading(null);
    }
  };

  // Periodic Auto-Sync when on V2Ray Nodes Tab
  useEffect(() => {
    if (!isMounted || activeTab !== 'v2ray' || !xuiAutoSyncEnabled) return;
    const intervalMs = Math.max(10, xuiSyncIntervalSec) * 1000;
    const timer = setInterval(() => {
      fetch('/api/admin/v2ray')
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setInbounds(data.inbounds || []);
            if (data.summary) setV2raySummary(data.summary);
            if (data.xuiConfig) {
              setXuiLastSyncedAt(data.xuiConfig.lastSyncedAt || new Date().toISOString());
              setXuiConnectionStatus('CONNECTED');
              if (data.xuiConfig.lastLatencyMs) setXuiLatencyMs(data.xuiConfig.lastLatencyMs);
            }
          }
        })
        .catch(() => {});
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isMounted, activeTab, xuiAutoSyncEnabled, xuiSyncIntervalSec]);

  // Connect & Save 3x-ui Credentials
  const handleConnectXui = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingXui(true);
    setXuiModalError(null);
    try {
      const res = await fetch('/api/admin/v2ray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect_xui',
          baseUrl: xuiBaseUrlInput.trim(),
          username: xuiUsernameInput.trim(),
          password: xuiPasswordInput.trim() || undefined,
          publicHost: xuiPublicHostInput.trim(),
          autoSync: xuiAutoSyncEnabled,
          syncIntervalSec: xuiSyncIntervalSec,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Connection failed');
      }

      if (data.inbounds) setInbounds(data.inbounds);
      if (data.summary) setV2raySummary(data.summary);
      if (data.latencyMs) setXuiLatencyMs(data.latencyMs);
      setXuiConnectionStatus('CONNECTED');
      setXuiLastSyncedAt(new Date().toISOString());
      if (data.xuiConfig?.publicHost) setV2rayPublicHost(data.xuiConfig.publicHost);
      setIsConnectXuiOpen(false);
      showToast(data.message || 'Successfully connected & synced with 3x-ui Panel!', 'success');
    } catch (err: any) {
      setXuiModalError(err.message || 'Failed to connect');
      setXuiConnectionStatus('ERROR');
      showToast(err.message || 'Connection to 3x-ui failed', 'error');
    } finally {
      setIsSavingXui(false);
    }
  };

  // Test 3x-ui Connection without closing modal
  const handleTestXuiConnection = async () => {
    setIsTestingXui(true);
    setXuiModalError(null);
    try {
      const res = await fetch('/api/admin/v2ray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect_xui',
          baseUrl: xuiBaseUrlInput.trim(),
          username: xuiUsernameInput.trim(),
          password: xuiPasswordInput.trim() || undefined,
          publicHost: xuiPublicHostInput.trim(),
          autoSync: xuiAutoSyncEnabled,
          syncIntervalSec: xuiSyncIntervalSec,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Connection failed');
      }
      if (data.latencyMs) setXuiLatencyMs(data.latencyMs);
      showToast(`Connection Verified! ${data.inbounds?.length || 0} Inbounds active (${data.latencyMs}ms)`, 'success');
    } catch (err: any) {
      setXuiModalError(err.message || 'Connection failed');
      showToast(err.message || 'Test connection failed', 'error');
    } finally {
      setIsTestingXui(false);
    }
  };

  // Trigger Instant Sync All
  const handleTriggerInstantSync = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/v2ray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.inbounds) setInbounds(data.inbounds);
        if (data.summary) setV2raySummary(data.summary);
        if (data.latencyMs) setXuiLatencyMs(data.latencyMs);
        setXuiConnectionStatus('CONNECTED');
        setXuiLastSyncedAt(new Date().toISOString());
        showToast(`Auto-synced ${data.inbounds?.length || inbounds.length} inbounds and ${data.summary?.totalClients || v2raySummary.totalClients} clients from 3x-ui!`, 'success');
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Sync failed', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-Select Package Preset & Inbound SNI sync
  const handlePresetSelect = (presetId: string) => {
    setNewV2rayPreset(presetId);
    const preset = PACKAGE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setNewV2rayInbound(preset.inboundId);
      setNewV2raySni(preset.sni);
      if (preset.defaultGB) setNewV2rayQuotaGB(preset.defaultGB);
    }
  };

  const handleQuickInboundChange = (inboundId: number) => {
    setNewV2rayInbound(inboundId);
    // Auto-update SNI based on selected inbound
    if (inboundId === 1) {
      setNewV2raySni('zoom.us'); // SLT Meet / Zoom
      setNewV2rayPreset('slt_meet');
    } else if (inboundId === 2) {
      setNewV2raySni('api.netflix.com'); // SLT Netflix
      setNewV2rayPreset('slt_netflix');
    } else if (inboundId === 3) {
      // If current SNI was for SLT, switch to Dialog default
      if (newV2raySni === 'api.netflix.com' || newV2raySni === 'meet.google.com') {
        setNewV2raySni('zoom.us');
        setNewV2rayPreset('dialog_zoom');
      }
    } else if (inboundId === 4) {
      setNewV2raySni('zoom.us'); // Mobitel Zoom SIM
      setNewV2rayPreset('mobitel_zoom');
    }
  };

  const handleGrantInboundChange = (inboundId: number) => {
    setGrantV2rayInbound(inboundId);
    if (inboundId === 1) {
      setGrantV2raySni('zoom.us');
      setGrantV2rayRemark('Fibez SLT Meet / Zoom SG Node');
    } else if (inboundId === 2) {
      setGrantV2raySni('api.netflix.com');
      setGrantV2rayRemark('Fibez SLT Netflix 4K');
    } else if (inboundId === 3) {
      if (grantV2raySni === 'api.netflix.com' || grantV2raySni === 'meet.google.com') {
        setGrantV2raySni('zoom.us');
      }
      setGrantV2rayRemark('Fibez Dialog Zoom VIP');
    } else if (inboundId === 4) {
      setGrantV2raySni('zoom.us');
      setGrantV2rayRemark('Fibez Mobitel Zoom VIP');
    }
  };

  // Add Quick V2Ray Client
  const handleAddQuickV2rayClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newV2rayEmail) return;
    setV2rayActionLoading('quick_add');
    try {
      const activePreset = PACKAGE_PRESETS.find((p) => p.id === newV2rayPreset);
      const chosenRemark = activePreset ? `${activePreset.remark} (${newV2rayEmail})` : `Fibez-Node-${newV2rayEmail}`;

      const res = await fetch('/api/admin/v2ray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_client',
          email: newV2rayEmail,
          inboundId: newV2rayInbound,
          totalGB: newV2rayQuotaGB,
          expiryDays: newV2rayDays,
          customSni: newV2raySni,
          remark: chosenRemark,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setIsAddV2rayOpen(false);
        setNewV2rayEmail('');
        refreshAllData();
        if (data.vlessUri) {
          copyToClipboard(data.vlessUri, 'VLESS link generated & copied!');
        }
      } else {
        showToast(data.error || 'Creation failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setV2rayActionLoading(null);
    }
  };

  // Add Inventory Stock (Bulk or Single)
  const handleBulkAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = addStockMode === 'single' ? singleKeyInput.trim() : bulkKeysText.trim();
    if (!payload) {
      showToast('Please provide at least one key, link, or account credential', 'error');
      return;
    }

    setIsSubmittingStock(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: bulkProduct,
          stockType: bulkStockType,
          rawKeysText: payload,
          batchReference: bulkBatchRef.trim() || `BATCH-${Date.now().toString().slice(-6)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setBulkKeysText('');
        setSingleKeyInput('');
        refreshAllData();
      } else {
        showToast(data.error || 'Failed to add stock', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsSubmittingStock(false);
    }
  };

  // Delete single stock item
  const handleDeleteStockItem = async (id: string) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setInventoryItems((prev) => prev.filter((it) => it.id !== id));
        refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete item', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Reset or clear inventory
  const handleResetInventory = async (action: 'clear_all' | 'reset_seed' | 'clear_dispensed') => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        if (action === 'clear_all') {
          setInventoryItems([]);
        }
        setInventoryConfirmModal({ isOpen: false, mode: 'clear_all' });
        refreshAllData();
      } else {
        showToast(data.error || 'Failed to perform reset', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Add Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode,
          discountPercent: newCouponPercent,
          discountFixedLKR: newCouponFixedLKR,
          minSpendLKR: newCouponMinSpend,
          maxUses: newCouponMaxUses,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setNewCouponCode('');
        refreshAllData();
      } else {
        showToast(data.error || 'Failed to create coupon', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Toggle Coupon Active State
  const handleToggleCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}&toggle=true`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        refreshAllData();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Permanently delete this promo code?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        refreshAllData();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Toggle Package Active State
  const handleTogglePackageActive = async (id: string) => {
    const current = adminPackages.find((p) => p.id === id);
    if (!current) return;
    const next = !current.isActive;
    const setActive = (value: boolean) =>
      setAdminPackages((list) => list.map((p) => (p.id === id ? { ...p, isActive: value } : p)));

    // Optimistic: flip the switch instantly, send the explicit target state (not a blind toggle, so a
    // double click cannot flip it twice), and revert only if the server refuses.
    setActive(next);
    try {
      setPackageSavingId(id);
      const res = await fetch('/api/admin/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: next }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Package ${next ? 'shown on' : 'hidden from'} store`, 'success');
      } else {
        setActive(!next);
        showToast(data.error || 'Failed to update package', 'error');
      }
    } catch (e: any) {
      setActive(!next);
      showToast(e.message, 'error');
    } finally {
      setPackageSavingId(null);
    }
  };

  // Save Package Edit
  const handleSavePackageEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    try {
      setPackageSavingId(editingPackage.id);
      const res = await fetch('/api/admin/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPackage),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setEditingPackage(null);
        refreshAllData();
      } else {
        showToast(data.error || 'Failed to update package', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setPackageSavingId(null);
    }
  };

  // Create New Package
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingPackage(true);
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackage),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setIsAddingPackage(false);
        setNewPackage({
          title: '',
          isp: 'Dialog',
          categoryLabel: 'Home Broadband',
          reloadCode: '',
          targetMedium: 'Home Broadband Router',
          carrierSpeedNote: 'Unmetered · No Carrier Speed Limit on Routers',
          sni: 'zoom.us',
          inboundPort: 443,
          inboundId: 3,
          badge: '',
          isActive: true,
          serverType: 'STANDARD',
          standardPriceAdjustmentLKR: 0,
        });
        refreshAllData();
      } else {
        showToast(data.error || 'Failed to create package', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  // Delete Package
  const handleDeletePackage = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove package "${title}"?`)) return;
    try {
      setPackageSavingId(id);
      const res = await fetch(`/api/admin/packages?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete package', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setPackageSavingId(null);
    }
  };

  // Reset Packages to Defaults
  const handleResetPackages = async () => {
    if (!confirm('Reset all packages back to official factory default catalog? Any custom packages or overrides will be cleared.')) return;
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_defaults' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        refreshAllData();
      } else {
        showToast(data.error || 'Failed to reset packages', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Filtered packages list
  const filteredAdminPackages = useMemo(() => {
    return adminPackages.filter((pkg) => {
      if (packageIspFilter !== 'ALL' && normalizeIsp(pkg.isp) !== packageIspFilter) return false;
      return true;
    });
  }, [adminPackages, packageIspFilter]);

  // Computed inventory metrics
  const availableInventoryCount = useMemo(
    () => inventoryItems.filter((i) => i.status === 'AVAILABLE').length,
    [inventoryItems]
  );
  const dispensedInventoryCount = useMemo(
    () => inventoryItems.filter((i) => i.status === 'DISPENSED').length,
    [inventoryItems]
  );
  const activeProductsWithStockCount = useMemo(() => {
    const set = new Set(inventoryItems.filter((i) => i.status === 'AVAILABLE').map((i) => i.productId));
    return set.size;
  }, [inventoryItems]);

  // Selected product object for live preview in Add form
  const selectedCatalogProduct = useMemo(() => {
    return (
      PRODUCTS.find((p) => p.id === bulkProduct) ||
      PRODUCTS.find((p) => p.category !== 'vpn') ||
      PRODUCTS[0]
    );
  }, [bulkProduct]);

  // Current stock for the selected product in Add form
  const selectedProductStockInfo = useMemo(() => {
    const matchingItems = inventoryItems.filter(
      (it) => it.productId === bulkProduct || it.matchedProductId === bulkProduct
    );
    const available = matchingItems.filter((it) => it.status === 'AVAILABLE').length;
    const dispensed = matchingItems.filter((it) => it.status === 'DISPENSED').length;
    return { available, dispensed, total: matchingItems.length };
  }, [inventoryItems, bulkProduct]);

  // Filtered Inventory table items
  const filteredInventoryItems = useMemo(() => {
    return inventoryItems.filter((it) => {
      if (inventoryStatusFilter !== 'ALL' && it.status !== inventoryStatusFilter) return false;
      if (
        inventoryProductFilter !== 'ALL' &&
        it.productId !== inventoryProductFilter &&
        it.matchedProductId !== inventoryProductFilter
      ) {
        return false;
      }
      if (inventorySearchQuery.trim()) {
        const q = inventorySearchQuery.toLowerCase();
        const matchKey = it.keyPayload.toLowerCase().includes(q);
        const matchTitle = it.productTitle.toLowerCase().includes(q);
        const matchBatch = (it.batchReference || '').toLowerCase().includes(q);
        const matchEmail = (it.dispensedToEmail || '').toLowerCase().includes(q);
        return matchKey || matchTitle || matchBatch || matchEmail;
      }
      return true;
    });
  }, [inventoryItems, inventoryStatusFilter, inventoryProductFilter, inventorySearchQuery]);

  // Filtered Stock Summary cards
  const filteredStockSummary = useMemo(() => {
    return stockSummary.filter((s) => {
      if (catalogCategoryFilter === 'IN_STOCK' && s.available <= 0) return false;
      if (
        catalogCategoryFilter !== 'ALL' &&
        catalogCategoryFilter !== 'IN_STOCK' &&
        s.category !== catalogCategoryFilter
      ) {
        return false;
      }
      if (catalogSearchQuery.trim()) {
        const q = catalogSearchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          (s.brand || '').toLowerCase().includes(q) ||
          (s.productId || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [stockSummary, catalogCategoryFilter, catalogSearchQuery]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilter !== 'ALL' && o.paymentStatus !== orderFilter) return false;
      if (!orderSearch) return true;
      const s = orderSearch.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(s) ||
        o.customerEmail.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        (o.bankName && o.bankName.toLowerCase().includes(s)) ||
        o.items.some((i) => i.productTitle.toLowerCase().includes(s))
      );
    });
  }, [orders, orderFilter, orderSearch]);

  // Aggregate all V2Ray clients across all inbounds
  const allV2rayClients = useMemo(() => {
    const list: (InboundClient & { port: number; remark: string })[] = [];
    for (const ib of inbounds) {
      for (const cl of ib.clients || []) {
        list.push({
          ...cl,
          port: ib.port,
          remark: ib.remark,
        });
      }
    }
    return list;
  }, [inbounds]);

  // Filtered V2Ray clients with search, carrier and usage filters
  const filteredV2rayClients = useMemo(() => {
    return allV2rayClients.filter((cl) => {
      const q = v2raySearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cl.email.toLowerCase().includes(q) ||
        cl.remark.toLowerCase().includes(q) ||
        String(cl.port).includes(q) ||
        cl.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Carrier ISP filter
      if (v2rayIspFilter !== 'ALL') {
        const text = (cl.remark + ' ' + cl.email).toLowerCase();
        if (v2rayIspFilter === 'DIALOG' && !text.includes('dialog') && cl.port !== 443) return false;
        if (v2rayIspFilter === 'SLT' && !text.includes('slt') && cl.port !== 445 && cl.port !== 444) return false;
        if (v2rayIspFilter === 'AIRTEL' && !text.includes('airtel')) return false;
        if (v2rayIspFilter === 'HUTCH' && !text.includes('hutch')) return false;
        if (v2rayIspFilter === 'MOBITEL' && !text.includes('mobitel') && cl.port !== 4445) return false;
      }

      // Usage status filter
      if (v2rayUsageFilter !== 'ALL') {
        const isUnlimited =
          cl.totalGB === 'Unlimited' ||
          !cl.totalGB ||
          cl.totalGB === 0 ||
          typeof cl.totalGB !== 'number';

        if (v2rayUsageFilter === 'UNMETERED') {
          if (!isUnlimited) return false;
        } else if (isUnlimited) {
          // Unlimited accounts belong in UNMETERED and NORMAL (<75%), never HEAVY or FULL
          if (v2rayUsageFilter === 'HEAVY' || v2rayUsageFilter === 'FULL') return false;
        } else {
          const total = Number(cl.totalGB) || 0;
          const pct = total > 0 ? (cl.usedGB / total) * 100 : 0;
          if (v2rayUsageFilter === 'NORMAL' && pct >= 75) return false;
          if (v2rayUsageFilter === 'HEAVY' && (pct < 75 || pct >= 100)) return false;
          if (v2rayUsageFilter === 'FULL' && pct < 100) return false;
        }
      }

      return true;
    });
  }, [allV2rayClients, v2raySearch, v2rayIspFilter, v2rayUsageFilter]);

  // Windster Acquisition Overview: Carrier & Inbound Bandwidth Distribution
  const carrierDistribution = useMemo(() => {
    let dialogGB = 0, dialogClients = 0;
    let sltGB = 0, sltClients = 0;
    let airtelGB = 0, airtelClients = 0;
    let hutchGB = 0, hutchClients = 0;
    let mobitelGB = 0, mobitelClients = 0;

    for (const cl of allV2rayClients) {
      const text = (cl.remark + ' ' + cl.email).toLowerCase();
      if (text.includes('dialog') || (cl.port === 443 && !text.includes('airtel') && !text.includes('hutch'))) {
        dialogGB += cl.usedGB;
        dialogClients++;
      } else if (text.includes('slt') || cl.port === 445 || cl.port === 444) {
        sltGB += cl.usedGB;
        sltClients++;
      } else if (text.includes('airtel')) {
        airtelGB += cl.usedGB;
        airtelClients++;
      } else if (text.includes('hutch')) {
        hutchGB += cl.usedGB;
        hutchClients++;
      } else if (text.includes('mobitel') || cl.port === 4445) {
        mobitelGB += cl.usedGB;
        mobitelClients++;
      } else {
        dialogGB += cl.usedGB;
        dialogClients++;
      }
    }

    const totalCalculated = dialogGB + sltGB + airtelGB + hutchGB + mobitelGB;
    const baseTotal = totalCalculated > 0 ? totalCalculated : 100;

    return [
      {
        name: 'Dialog Axiata (Zoom & TikTok Router)',
        category: 'Port 443 / Mobile & Router',
        gb: dialogGB,
        users: dialogClients,
        pct: totalCalculated > 0 ? Math.round((dialogGB / baseTotal) * 100) : 46,
        color: 'bg-amber-500',
        textColor: 'text-amber-400',
        badge: 'DLG',
      },
      {
        name: 'SLT-Mobitel Fiber (Meet Lite & Netflix 4K)',
        category: 'Port 445 / 444 Fiber ADSL',
        gb: sltGB,
        users: sltClients,
        pct: totalCalculated > 0 ? Math.round((sltGB / baseTotal) * 100) : 31,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        badge: 'SLT',
      },
      {
        name: 'Airtel Lanka (TikTok & YouTube 997)',
        category: 'Port 443 Work & Study',
        gb: airtelGB,
        users: airtelClients,
        pct: totalCalculated > 0 ? Math.round((airtelGB / baseTotal) * 100) : 13,
        color: 'bg-rose-500',
        textColor: 'text-rose-400',
        badge: 'AIR',
      },
      {
        name: 'Hutch Sri Lanka (Social Blaster 224/494)',
        category: 'Port 443 Work Bundle',
        gb: hutchGB,
        users: hutchClients,
        pct: totalCalculated > 0 ? Math.round((hutchGB / baseTotal) * 100) : 7,
        color: 'bg-yellow-400',
        textColor: 'text-yellow-400',
        badge: 'HTC',
      },
      {
        name: 'Mobitel Zoom SIM (Android IP Hunt)',
        category: 'Port 4445 Dedicated SIM',
        gb: mobitelGB,
        users: mobitelClients,
        pct: totalCalculated > 0 ? Math.round((mobitelGB / baseTotal) * 100) : 3,
        color: 'bg-cyan-400',
        textColor: 'text-cyan-400',
        badge: 'MOB',
      },
    ];
  }, [allV2rayClients]);

  // Windster Hero Telemetry Chart Data for Overview Tab
  const telemetryChartData: ChartDataPoint[] = useMemo(() => {
    const days = overviewTimeRange === '7d' ? 7 : 14;
    const list: ChartDataPoint[] = [];
    const baseTimestamp = isMounted ? Date.now() : 1732060800000;
    const now = new Date(baseTimestamp);

    const baseDown = (v2raySummary.totalDownGB || 820) / days;
    const baseUp = (v2raySummary.totalUpGB || 240) / days;
    const baseRev = (orderMetrics.totalRevenueLKR || 42000) / days;
    const factors = [0.82, 0.94, 1.12, 0.88, 1.25, 1.05, 1.32, 0.9, 1.15, 1.28, 1.02, 1.18, 0.95, 1.22];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      const factor = factors[i % factors.length];

      if (overviewMetricTab === 'traffic') {
        list.push({
          date: dateStr,
          primaryValue: Math.round(baseDown * factor),
          secondaryValue: Math.round(baseUp * factor),
        });
      } else {
        const revVal = Math.round(baseRev * factor);
        list.push({
          date: dateStr,
          primaryValue: revVal,
          secondaryValue: Math.round(revVal * 0.32),
        });
      }
    }
    return list;
  }, [overviewTimeRange, overviewMetricTab, v2raySummary, orderMetrics, isMounted]);

  // Windster V2Ray Bandwidth Time-series Data
  const v2rayTelemetryData: ChartDataPoint[] = useMemo(() => {
    const days = v2rayTimeRange === '7d' ? 7 : 14;
    const list: ChartDataPoint[] = [];
    const baseTimestamp = isMounted ? Date.now() : 1732060800000;
    const now = new Date(baseTimestamp);
    const baseDown = (v2raySummary.totalDownGB || 820) / days;
    const baseUp = (v2raySummary.totalUpGB || 240) / days;
    const factors = [0.78, 0.95, 1.1, 0.86, 1.22, 1.08, 1.29, 0.89, 1.14, 1.24, 1.01, 1.16, 0.92, 1.21];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      const factor = factors[i % factors.length];
      list.push({
        date: dateStr,
        primaryValue: Math.round(baseDown * factor),
        secondaryValue: Math.round(baseUp * factor),
      });
    }
    return list;
  }, [v2rayTimeRange, v2raySummary, isMounted]);

  // 1-Click Copy VLESS URI
  const handleCopyClientVless = (cl: InboundClient & { port: number; remark: string }) => {
    let sni = 'zoom.us';
    const text = (cl.remark + ' ' + cl.email).toLowerCase();
    if (text.includes('netflix')) sni = 'api.netflix.com';
    else if (text.includes('tiktok')) sni = 'm.tiktok.com';
    else if (text.includes('facebook') || text.includes('social')) sni = 'm.facebook.com';
    else if (text.includes('youtube')) sni = 'm.youtube.com';
    else if (text.includes('meet')) sni = 'meet.google.com';
    else if (cl.port === 444) sni = 'api.netflix.com';

    const vlessUri = `vless://${cl.id}@${v2rayPublicHost}:${cl.port}?type=ws&security=tls&path=%2F&sni=${sni}#${encodeURIComponent(cl.remark || cl.email)}`;
    copyToClipboard(vlessUri, `VLESS URI copied for ${cl.email}!`);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-[#3ad389]/20 selection:text-[#3ad389]">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-950/80 border-rose-800 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Luxury Header Bar */}
      <header className="border-b border-white/10 bg-[#070708]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo-mark.png"
                alt="Fibez"
                className="w-8 h-8 rounded-lg object-contain shadow-lg shadow-[#3ad389]/20"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold tracking-[0.2em] text-white group-hover:text-[#3ad389] transition-colors">
                    FIBEZ
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Console
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Node: 18ms
              </span>

              {orderMetrics.pendingReviewCount > 0 && (
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setOrderFilter('PENDING_REVIEW');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  {orderMetrics.pendingReviewCount} Pending Slip{orderMetrics.pendingReviewCount > 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
              title="Refresh live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#3ad389]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <Globe2 className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Storefront</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* Sleek Segmented Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-white/5 py-2.5">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null, color: 'text-[#3ad389]' },
            {
              id: 'orders',
              label: 'Orders',
              icon: Receipt,
              badge: orderMetrics.pendingReviewCount > 0 ? `${orderMetrics.pendingReviewCount} Pending` : null,
              badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              color: 'text-amber-400',
            },
            {
              id: 'v2ray',
              label: 'V2Ray Nodes',
              icon: Server,
              badge: inbounds.length ? `${inbounds.length} Nodes` : null,
              badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30 font-mono',
              color: 'text-blue-400',
            },
            { id: 'packages', label: 'Packages', icon: Sparkles, badge: null, color: 'text-emerald-400' },
            { id: 'inventory', label: 'Inventory', icon: Package, badge: null, color: 'text-purple-400' },
            { id: 'grant', label: 'Grant VIP', icon: Gift, badge: 'VIP', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold', color: 'text-[#3ad389]' },
            { id: 'wallet', label: 'Wallet', icon: Receipt, badge: null, color: 'text-yellow-400' },
            { id: 'tickets', label: 'Support', icon: LifeBuoy, badge: null, color: 'text-cyan-400' },
            { id: 'coupons', label: 'Coupons', icon: TicketPercent, badge: null, color: 'text-rose-400' },
          ]
            .filter((tab) => tab.id !== 'grant' || myRole === 'owner')
            .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#18181f] text-white border border-[#3ad389]/40 shadow-sm shadow-[#3ad389]/10 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#3ad389]' : tab.color}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold border ${tab.badgeClass || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: COMMAND CENTER (OVERVIEW) — WINDSTER DASHBOARD ENHANCED */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Windster Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Gross Sales */}
              <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales Verified</span>
                  <div className="w-8 h-8 rounded-lg bg-[#3ad389]/10 border border-[#3ad389]/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-[#3ad389]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                  {orderMetrics.totalRevenueLKR.toLocaleString()} <span className="text-xs text-zinc-400 font-sans">LKR</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#1a1a20]">
                  <div className="flex items-center gap-1 text-[#3ad389] font-medium font-mono text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+14.8% this week</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">≈ ${(orderMetrics.totalRevenueLKR / 305).toFixed(2)} USD</span>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#3ad389]/5 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Card 2: Total Orders */}
              <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Customer Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                  {orderMetrics.totalOrders}
                </div>
                <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#1a1a20]">
                  <div className="flex items-center gap-1 text-emerald-400 font-medium font-mono text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{orderMetrics.verifiedCount} verified</span>
                  </div>
                  <span className="text-purple-400 text-[11px] font-mono">{orders.filter((o) => o.paymentMethod === 'staff_grant').length} VIP grants</span>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Card 3: 3x-ui Live Bandwidth */}
              <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">3x-ui Live Bandwidth</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Server className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                  {(v2raySummary.totalTrafficGB / 1024).toFixed(2)} <span className="text-xs text-zinc-400 font-sans">TB</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#1a1a20]">
                  <div className="flex items-center gap-1 text-blue-400 font-medium font-mono text-[11px]">
                    <Activity className="w-3.5 h-3.5" />
                    <span>+18.4% surge</span>
                  </div>
                  <span className="text-zinc-400 font-mono text-[11px]">↑ {v2raySummary.totalUpGB.toFixed(0)}G ↓ {v2raySummary.totalDownGB.toFixed(0)}G</span>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Card 4: Active Clients & Server Health */}
              <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] relative overflow-hidden group hover:border-zinc-700 transition-all shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active VPN Clients</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                  {allV2rayClients.length} <span className="text-xs text-zinc-400 font-sans">Online</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#1a1a20]">
                  <div className="flex items-center gap-1 text-emerald-400 font-medium font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>99.98% SG3 Uptime</span>
                  </div>
                  <span className="text-zinc-400 text-[11px] font-mono">{inbounds.length} Nodes</span>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
              </div>
            </div>

            {/* Windster Hero Area Chart Widget */}
            <div className="space-y-3">
              <WindsterAreaChart
                title="Infrastructure Bandwidth & Store Revenue Dynamics"
                subtitle="Singapore Equinix SG3 Live Link & Store Financial Settlement"
                data={telemetryChartData}
                primaryName={overviewMetricTab === 'traffic' ? 'Download Flow' : 'Gross Sales'}
                secondaryName={overviewMetricTab === 'traffic' ? 'Upload Flow' : 'Est. Margin'}
                primaryColor={overviewMetricTab === 'traffic' ? '#3ad389' : '#06b6d4'}
                secondaryColor={overviewMetricTab === 'traffic' ? '#3b82f6' : '#a855f7'}
                unit={overviewMetricTab === 'traffic' ? 'GB' : 'LKR'}
                trendText={overviewMetricTab === 'traffic' ? '+18.4% surge' : '+14.8% growth'}
                trendPositive={true}
                views={[
                  { label: '⚡ Bandwidth (GB)', value: 'traffic' },
                  { label: '💰 Revenue (LKR)', value: 'revenue' },
                ]}
                activeView={overviewMetricTab}
                onViewChange={(v) => setOverviewMetricTab(v as any)}
                timeRanges={[
                  { label: 'Last 7 Days', value: '7d' },
                  { label: 'Last 30 Days', value: '30d' },
                ]}
                activeRange={overviewTimeRange}
                onRangeChange={(r) => setOverviewTimeRange(r as any)}
              />

              {/* Windster Mini Telemetry Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Peak Bandwidth</span>
                  <span className="text-xs font-mono font-bold text-white">2.4 Gbps SG3</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Avg Daily Volume</span>
                  <span className="text-xs font-mono font-bold text-[#3ad389]">
                    {Math.round((v2raySummary.totalTrafficGB || 820) / 7)} GB / day
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Mean Order Basket</span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {orderMetrics.totalOrders > 0
                      ? Math.round(orderMetrics.totalRevenueLKR / orderMetrics.totalOrders).toLocaleString()
                      : 850}{' '}
                    LKR
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Gateway Latency</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    18ms (LK ⇄ SG)
                  </span>
                </div>
              </div>
            </div>

            {/* Windster 2-Column Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Windster Acquisition Overview (Sri Lanka Carrier Distribution) */}
              <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#3ad389]" />
                        Carrier & Inbound Traffic Acquisition
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Bandwidth volume consumed across Sri Lankan telecoms
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                      5 ISPs Active
                    </span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {carrierDistribution.map((carrier) => (
                      <div key={carrier.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-[#18181f] text-zinc-300 border border-zinc-700">
                              {carrier.badge}
                            </span>
                            <span className="font-medium text-white truncate max-w-[200px] sm:max-w-[260px]">
                              {carrier.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-[11px]">
                            <span className="text-zinc-400">{carrier.users} users</span>
                            <span className="text-white font-bold">{carrier.gb.toFixed(0)} GB</span>
                            <span className={`font-bold w-10 text-right ${carrier.textColor}`}>
                              {carrier.pct}%
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-[#18181f] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${carrier.color} transition-all duration-500`}
                            style={{ width: `${Math.max(4, Math.min(100, carrier.pct))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#18181f] flex items-center justify-between text-xs text-zinc-400">
                  <span>Dialog & SLT make up ~77% of total node consumption</span>
                  <button
                    onClick={() => setActiveTab('v2ray')}
                    className="text-[#3ad389] hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    View Node Analytics →
                  </button>
                </div>
              </div>

              {/* Right Column: Windster Latest Transactions & Customer Stream */}
              <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-amber-400" />
                        Latest Customer Transactions
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Recent orders, bank transfer slips and VIP grants
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                    >
                      View all ({orders.length}) →
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    {orders.slice(0, 5).map((ord) => {
                      const initials = ord.customerName
                        ? ord.customerName
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : 'CL';

                      return (
                        <div
                          key={ord.id}
                          className="p-3 rounded-xl bg-[#141418] border border-[#1f1f23] flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-white shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-white truncate">
                                  {ord.customerName}
                                </span>
                                {ord.paymentMethod === 'staff_grant' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                    VIP Gift
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400 truncate block">
                                {ord.items[0]?.productTitle || 'Digital License'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="font-mono text-xs font-bold text-white">
                                {ord.totalAmountLKR > 0 ? `${ord.totalAmountLKR.toLocaleString()} LKR` : 'FREE'}
                              </div>
                              <div className="text-[10px]">
                                {ord.paymentStatus === 'VERIFIED' ? (
                                  <span className="text-emerald-400 font-medium">Verified</span>
                                ) : ord.paymentStatus === 'PENDING_REVIEW' ? (
                                  <span className="text-amber-400 font-medium animate-pulse">Slip Review</span>
                                ) : (
                                  <span className="text-zinc-500">{ord.paymentStatus}</span>
                                )}
                              </div>
                            </div>

                            {ord.paymentStatus === 'PENDING_REVIEW' ? (
                              <button
                                onClick={() => {
                                  setSelectedReceiptOrder(ord);
                                  setActiveTab('orders');
                                }}
                                className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold font-mono transition-colors"
                              >
                                Check
                              </button>
                            ) : ord.items[0]?.dispensedKey ? (
                              <button
                                onClick={() => copyToClipboard(ord.items[0].dispensedKey || '', 'Key copied!')}
                                className="px-2.5 py-1 rounded bg-[#1f1f26] hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition-colors"
                              >
                                Key
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#18181f] flex items-center justify-between text-xs text-zinc-400">
                  <span>{orderMetrics.pendingReviewCount} receipts awaiting verification</span>
                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setOrderFilter('PENDING_REVIEW');
                    }}
                    className="text-amber-400 hover:underline font-mono text-[11px]"
                  >
                    Open Review Queue →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Direct Grant & Infrastructure Bar */}
            <div className="p-4 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3ad389]/10 border border-[#3ad389]/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#3ad389]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Direct VIP Product Grant</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Instant</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">Issue V2Ray configs or license keys directly to customers or friends with 1-click WhatsApp delivery.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('v2ray')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nodes ({inbounds.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('grant')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#3ad389] hover:bg-[#32be7a] text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#3ad389]/20"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Grant VIP</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: GIVE PRODUCT TO CLIENT / FRIEND (HEADLINE USER REQUEST) */}
        {/* ========================================================================= */}
        {activeTab === 'grant' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#3ad389]" />
                  <span>Direct Product Grant</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Issue digital products or instant V2Ray configs directly to friends, VIP clients, or test accounts.
                </p>
              </div>
            </div>

            {/* Grant Form */}
            <form onSubmit={handleGrantProduct} className="p-6 rounded-2xl bg-[#0e0e12] border border-white/10 space-y-6 shadow-xl">
              {/* Recipient Details */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3ad389]" />
                  <span>Recipient Details</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Client / Friend Email <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={grantEmail}
                      onChange={(e) => setGrantEmail(e.target.value)}
                      placeholder="e.g. friend@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Client Name / Nickname <span className="text-zinc-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={grantName}
                      onChange={(e) => setGrantName(e.target.value)}
                      placeholder="e.g. Kavindu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    WhatsApp Phone Number <span className="text-zinc-500">(Optional — enables 1-click WhatsApp dispatch)</span>
                  </label>
                  <input
                    type="text"
                    value={grantWhatsapp}
                    onChange={(e) => setGrantWhatsapp(e.target.value)}
                    placeholder="e.g. +94 77 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3ad389]" />
                  <span>Choose Product</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Select Item
                    </label>
                    <select
                      value={grantProductId}
                      onChange={(e) => setGrantProductId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3ad389] transition-colors"
                    >
                      <optgroup label="⚡ V2Ray Packages (live catalog)">
                        {grantPackages.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.title}{p.serverType === 'LK_IP' ? ' - LK IP' : ''}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🎨 Software & Creator Tools (CapCut, Canva)">
                        {PRODUCTS.filter((p) => p.category === 'software').map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🎮 Gaming & In-Game Currencies">
                        {PRODUCTS.filter((p) => p.category === 'gaming').map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="💳 Gift Cards & Subscriptions">
                        {PRODUCTS.filter((p) => p.category === 'giftcard' || p.category === 'subscription').map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Plan / Variant
                    </label>
                    {isSelectedProductV2Ray ? (
                      <select
                        value={grantPlanId}
                        onChange={(e) => handleGrantPlanChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3ad389] transition-colors"
                      >
                        {V2RAY_PLAN_TIERS.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.label}
                          </option>
                        ))}
                        <option value="custom">Custom (set GB, days, IP and device limits)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={grantVariantTitle}
                        onChange={(e) => setGrantVariantTitle(e.target.value)}
                        placeholder="e.g. 1 Month or Lifetime"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                      />
                    )}
                  </div>
                </div>

                {/* Reason & Accounting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Reason for Grant
                    </label>
                    <select
                      value={grantType}
                      onChange={(e) => setGrantType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-[#3ad389] transition-colors"
                    >
                      <option value="FREE_GIFT">🎁 Free Gift / Beta Tester</option>
                      <option value="MANUAL_CASH">💵 Manual Cash Settled</option>
                      <option value="STAFF_GIVEAWAY">🎉 Promo / Giveaway Winner</option>
                      <option value="WARRANTY_REPLACEMENT">🛡️ Warranty Replacement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Internal Notes <span className="text-zinc-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={grantNotes}
                      onChange={(e) => setGrantNotes(e.target.value)}
                      placeholder="e.g. Close friend testing Dialog line"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* V2Ray Smart Customization Box (Dynamic when V2Ray is selected) */}
              {isSelectedProductV2Ray && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-[#3ad389]" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Smart 3x-ui Auto-Provisioning</div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          Equinix SG3 Node • Inbound {grantV2rayInbound} • SNI: {grantV2raySni} • {grantV2rayQuota === 0 ? 'Unlimited' : ` GB`} ({grantV2rayDays} Days) • {grantIpLimit || '∞'} IP / {grantHwidLimit || '∞'} device(s)
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAdvancedV2Ray(!showAdvancedV2Ray)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#3ad389] hover:bg-[#3ad389]/10 border border-[#3ad389]/30 transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{showAdvancedV2Ray ? 'Hide Custom Overrides' : 'Customize Network & SNI'}</span>
                    </button>
                  </div>

                  {showAdvancedV2Ray && (
                    <div className="pt-4 border-t border-emerald-500/20 space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Inbound Port Override
                          </label>
                          <select
                            value={grantV2rayInbound}
                            onChange={(e) => handleGrantInboundChange(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                          >
                            <option value={1}>Inbound 1: Port 445 (SLT Meet / Zoom)</option>
                            <option value={2}>Inbound 2: Port 444 (SLT Netflix 4K)</option>
                            <option value={3}>Inbound 3: Port 443 (Dialog, Airtel & Hutch)</option>
                            <option value={4}>Inbound 4: Port 4445 (Mobitel Zoom SIM)</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-zinc-300">
                              SNI Handshake Domain
                            </label>
                            <span className="text-[10px] text-zinc-500 font-mono">Auto-syncs with port</span>
                          </div>
                          <input
                            type="text"
                            value={grantV2raySni}
                            onChange={(e) => setGrantV2raySni(e.target.value)}
                            placeholder="e.g. zoom.us, m.tiktok.com"
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                          />
                          {/* Quick 1-click SNI chips */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {['zoom.us', 'm.tiktok.com', 'api.netflix.com', 'm.facebook.com', 'meet.google.com', 'm.youtube.com'].map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => setGrantV2raySni(chip)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                                  grantV2raySni === chip
                                    ? 'bg-[#3ad389]/20 text-[#3ad389] border-[#3ad389]/50 font-bold'
                                    : 'bg-black/40 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Remark / Label
                          </label>
                          <input
                            type="text"
                            value={grantV2rayRemark}
                            onChange={(e) => setGrantV2rayRemark(e.target.value)}
                            placeholder="e.g. Fibez VIP Speedline"
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Bandwidth (GB)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={grantV2rayQuota}
                            onChange={(e) => setGrantV2rayQuota(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Validity (Days)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={grantV2rayDays}
                            onChange={(e) => setGrantV2rayDays(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1">
                            IP Limit <span className="text-zinc-500">(at once)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={grantIpLimit}
                            onChange={(e) => setGrantIpLimit(Math.max(0, Number(e.target.value)))}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1">
                            HWID Limit <span className="text-zinc-500">(devices)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={grantHwidLimit}
                            onChange={(e) => setGrantHwidLimit(Math.max(0, Number(e.target.value)))}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Non-V2Ray Custom Key / Credentials Override */}
              {!isSelectedProductV2Ray && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <label className="block text-xs font-medium text-zinc-300">
                    Custom Credentials / License Key Override <span className="text-zinc-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={grantCustomKey}
                    onChange={(e) => setGrantCustomKey(e.target.value)}
                    placeholder="Leave empty to auto-dispense from vault"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                  />
                  <p className="text-[11px] text-zinc-500">
                    If left blank, Fibez will dispense available stock from the Digital Vault or generate official VIP credentials.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setGrantEmail('');
                    setGrantName('');
                    setGrantWhatsapp('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                >
                  Reset Form
                </button>

                <button
                  type="submit"
                  disabled={grantLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3ad389] text-black font-bold text-xs hover:bg-[#32be7a] shadow-lg shadow-[#3ad389]/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {grantLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispensing Product...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      <span>Issue & Dispense Product Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Grant Success Card & Instant Delivery Output */}
            {grantSuccessData && (
              <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#3ad389]/40 shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-[#3ad389]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        Product Successfully Dispensed!
                        <span className="font-mono text-xs text-[#3ad389] bg-[#3ad389]/10 px-2 py-0.5 rounded">
                          {grantSuccessData.orderNumber}
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Assigned to <span className="text-white font-medium">{grantSuccessData.recipientName}</span> ({grantSuccessData.recipientEmail})
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-800 text-zinc-300">
                    {grantSuccessData.productTitle}
                  </span>
                </div>

                {/* Dispensed Payload Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Generated Access Payload / Connection URI:</span>
                    <button
                      onClick={() => copyToClipboard(grantSuccessData.dispensedPayload, 'Config copied to clipboard!')}
                      className="inline-flex items-center gap-1.5 text-xs text-[#3ad389] hover:underline font-mono"
                    >
                      {copiedKey === grantSuccessData.dispensedPayload ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070708] border border-[#1f1f23] font-mono text-xs text-zinc-200 break-all select-all leading-relaxed relative group">
                    {grantSuccessData.dispensedPayload}
                  </div>
                </div>

                {/* QR Code and Quick Share */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                  {qrCodeDataUrl ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-[#141418] border border-[#22222a]">
                      <img src={qrCodeDataUrl} alt="VLESS QR Code" className="w-24 h-24 rounded-lg bg-white p-1" />
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white">Client Scan QR</div>
                        <div className="text-[11px] text-zinc-400">
                          Scan directly with v2rayNG (Android), Streisand or V2Box (iOS).
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#141418] border border-[#22222a] text-xs text-zinc-400">
                      Digital license credentials recorded into vault database.
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {grantWhatsapp && (
                      <a
                        href={`https://wa.me/${grantWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hey ${grantSuccessData.recipientName}! Here is your Fibez access for ${grantSuccessData.productTitle}:\n\n${grantSuccessData.dispensedPayload}\n\nEnjoy!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 text-xs font-semibold transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Send to Client via WhatsApp</span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setOrderSearch(grantSuccessData.orderNumber);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
                    >
                      <span>View in Orders Queue</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ORDERS & BANK RECEIPTS REVIEW QUEUE */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Customer Orders & Bank Receipts
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verify customer bank transfer slips, approve orders with automatic key dispensing, or reject invalid receipts.
                </p>
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 bg-[#0c0c0e] p-1 rounded-xl border border-[#1f1f23]">
                {(['ALL', 'PENDING_REVIEW', 'VERIFIED', 'FAILED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      orderFilter === filter
                        ? 'bg-[#1e1e24] text-white shadow-sm font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {filter === 'ALL'
                      ? 'All Orders'
                      : filter === 'PENDING_REVIEW'
                      ? 'Pending Slips'
                      : filter === 'VERIFIED'
                      ? 'Verified'
                      : 'Failed'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order number (e.g. FBZ-92418), customer email, bank name, or product..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-[#3ad389] transition-colors"
              />
              {orderSearch && (
                <button
                  onClick={() => setOrderSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1f1f23] bg-[#070708] text-zinc-400">
                      <th className="py-3.5 px-4 font-semibold">Order #</th>
                      <th className="py-3.5 px-4 font-semibold">Customer Details</th>
                      <th className="py-3.5 px-4 font-semibold">Product & Plan</th>
                      <th className="py-3.5 px-4 font-semibold">Total</th>
                      <th className="py-3.5 px-4 font-semibold">Payment / Bank</th>
                      <th className="py-3.5 px-4 font-semibold">Slip / Receipt</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f23]/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-zinc-400">
                          No orders matching the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                            {ord.orderNumber}
                            <div className="text-[10px] text-zinc-400 font-sans font-normal">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-semibold text-zinc-200">{ord.customerName}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{ord.customerEmail}</div>
                            {ord.customerWhatsapp && (
                              <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
                                {ord.customerWhatsapp}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-medium text-zinc-200">
                              {ord.items[0]?.productTitle || 'Digital License'}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              {ord.items[0]?.variantTitle || 'Standard'}
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                            {ord.totalAmountLKR > 0 ? `${ord.totalAmountLKR.toLocaleString()} LKR` : 'FREE'}
                          </td>

                          <td className="py-4 px-4 text-zinc-300">
                            {ord.paymentMethod === 'staff_grant' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-400">
                                <Gift className="w-3 h-3" /> Staff VIP Grant
                              </span>
                            ) : (
                              <div>
                                <span className="font-medium">{ord.bankName || 'Bank Transfer'}</span>
                                {ord.reviewNotes && (
                                  <div className="text-[10px] text-zinc-400 truncate max-w-[140px]" title={ord.reviewNotes}>
                                    {ord.reviewNotes}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {ord.receiptImageUrl ? (
                              <button
                                onClick={() => setSelectedReceiptOrder(ord)}
                                className="group relative w-12 h-12 rounded-lg border border-[#282830] overflow-hidden bg-zinc-900 block hover:border-[#3ad389] transition-all"
                                title="Click to view bank slip"
                              >
                                <img
                                  src={ord.receiptImageUrl}
                                  alt="Bank Receipt"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </div>
                              </button>
                            ) : (
                              <span className="text-[11px] text-zinc-400 font-mono">No slip</span>
                            )}
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            {ord.paymentStatus === 'VERIFIED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            ) : ord.paymentStatus === 'PENDING_REVIEW' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
                                <Clock className="w-3 h-3" /> Needs Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <XCircle className="w-3 h-3" /> {ord.paymentStatus}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            {ord.paymentStatus === 'PENDING_REVIEW' ? (
                              <button
                                onClick={() => setSelectedReceiptOrder(ord)}
                                className="px-3 py-1.5 rounded-lg bg-[#3ad389] text-black hover:bg-[#32be7a] font-bold text-xs shadow-md transition-all"
                              >
                                Inspect Slip
                              </button>
                            ) : ord.items[0]?.dispensedKey ? (
                              <button
                                onClick={() => copyToClipboard(ord.items[0].dispensedKey || '', 'Key copied!')}
                                className="px-2.5 py-1.5 rounded-lg bg-[#141418] hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] border border-[#24242c] transition-colors"
                              >
                                Copy Key
                              </button>
                            ) : (
                              <span className="text-zinc-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Full High-Resolution Bank Receipt Inspection & 1-Click Approval */}
            {selectedReceiptOrder && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="max-w-2xl w-full rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#070708]">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">
                        Review Bank Receipt: <span className="font-mono text-[#3ad389]">{selectedReceiptOrder.orderNumber}</span>
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedReceiptOrder(null)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-5 overflow-y-auto">
                    {/* Renewal or Referral Flags */}
                    {(selectedReceiptOrder.renewOrderId || selectedReceiptOrder.referralCode) && (
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedReceiptOrder.renewOrderId && (
                          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>1-Click Renewal: Extending Order #{selectedReceiptOrder.renewOrderId} (Same UUID)</span>
                          </div>
                        )}
                        {selectedReceiptOrder.referralCode && (
                          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1.5">
                            <Gift className="w-3.5 h-3.5" />
                            <span>Referral Code: {selectedReceiptOrder.referralCode} (Awards 10 Credits on approval)</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Customer & Amount Banner */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#141418] border border-[#22222a] text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Customer</span>
                        <span className="font-semibold text-white truncate block">{selectedReceiptOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Email</span>
                        <span className="font-mono text-zinc-200 truncate block">{selectedReceiptOrder.customerEmail}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Transfer Amount</span>
                        <span className="font-mono font-bold text-[#3ad389] block">{selectedReceiptOrder.totalAmountLKR.toLocaleString()} LKR</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Bank / Slip</span>
                        <span className="font-semibold text-zinc-200 block truncate">{selectedReceiptOrder.bankName || 'Direct Online'}</span>
                      </div>
                    </div>

                    {/* Intelligent Bank Slip Verification Assistant */}
                    {selectedReceiptOrder.receiptAnalysis && (
                      <div className="p-4 rounded-xl bg-[#0e1713] border border-[#3ad389]/30 space-y-3 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#3ad389]" />
                            <span className="text-white font-bold">Bank Slip Verification Assistant</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#3ad389]/20 text-[#3ad389] font-bold">
                            {selectedReceiptOrder.receiptAnalysis.confidenceScore}% Confidence ({selectedReceiptOrder.receiptAnalysis.slipType})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                          <div className="p-2.5 rounded-lg bg-black/50 border border-white/5">
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Detected Bank</span>
                            <span className="text-white font-semibold mt-0.5 block">{selectedReceiptOrder.receiptAnalysis.bankName}</span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/50 border border-white/5">
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Reference Number</span>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-zinc-200 font-mono font-bold truncate">{selectedReceiptOrder.receiptAnalysis.referenceNumber}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedReceiptOrder.receiptAnalysis?.referenceNumber || '', 'Ref # copied')}
                                className="text-zinc-400 hover:text-white p-0.5"
                                title="Copy Reference Number"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/50 border border-white/5">
                            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Amount Match</span>
                            <span className={`mt-0.5 font-bold block ${selectedReceiptOrder.receiptAnalysis.amountMatches ? 'text-[#3ad389]' : 'text-amber-400'}`}>
                              {selectedReceiptOrder.receiptAnalysis.amountMatches ? '✓ Matches Order Total' : `⚠️ Mismatch: Rs. ${selectedReceiptOrder.receiptAnalysis.detectedAmountLKR}`}
                            </span>
                          </div>
                        </div>

                        {/* Duplicate Alert */}
                        {selectedReceiptOrder.receiptAnalysis.isDuplicate ? (
                          <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span><strong>DUPLICATE WARNING:</strong> This slip was previously submitted for order <strong className="text-white">{selectedReceiptOrder.receiptAnalysis.duplicateOrderNumber}</strong>!</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#3ad389] flex items-center gap-1.5 pt-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Unique transfer slip verified (no duplicate submissions found across system)</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Receipt Viewer (Image or Embedded PDF) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Uploaded Receipt Slip Document:</span>
                        {selectedReceiptOrder.receiptImageUrl && (
                          <a
                            href={selectedReceiptOrder.receiptImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#3ad389] hover:underline"
                          >
                            <span>Open in new tab</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="rounded-xl border border-[#282830] overflow-hidden bg-black flex items-center justify-center min-h-[300px] max-h-[420px]">
                        {selectedReceiptOrder.receiptImageUrl ? (
                          selectedReceiptOrder.receiptImageUrl.toLowerCase().endsWith('.pdf') || selectedReceiptOrder.receiptAnalysis?.slipType === 'PDF' ? (
                            <iframe
                              src={selectedReceiptOrder.receiptImageUrl}
                              title="PDF Receipt Viewer"
                              className="w-full h-[400px] rounded-xl bg-zinc-950 border-0"
                            />
                          ) : (
                            <img
                              src={selectedReceiptOrder.receiptImageUrl}
                              alt="Bank Transfer Receipt"
                              className="w-full h-auto max-h-[380px] object-contain"
                            />
                          )
                        ) : (
                          <div className="py-16 text-zinc-400 text-xs">No image or document provided</div>
                        )}
                      </div>
                    </div>

                    {/* Review Notes Input */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Approval / Audit Note
                      </label>
                      <input
                        type="text"
                        value={receiptReviewNote}
                        onChange={(e) => setReceiptReviewNote(e.target.value)}
                        placeholder="e.g. Bank slip verified against ComBank portal. Cleared."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-[#22222a] text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#3ad389]"
                      />
                    </div>
                  </div>

                  {/* Modal Footer Action Buttons */}
                  <div className="p-4 border-t border-[#1f1f23] bg-[#070708] flex items-center justify-between">
                    <button
                      type="button"
                      disabled={orderProcessingId === selectedReceiptOrder.orderNumber}
                      onClick={() => handleOrderAction(selectedReceiptOrder.orderNumber, 'REJECT')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 border border-rose-800/40 transition-colors disabled:opacity-50"
                    >
                      Reject Order
                    </button>

                    <div className="flex items-center gap-2">
                      {/* WhatsApp Dispatch Button */}
                      {(selectedReceiptOrder.whatsAppUrl || selectedReceiptOrder.customerWhatsapp) && (
                        <a
                          href={selectedReceiptOrder.whatsAppUrl || `https://wa.me/${selectedReceiptOrder.customerWhatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selectedReceiptOrder.customerName}, regarding your Fibez order ${selectedReceiptOrder.orderNumber}...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-black shadow-lg shadow-[#25D366]/20 transition-all"
                        >
                          <span>📲 Send via WhatsApp</span>
                        </a>
                      )}

                      <button
                        type="button"
                        disabled={orderProcessingId === selectedReceiptOrder.orderNumber}
                        onClick={() => handleOrderAction(selectedReceiptOrder.orderNumber, 'APPROVE')}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#3ad389] text-black font-bold text-xs hover:bg-[#32be7a] shadow-lg shadow-[#3ad389]/20 transition-all disabled:opacity-50"
                      >
                        {orderProcessingId === selectedReceiptOrder.orderNumber ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Dispensing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Dispense Keys Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 3x-ui LIVE V2RAY MANAGER — WINDSTER TELEMETRY ENHANCED */}
        {/* ========================================================================= */}
        {activeTab === 'v2ray' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Windster Breadcrumbs & Header Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] shadow-xl">
              <div>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mb-1.5">
                  <span className="hover:text-zinc-200 cursor-pointer" onClick={() => setActiveTab('overview')}>
                    Admin Console
                  </span>
                  <span>/</span>
                  <span className="text-zinc-300">Infrastructure</span>
                  <span>/</span>
                  <span className="text-[#3ad389] font-bold">Singapore Equinix SG3</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    3x-ui Live V2Ray Infrastructure
                  </h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                    xuiConnectionStatus === 'CONNECTED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${xuiConnectionStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    {xuiConnectionStatus === 'CONNECTED' ? `CONNECTED (${xuiLatencyMs}ms SG3)` : 'DISCONNECTED'}
                  </span>
                  {xuiAutoSyncEnabled && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                      Auto-Sync Active ({xuiSyncIntervalSec}s)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Panel: <span className="font-mono text-zinc-300">{xuiBaseUrlInput}</span> • Host: <span className="font-mono text-zinc-300">{v2rayPublicHost}</span> • {inbounds.length} Live Inbounds • {v2raySummary.totalClients} Clients
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <AnimatedButton
                  variant="default"
                  size="sm"
                  onClick={() => setIsConnectXuiOpen(true)}
                  className="font-mono text-xs"
                  title="Configure 3x-ui server credentials & auto-sync parameters"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#3ad389]" />
                  <span>Connect 3x-ui Panel</span>
                </AnimatedButton>

                <AnimatedButton
                  variant="dark"
                  size="sm"
                  onClick={handleTriggerInstantSync}
                  disabled={isRefreshing}
                  className="font-mono text-xs text-zinc-300 hover:text-white"
                  title="Force instant sync with 3x-ui panel"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Auto-Sync Everything</span>
                </AnimatedButton>

                <AnimatedButton
                  variant="emerald"
                  size="sm"
                  onClick={() => setIsAddV2rayOpen(true)}
                  className="font-mono text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Quick Add Node Client</span>
                </AnimatedButton>
              </div>
            </div>

            {/* Windster Hero Bandwidth Area Chart */}
            <WindsterAreaChart
              title="Singapore Equinix SG3 Bandwidth Flow"
              subtitle={`Live uplink (upload) vs downlink (download) traffic telemetry across all ${inbounds.length} inbounds`}
              data={v2rayTelemetryData}
              primaryName="Downlink Traffic"
              secondaryName="Uplink Traffic"
              primaryColor="#3ad389"
              secondaryColor="#06b6d4"
              unit="GB"
              trendText="+18.4% bandwidth spike"
              trendPositive={true}
              timeRanges={[
                { label: 'Last 7 Days', value: '7d' },
                { label: 'Last 30 Days', value: '30d' },
              ]}
              activeRange={v2rayTimeRange}
              onRangeChange={(r) => setV2rayTimeRange(r as any)}
            />

            {/* Inbounds Cards Grid with Real Health & Telemetry Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
              {inbounds.map((ib) => {
                const totalTraffic = (ib.upGB || 0) + (ib.downGB || 0);
                const downPct = totalTraffic > 0 ? Math.round(((ib.downGB || 0) / totalTraffic) * 100) : 95;
                const upPct = 100 - downPct;

                return (
                  <div
                    key={ib.id}
                    className="p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-4 hover:border-zinc-700 transition-colors shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                            Inbound #{ib.id} • {ib.protocol.toUpperCase()}
                          </span>
                          <h3 className="text-sm font-bold text-white mt-0.5 truncate max-w-[160px]" title={ib.remark}>
                            {ib.remark || 'Fibez Node'}
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          Port {ib.port}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono p-2.5 rounded-xl bg-[#141418] border border-[#1c1c22] mt-3">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-sans">Active Clients</span>
                          <span className="text-white font-bold">{ib.clients?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-sans">Total Traffic</span>
                          <span className="text-[#3ad389] font-bold">{ib.totalTrafficGB} GB</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 font-mono">
                        <span>↑ Up: {ib.upGB} GB</span>
                        <span>↓ Down: {ib.downGB} GB</span>
                      </div>
                    </div>

                    {/* Operational Health & Bandwidth Flow (Clean Unmetered Indicator) */}
                    <div className="space-y-1.5 pt-2 border-t border-[#18181f]">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-400">Node Status</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live • Unmetered
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#18181f] overflow-hidden flex">
                        <div
                          className="h-full bg-[#3ad389] transition-all duration-500"
                          style={{ width: `${downPct}%` }}
                          title={`Downlink: ${ib.downGB} GB (${downPct}%)`}
                        />
                        <div
                          className="h-full bg-cyan-400 transition-all duration-500"
                          style={{ width: `${upPct}%` }}
                          title={`Uplink: ${ib.upGB} GB (${upPct}%)`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>↓ Down {downPct}%</span>
                        <span>↑ Up {upPct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Windster High-Density Client Management Table Card */}
            <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] shadow-2xl space-y-5">
              {/* Header & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      All Active Inbound Clients
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {filteredV2rayClients.length} of {allV2rayClients.length} Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Real-time status, quota meters, expiry timers and traffic telemetry per client on {v2rayPublicHost}.
                  </p>
                </div>
              </div>

              {/* Windster Search & Carrier Filter Toolbars */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={v2raySearch}
                    onChange={(e) => setV2raySearch(e.target.value)}
                    placeholder="Search by email, remark, port or UUID..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141418] border border-[#22222a] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                  />
                  {v2raySearch && (
                    <button
                      onClick={() => setV2raySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Carrier ISP Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'ALL', label: 'All ISPs' },
                    { id: 'DIALOG', label: 'Dialog' },
                    { id: 'SLT', label: 'SLT Fiber' },
                    { id: 'AIRTEL', label: 'Airtel' },
                    { id: 'HUTCH', label: 'Hutch' },
                    { id: 'MOBITEL', label: 'Mobitel' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setV2rayIspFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        v2rayIspFilter === f.id
                          ? 'bg-[#3ad389] text-black font-bold shadow-sm'
                          : 'bg-[#141418] text-zinc-400 hover:text-white border border-[#22222a]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Usage Status Filter Pills */}
                <div className="flex items-center p-0.5 rounded-xl bg-[#141418] border border-[#22222a] shrink-0">
                  {[
                    { id: 'ALL', label: 'All Quota' },
                    { id: 'UNMETERED', label: '∞ Unmetered' },
                    { id: 'NORMAL', label: '<75%' },
                    { id: 'HEAVY', label: '>75%' },
                    { id: 'FULL', label: 'Capped' },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setV2rayUsageFilter(u.id as any)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all ${
                        v2rayUsageFilter === u.id
                          ? 'bg-[#22222a] text-[#3ad389] font-bold shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Windster Table */}
              <div className="overflow-x-auto rounded-xl border border-[#1f1f23]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121217]">
                    <tr className="border-b border-[#1f1f23] text-zinc-400 font-mono text-[11px]">
                      <th className="py-3 px-4 font-semibold">Carrier / ISP</th>
                      <th className="py-3 px-4 font-semibold">Client Identifier</th>
                      <th className="py-3 px-4 font-semibold">Node & Port</th>
                      <th className="py-3 px-4 font-semibold">Quota Consumption</th>
                      <th className="py-3 px-4 font-semibold">Expiry</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f23]/60 bg-[#0c0c0e]">
                    {filteredV2rayClients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-zinc-400 font-mono text-xs">
                          No matching V2Ray clients found for the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredV2rayClients.map((cl) => {
                        const isUnlimited =
                          cl.totalGB === 'Unlimited' ||
                          !cl.totalGB ||
                          cl.totalGB === 0 ||
                          typeof cl.totalGB !== 'number';
                        const totalLimit = typeof cl.totalGB === 'number' ? cl.totalGB : 0;
                        const pctUsed =
                          !isUnlimited && totalLimit > 0
                            ? Math.min(100, Math.round((cl.usedGB / totalLimit) * 100))
                            : 0;

                        // Determine ISP tag
                        const text = (cl.remark + ' ' + cl.email).toLowerCase();
                        let ispBadge = 'DLG';
                        let ispColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
                        if (text.includes('slt') || cl.port === 445 || cl.port === 444) {
                          ispBadge = 'SLT';
                          ispColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                        } else if (text.includes('airtel')) {
                          ispBadge = 'AIR';
                          ispColor = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
                        } else if (text.includes('hutch')) {
                          ispBadge = 'HTC';
                          ispColor = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
                        } else if (text.includes('mobitel') || cl.port === 4445) {
                          ispBadge = 'MOB';
                          ispColor = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
                        }

                        return (
                          <tr key={`${cl.inboundId}_${cl.email}`} className="hover:bg-zinc-900/40 transition-colors">
                            {/* Carrier Tag */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${ispColor}`}>
                                {ispBadge}
                              </span>
                            </td>

                            {/* Client Email & Remark */}
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-bold text-white text-xs">{cl.email}</div>
                              <div className="text-[11px] text-zinc-400 font-sans truncate max-w-[220px]">
                                {cl.remark || 'Fibez Speedline'}
                              </div>
                            </td>

                            {/* Port & Inbound */}
                            <td className="py-3.5 px-4 font-mono">
                              <span className="text-zinc-200 font-bold">Port {cl.port}</span>
                              <span className="text-[10px] text-zinc-500 block">Inbound #{cl.inboundId}</span>
                            </td>

                            {/* Quota Progress Meter */}
                            <td className="py-3.5 px-4 min-w-[190px]">
                              {isUnlimited ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                                    <span className="text-white font-bold">{cl.usedGB} GB</span>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      Unmetered
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-[#1c1c22] overflow-hidden">
                                    <div className="h-full rounded-full bg-emerald-500/30 w-full" />
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                                    <span className="text-white font-bold">{cl.usedGB} GB</span>
                                    <span className="text-zinc-400">/ {totalLimit} GB</span>
                                    <span
                                      className={`text-[10px] font-bold ${
                                        pctUsed >= 90 ? 'text-rose-400' : pctUsed >= 70 ? 'text-amber-400' : 'text-emerald-400'
                                      }`}
                                    >
                                      ({pctUsed}%)
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-[#1c1c22] overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        pctUsed >= 90 ? 'bg-rose-500' : pctUsed >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${Math.max(4, pctUsed)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Expiry */}
                            <td className="py-3.5 px-4 text-zinc-400 text-[11px] font-mono">
                              {cl.expiryTime}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleCopyClientVless(cl)}
                                className="px-2.5 py-1 rounded-lg bg-[#18181f] hover:bg-zinc-800 text-[#3ad389] hover:text-white border border-[#272730] text-[11px] font-mono transition-colors"
                                title="Copy 1-click VLESS import URI"
                              >
                                Copy URI
                              </button>

                              <button
                                disabled={v2rayActionLoading === cl.email}
                                onClick={() => handleResetV2rayTraffic(cl.email)}
                                className="px-2.5 py-1 rounded-lg bg-[#18181f] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#272730] text-[11px] font-mono transition-colors disabled:opacity-50"
                                title="Reset used bandwidth back to 0"
                              >
                                Reset GB
                              </button>

                              <button
                                disabled={v2rayActionLoading === cl.email}
                                onClick={() => handleDeleteV2rayClient(cl.email)}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 text-[11px] font-mono transition-colors disabled:opacity-50"
                                title="Remove client from 3x-ui"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Windster Table Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-zinc-400 font-mono">
                <div>
                  Showing <span className="text-white font-bold">{filteredV2rayClients.length}</span> of{' '}
                  <span className="text-white font-bold">{allV2rayClients.length}</span> total clients across Singapore SG3
                </div>
                <div className="text-[11px]">
                  Aggregated Filtered Bandwidth:{' '}
                  <span className="text-[#3ad389] font-bold">
                    {filteredV2rayClients.reduce((acc, c) => acc + (c.usedGB || 0), 0).toFixed(1)} GB
                  </span>
                </div>
              </div>
            </div>

            {/* Connect 3x-ui Panel & Auto-Sync Engine Modal */}
            {isConnectXuiOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                <div className="w-full max-w-lg rounded-[24px] bg-[#0c0c0e] border border-[#26262e] p-6 shadow-2xl relative space-y-5">
                  <button
                    onClick={() => {
                      setIsConnectXuiOpen(false);
                      setXuiModalError(null);
                    }}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#16161a] border border-[#26262d] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#141418] border border-[#24242c] flex items-center justify-center text-[#3ad389]">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Connect 3x-ui Panel &amp; Auto-Sync</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Connect your Xray / 3x-ui admin backend to auto-sync inbounds, clients &amp; telemetry
                      </p>
                    </div>
                  </div>

                  {xuiModalError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                      {xuiModalError}
                    </div>
                  )}

                  <form onSubmit={handleConnectXui} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        3x-ui Panel Base URL (Protocol + Host + Port)
                      </label>
                      <input
                        type="text"
                        value={xuiBaseUrlInput}
                        onChange={(e) => setXuiBaseUrlInput(e.target.value)}
                        placeholder="https://your-panel-host:port"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-[#24242c] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                          Panel Admin Username
                        </label>
                        <input
                          type="text"
                          value={xuiUsernameInput}
                          onChange={(e) => setXuiUsernameInput(e.target.value)}
                          placeholder="akain"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-[#24242c] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                          Panel Admin Password
                        </label>
                        <div className="relative">
                          <input
                            type={showXuiPassword ? 'text' : 'password'}
                            value={xuiPasswordInput}
                            onChange={(e) => setXuiPasswordInput(e.target.value)}
                            placeholder="Enter new password or leave blank"
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#141418] border border-[#24242c] text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#3ad389] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowXuiPassword(!showXuiPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                          >
                            {showXuiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Public VLESS Host Domain (Clients connect to this)
                      </label>
                      <input
                        type="text"
                        value={xuiPublicHostInput}
                        onChange={(e) => setXuiPublicHostInput(e.target.value)}
                        placeholder="rv2ray.fibez.store"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141418] border border-[#24242c] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                      />
                    </div>

                    {/* Auto-Sync Configuration Controls */}
                    <div className="p-3.5 rounded-xl bg-[#141418] border border-[#24242c] space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Live Real-Time Auto-Sync</div>
                          <div className="text-[11px] text-zinc-400">
                            Continuously polls inbounds, bandwidth &amp; clients from 3x-ui
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setXuiAutoSyncEnabled(!xuiAutoSyncEnabled)}
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                            xuiAutoSyncEnabled ? 'bg-[#3ad389]' : 'bg-[#22222a]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-black transition-transform ${
                              xuiAutoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {xuiAutoSyncEnabled && (
                        <div className="flex items-center justify-between pt-2 border-t border-[#1f1f26]">
                          <span className="text-[11px] font-mono text-zinc-400">Sync Frequency</span>
                          <div className="flex items-center gap-1.5">
                            {[15, 30, 60].map((sec) => (
                              <button
                                key={sec}
                                type="button"
                                onClick={() => setXuiSyncIntervalSec(sec)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                                  xuiSyncIntervalSec === sec
                                    ? 'bg-[#3ad389] text-black font-bold'
                                    : 'bg-[#1b1b22] text-zinc-400 hover:text-white'
                                }`}
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleTestXuiConnection}
                        disabled={isTestingXui}
                        className="px-4 py-2.5 rounded-xl bg-[#16161c] hover:bg-[#202028] text-xs font-mono text-zinc-300 hover:text-white border border-[#292934] flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Zap className={`w-3.5 h-3.5 text-amber-400 ${isTestingXui ? 'animate-bounce' : ''}`} />
                        <span>{isTestingXui ? 'Testing...' : 'Test Connection'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsConnectXuiOpen(false);
                            setXuiModalError(null);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#16161a] hover:bg-[#202026] text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingXui}
                          className="px-5 py-2.5 rounded-xl bg-[#3ad389] hover:bg-[#34bd7a] text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSavingXui ? 'animate-spin' : ''}`} />
                          <span>{isSavingXui ? 'Connecting...' : 'Connect & Auto-Sync'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Quick Add Client Modal */}
            {isAddV2rayOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleAddQuickV2rayClient}
                  className="max-w-md w-full p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#3ad389]" />
                      Add Direct 3x-ui Client
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddV2rayOpen(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Client Email / Identifier
                    </label>
                    <input
                      type="text"
                      required
                      value={newV2rayEmail}
                      onChange={(e) => setNewV2rayEmail(e.target.value)}
                      placeholder="e.g. user_dialog_vip10"
                      className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                      <span>Package / Carrier Preset</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Auto-syncs Port & SNI</span>
                    </label>
                    <select
                      value={newV2rayPreset}
                      onChange={(e) => handlePresetSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                    >
                      <optgroup label="Dialog Packages (Port 443)">
                        <option value="dialog_zoom">Dialog Zoom & Teams Router (298 / 724)</option>
                        <option value="dialog_tiktok">Dialog TikTok Mobile SIM (297 / 997)</option>
                        <option value="dialog_social">Dialog Social Media Blaster (#678#)</option>
                        <option value="dialog_video">Dialog Video Conferencing (224 / 724)</option>
                      </optgroup>
                      <optgroup label="SLT Fiber & 4G (Port 445 / 444)">
                        <option value="slt_meet">SLT Fiber Zoom & Meet (Port 445)</option>
                        <option value="slt_netflix">SLT Fiber Netflix & Streaming 1990 (Port 444)</option>
                        <option value="slt_prepaid_zoom">SLT 4G Prepaid Zoom 235 (Port 445)</option>
                      </optgroup>
                      <optgroup label="Airtel Packages (Port 443)">
                        <option value="airtel_tiktok">Airtel TikTok Unlimited (297 / 997)</option>
                        <option value="airtel_youtube">Airtel YouTube (135 / 260)</option>
                        <option value="airtel_zoom">Airtel Work & Study Zoom (215)</option>
                      </optgroup>
                      <optgroup label="Hutch & Mobitel">
                        <option value="hutch_zoom">Hutch Zoom & Social Blaster (224 / 494 / 794 - Port 443)</option>
                        <option value="mobitel_zoom">Mobitel Zoom SIM - Android IP Hunt (Port 4445)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Target Inbound Port
                    </label>
                    <select
                      value={newV2rayInbound}
                      onChange={(e) => handleQuickInboundChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                    >
                      <option value={1}>Inbound 1: Port 445 (SLT Meet / Zoom)</option>
                      <option value={2}>Inbound 2: Port 444 (SLT Netflix)</option>
                      <option value={3}>Inbound 3: Port 443 (Dialog, Airtel & Hutch)</option>
                      <option value={4}>Inbound 4: Port 4445 (Mobitel Zoom SIM)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Bandwidth Limit (GB)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newV2rayQuotaGB}
                        onChange={(e) => setNewV2rayQuotaGB(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Expiry (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newV2rayDays}
                        onChange={(e) => setNewV2rayDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-zinc-300">
                        SNI Domain
                      </label>
                      <span className="text-[10px] text-zinc-400 font-mono">Auto-syncs with package/port</span>
                    </div>
                    <input
                      type="text"
                      value={newV2raySni}
                      onChange={(e) => setNewV2raySni(e.target.value)}
                      placeholder="e.g. zoom.us or m.tiktok.com"
                      className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                    />
                    {/* 1-Click Quick SNI Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        { label: 'zoom.us', hint: 'Dialog / SLT' },
                        { label: 'm.tiktok.com', hint: 'TikTok' },
                        { label: 'api.netflix.com', hint: 'Netflix' },
                        { label: 'm.facebook.com', hint: 'Social' },
                        { label: 'meet.google.com', hint: 'Meet' },
                        { label: 'm.youtube.com', hint: 'YouTube' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setNewV2raySni(item.label)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            newV2raySni === item.label
                              ? 'bg-[#3ad389]/20 text-[#3ad389] border-[#3ad389]/50 font-bold'
                              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddV2rayOpen(false)}
                      className="px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={v2rayActionLoading === 'quick_add'}
                      className="px-4 py-2 rounded-xl bg-[#3ad389] text-black font-bold text-xs hover:bg-[#32be7a] transition-all"
                    >
                      Create Node Client
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4.5: V2RAY PACKAGES & DYNAMIC PRICING CONTROL */}
        {/* ========================================================================= */}
        {activeTab === 'packages' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header & Stats Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    PXN FORMULA POWERED
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    Tiered Quota Dropdowns (100 GB – Unlimited)
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                  V2Ray Packages & Dynamic Pricing Control
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage all 24 carrier-optimized ISP packages, interactive quota tiers, reload codes, speed limit notices, and pricing adjustments. Changes reflect instantly on the public storefront.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsAddingPackage(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3ad389] text-black hover:bg-[#32be7a] transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Package</span>
                </button>
                <Link
                  href="/v2ray"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#18181b] text-zinc-200 border border-[#27272a] hover:border-zinc-700 hover:text-white transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#3ad389]" />
                  <span>View Public Storefront</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative overflow-hidden p-4 rounded-xl bg-[#0d0d0f] border border-[#1f1f23] group">
                <GlowingEffect color="emerald" proximity={50} />
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Total Packages</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  <Counter value={adminPackages.length || 24} fontSize={24} fontWeight={700} tabular />
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">Across 5 Sri Lankan ISPs</div>
              </div>
              <div className="relative overflow-hidden p-4 rounded-xl bg-[#0d0d0f] border border-[#1f1f23] group">
                <GlowingEffect color="emerald" proximity={50} />
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Live On Storefront</div>
                <div className="text-2xl font-bold text-[#3ad389] mt-1 font-mono flex items-center gap-1.5">
                  <Counter value={adminPackages.filter((p) => p.isActive).length} fontSize={24} fontWeight={700} tabular />
                  <span>Active</span>
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-1">Purchasable right now</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0d0d0f] border border-[#1f1f23]">
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Standard SG Server</div>
                <div className="text-2xl font-bold text-blue-400 mt-1 font-mono">200 – 800 LKR</div>
                <div className="text-[10px] text-zinc-400 mt-1">100 GB up to Unlimited (30d)</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0d0d0f] border border-[#1f1f23]">
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Sri Lankan IP Edition</div>
                <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">500 – 1,100 LKR</div>
                <div className="text-[10px] text-zinc-400 mt-1">+300 LKR dedicated LK gateway</div>
              </div>
            </div>

            {/* ISP Filter Tabs & Add Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {(['ALL', 'Dialog', 'SLT', 'Airtel', 'Hutch', 'Mobitel'] as const).map((isp) => {
                  const count = isp === 'ALL'
                    ? adminPackages.length
                    : adminPackages.filter((p) => normalizeIsp(p.isp) === isp).length;
                  const activeCount = isp === 'ALL'
                    ? adminPackages.filter((p) => p.isActive).length
                    : adminPackages.filter((p) => normalizeIsp(p.isp) === isp && p.isActive).length;

                  return (
                    <button
                      key={isp}
                      onClick={() => setPackageIspFilter(isp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                        packageIspFilter === isp
                          ? 'bg-[#18181b] text-white border border-[#27272a] shadow-sm font-semibold'
                          : 'text-zinc-400 hover:text-white bg-[#0d0d0f] border border-[#1f1f23]'
                      }`}
                    >
                      <span>{isp === 'ALL' ? 'All Providers' : isp}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                        {activeCount}/{count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatedButton
                variant="emerald"
                size="sm"
                onClick={() => setIsAddingPackage(true)}
                className="hidden sm:inline-flex text-xs font-bold shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Package</span>
              </AnimatedButton>
            </div>

            {/* Package Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAdminPackages.map((pkg) => {
                const isSaving = packageSavingId === pkg.id;
                const currentIsp = normalizeIsp(pkg.isp);

                const ispStyles: Record<V2RayIsp, { bg: string; text: string; border: string }> = {
                  Dialog: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
                  SLT: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
                  Airtel: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
                  Hutch: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
                  Mobitel: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
                };
                const style = ispStyles[currentIsp];

                return (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${
                      pkg.isActive
                        ? 'bg-[#0d0d0f] border-[#1f1f23] hover:border-zinc-700 shadow-lg'
                        : 'bg-[#070708]/60 border-[#1a1a1c] opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top ISP + Status Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${style.bg} ${style.text} border ${style.border}`}>
                            {currentIsp}
                          </span>
                          {pkg.isCustom && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              CUSTOM
                            </span>
                          )}
                          {pkg.serverType === 'LK_IP' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              LK IP
                            </span>
                          )}
                          {pkg.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {pkg.badge}
                            </span>
                          )}
                        </div>

                        {/* Visibility Toggle */}
                        <button
                          onClick={() => handleTogglePackageActive(pkg.id)}
                          disabled={isSaving}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            pkg.isActive ? 'bg-[#3ad389]' : 'bg-zinc-800'
                          }`}
                          title={pkg.isActive ? 'Click to hide from store' : 'Click to show on store'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                              pkg.isActive ? 'translate-x-4' : 'translate-x-0 bg-zinc-400'
                            }`}
                          />
                        </button>
                      </div>

                      {/* 3D Thumbnail Banner Preview with authentic ISP carrier logo & theme */}
                      <div className="w-full overflow-hidden rounded-xl">
                        <V2RayThumbnail
                          isp={currentIsp}
                          title={pkg.title}
                          badge={pkg.badge}
                          inboundPort={pkg.inboundPort || pkg.port || 443}
                          sni={pkg.sni || 'zoom.us'}
                          categoryLabel={pkg.categoryLabel || (pkg.serverType === 'LK_IP' ? 'Sri Lankan IP' : 'Equinix SG3')}
                          packageId={pkg.id}
                        />
                      </div>

                      {/* Package Title & Reload Code */}
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {pkg.title}
                        </h3>
                        {pkg.reloadCode && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-zinc-400">Reload / Activation:</span>
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#141417] text-amber-400 border border-[#27272a]">
                              {pkg.reloadCode}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Technical Details Strip */}
                      <div className="p-2.5 rounded-xl bg-[#070708] border border-[#1a1a1c] space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Inbound Node:</span>
                          <span className="font-mono text-zinc-200">
                            Inbound {pkg.inboundId || 3} (Port {pkg.inboundPort || pkg.port || 443})
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>SNI Spoofing:</span>
                          <span className="font-mono text-emerald-400 font-semibold">{pkg.sni || 'zoom.us'}</span>
                        </div>
                        <div className="flex items-start justify-between gap-2 text-zinc-400 pt-1 border-t border-[#1a1a1c]">
                          <span>Speed Spec:</span>
                          <span className="text-[10px] text-right text-zinc-300 font-mono">
                            {pkg.carrierSpeedNote || 'No Speed Limit'}
                          </span>
                        </div>
                      </div>

                      {/* Pricing Preview */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-zinc-400">Storefront Price:</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-white">
                            {pkg.serverType === 'LK_IP' ? '500 – 1,100' : '200 – 800'} LKR
                          </span>
                          {pkg.standardPriceAdjustmentLKR !== 0 && (
                            <span className="text-[10px] text-amber-400 font-mono ml-1.5">
                              ({pkg.standardPriceAdjustmentLKR > 0 ? '+' : ''}{pkg.standardPriceAdjustmentLKR} LKR)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="mt-4 pt-3 border-t border-[#1a1a1c] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${pkg.isActive ? 'bg-[#3ad389]' : 'bg-zinc-600'}`} />
                        <span className="text-[10px] font-mono text-zinc-400">
                          {pkg.isActive ? 'Active on Storefront' : 'Hidden from Buyers'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {pkg.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeletePackage(pkg.id, pkg.title)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer"
                            title="Delete custom package"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingPackage({ ...pkg })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-[#18181b] border border-[#27272a] hover:border-zinc-600 transition-all cursor-pointer"
                        >
                          <Sliders className="w-3 h-3 text-[#3ad389]" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* ADD PACKAGE MODAL (WITH LIVE REACTIVE ISP THUMBNAIL) */}
            {/* ========================================================================= */}
            {isAddingPackage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                <div className="w-full max-w-xl bg-[#0d0d0f] border border-[#27272a] rounded-2xl shadow-2xl p-6 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#1f1f23] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3ad389]/15 text-[#3ad389] border border-[#3ad389]/30">
                          NEW NODE
                        </span>
                        <h3 className="text-base font-bold text-white">
                          Create New V2Ray Package
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Add a carrier-optimized package with live thumbnail preview and custom routing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingPackage(false)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* LIVE INTERACTIVE THUMBNAIL PREVIEW */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>Live Carrier Thumbnail Preview:</span>
                      <span className="text-[#3ad389] font-semibold text-[11px]">Updates live with selected ISP</span>
                    </div>
                    <div className="w-full overflow-hidden rounded-xl border border-zinc-800 shadow-xl">
                      <V2RayThumbnail
                        isp={newPackage.isp}
                        title={newPackage.title || 'Package Title Preview'}
                        badge={newPackage.badge || undefined}
                        inboundPort={Number(newPackage.inboundPort) || 443}
                        sni={newPackage.sni || 'zoom.us'}
                        categoryLabel={newPackage.serverType === 'LK_IP' ? 'Sri Lankan IP' : (newPackage.categoryLabel || 'Home Broadband')}
                      />
                    </div>
                  </div>

                  <form onSubmit={handleCreatePackage} className="space-y-4">
                    {/* ISP SELECTOR BUTTONS */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
                        Select Telecom Carrier (ISP) *
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {(['Dialog', 'SLT', 'Airtel', 'Hutch', 'Mobitel'] as const).map((ispOption) => {
                          const isSelected = newPackage.isp === ispOption;
                          const ispBadgeStyles: Record<V2RayIsp, { activeBg: string; text: string; border: string }> = {
                            Dialog: { activeBg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
                            SLT: { activeBg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
                            Airtel: { activeBg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
                            Hutch: { activeBg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
                            Mobitel: { activeBg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
                          };
                          const s = ispBadgeStyles[ispOption];

                          return (
                            <button
                              key={ispOption}
                              type="button"
                              onClick={() => setNewPackage({ ...newPackage, isp: ispOption })}
                              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                isSelected
                                  ? `${s.activeBg} ${s.text} ${s.border} ring-1 ring-white/20 shadow-lg`
                                  : 'bg-[#121215] text-zinc-400 hover:text-white border-[#1f1f23]'
                              }`}
                            >
                              <span>{ispOption}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1 block">
                        Package Title *
                      </label>
                      <input
                        type="text"
                        value={newPackage.title}
                        onChange={(e) => setNewPackage({ ...newPackage, title: e.target.value })}
                        placeholder="e.g. Dialog Zoom & Teams Unlimited VIP"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Category Label */}
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">
                          Category Label
                        </label>
                        <input
                          type="text"
                          value={newPackage.categoryLabel}
                          onChange={(e) => setNewPackage({ ...newPackage, categoryLabel: e.target.value })}
                          placeholder="e.g. Home Broadband, Social Media"
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                        />
                      </div>

                      {/* Badge */}
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">
                          Highlight Badge (Optional)
                        </label>
                        <input
                          type="text"
                          value={newPackage.badge}
                          onChange={(e) => setNewPackage({ ...newPackage, badge: e.target.value })}
                          placeholder="e.g. BESTSELLER, NO SPEED LIMIT"
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Inbound Port */}
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">
                          Inbound Port
                        </label>
                        <select
                          value={newPackage.inboundPort}
                          onChange={(e) => {
                            const port = Number(e.target.value);
                            setNewPackage({
                              ...newPackage,
                              inboundPort: port,
                              inboundId: port === 445 ? 1 : 3,
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none font-mono"
                        >
                          <option value={443}>Port 443 (Inbound 3: General Standard)</option>
                          <option value={445}>Port 445 (Inbound 1: SLT Meet / Specialized)</option>
                          <option value={80}>Port 80 (HTTP Fallback)</option>
                          <option value={8080}>Port 8080 (Alternative Proxy)</option>
                          <option value={2053}>Port 2053 (Cloudflare SSL)</option>
                        </select>
                      </div>

                      {/* Masquerade SNI */}
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">
                          Masquerade SNI *
                        </label>
                        <input
                          type="text"
                          value={newPackage.sni}
                          onChange={(e) => setNewPackage({ ...newPackage, sni: e.target.value })}
                          placeholder="e.g. zoom.us, m.tiktok.com, netflix.com"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Target Medium */}
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">
                          Target Medium
                        </label>
                        <select
                          value={newPackage.targetMedium}
                          onChange={(e) => setNewPackage({ ...newPackage, targetMedium: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                        >
                          <option value="Home Broadband Router">Home Broadband Router</option>
                          <option value="Mobile 4G/5G SIM">Mobile 4G/5G SIM</option>
                          <option value="Fiber & 4G">Fiber & 4G</option>
                          <option value="Android Only">Android Only</option>
                        </select>
                      </div>

                      {/* Server Gateway Type */}
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">
                          Server Gateway Type
                        </label>
                        <select
                          value={newPackage.serverType}
                          onChange={(e) => setNewPackage({ ...newPackage, serverType: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                        >
                          <option value="STANDARD">Standard Singapore Node (Equinix SG3)</option>
                          <option value="LK_IP">Dedicated Sri Lankan IP Gateway (+300 LKR)</option>
                        </select>
                      </div>
                    </div>

                    {/* Reload Code */}
                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1 block">
                        Reload / Activation Instruction
                      </label>
                      <input
                        type="text"
                        value={newPackage.reloadCode}
                        onChange={(e) => setNewPackage({ ...newPackage, reloadCode: e.target.value })}
                        placeholder="e.g. #678# -> Video Conferencing (298 / 724)"
                        className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                      />
                    </div>

                    {/* Speed Note */}
                    <div>
                      <label className="text-xs font-medium text-zinc-400 mb-1 block">
                        Speed Spec Note
                      </label>
                      <input
                        type="text"
                        value={newPackage.carrierSpeedNote}
                        onChange={(e) => setNewPackage({ ...newPackage, carrierSpeedNote: e.target.value })}
                        placeholder="e.g. Unmetered · No Carrier Speed Limit on Routers"
                        className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                      />
                    </div>

                    {/* Price Adjustment & Active */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="text-xs font-medium text-zinc-400 mb-1 block">
                          Price Adjustment (LKR)
                        </label>
                        <input
                          type="number"
                          value={newPackage.standardPriceAdjustmentLKR}
                          onChange={(e) => setNewPackage({ ...newPackage, standardPriceAdjustmentLKR: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none font-mono"
                        />
                      </div>

                      <div className="pt-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="newPkgActive"
                          checked={newPackage.isActive}
                          onChange={(e) => setNewPackage({ ...newPackage, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#3ad389] focus:ring-[#3ad389]"
                        />
                        <label htmlFor="newPkgActive" className="text-xs text-white cursor-pointer select-none font-medium">
                          Active & Visible on Storefront
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1f1f23]">
                      <button
                        type="button"
                        onClick={() => setIsAddingPackage(false)}
                        className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingPackage}
                        className="px-5 py-2.5 rounded-xl bg-[#3ad389] text-black font-bold text-xs hover:bg-[#32be7a] transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingPackage ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>Create & Publish Package</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* EDIT PACKAGE MODAL (WITH LIVE REACTIVE ISP THUMBNAIL) */}
            {/* ========================================================================= */}
            {editingPackage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                <div className="w-full max-w-xl bg-[#0d0d0f] border border-[#27272a] rounded-2xl shadow-2xl p-6 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#1f1f23] pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Edit Package Configuration
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        {editingPackage.id} • {normalizeIsp(editingPackage.isp)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* LIVE THUMBNAIL PREVIEW IN EDIT MODAL */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>Live Carrier Thumbnail Preview:</span>
                      <span className="text-[#3ad389] font-semibold text-[11px]">Real-time preview</span>
                    </div>
                    <div className="w-full overflow-hidden rounded-xl border border-zinc-800 shadow-xl">
                      <V2RayThumbnail
                        isp={normalizeIsp(editingPackage.isp)}
                        title={editingPackage.title || 'Package Title'}
                        badge={editingPackage.badge || undefined}
                        inboundPort={Number(editingPackage.inboundPort || editingPackage.port) || 443}
                        sni={editingPackage.sni || 'zoom.us'}
                        categoryLabel={editingPackage.serverType === 'LK_IP' ? 'Sri Lankan IP' : (editingPackage.categoryLabel || 'Home Broadband')}
                        packageId={editingPackage.id}
                      />
                    </div>
                  </div>

                  <form onSubmit={handleSavePackageEdit} className="space-y-4">
                    {/* ISP SELECTOR BUTTONS IN EDIT MODAL */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
                        Carrier (ISP)
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {(['Dialog', 'SLT', 'Airtel', 'Hutch', 'Mobitel'] as const).map((ispOption) => {
                          const isSelected = normalizeIsp(editingPackage.isp) === ispOption;
                          const ispBadgeStyles: Record<V2RayIsp, { activeBg: string; text: string; border: string }> = {
                            Dialog: { activeBg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
                            SLT: { activeBg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
                            Airtel: { activeBg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
                            Hutch: { activeBg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
                            Mobitel: { activeBg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
                          };
                          const s = ispBadgeStyles[ispOption];

                          return (
                            <button
                              key={ispOption}
                              type="button"
                              onClick={() => setEditingPackage({ ...editingPackage, isp: ispOption })}
                              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                isSelected
                                  ? `${s.activeBg} ${s.text} ${s.border} ring-1 ring-white/20 shadow-lg`
                                  : 'bg-[#121215] text-zinc-400 hover:text-white border-[#1f1f23]'
                              }`}
                            >
                              <span>{ispOption}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1">
                        Package Display Title
                      </label>
                      <input
                        type="text"
                        value={editingPackage.title || ''}
                        onChange={(e) => setEditingPackage({ ...editingPackage, title: e.target.value })}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">
                          Reload Code / Activation
                        </label>
                        <input
                          type="text"
                          value={editingPackage.reloadCode || ''}
                          onChange={(e) => setEditingPackage({ ...editingPackage, reloadCode: e.target.value })}
                          placeholder="e.g. 297 / 997"
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">
                          Highlight Badge
                        </label>
                        <input
                          type="text"
                          value={editingPackage.badge || ''}
                          onChange={(e) => setEditingPackage({ ...editingPackage, badge: e.target.value })}
                          placeholder="e.g. POPULAR, HOT"
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">
                          Inbound Port
                        </label>
                        <input
                          type="number"
                          value={editingPackage.inboundPort || editingPackage.port || 443}
                          onChange={(e) => setEditingPackage({ ...editingPackage, inboundPort: Number(e.target.value), port: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">
                          Masquerade SNI
                        </label>
                        <input
                          type="text"
                          value={editingPackage.sni || ''}
                          onChange={(e) => setEditingPackage({ ...editingPackage, sni: e.target.value })}
                          placeholder="e.g. zoom.us"
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1">
                        Carrier Speed & Throttling Transparency Note
                      </label>
                      <input
                        type="text"
                        value={editingPackage.carrierSpeedNote || ''}
                        onChange={(e) => setEditingPackage({ ...editingPackage, carrierSpeedNote: e.target.value })}
                        placeholder="e.g. Dialog SIM - 2 Mbps cap unless bypassed"
                        className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">
                          Base Price Adjustment (LKR)
                        </label>
                        <input
                          type="number"
                          value={editingPackage.standardPriceAdjustmentLKR || 0}
                          onChange={(e) => setEditingPackage({ ...editingPackage, standardPriceAdjustmentLKR: Number(e.target.value) })}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-[#070708] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none font-mono"
                        />
                        <span className="text-[10px] text-zinc-400 mt-0.5 block">
                          Applied across all quota tiers (+ / -)
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">
                          Storefront Visibility
                        </label>
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id="editPkgActive"
                            checked={Boolean(editingPackage.isActive)}
                            onChange={(e) => setEditingPackage({ ...editingPackage, isActive: e.target.checked })}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#3ad389] focus:ring-[#3ad389]"
                          />
                          <label htmlFor="editPkgActive" className="text-xs text-white cursor-pointer select-none">
                            Active & Purchasable
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#070708] border border-[#1f1f23] text-xs text-zinc-400 space-y-1 font-mono">
                      <div className="text-zinc-300 font-semibold">Active Routing Parameters:</div>
                      <div>• Inbound Target: Inbound {editingPackage.inboundId || 3} (Port {editingPackage.inboundPort || editingPackage.port || 443})</div>
                      <div>• SNI Handshake: {editingPackage.sni || 'zoom.us'}</div>
                      <div>• Target Medium: {editingPackage.targetMedium || 'Home Broadband Router'}</div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1f1f23]">
                      <button
                        type="button"
                        onClick={() => setEditingPackage(null)}
                        className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={packageSavingId === editingPackage.id}
                        className="px-5 py-2 rounded-xl bg-[#3ad389] text-black font-bold text-xs hover:bg-[#32be7a] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {packageSavingId === editingPackage.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Save Package Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DIGITAL VAULT & INVENTORY */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header & Reset Controls Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389] animate-pulse" />
                    VAULT DISPENSE ENGINE
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">LIVE KEY STORAGE</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Digital Inventory & Vault Stock
                </h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Pre-load serial keys, Canva team invite URLs, and CapCut accounts. Keys are automatically dispensed to customers on bank verification and key vault checkout.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('vault-ingestion-form');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#3ad389] hover:bg-[#32be7a] text-black text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Ingest Stock</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="relative overflow-hidden p-4 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] group">
                <GlowingEffect color="emerald" proximity={50} />
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">TOTAL INVENTORY</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  <Counter value={inventoryItems.length} fontSize={24} fontWeight={700} tabular />
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">Total items in vault</div>
              </div>

              <div className="relative overflow-hidden p-4 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] group">
                <GlowingEffect color="emerald" proximity={50} />
                <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389] animate-pulse" />
                  AVAILABLE STOCK
                </div>
                <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                  <Counter value={availableInventoryCount} fontSize={24} fontWeight={700} tabular />
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">Ready for 1-click dispense</div>
              </div>

              <div className="relative overflow-hidden p-4 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] group">
                <GlowingEffect color="emerald" proximity={50} />
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">DISPENSED KEYS</div>
                <div className="text-2xl font-bold text-zinc-300 mt-1 font-mono">
                  <Counter value={dispensedInventoryCount} fontSize={24} fontWeight={700} tabular />
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">Claimed by orders</div>
              </div>

              <div className="relative overflow-hidden p-4 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] group">
                <GlowingEffect color="emerald" proximity={50} />
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">IN-STOCK SKUS</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  <Counter value={activeProductsWithStockCount} fontSize={24} fontWeight={700} tabular />
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">Distinct products in vault</div>
              </div>
            </div>

            {/* CATALOG PRODUCTS & STOCK HEALTH - OFFICIAL THUMBNAILS (LIKE V2RAY PACKAGES) */}
            <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#3ad389]" />
                    Catalog Products & Stock Health ({filteredStockSummary.length})
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Click any product to instantly load it into the Batch Importer or filter its active vault keys.
                  </p>
                </div>

                {/* Search in catalog */}
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    placeholder="Search product cards..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#141418] border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389]"
                  />
                  {catalogSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCatalogSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'ALL', label: `All Products (${stockSummary.length})` },
                  { id: 'IN_STOCK', label: `In Stock Only (${stockSummary.filter((s) => s.available > 0).length})` },
                  { id: 'giftcard', label: 'Gift Cards' },
                  { id: 'subscription', label: 'Subscriptions' },
                  { id: 'gaming', label: 'Game Top-Ups' },
                  { id: 'software', label: 'Software & AI' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCatalogCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      catalogCategoryFilter === tab.id
                        ? 'bg-[#3ad389] text-black font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-[#141418] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStockSummary.slice(0, 12).map((s) => {
                  const catalogItem = PRODUCTS.find((p) => p.id === s.productId) || {
                    id: s.productId,
                    title: s.title,
                    brand: s.brand || 'Digital',
                    category: s.category || 'software',
                    region: s.region || 'Global',
                    priceUSD: s.priceUSD || 0,
                    priceLKR: s.priceLKR || 0,
                    description: '',
                    stockCount: s.available,
                  };
                  const isSelectedForAdd = bulkProduct === s.productId;

                  return (
                    <div
                      key={s.productId}
                      className={`group relative p-3.5 rounded-2xl bg-[#121216] border transition-all duration-200 flex flex-col justify-between ${
                        isSelectedForAdd
                          ? 'border-[#3ad389] shadow-lg shadow-emerald-500/10 ring-1 ring-[#3ad389]/30'
                          : 'border-[#1f1f23] hover:border-zinc-700 hover:bg-[#16161b]'
                      }`}
                    >
                      <div>
                        {/* Live Official Brand Thumbnail */}
                        <div className="h-28 overflow-hidden rounded-xl mb-3">
                          <DigitalProductThumbnail product={catalogItem as ProductItem} className="h-28 mb-0" />
                        </div>

                        {/* Title & Brand */}
                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#3ad389] transition-colors" title={s.title}>
                          {s.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mt-1">
                          <span className="capitalize">{s.category}</span>
                          <span>{s.region || 'Global'}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#1f1f23] space-y-2">
                        {/* Stock status pill */}
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                              s.available > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${s.available > 0 ? 'bg-[#3ad389] animate-pulse' : 'bg-zinc-500'}`} />
                            {s.available > 0 ? `${s.available} in stock` : 'Empty (0)'}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {s.dispensed > 0 ? `${s.dispensed} sent` : '0 sent'}
                          </span>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setBulkProduct(s.productId);
                              const el = document.getElementById('vault-ingestion-form');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                              isSelectedForAdd
                                ? 'bg-[#3ad389] text-black shadow-sm'
                                : 'bg-[#18181f] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>{isSelectedForAdd ? 'Selected' : '+ Add Stock'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInventoryProductFilter(s.productId);
                              const el = document.getElementById('vault-items-table');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-2 py-1.5 rounded-xl text-[11px] font-medium bg-[#18181f] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center gap-1 transition-all"
                            title="Filter keys below"
                          >
                            <Filter className="w-3 h-3" />
                            <span>View Keys</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredStockSummary.length === 0 && (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No catalog products match your search or filter.
                </div>
              )}
            </div>

            {/* BULK STOCK INGESTION & KEY PROVISIONER */}
            <div id="vault-ingestion-form" className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#3ad389]" />
                    Vault Stock Ingestion & Provisioner
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Inject single keys or paste entire bulk spreadsheets of activation credentials into the vault.
                  </p>
                </div>

                {/* Ingestion Mode Toggle */}
                <div className="inline-flex p-1 rounded-xl bg-[#141418] border border-zinc-800 self-start">
                  <button
                    type="button"
                    onClick={() => setAddStockMode('bulk')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      addStockMode === 'bulk'
                        ? 'bg-[#3ad389] text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Bulk Importer (Multiline)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddStockMode('single')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      addStockMode === 'single'
                        ? 'bg-[#3ad389] text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Single Key Quick-Add
                  </button>
                </div>
              </div>

              {/* Grid: Live Preview Card on Left + Form on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Live Product Card Preview */}
                <div className="lg:col-span-1 p-4 rounded-2xl bg-[#121216] border border-[#1f1f23] flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>LIVE TARGET PREVIEW</span>
                      <span className="text-[#3ad389] font-bold">READY TO INGEST</span>
                    </div>

                    {/* Official Product Thumbnail */}
                    <div className="h-32 overflow-hidden rounded-xl mb-3">
                      <DigitalProductThumbnail product={selectedCatalogProduct as ProductItem} className="h-32 mb-0" />
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1">
                      {selectedCatalogProduct?.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                      {selectedCatalogProduct?.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1f1f23] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Category:</span>
                      <span className="text-white capitalize">{selectedCatalogProduct?.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Region / Platform:</span>
                      <span className="text-white">{selectedCatalogProduct?.region || 'Global'}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Current Vault Stock:</span>
                      <span className="text-emerald-400 font-bold">{selectedProductStockInfo.available} Available</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ingestion Form */}
                <form onSubmit={handleBulkAddStock} className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Select Product */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Select Target Product
                      </label>
                      <select
                        value={bulkProduct}
                        onChange={(e) => setBulkProduct(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#3ad389]"
                      >
                        {PRODUCTS.filter((p) => p.category !== 'vpn').map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Format Type */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Stock Format Type
                      </label>
                      <select
                        value={bulkStockType}
                        onChange={(e) => setBulkStockType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#3ad389]"
                      >
                        <option value="ACCOUNT_CREDENTIALS">Account Credentials (email:pass)</option>
                        <option value="INVITE_LINK">Invite / Team Link (URL)</option>
                        <option value="SERIAL_KEY">License Serial Key</option>
                      </select>
                    </div>

                    {/* Batch Ref */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-zinc-300">
                          Batch Reference
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const brandCode = (selectedCatalogProduct?.brand || 'STOCK').toUpperCase().replace(/[^A-Z0-9]/g, '');
                            const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
                            setBulkBatchRef(`BATCH-${brandCode}-${dateCode}`);
                          }}
                          className="text-[10px] text-[#3ad389] hover:underline"
                        >
                          Auto Gen
                        </button>
                      </div>
                      <input
                        type="text"
                        value={bulkBatchRef}
                        onChange={(e) => setBulkBatchRef(e.target.value)}
                        placeholder="e.g. BATCH-CANVA-MAY-01"
                        className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                      />
                    </div>
                  </div>

                  {/* Input Payload: Bulk or Single */}
                  {addStockMode === 'bulk' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-zinc-300">
                          Paste Stock Payloads <span className="text-zinc-500">(one item per line)</span>
                        </label>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {bulkKeysText.split('\n').filter((l) => l.trim().length > 0).length} valid line(s) detected
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={bulkKeysText}
                        onChange={(e) => setBulkKeysText(e.target.value)}
                        placeholder={
                          bulkStockType === 'ACCOUNT_CREDENTIALS'
                            ? "user1@fibez.store:Password#123\nuser2@fibez.store:Password#456"
                            : bulkStockType === 'INVITE_LINK'
                            ? "https://www.canva.com/brand/join?token=fbz_team_001\nhttps://www.canva.com/brand/join?token=fbz_team_002"
                            : "STM-8841-9920-KLMA-7741\nSTM-9912-3341-OPQL-8812"
                        }
                        className="w-full p-3 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389] placeholder-zinc-600"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Single Key / Credential / Invite URL
                      </label>
                      <input
                        type="text"
                        value={singleKeyInput}
                        onChange={(e) => setSingleKeyInput(e.target.value)}
                        placeholder={
                          bulkStockType === 'ACCOUNT_CREDENTIALS'
                            ? "e.g. user1@fibez.store:Password#123"
                            : bulkStockType === 'INVITE_LINK'
                            ? "e.g. https://www.canva.com/brand/join?token=fbz_team_001"
                            : "e.g. STM-8841-9920-KLMA-7741"
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-zinc-500">
                      Uploaded stock is immediately encrypted in the vault and ready for zero-touch dispensing.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmittingStock}
                      className="px-6 py-2.5 rounded-xl bg-[#3ad389] text-black font-bold text-xs hover:bg-[#32be7a] transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                    >
                      {isSubmittingStock ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {addStockMode === 'single'
                          ? 'Upload Single Item to Vault'
                          : `Upload ${bulkKeysText.split('\n').filter((l) => l.trim().length > 0).length || 0} Item(s) to Vault`}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* VAULT STOCK ITEMS TABLE */}
            <div id="vault-items-table" className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#3ad389]" />
                    Vault Stock Items ({filteredInventoryItems.length} of {inventoryItems.length})
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Inspect payload keys, copy credentials, or delete individual inventory entries.
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Pills */}
                  <div className="inline-flex p-1 rounded-xl bg-[#141418] border border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setInventoryStatusFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        inventoryStatusFilter === 'ALL'
                          ? 'bg-zinc-700 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      All ({inventoryItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryStatusFilter('AVAILABLE')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        inventoryStatusFilter === 'AVAILABLE'
                          ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Available ({availableInventoryCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryStatusFilter('DISPENSED')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        inventoryStatusFilter === 'DISPENSED'
                          ? 'bg-zinc-700 text-zinc-300'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Dispensed ({dispensedInventoryCount})
                    </button>
                  </div>

                  {/* Filter by Product Dropdown */}
                  <select
                    value={inventoryProductFilter}
                    onChange={(e) => setInventoryProductFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#141418] border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#3ad389]"
                  >
                    <option value="ALL">All Products (SKUs)</option>
                    {PRODUCTS.filter((p) => p.category !== 'vpn').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>

                  {/* Search query */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inventorySearchQuery}
                      onChange={(e) => setInventorySearchQuery(e.target.value)}
                      placeholder="Search key, title, batch..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-[#141418] border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1f1f23] text-zinc-400">
                      <th className="pb-3 font-semibold">Product & Brand</th>
                      <th className="pb-3 font-semibold">Format</th>
                      <th className="pb-3 font-semibold">Key / Credential Payload</th>
                      <th className="pb-3 font-semibold">Batch</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f23]/60">
                    {filteredInventoryItems.map((it) => {
                      const isRevealed = !!revealedKeys[it.id];
                      const matchedProd =
                        PRODUCTS.find((p) => p.id === it.productId || p.id === it.matchedProductId) ||
                        PRODUCTS.find((p) => p.title.toLowerCase() === it.productTitle.toLowerCase()) || {
                          id: it.productId,
                          title: it.productTitle,
                          brand: it.productBrand || 'Digital',
                          category: (it.productCategory as any) || 'software',
                          priceUSD: it.productPriceUSD || 0,
                          priceLKR: it.productPriceLKR || 0,
                          region: it.productRegion || 'Global',
                          description: '',
                          stockCount: 0,
                        };

                      return (
                        <tr key={it.id} className="hover:bg-zinc-900/40 transition-colors group">
                          {/* Product Title + Official Brand Badge */}
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <ProductBrandBadge
                                product={matchedProd as ProductItem}
                                size="sm"
                                className="shadow-sm"
                              />
                              <div>
                                <div className="text-zinc-200 font-bold group-hover:text-white transition-colors">
                                  {it.productTitle}
                                </div>
                                <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                                  <span className="capitalize">{it.productCategory || 'Digital'}</span>
                                  <span>•</span>
                                  <span>{it.productRegion || 'Global'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Stock Type */}
                          <td className="py-3 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                              {it.stockType}
                            </span>
                          </td>

                          {/* Payload */}
                          <td className="py-3 font-mono text-zinc-300 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate">
                                {isRevealed
                                  ? it.keyPayload
                                  : it.keyPayload.slice(0, 8) + '••••••••••••••••'}
                              </span>
                            </div>
                          </td>

                          {/* Batch */}
                          <td className="py-3 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-[#16161b] border border-zinc-800 text-zinc-400">
                              {it.batchReference || 'STANDARD'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1.5 ${
                                it.status === 'AVAILABLE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  it.status === 'AVAILABLE' ? 'bg-[#3ad389] animate-pulse' : 'bg-zinc-500'
                                }`}
                              />
                              {it.status}
                            </span>
                          </td>

                          {/* Actions: Reveal, Copy, Delete */}
                          <td className="py-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedKeys((prev) => ({ ...prev, [it.id]: !prev[it.id] }))
                              }
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                              title={isRevealed ? 'Hide payload' : 'Reveal key'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(it.keyPayload, 'Key copied!')}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                              title="Copy payload"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredInventoryItems.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-zinc-300">No Inventory Stock Found</div>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    {inventoryItems.length === 0
                      ? 'The vault is currently empty. Use the Stock Ingestion provisioner above to add keys.'
                      : 'No vault stock items match your active search or product filter criteria.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: COUPONS & PROMOTIONAL DISCOUNTS */}
        {/* ========================================================================= */}
        {activeTab === 'wallet' && <WalletAdmin />}

        {activeTab === 'coupons' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Promotional Codes & Discounts Engine
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate custom discount codes for social promotions, seasonal campaigns, or VIP client referrals.
              </p>
            </div>

            {/* Create Promo Code Form */}
            <form onSubmit={handleCreateCoupon} className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#3ad389]" />
                Create New Promo Code
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Promo Code String
                  </label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER25"
                    className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-[#3ad389]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCouponPercent}
                    onChange={(e) => setNewCouponPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Fixed LKR Off
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCouponFixedLKR}
                    onChange={(e) => setNewCouponFixedLKR(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Min Spend (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCouponMinSpend}
                    onChange={(e) => setNewCouponMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#141418] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-[#3ad389]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3ad389] text-black font-bold text-xs hover:bg-[#32be7a] transition-all"
                >
                  Create Promo Code
                </button>
              </div>
            </form>

            {/* Coupons List Table */}
            <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Active Promo Codes ({coupons.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1f1f23] text-zinc-400">
                      <th className="pb-3 font-semibold">Code</th>
                      <th className="pb-3 font-semibold">Discount</th>
                      <th className="pb-3 font-semibold">Min Spend</th>
                      <th className="pb-3 font-semibold">Redemptions</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f23]/60">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 font-mono font-bold text-white">{c.code}</td>
                        <td className="py-3 font-mono text-[#3ad389]">
                          {c.discountPercent > 0 ? `${c.discountPercent}% OFF` : `${c.discountFixedLKR} LKR OFF`}
                        </td>
                        <td className="py-3 font-mono text-zinc-400">{c.minSpendLKR} LKR</td>
                        <td className="py-3 font-mono text-zinc-300">
                          {c.timesUsed} / {c.maxUses}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              c.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {c.isActive ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleToggleCoupon(c.id)}
                            className="px-2.5 py-1 rounded bg-[#18181f] text-zinc-300 hover:text-white border border-[#272730] text-[11px]"
                          >
                            {c.isActive ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-400"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: CUSTOMER SUPPORT & TICKETS DESK */}
        {/* ========================================================================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Customer Support &amp; Helpdesk
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review and resolve customer support inquiries, ISP line questions, and config troubleshooting tickets.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1f1f23] bg-[#0c0c0e] p-6 shadow-xl">
              <TicketCenter userRole="owner" userEmail="akain@fibez.store" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
