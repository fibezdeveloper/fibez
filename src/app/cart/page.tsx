'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
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
  Zap 
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { 
    cart, 
    cartCount, 
    cartTotalLKR, 
    cartTotalUSD, 
    currency, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'crypto' | 'bank_transfer'>('gateway');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalFormatted =
    currency === 'USD'
      ? `$${cartTotalUSD.toFixed(2)}`
      : `Rs. ${cartTotalLKR.toLocaleString()}`;

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
      }, 1200);
    }, 1500);
  };

  if (cartCount === 0 && !isSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-36 text-center">
        <div className="w-16 h-16 rounded-full bg-[#130f24] border border-[#2a2247] flex items-center justify-center mx-auto text-[#9281f7] mb-6">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-white mb-2">
          Your shopping cart is currently empty
        </h1>
        <p className="text-sm text-[#8e87aa] max-w-md mx-auto mb-8">
          You haven&apos;t added any V2Ray VPN configurations, Cloud VPS servers, or software subscriptions yet.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9281f7] hover:bg-[#806ff5] text-black text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(146,129,247,0.35)]"
        >
          <span>Explore Product Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-36 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-white mb-2">
          Order Verified & Minted!
        </h1>
        <p className="text-sm text-[#8e87aa] mb-6">
          Your zero-trust keys have been dispatched directly to your personal Key Vault. Redirecting...
        </p>
        <Link
          href="/vault"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#9281f7] text-black text-xs font-semibold uppercase tracking-wider"
        >
          <span>Go to Key Vault</span>
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

      <div className="mb-10 pb-6 border-b border-[#231e38]">
        <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
          Review Cart & Instant Checkout
        </h1>
        <p className="text-sm text-[#8e87aa] mt-2">
          Automated zero-trust key minting under 400ms upon payment confirmation.
        </p>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Columns: Itemized Items & Payment Selection */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Cart Items List */}
          <div className="space-y-4">
            <h2 className="text-base font-medium text-white flex items-center justify-between">
              <span>Selected Digital Goods ({cartCount})</span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-mono text-red-400 hover:underline"
              >
                Clear All
              </button>
            </h2>

            <div className="space-y-3">
              {cart.map((item) => {
                const itemPriceText =
                  currency === 'USD'
                    ? `$${(item.priceUSD * item.quantity).toFixed(2)}`
                    : `Rs. ${(item.priceLKR * item.quantity).toLocaleString()}`;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-[16px] bg-[#0c0919] border border-[#231e38] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.productId}`}
                        className="text-base font-medium text-white hover:text-[#9281f7] transition-colors"
                      >
                        {item.product.title}
                      </Link>
                      <div className="text-xs text-[#8e87aa] mt-1">
                        Duration Commitment: <span className="text-zinc-300 font-mono">{item.durationLabel}</span>
                      </div>
                      <div className="text-base font-mono font-bold text-[#9281f7] mt-1.5">
                        {itemPriceText}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
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

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-[20px] bg-[#0c0919] border border-[#231e38] space-y-4">
            <h2 className="text-base font-medium text-white">
              Select Payment Gateway
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('gateway')}
                className={`p-3.5 rounded-[14px] border text-left transition-all cursor-pointer ${
                  paymentMethod === 'gateway'
                    ? 'bg-[#17122b] border-[#9281f7] shadow-[0_0_15px_rgba(146,129,247,0.25)]'
                    : 'bg-[#100d21] border-white/5 hover:border-white/20'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#9281f7] mb-2" />
                <div className="text-xs font-mono font-medium text-white">Online Cards</div>
                <div className="text-[10px] font-mono text-[#8e87aa] mt-0.5">Visa / Mastercard / LKR</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('crypto')}
                className={`p-3.5 rounded-[14px] border text-left transition-all cursor-pointer ${
                  paymentMethod === 'crypto'
                    ? 'bg-[#17122b] border-[#9281f7] shadow-[0_0_15px_rgba(146,129,247,0.25)]'
                    : 'bg-[#100d21] border-white/5 hover:border-white/20'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400 mb-2" />
                <div className="text-xs font-mono font-medium text-white">Cryptocurrency</div>
                <div className="text-[10px] font-mono text-[#8e87aa] mt-0.5">USDT TRC20 / TON / BTC</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3.5 rounded-[14px] border text-left transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-[#17122b] border-[#9281f7] shadow-[0_0_15px_rgba(146,129,247,0.25)]'
                    : 'bg-[#100d21] border-white/5 hover:border-white/20'
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-400 mb-2" />
                <div className="text-xs font-mono font-medium text-white">Bank Transfer / CDM</div>
                <div className="text-[10px] font-mono text-[#8e87aa] mt-0.5">Instant Slip Upload</div>
              </button>
            </div>

            {/* Email Field */}
            <div className="pt-2">
              <label className="block text-xs font-mono text-[#8e87aa] uppercase tracking-wider mb-2">
                Fulfillment & Backup Key Email
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
                Keys will be delivered to this email and immediately available in your Key Vault.
              </span>
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Order Summary Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-[24px] bg-[#0c0919] border border-[#2a2344] p-6 shadow-2xl space-y-6">
            <h2 className="text-base font-medium text-white pb-3 border-b border-[#231e38]">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#8e87aa]">Items Subtotal ({cartCount})</span>
                <span className="text-white">{totalFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8e87aa]">Zero-Trust Automated Minting</span>
                <span className="text-emerald-400 font-semibold">FREE ($0.00)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8e87aa]">SLA Replacement Warranty</span>
                <span className="text-emerald-400 font-semibold">INCLUDED</span>
              </div>
              <div className="pt-4 border-t border-[#231e38] flex items-baseline justify-between text-base">
                <span className="text-white font-medium">Grand Total</span>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {totalFormatted}
                </span>
              </div>
            </div>

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

            <div className="pt-2 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#8e87aa]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-trust encrypted payload delivery</span>
              </div>
              <p className="text-[10px] font-mono text-[#5c5673]">
                Guaranteed sub-400ms provisioning or 100% money back.
              </p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
