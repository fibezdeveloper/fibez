import { Pool, type PoolClient } from '@neondatabase/serverless';

/**
 * Server-trusted database access for MONEY tables (wallet, refunds, trials, panel clients).
 * Runs as the owner connection (the tables have RLS enabled with no policies, so the restricted
 * app role and the Data API can never touch them). Callers MUST authorise the user first.
 */
export function dbReady(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const conn = process.env.DATABASE_URL;
  if (!conn) throw new Error('Database is not configured');
  const pool = new Pool({ connectionString: conn });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

/** True for a Postgres unique-violation (23505); optionally for a specific index/constraint. */
export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  const e = err as { code?: string; constraint?: string; message?: string };
  if (e?.code !== '23505') return false;
  return constraint ? (e.constraint || '').includes(constraint) || (e.message || '').includes(constraint) : true;
}
