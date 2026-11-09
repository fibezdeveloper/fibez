import React, { forwardRef } from 'react';

export interface FibezLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  id?: string;
}

export const FibezMonogram = forwardRef<SVGSVGElement, FibezLogoProps>(
  ({ className = 'w-4 h-4', id, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        id={id}
        className={className}
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FIBEZ Monogram"
        {...props}
      >
        <path d="M 27 36 L 38 17 L 94 17 L 86 31 L 45 31 L 41 36 Z" />
        <path d="M 11 42 L 61 42 L 47 68 L 69 68 L 61 81 L 27 81 L 41 55 L 18 55 Z" />
        <path d="M 17 61 L 31 61 L 20 81 L 6 81 Z" />
      </svg>
    );
  }
);

FibezMonogram.displayName = 'FibezMonogram';

export default function FibezLogo({
  className = '',
  size = 'md',
  withVersion = false,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withVersion?: boolean;
}) {
  const sizeClasses = {
    sm: {
      tile: 'w-7 h-7 rounded-md',
      icon: 'w-4 h-4',
      text: 'text-[16px] tracking-[0.22em]',
      gap: 'gap-2.5',
    },
    md: {
      tile: 'w-8 h-8 rounded-lg',
      icon: 'w-4.5 h-4.5',
      text: 'text-[20px] tracking-[0.28em]',
      gap: 'gap-3',
    },
    lg: {
      tile: 'w-9 h-9 rounded-xl',
      icon: 'w-5 h-5',
      text: 'text-[24px] tracking-[0.32em]',
      gap: 'gap-3.5',
    },
  }[size];

  return (
    <div className={`inline-flex items-center ${sizeClasses.gap} select-none group ${className}`}>
      <div
        className={`${sizeClasses.tile} bg-white/5 border border-white/15 group-hover:border-white/30 group-hover:bg-white/10 flex items-center justify-center transition-all shrink-0`}
      >
        <FibezMonogram className={`${sizeClasses.icon} text-white transition-colors`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`font-mono ${sizeClasses.text} font-bold text-white select-none`}>
          FIBEZ
        </span>
        {withVersion && (
          <span className="font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
            VAULT
          </span>
        )}
      </div>
    </div>
  );
}
