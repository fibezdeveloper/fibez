import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { buildRlsContext, requireAuth } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';
import { xui } from '@/lib/xui';
import { resolvePackageProfile, buildVlessUri, PACKAGE_ROUTING_PROFILES } from '@/lib/v2ray-inbounds';
import { adminStore, AdminOrder } from '@/lib/admin-store';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('response' in authResult) {
      return NextResponse.json(
        {
          success: false,
          requiresAuth: true,
          error:
            'Sign up or login required to claim a free trial. Please create an account or sign in.',
        },
        { status: 401 }
      );
    }
    const actor = authResult.user;

    const body = await req.json().catch(() => ({}));
    const rawPackageId = typeof body.packageId === 'string' ? body.packageId.trim() : '';
    const rawIsp = typeof body.isp === 'string' ? body.isp.trim() : 'Dialog';
    const protocol: 'vless' | 'hysteria2' = body.protocol === 'hysteria2' ? 'hysteria2' : 'vless';

    // 1. Resolve target package profile and inbound
    let profile = PACKAGE_ROUTING_PROFILES[rawPackageId] || resolvePackageProfile(rawPackageId || rawIsp);

    // Apply explicit package overrides if supplied by client
    const targetInboundId = typeof body.inboundId === 'number' && body.inboundId > 0 ? body.inboundId : profile.inboundId;
    const targetPort = typeof body.port === 'number' && body.port > 0 ? body.port : profile.port;
    const targetSni = typeof body.sni === 'string' && body.sni.trim() ? body.sni.trim() : profile.sni;
    const packageTitle = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : profile.title;
    const remarkName = profile.remarkName || packageTitle;

    // 2. Check if user already claimed a trial in the last 24 hours
    // Check in-memory adminStore first
    const existingStoreOrders = await adminStore.getOrders();
    const activeStoreTrial = existingStoreOrders.find((o) => {
      const isUser = o.customerEmail?.toLowerCase() === actor.email.toLowerCase();
      const isTrial = o.paymentMethod === 'staff_grant' || (o.orderNumber && o.orderNumber.startsWith('FBZ-TRL-'));
      const isRecent = new Date(o.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
      return isUser && isTrial && isRecent;
    });

    if (activeStoreTrial) {
      const item = activeStoreTrial.items?.[0];
      const dispensedKey = item?.dispensedKey || '';
      let qrDataUrl = '';
      if (dispensedKey) {
        try {
          qrDataUrl = await QRCode.toDataURL(dispensedKey, {
            width: 320,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
        } catch {}
      }

      return NextResponse.json({
        success: true,
        isExisting: true,
        message: 'Active 24-hour trial recovered from your account vault.',
        trial: {
          id: activeStoreTrial.orderNumber,
          title: item?.variantTitle?.split(' (10 GB')?.[0] || packageTitle,
          isp: profile.ispTag,
          protocol: 'High-speed VLESS Reality',
          serverHost: `${xui.getPublicHost()}:${targetPort}`,
          port: targetPort,
          inboundId: targetInboundId,
          sni: targetSni,
          configUri: dispensedKey,
          qrDataUrl,
          bandwidthLimit: '10 GB',
          deviceLimit: 2,
          expiresAt: new Date(new Date(activeStoreTrial.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          durationHours: 24,
          instructions: {
            netmod: [
              'Download and launch NetMod Syna (Windows or Android).',
              'Click the + or Import icon -> "Import from Clipboard".',
              'Toggle "Tun Mode" ON in Settings so all system traffic routes through the node.',
              'Click "Start" to connect. Check your connection at fast.com.',
            ],
            v2rayng: [
              'Download v2rayNG from Google Play or GitHub.',
              'Tap the + icon -> "Import config from Clipboard" or "Scan QR Code".',
              'Select the imported node and tap connect.',
              'Enjoy instant unthrottled high-speed connection.',
            ],
          },
        },
      });
    }

    // 3. Generate New 24-Hour Free Trial
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `FBZ-TRL-${randomSuffix}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    let trialUuid: string = crypto.randomUUID();

    // Register live client in 3x-ui on the target inbound
    // 10 GB limit, 24-hour duration, 2 Device / 2 IP limit (HWID)
    try {
      const cleanEmailTag = actor.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      const clientEmail = `${orderNumber}_${cleanEmailTag}`;
      const liveClient = await xui.createClient({
        email: clientEmail,
        uuid: trialUuid,
        inboundId: targetInboundId,
        totalGB: 10 * 1024 * 1024 * 1024, // 10 GB for 24h trial
        expiryDays: 1, // 24 hours
        limitIp: 2, // 2 devices / 2 IPs HWID limit
        comment: `24h Free Trial: ${packageTitle} (${actor.email})`,
      });
      if (liveClient.uuid) {
        trialUuid = liveClient.uuid;
      }
    } catch (xuiErr) {
      console.warn('3x-ui free trial client registration warning:', xuiErr);
    }

    // Build personalized VLESS config URI
    const configUri = buildVlessUri({
      uuid: trialUuid,
      host: xui.getPublicHost(),
      port: targetPort,
      sni: targetSni,
      remark: `Fibez - ${remarkName} (24h Trial)`,
    });

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(configUri, {
        width: 320,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
    } catch (qrErr) {
      console.error('Failed to generate QR code for trial:', qrErr);
    }

    const orderId = `trial_${crypto.randomUUID()}`;
    const itemId = `item_${crypto.randomUUID()}`;

    // 4. Save to AdminStore (In-Memory & Persistent JSON Store)
    const newAdminOrder: AdminOrder = {
      id: orderId,
      orderNumber,
      customerName: actor.name || actor.email.split('@')[0],
      customerEmail: actor.email,
      totalAmountLKR: 0,
      totalAmountUSD: 0,
      currency: 'LKR',
      paymentMethod: 'staff_grant',
      paymentStatus: 'VERIFIED',
      fulfillmentStatus: 'DELIVERED',
      reviewNotes: `24-Hour Free Trial for ${packageTitle} (SNI: ${targetSni}, Port: ${targetPort}, Quota: 10GB, LimitIP: 2)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: itemId,
          orderId,
          productId: 'v2ray-singapore-reality',
          productTitle: `V2Ray / VLESS 24h Free Trial`,
          variantTitle: `${packageTitle} (10 GB / 24h / 2 Devices)`,
          quantity: 1,
          unitPriceLKR: 0,
          subtotalLKR: 0,
          dispensedKey: configUri,
          keyType: 'CONNECTION_CONFIG',
          guideMarkdown: `Import this vless:// link into NetMod Syna (Windows/Android), v2rayNG, or Nekobox. Enable Tun Mode.\n\nSNI: ${targetSni}\nPort: ${targetPort}\nQuota: 10 GB (24 Hours)\nDevice Limit: 2 Devices / IPs`,
          warranty: '24 Hours (10 GB / 2 Devices)',
          status: 'DELIVERED',
        },
      ],
    };
    await adminStore.addOrder(newAdminOrder);

    // 5. Optional PostgreSQL Persistence if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        await withRlsTransaction(buildRlsContext(actor), async (client) => {
          await client.query(
            `INSERT INTO public.orders (
               id, order_number, user_id, customer_email, customer_name,
               total_amount_lkr, total_amount_usd, currency, payment_method,
               payment_status, fulfillment_status, review_notes, created_at, updated_at
             ) VALUES (
               $1, $2, $3, $4, $5,
               0, 0.00, 'LKR', 'free_trial',
               'VERIFIED', 'DELIVERED', $6, NOW(), NOW()
             ) ON CONFLICT (id) DO NOTHING`,
            [
              orderId,
              orderNumber,
              actor.id,
              actor.email,
              actor.name,
              `24-Hour ${protocol.toUpperCase()} Free Trial for ${packageTitle}`,
            ]
          );

          await client.query(
            `INSERT INTO public.order_items (
               id, order_id, product_id, product_title, variant_title,
               quantity, unit_price_lkr, unit_price_usd, subtotal_lkr, subtotal_usd,
               dispensed_key, key_type, guide_markdown, warranty, status, created_at
             ) VALUES (
               $1, $2, 'v2ray-singapore-reality', 'V2Ray / VLESS Trial (24-Hour)', $3,
               1, 0, 0.00, 0, 0.00,
               $4, 'CONNECTION_CONFIG',
               'Import this vless:// link into NetMod Syna, v2rayNG, or Nekobox. Enable Tun Mode.',
               '24 Hours', 'DELIVERED', NOW()
             ) ON CONFLICT (id) DO NOTHING`,
            [itemId, orderId, `${packageTitle} - 24 Hours (10GB)`, configUri]
          );
        });
      } catch (dbErr) {
        console.warn('Optional Postgres trial order write skipped:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      userEmail: actor.email,
      trial: {
        id: orderNumber,
        title: packageTitle,
        isp: profile.ispTag,
        protocol: 'High-speed VLESS Reality',
        serverHost: `${xui.getPublicHost()}:${targetPort}`,
        port: targetPort,
        inboundId: targetInboundId,
        sni: targetSni,
        configUri,
        qrDataUrl,
        bandwidthLimit: '10 GB',
        deviceLimit: 2,
        expiresAt,
        durationHours: 24,
        instructions: {
          netmod: [
            'Download and launch NetMod Syna (Windows or Android).',
            'Click the + or Import icon -> "Import from Clipboard".',
            'Toggle "Tun Mode" ON in Settings so all system traffic routes through the node.',
            'Click "Start" to connect. Check your connection at fast.com.',
          ],
          v2rayng: [
            'Download v2rayNG from Google Play or GitHub.',
            'Tap the + icon -> "Import config from Clipboard" or "Scan QR Code".',
            'Select the imported node and tap connect.',
            'Enjoy instant unthrottled high-speed connection.',
          ],
        },
      },
    });
  } catch (error: any) {
    console.error('Trial generation error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate trial configuration' },
      { status: 500 }
    );
  }
}
