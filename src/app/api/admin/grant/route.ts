import { requireRole } from '@/lib/dal';
import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { xui } from '@/lib/xui';
import { buildVlessUri, INBOUND_DEFINITIONS } from '@/lib/v2ray-inbounds';
import { resolveV2RayProvisioning } from '@/lib/pricing';
import { dbReady } from '@/lib/db/tx';
import { recordPanelClients } from '@/lib/wallet';
import { PRODUCTS } from '@/lib/products';
import { sql as adminSql } from '@/lib/db';
import { adminStore } from '@/lib/admin-store';
import { notifyLater } from '@/lib/telegram';
import { tgMessages } from '@/lib/telegram-bot';

export async function POST(req: NextRequest) {
  const guard = await requireRole(['owner']); // free grants are owner-only
  if ('response' in guard) return guard.response;

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
    let grantPanelClient: { email: string; uuid: string; inboundId: number; expiresAt: Date } | null = null;
    let keyType = 'SERIAL_KEY';

    // 1. If V2Ray, automatically provision on 3x-ui
    if (isV2Ray) {
      keyType = 'CONNECTION_CONFIG';
      // Start from the package's own inbound / port / SNI (and admin edits), then apply the
      // admin's explicit choices from the Grant form.
      const spec = resolveV2RayProvisioning(productId, {
        overrides: await adminStore.getPackageOverrides(),
        customPackages: await adminStore.getCustomPackages(),
      });
      const num = (v: unknown, fallback: number, min: number, max: number) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
      };

      const targetInbound = num(body.v2rayInboundId, spec.inboundId, 1, 50);
      // The port MUST follow the inbound the client is created on.
      const targetPort = INBOUND_DEFINITIONS[targetInbound]?.port ?? spec.port;
      const targetSni = typeof body.v2raySni === 'string' && body.v2raySni.trim() ? body.v2raySni.trim().slice(0, 100) : spec.sni;
      const targetRemark =
        typeof body.v2rayRemark === 'string' && body.v2rayRemark.trim()
          ? body.v2rayRemark.trim().slice(0, 100)
          : `${spec.remarkName} (VIP Gift)`;
      const quotaGb = num(body.quotaGb, Math.round(spec.totalBytes / 1073741824), 0, 100000); // 0 = unlimited
      const validityDays = num(body.validityDays, 30, 1, 3650);
      const limitIp = num(body.limitIp, 2, 0, 50); // concurrent IPs, 0 = unlimited
      const limitHwid = num(body.limitHwid, 0, 0, 50); // registered devices, 0 = no HWID limit

      let generatedUuid: string;
      const grantClientEmail = `${orderNumber}_${recipientEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}`;
      try {
        const liveClient = await xui.createClient({
          email: grantClientEmail,
          inboundId: targetInbound,
          totalGB: quotaGb * 1024 * 1024 * 1024,
          expiryDays: validityDays,
          limitIp,
          ...(limitHwid > 0 ? { limitHwid } : {}),
          comment: `Staff Gift to ${recipientName} (${recipientEmail}) - ${staffNotes}`,
        });
        generatedUuid = liveClient.uuid;
        clientUuid = liveClient.uuid;
        grantPanelClient = {
          email: grantClientEmail,
          uuid: liveClient.uuid,
          inboundId: targetInbound,
          expiresAt: new Date(Date.now() + validityDays * 86400000),
        };
      } catch (xuiErr) {
        // Never hand out a config that does not exist on the panel.
        console.error('3x-ui provisioning failed, grant aborted:', xuiErr);
        return NextResponse.json(
          { success: false, error: 'Could not create the client on the V2Ray panel. Nothing was granted; check the panel connection and retry.' },
          { status: 502 }
        );
      }

      dispensedPayload = buildVlessUri({
        uuid: generatedUuid,
        host: spec.host || xui.getPublicHost(),
        port: targetPort,
        sni: targetSni,
        remark: targetRemark,
      });
    } else {
      // Real stock only: the key you typed, otherwise one from Inventory. Keys are never invented.
      if (!dispensedPayload) {
        const inv = await adminStore.dispenseStockItem(product.id, orderId, recipientEmail);
        if (!inv) {
          return NextResponse.json(
            { success: false, error: `No stock available for "${product.title}". Add stock in Inventory, or type the key in the override box.` },
            { status: 409 }
          );
        }
        dispensedPayload = inv.keyPayload;
        keyType = inv.stockType;
      }
    }

    // 2. Persist order into adminStore
    await adminStore.addOrder({
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
      deliveredAt: new Date().toISOString(),
      metadata: grantPanelClient ? { panelClients: [{ email: grantPanelClient.email, uuid: grantPanelClient.uuid }] } : undefined,
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

    // 3. Remember the panel client so the line can be revoked / renewed later
    if (grantPanelClient && dbReady()) {
      await recordPanelClients([
        {
          orderNumber,
          itemId,
          userEmail: recipientEmail,
          email: grantPanelClient.email,
          uuid: grantPanelClient.uuid,
          inboundId: grantPanelClient.inboundId,
          expiresAt: grantPanelClient.expiresAt,
        },
      ]).catch((e) => console.warn('Panel client not recorded:', e));
    }

    if (dispensedPayload) {
      const m = tgMessages.delivered(orderNumber, [{ title: product.title, key: dispensedPayload }]);
      notifyLater(recipientEmail, m.html, m.buttons);
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
