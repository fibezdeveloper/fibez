import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const rows = await sql`SELECT * FROM servers ORDER BY name ASC`;
    return NextResponse.json({ servers: rows });
  } catch (error: any) {
    console.error('Error fetching servers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch servers' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { id, cpuUsage, ramUsage, bandwidthUsed, status, pingMs, speedGbps } = body;

    if (!id) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 });
    }

    await sql`
      UPDATE servers
      SET
        cpu_usage = COALESCE(${cpuUsage}, cpu_usage),
        ram_usage = COALESCE(${ramUsage}, ram_usage),
        bandwidth_used = COALESCE(${bandwidthUsed}, bandwidth_used),
        status = COALESCE(${status}, status),
        ping_ms = COALESCE(${pingMs}, ping_ms),
        speed_gbps = COALESCE(${speedGbps}, speed_gbps),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error updating server:', error);
    return NextResponse.json({ error: error.message || 'Failed to update server' }, { status: 500 });
  }
}
