import crypto from 'crypto';

/** Collapse Gmail aliases so a@gmail.com, a.b@gmail.com and a+x@gmail.com are ONE person. */
export function canonicalEmail(email: string): string {
  const [rawLocal, rawDomain] = email.trim().toLowerCase().split('@');
  if (!rawLocal || !rawDomain) return email.trim().toLowerCase();
  const domain = rawDomain === 'googlemail.com' ? 'gmail.com' : rawDomain;
  let local = rawLocal.split('+')[0];
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

export function hashSignal(value: string): string {
  return value ? crypto.createHash('sha256').update(value).digest('hex').slice(0, 32) : '';
}

export function requestIp(headers: Headers): string {
  return (
    headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip')?.trim() ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}