// The one place the store's bank account lives. Checkout and wallet top-up both read from here.
export const BANK_DETAILS = {
  bankName: 'Commercial Bank',
  accountName: 'W A D Perera',
  accountNumber: '8029527768',
  branch: 'Kapuwatta Minicom',
} as const;
