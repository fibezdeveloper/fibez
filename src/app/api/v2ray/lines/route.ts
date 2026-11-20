import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSessionUser, getRecentOrderNumberFromRequest } from '@/lib/dal';
import { adminStore } from '@/lib/admin-store';
import { createPurchasedLineFromCartItem, PurchasedV2RayLine } from '@/lib/v2ray-lines';

export async function GET(req: NextRequest) {
  try {
    const actor = await getVerifiedSessionUser();
    const recentOrderNumber = getRecentOrderNumberFromRequest(req);
    // Only the caller's OWN lines: their account email, or the order they just placed
    // (signed cookie). The old `?email=` / `?order=` params let anyone read any customer's
    // VPN configs, so they are no longer honoured (staff excepted).
    if (!actor && !recentOrderNumber) {
      return NextResponse.json({ success: false, error: 'Authentication required', lines: [] }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const staff = actor?.role === 'admin' || actor?.role === 'owner';
    const orderParam = staff ? searchParams.get('order')?.trim().toUpperCase() : undefined;
    const emailParam = staff ? searchParams.get('email')?.trim().toLowerCase() : undefined;

    const orders = await adminStore.getOrders();
    const matchingOrders = orders.filter((o) => {
      if (orderParam && o.orderNumber?.toUpperCase() === orderParam) return true;
      if (recentOrderNumber && o.orderNumber?.toUpperCase() === recentOrderNumber.toUpperCase()) return true;
      if (emailParam && o.customerEmail?.toLowerCase() === emailParam) return true;
      if (actor?.email && o.customerEmail?.toLowerCase() === actor.email.toLowerCase()) return true;
      return false;
    });

    const lines: PurchasedV2RayLine[] = [];
    const pendingOrders: { orderNumber: string; title: string; status: string }[] = [];

    for (const ord of matchingOrders) {
      const revoked = ord.fulfillmentStatus === 'REVOKED' || ord.paymentStatus === 'FAILED' || ord.paymentStatus === 'REFUNDED';
      const isTrial = ord.orderNumber?.startsWith('FBZ-TRL-');
      const trialExpired = isTrial && Date.now() - new Date(ord.createdAt).getTime() > 24 * 60 * 60 * 1000;

      for (const item of ord.items || []) {
        const isVpn =
          item.productId.includes('v2ray') ||
          item.productId.includes('dialog') ||
          item.productId.includes('slt') ||
          item.productId.includes('airtel') ||
          item.productId.includes('hutch') ||
          item.productId.includes('mobitel') ||
          item.productTitle.toLowerCase().includes('v2ray') ||
          item.productTitle.toLowerCase().includes('vless') ||
          Boolean(item.dispensedKey && item.dispensedKey.startsWith('vless://'));
        if (!isVpn || revoked) continue;

        // One delivered config per line (multi-quantity items store several, one per row).
        const keys = String(item.dispensedKey || '')
          .split('\n')
          .map((k) => k.trim())
          .filter((k) => k.startsWith('vless://'));

        if (keys.length === 0) {
          // Paid but not approved yet: show it as pending, never as a (fake) config.
          if (ord.paymentStatus === 'PENDING_REVIEW' || ord.paymentStatus === 'PENDING_PAYMENT') {
            pendingOrders.push({
              orderNumber: ord.orderNumber,
              title: item.productTitle,
              status: ord.paymentStatus === 'PENDING_REVIEW' ? 'Receipt under review' : 'Awaiting payment',
            });
          }
          continue;
        }

        for (const key of keys) {
          const line = createPurchasedLineFromCartItem({
            orderNumber: ord.orderNumber,
            productId: item.productId,
            title: item.productTitle,
            variantTitle: item.variantTitle,
            dispensedKey: key,
          });
          if (trialExpired) line.status = 'EXPIRED';
          else if (isTrial) line.status = 'TRIAL';
          lines.push(line);
        }
      }
    }

    return NextResponse.json({
      success: true,
      lines,
      pendingOrders,
    });  } catch (error: any) {
    console.error('Error fetching V2Ray lines:', error);
    return NextResponse.json({ success: false, error: 'Failed to load lines' }, { status: 500 });
  }
}
