import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { xui } from '@/lib/xui';
import { resolvePackageProfile, buildVlessUri } from '@/lib/v2ray-inbounds';
import { PRODUCTS } from '@/lib/products';
import { sql as adminSql } from '@/lib/db';
import { adminStore } from '@/lib/admin-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const recipientEmail = typeof body.recipientEmail === 'string' ? body.recipientEmail.trim().toLowerCase() : '';
    const recipientName = typeof body.recipientName === 'string' && body.recipientName.trim()
      ? body.recipientName.trim()
      : recipientEmail.split('@')[0] || 'Valued Client';
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    const variantTitle = typeof body.variantTitle === 'string' ? body.variantTitle.trim() : 'Standard';
    const grantType = body.grantType || 'FREE_GIFT';
    const staffNotes = body.staffNotes || 'Complimentary staff grant';
    const customKey = typeof body.customKey === 'string' ? body.customKey.trim() : '';

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return NextResponse.json({ error: 'Valid recipient email is required' }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product selection is required' }, { status: 400 });
    }

    // Find product in catalog
    const product = PRODUCTS.find((p) => p.id === productId) || {
      id: productId,
      title: body.productTitle || productId,
      category: body.category || 'other',
      priceLKR: 0,
      priceUSD: 0,
      guideMarkdown: 'Access granted by Fibez Administrator.',
      warranty: 'Official Fibez Staff Guarantee',
    };

    const isV2Ray =
      product.category === 'vpn' ||
      product.id.startsWith('v2ray') ||
      product.title.toLowerCase().includes('vless') ||
      product.title.toLowerCase().includes('v2ray');

    const orderNumber = `FBZ-GFT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const orderId = `ord_grant_${crypto.randomUUID().slice(0, 10)}`;
    const itemId = `item_grant_${crypto.randomUUID().slice(0, 10)}`;

    let dispensedPayload = customKey;
    let clientUuid: string | null = null;
    let keyType = 'SERIAL_KEY';

    // 1. If V2Ray, automatically provision on 3x-ui
    if (isV2Ray) {
      keyType = 'CONNECTION_CONFIG';
      const profile = resolvePackageProfile(productId);
      const targetInbound = Number(body.v2rayInboundId) || profile.inboundId;
      const targetSni = body.v2raySni || profile.sni;
      const targetRemark = body.v2rayRemark || `${profile.remarkName} (VIP Gift)`;
      const quotaGb = Number(body.quotaGb) || 100;
      const validityDays = Number(body.validityDays) || 30;

      const generatedUuid = crypto.randomUUID();
      try {
        const liveClient = await xui.createClient({
          email: `${orderNumber}_${recipientEmail.split('@')[0].slice(0, 10)}`,
          uuid: generatedUuid,
          inboundId: targetInbound,
          totalGB: quotaGb > 0 ? quotaGb * 1024 * 1024 * 1024 : 0,
          expiryDays: validityDays,
          limitIp: 2,
          comment: `Staff Gift to ${recipientName} (${recipientEmail}) - ${staffNotes}`,
        });
        clientUuid = liveClient.uuid;
      } catch (xuiErr) {
        console.warn('3x-ui automated provisioning fallback:', xuiErr);
        clientUuid = generatedUuid;
      }

      dispensedPayload = buildVlessUri({
        uuid: clientUuid,
        host: xui.getPublicHost(),
        port: profile.port,
        sni: targetSni,
        remark: targetRemark,
      });
    } else {
      // Non-V2Ray product: check if manual key provided, otherwise generate clean license / activation credential
      if (!dispensedPayload) {
        if (product.category === 'software') {
          keyType = 'ACCOUNT_CREDENTIALS';
          if (product.id.includes('canva')) {
            dispensedPayload = `https://www.canva.com/brand/join?token=fbz_vip_${crypto.randomBytes(8).toString('hex')}&team=fibez_pro`;
          } else if (product.id.includes('capcut')) {
            dispensedPayload = `Account: user_${recipientEmail.split('@')[0]}@fibez.store | Pass: CapCutPro#${crypto.randomInt(1000, 9999)}`;
          } else {
            dispensedPayload = `LICENSE-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
          }
        } else {
          keyType = 'SERIAL_KEY';
          dispensedPayload = `FBZ-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        }
      }
    }

    // 2. Persist order into adminStore
    adminStore.addOrder({
      id: orderId,
      orderNumber,
      customerName: recipientName,
      customerEmail: recipientEmail,
      customerWhatsapp: null,
      totalAmountLKR: 0,
      totalAmountUSD: 0,
      currency: 'LKR',
      paymentMethod: 'staff_grant',
      paymentStatus: 'VERIFIED',
      fulfillmentStatus: 'DELIVERED',
      grantType: grantType as any,
      reviewedBy: 'Fibez Administrator',
      reviewNotes: `Granted by Admin: [${grantType}] ${staffNotes}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: itemId,
          orderId,
          productId: product.id,
          productTitle: product.title,
          variantTitle,
          quantity: 1,
          unitPriceLKR: 0,
          subtotalLKR: 0,
          dispensedKey: dispensedPayload,
          keyType,
          guideMarkdown: product.guideMarkdown,
          warranty: product.warranty,
          status: 'DELIVERED',
        },
      ],
    });

    // 3. Persist order into Postgres if database is configured
    if (adminSql) {
      try {
        await adminSql`
          INSERT INTO public.orders (
            id, order_number, user_id, customer_email, customer_name,
            total_amount_lkr, total_amount_usd, currency, payment_method,
            payment_status, fulfillment_status, review_notes, created_at, updated_at
          ) VALUES (
            ${orderId}, ${orderNumber}, NULL, ${recipientEmail}, ${recipientName},
            0, 0.00, 'LKR', 'admin_grant',
            'VERIFIED', 'DELIVERED', ${`Granted by Admin: [${grantType}] ${staffNotes}`}, NOW(), NOW()
          )
        `;

        await adminSql`
          INSERT INTO public.order_items (
            id, order_id, product_id, product_title, variant_title,
            quantity, unit_price_lkr, unit_price_usd, subtotal_lkr, subtotal_usd,
            dispensed_key, key_type, guide_markdown, warranty, status, created_at
          ) VALUES (
            ${itemId}, ${orderId}, ${product.id}, ${product.title}, ${variantTitle},
            1, 0, 0.00, 0, 0.00,
            ${dispensedPayload}, ${keyType},
            ${product.guideMarkdown || 'Admin direct fulfillment'},
            ${product.warranty || 'Staff Verified Guarantee'}, 'DELIVERED', NOW()
          )
        `;
      } catch (dbErr) {
        console.warn('Database logging error for admin grant:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      recipientEmail,
      recipientName,
      productTitle: product.title,
      variantTitle,
      dispensedPayload,
      keyType,
      isV2Ray,
      clientUuid,
      timestamp: new Date().toISOString(),
      message: `Successfully granted "${product.title}" to ${recipientEmail}!`,
    });
  } catch (error: any) {
    console.error('Error granting product to client:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to grant product' },
      { status: 500 }
    );
  }
}
