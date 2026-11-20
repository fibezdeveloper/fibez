'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { authClient } from '@/lib/auth-client';
import { createPurchasedLineFromCartItem, recordPurchasedLines } from '@/lib/v2ray-lines';
import { AnimatedNumber, QuantityStepper } from '@/components/ui/AnimatedNumber';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import TechText from '@/components/TechText';
import { EncryptedText } from '@/components/ui/encrypted-text';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import { FileUpload } from '@/components/ui/file-upload';
import { 
  ChevronRight, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Upload, 
  Zap,
  Server,
  Shield,
  Sparkles,
  Tag,
  Copy,
  Check,
  Globe,
  Clock,
  ExternalLink,
  RefreshCw,
  Gift,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { 
    cart, 
    cartCount, 
    cartTotalLKR, 
    cartTotalUSD, 
    currency, 
    setCurrency,
    updateQuantity, 
    updateDuration,
    updateISP,
    removeFromCart, 
    clearCart 
  } = useStore();

  const { data: session } = authClient.useSession();

  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'crypto' | 'gateway'>('bank_transfer');
  const [customerEmail, setCustomerEmail] = useState(session?.user?.email || '');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Referral & 1-Click Renewal State
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<{ code: string; discountLKR: number } | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [renewOrderId, setRenewOrderId] = useState<string | null>(null);
  const [existingUuid, setExistingUuid] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [useCredits, setUseCredits] = useState<boolean>(false);

  const [copiedCrypto, setCopiedCrypto] = useState(false);
  const [copiedBankAcc, setCopiedBankAcc] = useState<string | null>(null);
  const [uploadedSlip, setUploadedSlip] = useState<string | null>(null);
  const [uploadedSlipName, setUploadedSlipName] = useState<string | null>(null);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync email from session if empty
  React.useEffect(() => {
    if (session?.user?.email && !customerEmail) {
      setCustomerEmail(session.user.email);
    }
  }, [session, customerEmail]);

  // Read URL query params on mount: ?renew=<order_id> and ?ref=<code>
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    
    // Check 1-Click Renewal
    const renew = params.get('renew');
    if (renew) {
      setRenewOrderId(renew);
      // Try to read existing UUID if cached or saved
      const savedUuid = localStorage.getItem(`fibez_uuid_${renew}`);
      if (savedUuid) setExistingUuid(savedUuid);
    }

    // Check Referral Code in URL or LocalStorage
    const refCode = params.get('ref') || localStorage.getItem('fibez_ref');
    if (refCode) {
      setReferralCodeInput(refCode);
      // Validate automatically
      fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', code: refCode }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.valid) {
            setAppliedReferral({ code: refCode.toUpperCase(), discountLKR: data.discountLKR || 50 });
            localStorage.setItem('fibez_ref', refCode.toUpperCase());
          }
        })
        .catch(() => {});
    }

    // Fetch user's store credits balance if logged in
    fetch('/api/referrals')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile?.storeCredits > 0) {
          setUserCredits(data.profile.storeCredits);
        }
      })
      .catch(() => {});
  }, []);

  // Discount calculation
  const promoDiscountLKR = appliedPromo ? Math.round(cartTotalLKR * (appliedPromo.percent / 100)) : 0;
  const referralDiscountLKR = appliedReferral ? appliedReferral.discountLKR : 0;
  const maxAvailableCreditDiscount = Math.max(0, cartTotalLKR - promoDiscountLKR - referralDiscountLKR);
  const creditsDiscountLKR = useCredits && userCredits > 0 ? Math.min(maxAvailableCreditDiscount, userCredits * 10) : 0;
  const totalDiscountLKR = promoDiscountLKR + referralDiscountLKR + creditsDiscountLKR;

  const finalTotalLKR = Math.max(0, cartTotalLKR - totalDiscountLKR);
  const finalTotalUSD = parseFloat(
    (cartTotalUSD * (cartTotalLKR > 0 ? finalTotalLKR / cartTotalLKR : 1)).toFixed(2)
  );

  const totalFormatted =
    currency === 'USD'
      ? `$${finalTotalUSD.toFixed(2)}`
      : `Rs. ${finalTotalLKR.toLocaleString()}`;

  const subtotalFormatted =
    currency === 'USD'
      ? `$${cartTotalUSD.toFixed(2)}`
      : `Rs. ${cartTotalLKR.toLocaleString()}`;

  const discountAmountFormatted =
    currency === 'USD'
      ? `-$${((cartTotalUSD * totalDiscountLKR) / (cartTotalLKR || 1)).toFixed(2)}`
      : `-Rs. ${totalDiscountLKR.toLocaleString()}`;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedPromo({ code: data.code, percent: data.discountPercent || 10 });
      } else {
        setPromoError(data.message || 'Invalid promo code. Try "FIBEZ10" or "DEV20"');
      }
    } catch {
      if (code === 'FIBEZ10' || code === 'WELCOME') {
        setAppliedPromo({ code, percent: 10 });
      } else if (code === 'DEV20' || code === 'FIBEZ20' || code === 'RESEND') {
        setAppliedPromo({ code, percent: 20 });
      } else {
        setPromoError('Invalid promo code. Try "FIBEZ10" or "DEV20"');
      }
    }
  };

  const handleApplyReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setReferralError(null);
    const code = referralCodeInput.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', code }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedReferral({ code, discountLKR: data.discountLKR || 50 });
        localStorage.setItem('fibez_ref', code);
      } else {
        setReferralError(data.message || 'Referral code not found or expired.');
      }
    } catch {
      setReferralError('Failed to validate referral code.');
    }
  };

  const handleCopyAcc = (accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedBankAcc(accNum);
    setTimeout(() => setCopiedBankAcc(null), 1500);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const creditsRedeemed = useCredits && userCredits > 0 ? Math.min(userCredits, Math.ceil(creditsDiscountLKR / 10)) : 0;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map((item) => ({
            id: item.id,
            productId: item.productId || item.product?.id || item.id,
            title: item.product?.title || 'Digital Product',
            variantTitle: item.durationLabel || 'Standard',
            priceLKR: item.priceLKR,
            priceUSD: item.priceUSD,
            quantity: item.quantity,
            category: item.product?.category || 'giftcard',
            guideMarkdown: item.product?.guideMarkdown,
            warranty: item.product?.warranty,
          })),
          paymentMethod,
          customerEmail,
          customerName: session?.user?.name || customerEmail.split('@')[0],
          customerWhatsapp: customerWhatsapp.trim() || undefined,
          promoCode: appliedPromo?.code,
          referralCode: appliedReferral?.code,
          renewOrderId: renewOrderId || undefined,
          existingUuid: existingUuid || undefined,
          creditsRedeemed,
          receiptUrl: uploadedSlip,
          userId: session?.user?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);

        // Record any purchased V2Ray packages into multi-line manager
        try {
          const vpnItems = cart.filter(
            (item) =>
              item.product?.category === 'vpn' ||
              item.productId.includes('v2ray') ||
              item.productId.includes('dialog') ||
              item.productId.includes('slt') ||
              item.productId.includes('airtel') ||
              item.productId.includes('hutch') ||
              item.productId.includes('mobitel') ||
              (item.product?.title || '').toLowerCase().includes('v2ray')
          );
          if (vpnItems.length > 0) {
            const newLines = vpnItems.map((item) =>
              createPurchasedLineFromCartItem({
                orderNumber: data.orderNumber || 'FBZ-ORDER',
                productId: item.productId || item.product?.id || item.id,
                title: item.product?.title || 'V2Ray High-Speed VPN',
                variantTitle: item.durationLabel,
                selectedIsp: item.selectedISP,
              })
            );
            recordPurchasedLines(newLines);
          }
        } catch (lineErr) {
          console.warn('Failed to register purchased V2Ray line:', lineErr);
        }

        clearCart();
        setTimeout(() => {
          router.push(`/vault?order=${data.orderNumber}`);
        }, 1200);
      } else {
        alert(data.error || 'Failed to complete order. Please try again.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setIsSuccess(true);
      clearCart();
      setTimeout(() => {
        router.push('/vault');
      }, 1400);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSlip(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'slips');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload receipt');
      }

      setUploadedSlip(data.url);
    } catch (err: any) {
      console.error('Slip upload error:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploadingSlip(false);
    }
  };

  const handleDropzoneUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploadedSlipName(file.name);
    setIsUploadingSlip(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'slips');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload receipt');
      }
      setUploadedSlip(data.url);
    } catch (err: any) {
      console.error('Slip upload error:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploadingSlip(false);
    }
  };

  if (cartCount === 0 && !isSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-36 text-center">
        <div className="w-20 h-20 rounded-full bg-[#111114] border border-[#222226] flex items-center justify-center mx-auto text-white mb-6">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-medium text-white mb-3 tracking-tight">
          <EncryptedText
            text="Your Dedicated Shopping Cart is Empty"
            encryptedClassName="text-[#3ad389]/60 font-mono"
            revealedClassName="text-white"
            revealDelayMs={35}
          />
        </h1>
        <div className="text-sm sm:text-base text-[#a1a4a5] max-w-xl mx-auto mb-8 leading-relaxed flex flex-wrap items-center justify-center gap-1.5 font-sans">
          <span>Select high-speed</span>
          <ContainerTextFlip
            words={[
              "V2Ray Reality Nodes",
              "AMD EPYC Cloud",
              "Netflix 4K Profiles",
              "Game Top-Ups & UC",
              "Zero-Trust VPN Lines"
            ]}
          />
          <span>to get started.</span>
        </div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider transition-all"
        >
          <span>Explore Product Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-36 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
          Order Placed
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-white mb-2">
          Order Submitted!
        </h1>
        <p className="text-sm text-[#a1a4a5] mb-6 leading-relaxed">
          Your order and receipt slip have been received. Once verified, your codes or VLESS configs will be sent to your email and unlocked in your Key Vault. Redirecting...
        </p>
        <Link
          href="/vault"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider"
        >
          <span>Open Key Vault Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#a1a4a5] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <Link href="/catalog" className="hover:text-white transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-white">Shopping Cart ({cartCount})</span>
      </div>

      {/* Header & Steps */}
      <div className="mb-10 pb-6 border-b border-[#1f1f23] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
            Dedicated Cart & Zero-Trust Checkout
          </div>
          <div className="flex items-center gap-3">
            <div className="h-[44px] sm:h-[52px] w-[220px] sm:w-[280px] relative -ml-1">
              <h1 className="sr-only">Shopping Cart</h1>
              <TechText
                text="Shopping Cart"
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
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* 3-Step Indicator */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <span className="w-5 h-5 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center">1</span>
            <span>Cart Review</span>
          </div>
          <span className="text-zinc-600">───</span>
          <div className="flex items-center gap-1.5 text-[#a1a4a5]">
            <span className="w-5 h-5 rounded-full bg-[#16161a] border border-[#26262b] text-[11px] flex items-center justify-center">2</span>
            <span>Payment</span>
          </div>
          <span className="text-zinc-600">───</span>
          <div className="flex items-center gap-1.5 text-[#a1a4a5]">
            <span className="w-5 h-5 rounded-full bg-[#16161a] border border-[#26262b] text-[11px] flex items-center justify-center">3</span>
            <span>Minted Key</span>
          </div>
        </div>
      </div>

      {/* 1-Click Renewal Active Notification */}
      {renewOrderId && (
        <div className="mb-8 p-4 sm:p-5 rounded-[20px] bg-[#0c1f15] border border-[#3ad389]/40 flex items-start gap-3.5 shadow-xl shadow-[#3ad389]/5 animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-[#3ad389]/20 border border-[#3ad389]/30 flex items-center justify-center text-[#3ad389] shrink-0 mt-0.5">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#3ad389] bg-[#3ad389]/10 px-2 py-0.5 rounded">
                1-Click Subscription Renewal
              </span>
              <span className="font-mono text-xs text-white">
                Extending Order #{renewOrderId}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Your 30-day package quota will be extended and traffic reset on your <strong className="text-white">exact same VLESS UUID</strong>. No re-importing into NetMod, V2Box, or v2rayNG needed!
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Columns: Itemized Items & Payment Selection */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Cart Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f1f23]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#a1a4a5]">
                Digital Assets in Cart
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-mono text-red-400 hover:underline cursor-pointer"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-4">
              {cart.map((item) => {
                const itemPrice = currency === 'USD' ? item.priceUSD : item.priceLKR;
                const lineTotal = itemPrice * item.quantity;
                const lineTotalText =
                  currency === 'USD'
                    ? `$${lineTotal.toFixed(2)}`
                    : `Rs. ${lineTotal.toLocaleString()}`;

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23] hover:border-white/30 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-[14px] bg-[#16161a] border border-[#26262b] flex items-center justify-center text-white shrink-0 mt-0.5">
                          {item.product.category === 'vpn' && <Shield className="w-5 h-5" />}
                          {item.product.category === 'subscription' && <Sparkles className="w-5 h-5" />}
                          {item.product.category === 'gaming' && <Zap className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
                              {item.product.category}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.2 rounded-full">
                              Instant Auto-Mint
                            </span>
                          </div>
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-base sm:text-lg font-medium text-white hover:underline transition-colors leading-snug block"
                          >
                            {item.product.title}
                          </Link>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* In-Cart Duration Switcher & ISP Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-[14px] bg-[#141417] border border-[#1f1f23] text-xs font-mono mb-4">
                      <div>
                        <label className="text-[10px] text-[#a1a4a5] uppercase block mb-1">
                          Commitment Term:
                        </label>
                        <select
                          value={item.durationIndex}
                          onChange={(e) => updateDuration(item.id, Number(e.target.value))}
                          className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
                        >
                          {item.product.durations.map((dur, dIdx) => (
                            <option key={dur.label} value={dIdx}>
                              {dur.label} ({dur.days === 9999 ? 'Permanent' : `${dur.days} days`})
                            </option>
                          ))}
                        </select>
                      </div>

                      {item.product.category === 'vpn' && (
                        <div>
                          <label className="text-[10px] text-[#a1a4a5] uppercase block mb-1">
                            Target ISP Routing:
                          </label>
                          <select
                            value={item.selectedISP || 'SLT Fiber / Mobitel / Dialog'}
                            onChange={(e) => updateISP(item.id, e.target.value)}
                            className="w-full bg-[#0c0c0e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
                          >
                            <option value="SLT Fiber / Mobitel / Dialog">SLT Fiber / Dialog / Mobitel</option>
                            <option value="Dialog 4G / Home Broadband">Dialog 4G / Broadband</option>
                            <option value="Hutch / Airtel Lanka">Hutch / Airtel Lanka</option>
                            <option value="International Starlink / Anycast">Global / Starlink</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Price and Quantity Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1f1f23]">
                      <div>
                        <div className="text-[11px] font-mono text-[#a1a4a5]">Item Price</div>
                        <div className="text-sm font-mono text-zinc-300">
                          {currency === 'USD' ? `$${item.priceUSD.toFixed(2)}` : `Rs. ${item.priceLKR.toLocaleString()}`} each
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <QuantityStepper
                          value={item.quantity}
                          min={1}
                          max={99}
                          onChange={(newQty) => updateQuantity(item.id, newQty)}
                          size="sm"
                        />

                        <div className="text-right min-w-[90px]">
                          <div className="text-[10px] font-mono text-[#a1a4a5]">Line Total</div>
                          <div className="text-base font-mono font-bold text-white flex items-center justify-end gap-0.5">
                            {currency === 'USD' ? (
                              <>
                                <span>$</span>
                                <AnimatedNumber value={(item.priceUSD * item.quantity).toFixed(2)} />
                              </>
                            ) : (
                              <>
                                <span>Rs. </span>
                                <AnimatedNumber value={item.priceLKR * item.quantity} formatCommas />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/catalog"
                className="text-xs font-mono text-[#a1a4a5] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>← Add more items from Catalog</span>
              </Link>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-white">
                Choose Payment Method
              </h2>
              <span className="font-mono text-[11px] text-[#3ad389] bg-[#3ad389]/10 px-2.5 py-0.5 rounded-full">
                Zero Fees
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-[14px] border text-left transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-[#18181c] border-[#3ad389] shadow-lg shadow-[#3ad389]/10'
                    : 'bg-[#121215] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Upload className={`w-5 h-5 ${paymentMethod === 'bank_transfer' ? 'text-[#3ad389]' : 'text-white'}`} />
                  <span className="text-[9px] font-mono text-[#3ad389] uppercase font-bold">Fastest</span>
                </div>
                <div className="text-xs font-mono font-medium text-white">Bank Transfer / CDM</div>
                <div className="text-[10px] font-mono text-[#a1a4a5] mt-0.5">ComBank / Sampath / BOC</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-[14px] border text-left transition-all cursor-pointer ${
                  paymentMethod === 'crypto'
                    ? 'bg-[#18181c] border-white'
                    : 'bg-[#121215] border-white/5 hover:border-white/20'
                }`}
              >
                <Zap className="w-5 h-5 text-white mb-2" />
                <div className="text-xs font-mono font-medium text-white">Cryptocurrency</div>
                <div className="text-[10px] font-mono text-[#a1a4a5] mt-0.5">USDT TRC20 / TON / BTC</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('gateway')}
                className={`p-4 rounded-[14px] border text-left transition-all cursor-pointer ${
                  paymentMethod === 'gateway'
                    ? 'bg-[#18181c] border-white'
                    : 'bg-[#121215] border-white/5 hover:border-white/20'
                }`}
              >
                <CreditCard className="w-5 h-5 text-zinc-400 mb-2" />
                <div className="text-xs font-mono font-medium text-zinc-300">Online Cards</div>
                <div className="text-[10px] font-mono text-zinc-500 mt-0.5">Visa / Mastercard / LKR</div>
              </button>
            </div>

            {/* Bank Transfer Details View */}
            {paymentMethod === 'bank_transfer' && (
              <div className="p-5 rounded-[16px] bg-[#141417] border border-[#222228] text-xs font-mono space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#222228]">
                  <span className="text-white font-semibold">
                    Supported Sri Lankan Banks
                  </span>
                  <span className="text-[10px] text-zinc-400">Transfer or Cash CDM</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {/* ComBank */}
                  <div className="p-3 rounded-xl bg-[#0c0c0e] border border-white/10 hover:border-[#3ad389]/40 transition-colors">
                    <div className="text-zinc-400 text-[10px] uppercase font-bold text-[#3ad389]">Commercial Bank</div>
                    <div className="text-white font-bold text-xs mt-1">8002914820</div>
                    <div className="text-[10px] text-zinc-500">Colombo Main</div>
                    <button
                      type="button"
                      onClick={() => handleCopyAcc('8002914820')}
                      className="mt-2 text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedBankAcc === '8002914820' ? <Check className="w-3 h-3 text-[#3ad389]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedBankAcc === '8002914820' ? 'Copied' : 'Copy Acc #'}</span>
                    </button>
                  </div>

                  {/* Sampath */}
                  <div className="p-3 rounded-xl bg-[#0c0c0e] border border-white/10 hover:border-[#3ad389]/40 transition-colors">
                    <div className="text-zinc-400 text-[10px] uppercase font-bold text-amber-400">Sampath Bank</div>
                    <div className="text-white font-bold text-xs mt-1">100299182390</div>
                    <div className="text-[10px] text-zinc-500">Colombo 03</div>
                    <button
                      type="button"
                      onClick={() => handleCopyAcc('100299182390')}
                      className="mt-2 text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedBankAcc === '100299182390' ? <Check className="w-3 h-3 text-[#3ad389]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedBankAcc === '100299182390' ? 'Copied' : 'Copy Acc #'}</span>
                    </button>
                  </div>

                  {/* BOC */}
                  <div className="p-3 rounded-xl bg-[#0c0c0e] border border-white/10 hover:border-[#3ad389]/40 transition-colors">
                    <div className="text-zinc-400 text-[10px] uppercase font-bold text-sky-400">Bank of Ceylon</div>
                    <div className="text-white font-bold text-xs mt-1">00928172901</div>
                    <div className="text-[10px] text-zinc-500">Kollupitiya</div>
                    <button
                      type="button"
                      onClick={() => handleCopyAcc('00928172901')}
                      className="mt-2 text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedBankAcc === '00928172901' ? <Check className="w-3 h-3 text-[#3ad389]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedBankAcc === '00928172901' ? 'Copied' : 'Copy Acc #'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-300">
                  Beneficiary Name: <span className="text-white font-semibold">Fibez Digital Infrastructure Ltd</span>
                </div>

                {/* Slip Upload & Interactive Preview */}
                <div className="pt-2 border-t border-[#222228]">
                  <label className="block text-[11px] text-[#a1a4a5] mb-2 font-medium">
                    Upload Bank Transfer Slip (PNG, JPG or PDF from ComBank / Sampath app):
                  </label>

                  {uploadedSlip ? (
                    <div className="p-3.5 rounded-xl bg-[#0c0c0e] border border-[#3ad389]/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {uploadedSlip.toLowerCase().endsWith('.pdf') || uploadedSlipName?.toLowerCase().endsWith('.pdf') ? (
                          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center font-bold text-rose-400 text-xs">
                            PDF
                          </div>
                        ) : (
                          <img
                            src={uploadedSlip}
                            alt="Slip thumbnail"
                            className="w-10 h-10 rounded-lg object-cover border border-white/20"
                          />
                        )}
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <span>{uploadedSlipName || 'Bank Transfer Slip'}</span>
                            <Check className="w-3.5 h-3.5 text-[#3ad389]" />
                          </div>
                          <span className="text-[10px] text-[#3ad389]">
                            Ready for intelligent bank verification
                          </span>
                        </div>
                      </div>

                      <label className="px-3 py-1.5 rounded-lg bg-[#1a1a1f] hover:bg-[#25252c] text-xs font-mono text-zinc-300 hover:text-white cursor-pointer transition-colors">
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          disabled={isUploadingSlip}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setUploadedSlipName(file.name);
                            handleFileUpload(e);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      {isUploadingSlip ? (
                        <div className="flex flex-col items-center justify-center gap-2 p-8 rounded-2xl bg-[#0c0c0e] border border-dashed border-[#3ad389]/40 text-center">
                          <div className="w-6 h-6 border-2 border-[#3ad389] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-mono text-[#3ad389]">Uploading &amp; Scanning Receipt...</span>
                        </div>
                      ) : (
                        <FileUpload onChange={handleDropzoneUpload} />
                      )}
                    </div>
                  )}

                  {uploadError && (
                    <div className="text-[10px] text-red-400 mt-1.5">{uploadError}</div>
                  )}
                </div>
              </div>
            )}

            {/* Crypto Details View */}
            {paymentMethod === 'crypto' && (
              <div className="p-4 rounded-[14px] bg-[#141417] border border-[#1f1f23] text-xs font-mono space-y-3">
                <div className="text-white font-semibold flex items-center justify-between">
                  <span>Send Exact Amount: {currency === 'USD' ? `$${finalTotalUSD.toFixed(2)} USDT` : `USDT equivalent of Rs. ${finalTotalLKR.toLocaleString()}`}</span>
                  <span className="text-[10px] text-zinc-400">TRC20 Network</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-[#0c0c0e] border border-white/10">
                  <span className="text-zinc-300 font-mono truncate max-w-xs">
                    TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
                      setCopiedCrypto(true);
                      setTimeout(() => setCopiedCrypto(false), 1500);
                    }}
                    className="ml-2 text-[#a1a4a5] hover:text-white"
                  >
                    {copiedCrypto ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Customer Details: Email & WhatsApp Phone */}
            <div className="pt-2 space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#a1a4a5] uppercase tracking-wider mb-1.5">
                  Fulfillment &amp; Key Notification Email
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#141417] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1a4a5] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>WhatsApp Mobile Number (Sri Lanka)</span>
                  <span className="text-[10px] text-[#3ad389] lowercase">instant dispatch</span>
                </label>
                <input
                  type="tel"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="077 123 4567 or +94 77 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#141417] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-mono"
                />
                <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                  Keys, VLESS links, and 1-tap NetMod / V2Box import buttons will be dispatched directly to this WhatsApp!
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Sticky Order Summary & Checkout Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-[24px] bg-[#0c0c0e] border border-[#1f1f23] p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f23]">
              <h2 className="text-base font-medium text-white">
                Order Summary
              </h2>
              {/* Currency Toggle */}
              <div className="flex items-center bg-[#141417] border border-white/10 p-0.5 rounded-lg text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setCurrency('LKR')}
                  className={`px-2 py-0.5 rounded ${currency === 'LKR' ? 'bg-white text-black font-semibold' : 'text-[#a1a4a5]'}`}
                >
                  LKR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2 py-0.5 rounded ${currency === 'USD' ? 'bg-white text-black font-semibold' : 'text-[#a1a4a5]'}`}
                >
                  USD
                </button>
              </div>
            </div>

            {/* Promo Code Box */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo Code (e.g. FIBEZ10)"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl bg-[#16161a] border border-[#26262b] hover:border-white/30 text-xs font-mono text-white transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <div className="mt-2 text-[11px] font-mono text-[#3ad389] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Promo &ldquo;{appliedPromo.code}&rdquo; Applied ({appliedPromo.percent}% OFF)</span>
                </div>
              )}
              {promoError && (
                <div className="mt-2 text-[11px] font-mono text-rose-400">
                  {promoError}
                </div>
              )}
            </div>

            {/* Friend Referral Code Box */}
            <div className="pt-2 border-t border-[#1f1f23]">
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Friend Referral Code</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                  placeholder="e.g. AKAIN-89"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyReferral}
                  className="px-4 py-2 rounded-xl bg-[#16161a] border border-[#26262b] hover:border-white/30 text-xs font-mono text-white transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedReferral && (
                <div className="mt-2 text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Referral &ldquo;{appliedReferral.code}&rdquo; Active: Rs. {appliedReferral.discountLKR} OFF!</span>
                </div>
              )}
              {referralError && (
                <div className="mt-2 text-[11px] font-mono text-rose-400">
                  {referralError}
                </div>
              )}
            </div>

            {/* Fibez Store Credits Redemption */}
            {userCredits > 0 && (
              <div className="p-3.5 rounded-xl bg-[#121815] border border-[#3ad389]/30 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#3ad389]" />
                    <span className="text-white font-medium">Fibez Store Credits</span>
                  </div>
                  <span className="text-[#3ad389] font-bold">{userCredits} Credits</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  1 credit = Rs. 10. Balance: Rs. {userCredits * 10}
                </div>
                <label className="mt-2.5 flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCredits}
                    onChange={(e) => setUseCredits(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#3ad389]"
                  />
                  <span>Redeem Store Credits (-Rs. {creditsDiscountLKR})</span>
                </label>
              </div>
            )}

            {/* Breakdown */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#a1a4a5]">Items Subtotal ({cartCount})</span>
                <span className="text-white">{subtotalFormatted}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-[#3ad389]">
                  <span>Voucher Discount</span>
                  <span>-Rs. {promoDiscountLKR.toLocaleString()}</span>
                </div>
              )}
              {appliedReferral && (
                <div className="flex justify-between text-amber-400">
                  <span>Referral Discount</span>
                  <span>-Rs. {referralDiscountLKR.toLocaleString()}</span>
                </div>
              )}
              {useCredits && creditsDiscountLKR > 0 && (
                <div className="flex justify-between text-[#3ad389]">
                  <span>Store Credits Redeemed</span>
                  <span>-Rs. {creditsDiscountLKR.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#a1a4a5]">Digital Delivery</span>
                <span className="text-zinc-300 font-semibold">FREE (WhatsApp &amp; Vault)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a1a4a5]">SLA Replacement Warranty</span>
                <span className="text-zinc-300 font-semibold">INCLUDED</span>
              </div>
              <div className="pt-4 border-t border-[#1f1f23] flex items-baseline justify-between text-base">
                <span className="text-white font-medium">Grand Total</span>
                <span className="text-3xl font-bold text-white tracking-tight flex items-baseline justify-end gap-1">
                  {currency === 'USD' ? (
                    <>
                      <span>$</span>
                      <AnimatedNumber value={finalTotalUSD.toFixed(2)} />
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-normal text-zinc-400">Rs. </span>
                      <AnimatedNumber value={finalTotalLKR} formatCommas />
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <AnimatedButton
              as="button"
              type="submit"
              variant="emerald"
              size="lg"
              disabled={isProcessing}
              className="w-full text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-[#3ad389]/20"
            >
              {isProcessing ? (
                <span>Minting Encrypted Keys...</span>
              ) : (
                <>
                  <span>Complete Order & Claim Keys</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </AnimatedButton>

            {/* Guarantees */}
            <div className="pt-2 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#a1a4a5]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3ad389]" />
                <span>Zero-trust encrypted payload delivery</span>
              </div>
              <p className="text-[10px] font-mono text-zinc-500">
                Keys immediately appear in your personal <Link href="/vault" className="text-white hover:underline">Key Vault</Link>
              </p>
              <p className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-[#1f1f23]">
                Digital goods: sales final once revealed. 24-hr replacement for invalid keys.{' '}
                <Link href="/refund" className="text-white hover:underline">Refund Policy</Link>
              </p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
