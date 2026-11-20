import fs from 'fs';
import { execSync } from 'child_process';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="fibezGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f4f4f5" />
    </linearGradient>
    <linearGradient id="emeraldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3ad389" />
      <stop offset="100%" stop-color="#22c55e" />
    </linearGradient>
  </defs>
  <!-- Dark Rounded Tile -->
  <rect width="100" height="100" rx="22" fill="#0c0c0e" />
  <rect width="98" height="98" x="1" y="1" rx="21" fill="none" stroke="#27272a" stroke-width="1.5" />
  <!-- Fibez Monogram -->
  <path d="M 27 36 L 38 17 L 94 17 L 86 31 L 45 31 L 41 36 Z" fill="url(#fibezGrad)" />
  <path d="M 11 42 L 61 42 L 47 68 L 69 68 L 61 81 L 27 81 L 41 55 L 18 55 Z" fill="url(#fibezGrad)" />
  <path d="M 17 61 L 31 61 L 20 81 L 6 81 Z" fill="url(#emeraldAccent)" />
</svg>`;

// Write public/favicon.svg
fs.writeFileSync('public/favicon.svg', svgContent, 'utf8');
console.log('Created public/favicon.svg');

// Render high-res PNG from SVG using ffmpeg
const tempSvg = 'temp_fav.svg';
fs.writeFileSync(tempSvg, svgContent, 'utf8');

const targets = [
  { path: 'public/favicon-96x96.png', size: 96 },
  { path: 'public/apple-touch-icon.png', size: 180 },
  { path: 'public/web-app-manifest-192x192.png', size: 192 },
  { path: 'public/web-app-manifest-512x512.png', size: 512 },
  { path: 'src/app/icon.png', size: 512 },
];

for (const t of targets) {
  try {
    execSync(`ffmpeg -y -i ${tempSvg} -vf scale=${t.size}:${t.size} ${t.path}`, { stdio: 'pipe' });
    console.log(`Generated ${t.path} (${t.size}x${t.size})`);
  } catch (err) {
    console.error(`Error generating ${t.path}:`, err.message);
  }
}

// Generate favicon.ico using ffmpeg
try {
  execSync(`ffmpeg -y -i ${tempSvg} -vf scale=48:48 public/favicon.ico`, { stdio: 'pipe' });
  fs.copyFileSync('public/favicon.ico', 'src/app/favicon.ico');
  console.log('Generated public/favicon.ico and src/app/favicon.ico');
} catch (err) {
  console.error('Error generating favicon.ico:', err.message);
}

// Clean up temp
if (fs.existsSync(tempSvg)) fs.unlinkSync(tempSvg);
console.log('Favicon generation complete!');
