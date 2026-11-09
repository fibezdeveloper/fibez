import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const isp: string = body.isp || 'Dialog';
    const protocol: 'vless' | 'hysteria2' = body.protocol === 'hysteria2' ? 'hysteria2' : 'vless';

    // 1. Check user authentication via session or verified account
    let userEmail: string | null = null;
    let userId: string | null = null;
    let userName: string = 'Free Trial User';

    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.email) {
        userEmail = session.user.email;
        userId = session.user.id;
        userName = session.user.name || userEmail.split('@')[0];
      }
    } catch {
      // Session fallback
    }

    // Fallback: check passed email against registered users in database
    if (!userEmail && (body.userEmail || body.email)) {
      const candidateEmail = String(body.userEmail || body.email).trim().toLowerCase();
      if (sql) {
        const userRows = await sql`
          SELECT id, email, name FROM "user" WHERE LOWER(email) = ${candidateEmail} LIMIT 1
        `;
        if (userRows.length > 0) {
          userEmail = userRows[0].email;
          userId = userRows[0].id;
          userName = userRows[0].name || (userEmail ? userEmail.split('@')[0] : 'Trial User');
        }
      }
    }

    // STRICT GATE: Free trial requires account registration / sign-in
    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          requiresAuth: true,
          error: 'Sign up or login required to claim a free trial. Please create an account or sign in.',
        },
        { status: 401 }
      );
    }

    // 2. Map ISP to optimal SNI masquerade bundle
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

    // 3. Check if user already claimed an active trial within the last 24 hours
    if (sql) {
      const activeTrials = await sql`
        SELECT o.id, o.order_number, o.created_at, oi.dispensed_key, oi.variant_title
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE LOWER(o.customer_email) = ${userEmail.toLowerCase()}
          AND o.payment_method = 'free_trial'
          AND o.created_at > NOW() - INTERVAL '24 hours'
        ORDER BY o.created_at DESC
        LIMIT 1
      `;

      if (activeTrials.length > 0) {
        const existing = activeTrials[0];
        let qrDataUrl = '';
        try {
          qrDataUrl = await QRCode.toDataURL(existing.dispensed_key, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
        } catch (_) {}

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
            expiresAt: new Date(new Date(existing.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString(),
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
    }

    // 4. Generate new trial config
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trialUuid = `fbz-${randomSuffix.toLowerCase()}-${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    let configUri = '';
    if (protocol === 'vless') {
      configUri = `vless://${trialUuid}@sg-edge1.fibez.store:443?encryption=none&security=reality&sni=${sni}&fp=chrome&pbk=7kZz9XQ0YhJtF8WqK1bV2mN3sP4cD5eG6iU7oA8rS9M&sid=fa4c10&type=tcp&headerType=none#Fibez-${label}-24h-Trial`;
    } else {
      configUri = `hy2://${trialUuid}@sg-hy2.fibez.store:20000-50000?sni=${sni}&insecure=0#Fibez-Hy2-${label}-24h-Trial`;
    }

    // Generate QR code for mobile scanning
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(configUri, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } catch (qrErr) {
      console.error('Failed to generate QR code for trial:', qrErr);
    }

    const orderId = `trial_${Date.now()}_${randomSuffix.toLowerCase()}`;
    const orderNumber = `FBZ-TRL-${randomSuffix}`;
    const itemId = `item_${Date.now()}_${randomSuffix.toLowerCase()}`;

    // 5. Store trial in database as an order so it permanently lives in user's Key Vault
    if (sql) {
      try {
        await sql`
          INSERT INTO orders (
            id, order_number, user_id, customer_email, customer_name,
            total_amount_lkr, total_amount_usd, currency, payment_method,
            payment_status, fulfillment_status, review_notes, created_at, updated_at
          ) VALUES (
            ${orderId},
            ${orderNumber},
            ${userId},
            ${userEmail},
            ${userName},
            0,
            0.00,
            'LKR',
            'free_trial',
            'VERIFIED',
            'DELIVERED',
            ${`24-Hour ${protocol.toUpperCase()} Free Trial for ${isp}`},
            NOW(),
            NOW()
          )
        `;

        await sql`
          INSERT INTO order_items (
            id, order_id, product_id, product_title, variant_title,
            quantity, unit_price_lkr, unit_price_usd, subtotal_lkr, subtotal_usd,
            dispensed_key, key_type, guide_markdown, warranty, status, created_at
          ) VALUES (
            ${itemId},
            ${orderId},
            'v2ray-singapore-reality',
            'V2Ray / VLESS Trial (24-Hour)',
            ${`${isp} - 24 Hours (5GB)`},
            1,
            0,
            0.00,
            0,
            0.00,
            ${configUri},
            'CONNECTION_CONFIG',
            'Import this vless:// link into NetMod Syna, v2rayNG, or Nekobox. Enable Tun Mode.',
            '24 Hours',
            'DELIVERED',
            NOW()
          )
        `;
      } catch (dbErr) {
        console.error('Failed to save free trial to database:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      userEmail,
      trial: {
        id: orderNumber,
        isp,
        protocol: 'High-speed VLESS',
        serverHost: 'sg-edge1.fibez.store:443',
        sni,
        configUri,
        qrDataUrl,
        bandwidthLimit: '5 GB',
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
  } catch (error) {
    console.error('Trial generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate trial configuration' },
      { status: 500 }
    );
  }
}
