import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  const connectionString = process.env.DATABASE_URL || '';
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(connectionString);
}

export async function GET(req: NextRequest) {
  try {
    const sql = getSql();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const all = searchParams.get('all') === 'true'; // for admin/owner moderation

    let reviewsList;

    if (productId && !all) {
      reviewsList = await sql`
        SELECT * FROM public.reviews
        WHERE product_id = ${productId} AND status = 'APPROVED'
        ORDER BY created_at DESC
      `;
    } else if (productId && all) {
      reviewsList = await sql`
        SELECT * FROM public.reviews
        WHERE product_id = ${productId}
        ORDER BY created_at DESC
      `;
    } else if (all) {
      reviewsList = await sql`
        SELECT * FROM public.reviews
        ORDER BY created_at DESC
      `;
    } else {
      reviewsList = await sql`
        SELECT * FROM public.reviews
        WHERE status = 'APPROVED'
        ORDER BY created_at DESC
      `;
    }

    // Calculate aggregated stats if for a product or overall
    const totalReviews = reviewsList.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviewsList.reduce((acc: number, r: any) => acc + Number(r.rating), 0) /
              totalReviews
            ).toFixed(1)
          )
        : 5.0;

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r: any) => {
      const rate = Number(r.rating);
      if (distribution[rate] !== undefined) {
        distribution[rate]++;
      }
    });

    return NextResponse.json({
      reviews: reviewsList,
      stats: {
        totalReviews,
        averageRating,
        distribution,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getSql();
    const body = await req.json();
    const { productId, userName, userEmail, rating, headline, comment, isVerifiedPurchase } = body;

    if (!productId || !userName || !rating || !headline || !comment) {
      return NextResponse.json(
        { error: 'Product ID, name, rating, headline, and comment are required' },
        { status: 400 }
      );
    }

    const reviewId = 'rev-' + Math.random().toString(36).substring(2, 10);
    const parsedRating = Math.max(1, Math.min(5, Math.round(Number(rating))));

    const newReview = await sql`
      INSERT INTO public.reviews (
        id, product_id, user_name, user_email, rating,
        headline, comment, is_verified_purchase, status, helpful_count, created_at
      ) VALUES (
        ${reviewId}, ${productId}, ${userName}, ${userEmail || null},
        ${parsedRating}, ${headline}, ${comment},
        ${isVerifiedPurchase !== false}, 'APPROVED', 0, NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, review: newReview[0] });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sql = getSql();
    const body = await req.json();
    const { reviewId, action, adminReply, status } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    if (action === 'helpful') {
      await sql`
        UPDATE public.reviews
        SET helpful_count = helpful_count + 1
        WHERE id = ${reviewId}
      `;
      return NextResponse.json({ success: true });
    }

    if (action === 'reply' && adminReply) {
      await sql`
        UPDATE public.reviews
        SET admin_reply = ${adminReply}, admin_reply_at = NOW()
        WHERE id = ${reviewId}
      `;
      return NextResponse.json({ success: true });
    }

    if (status) {
      await sql`
        UPDATE public.reviews
        SET status = ${status}
        WHERE id = ${reviewId}
      `;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: error.message || 'Failed to update review' }, { status: 500 });
  }
}
