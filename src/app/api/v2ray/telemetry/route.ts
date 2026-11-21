import { NextRequest, NextResponse } from 'next/server';
import { xui, XuiInboundSummary } from '@/lib/xui';
import { getVerifiedSessionUser } from '@/lib/dal';
import { adminStore } from '@/lib/admin-store';
import { parseVlessUri } from '@/lib/v2ray-inbounds';
import { getDailyUsage, recordSnapshots } from '@/lib/usage';
import { ispFromIp } from '@/lib/isp';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const actor = await getVerifiedSessionUser();
    if (!actor) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const isStaff = actor.role === 'admin' || actor.role === 'owner';

    // 1. Resolve Target Identifier (UUID, Email, or VLESS URI)
    let targetIdentifier = searchParams.get('uuid') || searchParams.get('email') || searchParams.get('user') || '';
    const vlessParam = searchParams.get('vless');

    if (vlessParam) {
      const parsed = parseVlessUri(vlessParam);
      if (parsed?.uuid) {
        targetIdentifier = parsed.uuid;
      }
    }

    // A non-staff user may only query their OWN lines (matched against their own orders).
    if (targetIdentifier && !isStaff) {
      const myOrders = (await adminStore.getOrders()).filter(
        (o) => o.customerEmail.toLowerCase() === actor.email.toLowerCase()
      );
      const wanted = targetIdentifier.trim().toLowerCase();
      const owned = myOrders.some((o) => {
        if (wanted.startsWith(o.orderNumber.toLowerCase())) return true;
        if (String((o as any).metadata?.clientUuid || '').toLowerCase() === wanted) return true;
        return o.items.some((i) => {
          const u = i.dispensedKey ? parseVlessUri(i.dispensedKey)?.uuid : undefined;
          return Boolean(u && u.toLowerCase() === wanted);
        });
      });
      if (!owned) {
        return NextResponse.json({ success: false, error: 'Line not found on your account' }, { status: 403 });
      }
    }

    // If still empty, check logged-in actor's orders/trials in adminStore
    let clientMetadata: any = null;
    if (!targetIdentifier && actor?.email) {
      const orders = await adminStore.getOrders();
      const userOrder = orders.find(
        (o) =>
          o.customerEmail.toLowerCase() === actor.email.toLowerCase() &&
          (o.paymentMethod === 'staff_grant' ||
            o.orderNumber.startsWith('FBZ-TRL-') ||
            o.items.some(
              (i) => i.productId.includes('v2ray') || i.dispensedKey?.startsWith('vless://')
            ))
      );

      if (userOrder) {
        clientMetadata = (userOrder as any).metadata || null;
        if ((userOrder as any).metadata?.clientUuid) {
          targetIdentifier = (userOrder as any).metadata.clientUuid;
        } else if (userOrder.items[0]?.dispensedKey) {
          const parsed = parseVlessUri(userOrder.items[0].dispensedKey);
          if (parsed?.uuid) targetIdentifier = parsed.uuid;
        }
      }
    }

    // 2. Fetch live inbound health from 3x-ui
    let inbounds: XuiInboundSummary[] = [];
    try {
      inbounds = await xui.listInbounds();
    } catch (inbErr) {
      console.warn('Error fetching 3x-ui inbounds for telemetry:', inbErr);
    }

    // 3. Attempt to fetch client traffic if identifier is present
    let clientTraffic: any = null;
    if (targetIdentifier) {
      try {
        const client = await xui.getClient(targetIdentifier);
        if (client) {
          // 0 means UNLIMITED on the panel: never invent a quota.
          const totalGB = client.totalGB > 0 ? Number((client.totalGB / (1024 * 1024 * 1024)).toFixed(1)) : 0;

          const usedGB = client.usedTraffic
            ? Number((client.usedTraffic / (1024 * 1024 * 1024)).toFixed(2))
            : Number((((client.up || 0) + (client.down || 0)) / (1024 * 1024 * 1024)).toFixed(2));

          const isTrial =
            client.email?.includes('trial_') ||
            (totalGB > 0 && totalGB <= 15) ||
            (clientMetadata?.orderNumber && clientMetadata.orderNumber.startsWith('FBZ-TRL-'));

          clientTraffic = {
            email: client.email,
            uuid: client.uuid,
            totalGB,
            unlimited: totalGB === 0,
            usedGB,
            upBytes: client.up || 0,
            downBytes: client.down || 0,
            expiryTime: client.expiryTime,
            enable: client.enable,
            inboundIds: client.inboundIds,
            isTrial,
            clientRemark: clientMetadata?.packageTitle || client.email,
          };
        }
      } catch (clientErr) {
        console.warn('Could not query client in 3x-ui:', targetIdentifier, clientErr);
      }
    }

    // 4. Real connection data from the panel + stored daily usage history
    let connections: {
      ip: string;
      isp: string | null;
      lastSeen: string;
      status: 'online' | 'seen';
    }[] = [];
    let registeredDevices: Record<string, unknown>[] = [];
    let usageHistory: { series: { date: string; downGB: number; upGB: number; known: boolean }[]; trackingSince: string | null } = {
      series: [],
      trackingSince: null,
    };
    let lastOnline = 0;
    let limitIp = 0;
    let limitHwid = 0;

    if (clientTraffic?.email) {
      const email: string = clientTraffic.email;
      const [full, ips, hwids, onlines, row] = await Promise.all([
        xui.getClient(email).catch(() => null),
        xui.getClientIps(email),
        xui.getClientHwids(email),
        xui.getOnlineEmails(),
        xui.getClientTrafficRow(email),
      ]);
      const isOnline = onlines.some((e) => e.toLowerCase() === email.toLowerCase());
      connections = ips
        .sort((a, b) => b.time.localeCompare(a.time))
        .map((e, i) => ({
          ip: e.ip,
          isp: ispFromIp(e.ip),
          lastSeen: e.time,
          status: i === 0 && isOnline ? ('online' as const) : ('seen' as const),
        }));
      registeredDevices = hwids;
      lastOnline = row?.lastOnline || 0;
      limitIp = full?.limitIp ?? 0;
      limitHwid = full?.limitHwid ?? 0;

      if (row) {
        // Keep the history fresh: store today's cumulative reading, then derive daily usage.
        try {
          await recordSnapshots([{ email, up: row.up, down: row.down }]);
        } catch (e) {
          console.warn('usage snapshot failed:', e);
        }
      }
      try {
        usageHistory = await getDailyUsage(email, 14);
      } catch (e) {
        console.warn('usage history failed:', e);
      }
    }

    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      server: {
        host: xui.getPublicHost(),
        location: 'Singapore Equinix SG3',
        panelMs: elapsed,
        inbounds: inbounds.map((inb) => ({
          id: inb.id,
          port: inb.port,
          protocol: inb.protocol,
          remark: inb.remark,
          clientCount: inb.clientCount,
          upGB: Number((inb.up / (1024 * 1024 * 1024)).toFixed(2)),
          downGB: Number((inb.down / (1024 * 1024 * 1024)).toFixed(2)),
        })),
      },
      client: clientTraffic,
      connections,
      registeredDevices,
      limits: { ip: limitIp, hwid: limitHwid },
      lastOnline,
      usageHistory,
    });
  } catch (error: any) {
    console.error('Telemetry error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve telemetry', // never echo panel/internal error text to clients
      },
      { status: 500 }
    );
  }
}
