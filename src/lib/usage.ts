import { sql } from '@/lib/db';

/**
 * Daily V2Ray usage history.
 *
 * 3x-ui keeps only cumulative per-client traffic (no history), so we snapshot the cumulative counters
 * (see migration 0004 and /api/cron/usage-snapshot) and derive daily usage as day-over-day difference.
 * A day is "known" only when we hold both that day's snapshot and an earlier one.
 */

const GB = 1024 * 1024 * 1024;

/** Calendar day in Sri Lanka (YYYY-MM-DD) for a given instant. */
export function colomboDay(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo' }).format(d);
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  downGB: number;
  upGB: number;
  known: boolean;
}

export async function recordSnapshots(rows: { email: string; up: number; down: number }[]): Promise<number> {
  if (!sql || rows.length === 0) return 0;
  const day = colomboDay();
  await sql.query(
    `INSERT INTO public.usage_snapshots (email, day, up_bytes, down_bytes, updated_at)
     SELECT e, $1::date, u, d, now()
       FROM unnest($2::text[], $3::bigint[], $4::bigint[]) AS t(e, u, d)
     ON CONFLICT (email, day) DO UPDATE
       SET up_bytes = EXCLUDED.up_bytes, down_bytes = EXCLUDED.down_bytes, updated_at = now()`,
    [day, rows.map((r) => r.email), rows.map((r) => Math.round(r.up)), rows.map((r) => Math.round(r.down))]
  );
  return rows.length;
}

export async function getDailyUsage(
  email: string,
  days: number
): Promise<{ series: DailyUsage[]; trackingSince: string | null }> {
  if (!sql) return { series: [], trackingSince: null };
  const rows = (await sql.query(
    `SELECT to_char(day, 'YYYY-MM-DD') AS day, up_bytes::float8 AS up, down_bytes::float8 AS down
       FROM public.usage_snapshots
      WHERE email = $1 AND day >= (now() AT TIME ZONE 'Asia/Colombo')::date - ($2::int + 1)
      ORDER BY day`,
    [email, days]
  )) as unknown as { day: string; up: number; down: number }[];
  const first = (await sql.query(`SELECT to_char(min(day), 'YYYY-MM-DD') AS d FROM public.usage_snapshots WHERE email = $1`, [
    email,
  ])) as unknown as { d: string | null }[];

  const byDay = new Map(rows.map((r) => [r.day, r]));
  const series: DailyUsage[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = colomboDay(new Date(today.getTime() - i * 86400000));
    const cur = byDay.get(date);
    // Previous snapshot = the latest one strictly before this day.
    const prev = [...rows].reverse().find((r) => r.day < date);
    if (!cur || !prev) {
      series.push({ date, downGB: 0, upGB: 0, known: false });
      continue;
    }
    const down = cur.down >= prev.down ? cur.down - prev.down : cur.down; // counter reset
    const up = cur.up >= prev.up ? cur.up - prev.up : cur.up;
    series.push({ date, downGB: Number((down / GB).toFixed(2)), upGB: Number((up / GB).toFixed(2)), known: true });
  }
  return { series, trackingSince: first[0]?.d ?? null };
}
