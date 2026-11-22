'use client';

import { useState, useEffect } from 'react';

export interface DevicePerfState {
  isLowTier: boolean;
  prefersReducedMotion: boolean;
  allowHeavyEffects: boolean;
  meteorCount: number;
  blurEnabled: boolean;
  /** False until the browser has been checked (first client render), so heavy effects can wait for it. */
  detected: boolean;
}

/**
 * Smart performance detection hook
 * Optimizes animation rendering for older iPhones (e.g. iPhone 8 Plus, iPhone 7),
 * budget Android phones (<= 3-4GB RAM / <= 4 cores), and reduced-motion preferences.
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

    // 1. Check user preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = motionQuery.matches;

    // 2. Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 8;
    const isLowCore = cores <= 4;

    // 3. Check device memory if supported (Chrome/Android)
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;
    const isLowMemory = memory < 4;

    // 4. Check user agent & screen for older iOS devices (iPhone 8 Plus, 8, 7, SE 1/2)
    const ua = navigator.userAgent || '';
    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const isOlderIos =
      isIos &&
      (/OS (1[0-5]|9|8)_/i.test(ua) ||
        // Older iPhones with 16:9 aspect ratio like 8 Plus (414x736 CSS px) without notch/dynamic island
        (window.screen.height === 736 && window.screen.width === 414 && window.devicePixelRatio === 3));

    // 5. Check if low tier device
    const isLowTier = prefersReducedMotion || isLowCore || isLowMemory || isOlderIos;

    setPerfState({
      isLowTier,
      prefersReducedMotion,
      allowHeavyEffects: !isLowTier,
      meteorCount: isLowTier ? (prefersReducedMotion ? 0 : 4) : 15,
      blurEnabled: !isLowTier,
      detected: true,
    });

    const listener = (e: MediaQueryListEvent) => {
      setPerfState((prev) => ({
        ...prev,
        prefersReducedMotion: e.matches,
        allowHeavyEffects: !e.matches && !isLowCore && !isLowMemory && !isOlderIos,
        meteorCount: e.matches ? 0 : isLowCore || isLowMemory || isOlderIos ? 4 : 15,
        blurEnabled: !e.matches && !isOlderIos,
      }));
    };

    motionQuery.addEventListener?.('change', listener);
    return () => motionQuery.removeEventListener?.('change', listener);
  }, []);

  return perfState;
}

export default useDevicePerf;
