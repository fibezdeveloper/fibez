// Client-safe VLESS URI helpers. Contains no routing data (SNI tables live in server-only modules).

/**
 * Builds the customized VLESS URI for a client
 */
export function buildVlessUri({
  uuid,
  host = process.env.XUI_PUBLIC_HOST || 'rv2ray.fibez.store',
  port,
  sni,
  remark,
  fingerprint = 'chrome',
}: {
  uuid: string;
  host?: string;
  port: number;
  sni: string;
  remark: string;
  fingerprint?: string;
}): string {
  const encodedRemark = encodeURIComponent(remark);
  return `vless://${uuid}@${host}:${port}?type=tcp&security=tls&sni=${sni}&fp=${fingerprint}#${encodedRemark}`;
}

export interface ParsedVlessUri {
  uuid: string;
  host: string;
  port: number;
  sni: string;
  type: string;
  security: string;
  remark: string;
  fingerprint: string;
}

/**
 * Parses any incoming VLESS URI to extract UUID, host, port, SNI and remark
 */
export function parseVlessUri(vlessUri: string): ParsedVlessUri | null {
  try {
    const raw = vlessUri.trim();
    if (!raw.startsWith('vless://')) return null;

    const withoutProto = raw.slice(8);
    const atIdx = withoutProto.indexOf('@');
    if (atIdx === -1) return null;

    const uuid = withoutProto.slice(0, atIdx);
    const remainder = withoutProto.slice(atIdx + 1);

    const hashIdx = remainder.indexOf('#');
    const remark = hashIdx !== -1 ? decodeURIComponent(remainder.slice(hashIdx + 1)) : '';
    const mainPart = hashIdx !== -1 ? remainder.slice(0, hashIdx) : remainder;

    const questionIdx = mainPart.indexOf('?');
    const hostPort = questionIdx !== -1 ? mainPart.slice(0, questionIdx) : mainPart;
    const queryString = questionIdx !== -1 ? mainPart.slice(questionIdx + 1) : '';

    const colonIdx = hostPort.lastIndexOf(':');
    const host = colonIdx !== -1 ? hostPort.slice(0, colonIdx) : hostPort;
    const port = colonIdx !== -1 ? parseInt(hostPort.slice(colonIdx + 1), 10) : 443;

    const params = new URLSearchParams(queryString);
    const sni = params.get('sni') || params.get('host') || host;
    const type = params.get('type') || 'tcp';
    const security = params.get('security') || 'tls';
    const fingerprint = params.get('fp') || 'chrome';

    return {
      uuid,
      host,
      port: isNaN(port) ? 443 : port,
      sni,
      type,
      security,
      remark,
      fingerprint,
    };
  } catch (e) {
    console.error('Error parsing VLESS URI:', e);
    return null;
  }
}
