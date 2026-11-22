'use client';

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AnimatedButtonVariant = 'default' | 'emerald' | 'dark' | 'outline' | 'amber' | 'blue' | 'purple';
export type AnimatedButtonSize = 'sm' | 'md' | 'lg';

export type AnimatedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  MotionProps & {
    children?: React.ReactNode;
    as?: any;
    href?: string;
    target?: string;
    rel?: string;
    variant?: AnimatedButtonVariant;
    size?: AnimatedButtonSize;
    shineColor?: string;
  };

/**
 * AnimatedButton (Vengence UI Shine Style)
 * - Continuous dual shine effect: sweeping border highlight + text shimmer mask
 * - Spring-physics hover scale (1.02) and active tap compression (0.97)
 * - Optimized for dark luxury theme with emerald, dark graphite, and gold presets
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children = 'Browse Components',
  className = '',
  as = 'button',
  variant = 'default',
  size = 'md',
  shineColor,
  type = 'button',
  disabled,
  ...rest
}) => {
  const Component = (motion as any)[as] || motion.button;

  const sizeClasses: Record<AnimatedButtonSize, string> = {
    sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-xs sm:text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-sm sm:text-base rounded-xl gap-2.5',
  };

  const variantStyles: Record<
    AnimatedButtonVariant,
    { base: string; defaultShine: string }
  > = {
    default: {
      base: 'bg-[#121215] hover:bg-[#1a1a20] text-white border border-[#27272a] hover:border-zinc-500 shadow-md',
      defaultShine: 'rgba(255, 255, 255, 0.65)',
    },
    emerald: {
      base: 'bg-[#3ad389] hover:bg-[#34bd7a] text-black font-semibold border border-[#3ad389] shadow-lg shadow-[#3ad389]/20',
      defaultShine: 'rgba(255, 255, 255, 0.9)',
    },
    dark: {
      base: 'bg-[#0a0a0c] hover:bg-[#141418] text-zinc-200 hover:text-white border border-[#1f1f23] hover:border-[#2f2f38] shadow-sm',
      defaultShine: 'rgba(255, 255, 255, 0.5)',
    },
    outline: {
      base: 'bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white border border-white/15 hover:border-white/30',
      defaultShine: 'rgba(58, 211, 137, 0.7)',
    },
    blue: {
      base: 'bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold border border-[#2563eb] shadow-lg shadow-[#1d4ed8]/25',
      defaultShine: 'rgba(147, 180, 255, 0.9)',
    },
    purple: {
      base: 'bg-gradient-to-r from-[#1e1b6e] to-[#5b21b6] hover:from-[#26228a] hover:to-[#6d28d9] text-white font-semibold border border-[#4f46e5] shadow-lg shadow-[#312e81]/40',
      defaultShine: 'rgba(165, 180, 252, 0.9)',
    },
    amber: {
      base: 'bg-amber-400 hover:bg-amber-300 text-black font-semibold border border-amber-400 shadow-lg shadow-amber-400/20',
      defaultShine: 'rgba(255, 255, 255, 0.9)',
    },
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;
  const activeShine = shineColor || selectedVariant.defaultShine;

  return (
    <Component
      type={as === 'button' ? type : undefined}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      style={
        {
          ['--shine' as any]: activeShine,
          ...((rest as any).style || {}),
        } as React.CSSProperties
      }
      className={cn(
        'group inline-flex items-center justify-center relative overflow-hidden font-medium cursor-pointer select-none',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
        variant === 'blue' ? 'focus-visible:ring-[#3b82f6]/60' : variant === 'purple' ? 'focus-visible:ring-[#6366f1]/60' : 'focus-visible:ring-[#3ad389]/50',
        'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        selectedVariant.base,
        className
      )}
      {...rest}
    >
      {/* 1. Text & Content with dynamic shimmer mask */}
      <motion.span
        className="tracking-wide flex items-center justify-center h-full w-full relative z-10 gap-2"
        style={{
          WebkitMaskImage:
            'linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))',
          maskImage:
            'linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))',
        }}
        initial={{ ['--mask-x' as any]: '100%' } as any}
        animate={disabled ? undefined : ({ ['--mask-x' as any]: '-100%' } as any)}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: 'linear',
          repeatDelay: 1.2,
        }}
      >
        {children}
      </motion.span>

      {/* 2. Border shine runner effect */}
      {!disabled && (
        <motion.span
          className="block absolute inset-0 rounded-[inherit] p-px pointer-events-none"
          style={{
            background:
              'linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
          }}
          initial={{ backgroundPosition: '100% 0', opacity: 0 }}
          animate={{ backgroundPosition: ['100% 0', '0% 0'], opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 1.2,
          }}
        />
      )}
    </Component>
  );
};

export default AnimatedButton;
