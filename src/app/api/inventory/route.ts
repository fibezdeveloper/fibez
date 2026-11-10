import * as crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { buildRlsContext, requireRole } from '@/lib/dal';
import { withRlsTransaction } from '@/lib/db/rls';

const VALID_STOCK_TYPES = new Set([
  'SERIAL_KEY',
  'ACCOUNT_CREDENTIALS',
  'CONNECTION_CONFIG',
  'CUSTOM_TOKEN',
]);

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole(['admin', 'owner']);
    if ('response' in authResult) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId')?.trim() || '';

    const items = await withRlsTransaction(buildRlsContext(authResult.user), async (client) => {
      if (productId) {
        const res = await client.query(
          `SELECT * FROM public.inventory_items WHERE product_id = $1 ORDER BY created_at DESC LIMIT 100`,
          [productId]
        );
        return res.rows;
      }

      const res = await client.query(
        `SELECT * FROM public.inventory_items WHERE status = 'AVAILABLE' ORDER BY created_at DESC LIMIT 100`
      );
      return res.rows;
    });

    return NextResponse.json({ items });
  } catch (error: unknown) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole(['admin', 'owner']);
    if ('response' in authResult) {
      return authResult.response;
    }
    const actor = authResult.user;

    const body = await request.json().catch(() => ({}));
    const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
    const stockType =
      typeof body.stockType === 'string' && VALID_STOCK_TYPES.has(body.stockType)
        ? body.stockType
        : 'SERIAL_KEY';
    const entries: unknown[] = Array.isArray(body.entries) ? body.entries : [];

    if (!productId || entries.length === 0 || entries.length > 500) {
      return NextResponse.json(
        { error: 'productId and non-empty entries array (max 500) are required' },
        { status: 400 }
      );
    }

    const inserted = await withRlsTransaction(buildRlsContext(actor), async (client) => {
      let count = 0;

      for (const rawEntry of entries) {
        const entry = String(rawEntry).trim();
        if (!entry) continue;

        const invId = `inv_${crypto.randomUUID()}`;
        let credUser: string | null = null;
        let credPass: string | null = null;

        if (stockType === 'ACCOUNT_CREDENTIALS' && entry.includes(':')) {
          const [u, ...rest] = entry.split(':');
          credUser = u.trim();
          credPass = rest.join(':').trim();
        }

        await client.query(
          `INSERT INTO public.inventory_items (
             id, product_id, stock_type, key_payload, credential_user, credential_pass, status
           ) VALUES ($1, $2, $3, $4, $5, $6, 'AVAILABLE')`,
          [invId, productId, stockType, entry, credUser, credPass]
        );
        count++;
      }

      if (count > 0) {
        await client.query(
          `INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details)
           VALUES ($1, $2, $3, 'INVENTORY_ADDED', 'INVENTORY', $4, $5::jsonb)`,
          [
            `audit_inv_${crypto.randomUUID()}`,
            actor.id,
            actor.email,
            productId,
            JSON.stringify({ stockType, insertedCount: count }),
          ]
        );
      }

      return count;
    });

    return NextResponse.json({ success: true, inserted });
  } catch (error: unknown) {
    console.error('Error adding inventory:', error);
    return NextResponse.json({ error: 'Failed to add inventory' }, { status: 500 });
  }
}
