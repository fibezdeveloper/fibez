import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSessionUser, getRecentOrderNumberFromRequest } from '@/lib/dal';
import { adminStore } from '@/lib/admin-store';
import { createPurchasedLineFromCartItem, PurchasedV2RayLine } from '@/lib/v2ray-lines';

export async function GET(req: NextRequest) {
  try {
    const actor = await getVerifiedSessionUser();
    const recentOrderNumber = getRecentOrderNumberFromRequest(req);
    const { searchParams } = new URL(req.url);
    const orderParam = searchParams.get('order')?.trim().toUpperCase();
    const emailParam = searchParams.get('email')?.trim().toLowerCase();

    const orders = await adminStore.getOrders();
    const matchingOrders = orders.filter((o) => {
      if (orderParam && o.orderNumber?.toUpperCase() === orderParam) return true;
      if (recentOrderNumber && o.orderNumber?.toUpperCase() === recentOrderNumber.toUpperCase()) return true;
      if (emailParam && o.customerEmail?.toLowerCase() === emailParam) return true;
      if (actor?.email && o.customerEmail?.toLowerCase() === actor.email.toLowerCase()) return true;
      return false;
    });

    const lines: PurchasedV2RayLine[] = [];
    for (const ord of matchingOrders) {
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

        if (isVpn) {
          const line = createPurchasedLineFromCartItem({
            orderNumber: ord.orderNumber,
            productId: item.productId,
            title: item.productTitle,
            variantTitle: item.variantTitle,
            customUuid: (ord as any).metadata?.clientUuid,
            dispensedKey: item.dispensedKey,
          });
          lines.push(line);
        }
      }
    }

    return NextResponse.json({
      success: true,
      lines,
    });
  } catch (error: any) {
    console.error('Error fetching V2Ray lines:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
