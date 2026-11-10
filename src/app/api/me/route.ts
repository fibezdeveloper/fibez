import { NextResponse } from 'next/server';
import { getVerifiedSessionUser } from '@/lib/dal';

export async function GET() {
  const user = await getVerifiedSessionUser();

  return NextResponse.json(
    { user },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
