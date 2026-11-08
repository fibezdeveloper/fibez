'use client';

import React, { useEffect, useRef } from 'react';

const CHAR_RAMP = " .·:-+=*#%@";
const CELL_W = 8;
const CELL_H = 12;

const BAYER_4X4 = [
  [ 0/16 - 0.5,  8/16 - 0.5,  2/16 - 0.5, 10/16 - 0.5],
  [12/16 - 0.5,  4/16 - 0.5, 14/16 - 0.5,  6/16 - 0.5],
  [ 3/16 - 0.5, 11/16 - 0.5,  1/16 - 0.5,  9/16 - 0.5],
  [15/16 - 0.5,  7/16 - 0.5, 13/16 - 0.5,  5/16 - 0.5]
];

function drawSculptedSegment(
  c: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r1: number,
  r2: number,
  lum = 1.0
) {
  const steps = Math.max(14, Math.hypot(x2 - x1, y2 - y1) * 1.6);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const r = r1 + (r2 - r1) * t;

    const g = c.createRadialGradient(x - r * 0.2, y - r * 0.28, r * 0.05, x, y, r);
    g.addColorStop(0, `rgba(255, 255, 255, ${0.96 * lum})`);
    g.addColorStop(0.45, `rgba(185, 185, 185, ${0.62 * lum})`);
    g.addColorStop(0.82, `rgba(75, 75, 75, ${0.28 * lum})`);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');

    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }
}

