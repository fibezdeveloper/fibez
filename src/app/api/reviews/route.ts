import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildRlsContext,
  getVerifiedSessionUser,
  isStaffRole,
  requireRole,
} from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

const VALID_REVIEW_STATUSES = new Set(['APPROVED', 'FLAGGED', 'PENDING']);

export async function GET(req: NextRequest) {
  try {
    const actor = await getVerifiedSessionUser();
    const isStaff = isStaffRole(actor?.role);

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId')?.trim() || '';
    const all = isStaff && searchParams.get('all') === 'true';

    const reviewsList = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      if (productId && !all) {
        const res = await client.query(
          `SELECT id, product_id, user_name, rating, headline, comment,
                  is_verified_purchase, status, helpful_count, admin_reply, admin_reply_at, created_at
           FROM public.reviews
           WHERE product_id = $1 AND status = 'APPROVED'
           ORDER BY created_at DESC`,
          [productId]
        );
        return res.rows;
      }

      if (productId && all) {
        const res = await client.query(
          `SELECT * FROM public.reviews WHERE product_id = $1 ORDER BY created_at DESC`,
          [productId]
        );
        return res.rows;
      }

      if (all) {
        const res = await client.query(
          `SELECT * FROM public.reviews ORDER BY created_at DESC`
        );
        return res.rows;
      }

      const res = await client.query(
        `SELECT id, product_id, user_name, rating, headline, comment,
                is_verified_purchase, status, helpful_count, admin_reply, admin_reply_at, created_at
         FROM public.reviews
         WHERE status = 'APPROVED'
         ORDER BY created_at DESC`
      );
      return res.rows;
    });

    const totalReviews = reviewsList.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviewsList.reduce((acc, r) => acc + Number(r.rating), 0) /
              totalReviews
            ).toFixed(1)
          )
        : 5.0;

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviewsList) {
      const rate = Number(r.rating);
      if (distribution[rate] !== undefined) {
        distribution[rate]++;
      }
    }

    return NextResponse.json({
      reviews: reviewsList,
      stats: {
        totalReviews,
        averageRating,
        distribution,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await getVerifiedSessionUser();

    const body = await req.json().catch(() => ({}));
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    const userName =
      typeof body.userName === 'string' && body.userName.trim()
        ? body.userName.trim().slice(0, 100)
        : actor?.name || '';
    const headline = typeof body.headline === 'string' ? body.headline.trim().slice(0, 160) : '';
    const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : '';
    const rating = Number(body.rating);

    if (!productId || !userName || !rating || !headline || !comment) {
      return NextResponse.json(
        { error: 'Product ID, name, rating, headline, and comment are required' },
        { status: 400 }
      );
    }

    const reviewId = `rev_${crypto.randomUUID()}`;
    const parsedRating = Math.max(1, Math.min(5, Math.round(rating)));
    const reviewerEmail = actor?.email || null;
    const reviewerUserId = actor?.id || null;

    const newReview = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const verifiedRes = await client.query(
        `SELECT public.check_verified_purchase($1, $2, $3) AS verified`,
        [productId, reviewerEmail || '', reviewerUserId || '']
      );
      const isVerifiedPurchase = Boolean(verifiedRes.rows[0]?.verified);

      const res = await client.query(
        `INSERT INTO public.reviews (
           id, product_id, user_id, user_name, user_email, rating,
           headline, comment, is_verified_purchase, status, helpful_count, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'APPROVED', 0, NOW())
         RETURNING id, product_id, user_name, rating, headline, comment,
                   is_verified_purchase, status, helpful_count, admin_reply, admin_reply_at, created_at`,
        [
          reviewId,
          productId,
          reviewerUserId,
          userName,
          reviewerEmail,
          parsedRating,
          headline,
          comment,
          isVerifiedPurchase,
        ]
      );
      return res.rows[0];
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error: unknown) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const reviewId = typeof body.reviewId === 'string' ? body.reviewId.trim() : '';
    const action = typeof body.action === 'string' ? body.action.trim() : '';
    const adminReply = typeof body.adminReply === 'string' ? body.adminReply.trim().slice(0, 2000) : '';
    const status = typeof body.status === 'string' ? body.status.trim().toUpperCase() : '';

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    if (action === 'helpful') {
      const actor = await getVerifiedSessionUser();
      const updated = await withRlsTransaction(buildRlsContext(actor), async (client) => {
        const res = await client.query(
          `SELECT public.increment_review_helpful($1) AS updated`,
          [reviewId]
        );
        return Boolean(res.rows[0]?.updated);
      });

      if (!updated) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    // Staff-only moderation actions (reply / status toggle)
    const authResult = await requireRole(['admin', 'owner']);
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;

    if (action === 'reply' && adminReply) {
      const found = await withRlsTransaction(buildRlsContext(actor), async (client) => {
        const res = await client.query(
          `UPDATE public.reviews
           SET admin_reply = $1, admin_reply_at = NOW()
           WHERE id = $2
           RETURNING id`,
          [adminReply, reviewId]
        );
        return res.rows.length > 0;
      });
      if (!found) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (status) {
      if (!VALID_REVIEW_STATUSES.has(status)) {
        return NextResponse.json({ error: 'Invalid review status' }, { status: 400 });
      }
      const found = await withRlsTransaction(buildRlsContext(actor), async (client) => {
        const res = await client.query(
          `UPDATE public.reviews SET status = $1 WHERE id = $2 RETURNING id`,
          [status, reviewId]
        );
        return res.rows.length > 0;
      });
      if (!found) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
