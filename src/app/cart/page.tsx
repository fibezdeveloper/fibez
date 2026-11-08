'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { authClient } from '@/lib/auth-client';
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
  ExternalLink
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

  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'crypto' | 'bank_transfer'>('gateway');
  const [customerEmail, setCustomerEmail] = useState(session?.user?.email || '');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [copiedCrypto, setCopiedCrypto] = useState(false);
  const [uploadedSlip, setUploadedSlip] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync email from session if empty
  React.useEffect(() => {
    if (session?.user?.email && !customerEmail) {
      setCustomerEmail(session.user.email);
    }
  }, [session, customerEmail]);

  // Discount calculation
  const discountMultiplier = appliedPromo ? (1 - appliedPromo.percent / 100) : 1;
  const finalTotalLKR = Math.round(cartTotalLKR * discountMultiplier);
  const finalTotalUSD = parseFloat((cartTotalUSD * discountMultiplier).toFixed(2));

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
      ? `-$${(cartTotalUSD - finalTotalUSD).toFixed(2)}`
      : `-Rs. ${(cartTotalLKR - finalTotalLKR).toLocaleString()}`;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (code === 'FIBEZ10' || code === 'WELCOME') {
      setAppliedPromo({ code, percent: 10 });
    } else if (code === 'DEV20') {
      setAppliedPromo({ code, percent: 20 });
    } else {
      setPromoError('Invalid promo code. Try "FIBEZ10" or "DEV20"');
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
      setTimeout(() => {
        router.push('/vault');
      }, 1400);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedSlip(url);
    }
  };

  if (cartCount === 0 && !isSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-36 text-center">
        <div className="w-20 h-20 rounded-full bg-[#130f24] border border-[#2a2247] flex items-center justify-center mx-auto text-[#9281f7] mb-6 shadow-[0_0_30px_rgba(146,129,247,0.2)]">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-medium text-white mb-3">
          Your Dedicated Shopping Cart is Empty
        </h1>
        <p className="text-sm text-[#8e87aa] max-w-md mx-auto mb-8 leading-relaxed">
          Select high-speed V2Ray reality nodes, AMD EPYC NVMe cloud servers, or zero-trust software subscriptions to get started.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#9281f7] hover:bg-[#806ff5] text-black text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(146,129,247,0.35)]"
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
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-6 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 mb-2">
          Automated Pipeline Complete
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-white mb-2">
          Order Verified & Keys Minted!
        </h1>
        <p className="text-sm text-[#8e87aa] mb-6 leading-relaxed">
          Zero-trust keys and connection strings have been minted under 400ms and delivered to your personal Key Vault. Redirecting...
        </p>
        <Link
          href="/vault"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9281f7] text-black text-xs font-semibold uppercase tracking-wider"
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
      <div className="flex items-center gap-2 text-xs font-mono text-[#8e87aa] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        <Link href="/catalog" className="hover:text-white transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        <span className="text-white">Shopping Cart ({cartCount})</span>
      </div>

      {/* Header & Steps */}
      <div className="mb-10 pb-6 border-b border-[#231e38] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-2">
            Dedicated Cart & Zero-Trust Checkout
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
            Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        {/* 3-Step Indicator */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <span className="w-5 h-5 rounded-full bg-[#9281f7] text-black text-[11px] font-bold flex items-center justify-center">1</span>
            <span>Cart Review</span>
          </div>
          <span className="text-[#3b3554]">───</span>
          <div className="flex items-center gap-1.5 text-[#8e87aa]">
            <span className="w-5 h-5 rounded-full bg-[#18142b] border border-[#2e264f] text-[11px] flex items-center justify-center">2</span>
            <span>Payment</span>
          </div>
          <span className="text-[#3b3554]">───</span>
          <div className="flex items-center gap-1.5 text-[#8e87aa]">
            <span className="w-5 h-5 rounded-full bg-[#18142b] border border-[#2e264f] text-[11px] flex items-center justify-center">3</span>
            <span>Minted Key</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Columns: Itemized Items & Payment Selection */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Cart Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c182d]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8e87aa]">
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
                    className="p-5 rounded-[20px] bg-[#0c0919] border border-[#231e38] hover:border-[#9281f7]/40 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-[14px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-[#9281f7] shrink-0 mt-0.5">
                          {item.product.category === 'vpn' && <Shield className="w-5 h-5" />}
                          {item.product.category === 'vps' && <Server className="w-5 h-5" />}
                          {item.product.category === 'subscription' && <Sparkles className="w-5 h-5" />}
                          {item.product.category === 'gaming' && <Zap className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] uppercase text-[#9281f7] tracking-wider">
                              {item.product.category}
                            </span>
                            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded-full">
                              Instant Auto-Mint
                            </span>
                          </div>
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-base sm:text-lg font-medium text-white hover:text-[#9281f7] transition-colors leading-snug block"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-[14px] bg-[#120e24] border border-[#231e38] text-xs font-mono mb-4">
                      <div>
                        <label className="text-[10px] text-[#8e87aa] uppercase block mb-1">
                          Commitment Term:
                        </label>
                        <select
                          value={item.durationIndex}
                          onChange={(e) => updateDuration(item.id, Number(e.target.value))}
                          className="w-full bg-[#0a0815] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#9281f7] cursor-pointer"
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
                          <label className="text-[10px] text-[#8e87aa] uppercase block mb-1">
                            Target ISP Routing:
                          </label>
                          <select
                            value={item.selectedISP || 'SLT Fiber / Mobitel / Dialog'}
                            onChange={(e) => updateISP(item.id, e.target.value)}
                            className="w-full bg-[#0a0815] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#9281f7] cursor-pointer"
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
                    <div className="flex items-center justify-between pt-2 border-t border-[#1c182d]">
                      <div>
                        <div className="text-[11px] font-mono text-[#8e87aa]">Item Price</div>
                        <div className="text-sm font-mono text-zinc-300">
                          {currency === 'USD' ? `$${item.priceUSD.toFixed(2)}` : `Rs. ${item.priceLKR.toLocaleString()}`} each
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-xl bg-[#141026] border border-[#2b2344] p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded text-zinc-400 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-mono text-white font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded text-zinc-400 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <div className="text-[10px] font-mono text-[#8e87aa]">Line Total</div>
                          <div className="text-base font-mono font-bold text-[#9281f7]">
                            {lineTotalText}
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
                className="text-xs font-mono text-[#8e87aa] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>← Add more items from Catalog</span>
              </Link>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-[20px] bg-[#0c0919] border border-[#231e38] space-y-5">
            <h2 className="text-base font-medium text-white">
              Choose Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('gateway')}
                className={`p-4 rounded-[14px] border text-left transition-all cursor-pointer ${
                  paymentMethod === 'gateway'
                    ? 'bg-[#17122b] border-[#9281f7] shadow-[0_0_15px_rgba(146,129,247,0.25)]'
                    : 'bg-[#100d21] border-white/5 hover:border-white/20'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#9281f7] mb-2" />
                <div className="text-xs font-mono font-medium text-white">Online Cards</div>
                <div className="text-[10px] font-mono text-[#8e87aa] mt-0.5">Visa / Mastercard / LKR</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-[14px] border text-left transition-all cursor-pointer ${
                  paymentMethod === 'crypto'
                    ? 'bg-[#17122b] border-[#9281f7] shadow-[0_0_15px_rgba(146,129,247,0.25)]'
                    : 'bg-[#100d21] border-white/5 hover:border-white/20'
                }`}
              >
                <Zap className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-xs font-mono font-medium text-white">Cryptocurrency</div>
                <div className="text-[10px] font-mono text-[#8e87aa] mt-0.5">USDT TRC20 / TON / BTC</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-[14px] border text-left transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-[#17122b] border-[#9281f7] shadow-[0_0_15px_rgba(146,129,247,0.25)]'
                    : 'bg-[#100d21] border-white/5 hover:border-white/20'
                }`}
              >
                <Upload className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-xs font-mono font-medium text-white">Bank Transfer / CDM</div>
                <div className="text-[10px] font-mono text-[#8e87aa] mt-0.5">Instant Slip Upload</div>
              </button>
            </div>

            {/* Crypto Details View */}
            {paymentMethod === 'crypto' && (
              <div className="p-4 rounded-[14px] bg-[#120e24] border border-[#2b2447] text-xs font-mono space-y-3">
                <div className="text-[#9281f7] font-semibold flex items-center justify-between">
                  <span>Send Exact Amount: {currency === 'USD' ? `$${finalTotalUSD.toFixed(2)} USDT` : `USDT equivalent of Rs. ${finalTotalLKR.toLocaleString()}`}</span>
                  <span className="text-[10px] text-emerald-400">TRC20 Network</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-[#0a0815] border border-white/10">
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
                    className="ml-2 text-[#8e87aa] hover:text-white"
                  >
                    {copiedCrypto ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Bank Transfer Details View */}
            {paymentMethod === 'bank_transfer' && (
              <div className="p-4 rounded-[14px] bg-[#120e24] border border-[#2b2447] text-xs font-mono space-y-3">
                <div className="text-emerald-400 font-semibold">
                  Commercial Bank of Ceylon PLC
                </div>
                <div className="grid grid-cols-2 gap-2 text-zinc-300">
                  <div>Account: <span className="text-white font-semibold">8002914820</span></div>
                  <div>Branch: <span className="text-white">Colombo Main</span></div>
                  <div className="col-span-2">Beneficiary: <span className="text-white">Fibez Digital Infrastructure Ltd</span></div>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] text-[#8e87aa] mb-1.5">
                    Attach Transfer Receipt Slip:
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-[12px] bg-[#0a0815] border border-dashed border-white/20 hover:border-[#9281f7] cursor-pointer text-zinc-400 hover:text-white transition-colors">
                    <Upload className="w-4 h-4 text-[#9281f7]" />
                    <span>{uploadedSlip ? 'Slip Attached ✓' : 'Upload Bank Slip / Screenshot'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* Delivery Email Input */}
            <div className="pt-2">
              <label className="block text-xs font-mono text-[#8e87aa] uppercase tracking-wider mb-2">
                Fulfillment & Key Notification Email
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="developer@terminal.sh"
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#120e24] border border-white/10 text-xs text-white placeholder-[#6e6884] focus:outline-none focus:border-[#9281f7] font-mono"
              />
              <span className="text-[10px] font-mono text-[#5c5673] mt-1 block">
                Keys will be dispatched to this email and immediately available in your personal <Link href="/vault" className="text-[#9281f7] hover:underline">Key Vault</Link>.
              </span>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Sticky Order Summary & Checkout Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-[24px] bg-[#0c0919] border border-[#2a2344] p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#231e38]">
              <h2 className="text-base font-medium text-white">
                Order Summary
              </h2>
              {/* Currency Toggle */}
              <div className="flex items-center bg-[#151126] border border-white/10 p-0.5 rounded-lg text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setCurrency('LKR')}
                  className={`px-2 py-0.5 rounded ${currency === 'LKR' ? 'bg-[#9281f7] text-black font-semibold' : 'text-[#8e87aa]'}`}
                >
                  LKR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2 py-0.5 rounded ${currency === 'USD' ? 'bg-[#9281f7] text-black font-semibold' : 'text-[#8e87aa]'}`}
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
                  className="flex-1 px-3 py-2 rounded-xl bg-[#120e24] border border-white/10 text-xs font-mono text-white placeholder-[#5c5673] focus:outline-none focus:border-[#9281f7] uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl bg-[#18142b] border border-[#2e264f] hover:border-[#9281f7] text-xs font-mono text-[#9281f7] hover:text-white transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <div className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
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

            {/* Breakdown */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#8e87aa]">Items Subtotal ({cartCount})</span>
                <span className="text-white">{subtotalFormatted}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-400">
                  <span>Voucher Discount</span>
                  <span>{discountAmountFormatted}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#8e87aa]">Zero-Trust Automated Minting</span>
                <span className="text-emerald-400 font-semibold">FREE (&lt;400ms)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8e87aa]">SLA Replacement Warranty</span>
                <span className="text-emerald-400 font-semibold">INCLUDED</span>
              </div>
              <div className="pt-4 border-t border-[#231e38] flex items-baseline justify-between text-base">
                <span className="text-white font-medium">Grand Total</span>
                <span className="text-3xl font-bold text-white tracking-tight">
                  {totalFormatted}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-xl bg-[#9281f7] hover:bg-[#806ff5] text-black font-semibold text-xs tracking-wider uppercase text-center transition-all shadow-[0_0_20px_rgba(146,129,247,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Minting Encrypted Keys...</span>
              ) : (
                <>
                  <span>Complete Order & Claim Keys</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Guarantees */}
            <div className="pt-2 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#8e87aa]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-trust encrypted payload delivery</span>
              </div>
              <p className="text-[10px] font-mono text-[#5c5673]">
                Keys immediately appear in your personal <Link href="/vault" className="text-[#9281f7] hover:underline">Key Vault</Link>
              </p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
