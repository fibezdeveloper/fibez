import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const {
      cart,
      paymentMethod = 'bank_transfer',
      customerEmail,
      customerName,
      customerWhatsapp,
      promoCode,
      receiptUrl,
      userId,
    } = body;

    if (!customerEmail || !cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart items and customer email are required' }, { status: 400 });
    }

    // 1. Calculate totals
    let totalLKR = 0;
    let totalUSD = 0;

    for (const item of cart) {
      const priceLkr = Number(item.priceLKR) || 0;
      const priceUsd = Number(item.priceUSD) || 0;
      const qty = Number(item.quantity) || 1;
      totalLKR += priceLkr * qty;
      totalUSD += priceUsd * qty;
    }

    // 2. Apply promo discount if provided
    let discountLKR = 0;
    if (promoCode) {
      const codeUpper = promoCode.trim().toUpperCase();
      const promoRows = await sql`
        SELECT * FROM promo_codes 
        WHERE UPPER(code) = ${codeUpper} AND is_active = TRUE
        LIMIT 1
      `;
      if (promoRows.length > 0) {
        const pr = promoRows[0];
        if (pr.discount_percent > 0) {
          discountLKR = Math.round((totalLKR * pr.discount_percent) / 100);
        } else if (pr.discount_fixed_lkr > 0) {
          discountLKR = pr.discount_fixed_lkr;
        }
        // Increment usage
        await sql`UPDATE promo_codes SET times_used = times_used + 1 WHERE id = ${pr.id}`;
      }
    }

    const finalTotalLKR = Math.max(0, totalLKR - discountLKR);
    const finalTotalUSD = Number((totalUSD * (1 - (totalLKR > 0 ? discountLKR / totalLKR : 0))).toFixed(2));

    // 3. Generate Order ID and Order Number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `FBZ-${randomSuffix}`;
    const orderId = `ord_${orderNumber.toLowerCase()}_${Date.now().toString(36)}`;

    const paymentStatus = paymentMethod === 'crypto' || receiptUrl ? 'PENDING_REVIEW' : 'PENDING_PAYMENT';
    const fulfillmentStatus = 'MINTED';

    // 4. Insert into orders table
    await sql`
      INSERT INTO orders (
        id, order_number, user_id, customer_email, customer_whatsapp, customer_name,
        total_amount_lkr, total_amount_usd, currency, payment_method, payment_status,
        fulfillment_status, receipt_image_url, promo_code, discount_amount_lkr
      ) VALUES (
        ${orderId}, ${orderNumber}, ${userId || null}, ${customerEmail}, ${customerWhatsapp || null},
        ${customerName || customerEmail.split('@')[0]}, ${finalTotalLKR}, ${finalTotalUSD},
        'LKR', ${paymentMethod}, ${paymentStatus}, ${fulfillmentStatus}, ${receiptUrl || null},
        ${promoCode || null}, ${discountLKR}
      )
    `;

    // 5. Mint / Allocate Keys and insert into order_items
    const mintedItems = [];

    for (let index = 0; index < cart.length; index++) {
      const item = cart[index];
      const itemId = `item_${orderNumber.toLowerCase()}_${index + 1}`;
      const qty = Number(item.quantity) || 1;
      const unitLkr = Number(item.priceLKR) || 0;
      const unitUsd = Number(item.priceUSD) || 0;

      // Check for available key from inventory_items
      let keyPayload = '';
      let credUser: string | null = null;
      let credPass: string | null = null;
      let keyType = 'SERIAL_KEY';

      const availableKeys = await sql`
        SELECT * FROM inventory_items 
        WHERE product_id = ${item.productId || item.id} AND status = 'AVAILABLE'
        LIMIT 1
      `;

      let itemStatus = 'DELIVERED';
      if (availableKeys.length > 0) {
        const inv = availableKeys[0];
        keyPayload = inv.key_payload;
        credUser = inv.credential_user;
        credPass = inv.credential_pass;
        keyType = inv.stock_type;

        // Mark dispensed
        await sql`
          UPDATE inventory_items 
          SET status = 'DISPENSED', order_id = ${orderId}, assigned_user_email = ${customerEmail}, dispensed_at = NOW()
          WHERE id = ${inv.id}
        `;
      } else {
        const isVpn = (item.category === 'vpn') || (item.title && (item.title.toLowerCase().includes('v2ray') || item.title.toLowerCase().includes('vless')));
        const isSub = (item.category === 'subscription');
        keyType = isVpn ? 'CONNECTION_CONFIG' : isSub ? 'ACCOUNT_CREDENTIALS' : 'SERIAL_KEY';
        itemStatus = paymentStatus === 'PENDING_REVIEW' ? 'PENDING_VERIFICATION' : 'PENDING_FULFILLMENT';
        keyPayload = 'Pending staff verification & dispatch to your email and Key Vault.';
      }

      await sql`
        INSERT INTO order_items (
          id, order_id, product_id, product_title, variant_title, quantity,
          unit_price_lkr, unit_price_usd, subtotal_lkr, subtotal_usd,
          dispensed_key, credential_user, credential_pass, key_type,
          guide_markdown, warranty, status
        ) VALUES (
          ${itemId}, ${orderId}, ${item.productId || item.id}, ${item.title},
          ${item.variantTitle || 'Standard'}, ${qty}, ${unitLkr}, ${unitUsd},
          ${unitLkr * qty}, ${unitUsd * qty}, ${keyPayload}, ${credUser}, ${credPass},
          ${keyType}, ${item.guideMarkdown || 'Delivered to your email and Key Vault upon verification.'},
          ${item.warranty || '24-hour invalid key replacement guarantee'}, ${itemStatus}
        )
      `;

      mintedItems.push({
        id: itemId,
        productTitle: item.title,
        keyPayload,
        credentialUser: credUser,
        credentialPass: credPass,
        keyType,
      });

      // Decrease stock count on product
      await sql`
        UPDATE products 
        SET stock_count = GREATEST(0, stock_count - ${qty}) 
        WHERE id = ${item.productId || item.id}
      `;
    }

    // 6. Log to audit_logs
    await sql`
      INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
      VALUES (
        ${`audit_${orderId}`}, ${customerEmail}, 'ORDER_PLACED', 'ORDER', ${orderId},
        ${JSON.stringify({ orderNumber, totalLKR: finalTotalLKR, paymentMethod, itemsCount: cart.length })}::jsonb
      )
    `;

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      totalAmountLKR: finalTotalLKR,
      totalAmountUSD: finalTotalUSD,
      paymentMethod,
      items: mintedItems,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
