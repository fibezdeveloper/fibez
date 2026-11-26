'use client';

import { useEffect, useRef } from 'react';
import useDevicePerf from '@/lib/use-device-perf';

/**
 * Predictive Arc: a dot-matrix arch of light drawn on a 2D canvas (dark variant, additive blending).
 * The drawing maths follows the ThreeUI "predictive" renderer; this version adds a frame cap, a coarser
 * grid on weaker devices, and a single still frame for people who prefer reduced motion.
 */
interface ArcOptions {
  speed: number;
  spacing: number;
  dotSize: number;
  archHeight: number;
  thickness: number;
  brightness: number;
}

function createArcRenderer(canvas: HTMLCanvasElement, getOptions: () => ArcOptions, maxPixelRatio: number) {
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return null;
  let width = 1;
  let height = 1;
  let time = 0;

  const resize = (nextWidth: number, nextHeight: number) => {
    width = Math.max(1, nextWidth);
    height = Math.max(1, nextHeight);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  // `step` is how many 60 fps frames have passed, so a capped frame rate keeps the same speed.
  const render = (step = 1) => {
    const options = getOptions();
    context.fillStyle = '#030303';
    context.fillRect(0, 0, width, height);
    time += 0.015 * options.speed * step;

    const centerX = width / 2;
    const archPeakY = height * 0.35;
    const archWidth = width * 1.5;
    const archHeight = height * options.archHeight;
    context.globalCompositeOperation = 'lighter';

    for (let x = 0; x < width; x += options.spacing) {
      const normX = (x - centerX) / (archWidth / 2);
      const curveY = archPeakY + normX * normX * archHeight;
      const edgeFade = Math.max(0, 1 - Math.pow(Math.abs(normX), 2.5));
      if (edgeFade <= 0) continue;
      const thickness = (140 + (1 - Math.abs(normX)) * 80) * options.thickness;
      const yStart = Math.max(0, Math.floor((curveY - thickness) / options.spacing) * options.spacing);
      const yEnd = Math.min(height, curveY + thickness);
      for (let y = yStart; y < yEnd; y += options.spacing) {
        const distanceToCurve = Math.abs(y - curveY);
        if (distanceToCurve >= thickness) continue;
        let intensity = 1 - distanceToCurve / thickness;
        const waveX = Math.sin(x * 0.015 + time);
        const waveY = Math.cos(y * 0.02 + time);
        intensity = intensity * 0.7 + waveX * waveY * 0.3 * intensity;
        intensity *= edgeFade;
        if (intensity <= 0.02) continue;

        let r = Math.min(255, 60 * intensity + 100 * Math.pow(intensity, 3));
        let g = Math.min(255, 20 * intensity + 60 * Math.pow(intensity, 4));
        let b = Math.min(255, 120 * intensity + 135 * Math.pow(intensity, 2));
        if (intensity > 0.7) {
          const coreBoost = (intensity - 0.7) * 3.3;
          r = Math.min(255, r + 150 * coreBoost);
          g = Math.min(255, g + 150 * coreBoost);
          b = Math.min(255, b + 150 * coreBoost);
        }
        context.fillStyle = `rgb(${Math.floor(r * options.brightness)}, ${Math.floor(g * options.brightness)}, ${Math.floor(b * options.brightness)})`;
        const size = options.dotSize * intensity;
        context.fillRect(x, y, size, size);
      }
    }
    context.globalCompositeOperation = 'source-over';
  };

  return { resize, render };
}

export default function PredictiveArcBackground({ className = '' }: { className?: string }) {
  const perf = useDevicePerf();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const options: ArcOptions = {
      speed: 1,
      spacing: perf.isLowTier ? 9 : 6,
      dotSize: perf.isLowTier ? 8 : 6,
      archHeight: 0.7,
      thickness: 1,
      // a little under the stock level so the hero copy stays easy to read on top of it
      brightness: 0.8,
    };
    const renderer = createArcRenderer(canvas, () => options, perf.isLowTier ? 1 : 1.5);
    if (!renderer) return undefined;

    // Full level: up to 60fps (smooth on 90/120Hz screens). Lite level (weak phones): 20fps to save battery.
    const minFrameMs = perf.isLowTier ? 50 : 16;
    let frame = 0;
    let last = 0;

    const resize = () => {
      renderer.resize(window.innerWidth, window.innerHeight);
      renderer.render(0);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const elapsed = now - last;
      if (elapsed < minFrameMs) return;
      last = now - (elapsed % minFrameMs);
      renderer.render(Math.min(elapsed, 100) / 16.667);
    };
    const start = () => {
      if (!frame && !perf.prefersReducedMotion) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [perf.isLowTier, perf.prefersReducedMotion]);

  return (
    <div aria-hidden="true" className={`pointer-events-none fixed inset-0 -z-10 bg-[#030303] ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
