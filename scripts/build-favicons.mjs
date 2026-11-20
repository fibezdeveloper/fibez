import fs from 'fs';
import { execSync } from 'child_process';

// 1. Vector SVG for modern browsers (Chrome, Edge, Firefox, Safari)
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="fibezGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f4f4f5" />
    </linearGradient>
    <linearGradient id="emeraldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3ad389" />
      <stop offset="100%" stop-color="#22c55e" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#3ad389" flood-opacity="0.3" />
    </filter>
  </defs>
  <!-- Dark Rounded Tile -->
  <rect width="100" height="100" rx="22" fill="#09090b" />
  <rect width="98" height="98" x="1" y="1" rx="21" fill="none" stroke="#27272a" stroke-width="1.5" />
  <!-- Fibez Monogram -->
  <g filter="url(#glow)">
    <path d="M 27 36 L 38 17 L 94 17 L 86 31 L 45 31 L 41 36 Z" fill="url(#fibezGrad)" />
    <path d="M 11 42 L 61 42 L 47 68 L 69 68 L 61 81 L 27 81 L 41 55 L 18 55 Z" fill="url(#fibezGrad)" />
    <path d="M 17 61 L 31 61 L 20 81 L 6 81 Z" fill="url(#emeraldAccent)" />
  </g>
</svg>`;

fs.writeFileSync('public/favicon.svg', svgFavicon, 'utf8');
console.log('Successfully wrote public/favicon.svg');

// 2. Composite 512x512 master badge from public/logo.png onto #09090b background
const masterBadge = 'temp_master_badge.png';
execSync(
  `ffmpeg -y -f lavfi -i "color=c=0x09090b:s=512x512" -i public/logo.png -filter_complex "[0:v][1:v]overlay=(W-w)/2:(H-h)/2" -frames:v 1 ${masterBadge}`,
  { stdio: 'pipe' }
);
console.log('Created master badge');

// 3. Export all required PNG icons
const pngTargets = [
  { path: 'public/favicon-96x96.png', size: 96 },
  { path: 'public/apple-touch-icon.png', size: 180 },
  { path: 'public/web-app-manifest-192x192.png', size: 192 },
  { path: 'public/web-app-manifest-512x512.png', size: 512 },
  { path: 'src/app/icon.png', size: 512 },
];

for (const target of pngTargets) {
  execSync(
    `ffmpeg -y -i ${masterBadge} -vf "scale=${target.size}:${target.size}" -frames:v 1 ${target.path}`,
    { stdio: 'pipe' }
  );
  console.log(`Generated ${target.path}`);
}

// 4. Export favicon.ico (multi-resolution / 48x48)
execSync(
  `ffmpeg -y -i ${masterBadge} -vf "scale=48:48" public/favicon.ico`,
  { stdio: 'pipe' }
);
fs.copyFileSync('public/favicon.ico', 'src/app/favicon.ico');
console.log('Generated public/favicon.ico and src/app/favicon.ico');

// Cleanup
if (fs.existsSync(masterBadge)) fs.unlinkSync(masterBadge);
if (fs.existsSync('test_badge.png')) fs.unlinkSync('test_badge.png');
console.log('All favicons and icons regenerated with authentic Fibez logo!');
