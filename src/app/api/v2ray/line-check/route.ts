import net from 'net';
import tls from 'tls';
import { NextRequest, NextResponse } from 'next/server';
import { xui } from '@/lib/xui';

/**
 * Real, server-side line probe.
 *
 * What it actually measures (from the Fibez server, NOT from the visitor's device/ISP):
 *   1. TCP connect time to the node's host:port
 *   2. TLS handshake time using the config's SNI
 * It does not (and cannot) measure the visitor's own ISP path, throughput or packet loss,
 * so none of those are reported.
 *
 * Targets are restricted to Fibez-owned hosts so this endpoint cannot be used as an open
 * port scanner / SSRF proxy, and calls are rate-limited per IP.
 */

const PROBE_TIMEOUT_MS = 5000;
const MAX_PER_WINDOW = 15;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

interface ParsedConfig {
  protocol: string;
  host: string;
  port: number;
  sni: string;
  security: string;
  remark: string;
}

function parseConfigUri(raw: string): ParsedConfig | null {
  try {
    const trimmed = raw.trim();
    const schemes: Record<string, string> = {
      'vless://': 'vless',
      'vmess://': 'vmess',
      'hy2://': 'hysteria2',
      'hysteria2://': 'hysteria2',
    };
    const scheme = Object.keys(schemes).find((s) => trimmed.toLowerCase().startsWith(s));
    if (!scheme) return null;

    const url = new URL(trimmed);
    const params = url.searchParams;
    const protocol = schemes[scheme];
    const host = url.hostname;
    const port = parseInt(url.port || (protocol === 'vless' ? '443' : '20000'), 10);
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535) return null;

    let remark = 'Node';
    try {
      remark = decodeURIComponent(url.hash ? url.hash.replace('#', '') : 'Node').slice(0, 80);
    } catch {}

    return {
      protocol,
      host,
      port,
      sni: params.get('sni') || params.get('peer') || host,
      security: params.get('security') || 'none',
      remark,
    };
  } catch {
    return null;
  }
}

function isAllowedHost(host: string): boolean {
  const h = host.toLowerCase();
  const publicHost = xui.getPublicHost().toLowerCase();
  return h === publicHost || h === 'fibez.store' || h.endsWith('.fibez.store');
}

function tcpProbe(host: string, port: number): Promise<{ ok: boolean; ms: number; error?: string }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = net.connect({ host, port });
    const done = (ok: boolean, error?: string) => {
      socket.destroy();
      resolve({ ok, ms: Date.now() - start, error });
    };
    socket.setTimeout(PROBE_TIMEOUT_MS, () => done(false, 'timed out'));
    socket.once('connect', () => done(true));
    socket.once('error', (e: NodeJS.ErrnoException) => done(false, e.code || e.message));
  });
}

function tlsProbe(host: string, port: number, sni: string): Promise<{ ok: boolean; ms: number; error?: string }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = tls.connect({
      host,
      port,
      // Reality / masquerade nodes present the SNI target's certificate, which will not match
      // our host. We only care that the handshake completes, not about the certificate.
      servername: sni,
      rejectUnauthorized: false,
    });
    const done = (ok: boolean, error?: string) => {
      socket.destroy();
      resolve({ ok, ms: Date.now() - start, error });
    };
    socket.setTimeout(PROBE_TIMEOUT_MS, () => done(false, 'timed out'));
    socket.once('secureConnect', () => done(true));
    socket.once('error', (e: NodeJS.ErrnoException) => done(false, e.code || e.message));
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip')?.trim() ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      'unknown';
    if (rateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many checks. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const input: string = typeof body.configString === 'string' ? body.configString.trim().slice(0, 4000) : '';

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'Please paste a valid vless:// configuration link' },
        { status: 400 }
      );
    }

    const parsed = parseConfigUri(input);
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not read that config. Paste the full vless:// (or vmess:// / hy2://) link from your vault.',
        },
        { status: 400 }
      );
    }

    if (!isAllowedHost(parsed.host)) {
      return NextResponse.json(
        { success: false, error: 'Line check only supports Fibez nodes.' },
        { status: 400 }
      );
    }

    const tcp = await tcpProbe(parsed.host, parsed.port);
    const wantsTls = parsed.security === 'tls' || parsed.security === 'reality' || parsed.port === 443;
    const tlsResult = tcp.ok && wantsTls ? await tlsProbe(parsed.host, parsed.port, parsed.sni) : null;

    const hops = [
      {
        id: 'edge',
        title: 'TCP connection to node',
        subtitle: `${parsed.host}:${parsed.port} (measured from Fibez server)`,
        status: (tcp.ok ? 'pass' : 'fail') as 'pass' | 'fail',
        latencyMs: tcp.ms,
        details: [
          `Protocol: ${parsed.protocol.toUpperCase()}`,
          tcp.ok ? 'Port is open and accepting connections' : `Connection failed: ${tcp.error}`,
        ],
      },
      ...(tlsResult
        ? [
            {
              id: 'isp',
              title: 'TLS handshake',
              subtitle: `SNI: ${parsed.sni}`,
              status: (tlsResult.ok ? 'pass' : 'warning') as 'pass' | 'warning',
              latencyMs: tlsResult.ms,
              details: [
                tlsResult.ok
                  ? 'Handshake completed with the configured SNI'
                  : `Handshake did not complete: ${tlsResult.error}`,
              ],
            },
          ]
        : []),
    ];

    const overallStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED' = !tcp.ok
      ? 'FAILED'
      : tlsResult && !tlsResult.ok
        ? 'DEGRADED'
        : 'HEALTHY';

    const advice =
      overallStatus === 'HEALTHY'
        ? 'The node is reachable from the Fibez server. This does not test your own ISP path: if it still will not connect, check that your ISP package/SNI is active, your client app is up to date, and the config was imported completely.'
        : overallStatus === 'DEGRADED'
          ? 'The node accepts connections but the TLS handshake with this SNI did not finish. Double-check the SNI in your config, or contact support.'
          : 'The Fibez server could not reach this node. Verify the link is copied in full; if it is, contact support.';

    return NextResponse.json({
      success: true,
      diagnostics: {
        timestamp: new Date().toISOString(),
        remark: parsed.remark,
        protocol: parsed.protocol.toUpperCase(),
        targetHost: parsed.host,
        targetSni: parsed.sni,
        targetPort: parsed.port,
        overallStatus,
        totalLatencyMs: tcp.ms + (tlsResult?.ms ?? 0),
        downloadSpeedMbps: null,
        inferredIsp: 'Not measured (probe runs from the Fibez server)',
        hops,
        advice,
      },
    });
  } catch (error) {
    console.error('Line check error:', error);
    return NextResponse.json(
      { success: false, error: 'Diagnostic service failed to evaluate config' },
      { status: 500 }
    );
  }
}
