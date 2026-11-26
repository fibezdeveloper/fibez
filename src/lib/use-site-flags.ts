import { useEffect, useState } from 'react';

export type SiteFlags = {
  home: boolean;
  shop: boolean;
  v2ray: boolean;
  tickets: boolean;
  docs: boolean;
  faq: boolean;
  infrastructure: boolean;
  whatsapp: boolean;
  lk_ip: boolean;
};

export type MotionMode = 'auto' | 'full' | 'lite' | 'off';
export type MotionSettings = { phone: MotionMode; tablet: MotionMode; desktop: MotionMode };

let cached: SiteFlags | null = null;
let cachedMotion: MotionSettings | null = null;
let inflight: Promise<SiteFlags | null> | null = null;

function load(): Promise<SiteFlags | null> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/api/site-pages', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        cached = d?.pages ?? null;
        cachedMotion = d?.motion ?? null;
        return cached;
      })
      .catch(() => null)
      .finally(() => {
        // re-check on the next full page load, not on every component
        setTimeout(() => {
          cached = null;
          inflight = null;
        }, 30000);
      });
  }
  return inflight;
}

/** Public site switches (see Admin -> Site pages). One shared request; null until loaded. */
export function useSiteFlags(): SiteFlags | null {
  const [flags, setFlags] = useState<SiteFlags | null>(cached);
  useEffect(() => {
    let alive = true;
    load().then((f) => alive && setFlags(f));
    return () => {
      alive = false;
    };
  }, []);
  return flags;
}

/**
 * One switch. True until the flags load (so links do not flicker away on every page),
 * then follows what the owner chose in Admin -> Site pages.
 */
export function useSiteFlag(key: keyof SiteFlags): boolean {
  const flags = useSiteFlags();
  return flags ? flags[key] !== false : true;
}

/** Animation level per device type (Admin -> Optimization). Null until loaded. */
export function useMotionSettings(): MotionSettings | null {
  const [m, setM] = useState<MotionSettings | null>(cachedMotion);
  useEffect(() => {
    let alive = true;
    load().then(() => alive && setM(cachedMotion));
    return () => {
      alive = false;
    };
  }, []);
  return m;
}
