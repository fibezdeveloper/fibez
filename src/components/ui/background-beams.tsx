"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]",
        className
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        fill="none"
      >
        <defs>
          <linearGradient id="beam-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#3ad389" stopOpacity="0" />
            <stop stopColor="#3ad389" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="1" stopColor="#065f46" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="beam-cyan" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop stopColor="#38bdf8" stopOpacity="0" />
            <stop stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="0.6" stopColor="#0284c7" stopOpacity="0.6" />
            <stop offset="1" stopColor="#082f49" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="beam-violet" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop stopColor="#9281f7" stopOpacity="0" />
            <stop stopColor="#9281f7" stopOpacity="0.25" />
            <stop offset="0.7" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="1" stopColor="#312e81" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d="M-100 200 C 300 100, 600 500, 1540 250"
          stroke="url(#beam-emerald)"
          strokeWidth="1.5"
          strokeDasharray="12 8"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: [0, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />

        <motion.path
          d="M-50 400 C 400 650, 900 150, 1500 500"
          stroke="url(#beam-cyan)"
          strokeWidth="1.2"
          strokeDasharray="14 10"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: [1, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        />

        <motion.path
          d="M-200 700 C 500 300, 1000 800, 1600 350"
          stroke="url(#beam-violet)"
          strokeWidth="1"
          strokeDasharray="16 12"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: [0, 1] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        <motion.path
          d="M100 -50 C 450 400, 800 600, 1200 950"
          stroke="url(#beam-emerald)"
          strokeWidth="1"
          strokeDasharray="8 6"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: [1, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

export default BackgroundBeams;
