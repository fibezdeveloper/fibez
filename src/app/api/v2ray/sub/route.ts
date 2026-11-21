import { NextRequest, NextResponse } from 'next/server';
import { xui } from '@/lib/xui';
import { resolvePackageProfile, buildVlessUri } from '@/lib/v2ray-inbounds';
import { rateLimit } from '@/lib/rate-limit';
import { requestIp } from '@/lib/trial';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pkg = searchParams.get('pkg') || 'dialog-zoom';
    const clientApp = searchParams.get('client') || 'netmod';
    const format = searchParams.get('format') || 'base64';
    const uuidParam = searchParams.get('uuid');

    if ((await rateLimit('sub', requestIp(req.headers), 120, 600)).limited) {
      return new NextResponse('Too many requests', { status: 429, headers: { 'Retry-After': '60' } });
    }

    // 1. Resolve package-specific routing (port, custom SNI, and customized remark name)
    const profile = resolvePackageProfile(pkg);

    // 2. The client UUID is the only credential for a subscription link. Looking a line up by email
    //    or any other guessable value would hand its UUID (= its config) to anyone who knew it.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidParam || !UUID_RE.test(uuidParam)) {
      return new NextResponse('A valid client uuid is required', { status: 400 });
    }
    const lookupTarget = uuidParam;

    let clientUuid = uuidParam || '';
    let usage: { upload: number; download: number; total: number; expire: number } | null = null;

    try {
      const liveClient = await xui.getClient(lookupTarget);
      if (liveClient) {
        clientUuid = liveClient.uuid;
        const used = liveClient.usedTraffic ?? 0;
        usage = {
          upload: Math.floor(used * 0.15),
          download: Math.floor(used * 0.85),
          total: liveClient.totalGB > 0 ? liveClient.totalGB : 0,
          expire: liveClient.expiryTime > 0 ? Math.floor(liveClient.expiryTime / 1000) : 0,
        };
      } else {
        // Panel reachable but no such client (revoked / deleted): do not serve a dead config.
        return new NextResponse('Client not found', { status: 404 });
      }
    } catch (err) {
      console.warn('Could not query 3x-ui for client:', lookupTarget, err);
      if (!uuidParam) {
        return new NextResponse('Subscription service temporarily unavailable', { status: 503 });
      }
    }

    if (!clientUuid) {
      return new NextResponse('Client not found', { status: 404 });
    }

    // 3. Build the customized VLESS configuration URI
    // Exactly matches user instructions:
    // - Inbound 1: Port 445 for SLT Fiber Zoom & Meet
    // - Inbound 2: Port 444 for SLT Fiber Netflix
    // - Inbound 3: Port 443 with package-specific SNI (e.g. m.tiktok.com) and remark name
    const primaryUri = buildVlessUri({
      uuid: clientUuid,
      host: xui.getPublicHost(),
      port: profile.port,
      sni: profile.sni,
      remark: profile.remarkName,
    });

    // Provide a resilient secondary backup config URI for high availability
    const backupRemark = `${profile.remarkName} (Backup SG Direct)`;
    const backupUri = buildVlessUri({
      uuid: clientUuid,
      host: xui.getPublicHost(),
      port: profile.port,
      sni: profile.sni === 'zoom.us' ? 'm.zoom.us' : profile.sni,
      remark: backupRemark,
    });

    const configs = [primaryUri, backupUri];
    const rawText = configs.join('\n');
    const responsePayload = format === 'raw' ? rawText : Buffer.from(rawText).toString('base64');

    return new NextResponse(responsePayload, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Profile-Update-Interval': '12',
        // Only report usage numbers that came from the live panel; never invent them.
        ...(usage
          ? {
              'Subscription-Userinfo': `upload=${usage.upload}; download=${usage.download}; total=${usage.total}; expire=${usage.expire}`,
            }
          : {}),
        'Content-Disposition': `inline; filename="fibez_${clientApp.replace(/[^a-zA-Z0-9_-]/g, '')}_${profile.packageId}.txt"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Subscription generation error:', err);
    return new NextResponse('Internal server error generating subscription', { status: 500 });
  }
}
