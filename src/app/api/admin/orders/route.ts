import { auditLog } from '@/lib/audit';
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
import { approveOrder, rejectOrder } from '@/lib/order-review';
import { dbReady } from '@/lib/db/tx';
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

    if (action === 'APPROVE') {
      const manualKeys: Record<string, string> =
        body.manualKeys && typeof body.manualKeys === 'object' ? body.manualKeys : {};

      const result = await approveOrder(order, guard.user.email, reviewNotes, manualKeys);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      const { dispensedPayload } = result;
      await auditLog(guard.user, 'ORDER_APPROVED', 'ORDER', orderNumber, { notes: String(reviewNotes).slice(0, 300), totalLKR: order.totalAmountLKR }, req);
      const firstItem = order.items[0];

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
        order: result.order,
        dispensedPayload,
        whatsAppUrl,
        whatsAppMessage,
        referralAwarded: result.referralAwarded ? 100 : 0,
      });
    } else if (action === 'REJECT') {
      const { order: updated, revokedClients } = await rejectOrder(order, guard.user.email, reviewNotes);
      await auditLog(guard.user, 'ORDER_REJECTED', 'ORDER', orderNumber, { notes: String(reviewNotes).slice(0, 300), revokedClients }, req);

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
