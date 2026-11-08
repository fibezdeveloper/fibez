import React, { forwardRef } from 'react';

export interface FibezLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  id?: string;
}

export const FibezMonogram = forwardRef<SVGSVGElement, FibezLogoProps>(
  ({ className = 'w-5 h-5', id, ...props }, ref) => {
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
  withVersion = true,
}: {
  className?: string;
  withVersion?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 select-none group">
      <div className="w-8 h-8 rounded-[4px] bg-zinc-900 border border-zinc-800 group-hover:border-[#c5ff4a] flex items-center justify-center transition-colors shrink-0">
        <FibezMonogram className="w-5 h-5 text-white group-hover:text-[#c5ff4a] transition-colors" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[16px] font-semibold tracking-[0.24em] text-white group-hover:text-[#c5ff4a] transition-colors">
          FIBEZ
        </span>
        {withVersion && (
          <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
            v4.2
          </span>
        )}
      </div>
    </div>
  );
}
