"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useDevicePerf } from "@/lib/use-device-perf";

export interface MeteorsProps {
  number?: number;
  className?: string;
  color?: string;
}

export const Meteors = ({ number = 15, className, color = "emerald" }: MeteorsProps) => {
  const { prefersReducedMotion, isLowTier } = useDevicePerf();

  // If user prefers reduced motion, disable completely; if on iPhone 8 Plus/low-end, cap to 4
  // Background effect: only at the full animation level (none on phones/tablets or slow machines).
  const effectiveCount = prefersReducedMotion || isLowTier ? 0 : number;

  const meteors = useMemo(() => {
    if (effectiveCount <= 0) return [];
    return new Array(effectiveCount).fill(true).map(() => ({
      left: `${Math.floor(Math.random() * 800) - 400}px`,
      animationDelay: `${Math.random() * (0.8 - 0.2) + 0.2}s`,
      animationDuration: `${Math.floor(Math.random() * (10 - 2) + 2)}s`,
    }));
  }, [effectiveCount]);

  if (effectiveCount <= 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
      {meteors.map((meteor, idx) => (
        <span
          key={`meteor-${idx}`}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-[#3ad389] shadow-[0_0_0_1px_#3ad38940] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#3ad389] before:to-transparent",
            className
          )}
          style={{
            top: 0,
            left: meteor.left,
            animationDelay: meteor.animationDelay,
            animationDuration: meteor.animationDuration,
          }}
        />
      ))}
    </div>
  );
};

export default Meteors;
