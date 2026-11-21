import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { buildRlsContext, isStaffRole, requireAuth } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';
import { rateLimit } from '@/lib/rate-limit';
import { uploadObject, getObjectBytes, BUCKET_NAME } from '@/lib/storage';
import { ATTACHMENT_MIME_EXT, MAX_ATTACHMENT_BYTES, mimeFromKey } from '@/lib/ticket-attachments';

// Local development without object storage keeps files here (never inside /public).
const DEV_DIR = '.local-uploads';

function matchesSignature(mime: string, b: Buffer): boolean {
  const startsWith = (...bytes: number[]) => bytes.every((v, i) => b[i] === v);
  const ascii = (from: number, to: number) => b.subarray(from, to).toString('ascii');
  switch (mime) {
    case 'image/jpeg':
      return startsWith(0xff, 0xd8, 0xff);
    case 'image/png':
      return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case 'image/gif':
      return ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a';
    case 'image/webp':
      return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
    case 'video/mp4':
    case 'video/quicktime':
      return ascii(4, 8) === 'ftyp';
    case 'video/webm':
      return startsWith(0x1a, 0x45, 0xdf, 0xa3);
    case 'application/pdf':
      return ascii(0, 5) === '%PDF-';
    default:
      return false;
  }
}

// Upload one attachment. Any signed-in user may upload (so they can attach before sending);
// the file only becomes visible to others once it is referenced by a ticket message.
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('response' in authResult) return authResult.response;
    const actor = authResult.user;

    const rl = await rateLimit('ticket-attach', actor.id, 30, 3600);
    if (rl.limited) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait a few minutes and try again.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (file.size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json({ error: 'File is too large. Maximum is 4 MB.' }, { status: 413 });
    }

    const allowedExts = ATTACHMENT_MIME_EXT[file.type];
    const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
    if (!allowedExts || !allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: 'Only screenshots (JPG, PNG, WEBP, GIF), clips (MP4, MOV, WEBM) and PDF invoices are allowed.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesSignature(file.type, buffer)) {
      return NextResponse.json({ error: 'File contents do not match the file type.' }, { status: 400 });
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(-80);
    const key = `tickets/${actor.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${cleanName}`;

    try {
      await uploadObject({ key, body: buffer, contentType: file.type, bucket: BUCKET_NAME });
    } catch (s3Err) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Ticket attachment upload failed:', s3Err);
        return NextResponse.json({ error: 'Failed to store the file. Try again.' }, { status: 500 });
      }
      const fs = await import('fs');
      const path = await import('path');
      const target = path.join(process.cwd(), DEV_DIR, key);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, buffer);
    }

    return NextResponse.json({ success: true, attachment: { key, name: file.name, type: file.type, size: file.size } });
  } catch (error: unknown) {
    console.error('Ticket attachment upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// Stream an attachment. Allowed for its uploader, for the ticket's customer, and for staff.
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('response' in authResult) return authResult.response;
    const actor = authResult.user;

    const key = new URL(request.url).searchParams.get('key')?.trim() || '';
    const mime = mimeFromKey(key);
    if (!key || key.length > 300 || key.includes('..') || !key.startsWith('tickets/') || !mime) {
      return NextResponse.json({ error: 'Valid attachment key is required' }, { status: 400 });
    }

    // Uploader may preview their own files before sending. Everyone else needs a visible message that
    // references the key; row-level security limits that to the ticket's customer and staff.
    let allowed = key.startsWith(`tickets/${actor.id}/`) || isStaffRole(actor.role);
    if (!allowed) {
      allowed = await withRlsTransaction(buildRlsContext(actor), async (client) => {
        const res = await client.query(
          `SELECT 1 FROM public.ticket_messages WHERE attachments @> $1::jsonb LIMIT 1`,
          [JSON.stringify([{ key }])]
        );
        return res.rows.length > 0;
      });
    }
    if (!allowed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let bytes: Uint8Array;
    try {
      bytes = await getObjectBytes(key);
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Ticket attachment fetch failed:', err);
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const fs = await import('fs');
      const path = await import('path');
      const target = path.join(process.cwd(), DEV_DIR, key);
      if (!fs.existsSync(target)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      bytes = fs.readFileSync(target);
    }

    const headers: Record<string, string> = {
      'Content-Type': mime,
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, max-age=3600',
      'Accept-Ranges': 'bytes',
    };

    // Browsers request byte ranges to play and seek video.
    const range = request.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);
    if (range && (range[1] || range[2])) {
      const total = bytes.byteLength;
      let start = range[1] ? parseInt(range[1], 10) : total - parseInt(range[2], 10);
      let end = range[1] && range[2] ? parseInt(range[2], 10) : total - 1;
      start = Math.max(0, start);
      end = Math.min(total - 1, end);
      if (start > end || start >= total) {
        return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
      }
      const slice = bytes.slice(start, end + 1);
      return new NextResponse(slice as unknown as BodyInit, {
        status: 206,
        headers: {
          ...headers,
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Content-Length': String(slice.byteLength),
        },
      });
    }

    return new NextResponse(bytes as unknown as BodyInit, {
      status: 200,
      headers: { ...headers, 'Content-Length': String(bytes.byteLength) },
    });
  } catch (error: unknown) {
    console.error('Ticket attachment download error:', error);
    return NextResponse.json({ error: 'Failed to load attachment' }, { status: 500 });
  }
}
