import { connection, NextResponse } from 'next/server';
import { getHiddenProductIds, getMotionSettings, getPageFlags } from '@/lib/site-config';

// Public: which sections are open. Used by the navbar and home page to hide switched-off links.
export async function GET() {
  await connection(); // always read at request time, never frozen into the build
  const [flags, hidden, motion] = await Promise.all([getPageFlags(), getHiddenProductIds(), getMotionSettings()]);
  return NextResponse.json({ pages: flags, hiddenProducts: [...hidden], motion }, { headers: { 'Cache-Control': 'no-store' } });
}
