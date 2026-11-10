'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Check, ShoppingCart, ArrowRight, ShieldCheck } from 'lucide-react';
import { ProductItem } from '@/lib/products';
import { useStore } from '@/lib/store-context';
export type { ProductItem };

export default function ProductModal({
  product,
  onClose,
}: {
  product: ProductItem | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { currency, addToCart } = useStore();
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedDurationIndex(0);
      setAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const currentDuration = product.durations[selectedDurationIndex] || product.durations[0] || {
    label: 'Standard',
    days: 30,
    multiplier: 1,
  };
  const priceUSD = (product.priceUSD * currentDuration.multiplier).toFixed(2);
  const priceLKR = Math.round(product.priceLKR * currentDuration.multiplier);
  const formattedPrice = currency === 'USD' ? `$${priceUSD}` : `Rs. ${priceLKR.toLocaleString()}`;

  const handleAddToCart = () => {
    if (product.stockCount <= 0) return;
    addToCart(product, selectedDurationIndex);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (product.stockCount <= 0) return;
    addToCart(product, selectedDurationIndex);
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-[16px] animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-black border border-[#292d30] rounded-[16px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="h-14 px-6 border-b border-[#292d30] flex items-center justify-between shrink-0 bg-black">
          <span className="font-mono text-xs uppercase tracking-wider text-white">
            Select Plan &amp; Checkout
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#a1a4a5] hover:text-white hover:bg-[#1a1c1e] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                {product.brand || product.category}
              </span>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
                product.stockCount > 0
                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-zinc-500 bg-white/5 border-white/10'
              }`}>
                {product.stockCount > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <h3 className="text-xl font-medium text-white">{product.title}</h3>
            <p className="text-xs text-[#a1a4a5] mt-2 leading-relaxed">{product.description}</p>
          </div>

          {product.durations && product.durations.length > 0 && (
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#a1a4a5] mb-2">
                Select Duration / Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                {product.durations.map((dur, idx) => (
                  <button
                    key={dur.label}
                    type="button"
                    onClick={() => setSelectedDurationIndex(idx)}
                    className={`py-2 px-3 rounded-[8px] border text-xs font-mono transition-colors cursor-pointer ${
                      selectedDurationIndex === idx
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-[#0c0c0e] border-[#292d30] text-zinc-300 hover:border-white/30'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Box */}
          <div className="p-4 rounded-[12px] bg-[#0a0a0c] border border-[#292d30] flex items-center justify-between">
            <div>
              <div className="font-mono text-[11px] text-zinc-500 uppercase">Total Price</div>
              <div className="font-mono text-2xl font-bold text-white">{formattedPrice}</div>
              <div className="font-mono text-[11px] text-zinc-500">
                {currency === 'USD' ? `Rs. ${priceLKR.toLocaleString()} LKR` : `$${priceUSD} USD`}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-[#3ad389]" />
              <span>Instant Email Delivery</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              disabled={product.stockCount <= 0}
              onClick={handleBuyNow}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{product.stockCount > 0 ? 'Buy Now & Checkout' : 'Currently Out of Stock'}</span>
              {product.stockCount > 0 && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={product.stockCount <= 0}
                onClick={handleAddToCart}
                className="py-2.5 px-4 rounded-xl bg-[#111114] hover:bg-[#1a1a1f] border border-white/10 text-xs font-mono text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {added ? <Check className="w-3.5 h-3.5 text-[#3ad389]" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                <span>{added ? 'Added!' : 'Add to Cart'}</span>
              </button>

              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-[#111114] hover:bg-[#1a1a1f] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center justify-center"
              >
                Full Details ›
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
