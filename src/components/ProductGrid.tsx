'use client';

import React from 'react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { PackageX } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedCategory: string;
  searchQuery: string;
}

export default function ProductGrid({
  products,
  selectedCategory,
  searchQuery,
}: ProductGridProps) {
  // Filter products by category and query
  const filtered = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <section id="catalog" className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
      
      {/* Section Eyebrow */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-graphite)]">
        <div>
          <span className="metadata-stamp">
            [ CATALOG MATRIX // REAL-TIME DISPATCH READY ]
          </span>
          <h2 className="font-serif text-3xl font-normal text-white mt-1">
            Available Inventory
          </h2>
        </div>
        <div className="font-mono text-xs text-[var(--color-ash)]">
          SHOWING {filtered.length} OF {products.length} PACKAGES
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="card-sharp p-12 text-center flex flex-col items-center justify-center my-8">
          <PackageX className="w-12 h-12 text-[var(--color-ash)] mb-4" />
          <h3 className="font-serif text-2xl text-white mb-2">No clearance entries found</h3>
          <p className="text-sm text-[var(--color-smoke)] max-w-md font-mono mb-6">
            Query &ldquo;{searchQuery}&rdquo; returned zero active inventory slots in category &ldquo;{selectedCategory}&rdquo;.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-outlined text-xs py-2 px-4"
          >
            RESET CATALOG FILTERS
          </button>
        </div>
      )}

    </section>
  );
}
