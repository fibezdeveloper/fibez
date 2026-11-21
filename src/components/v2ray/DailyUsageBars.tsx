'use client';

import React, { useState } from 'react';

export interface DailyUsagePoint {
  date: string; // YYYY-MM-DD
  downGB: number;
  upGB: number;
  known: boolean;
}

/** Daily data usage as stacked bars (download + upload). Days we hold no snapshot for show as an empty slot. */
export default function DailyUsageBars({
  series,
  trackingSince,
}: {
  series: DailyUsagePoint[];
  trackingSince: string | null;
}) {
  const [range, setRange] = useState<7 | 14>(7);
  const [hover, setHover] = useState<number | null>(null);

  const data = series.slice(-range);
  const max = Math.max(0.1, ...data.map((d) => d.downGB + d.upGB));
  const total = data.reduce((s, d) => s + d.downGB + d.upGB, 0);
  const anyKnown = data.some((d) => d.known);
  const label = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  const fmt = (n: number) => (n >= 10 ? n.toFixed(1) : n.toFixed(2));

  return (
    <div className="p-6 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Data usage per day</h3>
          <p className="text-xs text-[#a1a4a5] mt-1">
            {anyKnown ? `${fmt(total)} GB used in the last ${range} days` : 'Waiting for the first nightly snapshot'}
            {trackingSince ? ` · tracked since ${trackingSince}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#3ad389]" /> Download
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]" /> Upload
            </span>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#141417] border border-[#1f1f23] text-[11px] font-mono">
            {[7, 14].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r as 7 | 14)}
                className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  range === r ? 'bg-[#3ad389] text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r} days
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        {/* gridlines */}
        <div className="absolute inset-x-0 top-0 h-40 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-t border-dashed border-[#1c1c21]" />
          ))}
        </div>
        <div className="absolute left-0 top-0 h-40 flex flex-col justify-between text-[10px] font-mono text-zinc-600 pointer-events-none -translate-y-1.5">
          <span>{fmt(max)} GB</span>
          <span>{fmt(max / 2)}</span>
          <span>0</span>
        </div>

        <div className="relative h-40 ml-10 flex items-end gap-1.5 sm:gap-2.5" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => {
            const down = (d.downGB / max) * 100;
            const up = (d.upGB / max) * 100;
            return (
              <div
                key={d.date}
                className="relative flex-1 h-full flex items-end justify-center"
                onMouseEnter={() => setHover(i)}
              >
                {d.known ? (
                  <div className="w-full max-w-[34px] flex flex-col-reverse rounded-t-md overflow-hidden">
                    <div className="bg-[#3ad389]" style={{ height: `${Math.max(down, d.downGB > 0 ? 1.5 : 0)}%`, minHeight: d.downGB > 0 ? 2 : 0 }} />
                    <div className="bg-[#06b6d4]" style={{ height: `${Math.max(up, d.upGB > 0 ? 1.5 : 0)}%`, minHeight: d.upGB > 0 ? 2 : 0 }} />
                  </div>
                ) : (
                  <div className="w-full max-w-[34px] h-1 rounded-full bg-[#1c1c21]" title="No snapshot for this day" />
                )}

                {hover === i && (
                  <div className="absolute bottom-full mb-2 z-10 px-2.5 py-1.5 rounded-lg bg-[#16161a] border border-[#26262b] text-[11px] font-mono text-white whitespace-nowrap shadow-xl">
                    <div className="text-zinc-400">{label(d.date)}</div>
                    {d.known ? (
                      <>
                        <div>
                          <span className="text-[#3ad389]">↓</span> {fmt(d.downGB)} GB
                        </div>
                        <div>
                          <span className="text-[#06b6d4]">↑</span> {fmt(d.upGB)} GB
                        </div>
                      </>
                    ) : (
                      <div className="text-zinc-500">No data</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="ml-10 mt-2 flex gap-1.5 sm:gap-2.5">
          {data.map((d, i) => (
            <div key={d.date} className="flex-1 text-center text-[10px] font-mono text-zinc-500">
              {range === 14 && i % 2 === 1 ? '' : label(d.date)}
            </div>
          ))}
        </div>
      </div>

      {!anyKnown && (
        <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed">
          The V2Ray panel only reports your running total, so daily usage is calculated from a snapshot we take every
          night. Bars appear from the second day of tracking.
        </p>
      )}
    </div>
  );
}
