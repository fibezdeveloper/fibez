'use client';

import { useState, useEffect } from 'react';
import { currentMotion, type EffectiveMotion } from '@/lib/motion';

export interface DevicePerfState {
  isLowTier: boolean;
  prefersReducedMotion: boolean;
  allowHeavyEffects: boolean;
  meteorCount: number;
  blurEnabled: boolean;
  /** False until the browser has been checked (first client render), so heavy effects can wait for it. */
  detected: boolean;
}

function stateFor(level: EffectiveMotion): DevicePerfState {
  if (level === 'full') {
    return { isLowTier: false, prefersReducedMotion: false, allowHeavyEffects: true, meteorCount: 15, blurEnabled: true, detected: true };
  }
  if (level === 'lite') {
    return { isLowTier: true, prefersReducedMotion: false, allowHeavyEffects: false, meteorCount: 4, blurEnabled: false, detected: true };
  }
  return { isLowTier: true, prefersReducedMotion: true, allowHeavyEffects: false, meteorCount: 0, blurEnabled: false, detected: true };
}

/**
 * How much animation this device should run. The level comes from <html data-motion>, which MotionManager
 * sets from the owner's Admin -> Optimization choice for phones / tablets / computers ("auto" = weak or old
 * devices such as iPhone 8 or budget Androids get the light version). A visitor's own "reduce motion"
 * setting always means no animation. Updates live when the owner's setting loads or changes.
 */
export function useDevicePerf(): DevicePerfState {
  const [perfState, setPerfState] = useState<DevicePerfState>({
    isLowTier: false,
    prefersReducedMotion: false,
    allowHeavyEffects: true,
    meteorCount: 12,
    blurEnabled: true,
    detected: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setPerfState(stateFor(currentMotion()));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    return () => observer.disconnect();
  }, []);

  return perfState;
}

export default useDevicePerf;
