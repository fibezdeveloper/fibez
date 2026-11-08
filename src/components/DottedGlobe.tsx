import React from 'react';

export default function DottedGlobe({ className = '' }: { className?: string }) {
  // Pointillist vector map / cyber globe with distributed dots
  return (
    <svg
      viewBox="0 0 1000 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c5ff4a" stopOpacity="0.12" />
          <stop offset="70%" stopColor="#060606" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient center radial glow */}
      <circle cx="500" cy="250" r="260" fill="url(#globe-glow)" />

      {/* Latitude / Longitude hairline orbital curves */}
      <ellipse cx="500" cy="250" rx="340" ry="180" stroke="#252525" strokeWidth="0.75" strokeDasharray="3 4" opacity="0.6" />
      <ellipse cx="500" cy="250" rx="260" ry="140" stroke="#252525" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.4" />
      <ellipse cx="500" cy="250" rx="160" ry="190" stroke="#313131" strokeWidth="0.5" opacity="0.5" />
      <line x1="160" y1="250" x2="840" y2="250" stroke="#252525" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.4" />

      {/* Pointillist dot clusters simulating global edge routing nodes */}
      <g fill="#ffffff">
        {/* Asia / Sri Lanka / Singapore Cluster */}
        <circle cx="680" cy="260" r="2.2" fill="#c5ff4a" opacity="0.9" />
        <circle cx="676" cy="256" r="1.4" opacity="0.7" />
        <circle cx="688" cy="264" r="1.6" opacity="0.8" />
        <circle cx="692" cy="250" r="1.2" opacity="0.6" />
        <circle cx="670" cy="270" r="1.8" opacity="0.75" />
        <circle cx="710" cy="280" r="1.5" opacity="0.7" />
        <circle cx="705" cy="290" r="1.3" opacity="0.5" />
        <circle cx="725" cy="275" r="1.4" opacity="0.6" />
        <circle cx="735" cy="260" r="1.2" opacity="0.5" />
        <circle cx="660" cy="240" r="1.5" opacity="0.7" />
        <circle cx="640" cy="250" r="1.3" opacity="0.6" />
        <circle cx="630" cy="270" r="1.6" opacity="0.75" />

        {/* Europe / Frankfurt Transit Cluster */}
        <circle cx="510" cy="180" r="2.2" fill="#c5ff4a" opacity="0.9" />
        <circle cx="500" cy="175" r="1.4" opacity="0.7" />
        <circle cx="520" cy="170" r="1.5" opacity="0.65" />
        <circle cx="490" cy="185" r="1.2" opacity="0.6" />
        <circle cx="525" cy="190" r="1.6" opacity="0.8" />
        <circle cx="535" cy="180" r="1.3" opacity="0.55" />
        <circle cx="480" cy="170" r="1.4" opacity="0.7" />
        <circle cx="505" cy="195" r="1.2" opacity="0.5" />

        {/* North America / US East Cluster */}
        <circle cx="340" cy="190" r="2.0" fill="#c5ff4a" opacity="0.85" />
        <circle cx="330" cy="180" r="1.4" opacity="0.7" />
        <circle cx="350" cy="200" r="1.5" opacity="0.6" />
        <circle cx="360" cy="185" r="1.3" opacity="0.65" />
        <circle cx="320" cy="195" r="1.2" opacity="0.5" />
        <circle cx="310" cy="210" r="1.6" opacity="0.7" />
        <circle cx="290" cy="190" r="1.3" opacity="0.55" />

        {/* Distributed Background Mesh Dots */}
        {Array.from({ length: 48 }).map((_, i) => {
          const angle = (i / 48) * Math.PI * 2;
          const rx = 240 + (i % 5) * 20;
          const ry = 130 + (i % 4) * 15;
          const cx = 500 + Math.cos(angle) * rx;
          const cy = 250 + Math.sin(angle) * ry;
          const opacity = 0.25 + ((i % 6) * 0.08);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={(i % 3 === 0 ? 1.5 : 1.0)}
              opacity={opacity}
            />
          );
        })}
      </g>

      {/* Transit vector line between Frankfurt and Sri Lanka/Singapore */}
      <path
        d="M 510 180 Q 590 190 680 260"
        stroke="#597321"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        opacity="0.8"
      />
      <path
        d="M 340 190 Q 420 160 510 180"
        stroke="#597321"
        strokeWidth="1.0"
        strokeDasharray="4 4"
        opacity="0.6"
      />
    </svg>
  );
}
