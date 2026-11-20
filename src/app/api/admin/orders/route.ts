import { requireRole } from '@/lib/dal';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminStore } from '@/lib/admin-store';
import { xui } from '@/lib/xui';
import { buildVlessUri } from '@/lib/v2ray-inbounds';
import { resolveV2RayProvisioning } from '@/lib/pricing';
import { PRODUCTS } from '@/lib/products';
import { analyzeBankReceipt } from '@/lib/receipt-verifier';
import { getWhatsAppDispatchUrl, buildWhatsAppDispatchMessage } from '@/lib/whatsapp';
import { awardReferralCredits } from '@/lib/referrals';
import { getObjectDownloadUrl, BUCKET_NAME } from '@/lib/storage';

async function freshSlipUrl(url?: string | null): Promise<string | null | undefined> {
  if (!url) return url;
  try {
    const u = new URL(url);
    const idx = u.pathname.indexOf('/slips/');
    if (idx < 0) return url;
    const key = decodeURIComponent(u.pathname.slice(idx + 1)); // slips/<file>
    return await getObjectDownloadUrl(key, BUCKET_NAME, 3600);
  } catch {
    return url;
  }
}

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
    const enrichedOrders = await Promise.all(allOrders.map(async (o) => {
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
        // Slip links are time-limited; hand the admin a fresh one every time the list loads.
        receiptImageUrl: await freshSlipUrl(o.receiptImageUrl),
        receiptAnalysis,
        whatsAppUrl,
      };
    }));

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
      const itemKeys: Record<string, string> = {};
      const panelClients: { email: string; uuid: string }[] = [];
      const manualKeys: Record<string, string> =
        body.manualKeys && typeof body.manualKeys === 'object' ? body.manualKeys : {};
      const provisionExtra = {
        overrides: await adminStore.getPackageOverrides(),
        customPackages: await adminStore.getCustomPackages(),
      };
      const emailTag = order.customerEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

      // If anything fails half-way, remove the panel clients we already created so nothing is orphaned.
      const rollbackPanel = async () => {
        for (const c of panelClients) await xui.deleteClient(c.email).catch(() => false);
      };

      for (let idx = 0; idx < order.items.length; idx++) {
        const item = order.items[idx];
        const prod = PRODUCTS.find((p) => p.id === item.productId);
        const isV2Ray =
          item.productId.startsWith('v2ray') ||
          (prod && prod.category === 'vpn') ||
          item.productTitle.toLowerCase().includes('vless') ||
          item.productTitle.toLowerCase().includes('v2ray');
        const qty = Math.max(1, Math.min(20, Math.round(item.quantity || 1)));
        const delivered: string[] = [];

        if (isV2Ray) {
          const spec = resolveV2RayProvisioning(item.productId, provisionExtra);
          const isRenewal =
            idx === 0 && Boolean(order.renewOrderId || order.existingUuid || order.reviewNotes?.includes('RENEW:'));

          if (isRenewal && order.existingUuid) {
            // Renewal: keep the existing client, reset its traffic.
            try {
              const existing = await xui.getClient(order.existingUuid);
              if (existing) await xui.resetClientTraffic(existing.email);
            } catch (xErr) {
              console.warn('3x-ui renewal traffic reset note:', xErr);
            }
            delivered.push(
              buildVlessUri({
                uuid: order.existingUuid,
                host: spec.host || xui.getPublicHost(),
                port: spec.port,
                sni: spec.sni,
                remark: `${spec.remarkName} (${order.orderNumber}-RENEW)`,
              })
            );
          } else {
            for (let n = 0; n < qty; n++) {
              const clientEmail = `${order.orderNumber}-${idx + 1}${qty > 1 ? `-${n + 1}` : ''}_${emailTag}`;
              try {
                const client = await xui.createClient({
                  email: clientEmail,
                  inboundId: spec.inboundId,
                  totalGB: spec.totalBytes,
                  expiryDays: spec.expiryDays,
                  limitIp: spec.limitIp,
                  comment: `Order ${order.orderNumber} - ${order.customerName} (${order.customerEmail})`,
                });
                panelClients.push({ email: clientEmail, uuid: client.uuid });
                delivered.push(
                  buildVlessUri({
                    uuid: client.uuid,
                    host: spec.host || xui.getPublicHost(),
                    port: spec.port,
                    sni: spec.sni,
                    remark: `${spec.remarkName} (${order.orderNumber})`,
                  })
                );
              } catch (xErr) {
                // Never deliver a config that does not exist on the panel: keep the order pending.
                console.error('3x-ui provisioning failed, order left pending:', xErr);
                await rollbackPanel();
                return NextResponse.json(
                  { error: 'Could not create the client on the V2Ray panel. The order was NOT approved; check the panel connection and retry.' },
                  { status: 502 }
                );
              }
            }
          }
        } else {
          // Physical stock only: never invent keys. Admin can paste keys via manualKeys if needed.
          const manual = String(manualKeys[item.id] || '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
          for (let n = 0; n < qty; n++) {
            if (manual[n]) {
              delivered.push(manual[n]);
              continue;
            }
            const invItem = await adminStore.dispenseStockItem(item.productId, order.id, order.customerEmail);
            if (!invItem) {
              await rollbackPanel();
              return NextResponse.json(
                {
                  error: `No stock available for "${item.productTitle}". Add stock in Inventory (or provide the key manually) and approve again. The order was NOT approved.`,
                },
                { status: 409 }
              );
            }
            delivered.push(invItem.keyPayload);
          }
        }

        itemKeys[item.id] = delivered.join('\n');
      }

      const dispensedPayload = Object.values(itemKeys).join('\n');
      const firstItem = order.items[0];
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
        itemKeys,
        metadata: { panelClients },
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
      // Rejecting (or revoking) an order that already got V2Ray lines removes them from the panel.
      let revokedClients = 0;
      for (const c of order.metadata?.panelClients || []) {
        if (await xui.deleteClient(c.email)) revokedClients++;
      }
      const updated = await adminStore.updateOrderStatus(orderNumber, {
        paymentStatus: 'FAILED',
        fulfillmentStatus: 'REVOKED',
        reviewedBy: guard.user.email,
        reviewNotes: reviewNotes || 'Payment rejected. Receipt could not be validated.',
      });

      return NextResponse.json({
        success: true,
        message:
          `Order ${orderNumber} rejected.` +
          (revokedClients ? ` ${revokedClients} V2Ray line(s) removed from the panel.` : ''),
        order: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
