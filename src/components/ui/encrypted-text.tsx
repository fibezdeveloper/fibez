"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface EncryptedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  revealDelayMs?: number;
  flipDelayMs?: number;
  charset?: string;
  className?: string;
  encryptedClassName?: string;
  revealedClassName?: string;
  onComplete?: () => void;
}

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

export function EncryptedText({
  text,
  revealDelayMs = 50,
  flipDelayMs = 40,
  charset = DEFAULT_CHARSET,
  className,
  encryptedClassName = "text-neutral-500",
  revealedClassName = "text-white",
  onComplete,
  ...props
}: EncryptedTextProps) {
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const revealIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomChar = () => {
    return charset[Math.floor(Math.random() * charset.length)];
  };

  useEffect(() => {
    if (!text) {
      setScrambled([]);
      setRevealedCount(0);
      return;
    }

    // Initialize scrambled array
    const initial = text.split("").map((c) => (c === " " ? " " : getRandomChar()));
    setScrambled(initial);
    setRevealedCount(0);

    // Scramble flipping interval for unrevealed characters
    intervalRef.current = setInterval(() => {
      setScrambled((prev) => {
        return text.split("").map((char, i) => {
          if (char === " ") return " ";
          // If already revealed, keep real character
          // otherwise pick a new random glyph
          return getRandomChar();
        });
      });
    }, flipDelayMs);

    // Progressive character reveal interval
    revealIntervalRef.current = setInterval(() => {
      setRevealedCount((curr) => {
        const next = curr + 1;
        if (next >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
          if (onComplete) onComplete();
          return text.length;
        }
        return next;
      });
    }, revealDelayMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
    };
  }, [text, revealDelayMs, flipDelayMs, charset]);

  return (
    <span
      className={cn("inline-block font-mono tracking-tight select-none", className)}
      role="text"
      aria-label={text}
      {...props}
    >
      {text.split("").map((char, index) => {
        const isRevealed = index < revealedCount;
        return (
          <span
            key={index}
            className={cn(
              "transition-colors duration-100",
              isRevealed ? revealedClassName : encryptedClassName
            )}
          >
            {isRevealed ? char : scrambled[index] || char}
          </span>
        );
      })}
    </span>
  );
}

export default EncryptedText;
