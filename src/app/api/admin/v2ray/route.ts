import { requireRole } from '@/lib/dal';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { xui } from '@/lib/xui';
import { buildVlessUri, INBOUND_DEFINITIONS } from '@/lib/v2ray-inbounds';
import { adminStore } from '@/lib/admin-store';

function formatInboundsList(inbounds: any[]) {
  let totalUpBytes = 0;
  let totalDownBytes = 0;
  let totalClientCount = 0;

  const formatted = inbounds.map((inbound) => {
    totalUpBytes += inbound.up || 0;
    totalDownBytes += inbound.down || 0;
    totalClientCount += inbound.clientStats?.length || 0;

    return {
      id: inbound.id,
      port: inbound.port,
      protocol: inbound.protocol,
      remark: inbound.remark,
      enable: inbound.enable,
      upGB: Math.round(((inbound.up || 0) / (1024 * 1024 * 1024)) * 100) / 100,
      downGB: Math.round(((inbound.down || 0) / (1024 * 1024 * 1024)) * 100) / 100,
      totalTrafficGB:
        Math.round((((inbound.up || 0) + (inbound.down || 0)) / (1024 * 1024 * 1024)) * 100) / 100,
      clients: (inbound.clientStats || []).map((c: any) => ({
        id: c.id,
        inboundId: c.inboundId,
        email: c.email,
        enable: c.enable,
        totalGB: c.total > 0 ? Math.round((c.total / (1024 * 1024 * 1024)) * 100) / 100 : 'Unlimited',
        upGB: Math.round(((c.up || 0) / (1024 * 1024 * 1024)) * 100) / 100,
        downGB: Math.round(((c.down || 0) / (1024 * 1024 * 1024)) * 100) / 100,
        usedGB: Math.round((((c.up || 0) + (c.down || 0)) / (1024 * 1024 * 1024)) * 100) / 100,
        expiryTime: c.expiryTime > 0 ? new Date(c.expiryTime).toLocaleDateString() : 'Never',
      })),
    };
  });

  return {
    inbounds: formatted,
    summary: {
      inboundsCount: inbounds.length,
      totalClients: totalClientCount,
      totalUpGB: Math.round((totalUpBytes / (1024 * 1024 * 1024)) * 100) / 100,
      totalDownGB: Math.round((totalDownBytes / (1024 * 1024 * 1024)) * 100) / 100,
      totalTrafficGB:
        Math.round(((totalUpBytes + totalDownBytes) / (1024 * 1024 * 1024)) * 100) / 100,
    },
  };
}

