import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dal';
import { sql } from '@/lib/db';
import { xui } from '@/lib/xui';
import { auditLog } from '@/lib/audit';
import { runPanelBackup } from '@/lib/panel-backup';
import { rateLimit, tooMany } from '@/lib/rate-limit';

/**
 * Revenue and capacity numbers for Admin -> Insights.
 *   GET ?days=30            sales, refunds, per-package sales, active lines per inbound, wallet balances
 *   POST { action: 'backup_now' }  owner only: run the encrypted panel backup right now
 */
const noStore = { 'Cache-Control': 'no-store' };
// Soft cap on clients per inbound before a warning shows. Set INBOUND_CLIENT_LIMIT in the env to tune it.
const clientLimit = () => Math.max(10, Number(process.env.INBOUND_CLIENT_LIMIT) || 250);

export async function GET(req: NextRequest) {
  const guard = await requireRole(['admin', 'owner']);
  if ('response' in guard) return guard.response;
  if (!sql) return NextResponse.json({ error: 'Database not configured' }, { status: 503, headers: noStore });

  const days = Math.min(365, Math.max(1, Math.floor(Number(new URL(req.url).searchParams.get('days')) || 30)));

  try {
    const [totals, daily, packages, refunds, pending, wallet, lines] = await Promise.all([
      sql`
        SELECT COUNT(*)::int AS orders, COALESCE(SUM(total_amount_lkr), 0)::bigint AS revenue,
               COALESCE(SUM(discount_amount_lkr), 0)::bigint AS discounts
        FROM public.orders
        WHERE payment_status = 'VERIFIED' AND total_amount_lkr > 0 AND created_at >= now() - (${days}::int * interval '1 day')
      `,
      sql`
        SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'Asia/Colombo'), 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS orders, COALESCE(SUM(total_amount_lkr), 0)::bigint AS revenue
        FROM public.orders
        WHERE payment_status = 'VERIFIED' AND total_amount_lkr > 0 AND created_at >= now() - (${days}::int * interval '1 day')
        GROUP BY 1 ORDER BY 1
      `,
      sql`
        SELECT oi.product_title AS title, SUM(oi.quantity)::int AS sold, COALESCE(SUM(oi.subtotal_lkr), 0)::bigint AS revenue
        FROM public.order_items oi JOIN public.orders o ON o.id = oi.order_id
        WHERE o.payment_status = 'VERIFIED' AND o.total_amount_lkr > 0 AND o.created_at >= now() - (${days}::int * interval '1 day')
        GROUP BY 1 ORDER BY revenue DESC LIMIT 25
      `,
      sql`
        SELECT COUNT(*)::int AS orders, COALESCE(SUM(total_amount_lkr), 0)::bigint AS amount
        FROM public.orders
        WHERE payment_status = 'REFUNDED' AND updated_at >= now() - (${days}::int * interval '1 day')
      `,
      sql`
        SELECT (SELECT COUNT(*) FROM public.orders WHERE payment_status = 'PENDING_REVIEW')::int AS orders,
               (SELECT COUNT(*) FROM public.wallet_topups WHERE status = 'PENDING')::int AS topups,
               (SELECT COUNT(*) FROM public.refund_requests WHERE status = 'PENDING')::int AS refunds
      `,
      sql`SELECT COALESCE(SUM(balance_lkr), 0)::bigint AS total, COUNT(*) FILTER (WHERE balance_lkr > 0)::int AS holders FROM public.wallet_accounts`,
      sql`
        SELECT inbound_id, COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active, COUNT(*)::int AS total
        FROM public.panel_clients GROUP BY inbound_id ORDER BY inbound_id
      `,
    ]);

    // Live view from the panel itself (null when the panel cannot be reached right now).
    let panel: { id: number; remark: string; port: number; clients: number; enable: boolean }[] | null = null;
    try {
      const inbounds = await xui.listInbounds();
      panel = inbounds.map((i) => ({ id: i.id, remark: i.remark, port: i.port, clients: i.clientCount, enable: i.enable }));
    } catch {
      panel = null;
    }

    const limit = clientLimit();
    const byInbound = new Map<number, { active: number; total: number }>();
    for (const l of lines as { inbound_id: number | null; active: number; total: number }[]) {
      if (l.inbound_id != null) byInbound.set(Number(l.inbound_id), { active: Number(l.active), total: Number(l.total) });
    }
    const inbounds = (panel ?? []).map((p) => {
      const known = byInbound.get(p.id);
      const used = p.clients;
      const pct = Math.round((used / limit) * 100);
      return {
        id: p.id,
        remark: p.remark,
        port: p.port,
        enable: p.enable,
        panelClients: used,
        activeLines: known?.active ?? 0,
        limit,
        usedPct: pct,
        level: used >= limit ? 'full' : pct >= 80 ? 'warn' : 'ok',
      };
    });

    return NextResponse.json(
      {
        days,
        totals: {
          orders: Number(totals[0].orders),
          revenueLKR: Number(totals[0].revenue),
          discountsLKR: Number(totals[0].discounts),
          avgOrderLKR: Number(totals[0].orders) ? Math.round(Number(totals[0].revenue) / Number(totals[0].orders)) : 0,
        },
        daily: (daily as { day: string; orders: number; revenue: string }[]).map((d) => ({ day: d.day, orders: Number(d.orders), revenueLKR: Number(d.revenue) })),
        packages: (packages as { title: string; sold: number; revenue: string }[]).map((p) => ({ title: p.title, sold: Number(p.sold), revenueLKR: Number(p.revenue) })),
        refunds: { orders: Number(refunds[0].orders), amountLKR: Number(refunds[0].amount) },
        pending: { orders: Number(pending[0].orders), topups: Number(pending[0].topups), refunds: Number(pending[0].refunds) },
        wallets: { totalLKR: Number(wallet[0].total), holders: Number(wallet[0].holders) },
        inbounds,
        panelReachable: panel !== null,
        inboundLimit: limit,
        role: guard.user.role,
      },
      { headers: noStore }
    );
  } catch (err) {
    console.error('Insights failed:', err);
    return NextResponse.json({ error: 'Could not load insights' }, { status: 500, headers: noStore });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['owner']);
  if ('response' in guard) return guard.response;
  const body = await req.json().catch(() => ({}));
  if (body.action !== 'backup_now') return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: noStore });

  const rl = await rateLimit('panel-backup-now', guard.user.id, 3, 3600);
  if (rl.limited) return tooMany(rl.retryAfter, 'Backups can be started 3 times an hour.');

  const result = await runPanelBackup();
  await auditLog(guard.user, 'PANEL_BACKUP_MANUAL', 'PANEL', null, { ok: result.ok, error: result.error }, req);
  return NextResponse.json(result, { status: result.ok ? 200 : 502, headers: noStore });
}
