"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ContainerTextFlipProps {
  words: string[];
  interval?: number;
  className?: string;
  textClassName?: string;
}

export function ContainerTextFlip({
  words = ["V2Ray Reality Nodes", "AMD EPYC Cloud", "Zero-Trust Subscriptions", "Instant Digital Keys"],
  interval = 3000,
  className,
  textClassName,
}: ContainerTextFlipProps) {
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
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 mx-1.5 rounded-lg border border-[#3ad389]/40 bg-[#3ad389]/10 shadow-[0_0_15px_rgba(58,211,137,0.15)] text-[#3ad389] font-mono text-sm sm:text-base font-semibold overflow-hidden align-middle",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cn("whitespace-nowrap inline-block", textClassName)}
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

export default ContainerTextFlip;
