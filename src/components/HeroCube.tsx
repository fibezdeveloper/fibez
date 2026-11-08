'use client';

import React, { useEffect, useRef } from 'react';

export default function HeroCube() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 440);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 440);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Cube vertices (centered at 0,0,0)
    const size = 110;
    const baseVertices = [
      [-size, -size, -size],
      [size, -size, -size],
      [size, size, -size],
      [-size, size, -size],
      [-size, -size, size],
      [size, -size, size],
      [size, size, size],
      [-size, size, size],
    ];

    // Inner core vertices for high-tech geometric depth
    const innerSize = 55;
    const innerVertices = [
      [-innerSize, -innerSize, -innerSize],
      [innerSize, -innerSize, -innerSize],
      [innerSize, innerSize, -innerSize],
      [-innerSize, innerSize, -innerSize],
      [-innerSize, -innerSize, innerSize],
      [innerSize, -innerSize, innerSize],
      [innerSize, innerSize, innerSize],
      [-innerSize, innerSize, innerSize],
    ];

    // Cube edges connecting vertex indices
    const edges = [
      // Back face
      [0, 1], [1, 2], [2, 3], [3, 0],
      // Front face
      [4, 5], [5, 6], [6, 7], [7, 4],
      // Connecting edges
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    // Cube 6 faces (indices of 4 vertices, in winding order)
    const faces = [
      [0, 1, 2, 3], // Back
      [4, 5, 6, 7], // Front
      [0, 1, 5, 4], // Top
      [2, 3, 7, 6], // Bottom
      [0, 3, 7, 4], // Left
      [1, 2, 6, 5], // Right
    ];

    let rotX = 0.45;
    let rotY = 0.65;
    let rotZ = 0.15;
    let targetRotX = 0.45;
    let targetRotY = 0.65;
    let isHovered = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = 0.65 + x * 1.2;
      targetRotX = 0.45 - y * 1.2;
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const fov = 420;

    const project = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
      // Rotate around X
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);
      let x1 = x;

      // Rotate around Y
      let x2 = x1 * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x1 * Math.sin(ry) + z1 * Math.cos(ry);
      let y2 = y1;

      // Rotate around Z
      let x3 = x2 * Math.cos(rz) - y2 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y2 * Math.cos(rz);
      let z3 = z2;

      // Perspective projection
      const distance = 460;
      const scale = fov / (distance + z3);
      const projX = x3 * scale + width / 2;
      const projY = y3 * scale + height / 2;

      return { x: projX, y: projY, z: z3, scale };
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Autonomous gentle spin
      if (!isHovered) {
        targetRotY += 0.4 * delta;
        targetRotX = 0.45 + Math.sin(time * 0.0008) * 0.15;
      }

      // Smooth interpolation
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;
      rotZ = Math.sin(time * 0.0004) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Project vertices
      const projOuter = baseVertices.map((v) => project(v[0], v[1], v[2], rotX, rotY, rotZ));
      const projInner = innerVertices.map((v) => project(v[0], v[1], v[2], rotX, rotY, rotZ));

      // Calculate face depths and render back-to-front
      const faceDepths = faces.map((face, index) => {
        const avgZ = (projOuter[face[0]].z + projOuter[face[1]].z + projOuter[face[2]].z + projOuter[face[3]].z) / 4;
        return { index, avgZ, face };
      });

      // Sort faces back-to-front (larger Z is farther in this coordinate setup)
      faceDepths.sort((a, b) => b.avgZ - a.avgZ);

      // Draw faces with subtle dark matte shading
      faceDepths.forEach(({ face, avgZ }) => {
        ctx.beginPath();
        ctx.moveTo(projOuter[face[0]].x, projOuter[face[0]].y);
        ctx.lineTo(projOuter[face[1]].x, projOuter[face[1]].y);
        ctx.lineTo(projOuter[face[2]].x, projOuter[face[2]].y);
        ctx.lineTo(projOuter[face[3]].x, projOuter[face[3]].y);
        ctx.closePath();

        // Shading based on depth: Resend dark matte
        const alpha = Math.max(0.65, Math.min(0.95, 0.85 - avgZ / 300));
        ctx.fillStyle = `rgba(5, 5, 5, ${alpha})`;
        ctx.fill();

        // Subtle hairline face border
        ctx.strokeStyle = '#181b1d';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw inner core wireframe (architectural technical depth)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(146, 129, 247, 0.25)'; // Signature Iris Violet faint core
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projInner[i].x, projInner[i].y);
        ctx.lineTo(projInner[j].x, projInner[j].y);
        ctx.stroke();
      });

      // Connect inner to outer corners with fine hairline struts
      ctx.strokeStyle = 'rgba(41, 45, 48, 0.45)';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(projOuter[i].x, projOuter[i].y);
        ctx.lineTo(projInner[i].x, projInner[i].y);
        ctx.stroke();
      }

      // Draw primary outer edges: Resend Graphite Hairline (#292d30 / #464a4d)
      edges.forEach(([i, j]) => {
        const zMid = (projOuter[i].z + projOuter[j].z) / 2;
        // Front-facing edges are crisper
        const isFront = zMid < 0;
        ctx.beginPath();
        ctx.moveTo(projOuter[i].x, projOuter[i].y);
        ctx.lineTo(projOuter[j].x, projOuter[j].y);
        ctx.strokeStyle = isFront ? '#464a4d' : '#292d30';
        ctx.lineWidth = isFront ? 1.5 : 1;
        ctx.stroke();
      });

      // Draw vertex corner dots
      projOuter.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.z < 0 ? '#f0f0f0' : '#464a4d';
        ctx.fill();
      });

      // Draw central pulse dot in Iris Violet
      const centerProj = project(0, 0, 0, rotX, rotY, rotZ);
      ctx.beginPath();
      ctx.arc(centerProj.x, centerProj.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#9281f7';
      ctx.shadowColor = '#9281f7';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto flex items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        title="Interactive 3D Vault Engine"
      />
      {/* Micro-label below the cube in Commit Mono */}
      <div className="absolute bottom-1 right-2 flex items-center gap-1.5 font-mono text-[11px] text-[#6e727a] tracking-wider uppercase pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9281f7]" />
        <span>VAULT-ENGINE // 3D-STATE</span>
      </div>
    </div>
  );
}
