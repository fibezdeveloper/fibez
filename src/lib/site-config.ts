import { sql } from '@/lib/db';

/**
 * Which parts of the website are switched on. Stored in store_settings ('site_pages') and read with the
 * server (owner) connection. Staff always see every page; visitors see "coming soon" for switched-off ones.
 */
export const PAGE_DEFS = [
  { key: 'shop', label: 'Shop', description: 'Catalog, product pages and checkout of gift cards, games, subscriptions and software' },
  { key: 'v2ray', label: 'V2Ray store', description: 'V2Ray packages, free trial and the V2Ray dashboard' },
  { key: 'tickets', label: 'Support tickets', description: 'Customer support ticket centre' },
  { key: 'docs', label: 'Docs', description: 'Documentation pages' },
  { key: 'faq', label: 'FAQ', description: 'Frequently asked questions' },
  { key: 'infrastructure', label: 'Infrastructure', description: 'Service status page' },
] as const;

export type PageKey = (typeof PAGE_DEFS)[number]['key'];
export type PageFlags = Record<PageKey, boolean>;

export const DEFAULT_FLAGS: PageFlags = {
  shop: true,
  v2ray: true,
  tickets: true,
  docs: true,
  faq: true,
  infrastructure: true,
};

let cache: { at: number; flags: PageFlags } | null = null;
let hiddenCache: { at: number; ids: Set<string> } | null = null;
const TTL_MS = 5000;

export function invalidateSiteConfigCache() {
  cache = null;
  hiddenCache = null;
}

export async function getPageFlags(): Promise<PageFlags> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.flags;
  const flags = { ...DEFAULT_FLAGS };
  if (sql) {
    try {
      const rows = (await sql.query(`SELECT value FROM public.store_settings WHERE key = 'site_pages' LIMIT 1`)) as unknown as {
        value: Partial<PageFlags>;
      }[];
      const v = rows[0]?.value;
      if (v && typeof v === 'object') {
        for (const d of PAGE_DEFS) if (typeof v[d.key] === 'boolean') flags[d.key] = v[d.key] as boolean;
      }
    } catch (e) {
      console.warn('site flags unavailable, defaulting to all on:', e);
    }
  }
  cache = { at: Date.now(), flags };
  return flags;
}

export async function setPageFlags(flags: Partial<PageFlags>, actorEmail: string): Promise<PageFlags> {
  if (!sql) throw new Error('Database not configured');
  const next = { ...(await getPageFlags()) };
  for (const d of PAGE_DEFS) if (typeof flags[d.key] === 'boolean') next[d.key] = flags[d.key] as boolean;
  await sql.query(
    `INSERT INTO public.store_settings (key, value, updated_at, updated_by)
     VALUES ('site_pages', $1::jsonb, NOW(), $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by`,
    [JSON.stringify(next), actorEmail]
  );
  invalidateSiteConfigCache();
  return next;
}

/** Product ids the owner switched off (is_active = false). */
export async function getHiddenProductIds(): Promise<Set<string>> {
  if (hiddenCache && Date.now() - hiddenCache.at < TTL_MS) return hiddenCache.ids;
  const ids = new Set<string>();
  if (sql) {
    try {
      const rows = (await sql.query(`SELECT id FROM public.products WHERE is_active = FALSE`)) as unknown as { id: string }[];
      for (const r of rows) ids.add(String(r.id));
    } catch (e) {
      console.warn('hidden products unavailable:', e);
    }
  }
  hiddenCache = { at: Date.now(), ids };
  return ids;
}
