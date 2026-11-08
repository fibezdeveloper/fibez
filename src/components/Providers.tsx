'use client';

import React from 'react';
import { CurrencyProvider } from '@/context/CurrencyContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
