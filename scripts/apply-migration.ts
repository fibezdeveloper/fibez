import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Usage:  MIGRATE_URL=<postgres url> pnpm tsx scripts/apply-migration.ts src/lib/db/migrations/0002_wallet.sql
 * Runs the whole file in ONE transaction: it either applies completely or not at all.
 */
async function main() {
  const url = process.env.MIGRATE_URL;
  const file = process.argv[2];
  if (!url || !file) {
    console.error('Set MIGRATE_URL and pass the .sql file path.');
    process.exit(1);
  }
  const sql = fs.readFileSync(path.resolve(file), 'utf-8');
  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration applied:', file);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Migration FAILED, rolled back:', (err as Error).message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}
main();
