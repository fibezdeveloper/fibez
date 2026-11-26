import { auditLog } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dal';
import { PAGE_DEFS, getMotionSettings, getPageFlags, setMotionSettings, setPageFlags } from '@/lib/site-config';

export async function GET() {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;
  const [pages, motion] = await Promise.all([getPageFlags(), getMotionSettings()]);
  return NextResponse.json({ pages, motion, defs: PAGE_DEFS, role: guard.user.role });
}

// Owner only: this decides what visitors can reach.
export async function POST(req: NextRequest) {
  const guard = await requireRole(['owner']);
  if ('response' in guard) return guard.response;
  const body = await req.json().catch(() => ({}));
  if (body?.motion && typeof body.motion === 'object') {
    const motion = await setMotionSettings(body.motion, guard.user.email);
    await auditLog(guard.user, 'MOTION_SETTINGS_UPDATED', 'SETTINGS', 'site_motion', { motion }, req);
    return NextResponse.json({ success: true, motion });
  }
  const incoming = body?.pages && typeof body.pages === 'object' ? body.pages : {};
  const flags = await setPageFlags(incoming, guard.user.email);
  await auditLog(guard.user, 'SITE_PAGES_UPDATED', 'SETTINGS', 'site_pages', { pages: flags }, req);
  return NextResponse.json({ success: true, pages: flags });
}
