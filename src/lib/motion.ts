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
  const iPadOs = /Macintosh/.test(ua) && (navigator.maxTouchPoints > 1 || coarse);
  const shortSide = Math.min(window.screen.width, window.screen.height);
  if (/iPad|Tablet/i.test(ua) || iPadOs || (coarse && shortSide >= 600)) return 'tablet';
  if (coarse || /iPhone|iPod|Android.+Mobile|Mobile/i.test(ua)) return 'phone';
  return 'desktop';
}

/**
 * True on weak hardware. iPhones and iPads hide their real CPU and memory from websites (Safari reports a
 * low core count even on fast phones), so for Apple devices this judges by iOS version and screen size:
 * iOS < 15, or iPhone 8 / 8 Plus / SE-class screens (tall side <= 736pt) are treated as weak. iPhone X, XR,
 * 11 and newer get the full animations. Android and others: less than 4 GB memory or 4 cores or fewer.
 */
export function isLowTierDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iPadOs = /Macintosh/.test(ua) && (navigator.maxTouchPoints > 1 || (window.matchMedia?.('(pointer: coarse)').matches ?? false));
  if (/iPhone|iPad|iPod/i.test(ua) || iPadOs) {
    const m = ua.match(/OS (\d+)_/);
    const major = m ? Number(m[1]) : 99;
    const tallSide = Math.max(window.screen.width, window.screen.height);
    return major < 15 || (/iPhone|iPod/i.test(ua) && tallSide <= 736);
  }
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;
  return cores <= 4 || memory < 4;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function resolveMotion(settings: MotionSettings | null, device = detectDeviceClass()): EffectiveMotion {
  // The visitor's own accessibility setting always wins.
  if (prefersReducedMotion()) return 'off';
  // Computers always handle the full animations; the owner's setting is for phones and tablets.
  if (device === 'desktop') return 'full';
  const mode: MotionMode = settings?.[device] ?? 'auto';
  // Auto: strong phones/tablets get everything, old or budget ones get a still, fast page.
  if (mode === 'auto') return isLowTierDevice() ? 'off' : 'full';
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
