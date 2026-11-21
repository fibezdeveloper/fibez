'use client';

import { BANK_DETAILS } from '@/lib/bank-details';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Building2,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  Share2,
  ChevronRight,
  Receipt,
  Gift,
  AlertCircle,
} from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ShareSheet } from '@/components/ui/ShareSheet';
import TechText from '@/components/TechText';
import { authClient } from '@/lib/auth-client';

export default function BillingPage() {
  // Real identity + balance (from the signed-in account), never hardcoded
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState<{ referralCode: string; creditValueLKR: number } | null>(null);
  const userEmail = session?.user?.email || '';
  const username = session?.user?.name || userEmail.split('@')[0] || 'Account';
  const displayName = userEmail;
  const sessionId = String(session?.user?.id || '');
  const memberId = sessionId ? `#${sessionId.slice(0, 6).toUpperCase()}` : '';
  const userId = sessionId.slice(0, 8);
  const referralCode = profile?.referralCode ?? '';
  // The wallet ledger (server) is the only source of truth for the balance.
  const [wallet, setWallet] = useState<{
    balanceLkr: number;
    history: { id: string; entry_type: string; amount_lkr: number; balance_after_lkr: number; reason: string | null; created_at: string }[];
    topups: { id: string; amount_lkr: number; bank_reference: string; status: string; review_note: string | null; created_at: string }[];
  } | null>(null);
  const walletBalance = wallet?.balanceLkr ?? 0;
  const loadWallet = () =>
    fetch('/api/wallet', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setWallet(d))
      .catch(() => {});
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(1500);
  const [txnReference, setTxnReference] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadWallet();
    fetch('/api/referrals', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.success && d.profile) {
          setProfile({
            referralCode: d.profile.referralCode,
            creditValueLKR: Number(d.profile.creditValueLKR) || 0,
          });
        }
      })
      .catch(() => {});
  }, []);
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://fibez.store/register?ref=${referralCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount < 250) {
      setErrorMessage('Minimum deposit amount is 250 LKR');
      return;
    }
    if (!txnReference.trim()) {
      setErrorMessage('Please enter the Commercial Bank transaction reference number.');
      return;
    }
    if (!slipFile) {
      setErrorMessage('Please attach your bank slip. It is required so we can verify the transfer.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // One request: amount + bank reference + slip. It becomes a PENDING top-up; your wallet is only
      // credited after staff verify the transfer in the bank.
      const fd = new FormData();
      fd.append('amount', String(depositAmount));
      fd.append('bankReference', txnReference.trim());
      fd.append('slip', slipFile);
      const res = await fetch('/api/wallet/topups', { method: 'POST', body: fd });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSuccessOrder(data.id || 'submitted');
        setSlipFile(null);
        setSlipPreview(null);
        setTxnReference('');
        loadWallet();
      } else {
        throw new Error(data.error || 'Failed to submit deposit request');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Deposit submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#070709] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/v2ray/dashboard" className="hover:text-white transition-colors">V2Ray Dashboard</Link>
          <span>/</span>
          <span className="text-[#3ad389] font-bold">Billing &amp; Wallet</span>
        </div>

        {/* Page Title with TechText */}
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#3ad389] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#3ad389] animate-pulse" />
            <span>Pre-Funded Wallet &amp; Account Portal</span>
          </div>
          <div className="h-[44px] sm:h-[54px] w-full max-w-[460px] relative -ml-1">
            <h1 className="sr-only">Billing &amp; Wallet Hub</h1>
            <TechText
              text="Billing & Wallet Hub"
              align="left"
              fontWeight={700}
              fontSize={40}
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

        {/* Member Profile & Wallet Overview Card */}
        <div className="p-6 rounded-[24px] bg-[#0c0c0f] border border-[#1f1f26] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#141419] border border-[#262633] flex items-center justify-center text-[#3ad389] text-xl font-bold shrink-0 shadow-lg shadow-[#3ad389]/10">
              <Wallet className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{username}</h1>
                <span className="px-2 py-0.5 rounded-[6px] text-[11px] font-mono bg-[#16161c] text-zinc-300 border border-[#272733]">
                  {displayName}
                </span>
                <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-mono font-bold bg-[#3ad389]/10 text-[#3ad389] border border-[#3ad389]/20">
                  Member {memberId}
                </span>
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
                <span>User ID: {userId}</span>
                <span>•</span>
                <span>Pre-Funded Wallet Account</span>
                <span>•</span>
                <span className="text-emerald-400">Verified Client</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#1a1a22]">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Available Wallet Balance
              </span>
              <div className="text-2xl font-black font-mono text-white flex items-baseline sm:justify-end gap-1">
                <span>Rs {walletBalance.toFixed(2)}</span>
                <span className="text-xs font-sans text-zinc-400 font-normal">LKR</span>
              </div>
            </div>

            <a
              href="#deposit-form"
              className="px-4 py-2.5 rounded-xl bg-[#3ad389] hover:bg-[#32be7a] text-black font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#3ad389]/20 active:scale-95"
            >
              <span>+ Fund Wallet</span>
            </a>
          </div>
        </div>

        {/* Referral Card Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0c0c10] via-[#101016] to-[#0c0c10] border border-[#242430] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Referral Bonus Program</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold">
                  Rs 100.00 Bonus Per Friend
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Share your personal link. You receive Rs 100.00 wallet credit whenever a referred friend purchases any plan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-[#141419] border border-[#262633] text-xs font-mono text-zinc-300 select-all">
              https://fibez.store/register?ref={referralCode}
            </div>
            <button
              type="button"
              onClick={handleCopyReferral}
              className="p-2 rounded-xl bg-[#181820] hover:bg-[#22222d] border border-[#2c2c38] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Copy referral link"
            >
              {copiedCode ? <Check className="w-4 h-4 text-[#3ad389]" /> : <Copy className="w-4 h-4" />}
            </button>
            <ShareSheet
              url={`https://fibez.store/register?ref=${referralCode}`}
              title="🚀 Join Fibez and get instant access to V2Ray VPN and digital products! (Use my invite link for bonus credits)"
              trigger={
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-[#3ad389] hover:bg-[#32be7a] text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-[#3ad389]/20 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              }
            />
          </div>
        </div>

        {/* Deposit Section (Commercial Bank Only) */}
        <div id="deposit-form" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Commercial Bank Transfer Details */}
          <div className="lg:col-span-5 p-6 rounded-[24px] bg-[#0c0c0f] border border-[#1f1f26] space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Commercial Bank Transfer</h3>
                <p className="text-xs text-zinc-400">Manual verification via official bank deposit</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121217] border border-[#1f1f28] space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Bank Name</span>
                <span className="text-white font-bold">{BANK_DETAILS.bankName}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Account Name</span>
                <span className="text-zinc-200">{BANK_DETAILS.accountName}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Account Number</span>
                  <span className="text-[#3ad389] font-black text-sm tracking-wider">{BANK_DETAILS.accountNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-2 py-1 rounded-lg bg-[#1a1a22] hover:bg-[#22222e] text-[10px] text-zinc-300 flex items-center gap-1 border border-white/5 cursor-pointer"
                >
                  {copiedAcc ? <Check className="w-3 h-3 text-[#3ad389]" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Branch</span>
                <span className="text-zinc-300">{BANK_DETAILS.branch}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141419] border border-[#202028] text-xs text-zinc-400 space-y-2 leading-relaxed">
              <div className="flex items-start gap-2 font-mono text-[11px]">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>Transfer the amount by online banking, CEFT or a CDM deposit.</span>
              </div>
              <div className="flex items-start gap-2 font-mono text-[11px]">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>Keep the Transaction Reference number or receipt screenshot.</span>
              </div>
              <div className="flex items-start gap-2 font-mono text-[11px]">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>Submit proof on the right. An admin will review and credit your wallet under /orders.</span>
              </div>
            </div>
          </div>

          {/* Right: Submit Proof & Reference Form */}
          <div className="lg:col-span-7 p-6 rounded-[24px] bg-[#0c0c0f] border border-[#1f1f26] space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#3ad389]" />
              <span>Submit Fund Proof</span>
            </h3>

            {successOrder ? (
              <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Deposit Proof Submitted!</h4>
                <p className="text-xs font-mono text-zinc-300 max-w-md mx-auto">
                  Reference: <span className="text-[#3ad389] font-bold">{successOrder}</span>. An admin is verifying your Commercial Bank slip. Your wallet will be credited shortly.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSuccessOrder(null)}
                    className="px-4 py-2 rounded-xl bg-[#141419] hover:bg-[#1a1a22] text-xs font-mono text-zinc-300 border border-[#22222b]"
                  >
                    Submit Another Deposit
                  </button>
                  <Link
                    href="/v2ray"
                    className="px-4 py-2 rounded-xl bg-[#3ad389] text-black font-bold text-xs font-mono flex items-center gap-1.5"
                  >
                    <span>Browse Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Preset Deposit Amounts */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    Select Deposit Amount (LKR)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                    {[250, 500, 800, 1500, 2000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`py-2 px-1 rounded-xl text-xs font-mono font-medium transition-all border ${
                          depositAmount === amt
                            ? 'bg-[#3ad389] text-black font-bold border-[#3ad389]'
                            : 'bg-[#121217] text-zinc-300 hover:text-white border-[#202028]'
                        }`}
                      >
                        Rs {amt}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min={250}
                    step={50}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                    placeholder="Custom Amount in LKR"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#202028] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                  />
                </div>

                {/* Bank Reference Number */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    Commercial Bank Reference / Transaction ID
                  </label>
                  <input
                    type="text"
                    value={txnReference}
                    onChange={(e) => setTxnReference(e.target.value)}
                    placeholder="e.g. TXN-COM-882910 or Transfer Slip No."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#202028] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#3ad389] transition-colors"
                  />
                </div>

                {/* Deposit Slip Screenshot */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    Upload Bank Deposit Slip / Mobile Screenshot (Required)
                  </label>
                  <div className="relative border-2 border-dashed border-[#242430] hover:border-zinc-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#0e0e13]">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {slipPreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={slipPreview}
                          alt="Slip Preview"
                          className="w-14 h-14 object-cover rounded-xl border border-white/10"
                        />
                        <div className="text-left font-mono text-xs text-emerald-400">
                          <div>Slip Attached</div>
                          <div className="text-zinc-500 text-[10px]">Click to replace image</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud className="w-6 h-6 text-zinc-400 mx-auto" />
                        <div className="text-xs font-mono text-zinc-300">Click or drag bank slip screenshot</div>
                        <div className="text-[10px] text-zinc-500">PNG, JPG or PDF up to 10MB</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Deposit Button */}
                <AnimatedButton
                  as="button"
                  type="submit"
                  variant="emerald"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full text-xs font-mono font-bold shadow-lg shadow-[#3ad389]/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting to Review...' : `Submit Proof for Rs ${depositAmount.toLocaleString()} LKR`}</span>
                </AnimatedButton>
              </form>
            )}
          </div>
        </div>

        {/* Your top-ups + wallet history */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-[24px] bg-[#0c0c0f] border border-[#1f1f26] space-y-3">
            <h3 className="text-base font-bold text-white">Your top-up requests</h3>
            {(wallet?.topups || []).length === 0 ? (
              <p className="text-xs font-mono text-zinc-500">No top-ups yet.</p>
            ) : (
              <div className="space-y-2">
                {wallet!.topups.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#121217] border border-[#1e1e26] text-xs font-mono">
                    <div>
                      <div className="text-white font-semibold">Rs {Number(t.amount_lkr).toLocaleString()}</div>
                      <div className="text-zinc-500">{t.bank_reference} · {new Date(t.created_at).toLocaleDateString()}</div>
                      {t.review_note && <div className="text-zinc-400 mt-0.5">{t.review_note}</div>}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : t.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-300'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {t.status === 'PENDING' ? 'UNDER REVIEW' : t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Wallet money is store credit: it can be used for any Fibez purchase or renewal and is not withdrawable.
              Purchases are final once delivered. If something is wrong, you can ask for a refund within 24 hours of
              delivery from your Key Vault. Approved refunds are credited back to this wallet.
            </p>
          </div>

          <div className="p-6 rounded-[24px] bg-[#0c0c0f] border border-[#1f1f26] space-y-3">
            <h3 className="text-base font-bold text-white">Wallet history</h3>
            {(wallet?.history || []).length === 0 ? (
              <p className="text-xs font-mono text-zinc-500">No activity yet.</p>
            ) : (
              <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                {wallet!.history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#121217] border border-[#1e1e26] text-xs font-mono">
                    <div className="min-w-0">
                      <div className="text-zinc-300 truncate">{h.reason || h.entry_type}</div>
                      <div className="text-zinc-500">{new Date(h.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={h.amount_lkr < 0 ? 'text-red-300 font-bold' : 'text-emerald-300 font-bold'}>
                        {h.amount_lkr > 0 ? '+' : ''}{Number(h.amount_lkr).toLocaleString()}
                      </div>
                      <div className="text-zinc-500">bal {Number(h.balance_after_lkr).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Plans Quick-Reference */}
        <div className="p-6 rounded-[24px] bg-[#0c0c0f] border border-[#1f1f26] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Available Plans &amp; Multi-Month Discounts</h3>
              <p className="text-xs text-zinc-400">Subscribe or renew directly using your pre-funded wallet balance</p>
            </div>
            <AnimatedButton
              as="a"
              href="/v2ray"
              variant="default"
              size="sm"
              className="text-xs font-mono text-zinc-300 hover:text-white"
            >
              <span>View All 24 Packages</span>
              <ArrowRight className="w-3 h-3" />
            </AnimatedButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { name: 'BASIC', price: 'Rs 250', quota: '150 GB', devs: '1 Device', node: 'Shared 5421' },
              { name: 'STANDARD', price: 'Rs 500', quota: '250 GB', devs: '1 Device', node: 'Shared 5421' },
              { name: 'PREMIUM', price: 'Rs 800', quota: '500 GB', devs: '2 Devices', node: 'Shared 5421' },
              { name: 'PRIVATE VIP', price: 'Rs 1,500', quota: 'Unlimited', devs: '3 Devices', node: 'Dedicated 8253' },
              { name: 'STREAMING DUAL', price: 'Rs 2,000', quota: 'Unlimited', devs: '3 Devices (2 Configs)', node: 'Dedicated 8253' },
            ].map((p) => (
              <div key={p.name} className="p-3.5 rounded-xl bg-[#121217] border border-[#1e1e26] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{p.name}</span>
                  <span className="text-xs font-black font-mono text-[#3ad389]">{p.price}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 space-y-0.5">
                  <div>Data: <span className="text-white font-semibold">{p.quota}</span></div>
                  <div>Limit: <span className="text-zinc-300">{p.devs}</span></div>
                  <div>Node: <span className="text-zinc-400">{p.node}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
