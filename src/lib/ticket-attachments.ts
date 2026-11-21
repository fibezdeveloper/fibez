// Shared (client + server) rules for support-ticket attachments. No Node-only imports here.

export interface TicketAttachment {
  key: string;
  name: string;
  type: string;
  size: number;
}

// Vercel rejects request bodies over 4.5 MB, so one file per request must stay under that.
export const MAX_ATTACHMENT_BYTES = 4 * 1000 * 1000;
export const MAX_ATTACHMENTS_PER_MESSAGE = 4;

export const ATTACHMENT_MIME_EXT: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'video/mp4': ['.mp4', '.m4v'],
  'video/quicktime': ['.mov'],
  'video/webm': ['.webm'],
  'application/pdf': ['.pdf'],
};

const EXT_TO_MIME: Record<string, string> = {};
for (const [mime, exts] of Object.entries(ATTACHMENT_MIME_EXT)) {
  for (const ext of exts) EXT_TO_MIME[ext] = mime;
}

export function mimeFromKey(key: string): string | null {
  const ext = key.toLowerCase().match(/\.[^./]+$/)?.[0] || '';
  return EXT_TO_MIME[ext] ?? null;
}

export const ATTACHMENT_ACCEPT = Object.keys(ATTACHMENT_MIME_EXT).join(',');

export function isVideoType(type: string): boolean {
  return type.startsWith('video/');
}

export function isPdfType(type: string): boolean {
  return type === 'application/pdf';
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function attachmentUrl(key: string): string {
  return `/api/tickets/attachments?key=${encodeURIComponent(key)}`;
}

/**
 * Validate attachment metadata sent by a client. Keys must live under the sender's own folder, so one
 * user cannot attach another user's uploaded file to their message.
 */
export function parseAttachments(raw: unknown, ownerId: string): TicketAttachment[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_ATTACHMENTS_PER_MESSAGE) return null;

  const out: TicketAttachment[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const key = typeof (item as TicketAttachment).key === 'string' ? (item as TicketAttachment).key : '';
    if (!key || key.length > 300 || key.includes('..') || !key.startsWith(`tickets/${ownerId}/`)) return null;
    if (seen.has(key)) return null;
    seen.add(key);
    const type = mimeFromKey(key);
    if (!type) return null;
    const rawName = typeof (item as TicketAttachment).name === 'string' ? (item as TicketAttachment).name : 'attachment';
    const size = Number((item as TicketAttachment).size);
    out.push({
      key,
      name: rawName.replace(/[^\w.\- ()]/g, '_').slice(0, 120) || 'attachment',
      type,
      size: Number.isFinite(size) && size > 0 && size <= MAX_ATTACHMENT_BYTES ? Math.floor(size) : 0,
    });
  }
  return out;
}
