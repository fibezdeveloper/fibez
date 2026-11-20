import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { uploadObject, getObjectDownloadUrl, BUCKET_NAME } from '@/lib/storage';
import { requireRole } from '@/lib/dal';

const ALLOWED_FOLDERS = new Set(['slips']);

const ALLOWED_MIME_EXT: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
};

// Guests must be able to upload a payment slip at checkout, so this endpoint stays open,
// but it is rate-limited per IP and verifies the real file signature (not just the
// client-declared MIME type / extension).
const UPLOAD_MAX_PER_WINDOW = 8;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;
const uploadHits = new Map<string, { count: number; resetAt: number }>();

function uploadRateLimited(ip: string): boolean {
  const now = Date.now();
  if (uploadHits.size > 5000) {
    for (const [k, v] of uploadHits) if (v.resetAt <= now) uploadHits.delete(k);
  }
  const entry = uploadHits.get(ip);
  if (!entry || entry.resetAt <= now) {
    uploadHits.set(ip, { count: 1, resetAt: now + UPLOAD_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > UPLOAD_MAX_PER_WINDOW;
}

function matchesSignature(mime: string, b: Buffer): boolean {
  const startsWith = (...bytes: number[]) => bytes.every((v, i) => b[i] === v);
  switch (mime) {
    case 'image/jpeg':
      return startsWith(0xff, 0xd8, 0xff);
    case 'image/png':
      return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case 'image/gif':
      return b.subarray(0, 6).toString('ascii') === 'GIF87a' || b.subarray(0, 6).toString('ascii') === 'GIF89a';
    case 'image/webp':
      return b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP';
    case 'application/pdf':
      return b.subarray(0, 5).toString('ascii') === '%PDF-';
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip')?.trim() ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      'unknown';
    if (uploadRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string) || 'slips';
    const folder = ALLOWED_FOLDERS.has(rawFolder) ? rawFolder : 'slips';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const allowedExts = ALLOWED_MIME_EXT[file.type];
    if (!allowedExts) {
      return NextResponse.json(
        { error: 'Only images (JPEG, PNG, WEBP, GIF) and PDFs are allowed' },
        { status: 400 }
      );
    }

    const extMatch = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
    if (!extMatch || !allowedExts.includes(extMatch)) {
      return NextResponse.json(
        { error: 'File extension does not match file content type' },
        { status: 400 }
      );
    }

    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${cleanFilename}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!matchesSignature(file.type, buffer)) {
      return NextResponse.json(
        { error: 'File contents do not match the declared file type' },
        { status: 400 }
      );
    }

    let presignedViewUrl = '';
    let storageUrl = '';

    try {
      storageUrl = await uploadObject({
        key,
        body: buffer,
        contentType: file.type,
        bucket: BUCKET_NAME,
      });
      presignedViewUrl = await getObjectDownloadUrl(key, BUCKET_NAME, 7 * 24 * 60 * 60);
    } catch (s3Err: unknown) {
      // Local filesystem fallback is for development only; never write public files in production.
      if (process.env.NODE_ENV === 'production') {
        console.error('Object storage upload failed:', s3Err);
        return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
      }
      const fs = await import('fs');
      const path = await import('path');
      const localUploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      if (!fs.existsSync(localUploadDir)) {
        fs.mkdirSync(localUploadDir, { recursive: true });
      }
      const localFilePath = path.join(localUploadDir, path.basename(key));
      fs.writeFileSync(localFilePath, buffer);
      presignedViewUrl = `/uploads/${folder}/${path.basename(key)}`;
      storageUrl = presignedViewUrl;
    }

    return NextResponse.json({
      success: true,
      key,
      url: presignedViewUrl,
      rawStorageUrl: storageUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (error: unknown) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to storage' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole(['admin', 'owner']);
    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key')?.trim() || '';

    if (!key || key.includes('..') || !key.startsWith('slips/')) {
      return NextResponse.json({ error: 'Valid storage key is required' }, { status: 400 });
    }

    const presignedUrl = await getObjectDownloadUrl(key, BUCKET_NAME, 3600);
    return NextResponse.json({ success: true, url: presignedUrl });
  } catch (error: unknown) {
    console.error('Failed to get signed download URL:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve storage object' },
      { status: 500 }
    );
  }
}
