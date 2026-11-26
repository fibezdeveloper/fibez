"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
  accentColor?: string;
}

const DEFAULT_FIBEZ_FAQS: FaqItem[] = [
  {
    question: "How fast are VLESS VPN configs and product keys delivered?",
    answer: "Instantly upon payment verification. Your personalized VLESS URI connection string, QR code, or digital gift card keys are immediately delivered to your verified email address and permanently saved in your Fibez Key Vault.",
  },
  {
    question: "Which client applications work with Fibez High-Speed VLESS?",
    answer: "We support NetMod Syna (Windows & Android), v2rayNG (Android), Shadowrocket & Streisand (iOS / iPadOS), and Clash / Sing-box across desktop and mobile. Step-by-step 1-click import guides and auto-updating subscription URLs are provided inside your dashboard.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept Sri Lankan Commercial Bank direct bank transfers (upload your slip at checkout) and your pre-funded Fibez Wallet balance.",
  },
  {
    question: "Which Sri Lankan ISPs and packages are supported?",
    answer: "Our core nodes are specifically engineered and routed for Sri Lankan telecom networks including SLT Fibre & 4G, Dialog Axiata, Hutch, and Airtel. We feature dedicated masquerades for Zoom / Teams, Netflix & YouTube streaming, and TikTok / social packages for unthrottled throughput.",
  },
  {
    question: "What happens if a node or my digital account credentials degrade?",
    answer: "If a line stops working or a pathway degrades, open a support ticket from your Key Vault or Support Ticket Center and we will replace or fix it within the 24-hour replacement window.",
  },
  {
    question: "Can I connect multiple devices simultaneously?",
    answer: "Yes! Depending on your chosen tier (Basic 1 Device, Premium 2 Devices, Private Dedicated 3 Devices), our nodes enforce strict hardware token separation so your bandwidth remains at line-rate without disconnecting your other devices.",
  },
  {
    question: "How does the Pre-Funded Wallet and Referral bonus work?",
    answer: "You can pre-fund your wallet via local bank deposit (/billing) for 1-click instant subscription renewals. Every user also receives a unique referral link (e.g. 7SEOBCQL) that awards Rs 100.00 wallet credit whenever a referred member activates their first line.",
  },
];

export function FaqAccordion({
  items = DEFAULT_FIBEZ_FAQS,
  title,
  className,
  ...props
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto py-6 relative font-sans", className)} {...props}>
      {title && (
        <h2 className="text-center font-bold text-2xl md:text-3xl mb-8 text-white tracking-tight">
          {title}
        </h2>
      )}

      <ul className="w-full mx-auto list-none p-0 flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0e]/80 backdrop-blur-sm shadow-xl">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              className={cn(
                "w-full relative transition-all duration-300 ease-in",
                "border-b border-white/[0.08]",
                "last:border-b-0",
                isActive ? "border-b border-white/[0.15]" : ""
              )}
            >
              <button
                type="button"
                className={cn(
                  "flex flex-row items-center justify-start w-full min-h-[64px] py-4 relative m-0 px-4 pl-14 cursor-pointer",
                  "border-l-[6px] md:border-l-[8px] transition-all duration-200 text-left outline-none text-base md:text-lg",
                  isActive
                    ? "border-l-[#3ad389] bg-[#3ad389]/[0.08] text-white font-semibold shadow-inner"
                    : "border-l-[#1f1f26] bg-transparent text-zinc-300 hover:border-l-zinc-500 hover:text-white hover:bg-white/[0.02]"
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                {/* Plus / Minus Indicator */}
                <span
                  className={cn(
                    "absolute left-4 md:left-5 top-1/2 -translate-y-1/2 transition-all duration-200 leading-none select-none",
                    isActive
                      ? "text-[28px] md:text-[34px] font-light text-[#3ad389]"
                      : "text-[22px] md:text-[28px] font-light text-zinc-500 group-hover:text-zinc-300"
                  )}
                >
                  {isActive ? "−" : "+"}
                </span>

                <span className="pr-10 text-sm sm:text-base font-medium">{item.question}</span>

                {/* Animated Chevron */}
                <span
                  className={cn(
                    "absolute right-5 block w-2 h-2 border-t-2 border-r-2 transition-transform duration-200 ease-in-out shrink-0",
                    isActive
                      ? "rotate-[-45deg] border-[#3ad389] translate-y-0.5"
                      : "rotate-[135deg] border-zinc-500 -translate-y-0.5"
                  )}
                />
              </button>

              {/* Animated Expansion Content via CSS Grid */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out w-full",
                  "border-l-[6px] md:border-l-[8px]",
                  isActive
                    ? "grid-rows-[1fr] border-l-[#3ad389] bg-[#3ad389]/[0.04]"
                    : "grid-rows-[0fr] border-l-transparent bg-transparent"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-row items-start justify-start w-full px-4 pl-14 pb-5 pt-1 text-xs sm:text-sm font-normal text-zinc-300 leading-relaxed border-t border-white/[0.04]">
                    <div className="opacity-95">{item.answer}</div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
