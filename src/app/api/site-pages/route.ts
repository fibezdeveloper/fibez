import { NextResponse } from 'next/server';
import { getPageFlags } from '@/lib/site-config';

// Public: which sections are open. Used by the navbar and home page to hide switched-off links.
export async function GET() {
  const flags = await getPageFlags();
  return NextResponse.json({ pages: flags }, { headers: { 'Cache-Control': 'no-store' } });
}
