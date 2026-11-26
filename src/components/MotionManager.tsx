'use client';

import { useEffect, useState } from 'react';
import { MotionConfig as FramerMotionConfig } from 'framer-motion';
import { MotionConfig } from 'motion/react';
import { useMotionSettings } from '@/lib/use-site-flags';
import { MOTION_STORAGE_KEY, resolveMotion, type EffectiveMotion } from '@/lib/motion';

/**
 * Applies the owner's Admin -> Optimization choice for this device: sets <html data-motion>, remembers it
 * for the next page load, and tells both motion libraries to skip animations when the level is "off".
 */
export default function MotionManager({ children }: { children: React.ReactNode }) {
  const settings = useMotionSettings();
  const [level, setLevel] = useState<EffectiveMotion | null>(null);

  useEffect(() => {
    const apply = () => {
      const next = resolveMotion(settings);
      document.documentElement.dataset.motion = next;
      try {
        localStorage.setItem(MOTION_STORAGE_KEY, next);
      } catch {
        /* private mode: fine, the attribute still applies to this page */
      }
      setLevel(next);
    };
    apply();
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, [settings]);

  const reduced = level === 'off' ? 'always' : 'user';
  return (
    <FramerMotionConfig reducedMotion={reduced}>
      <MotionConfig reducedMotion={reduced}>{children}</MotionConfig>
    </FramerMotionConfig>
  );
}