export async function GET() {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const config = await adminStore.getXuiConfig();
    xui.updateConfig({
      baseUrl: config.baseUrl,
      username: config.username,
      password: config.password,
      publicHost: config.publicHost,
    });

    const startPing = Date.now();
    const inbounds = await xui.listInbounds();
    const latencyMs = Date.now() - startPing;

    // Update last sync in admin store
    await adminStore.updateXuiConfig({
      lastSyncedAt: new Date().toISOString(),
      lastStatus: 'CONNECTED',
      lastLatencyMs: latencyMs,
    });

    const { inbounds: formattedInbounds, summary } = formatInboundsList(inbounds);

    return NextResponse.json({
      success: true,
      publicHost: xui.getPublicHost(),
      xuiConfig: {
        baseUrl: config.baseUrl,
        username: config.username,
        publicHost: config.publicHost,
        autoSync: config.autoSync ?? true,
        syncIntervalSec: config.syncIntervalSec || 30,
        lastSyncedAt: new Date().toISOString(),
        lastStatus: 'CONNECTED',
        lastLatencyMs: latencyMs,
      },
      summary,
      inbounds: formattedInbounds,
    });
  } catch (error: any) {
    console.error('Error in admin v2ray API:', error);
    const config = await adminStore.getXuiConfig();
    await adminStore.updateXuiConfig({
      lastStatus: 'ERROR',
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to communicate with 3x-ui server',
        xuiConfig: {
          baseUrl: config.baseUrl,
          username: config.username,
          publicHost: config.publicHost,
          autoSync: config.autoSync ?? true,
          syncIntervalSec: config.syncIntervalSec || 30,
          lastStatus: 'ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // 1. Connect & Auto-Sync 3x-ui Panel Credentials
    if (action === 'connect_xui') {
      if (guard.user.role !== 'owner') {
        return NextResponse.json({ error: 'Only the owner can reconnect the 3x-ui panel' }, { status: 403 });
      }

      // The panel URL, username and password come ONLY from server config (env / stored config).
      // Accepting them from the request would let a caller point the server (and its stored
      // panel password) at an arbitrary host. Rotate credentials via XUI_* env vars.
      const current = await adminStore.getXuiConfig();
      const baseUrl = current.baseUrl.trim().replace(/\/$/, '');
      const username = current.username.trim();
      const password = current.password || '';
      const publicHost = current.publicHost.trim();
      const autoSync = body.autoSync !== undefined ? Boolean(body.autoSync) : current.autoSync;
      const syncIntervalSec = Number(body.syncIntervalSec) || current.syncIntervalSec || 30;

      xui.updateConfig({
        baseUrl,
        username,
        password,
        publicHost,
      });

      const test = await xui.testConnection();
      if (!test.success) {
        await adminStore.updateXuiConfig({
          baseUrl,
          username,
          password,
          publicHost,
          autoSync,
          syncIntervalSec,
          lastStatus: 'ERROR',
          lastLatencyMs: test.latencyMs,
        });

        return NextResponse.json(
          {
            success: false,
            error: `Failed to authenticate with 3x-ui panel at ${baseUrl}: ${test.error}`,
            latencyMs: test.latencyMs,
          },
          { status: 400 }
        );
      }

      const inbounds = await xui.listInbounds();
      const { inbounds: formattedInbounds, summary } = formatInboundsList(inbounds);

      const saved = await adminStore.updateXuiConfig({
        baseUrl,
        username,
        password,
        publicHost,
        autoSync,
        syncIntervalSec,
        lastSyncedAt: new Date().toISOString(),
        lastStatus: 'CONNECTED',
        lastLatencyMs: test.latencyMs,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully connected & auto-synced with 3x-ui panel (${test.inboundsCount} inbounds active)!`,
        latencyMs: test.latencyMs,
        xuiConfig: {
          baseUrl: saved.baseUrl,
          username: saved.username,
          publicHost: saved.publicHost,
          autoSync: saved.autoSync,
          syncIntervalSec: saved.syncIntervalSec,
          lastSyncedAt: saved.lastSyncedAt,
          lastStatus: saved.lastStatus,
          lastLatencyMs: saved.lastLatencyMs,
        },
        inbounds: formattedInbounds,
        summary,
      });
    }

    // 2. Direct Sync All Action
    if (action === 'sync_all') {
      const config = await adminStore.getXuiConfig();
      xui.updateConfig({
        baseUrl: config.baseUrl,
        username: config.username,
        password: config.password,
        publicHost: config.publicHost,
      });

      const startPing = Date.now();
      const inbounds = await xui.listInbounds();
      const latencyMs = Date.now() - startPing;

      const saved = await adminStore.updateXuiConfig({
        lastSyncedAt: new Date().toISOString(),
        lastStatus: 'CONNECTED',
        lastLatencyMs: latencyMs,
      });

      const { inbounds: formattedInbounds, summary } = formatInboundsList(inbounds);

      return NextResponse.json({
        success: true,
        message: '3x-ui telemetry, inbounds, and clients synchronized successfully.',
        latencyMs,
        xuiConfig: {
          baseUrl: saved.baseUrl,
          username: saved.username,
          publicHost: saved.publicHost,
          autoSync: saved.autoSync,
          syncIntervalSec: saved.syncIntervalSec,
          lastSyncedAt: saved.lastSyncedAt,
          lastStatus: saved.lastStatus,
          lastLatencyMs: saved.lastLatencyMs,
        },
        inbounds: formattedInbounds,
        summary,
      });
    }

    if (action === 'reset_traffic') {
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (!email) {
        return NextResponse.json({ error: 'Client email is required' }, { status: 400 });
      }
      await xui.resetClientTraffic(email);
      return NextResponse.json({
        success: true,
        message: `Bandwidth usage reset to 0 GB for client ${email}`,
      });
    }

    if (action === 'delete_client') {
      if (guard.user.role !== 'owner') {
        return NextResponse.json({ error: 'Only the owner can delete panel clients' }, { status: 403 });
      }
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (!email) {
        return NextResponse.json({ error: 'Client email is required' }, { status: 400 });
      }
      await xui.deleteClient(email);
      return NextResponse.json({
        success: true,
        message: `Client ${email} removed from 3x-ui inbound`,
      });
    }

    if (action === 'client_uri') {
      const uuid = typeof body.uuid === 'string' ? body.uuid.trim() : '';
      const port = Number(body.port) || 443;
      const remark = typeof body.remark === 'string' ? body.remark.slice(0, 120) : '';
      const email = typeof body.email === 'string' ? body.email.slice(0, 120) : '';
      if (!/^[0-9a-f-]{32,36}$/i.test(uuid)) {
        return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
      }
      const hint = `${remark} ${email}`.toLowerCase();
      let sni = 'zoom.us';
      if (hint.includes('netflix')) sni = 'api.netflix.com';
      else if (hint.includes('tiktok')) sni = 'm.tiktok.com';
      else if (hint.includes('facebook') || hint.includes('social')) sni = 'm.facebook.com';
      else if (hint.includes('youtube')) sni = 'm.youtube.com';
      else if (hint.includes('meet')) sni = 'meet.google.com';
      else if (port === 444) sni = 'api.netflix.com';
      const vlessUri = `vless://${uuid}@${xui.getPublicHost()}:${port}?type=ws&security=tls&path=%2F&sni=${sni}#${encodeURIComponent(remark || email)}`;
      return NextResponse.json({ success: true, vlessUri });
    }

    if (action === 'create_client') {
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const inboundId = Number(body.inboundId) || 3;
      const totalGB = Number(body.totalGB) || 100;
      const expiryDays = Number(body.expiryDays) || 30;
      const customSni =
        (typeof body.customSni === 'string' && body.customSni.trim().slice(0, 100)) ||
        INBOUND_DEFINITIONS[inboundId]?.defaultSni ||
        'zoom.us';
      const remark = body.remark || 'Fibez-Manual-Node';

      if (!email) {
        return NextResponse.json({ error: 'Email identifier is required' }, { status: 400 });
      }

      const generatedUuid = crypto.randomUUID();
      const client = await xui.createClient({
        email,
        uuid: generatedUuid,
        inboundId,
        totalGB: totalGB > 0 ? totalGB * 1024 * 1024 * 1024 : 0,
        expiryDays,
        limitIp: 2,
        comment: `Admin Quick Provision: ${email}`,
      });

      // Map inboundId to port
      let port = 443;
      if (inboundId === 1) port = 445;
      else if (inboundId === 2) port = 444;
      else if (inboundId === 4) port = 4445;

      const vlessUri = buildVlessUri({
        uuid: client.uuid,
        host: xui.getPublicHost(),
        port,
        sni: customSni,
        remark,
      });

      return NextResponse.json({
        success: true,
        message: `Client ${email} created successfully on Inbound ${inboundId}!`,
        client,
        vlessUri,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling admin v2ray action:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
