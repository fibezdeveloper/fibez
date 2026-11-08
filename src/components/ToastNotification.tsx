'use client';

import React, { useState, useEffect } from 'react';

interface ToastState {
  visible: boolean;
  label: string;
  payload: string;
}

export default function ToastNotification() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    label: '',
    payload: '',
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleToast = (e: any) => {
      const { label, payload } = e.detail || {};
      setToast({
        visible: true,
        label: label || 'Instant Dispatch',
        payload: payload || '',
      });

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 4500);
    };

    window.addEventListener('fibez:toast', handleToast);
    return () => {
      window.removeEventListener('fibez:toast', handleToast);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <div
      id="toast-notification"
      className={`fixed bottom-16 right-4 z-50 max-w-md bg-voidBlack border border-signalLime p-5 rounded-[4px] glow-lime transition-all duration-300 font-mono text-xs ${
        toast.visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-signalLime uppercase mb-1.5">
        <span>✓ FIBEZ INSTANT DISPATCH</span>
        <button onClick={hideToast} className="text-ash hover:text-chalk">
          ✕
        </button>
      </div>
      <div id="toast-message" className="text-chalk font-sans text-sm mb-2">
        {toast.label} copied to clipboard.
      </div>
      <div
        id="toast-code"
        className="bg-graphite p-2.5 rounded-[2px] text-[11px] text-signalLime break-all border border-iron select-all"
      >
        {toast.payload}
      </div>
    </div>
  );
}
