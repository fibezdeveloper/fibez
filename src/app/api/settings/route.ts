import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const rows = await sql`SELECT * FROM store_settings WHERE key = ${key} LIMIT 1`;
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }
      return NextResponse.json({ key: rows[0].key, value: rows[0].value });
    }

    const rows = await sql`SELECT * FROM store_settings`;
    const settingsMap: Record<string, any> = {};
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { key, value, updatedBy } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    await sql`
      INSERT INTO store_settings (key, value, updated_at, updated_by)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW(), ${updatedBy || null})
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW(),
        updated_by = EXCLUDED.updated_by;
    `;

    // Audit log
    await sql`
      INSERT INTO audit_logs (id, user_email, action, entity_type, entity_id, details)
      VALUES (
        ${`audit_setting_${key}_${Date.now()}`}, ${updatedBy || 'owner@fibez.io'}, 'SETTING_UPDATED', 'STORE_SETTINGS', ${key},
        ${JSON.stringify({ key, value })}::jsonb
      )
    `;

    return NextResponse.json({ success: true, key });
  } catch (error: any) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: error.message || 'Failed to update setting' }, { status: 500 });
  }
}
