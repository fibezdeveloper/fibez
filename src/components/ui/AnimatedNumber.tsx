'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// 1. ANIMATED NUMBER (Rolling Odometer / Digit Strip)
// ============================================================================

export interface AnimatedNumberProps {
  value: number | string;
  className?: string;
  formatCommas?: boolean;
}

export function AnimatedNumber({ value, className, formatCommas = false }: AnimatedNumberProps) {
  const displayString = formatCommas && typeof value === 'number'
    ? value.toLocaleString()
    : value.toString();

  return (
    <span className={cn('inline-flex items-center font-mono', className)}>
      <span className="inline-flex relative items-center">
        {displayString.split('').map((char, index) => (
          <SingleNumberHolder key={`${index}-${char}`} value={char} index={index} />
        ))}
      </span>
    </span>
  );
}

function SingleNumberHolder({ value, index }: { value: string; index: number }) {
  const [height, setHeight] = useState<string | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isDigit = !isNaN(parseInt(value, 10));

  useEffect(() => {
    if (containerRef.current) {
      setHeight(getComputedStyle(containerRef.current).height);
    }
  }, []);

  if (!isDigit) {
    return (
      <span className="inline-flex items-center justify-center px-0.5 select-none text-inherit">
        {value}
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      className="relative inline-flex overflow-hidden justify-center items-center h-[1.25em] leading-[1.25em]"
      style={{ height: height || 'auto' }}
    >
      <RenderStrip value={value} eleHeight={height} />
    </span>
  );
}

const zeroToNine = Array.from({ length: 10 }, (_, k) => k);

function RenderStrip({ eleHeight, value }: { eleHeight: string | null; value: string }) {
  const heightInNumber = parseInt(eleHeight?.replace('px', '') || '24', 10);
  const negative = heightInNumber * -1;
  const pos = heightInNumber;
  const prev = useRef(value);

  const currentVal = parseInt(value, 10) || 0;
  const prevVal = parseInt(prev.current, 10) || 0;

  const diff = prevVal - currentVal;
  const dir = currentVal > prevVal ? pos * diff * -1 : negative * diff;

  useEffect(() => {
    prev.current = value;
  }, [value]);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: dir !== 0 ? dir : -pos }}
        animate={{ y: 0 }}
        exit={{ y: currentVal > prevVal ? pos : -pos, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex relative flex-col items-center select-none"
      >
        <span>{value}</span>
      </motion.span>
    </AnimatePresence>
  );
}

// ============================================================================
// 2. ANIMATED SCORE (Color Feedback on Increase / Decrease)
// ============================================================================

export interface AnimatedScoreProps {
  value: number;
  duration?: number;
  className?: string;
  positiveColor?: string;
  negativeColor?: string;
}

