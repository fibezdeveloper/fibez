import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { xui } from '@/lib/xui';
import { buildVlessUri } from '@/lib/v2ray-inbounds';
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
  try {
    const config = adminStore.getXuiConfig();
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
    adminStore.updateXuiConfig({
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
    const config = adminStore.getXuiConfig();
    adminStore.updateXuiConfig({
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
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // 1. Connect & Auto-Sync 3x-ui Panel Credentials
    if (action === 'connect_xui') {
      const current = adminStore.getXuiConfig();
      const baseUrl = (body.baseUrl || current.baseUrl || 'https://rv2ray.fibez.store:6767').trim().replace(/\/$/, '');
      const username = (body.username || current.username || 'akain').trim();
      const password = (body.password ? body.password.trim() : (current.password || 'kariwesi'));
      const publicHost = (body.publicHost || current.publicHost || 'rv2ray.fibez.store').trim();
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
        adminStore.updateXuiConfig({
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

      const saved = adminStore.updateXuiConfig({
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
      const config = adminStore.getXuiConfig();
      xui.updateConfig({
        baseUrl: config.baseUrl,
        username: config.username,
        password: config.password,
        publicHost: config.publicHost,
      });

      const startPing = Date.now();
      const inbounds = await xui.listInbounds();
      const latencyMs = Date.now() - startPing;

      const saved = adminStore.updateXuiConfig({
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

    if (action === 'create_client') {
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const inboundId = Number(body.inboundId) || 3;
      const totalGB = Number(body.totalGB) || 100;
      const expiryDays = Number(body.expiryDays) || 30;
      const customSni = body.customSni || 'zoom.us';
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
