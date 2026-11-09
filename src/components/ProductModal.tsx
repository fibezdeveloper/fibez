'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, Check, Copy, ArrowRight, ShieldCheck, Zap, Download, 
  Terminal, Server, Key, QrCode as QrIcon, Upload, Clock, AlertCircle, Sparkles 
} from 'lucide-react';
import { ProductItem } from '@/lib/products';
export type { ProductItem };

export default function ProductModal({
  product,
  onClose,
}: {
  product: ProductItem | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'configure' | 'checkout' | 'vault'>('configure');
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('Standard / Shared');
  const [selectedISP, setSelectedISP] = useState<string>('SLT Fiber / Mobitel / Dialog');
  
  // Checkout states
  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'crypto' | 'bank_transfer'>('gateway');
  const [customerEmail, setCustomerEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bankReceiptUploaded, setBankReceiptUploaded] = useState<string | null>(null);

  // Vault / Dispensed payload
  const [dispensedData, setDispensedData] = useState<{
    orderId: string;
    licenseKey?: string;
    credentials?: { user: string; pass: string; ip?: string; port?: string };
    vlessUri?: string;
    qrCodeDataUrl?: string;
    expiresAt: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    // Reset state when a product opens
    if (product) {
      setStep('configure');
      setSelectedDurationIndex(0);
      setDiscountPercent(0);
      setPromoCode('');
      setBankReceiptUploaded(null);
      setDispensedData(null);
    }
  }, [product]);

  if (!product) return null;

  const currentDuration = product.durations[selectedDurationIndex] || product.durations[0];
  const calculatedPriceUSD = (product.priceUSD * currentDuration.multiplier * (1 - discountPercent / 100)).toFixed(2);
  const calculatedPriceLKR = Math.round(product.priceLKR * currentDuration.multiplier * (1 - discountPercent / 100)).toLocaleString();

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'FIBEZ20' || promoCode.trim().toUpperCase() === 'RESEND') {
      setDiscountPercent(20);
    } else {
      alert('Invalid promo code. Try "FIBEZ20" or "RESEND" for 20% off.');
    }
  };

  const handleCompleteOrder = async () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      alert('Please enter a valid developer email for instant receipt and backup dispatch.');
      return;
    }

    setIsProcessing(true);

    // Simulate instant cryptographic zero-trust fulfillment
    setTimeout(async () => {
      const orderId = 'FBZ-ORD-' + Math.floor(100000 + Math.random() * 900000);
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + currentDuration.days);

      let vless = '';
      let qrUrl = '';
      let creds = undefined;
      let license = undefined;

      if (product.category === 'vpn') {
        vless = `vless://98e4d1b8-3a91-4c12-9281-${Math.random().toString(36).substring(2, 8)}@sg-edge.fibez.io:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=gateway.apple.com&fp=chrome#Fibez-SG-${selectedISP.split(' ')[0]}`;
        try {
          qrUrl = await QRCode.toDataURL(vless, {
            color: { dark: '#000000', light: '#ffffff' },
            margin: 1,
            width: 200,
          });
        } catch (e) {
          console.error(e);
        }
      } else if (product.category === 'vps') {
        creds = {
          ip: `138.199.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`,
          user: 'root',
          pass: `fbz_nvme_${Math.random().toString(36).substring(2, 10)}!`,
          port: '22',
        };
      } else if (product.category === 'subscription') {
        creds = {
          user: `${customerEmail.split('@')[0]}_fibez@vault.internal`,
          pass: `Secret_${Math.random().toString(36).substring(2, 8)}#2026`,
        };
      } else {
        license = `FBZ-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-GLOBAL`;
      }

      setDispensedData({
        orderId,
        vlessUri: vless,
        qrCodeDataUrl: qrUrl,
        credentials: creds,
        licenseKey: license,
        expiresAt: expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      });

      setIsProcessing(false);
      setStep('vault');
    }, 800);
  };

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-[16px] animate-in fade-in duration-200">
      
      {/* Modal Container: Resend 16px radius, 1px #292d30 border */}
      <div className="relative w-full max-w-2xl bg-black border border-[#292d30] rounded-[16px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="h-14 px-6 border-b border-[#292d30] flex items-center justify-between shrink-0 bg-black">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-white">
              {step === 'configure' && '1. Configure Asset'}
              {step === 'checkout' && '2. Instant Checkout'}
              {step === 'vault' && '3. Secure Key Vault'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#a1a4a5] hover:text-white hover:bg-[#1a1c1e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Product Title Bar */}
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#3ad389] mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3ad389]" />
                <span>{product.stockCount} Keys Available in Vault</span>
              </div>
              <h3 className="text-2xl font-normal tracking-[-0.03em] text-white">
                {product.title}
              </h3>
              <p className="text-sm text-[#a1a4a5] mt-1">
                {product.description}
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-normal text-white">
                ${calculatedPriceUSD}
              </div>
              <div className="font-mono text-xs text-[#a1a4a5]">
                LKR {calculatedPriceLKR}
              </div>
            </div>
          </div>

          {/* STEP 1: CONFIGURE */}
          {step === 'configure' && (
            <div className="space-y-6 pt-2">
              
              {/* Duration selector */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                  Select License Duration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {product.durations.map((duration, idx) => (
                    <button
                      key={duration.label}
                      onClick={() => setSelectedDurationIndex(idx)}
                      className={`p-3 rounded-[6px] border text-left font-mono transition-colors ${
                        selectedDurationIndex === idx
                          ? 'border-white bg-[#141618] text-white'
                          : 'border-[#292d30] text-[#a1a4a5] hover:text-white hover:border-[#464a4d]'
                      }`}
                    >
                      <div className="text-sm font-medium">{duration.label}</div>
                      <div className="text-xs text-[#6e727a] mt-0.5">{duration.days} Days</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category specific options */}
              {product.category === 'vpn' && (
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                    ISP Optimization Profile
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['SLT Fiber / Mobitel (Low Ping)', 'Dialog Axiata 4G/5G', 'Global Multi-Homed BGP'].map((isp) => (
                      <button
                        key={isp}
                        onClick={() => setSelectedISP(isp)}
                        className={`p-2.5 rounded-[6px] border text-left font-mono text-xs transition-colors ${
                          selectedISP === isp
                            ? 'border-white bg-[#141618] text-white'
                            : 'border-[#292d30] text-[#a1a4a5] hover:text-white hover:border-[#464a4d]'
                        }`}
                      >
                        {isp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.category === 'subscription' && (
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                    Account Access Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Shared Profile (Economy)', 'Private Email Invite (Dedicated)'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedOption(opt)}
                        className={`p-3 rounded-[6px] border text-left font-mono text-xs transition-colors ${
                          selectedOption === opt
                            ? 'border-white bg-[#141618] text-white'
                            : 'border-[#292d30] text-[#a1a4a5] hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Warranty & Guarantee Details */}
              <div className="p-3.5 rounded-[6px] border border-[#292d30] bg-[#050505] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#3ad389] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-[#a1a4a5]">
                  <span className="text-white font-medium block">Fibez Zero-Trust Warranty Guard</span>
                  {product.warranty}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setStep('checkout')}
                  className="btn-action-resend w-full sm:w-auto"
                >
                  <span>Proceed to instant checkout</span>
                  <span>›</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: CHECKOUT */}
          {step === 'checkout' && (
            <div className="space-y-6 pt-2">
              
              {/* Email Address Input */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                  Delivery Email Address (for key backup &amp; receipt)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full px-3.5 py-2.5 rounded-[6px] bg-[#050505] border border-[#292d30] text-sm text-white placeholder-[#6e727a] focus:outline-none focus:border-white font-mono"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('gateway')}
                    className={`p-3 rounded-[6px] border font-mono text-xs text-left transition-colors ${
                      paymentMethod === 'gateway'
                        ? 'border-white bg-[#141618] text-white'
                        : 'border-[#292d30] text-[#a1a4a5] hover:text-white'
                    }`}
                  >
                    <div className="font-medium text-white">Instant Online</div>
                    <div className="text-[10px] text-[#6e727a] mt-0.5">Card / Visa / MC</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-3 rounded-[6px] border font-mono text-xs text-left transition-colors ${
                      paymentMethod === 'crypto'
                        ? 'border-white bg-[#141618] text-white'
                        : 'border-[#292d30] text-[#a1a4a5] hover:text-white'
                    }`}
                  >
                    <div className="font-medium text-white">Crypto (USDT)</div>
                    <div className="text-[10px] text-[#6e727a] mt-0.5">TRC20 / TON / SOL</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3 rounded-[6px] border font-mono text-xs text-left transition-colors ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-white bg-[#141618] text-white'
                        : 'border-[#292d30] text-[#a1a4a5] hover:text-white'
                    }`}
                  >
                    <div className="font-medium text-white">Bank Transfer</div>
                    <div className="text-[10px] text-[#6e727a] mt-0.5">Commercial / HNB / Sampath</div>
                  </button>
                </div>
              </div>

              {/* Bank Transfer Details & Receipt Upload */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 rounded-[6px] border border-[#292d30] bg-[#050505] space-y-3 font-mono text-xs">
                  <div className="text-[#3ad389] font-medium">Bank Details (Instant Slip Verification):</div>
                  <div className="space-y-1 text-[#f0f0f0]">
                    <div>Bank: Commercial Bank of Ceylon</div>
                    <div>Account Name: FIBEZ DIGITAL LTD</div>
                    <div>Account Number: 8010294821</div>
                    <div>Branch: Colombo Super Branch (012)</div>
                  </div>

                  <div className="pt-2 border-t border-[#1f2224]">
                    <label className="block text-[#a1a4a5] mb-1.5">
                      Upload Payment Slip / Screenshot:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBankReceiptUploaded(file.name);
                        }
                      }}
                      className="block w-full text-xs text-[#a1a4a5] file:mr-3 file:py-1 file:px-2.5 file:rounded-[6px] file:border file:border-[#292d30] file:bg-[#1a1c1e] file:text-white file:text-xs cursor-pointer"
                    />
                    {bankReceiptUploaded && (
                      <div className="text-[#3ad389] text-[11px] mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Receipt attached: {bankReceiptUploaded}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Promo Code Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo Code (e.g. FIBEZ20)"
                  className="flex-1 px-3 py-2 rounded-[6px] bg-[#050505] border border-[#292d30] text-xs text-white placeholder-[#6e727a] font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="btn-ghost-resend !py-1 !px-3 !text-xs text-white"
                >
                  Apply
                </button>
              </div>

              {discountPercent > 0 && (
                <div className="text-xs font-mono text-[#3ad389] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Promo applied: {discountPercent}% discount active!</span>
                </div>
              )}

              {/* Checkout Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setStep('configure')}
                  className="btn-ghost-resend text-xs text-[#a1a4a5]"
                >
                  ‹ Back
                </button>

                <button
                  onClick={handleCompleteOrder}
                  disabled={isProcessing}
                  className="btn-action-resend"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>Dispensing zero-trust key...</span>
                    </span>
                  ) : (
                    <span>Confirm &amp; Instant Dispense (${calculatedPriceUSD}) ›</span>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: KEY VAULT DISPENSED */}
          {step === 'vault' && dispensedData && (
            <div className="space-y-6 pt-1">
              
              <div className="p-4 rounded-[6px] border border-white/20 bg-[#050505] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-white font-medium">
                      Asset Dispensed Successfully
                    </div>
                    <div className="font-mono text-xs text-[#6e727a]">
                      Ref: {dispensedData.orderId} · Valid through {dispensedData.expiresAt}
                    </div>
                  </div>
                </div>

                <span className="font-mono text-xs px-2.5 py-1 rounded-[6px] bg-[#1a1c1e] text-zinc-300 border border-[#292d30]">
                  DELIVERED &lt; 380ms
                </span>
              </div>

              {/* V2Ray QR & VLESS Dispensed Preview */}
              {product.category === 'vpn' && (
                <div className="space-y-4">
                  {dispensedData.qrCodeDataUrl && (
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-[6px] border border-[#292d30] bg-[#050505]">
                      <div className="p-2 bg-white rounded-[6px] shrink-0">
                        <img
                          src={dispensedData.qrCodeDataUrl}
                          alt="V2Ray QR Code"
                          className="w-36 h-36"
                        />
                      </div>
                      <div className="space-y-2 text-left">
                        <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
                          Mobile Quick Scan
                        </div>
                        <p className="text-xs text-[#a1a4a5] leading-relaxed">
                          Scan directly with <strong>v2rayNG</strong> (Android), <strong>Shadowrocket / Streisand</strong> (iOS), or import clipboard in <strong>v2rayN / Sing-box</strong> (Windows/Mac).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* VLESS URI String */}
                  <div className="p-3.5 rounded-[6px] border border-[#292d30] bg-[#050505]">
                    <div className="flex items-center justify-between mb-1.5 font-mono text-[11px] text-[#a1a4a5]">
                      <span>VLESS Reality URI</span>
                      <button
                        onClick={() => handleCopyPayload(dispensedData.vlessUri || '')}
                        className="text-white hover:underline flex items-center gap-1"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? 'Copied' : 'Copy URI'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-zinc-300 break-all p-2 rounded bg-black border border-[#1f2224]">
                      {dispensedData.vlessUri}
                    </div>
                  </div>
                </div>
              )}

              {/* Cloud VPS SSH Credentials Preview */}
              {product.category === 'vps' && dispensedData.credentials && (
                <div className="p-4 rounded-[6px] border border-[#292d30] bg-[#050505] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a4a5]">SSH Root Login</span>
                    <button
                      onClick={() => handleCopyPayload(`ssh root@${dispensedData.credentials?.ip}`)}
                      className="text-white hover:underline flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey ? 'Copied' : 'Copy SSH Command'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded bg-black border border-[#1f2224] space-y-1.5 text-white">
                    <div><span className="text-[#6e727a]">Host IP:</span> {dispensedData.credentials.ip}</div>
                    <div><span className="text-[#6e727a]">Port:</span> 22</div>
                    <div><span className="text-[#6e727a]">Username:</span> {dispensedData.credentials.user}</div>
                    <div><span className="text-[#6e727a]">Password:</span> <span className="text-zinc-300">{dispensedData.credentials.pass}</span></div>
                  </div>
                </div>
              )}

              {/* Premium Subscriptions Credentials Preview */}
              {product.category === 'subscription' && dispensedData.credentials && (
                <div className="p-4 rounded-[6px] border border-[#292d30] bg-[#050505] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a4a5]">Login Credentials</span>
                    <button
                      onClick={() => handleCopyPayload(`User: ${dispensedData.credentials?.user}\nPass: ${dispensedData.credentials?.pass}`)}
                      className="text-white hover:underline flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey ? 'Copied' : 'Copy All'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded bg-black border border-[#1f2224] space-y-1.5 text-white">
                    <div><span className="text-[#6e727a]">Email / User:</span> {dispensedData.credentials.user}</div>
                    <div><span className="text-[#6e727a]">Password:</span> <span className="text-zinc-300">{dispensedData.credentials.pass}</span></div>
                  </div>
                </div>
              )}

              {/* Game Key Preview */}
              {product.category === 'gaming' && dispensedData.licenseKey && (
                <div className="p-4 rounded-[6px] border border-[#292d30] bg-[#050505] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a4a5]">Retail Activation Key</span>
                    <button
                      onClick={() => handleCopyPayload(dispensedData.licenseKey || '')}
                      className="text-white hover:underline flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded bg-black border border-[#1f2224] text-center">
                    <span className="text-base text-white font-bold tracking-widest">
                      {dispensedData.licenseKey}
                    </span>
                  </div>
                </div>
              )}

              {/* Close Vault */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="btn-action-resend"
                >
                  Close &amp; Return to Marketplace
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
