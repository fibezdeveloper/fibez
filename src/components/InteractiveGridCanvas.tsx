'use client';

import React, { useRef, useEffect } from 'react';

/**
 * InteractiveGridCanvas
 * Reverse-engineered directly from zkPass (0k6l2fd~0t9kw_6cWL.js, component DC)
 * Generates an interactive 44px pointillist physics grid across the entire page canvas.
 * Points magnetically displace around cursor within 130px radius with smoothstep damping.
 */
export default function InteractiveGridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let offsets = new Float32Array(0);
    let animId = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / 44) + 2;
      rows = Math.ceil(height / 44) + 2;
      offsets = new Float32Array(cols * rows * 2);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Smoothstep interpolation formula: u * u * (3 - 2 * u)
    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      const offsetX = ((window.innerWidth / 2) % 44 + 44) % 44;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const active = mouseRef.current.active;

      const minCol = active ? Math.max(0, Math.floor((mx - 130 - offsetX) / 44)) : -1;
      const maxCol = active ? Math.min(cols - 1, Math.ceil((mx + 130 - offsetX) / 44)) : -1;
      const minRow = active ? Math.max(0, Math.floor((my - 130) / 44)) : -1;
      const maxRow = active ? Math.min(rows - 1, Math.ceil((my + 130) / 44)) : -1;

      for (let r = 0; r < rows; r++) {
        const y = 44 * r;
        if (y < -44 || y > height + 44) continue;

        for (let c = 0; c < cols; c++) {
          const x = offsetX + 44 * c;
          if (x < -44 || x > width + 44) continue;

          const idx = (r * cols + c) * 2;
          let targetDx = 0;
          let targetDy = 0;

          if (active && c >= minCol && c <= maxCol && r >= minRow && r <= maxRow) {
            const dx = x - mx;
            const dy = y - my;
            const distSq = dx * dx + dy * dy;

            if (distSq < 16900 && distSq > 0.01) {
              const dist = Math.sqrt(distSq);
              const force = 18 * smoothstep(1 - dist / 130);
              targetDx = (dx / dist) * force;
              targetDy = (dy / dist) * force;
            }
          }

          // Spring physics damping: delta += (target - delta) * 0.12
          offsets[idx] += (targetDx - offsets[idx]) * 0.12;
          offsets[idx + 1] += (targetDy - offsets[idx + 1]) * 0.12;

          const currDx = offsets[idx];
          const currDy = offsets[idx + 1];

          if (Math.abs(currDx) >= 0.25 || Math.abs(currDy) >= 0.25) {
            // Anchor shadow dot
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Displaced foreground dot with Signal Lime highlight
            const displacement = Math.sqrt(currDx * currDx + currDy * currDy);
            const isHighDisplacement = displacement > 4;

            ctx.fillStyle = isHighDisplacement ? '#c5ff4a' : 'rgba(150, 150, 150, 0.9)';
            ctx.beginPath();
            ctx.arc(x + currDx, y + currDy, isHighDisplacement ? 1.4 : 1.0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    handleResize();
    animId = requestAnimationFrame(render);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none"
    />
  );
}
