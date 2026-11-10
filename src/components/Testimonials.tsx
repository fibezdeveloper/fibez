'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, MessageSquare } from 'lucide-react';

interface LiveReview {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  headline: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<LiveReview[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews.slice(0, 3));
        }
      })
      .catch((err) => console.error('Failed to fetch reviews:', err))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section id="reviews" className="w-full py-24 bg-black border-t border-[#292d30]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Headline */}
        <div className="max-w-2xl mb-12">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
            Verified Customer Feedback
          </div>
          <h2 className="text-[36px] sm:text-[52px] font-normal leading-[1.12] tracking-[-0.04em] text-white">
            Customer reviews.
          </h2>
        </div>

        {loaded && reviews.length === 0 ? (
          <div className="resend-card p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border border-[#292d30] bg-black flex items-center justify-center mx-auto text-zinc-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="text-sm text-zinc-300">
              No verified customer reviews published yet.
            </p>
            <p className="text-xs text-[#a1a4a5]">
              Purchase any product and leave an honest review directly on the product page.
            </p>
            <div className="pt-2">
              <Link href="/catalog" className="btn-ghost-resend text-xs !py-2 !px-4">
                <span>Browse Products</span>
                <span>›</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((item) => (
              <div
                key={item.id}
                className="resend-card p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4 text-white">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-white text-white" />
                    ))}
                  </div>
                  {item.headline && (
                    <div className="text-sm font-medium text-white mb-2">
                      {item.headline}
                    </div>
                  )}
                  <p className="text-[15px] leading-[1.6] text-[#d4d4d8] mb-6 font-normal">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#1f2224]">
                  <div className="w-8 h-8 rounded-full border border-[#292d30] bg-[#141618] flex items-center justify-center font-mono text-xs text-[#f0f0f0] font-medium shrink-0">
                    {(item.user_name || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-white">
                      {item.user_name}
                    </div>
                    <div className="text-[11px] font-mono text-[#a1a4a5]">
                      {item.is_verified_purchase ? 'Verified Purchase' : 'Customer'} · {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
