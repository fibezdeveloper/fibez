import { rateLimit } from '@/lib/rate-limit';
import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { buildRlsContext, requireAuth, adminSql } from '@/lib/dal';
import { canonicalEmail, hashSignal, requestIp } from '@/lib/trial';
import { dbReady } from '@/lib/db/tx';
import { tryClaimTrialDb, releaseTrialClaimDb, userHasTrial } from '@/lib/wallet';
import { recordFulfilledClients } from '@/lib/fulfillment';
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
    if (
      (await rateLimit('trial-user', actor.id, 5, 3600)).limited ||
      (await rateLimit('trial-ip', requestIp(req.headers), 15, 3600)).limited
    ) {
      return NextResponse.json({ success: false, error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const rawPackageId = typeof body.packageId === 'string' ? body.packageId.trim() : '';
    const rawIsp = typeof body.isp === 'string' ? body.isp.trim() : 'Dialog';
    const protocol: 'vless' | 'hysteria2' = body.protocol === 'hysteria2' ? 'hysteria2' : 'vless';

    // 1. Resolve target package profile and inbound
    let profile = PACKAGE_ROUTING_PROFILES[rawPackageId] || resolvePackageProfile(rawPackageId || rawIsp);

    // Apply explicit package overrides if supplied by client
    // Inbound / port / SNI come ONLY from the server-side package profile. Honouring values
    // from the request let a trial user create a client on any (e.g. dedicated) inbound.
    const targetInboundId = profile.inboundId;
    const targetPort = profile.port;
    const targetSni = profile.sni;
    const packageTitle = typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 120) : profile.title;
    const remarkName = profile.remarkName || packageTitle;

    // 2. Check if user already claimed a trial in the last 24 hours
    // Check in-memory adminStore first
    const existingStoreOrders = await adminStore.getOrders();
    // One free trial per ACCOUNT, ever (staff grants do not count as trials).
    const myTrials = existingStoreOrders.filter(
      (o) => o.customerEmail?.toLowerCase() === actor.email.toLowerCase() && Boolean(o.orderNumber?.startsWith('FBZ-TRL-'))
    );
    const activeStoreTrial = myTrials.find(
      (o) => new Date(o.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    if (!activeStoreTrial && myTrials.length > 0) {
      return NextResponse.json(
        { success: false, error: 'You have already used your free trial. Pick a plan to keep going.' },
        { status: 403 }
      );
    }

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

    // 3a. Anti-abuse. Only a VERIFIED email (Google sign-in) may claim a trial: password sign-ups
    //     are not verified, so anyone could mint unlimited throwaway accounts.
    if (adminSql) {
      const rows = await adminSql`SELECT "emailVerified" AS verified FROM neon_auth."user" WHERE id::text = ${actor.id} LIMIT 1`;
      if (!rows[0]?.verified) {
        return NextResponse.json(
          { success: false, error: 'Please continue with Google to claim your free trial (we need a verified email).' },
          { status: 403 }
        );
      }
    }

    const claimIp = requestIp(req.headers);
    const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim().slice(0, 80) : '';
    const deviceFp = typeof body.fp === 'string' ? body.fp.trim().slice(0, 200) : '';
    if (!deviceId || !deviceFp) {
      return NextResponse.json(
        { success: false, error: 'Device check failed. Please reload the page and try again.' },
        { status: 400 }
      );
    }
    const fpHash = hashSignal(deviceFp);
    // 3. Generate New 24-Hour Free Trial
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `FBZ-TRL-${randomSuffix}`;

    // 3b. Atomically reserve the trial: one per account, email (gmail aliases collapsed), device,
    //     and at most 3 per IP per 30 days (mobile networks share IPs, so not just 1).
    const claimInput = {
      userId: actor.id,
      email: actor.email,
      canonicalEmail: canonicalEmail(actor.email),
      ip: claimIp,
      deviceId,
      fpHash,
      uaHash: hashSignal((req.headers.get('user-agent') || '') + (req.headers.get('accept-language') || '')),
      orderNumber,
    };
    // Uniqueness is enforced by the database itself (unique indexes), not by app code.
    const claim = dbReady()
      ? await tryClaimTrialDb(claimInput, { maxPerIp: 3, ipWindowDays: 30 })
      : await adminStore.tryClaimTrial(claimInput, { maxPerIp: 3, ipWindowDays: 30 });
    if (!claim.ok) {
      const msg =
        claim.reason === 'DEVICE'
          ? 'A free trial was already claimed from this device.'
          : claim.reason === 'IP'
          ? 'Too many free trials were claimed from this network. Contact support if this is a mistake.'
          : 'You have already used your free trial. Pick a plan to keep going.';
      return NextResponse.json({ success: false, error: msg }, { status: 403 });
    }
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    let trialUuid: string = crypto.randomUUID();

    // Register live client in 3x-ui on the target inbound
    // 10 GB limit, 24-hour duration, up to 2 devices (HWID) but only 1 IP at a time
    try {
      const cleanEmailTag = actor.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      const clientEmail = `${orderNumber}_${cleanEmailTag}`;
      const liveClient = await xui.createClient({
        email: clientEmail,
        uuid: trialUuid,
        inboundId: targetInboundId,
        totalGB: 10 * 1024 * 1024 * 1024, // 10 GB for 24h trial
        expiryDays: 1, // 24 hours
        limitIp: 1, // only ONE IP connected at a time
        limitHwid: 2, // up to 2 different devices may be registered
        comment: `24h Free Trial: ${packageTitle} (${actor.email}) ip=${claimIp}`,
      });
      if (liveClient.uuid) {
        trialUuid = liveClient.uuid;
      }
    } catch (xuiErr) {
      // Never hand out a trial config that does not exist on the panel.
      console.error('3x-ui free trial provisioning failed:', xuiErr);
      if (dbReady()) await releaseTrialClaimDb(claim.claimId); else await adminStore.releaseTrialClaim(claim.claimId); // nothing was delivered, so give the trial back
      return NextResponse.json(
        { success: false, error: 'The trial server is busy right now. Please try again in a few minutes.' },
        { status: 502 }
      );
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
      userId: actor.id,
      deliveredAt: new Date().toISOString(),
      totalAmountLKR: 0,
      totalAmountUSD: 0,
      currency: 'LKR',
      paymentMethod: 'staff_grant',
      paymentStatus: 'VERIFIED',
      fulfillmentStatus: 'DELIVERED',
      reviewNotes: `24-Hour Free Trial for ${packageTitle} (SNI: ${targetSni}, Port: ${targetPort}, Quota: 10GB, 2 devices / 1 IP at a time) | IP: ${claimIp} | Device: ${fpHash.slice(0, 8)}`,
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
          guideMarkdown: `Import this vless:// link into NetMod Syna (Windows/Android), v2rayNG, or Nekobox. Enable Tun Mode.\n\nSNI: ${targetSni}\nPort: ${targetPort}\nQuota: 10 GB (24 Hours)\nDevices: up to 2 (one connected at a time)`,
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
      { success: false, error: 'Failed to generate trial configuration' },
      { status: 500 }
    );
  }
}
