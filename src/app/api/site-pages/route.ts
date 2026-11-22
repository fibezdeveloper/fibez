import { connection, NextResponse } from 'next/server';
import { getHiddenProductIds, getPageFlags } from '@/lib/site-config';

// Public: which sections are open. Used by the navbar and home page to hide switched-off links.
export async function GET() {
  await connection(); // always read at request time, never frozen into the build
  const [flags, hidden] = await Promise.all([getPageFlags(), getHiddenProductIds()]);
  return NextResponse.json({ pages: flags, hiddenProducts: [...hidden] }, { headers: { 'Cache-Control': 'no-store' } });
}
