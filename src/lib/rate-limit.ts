import { sql } from '@/lib/db';

/**
 * Shared fixed-window rate limiter. The counter lives in Postgres, so the limit holds across
 * serverless instances (an in-memory Map does not). If the database is unreachable it falls back to
 * a per-instance counter rather than failing open.
 *
 *   const rl = await rateLimit('topup', user.id, 6, 3600);
 *   if (rl.limited) return 429 ...
 */
const memory = new Map<string, { count: number; resetAt: number }>();

let tableReady = false;
async function ensureTable() {
  if (!sql || tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS public.rate_limits (
      k TEXT PRIMARY KEY,
      hits INTEGER NOT NULL DEFAULT 0,
      reset_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY`;
  tableReady = true;
}

function memoryHit(k: string, windowSec: number): { count: number; retryAfter: number } {
  const now = Date.now();
  if (memory.size > 5000) for (const [key, v] of memory) if (v.resetAt <= now) memory.delete(key);
  const e = memory.get(k);
  if (!e || e.resetAt <= now) {
    memory.set(k, { count: 1, resetAt: now + windowSec * 1000 });
    return { count: 1, retryAfter: windowSec };
  }
  e.count += 1;
  return { count: e.count, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
}

export async function rateLimit(
  bucket: string,
  key: string,
  max: number,
  windowSec: number
): Promise<{ limited: boolean; retryAfter: number }> {
  const k = `${bucket}:${key}`;
  if (sql) {
    try {
      await ensureTable();
      const rows = (await sql.query(
        `INSERT INTO public.rate_limits (k, hits, reset_at)
         VALUES ($1, 1, now() + ($2::int * interval '1 second'))
         ON CONFLICT (k) DO UPDATE SET
           hits = CASE WHEN public.rate_limits.reset_at > now() THEN public.rate_limits.hits + 1 ELSE 1 END,
           reset_at = CASE WHEN public.rate_limits.reset_at > now() THEN public.rate_limits.reset_at
                           ELSE now() + ($2::int * interval '1 second') END
         RETURNING hits, GREATEST(1, CEIL(EXTRACT(EPOCH FROM (reset_at - now()))))::int AS retry_after`,
        [k, windowSec]
      )) as unknown as { hits: number; retry_after: number }[];
      const row = rows[0];
      return { limited: Number(row.hits) > max, retryAfter: Number(row.retry_after) };
    } catch (err) {
      console.warn('rate-limit db failed, using memory:', err);
    }
  }
  const m = memoryHit(k, windowSec);
  return { limited: m.count > max, retryAfter: m.retryAfter };
}

export function tooMany(retryAfter: number, message = 'Too many requests. Please wait and try again.') {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' },
  });
}
