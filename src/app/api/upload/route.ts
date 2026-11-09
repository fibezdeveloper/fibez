import { NextRequest, NextResponse } from 'next/server';
import { uploadObject, getObjectDownloadUrl, BUCKET_NAME } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'slips';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Limit to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Validate mime types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only images (JPEG, PNG, WEBP) and PDFs are allowed' },
        { status: 400 }
      );
    }

    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${Date.now()}-${cleanFilename}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Neon Object Storage
    const storageUrl = await uploadObject({
      key,
      body: buffer,
      contentType: file.type,
      bucket: BUCKET_NAME,
    });

    // Generate a presigned view URL valid for 7 days
    const presignedViewUrl = await getObjectDownloadUrl(key, BUCKET_NAME, 7 * 24 * 60 * 60);

    return NextResponse.json({
      success: true,
      key,
      url: presignedViewUrl,
      rawStorageUrl: storageUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file to storage' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Storage key is required' }, { status: 400 });
    }

    const presignedUrl = await getObjectDownloadUrl(key, BUCKET_NAME, 3600);
    return NextResponse.json({ success: true, url: presignedUrl });
  } catch (error: any) {
    console.error('Failed to get signed download URL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve storage object' },
      { status: 500 }
    );
  }
}
