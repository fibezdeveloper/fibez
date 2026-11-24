/**
 * Post-login redirect targets must stay on this site. Accept only a same-site path:
 * one leading slash, no double slash or slash-backslash (protocol-relative), no scheme,
 * no backslashes or control characters. Anything else falls back to the fallback path.
 * Blocks open redirects such as /login?callbackUrl=https://evil.example.
 */
const BACKSLASH = String.fromCharCode(92);

export function safeCallbackPath(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw || typeof raw !== 'string') return fallback;
  const v = raw.trim();
  if (!v.startsWith('/') || v.startsWith('//')) return fallback;
  if (v.includes(BACKSLASH)) return fallback;
  for (let i = 0; i < v.length; i++) {
    const code = v.charCodeAt(i);
    if (code < 32 || code === 127) return fallback;
  }
  return v;
}
