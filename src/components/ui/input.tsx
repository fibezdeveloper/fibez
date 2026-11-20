"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/10 bg-[#0c0c0e] px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 shadow-input transition-all duration-200",
          "file:border-0 file:bg-transparent file:text-xs file:font-medium",
          "focus-visible:outline-none focus-visible:border-[#3ad389] focus-visible:ring-1 focus-visible:ring-[#3ad389]/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
