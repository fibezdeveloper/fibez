"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  link: string;
}

export function Navbar({ children, className }: { children: React.ReactNode; className?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        maxWidth: isScrolled ? "840px" : "1120px",
        paddingTop: isScrolled ? "0px" : "8px",
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-3 z-50 mx-auto w-full px-4 transition-all duration-300",
        className
      )}
    >
      <div
        className={cn(
          "w-full rounded-2xl border transition-all duration-300",
          isScrolled
            ? "border-white/20 bg-[#0c0c0e]/90 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            : "border-white/10 bg-[#0c0c0e]/60 backdrop-blur-md"
        )}
      >
        {children}
      </div>
    </motion.header>
  );
}

export function NavBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("hidden md:flex items-center justify-between px-5 py-3 h-14", className)}>
      {children}
    </div>
  );
}

export function NavItems({ items = [] }: { items?: NavItem[] }) {
  return (
    <nav className="flex items-center gap-6 text-xs font-mono">
      {items.map((item, idx) => (
        <Link
          key={`nav-item-${idx}`}
          href={item.link}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}

export function NavbarLogo({ text = "F I B E Z" }: { text?: string }) {
  return (
    <Link href="/" className="font-mono text-base font-bold tracking-[0.25em] text-white hover:opacity-90">
      {text}
    </Link>
  );
}

export function NavbarButton({
  children,
  variant = "primary",
  onClick,
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 cursor-pointer",
        variant === "primary"
          ? "bg-[#3ad389] hover:bg-[#32b876] text-black font-semibold shadow-md shadow-[#3ad389]/20"
          : "bg-white/5 hover:bg-white/10 text-white border border-white/10",
        className
      )}
    >
      {children}
    </button>
  );
}

export function MobileNav({ children }: { children: React.ReactNode }) {
  return <div className="block md:hidden px-4 py-3">{children}</div>;
}

export function MobileNavHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between">{children}</div>;
}

export function MobileNavToggle({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 border border-white/10"
      aria-label="Toggle navigation"
    >
      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  );
}

export function MobileNavMenu({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden pt-4 pb-2 space-y-4 border-t border-white/10 mt-3"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
