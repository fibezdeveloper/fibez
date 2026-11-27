'use client';

import { useEffect, useState } from 'react';
import { MotionConfig as FramerMotionConfig } from 'framer-motion';
import { MotionConfig } from 'motion/react';
import { useMotionSettings } from '@/lib/use-site-flags';
import { MOTION_SLOW_KEY, MOTION_STORAGE_KEY, detectDeviceClass, resolveMotion, type EffectiveMotion } from '@/lib/motion';

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

    // Lag watchdog: with full effects on, measure the real frame rate for ~3s. If this machine can't keep
    // up (under 35 fps), switch to lite now and remember it, so slow laptops stop stuttering. Skipped when
    // the owner explicitly chose "Full" for this kind of device.
    let raf = 0;
    let timer = 0;
    const device = detectDeviceClass();
    const forcedFull = device !== 'desktop' && settings?.[device] === 'full';
    if (document.documentElement.dataset.motion === 'full' && !forcedFull) {
      timer = window.setTimeout(() => {
        let frames = 0;
        let wasHidden = document.hidden;
        const onHide = () => { if (document.hidden) wasHidden = true; };
        document.addEventListener('visibilitychange', onHide);
        const start = performance.now();
        const tick = (now: number) => {
          frames++;
          if (now - start < 3000) {
            raf = requestAnimationFrame(tick);
            return;
          }
          document.removeEventListener('visibilitychange', onHide);
          const fps = (frames * 1000) / (now - start);
          // A hidden tab pauses frames, so only trust a measurement taken fully in the foreground.
          if (fps < 35 && !wasHidden && !document.hidden) {
            try {
              localStorage.setItem(MOTION_SLOW_KEY, '1');
              localStorage.setItem(MOTION_STORAGE_KEY, 'lite');
            } catch {
              /* ignore */
            }
            document.documentElement.dataset.motion = 'lite';
            setLevel('lite');
          }
        };
        raf = requestAnimationFrame(tick);
      }, 2000);
    }

    return () => {
      mq?.removeEventListener?.('change', apply);
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [settings]);

  const reduced = level === 'off' ? 'always' : 'user';
  return (
    <FramerMotionConfig reducedMotion={reduced}>
      <MotionConfig reducedMotion={reduced}>{children}</MotionConfig>
    </FramerMotionConfig>
  );
}
