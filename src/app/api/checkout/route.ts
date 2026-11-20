import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildRlsContext,
  getVerifiedSessionUser,
  RECENT_ORDER_COOKIE_NAME,
  signRecentOrderToken,
} from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';
import { adminStore, AdminOrder, AdminOrderItem } from '@/lib/admin-store';
import { analyzeBankReceipt } from '@/lib/receipt-verifier';
import { validateReferralCode, redeemUserCredits } from '@/lib/referrals';
import { PRODUCTS } from '@/lib/products';

const VALID_PAYMENT_METHODS = new Set(['bank_transfer', 'crypto', 'gateway', 'staff_grant']);

interface CheckoutItemInput {
  id?: string;
  productId?: string;
  title?: string;
  variantTitle?: string;
  priceLKR?: number;
  priceUSD?: number;
  quantity?: number;
  category?: string;
  guideMarkdown?: string;
  warranty?: string;
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getVerifiedSessionUser();

    const body = await request.json().catch(() => ({}));
    const cart: CheckoutItemInput[] = Array.isArray(body.cart) ? body.cart : [];
    const paymentMethod =
      typeof body.paymentMethod === 'string' && VALID_PAYMENT_METHODS.has(body.paymentMethod)
        ? body.paymentMethod
        : 'bank_transfer';
    const rawEmail = typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
    const customerEmail = actor ? actor.email : rawEmail;
    const customerName =
      actor?.name ||
      (typeof body.customerName === 'string' && body.customerName.trim()
        ? body.customerName.trim().slice(0, 120)
        : customerEmail.split('@')[0]);
    const customerWhatsapp =
      typeof body.customerWhatsapp === 'string' && body.customerWhatsapp.trim()
        ? body.customerWhatsapp.trim().slice(0, 40)
        : null;
    const promoCode =
      typeof body.promoCode === 'string' && body.promoCode.trim()
        ? body.promoCode.trim().toUpperCase()
        : null;
    const referralCode =
      typeof body.referralCode === 'string' && body.referralCode.trim()
        ? body.referralCode.trim().toUpperCase()
        : null;
    const renewOrderId =
      typeof body.renewOrderId === 'string' && body.renewOrderId.trim()
        ? body.renewOrderId.trim()
        : null;
    const existingUuid =
      typeof body.existingUuid === 'string' && body.existingUuid.trim()
        ? body.existingUuid.trim()
        : null;
    const creditsRedeemed =
      typeof body.creditsRedeemed === 'number' && body.creditsRedeemed > 0
        ? Math.floor(body.creditsRedeemed)
        : 0;
    const receiptUrl =
      typeof body.receiptUrl === 'string' && body.receiptUrl.trim() ? body.receiptUrl.trim() : null;

    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
    }

    if (cart.length === 0 || cart.length > 50) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    const randomSuffix = String(crypto.randomInt(100000, 999999));
    const orderNumber = `FBZ-${randomSuffix}`;
    const orderId = `ord_${orderNumber.toLowerCase()}_${crypto.randomUUID().slice(0, 8)}`;

    const paymentStatus =
      paymentMethod === 'crypto' || receiptUrl ? 'PENDING_REVIEW' : 'PENDING_PAYMENT';
    const fulfillmentStatus = 'PENDING';

    // Calculate totals and resolve line items
    let rawTotalLKR = 0;
    let rawTotalUSD = 0;
    const resolvedCartLines = cart.map((item, idx) => {
      const prodId = String(item.productId || item.id || '').trim();
      const productCatalog = PRODUCTS.find((p) => p.id === prodId);
      const qty = Math.max(1, Math.min(20, Math.round(Number(item.quantity) || 1)));
      const unitLkr = Number(item.priceLKR) || Number(productCatalog?.priceLKR) || 450;
      const unitUsd = Number(item.priceUSD) || Number(productCatalog?.priceUSD) || 1.5;
      const lineLkr = unitLkr * qty;
      const lineUsd = Number((unitUsd * qty).toFixed(2));

      rawTotalLKR += lineLkr;
      rawTotalUSD += lineUsd;

      return {
        id: `item_${orderNumber.toLowerCase()}_${idx + 1}_${crypto.randomUUID().slice(0, 6)}`,
        productId: prodId || 'v2ray-dialog-zoom',
        productTitle: item.title || productCatalog?.title || 'Fibez Digital Product',
        variantTitle: item.variantTitle || 'Standard Quota',
        quantity: qty,
        unitPriceLKR: unitLkr,
        unitPriceUSD: unitUsd,
        subtotalLKR: lineLkr,
        subtotalUSD: lineUsd,
        guideMarkdown: item.guideMarkdown || productCatalog?.guideMarkdown || 'Delivered to Key Vault upon approval.',
        warranty: item.warranty || productCatalog?.warranty || '24-hour replacement guarantee',
      };
    });

    // Handle Discounts: Promo Code, Referral Code, and Credits
    let discountLKR = 0;
    let appliedPromoCode = promoCode;

    // 1. Referral discount check
    if (referralCode) {
      const refCheck = validateReferralCode(referralCode);
      if (refCheck.valid) {
        discountLKR += refCheck.discountLKR; // e.g. Rs. 50 off
      }
    }

    // 2. Promo Code check (FIBEZ10 = 10%, DEV20 = 20%, etc.)
    if (promoCode) {
      if (promoCode === 'FIBEZ10' || promoCode === 'WELCOME') {
        discountLKR += Math.round(rawTotalLKR * 0.1);
      } else if (promoCode === 'DEV20' || promoCode === 'RESEND') {
        discountLKR += Math.round(rawTotalLKR * 0.2);
      } else if (promoCode === 'FRIEND500') {
        discountLKR += 500;
      }
    }

    // 3. Store Credits redeemed (1 credit = 10 LKR)
    let creditsDiscountLKR = 0;
    if (creditsRedeemed > 0) {
      const redeemResult = redeemUserCredits(customerEmail, creditsRedeemed);
      if (redeemResult.success) {
        creditsDiscountLKR = redeemResult.discountLKR;
        discountLKR += creditsDiscountLKR;
      }
    }

    const finalTotalLKR = Math.max(0, rawTotalLKR - discountLKR);
    const finalTotalUSD = Number((rawTotalUSD * (rawTotalLKR > 0 ? finalTotalLKR / rawTotalLKR : 1)).toFixed(2));

    // Intelligent Bank Receipt Analysis if slip is provided
    let receiptAnalysis = null;
    let detectedBankName = null;
    if (receiptUrl) {
      receiptAnalysis = analyzeBankReceipt({
        receiptUrl,
        orderTotalLKR: finalTotalLKR,
        currentOrderId: orderId,
      });
      if (receiptAnalysis?.bankName) {
        detectedBankName = receiptAnalysis.bankName;
      }
    }

    // Create AdminOrder items
    const adminOrderItems: AdminOrderItem[] = resolvedCartLines.map((line) => ({
      id: line.id,
      orderId,
      productId: line.productId,
      productTitle: line.productTitle,
      variantTitle: line.variantTitle,
      quantity: line.quantity,
      unitPriceLKR: line.unitPriceLKR,
      subtotalLKR: line.subtotalLKR,
      dispensedKey: null,
      keyType: line.productId.startsWith('v2ray') ? 'CONNECTION_CONFIG' : 'SERIAL_KEY',
      guideMarkdown: line.guideMarkdown,
      warranty: line.warranty,
      status: 'PENDING',
    }));

    // Record order in Admin Store (always accessible by Admin Console)
    const newAdminOrder: AdminOrder = {
      id: orderId,
      orderNumber,
      customerName,
      customerEmail,
      customerWhatsapp,
      totalAmountLKR: finalTotalLKR,
      totalAmountUSD: finalTotalUSD,
      currency: 'LKR',
      paymentMethod,
      paymentStatus,
      fulfillmentStatus: 'PENDING',
      receiptImageUrl: receiptUrl,
      receiptUploadedAt: receiptUrl ? new Date().toISOString() : null,
      bankName: detectedBankName || (paymentMethod === 'bank_transfer' ? 'Commercial Bank of Ceylon' : null),
      promoCode: appliedPromoCode || (referralCode ? `REF:${referralCode}` : null),
      renewOrderId,
      existingUuid,
      referralCode,
      receiptAnalysis,
      reviewNotes: renewOrderId ? `RENEW: Extended from previous Order ${renewOrderId}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: adminOrderItems,
    };

    adminStore.addOrder(newAdminOrder);

    // Also attempt PostgreSQL RLS persistence if database is available
    try {
      await withRlsTransaction(
        buildRlsContext(actor, { checkoutOrderId: orderId }),
        async (client) => {
          await client.query(
            `INSERT INTO public.orders (
               id, order_number, user_id, customer_email, customer_whatsapp, customer_name,
               total_amount_lkr, total_amount_usd, currency, payment_method, payment_status,
               fulfillment_status, receipt_image_url, promo_code, discount_amount_lkr
             ) VALUES (
               $1, $2, $3, $4, $5, $6,
               $7, $8, 'LKR', $9, $10,
               $11, $12, $13, $14
             ) ON CONFLICT (id) DO NOTHING`,
            [
              orderId,
              orderNumber,
              actor?.id || null,
              customerEmail,
              customerWhatsapp,
              customerName,
              finalTotalLKR,
              finalTotalUSD,
              paymentMethod,
              paymentStatus,
              fulfillmentStatus,
              receiptUrl,
              appliedPromoCode,
              discountLKR,
            ]
          );

          for (const line of resolvedCartLines) {
            await client.query(
              `INSERT INTO public.order_items (
                 id, order_id, product_id, product_title, variant_title, quantity,
                 unit_price_lkr, unit_price_usd, subtotal_lkr, subtotal_usd,
                 dispensed_key, key_type, guide_markdown, warranty, status
               ) VALUES (
                 $1, $2, $3, $4, $5, $6,
                 $7, $8, $9, $10,
                 $11, $12, $13, $14, $15
               ) ON CONFLICT (id) DO NOTHING`,
              [
                line.id,
                orderId,
                line.productId,
                line.productTitle,
                line.variantTitle,
                line.quantity,
                line.unitPriceLKR,
                line.unitPriceUSD,
                line.subtotalLKR,
                line.subtotalUSD,
                null,
                line.productId.startsWith('v2ray') ? 'CONNECTION_CONFIG' : 'SERIAL_KEY',
                line.guideMarkdown,
                line.warranty,
                'PENDING_VERIFICATION',
              ]
            );
          }
        }
      );
    } catch (dbErr: any) {
      console.warn('Postgres checkout persistence skipped (running in local mode):', dbErr.message);
    }

    const response = NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      totalAmountLKR: finalTotalLKR,
      totalAmountUSD: finalTotalUSD,
      paymentMethod,
      items: adminOrderItems,
      receiptAnalysis,
      isRenewal: Boolean(renewOrderId),
    });

    response.cookies.set(RECENT_ORDER_COOKIE_NAME, signRecentOrderToken(orderNumber, customerEmail), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 2 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    console.error('Checkout error:', error);
    return NextResponse.json({ error: message || 'Checkout failed' }, { status: 500 });
  }
}