export default function AsciiHandsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    let cols = 0;
    let rows = 0;
    const mouse = { x: -9999, y: -9999 };
    let animationFrameId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    function buildHandsLuminanceMap() {
      if (!offCtx) return;
      offCtx.fillStyle = '#000000';
      offCtx.fillRect(0, 0, cols, rows);

      const w = cols;
      const h = rows;
      const s = Math.min(w, h * 1.55);

      offCtx.save();
      offCtx.globalCompositeOperation = 'lighter';

      // Left reaching hand
      drawSculptedSegment(offCtx, -w * 0.05, h * 0.53, w * 0.16, h * 0.66, s * 0.145, s * 0.088, 0.88);
      drawSculptedSegment(offCtx, w * 0.02, h * 0.50, w * 0.19, h * 0.63, s * 0.075, s * 0.055, 0.55);
      drawSculptedSegment(offCtx, w * 0.16, h * 0.66, w * 0.27, h * 0.69, s * 0.088, s * 0.074, 0.92);
      drawSculptedSegment(offCtx, w * 0.19, h * 0.70, w * 0.26, h * 0.79, s * 0.042, s * 0.030, 0.78);
      drawSculptedSegment(offCtx, w * 0.26, h * 0.79, w * 0.31, h * 0.82, s * 0.028, s * 0.019, 0.72);
      drawSculptedSegment(offCtx, w * 0.27, h * 0.66, w * 0.36, h * 0.68, s * 0.036, s * 0.026, 0.96);
      drawSculptedSegment(offCtx, w * 0.36, h * 0.68, w * 0.42, h * 0.71, s * 0.025, s * 0.017, 0.90);
      drawSculptedSegment(offCtx, w * 0.27, h * 0.69, w * 0.35, h * 0.75, s * 0.034, s * 0.024, 0.80);
      drawSculptedSegment(offCtx, w * 0.35, h * 0.75, w * 0.39, h * 0.81, s * 0.023, s * 0.016, 0.68);
      drawSculptedSegment(offCtx, w * 0.25, h * 0.72, w * 0.32, h * 0.81, s * 0.031, s * 0.021, 0.58);
      drawSculptedSegment(offCtx, w * 0.23, h * 0.75, w * 0.28, h * 0.84, s * 0.027, s * 0.018, 0.48);

      // Right reaching hand
      drawSculptedSegment(offCtx, w * 1.05, h * 0.84, w * 0.81, h * 0.74, s * 0.145, s * 0.088, 0.90);
      drawSculptedSegment(offCtx, w * 0.81, h * 0.74, w * 0.69, h * 0.68, s * 0.086, s * 0.072, 0.94);
      drawSculptedSegment(offCtx, w * 0.75, h * 0.75, w * 0.66, h * 0.79, s * 0.040, s * 0.028, 0.82);
      drawSculptedSegment(offCtx, w * 0.66, h * 0.79, w * 0.60, h * 0.80, s * 0.026, s * 0.018, 0.75);
      drawSculptedSegment(offCtx, w * 0.69, h * 0.66, w * 0.61, h * 0.68, s * 0.036, s * 0.026, 0.96);
      drawSculptedSegment(offCtx, w * 0.61, h * 0.68, w * 0.56, h * 0.73, s * 0.025, s * 0.017, 0.86);
      drawSculptedSegment(offCtx, w * 0.69, h * 0.69, w * 0.62, h * 0.74, s * 0.034, s * 0.024, 0.76);
      drawSculptedSegment(offCtx, w * 0.62, h * 0.74, w * 0.59, h * 0.81, s * 0.022, s * 0.016, 0.65);
      drawSculptedSegment(offCtx, w * 0.71, h * 0.73, w * 0.65, h * 0.82, s * 0.030, s * 0.020, 0.55);
      drawSculptedSegment(offCtx, w * 0.73, h * 0.76, w * 0.68, h * 0.86, s * 0.026, s * 0.018, 0.45);

      offCtx.restore();
    }

    function resizeAsciiCanvas() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(window.innerWidth / CELL_W);
      rows = Math.ceil(window.innerHeight / CELL_H);
      offscreen.width = cols;
      offscreen.height = rows;

      buildHandsLuminanceMap();
    }

    function renderAsciiFrame(time: number) {
      if (!ctx || !offCtx) return;
      if (window.scrollY < window.innerHeight * 3.1) {
        ctx.fillStyle = '#060606';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Background 28px Structural Dot Matrix (#252525 dots)
        ctx.fillStyle = '#252525';
        for (let gy = 14; gy < window.innerHeight; gy += 28) {
          for (let gx = 14; gx < window.innerWidth; gx += 28) {
            ctx.fillRect(gx, gy, 1.5, 1.5);
          }
        }

        const imgData = offCtx.getImageData(0, 0, cols, rows);
        const data = imgData.data;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textBaseline = 'top';

        const radiusSq = 135 * 135;

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            let luma = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;

            const px = x * CELL_W;
            const py = y * CELL_H;
            const dx = px - mouse.x;
            const dy = py - mouse.y;
            const dSq = dx * dx + dy * dy;

            if (luma < 0.045 && dSq > 6400) continue;

            luma = Math.min(1, Math.max(0, luma + BAYER_4X4[y & 3][x & 3] * 0.22));
            let cIdx = Math.floor(luma * (CHAR_RAMP.length - 1));

            if (dSq < radiusSq) {
              const inf = 1 - Math.sqrt(dSq) / 135;
              const jitter = Math.floor(Math.sin(time * 0.025 + x * 1.9 + y * 2.1) * 3 * inf);
              cIdx = Math.min(CHAR_RAMP.length - 1, Math.max(1, cIdx + jitter + 1));
              ctx.fillStyle = inf > 0.45 ? '#c5ff4a' : `rgba(229, 229, 229, ${0.35 + luma * 0.65})`;
            } else {
              const flicker = Math.sin(time * 0.003 + (x * 11 + y * 7)) > 0.975 ? 1 : 0;
              cIdx = Math.min(CHAR_RAMP.length - 1, cIdx + flicker);
              ctx.fillStyle = `rgba(229, 229, 229, ${(0.20 + luma * 0.80).toFixed(2)})`;
            }

            const ch = CHAR_RAMP[cIdx];
            if (ch && ch !== ' ') {
              ctx.fillText(ch, px, py);
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(renderAsciiFrame);
    }

    resizeAsciiCanvas();
    window.addEventListener('resize', resizeAsciiCanvas);
    animationFrameId = requestAnimationFrame(renderAsciiFrame);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeAsciiCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="ascii-canvas"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
