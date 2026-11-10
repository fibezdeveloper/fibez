import { Pool, type PoolClient } from '@neondatabase/serverless';

export type AppRole = 'anonymous' | 'user' | 'admin' | 'owner';

export interface RlsContext {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: AppRole;
  recentOrderNumber?: string | null;
  checkoutOrderId?: string | null;
}

const VALID_ROLES = new Set<AppRole>(['anonymous', 'user', 'admin', 'owner']);

function getRlsConnectionString(): string {
  const conn = process.env.DATABASE_AUTHENTICATED_URL || process.env.DATABASE_URL || '';
  if (!conn) {
    throw new Error('Database connection string is not configured');
  }
  return conn;
}

/**
 * Executes database work inside a transaction as the restricted `fibez_app` role
 * (`NOBYPASSRLS`) with transaction-local session claims so PostgreSQL RLS
 * enforces row ownership and role access on every query.
 */
export async function withRlsTransaction<T>(
  ctx: RlsContext | null,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const connectionString = getRlsConnectionString();
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  const userId = ctx?.userId ? String(ctx.userId).trim() : '';
  const userEmail = ctx?.userEmail ? String(ctx.userEmail).trim().toLowerCase() : '';
  const rawRole = ctx?.userRole;
  const userRole: AppRole = rawRole && VALID_ROLES.has(rawRole) ? rawRole : 'anonymous';
  const recentOrderNumber = ctx?.recentOrderNumber ? String(ctx.recentOrderNumber).trim() : '';
  const checkoutOrderId = ctx?.checkoutOrderId ? String(ctx.checkoutOrderId).trim() : '';

  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE fibez_app');
    await client.query(
      `SELECT
        set_config('app.user_id', $1, true),
        set_config('app.user_email', $2, true),
        set_config('app.user_role', $3, true),
        set_config('app.recent_order_number', $4, true),
        set_config('app.checkout_order_id', $5, true)`,
      [userId, userEmail, userRole, recentOrderNumber, checkoutOrderId]
    );

    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback errors if connection already terminated
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
