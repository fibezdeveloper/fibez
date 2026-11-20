'use client';

import React, { useState } from 'react';

export interface ChartDataPoint {
  date: string;
  primaryValue: number;
  secondaryValue?: number;
  label?: string;
}

interface WindsterAreaChartProps {
  title: string;
  subtitle: string;
  data: ChartDataPoint[];
  primaryName?: string;
  secondaryName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  unit?: string;
  trendText?: string;
  trendPositive?: boolean;
  timeRanges?: { label: string; value: string }[];
  activeRange?: string;
  onRangeChange?: (range: string) => void;
  views?: { label: string; value: string }[];
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function WindsterAreaChart({
  title,
  subtitle,
  data,
  primaryName = 'Download',
  secondaryName = 'Upload',
  primaryColor = '#3ad389',
  secondaryColor = '#06b6d4',
  unit = 'GB',
  trendText,
  trendPositive = true,
  timeRanges,
  activeRange,
  onRangeChange,
  views,
  activeView,
  onViewChange,
}: WindsterAreaChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] text-center text-zinc-400 text-xs">
        No telemetry data available for this range.
      </div>
    );
  }

  // Chart Dimensions
  const svgWidth = 760;
  const svgHeight = 250;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Max calculation
  const allValues = data.flatMap((d) => [d.primaryValue, d.secondaryValue ?? 0]);
  const rawMax = Math.max(...allValues, 10);
  // Round max up nicely
  const maxVal = Math.ceil(rawMax * 1.15);

  const getX = (idx: number) => {
    if (data.length <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (data.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padTop + chartH - (val / maxVal) * chartH;
  };

  // Build smooth bezier spline
  const makeSmoothPath = (values: number[]) => {
    if (values.length === 0) return '';
    const points = values.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const primaryValues = data.map((d) => d.primaryValue);
  const secondaryValues = data.map((d) => d.secondaryValue ?? 0);

  const primaryLineD = makeSmoothPath(primaryValues);
  const secondaryLineD = makeSmoothPath(secondaryValues);

  // Closed area polygon for primary
  const firstX = getX(0);
  const lastX = getX(data.length - 1);
  const baseY = padTop + chartH;

  const primaryAreaD = `${primaryLineD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  const secondaryAreaD = `${secondaryLineD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;

  // Grid steps (4 horizontal lines)
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  // Active hover point
  const currentHover = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];
  const activeIdx = hoverIndex !== null ? hoverIndex : data.length - 1;

  return (
    <div className="p-6 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] shadow-2xl relative overflow-hidden group">
      {/* Header with Title, Stats & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {trendText && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  trendPositive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {trendText}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Action Controls (View switch & Range pills) */}
        <div className="flex items-center flex-wrap gap-2">
          {views && onViewChange && (
            <div className="flex items-center p-0.5 rounded-xl bg-[#141418] border border-[#22222a]">
              {views.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => onViewChange(v.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeView === v.value
                      ? 'bg-[#22222a] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          {timeRanges && onRangeChange && (
            <div className="flex items-center p-0.5 rounded-xl bg-[#141418] border border-[#22222a]">
              {timeRanges.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onRangeChange(r.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    activeRange === r.value
                      ? 'bg-[#3ad389] text-black font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend & Hovered Detail Stat Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3 pb-3 border-b border-[#18181f]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="text-zinc-300 font-medium">{primaryName}:</span>
            <span className="text-white font-bold">
              {currentHover.primaryValue.toLocaleString()} {unit}
            </span>
          </div>

          {currentHover.secondaryValue !== undefined && (
            <div className="flex items-center gap-1.5 font-mono">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
              <span className="text-zinc-300 font-medium">{secondaryName}:</span>
              <span className="text-white font-bold">
                {currentHover.secondaryValue.toLocaleString()} {unit}
              </span>
            </div>
          )}
        </div>

        <div className="text-zinc-400 font-mono text-[11px]">
          Target Date: <span className="text-zinc-200 font-bold">{currentHover.date}</span>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[560px] select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Primary Gradient */}
            <linearGradient id="windsterPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
            </linearGradient>

            {/* Secondary Gradient */}
            <linearGradient id="windsterSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-axis labels */}
          {gridSteps.map((step) => {
            const y = padTop + chartH - step * chartH;
            const stepVal = Math.round(step * maxVal);
            return (
              <g key={step}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke="#1c1c24"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#71717a"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {stepVal.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Secondary Area & Line (Upload) */}
          {data[0]?.secondaryValue !== undefined && (
            <>
              <path d={secondaryAreaD} fill="url(#windsterSecondaryGrad)" />
              <path
                d={secondaryLineD}
                fill="none"
                stroke={secondaryColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Primary Area & Line (Download / Revenue) */}
          <path d={primaryAreaD} fill="url(#windsterPrimaryGrad)" />
          <path
            d={primaryLineD}
            fill="none"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* X-axis Date Labels */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = activeIdx === i;
            return (
              <text
                key={d.date + i}
                x={x}
                y={svgHeight - 12}
                textAnchor="middle"
                fill={isHovered ? '#ffffff' : '#71717a'}
                fontWeight={isHovered ? 'bold' : 'normal'}
                fontSize="11"
                fontFamily="monospace"
              >
                {d.date}
              </text>
            );
          })}

          {/* Vertical Cursor Indicator & Data Nodes */}
          {activeIdx !== null && (
            <g>
              <line
                x1={getX(activeIdx)}
                y1={padTop}
                x2={getX(activeIdx)}
                y2={baseY}
                stroke="#3f3f46"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />

              {/* Primary Point Dot */}
              <circle
                cx={getX(activeIdx)}
                cy={getY(data[activeIdx].primaryValue)}
                r="5"
                fill={primaryColor}
                stroke="#0c0c0e"
                strokeWidth="2.5"
                className="transition-all"
              />

              {/* Secondary Point Dot */}
              {data[activeIdx].secondaryValue !== undefined && (
                <circle
                  cx={getX(activeIdx)}
                  cy={getY(data[activeIdx].secondaryValue ?? 0)}
                  r="4.5"
                  fill={secondaryColor}
                  stroke="#0c0c0e"
                  strokeWidth="2"
                  className="transition-all"
                />
              )}
            </g>
          )}

          {/* Transparent Hover Hit Areas per Data Point */}
          {data.map((_, i) => {
            const x = getX(i);
            const halfStep = chartW / Math.max(1, data.length - 1) / 2;
            return (
              <rect
                key={i}
                x={x - halfStep}
                y={padTop}
                width={halfStep * 2}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
