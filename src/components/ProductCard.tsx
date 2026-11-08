'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice } from '@/lib/currency';
import { Zap, Check, ArrowRight, Shield, Layers } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { currency } = useCurrency();

  // Find lowest price variant
  const minPrice = product.variants.reduce((min, v) => {
    const price = currency === 'LKR' ? v.priceLKR : v.priceUSD;
    return price < min ? price : min;
  }, currency === 'LKR' ? product.variants[0].priceLKR : product.variants[0].priceUSD);

  // Total stock across all variants
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockCount, 0);
  const isAvailable = totalStock > 0;

  return (
    <div className="card-sharp flex flex-col justify-between p-6 sm:p-8 relative group hover:border-[var(--color-slate)] transition-all">
      
      {/* Top Metadata Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="metadata-stamp text-[10px]">
            [ {product.categoryLabel.toUpperCase()} // ATOMIC DISPENSE ]
          </span>
          {product.instantDelivery && (
            <span className="pill-instant font-mono">
              <Zap className="w-3 h-3 text-[var(--color-accent)]" />
              <span>INSTANT</span>
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-white mb-2 group-hover:text-[var(--color-accent)] transition-colors">
          <Link href={`/product/${product.slug}`}>
            {product.title}
          </Link>
        </h3>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-[var(--color-smoke)] leading-relaxed mb-6">
          {product.tagline}
        </p>

        {/* Bullet Features (2-3 items) */}
        <ul className="space-y-2 mb-8 font-mono text-xs text-[var(--color-bone)]/90">
          {product.features.slice(0, 3).map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] text-xs font-bold select-none">•</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card Bottom Meta & Purchase Trigger */}
      <div className="pt-6 border-t border-[var(--color-graphite)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Price & Stock Status */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-mono uppercase text-[var(--color-ash)]">FROM</span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-white">
              {formatPrice(minPrice, currency)}
            </span>
          </div>
          <div className="mt-1">
            {isAvailable ? (
              <span className="pill-in-stock font-mono">
                <Check className="w-3 h-3 text-[var(--color-accent)]" />
                <span>IN STOCK ({totalStock})</span>
              </span>
            ) : (
              <span className="pill-out-stock font-mono">
                <span>OUT OF STOCK</span>
              </span>
            )}
          </div>
        </div>

        {/* View / Configure Trigger */}
        <Link
          href={`/product/${product.slug}`}
          className="btn-signal text-xs py-2.5 px-4 flex items-center justify-center gap-1.5 font-semibold group-hover:shadow-[0_0_14px_rgba(197,255,74,0.5)]"
        >
          <span>CONFIGURE</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>

      </div>
    </div>
  );
}
