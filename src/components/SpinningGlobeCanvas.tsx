'use client';

import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  colorType: 'white' | 'lime' | 'dim' | 'glow';
}

interface ArcConnection {
  start: { lat: number; lon: number };
  end: { lat: number; lon: number };
  progress: number;
  speed: number;
}

export default function SpinningGlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId = 0;

    // Globe parameters
    const GLOBE_RADIUS_RATIO = 0.28; // Fraction of min(width, height)
    let radius = Math.min(width, height) * GLOBE_RADIUS_RATIO;
    let centerX = width * 0.5;
    let centerY = height * 0.52;

    let rotY = 0;
    const tiltX = -0.22; // ~12 degrees tilt
    let rotSpeed = 0.0035;

    // Mouse drag & interaction
    let isDragging = false;
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let dragVelocity = 0;

    const points: Point3D[] = [];

    // 1. Generate Fibonnaci sphere distribution + dense latitude/longitude nodes
    const TOTAL_POINTS = 900;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < TOTAL_POINTS; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / TOTAL_POINTS);

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);

      // Distribute some highlighted lime nodes (representing digital edge server locations)
      const isLimeNode = (i % 23 === 0) || (i % 47 === 0);
      const isDim = (i % 3 !== 0 && !isLimeNode);

      points.push({
        x,
        y,
        z,
        baseRadius: isLimeNode ? 2.4 : isDim ? 1.0 : 1.5,
        colorType: isLimeNode ? 'lime' : isDim ? 'dim' : 'white',
      });
    }

    // 2. Generate equator and orbital rings points
    const RING_POINTS = 160;
    for (let i = 0; i < RING_POINTS; i++) {
      const angle = (i / RING_POINTS) * Math.PI * 2;
      points.push({
        x: Math.cos(angle) * 1.02,
        y: 0,
        z: Math.sin(angle) * 1.02,
        baseRadius: 0.9,
        colorType: i % 10 === 0 ? 'lime' : 'dim',
      });
    }

    // 3. Inclined orbital ring (telecom satellite orbit)
    for (let i = 0; i < 120; i++) {
      const angle = (i / 120) * Math.PI * 2;
      // Orbit rotated by 45 degrees
      const ox = Math.cos(angle) * 1.25;
      const oy = Math.sin(angle) * 0.45;
      const oz = Math.sin(angle) * 1.25 * 0.8;
      points.push({
        x: ox,
        y: oy,
        z: oz,
        baseRadius: i % 8 === 0 ? 1.8 : 0.75,
        colorType: i % 8 === 0 ? 'glow' : 'dim',
      });
    }

    // Arc transit pulses (V2Ray / Cloud VPS routing signals)
    const arcs: ArcConnection[] = [
      { start: { lat: 0.22, lon: 1.8 }, end: { lat: 0.87, lon: 0.15 }, progress: 0, speed: 0.012 }, // SG -> FRA
      { start: { lat: 0.87, lon: 0.15 }, end: { lat: 0.69, lon: -1.3 }, progress: 0.3, speed: 0.009 }, // FRA -> US
      { start: { lat: 0.22, lon: 1.8 }, end: { lat: 0.61, lon: 2.4 }, progress: 0.6, speed: 0.014 }, // SG -> TYO
    ];

    function handleResize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      radius = Math.min(width, height) * (width < 640 ? 0.38 : GLOBE_RADIUS_RATIO);
      centerX = width * 0.5;
      centerY = height * (width < 640 ? 0.54 : 0.52);
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        dragVelocity = deltaX * 0.004;
        rotY += dragVelocity;
        lastMouseX = e.clientX;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    handleResize();

    function renderFrame(time: number) {
      if (!ctx) return;

      // Only render if within the hero scroll zone
      if (window.scrollY < height * 3.1) {
        ctx.fillStyle = '#060606';
        ctx.fillRect(0, 0, width, height);

        // Background 28px dot matrix
        ctx.fillStyle = '#252525';
        for (let gy = 14; gy < height; gy += 28) {
          for (let gx = 14; gx < width; gx += 28) {
            ctx.fillRect(gx, gy, 1.5, 1.5);
          }
        }

        // Inertia damping & continuous auto-rotation
        if (!isDragging) {
          rotY += rotSpeed + dragVelocity;
          dragVelocity *= 0.94;
        }

        // Radial glow behind globe
        const glowGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.1,
          centerX,
          centerY,
          radius * 1.35
        );
        glowGradient.addColorStop(0, 'rgba(197, 255, 74, 0.14)');
        glowGradient.addColorStop(0.45, 'rgba(197, 255, 74, 0.04)');
        glowGradient.addColorStop(0.8, 'rgba(6, 6, 6, 0.01)');
        glowGradient.addColorStop(1, 'rgba(6, 6, 6, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
        ctx.fill();

        // Atmospheric halo outline
        ctx.strokeStyle = 'rgba(197, 255, 74, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner subtle grid latitudes
        for (let lat = -60; lat <= 60; lat += 30) {
          const latRad = (lat * Math.PI) / 180;
          const rRing = radius * Math.cos(latRad);
          const yRing = centerY + radius * Math.sin(latRad) * Math.cos(tiltX);
          const ry = rRing * Math.sin(Math.abs(tiltX));
          ctx.beginPath();
          ctx.ellipse(centerX, yRing, rRing, Math.max(2, ry), 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(61, 61, 61, 0.35)';
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }

        // Precompute sin/cos for 3D rotation
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(tiltX);
        const sinX = Math.sin(tiltX);

        // Project and sort points by depth (Z-buffer)
        const projected: Array<{
          x2d: number;
          y2d: number;
          z: number;
          r: number;
          alpha: number;
          color: string;
          glow: boolean;
        }> = [];

        for (let i = 0; i < points.length; i++) {
          const p = points[i];

          // 1. Rotate around Y axis
          const x1 = p.x * cosY + p.z * sinY;
          const y1 = p.y;
          const z1 = -p.x * sinY + p.z * cosY;

          // 2. Rotate around X axis (tilt)
          const x2 = x1;
          const y2 = y1 * cosX - z1 * sinX;
          const z2 = y1 * sinX + z1 * cosX;

          // Scale to screen
          const x2d = centerX + x2 * radius;
          const y2d = centerY + y2 * radius;

          // Depth shading: points facing forward (z2 > 0) are brighter and larger
          const depth = (z2 + 1.2) / 2.4; // Normalized 0 to 1
          const clampedDepth = Math.max(0.1, Math.min(1.0, depth));

          let color = '#ffffff';
          let alpha = 0.25 + clampedDepth * 0.75;
          let r = p.baseRadius * (0.65 + clampedDepth * 0.55);
          let glow = false;

          if (p.colorType === 'lime') {
            color = '#c5ff4a';
            alpha = z2 > 0 ? 0.95 : 0.3;
            r = p.baseRadius * (0.8 + clampedDepth * 0.6);
            glow = z2 > 0;
          } else if (p.colorType === 'glow') {
            color = '#c5ff4a';
            alpha = Math.min(1, 0.4 + Math.sin(time * 0.005 + i) * 0.5);
            r = p.baseRadius * 1.2;
            glow = true;
          } else if (p.colorType === 'dim') {
            color = z2 > 0 ? '#e5e5e5' : '#3d3d3d';
            alpha = z2 > 0 ? 0.45 : 0.15;
          } else {
            color = z2 > 0 ? '#ffffff' : '#525252';
            alpha = z2 > 0 ? 0.85 : 0.22;
          }

          projected.push({
            x2d,
            y2d,
            z: z2,
            r,
            alpha,
            color,
            glow,
          });
        }

        // Sort by Z for proper rendering order
        projected.sort((a, b) => a.z - b.z);

        // Render sorted points
        for (let i = 0; i < projected.length; i++) {
          const pt = projected[i];

          ctx.beginPath();
          ctx.arc(pt.x2d, pt.y2d, pt.r, 0, Math.PI * 2);

          if (pt.glow) {
            ctx.shadowColor = '#c5ff4a';
            ctx.shadowBlur = 8;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.alpha;
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;

        // Render animated transit arcs between edge nodes
        for (let i = 0; i < arcs.length; i++) {
          const arc = arcs[i];
          arc.progress += arc.speed;
          if (arc.progress > 1) arc.progress = 0;

          // Compute start & end positions on rotating sphere
          const sLon = arc.start.lon + rotY;
          const sx = Math.cos(arc.start.lat) * Math.cos(sLon);
          const sy = Math.sin(arc.start.lat);
          const sz = Math.cos(arc.start.lat) * Math.sin(sLon);

          const eLon = arc.end.lon + rotY;
          const ex = Math.cos(arc.end.lat) * Math.cos(eLon);
          const ey = Math.sin(arc.end.lat);
          const ez = Math.cos(arc.end.lat) * Math.sin(eLon);

          // Tilt transformation
          const sy2 = sy * cosX - sz * sinX;
          const sz2 = sy * sinX + sz * cosX;
          const ey2 = ey * cosX - ez * sinX;
          const ez2 = ey * sinX + ez * cosX;

          // Only draw if on front hemisphere
          if (sz2 > -0.2 || ez2 > -0.2) {
            const startX = centerX + sx * radius;
            const startY = centerY + sy2 * radius;
            const endX = centerX + ex * radius;
            const endY = centerY + ey2 * radius;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 - radius * 0.28;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(midX, midY, endX, endY);
            ctx.strokeStyle = 'rgba(197, 255, 74, 0.35)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Traveling signal packet
            const t = arc.progress;
            const px = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
            const py = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#c5ff4a';
            ctx.shadowColor = '#c5ff4a';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    }

    animationFrameId = requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="spinning-globe-canvas"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none cursor-grab active:cursor-grabbing"
    />
  );
}
