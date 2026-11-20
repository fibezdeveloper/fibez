'use client';

/**
 * Browser-side device signals for the free-trial anti-abuse check.
 * deviceId: random id kept in localStorage. fp: hash of stable hardware/browser traits.
 * Neither is secret or a guarantee (a determined person can fake both); the server combines
 * them with account, IP and panel HWID limits.
 */
export async function getDeviceSignals(): Promise<{ deviceId: string; fp: string }> {
  let deviceId = '';
  try {
    deviceId = localStorage.getItem('fibez_device_id') || '';
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('fibez_device_id', deviceId);
    }
  } catch {}

  let webgl = '';
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl') || c.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    if (gl && ext) webgl = `${gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)}|${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}`;
  } catch {}

  const nav = navigator as Navigator & { deviceMemory?: number };
  const raw = [
    nav.userAgent,
    nav.language,
    (nav.languages || []).join(','),
    nav.platform,
    nav.hardwareConcurrency,
    nav.deviceMemory,
    screen.width,
    screen.height,
    screen.colorDepth,
    window.devicePixelRatio,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    webgl,
  ].join('||');

  let fp = '';
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    fp = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {}
  return { deviceId, fp };
}