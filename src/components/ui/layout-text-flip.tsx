"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LayoutTextFlipProps {
  text?: string;
  words?: string[];
  interval?: number;
  className?: string;
  textClassName?: string;
  wordClassName?: string;
}

export function LayoutTextFlip({
  text = "Welcome to ",
  words = ["Fibez V2Ray", "Airflight Tier-1 Nodes", "Zero-Trust Cloud", "Instant Vault"],
  interval = 2800,
  className,
  textClassName,
  wordClassName,
}: LayoutTextFlipProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval]);

  const currentWord = words[index] || "";

  return (
    <div className={cn("inline-flex items-center justify-center gap-2 flex-wrap font-sans", className)}>
      {text && (
        <span className={cn("text-xl sm:text-2xl md:text-3xl font-medium text-white tracking-tight", textClassName)}>
          {text}
        </span>
      )}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className={cn(
          "relative inline-flex items-center px-3.5 py-1 rounded-xl bg-white/[0.08] border border-white/15 text-white font-mono text-xl sm:text-2xl md:text-3xl font-bold shadow-lg shadow-[#3ad389]/10",
          wordClassName
        )}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#3ad389] to-teal-300 whitespace-nowrap"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </div>
  );
}

export default LayoutTextFlip;
