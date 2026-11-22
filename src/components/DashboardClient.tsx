'use client';

import { useSiteFlag } from '@/lib/use-site-flags';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { VerifiedSessionUser } from '@/lib/dal';
import TicketCenter from '@/components/TicketCenter';
import TelegramConnect from '@/components/TelegramConnect';
import { ShareSheet } from '@/components/ui/ShareSheet';
import {
  KeyRound,
  Download,
  Copy,
  Check,
  Activity,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  RefreshCw,
  X,
  LifeBuoy,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Shield,
  Gift,
  Share2,
  Sparkles,
} from 'lucide-react';

interface VaultAssetRow {
  id: string;
  orderNumber: string;
  productName: string;
  type: string;
  status: string;
  variant_title?: string;
  password?: string;
  payload: string;
}

export default function DashboardClient({
  currentUser,
}: {
  currentUser: VerifiedSessionUser;
}) {
  const shopOn = useSiteFlag('shop');
  const isStaff = currentUser.role === 'admin' || currentUser.role === 'owner';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleDownloadConfig = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // USER CONSOLE STATE (REAL DB DATA)
  // ==========================================
  const [userSubTab, setUserSubTab] = useState<'services' | 'tickets' | 'referrals' | 'profile'>('services');
  const [userAssets, setUserAssets] = useState<VaultAssetRow[]>([]);
  const [userOrdersCount, setUserOrdersCount] = useState(0);
  const [userTicketsCount, setUserTicketsCount] = useState(0);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Referral Rewards State
  const [referralProfile, setReferralProfile] = useState<any>(null);
  const [copiedReferralLink, setCopiedReferralLink] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profileUsername, setProfileUsername] = useState(currentUser.name || currentUser.email.split('@')[0]);
  const [profileEmail, setProfileEmail] = useState(currentUser.email || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'profile') {
        setUserSubTab('profile');
      } else if (params.get('tab') === 'tickets') {
        setUserSubTab('tickets');
      } else if (params.get('tab') === 'referrals') {
        setUserSubTab('referrals');
      }
    }

    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (data.user.name) setProfileName(data.user.name);
          if (data.user.username) setProfileUsername(data.user.username);
          if (data.user.email) setProfileEmail(data.user.email);
          if (data.user.phone) setProfilePhone(data.user.phone);
        }
      })
      .catch(() => {});

    fetch('/api/referrals')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.profile) {
          setReferralProfile(data.profile);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setProfileError('New passwords do not match');
      setProfileSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          username: profileUsername,
          email: profileEmail,
          phone: profilePhone,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProfileSuccess(data.message || 'Profile updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
      } else {
        setProfileError(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Network error updating profile');
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    fetch('/api/vault')
      .then((res) => (res.ok ? res.json() : { assets: [] }))
      .then((data) => {
        if (Array.isArray(data.assets)) setUserAssets(data.assets);
      })
      .catch(() => {});

    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((data) => {
        if (Array.isArray(data.orders)) setUserOrdersCount(data.orders.length);
      })
      .catch(() => {});

    fetch('/api/tickets')
      .then((res) => (res.ok ? res.json() : { tickets: [] }))
      .then((data) => {
        if (Array.isArray(data.tickets)) {
          setUserTicketsCount(
            data.tickets.filter(
              (t: { status: string }) =>
                t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_USER'
            ).length
          );
        }
      })
      .catch(() => {});
  }, [currentUser.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1.5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-white uppercase font-bold tracking-wider">My Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white flex items-center gap-3 flex-wrap">
            <span>My Account</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 border border-white/20 text-zinc-300">
              {currentUser.email}
            </span>
            {isStaff && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/5 border border-white/15 text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{currentUser.role}</span>
              </span>
            )}
          </h1>
        </div>

        {isStaff && (
          <Link
            href="/admin"
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-mono font-semibold hover:bg-zinc-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Admin Console</span>
          </Link>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. USER DASHBOARD (100% REAL USER DATA)                                  */}
      {/* ========================================================================= */}
      {(
        <div className="space-y-10 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Delivered Items</div>
              <div className="text-2xl font-mono font-bold text-white">{userAssets.length}</div>
              <div className="text-[11px] text-zinc-400 mt-1">Keys &amp; VLESS configs in vault</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Total Orders</div>
              <div className="text-2xl font-mono font-bold text-white">{userOrdersCount}</div>
              <div className="text-[11px] text-zinc-400 mt-1">Orders linked to your account</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Open Support Tickets</div>
              <div className="text-2xl font-mono font-bold text-white">{userTicketsCount}</div>
              <div className="text-[11px] text-zinc-400 mt-1">Active support conversations</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">VLESS Diagnostic</div>
              <Link href="/v2ray/line-check" className="text-base font-mono font-semibold text-[#3ad389] hover:underline inline-flex items-center gap-1.5 mt-1">
                <Activity className="w-4 h-4" />
                <span>Run Line Check →</span>
              </Link>
              <div className="text-[11px] text-zinc-400 mt-1">Test your Sri Lankan ISP route</div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setUserSubTab('services')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                userSubTab === 'services' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              My Purchased Keys &amp; Configs
            </button>
            <button
              type="button"
              onClick={() => setUserSubTab('tickets')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                userSubTab === 'tickets' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support Tickets</span>
            </button>
            <button
              type="button"
              onClick={() => setUserSubTab('referrals')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                userSubTab === 'referrals' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Referrals &amp; Rewards</span>
              {referralProfile?.balanceLkr > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#3ad389] text-black font-bold">
                  Rs. {referralProfile.balanceLkr}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setUserSubTab('profile')}
              className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                userSubTab === 'profile' ? 'bg-white text-black font-semibold' : 'bg-[#141417] text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account Profile &amp; Settings</span>
            </button>
          </div>

          {userSubTab === 'profile' ? (
            <div className="space-y-6 pt-2 animate-in fade-in duration-200">
              <TelegramConnect />
              {/* Profile Alerts */}
              {profileSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs font-mono flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-mono flex items-center gap-2.5">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* User Identity Overview Banner */}
              <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3ad389] to-emerald-400 flex items-center justify-center text-black font-mono font-bold text-xl shadow-lg shadow-[#3ad389]/15">
                    {profileName ? profileName.slice(0, 2).toUpperCase() : currentUser.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        {profileName || 'Valued Client'}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3ad389]/10 text-[#3ad389] border border-[#3ad389]/20 uppercase">
                        {currentUser.role === 'owner' ? 'Store Owner' : currentUser.role === 'admin' ? 'Admin' : 'Verified Client'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">
                      @{profileUsername || currentUser.email.split('@')[0]} • {currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-zinc-400 bg-[#121215] px-4 py-2.5 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Client Account ID</span>
                    <span className="text-zinc-200">{currentUser.id}</span>
                  </div>
                </div>
              </div>

              {/* Two-Column Edit Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 7 Columns: Personal Identity Details */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-5">
                  <div className="border-b border-[#1f1f23] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-[#3ad389]" />
                      <span>Personal Information &amp; Contact</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Update how your name and identity appear on receipts, invoices, and support conversations.
                    </p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                        Full Display Name
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="e.g. Akain Kariwesi"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                          Client Username / Handle
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono">@</span>
                          <input
                            type="text"
                            value={profileUsername}
                            onChange={(e) => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            placeholder="username"
                            className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                          WhatsApp / Mobile (Sri Lanka)
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="+94 7X XXX XXXX"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none transition-all font-mono"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                          Used for bank slip verification &amp; order notifications.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                        Email Address (Digital Key Delivery)
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          required
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-[#3ad389] focus:outline-none transition-all font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        All purchased keys, VLESS configs, and receipts will be dispatched here.
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="px-5 py-2.5 rounded-xl bg-[#3ad389] hover:bg-[#32be7a] text-black font-semibold text-xs font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#3ad389]/15 disabled:opacity-50"
                      >
                        {profileSaving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right 5 Columns: Security & Password */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-5">
                  <div className="border-b border-[#1f1f23] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Security &amp; Password</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Ensure your account remains safe and protected with strong credentials.
                    </p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-amber-400 focus:outline-none transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141417] border border-[#27272a] text-sm text-white focus:border-amber-400 focus:outline-none transition-all font-mono"
                      />
                    </div>

                    {newPassword && (
                      <div className="p-3 rounded-xl bg-[#141417] border border-white/5 space-y-1 text-[11px] font-mono text-zinc-400">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Check className={`w-3 h-3 ${newPassword.length >= 8 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <span>At least 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Check className={`w-3 h-3 ${newPassword === confirmPassword && confirmPassword ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <span>Passwords match</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={profileSaving || !newPassword}
                        className="w-full py-2.5 rounded-xl bg-[#1a1a1f] hover:bg-[#22222a] border border-[#2e2e38] text-white font-semibold text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>

                  {/* Trust & Guarantee Indicators */}
                  <div className="pt-4 border-t border-[#1f1f23] space-y-2 text-[11px] font-mono text-zinc-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3ad389]" />
                      <span>TLS 1.3 Encrypted Session Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                      <span>PostgreSQL RLS Protected Data</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : userSubTab === 'tickets' ? (
            <div className="pt-2">
              <TicketCenter userRole="user" userEmail={currentUser.email} />
            </div>
          ) : userSubTab === 'referrals' ? (
            <div className="space-y-6 pt-2 animate-in fade-in duration-200">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0c1f15] border border-[#3ad389]/30 shadow-lg shadow-[#3ad389]/5">
                  <div className="text-xs font-mono text-[#3ad389] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Wallet Balance</span>
                  </div>
                  <div className="text-3xl font-mono font-bold text-white">
                    Rs. {(referralProfile?.balanceLkr || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-300 mt-1 font-mono">
                    Spend it at checkout with &quot;Pay with wallet&quot;
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Bonus Per Friend
                  </div>
                  <div className="text-3xl font-mono font-bold text-white">
                    Rs. {referralProfile?.rewardPerFriendLkr || 100}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Paid to your wallet per verified first order
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Completed Purchases
                  </div>
                  <div className="text-3xl font-mono font-bold text-[#3ad389]">
                    {referralProfile?.purchasedCount || 0}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Friends whose orders verified
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111114] border border-white/10">
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Total Lifetime Earned
                  </div>
                  <div className="text-3xl font-mono font-bold text-amber-400">
                    Rs. {(referralProfile?.totalEarnedLkr || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Referral bonuses earned
                  </div>
                </div>
              </div>

              {/* Unique Referral Link & 1-Click WhatsApp Share */}
              <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>Your Unique Referral Link</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Friends get <strong className="text-white">Rs. 50 OFF</strong> their purchase, and you earn <strong className="text-[#3ad389]">Rs. 100 in your wallet</strong> for every friend&apos;s verified first order!
                    </p>
                  </div>
                  <div className="font-mono text-xs px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold self-start sm:self-auto">
                    Code: {referralProfile?.referralCode || 'GENERATING'}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#141417] border border-white/10 text-xs font-mono text-zinc-200">
                    <span className="truncate">
                      {referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const link = referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`);
                        navigator.clipboard.writeText(link);
                        setCopiedReferralLink(true);
                        setTimeout(() => setCopiedReferralLink(false), 2000);
                      }}
                      className="ml-3 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      {copiedReferralLink ? <Check className="w-4 h-4 text-[#3ad389]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const link = referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`);
                        navigator.clipboard.writeText(link);
                        setCopiedReferralLink(true);
                        setTimeout(() => setCopiedReferralLink(false), 2000);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copiedReferralLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedReferralLink ? 'Copied Link!' : 'Copy Link'}</span>
                    </button>

                    <ShareSheet
                      url={referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`)}
                      title="🚀 Get Rs. 50 OFF your high-speed Sri Lankan V2Ray node or digital subscription on Fibez!"
                      trigger={
                        <button
                          type="button"
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#3ad389] hover:bg-[#32be7a] text-black text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3ad389]/20 transition-all cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share Invite Sheet</span>
                        </button>
                      }
                    />

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `🚀 Get Rs. 50 OFF your high-speed Sri Lankan V2Ray node or digital subscription on Fibez!\n\nUse my invite link:\n${referralProfile?.referralLink || (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${referralProfile?.referralCode || ''}` : `https://fibez.store/?ref=${referralProfile?.referralCode || ''}`)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl bg-[#1c2028] hover:bg-[#252a35] text-zinc-300 hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all"
                      title="Direct WhatsApp link"
                    >
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* 3 Step Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#1f1f23] text-xs">
                  <div className="p-3 rounded-xl bg-[#141417] border border-white/5 space-y-1">
                    <div className="font-mono text-[10px] text-[#3ad389] uppercase font-bold">Step 1</div>
                    <div className="font-semibold text-white">Share Your Link</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Send your link to friends looking for Dialog Zoom, SLT Netflix, or gaming configs.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141417] border border-white/5 space-y-1">
                    <div className="font-mono text-[10px] text-amber-400 uppercase font-bold">Step 2</div>
                    <div className="font-semibold text-white">Friend Gets Rs. 50 OFF</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Your friend receives an automatic Rs. 50 discount deducted at checkout on their first order.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141417] border border-white/5 space-y-1">
                    <div className="font-mono text-[10px] text-sky-400 uppercase font-bold">Step 3</div>
                    <div className="font-semibold text-white">Earn Rs. 100</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      As soon as their order is verified, Rs. 100 is credited to your wallet. Wallet money can be spent in the store but not withdrawn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Credits Redemption & Usage Tip */}
              <div className="p-4 rounded-xl bg-[#141417] border border-[#222228] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3ad389]" />
                  <span className="text-zinc-300">
                    Your wallet is at <Link href="/billing" className="text-white underline font-semibold">Billing</Link>. Pay with it in the <Link href="/cart" className="text-white underline font-semibold">Shopping Cart</Link> or renew a line in one click.
                  </span>
                </div>
                <Link
                  href={shopOn ? '/catalog' : '/v2ray'}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  {shopOn ? 'Shop Now →' : 'Buy V2Ray →'}
                </Link>
              </div>

              {/* History Table */}
              <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] space-y-4">
                <h4 className="text-sm font-semibold text-white">
                  Referral Earnings
                </h4>
                {(!referralProfile?.history || referralProfile.history.length === 0) ? (
                  <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                    No referral activity yet. Share your invite link to start earning wallet money!
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 font-mono text-xs">
                    {referralProfile.history.map((h: any) => (
                      <div key={h.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-white font-medium">{h.description}</div>
                          <div className="text-[10px] text-zinc-500">
                            {new Date(h.timestamp).toLocaleDateString()} at {new Date(h.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="font-bold text-sm text-[#3ad389]">
                          +Rs. {(h.creditsDelta * 10).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-white">Your Purchased Products &amp; Configs</h2>
                  <p className="text-xs text-zinc-400">Copy keys, VLESS URIs, or credentials delivered to your account.</p>
                </div>
                <Link href="/v2ray/guide" className="text-xs font-mono text-zinc-300 hover:text-white underline">
                  NetMod &amp; v2rayNG Guide
                </Link>
              </div>

              {userAssets.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#111114] border border-white/10 text-center space-y-3">
                  <KeyRound className="w-6 h-6 text-zinc-400 mx-auto" />
                  <p className="text-sm text-zinc-300">No purchased products or configs found for {currentUser.email}.</p>
                  <div className="flex justify-center gap-3 pt-1">
                    {shopOn && (
                      <Link href="/catalog" className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-semibold">
                        Browse Catalog
                      </Link>
                    )}
                    <Link href="/v2ray" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs">
                      Free VLESS Trial
                    </Link>
                  </div>
                </div>
              ) : (
                userAssets.map((asset) => (
                  <div key={asset.id} className="p-5 rounded-2xl bg-[#111114] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-300">
                          {asset.type}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">{asset.orderNumber}</span>
                        <span
                          className={`text-xs font-mono ${
                            asset.status === 'ACTIVE' ? 'text-emerald-400' : asset.status === 'PENDING' ? 'text-amber-400' : 'text-zinc-500'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </div>
                      <h3 className="text-base font-medium text-white">{asset.productName}</h3>
                      {asset.variant_title && (
                        <p className="text-xs font-mono text-zinc-400">{asset.variant_title}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Renewals are paid from the wallet on the V2Ray dashboard (it checks that the line can be renewed). */}
                      {asset.status === 'ACTIVE' && asset.payload?.startsWith('vless://') && (
                        <Link
                          href="/v2ray/dashboard"
                          className="px-3.5 py-2 rounded-xl bg-[#3ad389]/10 hover:bg-[#3ad389]/20 border border-[#3ad389]/30 text-xs font-mono text-[#3ad389] flex items-center gap-1.5 transition-colors font-semibold"
                          title="Open this line in the V2Ray dashboard to renew or check usage"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Manage / Renew</span>
                        </Link>
                      )}

                      {asset.password && (
                        <button
                          type="button"
                          onClick={() => toggleSecret(asset.id)}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          {revealedSecrets[asset.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{revealedSecrets[asset.id] ? `Pass: ${asset.password}` : 'Reveal Password'}</span>
                        </button>
                      )}

                      {/* Nothing to copy for pending orders, and a revoked / refunded line no longer works. */}
                      {asset.payload && asset.status !== 'REVOKED' && (
                        <button
                          type="button"
                          onClick={() => handleCopy(asset.id, asset.payload || '')}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedKey === asset.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === asset.id ? 'Copied' : 'Copy Key / Config'}</span>
                        </button>
                      )}

                      {asset.status !== 'REVOKED' && asset.payload?.startsWith('vless://') && (
                        <button
                          type="button"
                          onClick={() => handleDownloadConfig(`${asset.orderNumber}-vless.txt`, asset.payload)}
                          className="px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download .txt</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
