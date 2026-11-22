'use client';

import type { ReactNode } from 'react';
import { LiquidButton } from '@/components/ui/liquid-button';

export interface LiquidTab<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

/** A centred row of liquid chips for switching a view in place; the selected chip stays filled. */
export default function LiquidTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
}: {
  tabs: LiquidTab<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap items-center justify-center gap-2">
      {tabs.map((tab) => (
        <LiquidButton
          key={tab.id}
          size="sm"
          variant="dark"
          active={value === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </LiquidButton>
      ))}
    </div>
  );
}
