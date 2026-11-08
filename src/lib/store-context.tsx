'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem } from '@/lib/products';

export interface CartItem {
  id: string; // unique item id in cart
  productId: string;
  product: ProductItem;
  durationLabel: string;
  durationDays: number;
  quantity: number;
  priceLKR: number;
  priceUSD: number;
}

interface StoreContextType {
  currency: 'LKR' | 'USD';
  setCurrency: (currency: 'LKR' | 'USD') => void;
  cart: CartItem[];
  addToCart: (product: ProductItem, durationIndex?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotalLKR: number;
  cartTotalUSD: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  authMode: 'login' | 'register';
  openAuth: (mode?: 'login' | 'register') => void;
  closeAuth: () => void;
  formatPrice: (priceLKR: number, priceUSD: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<'LKR' | 'USD'>('LKR');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [hasHydrated, setHasHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem('fibez_currency');
      if (savedCurrency === 'USD' || savedCurrency === 'LKR') {
        setCurrencyState(savedCurrency);
      }
      const savedCart = localStorage.getItem('fibez_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      // LocalStorage access might fail in private windows or restrictions
    }
    setHasHydrated(true);
  }, []);

  // Save changes to localStorage after hydration
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem('fibez_currency', currency);
    } catch (e) {}
  }, [currency, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem('fibez_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart, hasHydrated]);

  const setCurrency = (curr: 'LKR' | 'USD') => {
    setCurrencyState(curr);
  };

  const addToCart = (product: ProductItem, durationIndex: number = 0) => {
    const selectedDuration = product.durations[durationIndex] || product.durations[0];
    const multiplier = selectedDuration?.multiplier || 1;
    const priceLKR = Math.round(product.priceLKR * multiplier);
    const priceUSD = parseFloat((product.priceUSD * multiplier).toFixed(2));
    const cartItemId = `${product.id}-${selectedDuration?.days || 30}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: cartItemId,
          productId: product.id,
          product,
          durationLabel: selectedDuration?.label || '1 Month',
          durationDays: selectedDuration?.days || 30,
          quantity: 1,
          priceLKR,
          priceUSD,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
  };

  const formatPrice = (priceLKR: number, priceUSD: number) => {
    if (currency === 'USD') {
      return `$${priceUSD.toFixed(2)}`;
    }
    return `Rs. ${priceLKR.toLocaleString()}`;
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalLKR = cart.reduce((total, item) => total + item.priceLKR * item.quantity, 0);
  const cartTotalUSD = cart.reduce((total, item) => total + item.priceUSD * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        currency,
        setCurrency,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotalLKR,
        cartTotalUSD,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        authMode,
        openAuth,
        closeAuth,
        formatPrice,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
