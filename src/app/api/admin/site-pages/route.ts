import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dal';
import { PAGE_DEFS, getPageFlags, setPageFlags } from '@/lib/site-config';

export async function GET() {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;
  return NextResponse.json({ pages: await getPageFlags(), defs: PAGE_DEFS, role: guard.user.role });
}

// Owner only: this decides what visitors can reach.
export async function POST(req: NextRequest) {
  const guard = await requireRole(['owner']);
  if ('response' in guard) return guard.response;
  const body = await req.json().catch(() => ({}));
  const incoming = body?.pages && typeof body.pages === 'object' ? body.pages : {};
  const flags = await setPageFlags(incoming, guard.user.email);
  return NextResponse.json({ success: true, pages: flags });
}
