import { Currency } from './types';

// Default conversion rate baseline: 1 USD ~ 310 LKR
export const DEFAULT_USD_TO_LKR_RATE = 310;

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'LKR') {
    return `LKR ${Math.round(amount).toLocaleString('en-US')}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function convertPrice(amountUSD: number, targetCurrency: Currency): number {
  if (targetCurrency === 'LKR') {
    return Math.round(amountUSD * DEFAULT_USD_TO_LKR_RATE);
  }
  return amountUSD;
}
