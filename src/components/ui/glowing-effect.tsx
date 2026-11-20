"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  glow?: boolean;
  borderWidth?: number;
  disabled?: boolean;
  className?: string;
  color?: string; // e.g. "blue" | "emerald" | hex
}

export function GlowingEffect({
  blur = 0,
  inactiveZone = 0.01,
  proximity = 64,
  spread = 40,
  glow = true,
  borderWidth = 1.5,
  disabled = false,
  className,
  color = "emerald",
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (disabled) return;
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Distance to card boundaries
      const dx = Math.max(0, -x, x - rect.width);
      const dy = Math.max(0, -y, y - rect.height);
      const distance = Math.hypot(dx, dy);

      if (distance <= proximity) {
        setPosition({ x, y });
        const alpha = Math.max(0, 1 - distance / proximity);
        setOpacity(alpha);
      } else {
        setOpacity(0);
      }
    };

    const handlePointerLeave = () => {
      setOpacity(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    parent.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      parent.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [proximity, disabled]);

  if (disabled) return null;

  const glowColor =
    color === "blue"
      ? "rgba(56, 189, 248, 0.85)"
      : color === "emerald"
      ? "rgba(58, 211, 137, 0.85)"
      : color;

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300",
        className
      )}
      style={{
        opacity,
        border: `${borderWidth}px solid transparent`,
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        background: `radial-gradient(${spread * 6}px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 80%)`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    />
  );
}

export default GlowingEffect;
