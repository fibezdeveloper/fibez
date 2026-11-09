'use client';

import React, { useEffect, useState } from 'react';
import SlingButton from '@/components/SlingButton';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setVisible(window.scrollY > 320);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      className={`fixed bottom-7 right-7 z-50 flex flex-col items-center gap-2 transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-4 pointer-events-none scale-90'
      }`}
      title="Tap or drag to slingshot back to top"
    >
      <div className="relative group">
        <SlingButton
          onSend={handleScrollToTop}
          padColor="#f0f0f0"
          iconColor="#000000"
          accentColor="#ffffff"
          wellColor="#141618"
          bandColor="#292d30"
          size={52}
          strokeWidth={3}
          armAt={42}
          maxPull={140}
          launchSpeed={2600}
          recoil={0.2}
          flight={100}
          particles={16}
          spread={60}
          axis="any"
          tapSends={true}
          ariaLabel="Back to top"
          className="shadow-2xl hover:scale-105 transition-transform"
        />

        {/* Floating helper badge */}
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-[#292d30] text-[10px] font-mono text-[#a1a4a5] px-2 py-0.5 rounded-[4px] whitespace-nowrap pointer-events-none">
          TOP
        </span>
      </div>
    </div>
  );
}
