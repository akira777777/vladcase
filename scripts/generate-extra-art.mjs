import sharp from 'sharp';
import { resolve } from 'node:path';

const assets = [
  {
    id: 'case-fanservice-anime',
    title: 'ANIME WAIFU',
    sub: 'COLLECTION',
    accent: '#f43f5e',
    accent2: '#ec4899',
    bg: '#181124',
    icon: '🌸',
  },
  {
    id: 'case-contraband-gods',
    title: 'HIGH ROLLER',
    sub: 'CONTRABAND',
    accent: '#eab308',
    accent2: '#f59e0b',
    bg: '#1c1917',
    icon: '👑',
  },
  {
    id: 'item-m4-temukau',
    title: 'M4A4',
    skin: 'Temukau',
    accent: '#f43f5e',
    accent2: '#38bdf8',
    bg: '#1a1025',
    type: 'WAIFU TACTICAL',
  },
  {
    id: 'item-glock-bulletqueen',
    title: 'GLOCK-18',
    skin: 'Bullet Queen',
    accent: '#ec4899',
    accent2: '#fbbf24',
    bg: '#1f132b',
    type: 'ANIME POP',
  },
  {
    id: 'item-aug-akihabara',
    title: 'AUG',
    skin: 'Akihabara Accept',
    accent: '#06b6d4',
    accent2: '#f43f5e',
    bg: '#101a2e',
    type: 'TOKYO STREET',
  },
  {
    id: 'item-deagle-printstream',
    title: 'DESERT EAGLE',
    skin: 'Printstream',
    accent: '#e2e8f0',
    accent2: '#a855f7',
    bg: '#131722',
    type: 'HOLOGRAPHIC PEARL',
  },
  {
    id: 'item-awp-gungnir',
    title: 'AWP',
    skin: 'Gungnir',
    accent: '#38bdf8',
    accent2: '#818cf8',
    bg: '#0f172a',
    type: 'NORSE MYTHOLOGY',
  },
  {
    id: 'item-knife-sapphire',
    title: 'BUTTERFLY KNIFE',
    skin: 'Doppler Sapphire',
    accent: '#2563eb',
    accent2: '#06b6d4',
    bg: '#091530',
    type: 'PURE SAPPHIRE GEM',
  },
];

for (const a of assets) {
  const isCase = a.id.startsWith('case-');
  const svg = `
    <svg width="640" height="440" viewBox="0 0 640 440" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="${a.accent}" stop-opacity="0.28" />
          <stop offset="70%" stop-color="${a.bg}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#0b0e14" />
        </radialGradient>
        <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${a.accent}" />
          <stop offset="100%" stop-color="${a.accent2}" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="640" height="440" fill="url(#bgGrad)" />

      <!-- Ambient Glow Orb -->
      <circle cx="320" cy="220" r="160" fill="${a.accent}" opacity="0.15" filter="url(#glow)" />

      <!-- Center Container / Hex / Box -->
      ${
        isCase
          ? `
        <!-- Case Graphic -->
        <g transform="translate(180, 80)">
          <rect x="0" y="40" width="280" height="200" rx="24" fill="#181d27" stroke="url(#neon)" stroke-width="4" filter="url(#glow)" />
          <rect x="20" y="60" width="240" height="160" rx="16" fill="#11151c" stroke="#ffffff15" stroke-width="1.5" />
          <!-- Heavy latches -->
          <rect x="60" y="30" width="40" height="30" rx="6" fill="#2d3748" stroke="url(#neon)" stroke-width="2" />
          <rect x="180" y="30" width="40" height="30" rx="6" fill="#2d3748" stroke="url(#neon)" stroke-width="2" />
          <!-- Big Case Badge -->
          <circle cx="140" cy="140" r="48" fill="#1f2737" stroke="url(#neon)" stroke-width="3" />
          <text x="140" y="152" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="${a.accent}" text-anchor="middle">${a.icon}</text>
        </g>
      `
          : `
        <!-- Weapon Silhouette & Graphic -->
        <g transform="translate(120, 110)">
          <rect x="0" y="0" width="400" height="180" rx="20" fill="#161b2690" stroke="url(#neon)" stroke-width="2.5" />
          <path d="M 40 110 L 140 100 L 260 70 L 350 70 L 370 85 L 290 105 L 180 120 L 80 135 Z" fill="url(#neon)" filter="url(#glow)" opacity="0.85" />
          <text x="200" y="70" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">${a.title}</text>
          <text x="200" y="105" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="${a.accent}" text-anchor="middle">${a.skin}</text>
          <rect x="150" y="125" width="100" height="20" rx="10" fill="#ffffff15" />
          <text x="200" y="139" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="${a.accent2}" text-anchor="middle" letter-spacing="1.5">${a.type}</text>
        </g>
      `
      }

      <!-- Bottom Branding Line -->
      <line x1="160" y1="380" x2="480" y2="380" stroke="url(#neon)" stroke-width="2" opacity="0.6" />
      <text x="320" y="405" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#94a3b8" text-anchor="middle" letter-spacing="3">${
        isCase ? a.title + ' ' + a.sub : a.skin.toUpperCase()
      }</text>
    </svg>
  `;

  const outputPath = resolve('public/assets', `${a.id}.webp`);
  await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toFile(outputPath);
  console.log(`Generated ${outputPath}`);
}
