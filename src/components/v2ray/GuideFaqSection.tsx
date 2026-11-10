'use client';

import React, { useMemo, useState } from 'react';
import { FaqCategory, GuideFaqItem } from '@/lib/v2ray-guide-data';
import {
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Info,
  Search,
} from 'lucide-react';

interface GuideFaqSectionProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  goodToKnowTitle: string;
  goodToKnowPoints: string[];
  faqs: GuideFaqItem[];
}

const FAQ_TABS: { id: FaqCategory; label: string }[] = [
  { id: 'all', label: 'All Questions' },
  { id: 'data', label: 'Data & Packs' },
  { id: 'speed', label: 'Speed & IP' },
  { id: 'devices', label: 'Apps & Devices' },
  { id: 'orders', label: 'Orders & Line Check' },
];

export default function GuideFaqSection({
  eyebrow,
  title,
  subtitle,
  goodToKnowTitle,
  goodToKnowPoints,
  faqs,
}: GuideFaqSectionProps) {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'not-reload': true,
    'gb-limit-vs-unlim': true,
  });

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faqs.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      return (
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      );
    });
  }, [faqs, activeCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="faq" className="space-y-6 pt-6 border-t border-[#181820]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold mb-1.5">
            <HelpCircle className="w-4 h-4 text-white" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQ..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {FAQ_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                isActive
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-black border-white/15 text-zinc-300 hover:border-white/40 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#0e0e12] border border-[#1e1e26] text-xs font-mono text-zinc-400 text-center">
            No FAQ entries match your filter. Clear the search box or choose All Questions.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = Boolean(openIds[faq.id]);
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-[#0e0e12] border border-[#1e1e26] overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Good to know Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0b0f] border border-white/15 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[#3ad389] font-semibold">
          <Info className="w-4 h-4" />
          <span>{goodToKnowTitle}</span>
        </div>
        <ul className="space-y-2">
          {goodToKnowPoints.map((pt, i) => (
            <li
              key={i}
              className="text-xs sm:text-sm text-zinc-300 flex items-start gap-2.5 leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
