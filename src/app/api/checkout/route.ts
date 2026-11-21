import { rateLimit } from '@/lib/rate-limit';
import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSessionUser, RECENT_ORDER_COOKIE_NAME, signRecentOrderToken } from '@/lib/dal';
import { dbReady, withTransaction } from '@/lib/db/tx';
import { dbRedeemCoupon } from '@/lib/store-db';
import { applyLedger, applyLedgerOnce, InsufficientFundsError, findReferrerByCode, awardReferral, getBalance } from '@/lib/wallet';
import { fulfillOrder, recordFulfilledClients } from '@/lib/fulfillment';
import { adminStore, AdminOrder, AdminOrderItem } from '@/lib/admin-store';
import { analyzeBankReceipt } from '@/lib/receipt-verifier';
import { resolveServerPrice } from '@/lib/pricing';

// 'staff_grant' is internal only: customers can never choose it.
const VALID_PAYMENT_METHODS = new Set(['bank_transfer', 'crypto', 'wallet']);

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

function isAllowedReceiptUrl(value: string): boolean {
  if (value.length > 2500) return false;
  // Dev-only local upload fallback
  if (/^\/uploads\/slips\/[A-Za-z0-9._-]+$/.test(value)) return process.env.NODE_ENV !== 'production';
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    const endpoint = process.env.AWS_ENDPOINT_URL_S3;
    const endpointHost = endpoint ? new URL(endpoint).hostname.toLowerCase() : '';
    return (
      (endpointHost !== '' && (host === endpointHost || host.endsWith(`.${endpointHost}`))) ||
      host.endsWith('.amazonaws.com')
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip')?.trim() ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      'unknown';
    if ((await rateLimit('checkout', ip, 10, 600)).limited) {
      return NextResponse.json(
        { error: 'Too many orders from this connection. Please wait a few minutes.' },
        { status: 429 }
      );
    }

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
    // Renewals are done through /api/v2ray/renew (checked against the panel clients you own).
    // A client-supplied existingUuid would let anyone claim another customer's config.
    const renewOrderId: string | null = null;
    const existingUuid: string | null = null;
    const rawReceiptUrl =
      typeof body.receiptUrl === 'string' && body.receiptUrl.trim() ? body.receiptUrl.trim() : null;
    // The slip URL is later rendered in the admin console (img / iframe), so it must be a link to
    // OUR storage only. Anything else (javascript:, data:, foreign hosts) is rejected.
    if (rawReceiptUrl && !isAllowedReceiptUrl(rawReceiptUrl)) {
      return NextResponse.json({ error: 'Invalid payment slip link. Please re-upload your slip.' }, { status: 400 });
    }
    const receiptUrl = rawReceiptUrl;

    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
    }

    if (cart.length === 0 || cart.length > 50) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    const randomSuffix = String(crypto.randomInt(100000, 999999));
    const orderNumber = `FBZ-${randomSuffix}`;
    const orderId = `ord_${orderNumber.toLowerCase()}_${crypto.randomUUID().slice(0, 8)}`;

    const isWallet = paymentMethod === 'wallet';
    if (isWallet && (!actor || !dbReady())) {
      return NextResponse.json({ error: 'Please sign in to pay with your wallet.' }, { status: 401 });
    }
    // A wallet order is paid the moment the money leaves the wallet; bank orders wait for staff review.
    const paymentStatus = isWallet ? 'VERIFIED' : paymentMethod === 'crypto' || receiptUrl ? 'PENDING_REVIEW' : 'PENDING_PAYMENT';
    const fulfillmentStatus = 'PENDING';

    // Calculate totals and resolve line items
    let rawTotalLKR = 0;
    let rawTotalUSD = 0;
    // Prices, titles, guides and warranty come ONLY from the server catalog. Anything the
    // browser sends for price/title/guide is ignored.
    const resolvedCartLines: {
      id: string;
      productId: string;
      productTitle: string;
      variantTitle: string;
      quantity: number;
      unitPriceLKR: number;
      unitPriceUSD: number;
      subtotalLKR: number;
      subtotalUSD: number;
      guideMarkdown: string;
      warranty: string;
      isV2Ray: boolean;
    }[] = [];

    const packageOverrides = await adminStore.getPackageOverrides();
    for (let idx = 0; idx < cart.length; idx++) {
      const item = cart[idx] || {};
      const prodId = String(item.productId || item.id || '').trim();
      const variantLabel = typeof item.variantTitle === 'string' ? item.variantTitle.trim() : '';
      const priced = resolveServerPrice(prodId, variantLabel);
      if (!priced) {
        return NextResponse.json(
          { error: `Unknown or unavailable product in cart: ${prodId.slice(0, 80) || '(empty)'}` },
          { status: 400 }
        );
      }

      // A package you disabled in the admin Packages tab can no longer be bought.
      if (priced.packageId && packageOverrides[priced.packageId]?.isActive === false) {
        return NextResponse.json(
          { error: 'This package is no longer available. Please remove it from your cart.' },
          { status: 400 }
        );
      }

      const qty = Math.max(1, Math.min(20, Math.round(Number(item.quantity) || 1)));
      const lineLkr = priced.unitPriceLKR * qty;
      const lineUsd = Number((priced.unitPriceUSD * qty).toFixed(2));
      rawTotalLKR += lineLkr;
      rawTotalUSD += lineUsd;

      const catalog = priced.catalogProduct;
      resolvedCartLines.push({
        id: `item_${orderNumber.toLowerCase()}_${idx + 1}_${crypto.randomUUID().slice(0, 6)}`,
        productId: prodId,
        productTitle: priced.generatedTitle || catalog?.title || 'Fibez Digital Product',
        variantTitle: variantLabel.slice(0, 120) || 'Standard',
        quantity: qty,
        unitPriceLKR: priced.unitPriceLKR,
        unitPriceUSD: priced.unitPriceUSD,
        subtotalLKR: lineLkr,
        subtotalUSD: lineUsd,
        guideMarkdown: catalog?.guideMarkdown || 'Delivered to Key Vault upon approval.',
        warranty: catalog?.warranty || '24-hour replacement guarantee',
        isV2Ray: priced.isV2Ray,
      });
    }

    // Handle Discounts: Promo Code, Referral Code, and Credits
    let discountLKR = 0;
    let appliedPromoCode = promoCode;

    // 1. Referral discount (friend gets Rs. 50 off). The referrer is rewarded in their WALLET later,
    //    when the order is approved/delivered. A code cannot be used by its own owner.
    if (referralCode && dbReady()) {
      const referrer = await findReferrerByCode(referralCode);
      if (referrer && referrer.email.toLowerCase() !== customerEmail.toLowerCase()) {
        discountLKR += 50;
      }
    }

    // 2. Promo codes: built-in ones first, then coupons created in the admin Coupons tab (DB).
    if (promoCode) {
      if (promoCode === 'FIBEZ10' || promoCode === 'WELCOME') {
        discountLKR += Math.round(rawTotalLKR * 0.1);
      } else if (promoCode === 'DEV20' || promoCode === 'RESEND') {
        discountLKR += Math.round(rawTotalLKR * 0.2);
      } else if (promoCode === 'FRIEND500') {
        discountLKR += 500;
      } else if (dbReady()) {
        const d = await dbRedeemCoupon(promoCode, rawTotalLKR);
        if (d === null) {
          return NextResponse.json({ error: 'That promo code is invalid, expired or fully used.' }, { status: 400 });
        }
        discountLKR += d;
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
        existingOrders: await adminStore.getOrders(),
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
      keyType: line.isV2Ray ? 'CONNECTION_CONFIG' : 'SERIAL_KEY',
      guideMarkdown: line.guideMarkdown,
      warranty: line.warranty,
      status: 'PENDING',
    }));

    // Record order in Admin Store (always accessible by Admin Console)
    const newAdminOrder: AdminOrder = {
      id: orderId,
      orderNumber,
      userId: actor?.id ?? null,
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

    let walletBalanceAfter: number | null = null;
    let deliveredNow = false;

    if (isWallet && actor) {
      // ONE transaction: take the money and create the order. Either both happen or neither does.
      try {
        const tx = await withTransaction(async (client) => {
          let balanceAfter: number | null = null;
          if (finalTotalLKR > 0) {
            const led = await applyLedger(client, {
              userId: actor.id,
              type: 'PURCHASE',
              amount: -finalTotalLKR,
              refType: 'order',
              refId: orderNumber,
              reason: `Order ${orderNumber}`,
              actorId: actor.id,
              actorEmail: actor.email,
              idem: `purchase:${orderId}`,
            });
            balanceAfter = led.balanceAfter;
          }
          await adminStore.addOrder(newAdminOrder, client);
          return balanceAfter;
        });
        walletBalanceAfter = tx;
      } catch (err) {
        if (err instanceof InsufficientFundsError) {
          return NextResponse.json(
            { error: 'Not enough wallet balance. Top up your wallet or choose bank transfer.', balanceLkr: await getBalance(actor.id), neededLkr: finalTotalLKR },
            { status: 402 }
          );
        }
        throw err;
      }

      // Paid: deliver right now. If delivery fails, give the money back automatically.
      const result = await fulfillOrder(newAdminOrder);
      if (!result.ok) {
        if (finalTotalLKR > 0) {
          const rev = await applyLedgerOnce({
            userId: actor.id,
            type: 'REVERSAL',
            amount: finalTotalLKR,
            refType: 'order',
            refId: orderNumber,
            reason: `Delivery failed for ${orderNumber}: automatic reversal`,
            idem: `reversal:${orderId}`,
          });
          walletBalanceAfter = rev.balanceAfter;
        }
        await adminStore.updateOrderStatus(orderNumber, {
          paymentStatus: 'REFUNDED',
          fulfillmentStatus: 'REVOKED',
          reviewedBy: 'system',
          reviewNotes: `Delivery failed (${result.error}). Wallet reversed automatically.`,
        });
        return NextResponse.json(
          { error: 'We could not deliver this order right now. You were NOT charged: your wallet was restored in full. Please try again shortly.', balanceLkr: walletBalanceAfter },
          { status: result.status === 409 ? 409 : 503 }
        );
      }

      await adminStore.updateOrderStatus(orderNumber, {
        fulfillmentStatus: 'DELIVERED',
        reviewedBy: 'wallet-auto',
        reviewNotes: 'Paid from wallet and delivered automatically.',
        itemKeys: result.itemKeys,
        metadata: { panelClients: result.panelClients },
      });
      await recordFulfilledClients(newAdminOrder, result.panelClients);
      if (referralCode) {
        await awardReferral({ orderNumber, code: referralCode, buyerEmail: customerEmail }).catch((e) =>
          console.error('Referral reward failed (order still delivered):', e)
        );
      }
      deliveredNow = true;
    } else {
      // Bank transfer / crypto: the order waits for staff to verify the payment.
      await adminStore.addOrder(newAdminOrder);
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
      isRenewal: false,
      paid: isWallet,
      deliveredNow,
      balanceLkr: walletBalanceAfter,
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
