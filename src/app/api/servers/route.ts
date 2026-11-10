import { NextRequest, NextResponse } from 'next/server';
import { buildRlsContext, getVerifiedSessionUser, requireRole } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

export async function GET() {
  try {
    const actor = await getVerifiedSessionUser();

    const rows = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      const res = await client.query(`SELECT * FROM public.servers ORDER BY name ASC`);
      return res.rows;
    });

    return NextResponse.json({ servers: rows });
  } catch (error: unknown) {
    console.error('Error fetching servers:', error);
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireRole(['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }

    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id.trim() : '';

    if (!id) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 });
    }

    const cpuUsage = typeof body.cpuUsage === 'string' ? body.cpuUsage : null;
    const ramUsage = typeof body.ramUsage === 'string' ? body.ramUsage : null;
    const bandwidthUsed = typeof body.bandwidthUsed === 'string' ? body.bandwidthUsed : null;
    const status = typeof body.status === 'string' ? body.status : null;
    const pingMs = body.pingMs !== undefined ? Math.max(0, Math.round(Number(body.pingMs))) : null;
    const speedGbps = body.speedGbps !== undefined ? Math.max(0, Number(body.speedGbps)) : null;

    const updated = await withRlsTransaction(buildRlsContext(authResult.user), async (client) => {
      const res = await client.query(
        `UPDATE public.servers
         SET
           cpu_usage = COALESCE($1, cpu_usage),
           ram_usage = COALESCE($2, ram_usage),
           bandwidth_used = COALESCE($3, bandwidth_used),
           status = COALESCE($4, status),
           ping_ms = COALESCE($5, ping_ms),
           speed_gbps = COALESCE($6, speed_gbps),
           updated_at = NOW()
         WHERE id = $7
         RETURNING id`,
        [cpuUsage, ramUsage, bandwidthUsed, status, pingMs, speedGbps, id]
      );
      return res.rows.length > 0;
    });

    if (!updated) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    console.error('Error updating server:', error);
    return NextResponse.json({ error: 'Failed to update server' }, { status: 500 });
  }
}
