import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { buildRlsContext, requireRole } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole(['admin', 'owner']);
    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key')?.trim() || '';

    const result = await withRlsTransaction(buildRlsContext(authResult.user), async (client) => {
      if (key) {
        const rows = await client.query(
          `SELECT key, value FROM public.store_settings WHERE key = $1 LIMIT 1`,
          [key]
        );
        if (rows.rows.length === 0) {
          return { notFound: true as const };
        }
        return { single: rows.rows[0] };
      }

      const rows = await client.query(`SELECT key, value FROM public.store_settings`);
      const settingsMap: Record<string, unknown> = {};
      for (const r of rows.rows) {
        settingsMap[r.key] = r.value;
      }
      return { all: settingsMap };
    });

    if ('notFound' in result) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }
    if ('single' in result) {
      return NextResponse.json({ key: result.single.key, value: result.single.value });
    }

    return NextResponse.json({ settings: result.all });
  } catch (error: unknown) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireRole(['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;

    const body = await request.json().catch(() => ({}));
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    const value = body.value;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    await withRlsTransaction(buildRlsContext(actor), async (client) => {
      await client.query(
        `INSERT INTO public.store_settings (key, value, updated_at, updated_by)
         VALUES ($1, $2::jsonb, NOW(), $3)
         ON CONFLICT (key) DO UPDATE SET
           value = EXCLUDED.value,
           updated_at = NOW(),
           updated_by = EXCLUDED.updated_by`,
        [key, JSON.stringify(value), actor.email]
      );

      await client.query(
        `INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, 'SETTING_UPDATED', 'STORE_SETTINGS', $4, $5::jsonb)`,
        [
          `audit_setting_${crypto.randomUUID()}`,
          actor.id,
          actor.email,
          key,
          JSON.stringify({ key }),
        ]
      );
    });

    return NextResponse.json({ success: true, key });
  } catch (error: unknown) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
