'use client';

import type { MotionMode, MotionSettings } from '@/lib/use-site-flags';

/**
 * Animation level for THIS visitor, from the owner's Admin -> Optimization settings and the device type.
 *
 * The result is written to <html data-motion="full|lite|off"> (and remembered in localStorage so the next
 * page load starts at the right level before any script runs). CSS in globals.css and the canvas / WebGL
 * components read it from there.
 */
export type DeviceClass = 'phone' | 'tablet' | 'desktop';
export type EffectiveMotion = 'full' | 'lite' | 'off';

import { MOTION_STORAGE_KEY } from '@/lib/motion-boot';
export { MOTION_STORAGE_KEY };

export function detectDeviceClass(): DeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const ua = navigator.userAgent || '';
  // iPadOS reports a desktop Mac user agent; touch points give it away.
  const iPadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  const shortSide = Math.min(window.screen.width, window.screen.height);
  if (/iPad|Tablet/i.test(ua) || iPadOs || (coarse && shortSide >= 600)) return 'tablet';
  if (coarse || /iPhone|iPod|Android.+Mobile|Mobile/i.test(ua)) return 'phone';
  return 'desktop';
}

/** True on weak hardware: few cores, little memory, or an old iPhone. */
export function isLowTierDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;
  const ua = navigator.userAgent || '';
  const oldIos =
    /iPhone|iPad|iPod/i.test(ua) &&
    (/OS (1[0-5]|9|8)_/i.test(ua) || (window.screen.height === 736 && window.screen.width === 414 && window.devicePixelRatio === 3));
  return cores <= 4 || memory < 4 || oldIos;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function resolveMotion(settings: MotionSettings | null, device = detectDeviceClass()): EffectiveMotion {
  // The visitor's own accessibility setting always wins.
  if (prefersReducedMotion()) return 'off';
  const mode: MotionMode = settings?.[device] ?? 'auto';
  if (mode === 'auto') return isLowTierDevice() ? 'lite' : 'full';
  return mode;
}

/** Current level from <html data-motion>, falling back to auto detection. Safe to call anywhere on the client. */
export function currentMotion(): EffectiveMotion {
  if (typeof document === 'undefined') return 'full';
  const v = document.documentElement.dataset.motion;
  if (v === 'full' || v === 'lite' || v === 'off') return v;
  return resolveMotion(null);
}

/** For canvas / WebGL components: true when they should skip their continuous effects. */
export function shouldReduceMotion(): boolean {
  return currentMotion() !== 'full';
}
