import { defineConfig } from 'drizzle-kit';
import * as fs from 'fs';
import * as path from 'path';

let databaseUrl = process.env.DATABASE_URL || '';

if (!databaseUrl) {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=')) {
        databaseUrl = trimmed.replace('DATABASE_URL=', '').replace(/^["']|["']$/g, '');
        break;
      }
    }
  }
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
