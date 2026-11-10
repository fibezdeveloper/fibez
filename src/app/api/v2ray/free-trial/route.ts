import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { buildRlsContext, requireAuth } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

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
    const isp: string = typeof body.isp === 'string' && body.isp.trim() ? body.isp.trim() : 'Dialog';
    const protocol: 'vless' | 'hysteria2' = body.protocol === 'hysteria2' ? 'hysteria2' : 'vless';

    // Map ISP to optimal SNI masquerade bundle
    let sni = 'gateway.fibez.store';
    let label = 'Direct';

    const normalizedIsp = isp.toLowerCase();
    if (normalizedIsp.includes('dialog')) {
      sni = 'zoom.us';
      label = 'Dialog-Zoom';
    } else if (normalizedIsp.includes('slt')) {
      sni = 'netflix.com';
      label = 'SLT-Fiber-Netflix';
    } else if (normalizedIsp.includes('airtel')) {
      sni = 'tiktokv.com';
      label = 'Airtel-TikTok';
    } else if (normalizedIsp.includes('mobitel')) {
      sni = 'zoom.us';
      label = 'Mobitel-Zoom';
    } else if (normalizedIsp.includes('hutch')) {
      sni = 'zoom.us';
      label = 'Hutch-Zoom';
    } else if (normalizedIsp.includes('gaming')) {
      sni = 'gateway.fibez.store';
      label = 'Gaming-UDP';
    }

    const result = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const activeTrialsRes = await client.query(
        `SELECT o.id, o.order_number, o.created_at, oi.dispensed_key, oi.variant_title
         FROM public.orders o
         JOIN public.order_items oi ON o.id = oi.order_id
         WHERE (o.user_id = $1 OR LOWER(o.customer_email) = $2)
           AND o.payment_method = 'free_trial'
           AND o.created_at > NOW() - INTERVAL '24 hours'
         ORDER BY o.created_at DESC
         LIMIT 1`,
        [actor.id, actor.email]
      );

      if (activeTrialsRes.rows.length > 0) {
        return { existing: activeTrialsRes.rows[0] };
      }

      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const trialUuid = `fbz-${crypto.randomUUID().slice(0, 12)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const configUri = `vless://${trialUuid}@sg.fibez.store:443?encryption=none&security=tls&sni=${sni}&fp=chrome&type=ws&path=/vless#Fibez-${label}-24h-Trial`;

      const orderId = `trial_${crypto.randomUUID()}`;
      const orderNumber = `FBZ-TRL-${randomSuffix}`;
      const itemId = `item_${crypto.randomUUID()}`;

      await client.query(
        `INSERT INTO public.orders (
           id, order_number, user_id, customer_email, customer_name,
           total_amount_lkr, total_amount_usd, currency, payment_method,
           payment_status, fulfillment_status, review_notes, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5,
           0, 0.00, 'LKR', 'free_trial',
           'VERIFIED', 'DELIVERED', $6, NOW(), NOW()
         )`,
        [
          orderId,
          orderNumber,
          actor.id,
          actor.email,
          actor.name,
          `24-Hour ${protocol.toUpperCase()} Free Trial for ${isp}`,
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
         )`,
        [itemId, orderId, `${isp} - 24 Hours (5GB)`, configUri]
      );

      return {
        created: {
          orderNumber,
          configUri,
          expiresAt,
        },
      };
    });

    if ('existing' in result && result.existing) {
      const existing = result.existing;
      let qrDataUrl = '';
      try {
        qrDataUrl = await QRCode.toDataURL(existing.dispensed_key, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        isExisting: true,
        message: 'Active 24-hour trial recovered from your account vault.',
        trial: {
          id: existing.order_number,
          isp: existing.variant_title?.split(' - ')?.[0] || isp,
          protocol: 'High-speed VLESS',
          serverHost: 'sg-edge1.fibez.store:443',
          sni,
          configUri: existing.dispensed_key,
          qrDataUrl,
          bandwidthLimit: '5 GB',
          expiresAt: new Date(
            new Date(existing.created_at).getTime() + 24 * 60 * 60 * 1000
          ).toISOString(),
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

    const created = result.created!;
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(created.configUri, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
    } catch (qrErr) {
      console.error('Failed to generate QR code for trial:', qrErr);
    }

    return NextResponse.json({
      success: true,
      orderNumber: created.orderNumber,
      userEmail: actor.email,
      trial: {
        id: created.orderNumber,
        isp,
        protocol: 'High-speed VLESS',
        serverHost: 'sg-edge1.fibez.store:443',
        sni,
        configUri: created.configUri,
        qrDataUrl,
        bandwidthLimit: '5 GB',
        expiresAt: created.expiresAt,
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
  } catch (error: unknown) {
    console.error('Trial generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate trial configuration' },
      { status: 500 }
    );
  }
}
