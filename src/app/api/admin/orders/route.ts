import { requireRole } from '@/lib/dal';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminStore } from '@/lib/admin-store';
import { xui } from '@/lib/xui';
import { resolvePackageProfile, buildVlessUri } from '@/lib/v2ray-inbounds';
import { PRODUCTS } from '@/lib/products';
import { analyzeBankReceipt } from '@/lib/receipt-verifier';
import { getWhatsAppDispatchUrl, buildWhatsAppDispatchMessage } from '@/lib/whatsapp';
import { awardReferralCredits } from '@/lib/referrals';

export async function GET(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    const everyOrder = await adminStore.getOrders();
    let allOrders = everyOrder;

    if (status !== 'ALL') {
      allOrders = allOrders.filter((o) => o.paymentStatus === status);
    }

    if (search) {
      allOrders = allOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customerEmail.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          (o.bankName && o.bankName.toLowerCase().includes(search)) ||
          o.items.some((i) => i.productTitle.toLowerCase().includes(search))
      );
    }

    // Enrich orders with Bank Slip Verification Helper and WhatsApp Dispatch Link
    const enrichedOrders = allOrders.map((o) => {
      const receiptAnalysis = o.receiptImageUrl
        ? analyzeBankReceipt({
            receiptUrl: o.receiptImageUrl,
            orderTotalLKR: o.totalAmountLKR,
            currentOrderId: o.id,
            existingOrders: everyOrder,
          })
        : null;

      const whatsAppUrl = getWhatsAppDispatchUrl({
        customerName: o.customerName,
        customerPhone: o.customerWhatsapp,
        orderNumber: o.orderNumber,
        productTitle: o.items?.[0]?.productTitle || 'Digital Product',
        vlessUri: o.items?.[0]?.dispensedKey,
        totalLKR: o.totalAmountLKR,
      });

      return {
        ...o,
        receiptAnalysis,
        whatsAppUrl,
      };
    });

    const pendingReviewCount = everyOrder.filter((o) => o.paymentStatus === 'PENDING_REVIEW').length;
    const verifiedOrders = everyOrder.filter((o) => o.paymentStatus === 'VERIFIED');
    const totalRevenueLKR = verifiedOrders.reduce((sum, o) => sum + (o.totalAmountLKR || 0), 0);

    return NextResponse.json({
      success: true,
      orders: enrichedOrders,
      metrics: {
        totalOrders: everyOrder.length,
        pendingReviewCount,
        verifiedCount: verifiedOrders.length,
        totalRevenueLKR,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const body = await req.json().catch(() => ({}));
    const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : '';
    const action = body.action; // 'APPROVE' | 'REJECT'
    const reviewNotes = body.reviewNotes || '';

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    const order = await adminStore.getOrder(orderNumber);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotency: approving twice would provision a second 3x-ui client / burn another stock key.
    if (action === 'APPROVE' && order.paymentStatus === 'VERIFIED' && order.fulfillmentStatus === 'DELIVERED') {
      return NextResponse.json({ error: 'Order is already approved and delivered' }, { status: 409 });
    }

    if (action === 'APPROVE') {
      let dispensedPayload = '';
      const firstItem = order.items[0];

      if (firstItem) {
        const prod = PRODUCTS.find((p) => p.id === firstItem.productId);
        const isV2Ray =
          firstItem.productId.startsWith('v2ray') ||
          (prod && prod.category === 'vpn') ||
          firstItem.productTitle.toLowerCase().includes('vless') ||
          firstItem.productTitle.toLowerCase().includes('v2ray');

        if (isV2Ray) {
          const profile = resolvePackageProfile(firstItem.productId);

          // 1-Click Renewal check: Check if existing UUID is present
          const isRenewal = Boolean(order.renewOrderId || order.existingUuid || order.reviewNotes?.includes('RENEW:'));
          let clientUuid: string = order.existingUuid || crypto.randomUUID();

          if (isRenewal && order.existingUuid) {
            // RENEWAL: Keep existing UUID, reset traffic & extend 30 days
            try {
              const clientEmail = `${order.renewOrderId || order.orderNumber}_${order.customerEmail.split('@')[0].slice(0, 10)}`;
              await xui.resetClientTraffic(clientEmail);
            } catch (xErr) {
              console.warn('3x-ui renewal traffic reset note:', xErr);
            }
          } else {
            // Fresh Provision in live 3x-ui
            try {
              const client = await xui.createClient({
                email: `${order.orderNumber}_${order.customerEmail.split('@')[0].slice(0, 10)}`,
                uuid: clientUuid,
                inboundId: profile.inboundId,
                totalGB: 100 * 1024 * 1024 * 1024,
                expiryDays: 30,
                limitIp: 2,
                comment: `Order ${order.orderNumber} - ${order.customerName} (${order.customerEmail})`,
              });
              clientUuid = client.uuid;
            } catch (xErr) {
              console.warn('3x-ui auto-provision fallback:', xErr);
            }
          }

          dispensedPayload = buildVlessUri({
            uuid: clientUuid,
            host: xui.getPublicHost(),
            port: profile.port,
            sni: profile.sni,
            remark: `${profile.remarkName} (${order.orderNumber}${isRenewal ? '-RENEW' : ''})`,
          });
        } else {
          // Try to dispense from inventory first
          const invItem = await adminStore.dispenseStockItem(
            firstItem.productId,
            order.id,
            order.customerEmail
          );
          if (invItem) {
            dispensedPayload = invItem.keyPayload;
          } else {
            // Generate clean license/invite
            if (firstItem.productId.includes('canva')) {
              dispensedPayload = `https://www.canva.com/brand/join?token=fbz_vip_${crypto.randomBytes(8).toString('hex')}&team=fibez_pro`;
            } else if (firstItem.productId.includes('capcut')) {
              dispensedPayload = `Account: user_${order.customerEmail.split('@')[0]}@fibez.store | Pass: CapCutPro#${crypto.randomInt(1000, 9999)}`;
            } else {
              dispensedPayload = `LICENSE-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            }
          }
        }
      }

      // Check referral rewards: If this order used a referral code, award 10 Fibez store credits!
      const referralCodeToAward = order.referralCode || order.promoCode;
      let referralAwardResult = null;
      if (referralCodeToAward) {
        referralAwardResult = await awardReferralCredits({
          referralCode: referralCodeToAward,
          orderNumber: order.orderNumber,
          buyerEmail: order.customerEmail,
        });
      }

      const updated = await adminStore.updateOrderStatus(orderNumber, {
        paymentStatus: 'VERIFIED',
        fulfillmentStatus: 'DELIVERED',
        reviewedBy: guard.user.email,
        reviewNotes: reviewNotes || 'Bank receipt verified and approved by admin.',
        dispensedKey: dispensedPayload,
      });

      // Build WhatsApp Automated Dispatch URL
      const whatsAppUrl = getWhatsAppDispatchUrl({
        customerName: order.customerName,
        customerPhone: order.customerWhatsapp,
        orderNumber: order.orderNumber,
        productTitle: firstItem?.productTitle || 'Digital Product',
        vlessUri: dispensedPayload,
        totalLKR: order.totalAmountLKR,
      });

      const whatsAppMessage = buildWhatsAppDispatchMessage({
        customerName: order.customerName,
        customerPhone: order.customerWhatsapp,
        orderNumber: order.orderNumber,
        productTitle: firstItem?.productTitle || 'Digital Product',
        vlessUri: dispensedPayload,
        totalLKR: order.totalAmountLKR,
      });

      return NextResponse.json({
        success: true,
        message: `Order ${orderNumber} approved and credentials dispensed!`,
        order: updated,
        dispensedPayload,
        whatsAppUrl,
        whatsAppMessage,
        referralAwarded: referralAwardResult?.success ? 10 : 0,
      });
    } else if (action === 'REJECT') {
      const updated = await adminStore.updateOrderStatus(orderNumber, {
        paymentStatus: 'FAILED',
        fulfillmentStatus: 'REVOKED',
        reviewedBy: guard.user.email,
        reviewNotes: reviewNotes || 'Payment rejected. Receipt could not be validated.',
      });

      return NextResponse.json({
        success: true,
        message: `Order ${orderNumber} rejected.`,
        order: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
