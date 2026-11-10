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

export async function POST(request: NextRequest) {
  try {
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

    const storageUrl = await uploadObject({
      key,
      body: buffer,
      contentType: file.type,
      bucket: BUCKET_NAME,
    });

    const presignedViewUrl = await getObjectDownloadUrl(key, BUCKET_NAME, 7 * 24 * 60 * 60);

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
