'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/products-data';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice } from '@/lib/currency';
import {
  ArrowLeft,
  Building2,
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  CreditCard,
  ShieldCheck,
  Zap,
  Tag,
  AlertCircle
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency } = useCurrency();

  const variantId = searchParams.get('variant');
  const productSlug = searchParams.get('product');

  // Locate product and variant
  let product = PRODUCTS.find((p) => p.slug === productSlug);
  let variant = product?.variants.find((v) => v.id === variantId);

  // Fallback defaults if accessed directly
  if (!product || !variant) {
    product = PRODUCTS[0];
    variant = product.variants[0];
  }

  // State
  const [paymentTab, setPaymentTab] = useState<'BANK' | 'WHATSAPP' | 'CARD'>('BANK');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate reference code
  const [referenceCode] = useState(() => `FBZ-${Math.floor(100000 + Math.random() * 900000)}`);

  const basePrice = currency === 'LKR' ? variant.priceLKR : variant.priceUSD;
  const finalPrice = basePrice * (1 - discountPercent / 100);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FIBEZ10') {
      setDiscountPercent(10);
      setPromoMessage({ type: 'success', text: '10% Cryptographic Discount Applied!' });
    } else if (promoCode.trim().toUpperCase() === 'LAUNCH') {
      setDiscountPercent(15);
      setPromoMessage({ type: 'success', text: '15% Launch Code Applied!' });
    } else {
      setDiscountPercent(0);
      setPromoMessage({ type: 'error', text: 'Invalid promo code token.' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail) {
      alert('Please enter your email address for key delivery.');
      return;
    }
    if (!receiptImage) {
      alert('Please upload a screenshot or photo of your payment slip.');
      return;
    }

    setIsSubmitting(true);

    // Save order in localStorage so it appears in Key Vault & Admin Panel
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: referenceCode,
      createdAt: new Date().toISOString(),
      customerEmail,
      customerWhatsapp,
      productTitle: product.title,
      variantTitle: variant.title,
      amount: finalPrice,
      currency,
      status: 'PENDING_REVIEW',
      paymentMethod: 'BANK_TRANSFER',
      receiptImageUrl: receiptImage,
      licenseKey: 'PENDING_ADMIN_VERIFICATION',
      connectionConfig: '',
    };

    const existingOrders = JSON.parse(localStorage.getItem('fibez_orders') || '[]');
    localStorage.setItem('fibez_orders', JSON.stringify([newOrder, ...existingOrders]));

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/dashboard/vault?orderCreated=${referenceCode}`);
    }, 1200);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
      
      {/* Back button */}
      <div className="mb-8">
        <Link
          href={`/product/${product.slug}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--color-ash)] hover:text-[var(--color-accent)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO PRODUCT CONFIGURATOR</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Payment Processing Surface (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div>
            <span className="metadata-stamp text-[10px]">
              [ CHECKOUT TERMINAL // STEP 02 OF 02 ]
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white mt-1">
              Payment & Verification
            </h1>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-[var(--color-onyx)] p-1.5 border border-[var(--color-graphite)] rounded-[4px]">
            <button
              onClick={() => setPaymentTab('BANK')}
              className={`py-2.5 px-3 rounded-[2px] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                paymentTab === 'BANK'
                  ? 'bg-[var(--color-accent)] text-black font-bold shadow-[0_0_8px_rgba(197,255,74,0.4)]'
                  : 'text-[var(--color-bone)] hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Bank Transfer</span>
            </button>

            <button
              onClick={() => setPaymentTab('WHATSAPP')}
              className={`py-2.5 px-3 rounded-[2px] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                paymentTab === 'WHATSAPP'
                  ? 'bg-[var(--color-accent)] text-black font-bold shadow-[0_0_8px_rgba(197,255,74,0.4)]'
                  : 'text-[var(--color-bone)] hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Desk</span>
            </button>

            <button
              onClick={() => setPaymentTab('CARD')}
              className={`py-2.5 px-3 rounded-[2px] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                paymentTab === 'CARD'
                  ? 'bg-[var(--color-accent)] text-black font-bold shadow-[0_0_8px_rgba(197,255,74,0.4)]'
                  : 'text-[var(--color-bone)] hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Cards / Crypto</span>
            </button>
          </div>

          {/* TAB 1: BANK TRANSFER & RECEIPT UPLOAD */}
          {paymentTab === 'BANK' && (
            <form onSubmit={handleBankSubmit} className="space-y-6">
              
              {/* Bank Account Clearance Details */}
              <div className="card-sharp p-6 space-y-4 bg-[var(--color-onyx)]">
                <div className="flex items-center justify-between border-b border-[var(--color-graphite)] pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="font-mono text-xs uppercase text-white tracking-wider">
                      OFFICIAL DEPOSIT ACCOUNT (COMMERCIAL BANK)
                    </span>
                  </div>
                  <span className="pill-in-stock text-[9px] py-0.5">
                    ✓ ACTIVE RECIPIENT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--color-ash)] block uppercase">Bank Name</span>
                    <span className="text-white font-medium">Commercial Bank of Ceylon</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-ash)] block uppercase">Branch</span>
                    <span className="text-white font-medium">Colombo City Branch</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-ash)] block uppercase">Account Holder</span>
                    <span className="text-white font-medium">Fibez Digital Services</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-ash)] block uppercase">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-accent)] font-bold text-sm">8009214482</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('8009214482', 'acc')}
                        className="text-[var(--color-ash)] hover:text-white"
                        title="Copy Account Number"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mandatory Payment Reference */}
                <div className="p-3 bg-[var(--color-carbon)] border border-[var(--color-slate)] rounded-[2px] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--color-ash)] uppercase block">
                      Mandatory Payment Reference / Remarks:
                    </span>
                    <span className="font-mono text-sm font-bold text-[var(--color-accent)] tracking-wider">
                      {referenceCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(referenceCode, 'ref')}
                    className="btn-outlined py-1 px-2.5 text-[10px] flex items-center gap-1"
                  >
                    {copiedField === 'ref' ? <Check className="w-3 h-3 text-[var(--color-accent)]" /> : <Copy className="w-3 h-3" />}
                    <span>COPY REF</span>
                  </button>
                </div>
              </div>

              {/* Customer Delivery Information */}
              <div className="card-sharp p-6 space-y-4 bg-[var(--color-onyx)]">
                <span className="metadata-stamp text-[10px]">
                  [ KEY DISPATCH DESTINATION ]
                </span>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-[11px] text-[var(--color-ash)] uppercase mb-1">
                      Email Address (Vault & Backup Access) *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. buyer@gmail.com"
                      className="w-full p-3 bg-[var(--color-carbon)] border border-[var(--color-graphite)] focus:border-[var(--color-accent)] text-white outline-none rounded-[2px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[var(--color-ash)] uppercase mb-1">
                      WhatsApp Number (For Urgent Clearance Confirmation)
                    </label>
                    <input
                      type="tel"
                      value={customerWhatsapp}
                      onChange={(e) => setCustomerWhatsapp(e.target.value)}
                      placeholder="e.g. +94 77 123 4567"
                      className="w-full p-3 bg-[var(--color-carbon)] border border-[var(--color-graphite)] focus:border-[var(--color-accent)] text-white outline-none rounded-[2px]"
                    />
                  </div>
                </div>
              </div>

              {/* Receipt File Uploader */}
              <div className="card-sharp p-6 space-y-4 bg-[var(--color-onyx)]">
                <span className="metadata-stamp text-[10px]">
                  [ PROOF OF TRANSFER // PAYSLIP UPLOAD ]
                </span>

                <div className="border-2 border-dashed border-[var(--color-graphite)] hover:border-[var(--color-accent)] rounded-[4px] p-6 text-center transition-colors relative bg-[var(--color-carbon)]/50">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {receiptImage ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="relative w-36 h-28 border border-[var(--color-slate)] overflow-hidden rounded-[2px]">
                        <Image
                          src={receiptImage}
                          alt="Uploaded Bank Receipt"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="font-mono text-xs text-[var(--color-accent)] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Receipt Ready: {receiptFileName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-ash)]">
                        Click to change image
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <UploadCloud className="w-8 h-8 text-[var(--color-ash)]" />
                      <div className="font-mono text-xs text-white">
                        Drop receipt screenshot here or click to browse
                      </div>
                      <div className="font-mono text-[10px] text-[var(--color-ash)]">
                        PNG, JPG, PDF up to 10MB
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-signal w-full py-3.5 text-sm uppercase tracking-wider flex items-center justify-center gap-2 font-bold"
              >
                {isSubmitting ? (
                  <span>DISPATCHING ORDER TO AUDIT ENGINE...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>SUBMIT ORDER & UPLOAD RECEIPT</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* TAB 2: WHATSAPP DESK */}
          {paymentTab === 'WHATSAPP' && (
            <div className="card-sharp p-8 space-y-6 bg-[var(--color-onyx)] text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#25D366]/10 border border-[#25D366]/40 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-[#25D366]" />
              </div>

              <div>
                <h3 className="font-serif text-2xl text-white mb-2">Direct WhatsApp Order Clearance</h3>
                <p className="text-xs font-mono text-[var(--color-smoke)] max-w-md mx-auto leading-relaxed">
                  Prefer direct human assistance? Our automated desk connects you with an operator on WhatsApp to process your bank transfer, card payment, or custom configuration.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-carbon)] border border-[var(--color-graphite)] rounded-[2px] font-mono text-xs text-left space-y-1">
                <div className="text-[var(--color-ash)]"># Auto-generated inquiry payload:</div>
                <div className="text-white">Product: {product.title}</div>
                <div className="text-white">Tier: {variant.title}</div>
                <div className="text-[var(--color-accent)]">Total: {formatPrice(finalPrice, currency)}</div>
                <div className="text-[var(--color-ash)]">Ref: {referenceCode}</div>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hello Fibez Operator! I would like to order ${product.title} (${variant.title}) for ${formatPrice(finalPrice, currency)}. Reference: ${referenceCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-signal py-3 px-6 text-xs uppercase tracking-wider inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>OPEN CHAT WITH FIBEZ OPERATOR</span>
              </a>
            </div>
          )}

          {/* TAB 3: CARDS & CRYPTO GATEWAY */}
          {paymentTab === 'CARD' && (
            <div className="card-sharp p-8 space-y-6 bg-[var(--color-onyx)] text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-graphite)] border border-[var(--color-iron)] flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[var(--color-accent)]" />
              </div>

              <div>
                <h3 className="font-serif text-2xl text-white mb-2">Instant Automated Gateway</h3>
                <p className="text-xs font-mono text-[var(--color-smoke)] max-w-md mx-auto leading-relaxed">
                  Support for automated Visa / Mastercard / USDT / BTC payments via automated webhook rails.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-carbon)] border border-[var(--color-graphite)] rounded-[2px] font-mono text-xs text-[var(--color-ash)]">
                [ GATEWAY PIPELINE IN STANDBY // USE BANK TRANSFER OR WHATSAPP FOR IMMEDIATE PROCESSING ]
              </div>

              <button
                type="button"
                onClick={() => setPaymentTab('BANK')}
                className="btn-outlined text-xs py-2 px-4"
              >
                SWITCH TO BANK TRANSFER
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Order Summary & Promo Code (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-sharp p-6 sm:p-8 space-y-6 bg-[var(--color-onyx)] border-[var(--color-graphite)]">
            
            <div className="border-b border-[var(--color-graphite)] pb-4">
              <span className="metadata-stamp text-[10px]">
                [ ORDER INVOICE MANIFEST ]
              </span>
              <h2 className="font-serif text-2xl font-normal text-white mt-1">
                Order Summary
              </h2>
            </div>

            {/* Product Summary Row */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-sans font-medium text-white">{product.title}</div>
                  <div className="text-[10px] text-[var(--color-ash)] mt-0.5">{variant.title}</div>
                </div>
                <div className="text-right font-bold text-white">
                  {formatPrice(basePrice, currency)}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-graphite)] space-y-2 text-[11px] text-[var(--color-smoke)]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(basePrice, currency)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-[var(--color-accent)]">
                    <span>Promo Discount ({discountPercent}%):</span>
                    <span>-{formatPrice(basePrice * (discountPercent / 100), currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Vault Allocation Fee:</span>
                  <span className="text-[var(--color-accent)]">FREE ($0.00)</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Method:</span>
                  <span>Instant Key Vault Reveal</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-[var(--color-graphite)] flex justify-between items-baseline">
                <span className="font-sans text-xs uppercase font-semibold text-white">TOTAL PAYABLE:</span>
                <span className="text-2xl font-bold font-mono text-[var(--color-accent)]">
                  {formatPrice(finalPrice, currency)}
                </span>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2 pt-2 border-t border-[var(--color-graphite)]">
              <label className="text-[10px] font-mono text-[var(--color-ash)] uppercase block">
                HAVE A PROMO TOKEN? (TRY: FIBEZ10)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="PROMO CODE"
                  className="w-full p-2.5 bg-[var(--color-carbon)] border border-[var(--color-graphite)] text-white text-xs font-mono outline-none uppercase rounded-[2px]"
                />
                <button
                  type="submit"
                  className="btn-outlined py-2 px-3 text-xs font-mono"
                >
                  APPLY
                </button>
              </div>
              {promoMessage && (
                <div
                  className={`text-[10px] font-mono mt-1 ${
                    promoMessage.type === 'success'
                      ? 'text-[var(--color-accent)]'
                      : 'text-red-400'
                  }`}
                >
                  {promoMessage.text}
                </div>
              )}
            </form>

            {/* Security Badges */}
            <div className="p-4 bg-[var(--color-carbon)] border border-[var(--color-graphite)] rounded-[2px] space-y-2 text-[10px] font-mono text-[var(--color-ash)]">
              <div className="flex items-center gap-2 text-[var(--color-bone)]">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                <span>100% REPLACEMENT WARRANTY GUARANTEED</span>
              </div>
              <p>
                Upon slip approval, your digital item will immediately be decrypted into your personal Key Vault.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-[var(--color-ash)]">INITIALIZING CHECKOUT TERMINAL...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