export function AnimatedScore({
  value,
  duration = 0.25,
  className,
  positiveColor = '#3ad389',
  negativeColor = '#ff6465',
}: AnimatedScoreProps) {
  const prevValueRef = useRef(value);

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  const forwards = {
    init: { y: -24, opacity: 0, scale: 0.7, color: positiveColor },
    animate: {
      y: 0,
      opacity: 1,
      scale: [1.2, 1],
      color: [positiveColor, positiveColor, 'currentColor'],
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    exit: {
      y: 24,
      opacity: 0,
      scale: 0.7,
      color: negativeColor,
    },
  };

  const backwards = {
    init: { y: 24, opacity: 0, scale: 0.7, color: negativeColor },
    animate: {
      y: 0,
      opacity: 1,
      scale: [1.2, 1],
      color: [negativeColor, negativeColor, 'currentColor'],
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    exit: {
      y: -24,
      opacity: 0,
      scale: 0.7,
      color: positiveColor,
    },
  };

  const variants = value >= prevValueRef.current ? forwards : backwards;
  const direction = value >= prevValueRef.current ? 'forwards' : 'backwards';

  return (
    <span className={cn('relative inline-flex justify-center items-center font-mono', className)}>
      <motion.span layout="size" className="flex justify-center items-center">
        {value.toString().split('').map((number, index) => (
          <ScoreContainer
            direction={direction}
            duration={duration}
            variants={variants}
            number={number}
            key={`${index}-${number}`}
          />
        ))}
      </motion.span>
    </span>
  );
}

function ScoreContainer({
  number,
  variants,
  duration = 0.3,
  direction,
}: {
  number: string;
  variants: any;
  duration?: number;
  direction: string;
}) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          animate="animate"
          className="inline-flex justify-center items-center select-none"
          initial="init"
          exit="exit"
          variants={variants}
          key={number}
          layout="size"
          transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
        >
          {number}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ============================================================================
// 3. QUANTITY STEPPER PILL (Exact Pill from Uploaded Image)
// ============================================================================

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (newValue: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 999,
  step = 1,
  onChange,
  className,
  size = 'md',
  disabled = false,
}: QuantityStepperProps) {
  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDecrement) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canIncrement) {
      onChange(Math.min(max, value + step));
    }
  };

  const sizeStyles = {
    sm: {
      pill: 'px-1 py-0.5 gap-1.5 h-8',
      button: 'w-6 h-6 text-xs',
      number: 'text-xs min-w-[28px]',
      icon: 'w-3 h-3',
    },
    md: {
      pill: 'px-1.5 py-1 gap-2.5 h-10',
      button: 'w-7 h-7 text-sm',
      number: 'text-sm sm:text-base min-w-[36px]',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      pill: 'px-2 py-1.5 gap-3.5 h-12',
      button: 'w-9 h-9 text-base',
      number: 'text-lg sm:text-xl min-w-[48px]',
      icon: 'w-4 h-4',
    },
  }[size];

  return (
    <div
      className={cn(
        'inline-flex items-center justify-between rounded-full bg-[#0c0c0f] border border-[#22222a] shadow-inner select-none transition-all',
        'hover:border-[#2f2f3a] focus-within:border-[#3ad389]/40',
        disabled && 'opacity-50 pointer-events-none',
        sizeStyles.pill,
        className
      )}
    >
      {/* Minus Button */}
      <motion.button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        whileHover={canDecrement ? { scale: 1.1 } : undefined}
        whileTap={canDecrement ? { scale: 0.88 } : undefined}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        aria-label="Decrease quantity"
        className={cn(
          'rounded-full flex items-center justify-center font-bold transition-colors cursor-pointer shrink-0',
          canDecrement
            ? 'bg-[#181820] hover:bg-[#23232c] text-zinc-300 hover:text-white border border-white/5 active:bg-[#282834]'
            : 'bg-[#121216] text-zinc-600 border border-transparent cursor-not-allowed',
          sizeStyles.button
        )}
      >
        <Minus className={sizeStyles.icon} />
      </motion.button>

      {/* Animated Rolling Number */}
      <div className={cn('text-center font-mono font-bold text-white flex items-center justify-center', sizeStyles.number)}>
        <AnimatedNumber value={value} />
      </div>

      {/* Plus Button */}
      <motion.button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        whileHover={canIncrement ? { scale: 1.1 } : undefined}
        whileTap={canIncrement ? { scale: 0.88 } : undefined}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        aria-label="Increase quantity"
        className={cn(
          'rounded-full flex items-center justify-center font-bold transition-colors cursor-pointer shrink-0',
          canIncrement
            ? 'bg-[#181820] hover:bg-[#23232c] text-zinc-300 hover:text-white border border-white/5 active:bg-[#282834]'
            : 'bg-[#121216] text-zinc-600 border border-transparent cursor-not-allowed',
          sizeStyles.button
        )}
      >
        <Plus className={sizeStyles.icon} />
      </motion.button>
    </div>
  );
}

export default AnimatedNumber;
