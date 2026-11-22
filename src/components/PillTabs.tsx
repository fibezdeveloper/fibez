'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import PillNav from '@/components/PillNav';

// Tab links never navigate: the pill moves, the page stays.
function TabLink({ onClick, ...props }: ComponentPropsWithoutRef<'a'>) {
  return (
    <a
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    />
  );
}

export interface PillTab<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

/** A centred row of tabs with the PillNav sliding-pill effect, for switching a view in place. */
export default function PillTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  size = 'md',
}: {
  tabs: PillTab<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="flex justify-center overflow-x-auto no-scrollbar py-1">
      <PillNav
        layout="joined"
        size={size}
        itemStyle="pill"
        hoverEffect="fill"
        indicator="pill"
        highlightColor="#8b5cf6"
        collapse="never"
        intro={false}
        ariaLabel={ariaLabel}
        linkComponent={TabLink}
        items={tabs.map((tab) => ({ label: tab.label, icon: tab.icon, href: `#${tab.id}` }))}
        activeHref={`#${value}`}
        onItemClick={(item) => onChange(item.href!.slice(1) as T)}
      />
    </div>
  );
}
