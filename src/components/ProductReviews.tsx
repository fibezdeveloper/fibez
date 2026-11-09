'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, ThumbsUp, MessageSquare, Plus, X, CornerDownRight } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_email: string | null;
  rating: number;
  headline: string;
  comment: string;
  is_verified_purchase: boolean;
  status: string;
  helpful_count: number;
  admin_reply: string | null;
  admin_reply_at: string | null;
  created_at: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  distribution: Record<number, number>;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 5.0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Write Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [headline, setHeadline] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulVoted[reviewId]) return;

    setHelpfulVoted((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r))
    );

    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action: 'helpful' }),
      });
    } catch (err) {
      console.error('Failed to vote helpful:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !headline.trim() || !comment.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userName: userName.trim(),
          userEmail: userEmail.trim() || undefined,
          rating,
          headline: headline.trim(),
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          setHeadline('');
          setComment('');
          fetchReviews();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to post review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => Number(r.rating) === filterRating)
    : reviews;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Summary Breakdown Card */}
      <div className="p-6 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left: Overall Score */}
          <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-[#1f1f23] pb-6 md:pb-0 md:pr-6">
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">
                {stats.averageRating.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[#a1a4a5]">/ 5.0</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-1 mt-2 text-white">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats.averageRating)
                      ? 'fill-white text-white'
                      : 'text-zinc-600'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs font-mono text-[#a1a4a5] mt-2">
              Based on {stats.totalReviews} verified {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Right: Star Distribution Bars */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars] || 0;
              const percentage =
                stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                  className={`w-full flex items-center gap-3 text-xs font-mono transition-opacity cursor-pointer ${
                    filterRating && filterRating !== stars ? 'opacity-40 hover:opacity-75' : 'opacity-100'
                  }`}
                >
                  <span className="w-12 text-left text-zinc-300 flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-white text-white" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[#18181c] overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[#a1a4a5]">{count}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Filter Bar */}
      {filterRating && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#141417] border border-[#1f1f23] text-xs font-mono">
          <span className="text-[#a1a4a5]">
            Showing only <strong>{filterRating}-Star</strong> reviews ({filteredReviews.length})
          </span>
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className="text-white hover:underline cursor-pointer"
          >
            Show All
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] text-center text-xs font-mono text-[#a1a4a5]">
            Loading verified reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-sm text-white font-medium">No reviews yet for this filter</p>
            <p className="text-xs text-[#a1a4a5]">
              Be the first to review this digital configuration!
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write First Review</span>
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] space-y-3"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-white">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-white text-white' : 'text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-300">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-medium text-white mt-1.5">{rev.headline}</h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-[#a1a4a5]">
                    {formatDate(rev.created_at)}
                  </span>
                </div>
              </div>

              {/* Review Comment Body */}
              <p className="text-xs leading-relaxed text-[#a1a4a5]">{rev.comment}</p>

              {/* Admin / Infrastructure Engineer Reply */}
              {rev.admin_reply && (
                <div className="p-3.5 rounded-[12px] bg-[#141417] border border-[#1f1f23] text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <CornerDownRight className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Fibez Infrastructure Response:</span>
                  </div>
                  <p className="text-[#a1a4a5] leading-relaxed pl-5">{rev.admin_reply}</p>
                </div>
              )}

              {/* Footer / Reviewer Name & Helpful Vote */}
              <div className="pt-2 border-t border-[#1f1f23] flex items-center justify-between text-xs font-mono text-[#a1a4a5]">
                <span>By {rev.user_name}</span>

                <button
                  type="button"
                  onClick={() => handleHelpfulClick(rev.id)}
                  disabled={helpfulVoted[rev.id]}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    helpfulVoted[rev.id]
                      ? 'bg-white/10 text-white'
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Helpful ({rev.helpful_count})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f23]">
              <div>
                <h3 className="text-base font-medium text-white">Write a Review</h3>
                <p className="text-xs text-[#a1a4a5]">Share your deployment experience with others</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[#a1a4a5] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-white mx-auto animate-bounce" />
                <h4 className="text-base font-medium text-white">Thank You for Your Review!</h4>
                <p className="text-xs text-[#a1a4a5]">
                  Your review has been verified and published immediately.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-mono">
                {/* Rating Picker */}
                <div>
                  <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1.5">
                    Your Overall Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 text-white hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || rating)
                              ? 'fill-white text-white'
                              : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-white font-bold">{hoverRating || rating} / 5 Stars</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                      Your Name / Handle *
                    </label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Kasun Fernando"
                      className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="kasun@dev.lk"
                      className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Bypassed SLT Fiber throttling seamlessly"
                    className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                    Your Detailed Feedback *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe speed, latency, ease of QR scanning or configuration setup..."
                    className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#141417] hover:bg-[#1a1a1e] border border-white/10 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Post Review ›'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
