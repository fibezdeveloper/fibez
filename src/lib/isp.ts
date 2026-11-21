/**
 * Best-effort Sri Lankan carrier guess from an IP prefix. Returns null when the range is not one we
 * recognise: this is a hint for display, never something to enforce on.
 */
const RANGES: [string, string][] = [
  ['112.134.', 'Dialog'],
  ['112.135.', 'Dialog'],
  ['175.157.', 'Dialog'],
  ['122.255.', 'SLT'],
  ['203.94.', 'SLT'],
  ['124.43.', 'SLT'],
  ['123.231.', 'Airtel'],
  ['103.247.', 'Airtel'],
  ['116.206.', 'Hutch'],
  ['122.155.', 'Hutch'],
  ['192.248.', 'Mobitel'],
];

export function ispFromIp(ip: string): string | null {
  const hit = RANGES.find(([prefix]) => ip.startsWith(prefix));
  return hit ? hit[1] : null;
}
