import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildRlsContext,
  getVerifiedSessionUser,
  RECENT_ORDER_COOKIE_NAME,
  signRecentOrderToken,
} from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

const VALID_PAYMENT_METHODS = new Set(['bank_transfer', 'crypto', 'gateway']);

interface CheckoutItemInput {
  id?: string;
  productId?: string;
  variantTitle?: string;
  quantity?: number;
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
    const fulfillmentStatus = 'MINTED';

    const checkoutResult = await withRlsTransaction(
      buildRlsContext(actor, { checkoutOrderId: orderId }),
      async (client) => {
        // 1. Resolve authoritative product prices from database
        let totalLKR = 0;
        let totalUSD = 0;

        interface ResolvedCartLine {
          productId: string;
          title: string;
          variantTitle: string;
          qty: number;
          unitLkr: number;
          unitUsd: number;
          categoryId: string;
          guideMarkdown: string;
          warrantyTerms: string;
        }

        const resolvedLines: ResolvedCartLine[] = [];

        for (const item of cart) {
          const prodId = String(item.productId || item.id || '').trim();
          const qty = Math.max(1, Math.min(20, Math.round(Number(item.quantity) || 1)));
          if (!prodId) {
            throw new Error('INVALID_PRODUCT');
          }

          const prodRes = await client.query(
            `SELECT id, title, category_id, price_lkr, price_usd, durations, guide_markdown, warranty_terms
             FROM public.products
             WHERE id = $1 AND is_active = TRUE
             LIMIT 1`,
            [prodId]
          );

          if (prodRes.rows.length === 0) {
            throw new Error(`PRODUCT_NOT_FOUND:${prodId}`);
          }

          const prod = prodRes.rows[0];
          const durations = Array.isArray(prod.durations)
            ? (prod.durations as { label?: string; multiplier?: number }[])
            : [];
          const requestedVariant = typeof item.variantTitle === 'string' ? item.variantTitle.trim() : '';
          const matchedDuration = requestedVariant
            ? durations.find((d) => d.label === requestedVariant)
            : durations[0];
          const multiplier = Number(matchedDuration?.multiplier) > 0 ? Number(matchedDuration?.multiplier) : 1;

          const unitLkr = Math.round(Number(prod.price_lkr) * multiplier);
          const unitUsd = Number((Number(prod.price_usd) * multiplier).toFixed(2));

          totalLKR += unitLkr * qty;
          totalUSD += unitUsd * qty;

          resolvedLines.push({
            productId: prod.id,
            title: prod.title,
            variantTitle: matchedDuration?.label || requestedVariant || 'Standard',
            qty,
            unitLkr,
            unitUsd,
            categoryId: prod.category_id || 'giftcard',
            guideMarkdown:
              prod.guide_markdown || 'Delivered to your email and Key Vault upon verification.',
            warrantyTerms: prod.warranty_terms || '24-hour invalid key replacement guarantee',
          });
        }

        // 2. Redeem promo code atomically inside SQL if provided
        let discountLKR = 0;
        let appliedPromoCode: string | null = null;
        if (promoCode) {
          const promoRes = await client.query(
            `SELECT * FROM public.redeem_promo_code($1, $2)`,
            [promoCode, totalLKR]
          );
          if (promoRes.rows.length > 0) {
            const pr = promoRes.rows[0];
            appliedPromoCode = pr.code;
            if (pr.discount_percent > 0) {
              discountLKR = Math.round((totalLKR * pr.discount_percent) / 100);
            } else if (pr.discount_fixed_lkr > 0) {
              discountLKR = pr.discount_fixed_lkr;
            }
          }
        }

        const finalTotalLKR = Math.max(0, totalLKR - discountLKR);
        const finalTotalUSD = Number(
          (totalUSD * (totalLKR > 0 ? finalTotalLKR / totalLKR : 1)).toFixed(2)
        );

        // 3. Insert order
        await client.query(
          `INSERT INTO public.orders (
             id, order_number, user_id, customer_email, customer_whatsapp, customer_name,
             total_amount_lkr, total_amount_usd, currency, payment_method, payment_status,
             fulfillment_status, receipt_image_url, promo_code, discount_amount_lkr
           ) VALUES (
             $1, $2, $3, $4, $5, $6,
             $7, $8, 'LKR', $9, $10,
             $11, $12, $13, $14
           )`,
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

        // 4. Allocate stock & insert order_items atomically
        const mintedItems = [];

        for (let index = 0; index < resolvedLines.length; index++) {
          const line = resolvedLines[index];
          const itemId = `item_${orderNumber.toLowerCase()}_${index + 1}_${crypto.randomUUID().slice(0, 6)}`;

          const allocRes = await client.query(
            `SELECT * FROM public.allocate_order_item_stock($1, $2, $3, $4, $5)`,
            [line.productId, orderId, actor?.id || '', customerEmail, line.qty]
          );
          const alloc = allocRes.rows[0];

          let keyPayload = '';
          let credUser: string | null = null;
          let credPass: string | null = null;
          let keyType = 'SERIAL_KEY';
          let itemStatus = 'DELIVERED';

          if (alloc?.allocated) {
            keyPayload = alloc.key_payload || '';
            credUser = alloc.credential_user || null;
            credPass = alloc.credential_pass || null;
            keyType = alloc.stock_type || 'SERIAL_KEY';
          } else {
            const isVpn =
              line.categoryId === 'vpn' ||
              line.title.toLowerCase().includes('v2ray') ||
              line.title.toLowerCase().includes('vless');
            const isSub = line.categoryId === 'subscription';
            keyType = isVpn ? 'CONNECTION_CONFIG' : isSub ? 'ACCOUNT_CREDENTIALS' : 'SERIAL_KEY';
            itemStatus =
              paymentStatus === 'PENDING_REVIEW' ? 'PENDING_VERIFICATION' : 'PENDING_FULFILLMENT';
            keyPayload = 'Pending staff verification & dispatch to your email and Key Vault.';
          }

          await client.query(
            `INSERT INTO public.order_items (
               id, order_id, product_id, product_title, variant_title, quantity,
               unit_price_lkr, unit_price_usd, subtotal_lkr, subtotal_usd,
               dispensed_key, credential_user, credential_pass, key_type,
               guide_markdown, warranty, status
             ) VALUES (
               $1, $2, $3, $4, $5, $6,
               $7, $8, $9, $10,
               $11, $12, $13, $14,
               $15, $16, $17
             )`,
            [
              itemId,
              orderId,
              line.productId,
              line.title,
              line.variantTitle,
              line.qty,
              line.unitLkr,
              line.unitUsd,
              line.unitLkr * line.qty,
              Number((line.unitUsd * line.qty).toFixed(2)),
              keyPayload,
              credUser,
              credPass,
              keyType,
              line.guideMarkdown,
              line.warrantyTerms,
              itemStatus,
            ]
          );

          mintedItems.push({
            id: itemId,
            productTitle: line.title,
            keyPayload,
            credentialUser: credUser,
            credentialPass: credPass,
            keyType,
          });
        }

        // 5. Audit log
        await client.query(
          `INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details)
           VALUES ($1, $2, $3, 'ORDER_PLACED', 'ORDER', $4, $5::jsonb)`,
          [
            `audit_${orderId}`,
            actor?.id || null,
            customerEmail,
            orderId,
            JSON.stringify({
              orderNumber,
              totalLKR: finalTotalLKR,
              paymentMethod,
              itemsCount: resolvedLines.length,
            }),
          ]
        );

        return {
          finalTotalLKR,
          finalTotalUSD,
          mintedItems,
        };
      }
    );

    const response = NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      totalAmountLKR: checkoutResult.finalTotalLKR,
      totalAmountUSD: checkoutResult.finalTotalUSD,
      paymentMethod,
      items: checkoutResult.mintedItems,
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
    if (message.startsWith('PRODUCT_NOT_FOUND:') || message === 'INVALID_PRODUCT') {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 });
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
