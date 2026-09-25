'use client';
import { useEffect, useState } from 'react';
import { Item } from '@/types';
import ItemImage from './ItemImage';
import { getRarityColor, getRarityTier, timeAgo, formatCompactCurrency } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface DropEntry { id: string; item: Item; caseName: string; user: string; timestamp: number; }
interface LiveDropFeedProps { drops?: DropEntry[]; className?: string; }

const DEMO_USERS = ['vladcase_user', 'shadowkill', 'akira', 'snipez', 'rush_b', 'kyo', 'phoenix', 'nyxer', 'drk', 'omega_p', 'lethal', 'rushhh', 'kira_x', 'fade', 'vortex', 's1mple_fan', 'fl0m_', 'zeus_', 'niko', 'donk99', 'magixx', 'sh1ro'];

const DEMO_TIME_BASE = 1760000000000;

function generateDrop(item: Item, caseName: string, i: number): DropEntry {
  return { id: `demo-${i}`, item, caseName, user: DEMO_USERS[i % DEMO_USERS.length], timestamp: DEMO_TIME_BASE - i * 23000 };
}

const DEMO_POOL: Array<{ item: Item; caseName: string }> = [
  { item: { id: 'd1', name: 'Karambit | Doppler Phase 2', weaponType: 'Knife', image: '/assets/item-knife-doppler.webp', rarity: 'Special Item', demoValue: 1850, dropChance: 0.25 }, caseName: 'Doppler Vault' },
  { item: { id: 'd2', name: 'AK-47 | Fire Serpent', weaponType: 'AK-47', image: '/assets/item-ak-fire-serpent.webp', rarity: 'Covert', demoValue: 780, dropChance: 0.6 }, caseName: 'Kalashnikov Special' },
  { item: { id: 'd3', name: 'AWP | Asiimov', weaponType: 'AWP', image: '/assets/item-awp-asiimov.webp', rarity: 'Covert', demoValue: 145, dropChance: 0.8 }, caseName: 'Sniper Elite' },
  { item: { id: 'd4', name: 'Butterfly Knife | Sapphire', weaponType: 'Knife', image: '/assets/item-knife-sapphire.webp', rarity: 'Special Item', demoValue: 4200, dropChance: 0.1 }, caseName: 'Waifu & Anime' },
  { item: { id: 'd5', name: 'M4A1-S | Printstream', weaponType: 'M4A1-S', image: '/assets/item-m4-printstream.webp', rarity: 'Covert', demoValue: 310, dropChance: 1.2 }, caseName: 'Covert Arsenal' },
  { item: { id: 'd6', name: 'AK-47 | Neon Rider', weaponType: 'AK-47', image: '/assets/item-ak-neon-rider.webp', rarity: 'Classified', demoValue: 95, dropChance: 3.2 }, caseName: 'Covert Arsenal' },
  { item: { id: 'd7', name: 'AWP | Gungnir', weaponType: 'AWP', image: '/assets/item-awp-gungnir.webp', rarity: 'Special Item', demoValue: 5800, dropChance: 0.05 }, caseName: 'High Roller Vault' },
  { item: { id: 'd8', name: 'M4A4 | Howl', weaponType: 'M4A4', image: '/assets/item-m4-howl.webp', rarity: 'Covert', demoValue: 4200, dropChance: 0.2 }, caseName: 'High Roller Vault' },
  { item: { id: 'd9', name: 'AWP | Dragon Lore', weaponType: 'AWP', image: '/assets/item-awp-dragonlore.webp', rarity: 'Special Item', demoValue: 9500, dropChance: 0.05 }, caseName: 'High Roller Vault' },
  { item: { id: 'd10', name: 'USP-S | Kill Confirmed', weaponType: 'Pistol', image: '/assets/item-usp-kill-confirmed.webp', rarity: 'Classified', demoValue: 120, dropChance: 3.0 }, caseName: 'Waifu & Anime' },
  { item: { id: 'd11', name: 'AWP | Hyper Beast', weaponType: 'AWP', image: '/assets/item-awp-hyper-beast.webp', rarity: 'Classified', demoValue: 85, dropChance: 3.5 }, caseName: 'Sniper Elite' },
  { item: { id: 'd12', name: 'M4A4 | Temukau', weaponType: 'M4A4', image: '/assets/item-m4-temukau.webp', rarity: 'Classified', demoValue: 88, dropChance: 2.8 }, caseName: 'Waifu & Anime' },
  { item: { id: 'd13', name: 'Glock-18 | Bullet Queen', weaponType: 'Pistol', image: '/assets/item-glock-bulletqueen.webp', rarity: 'Classified', demoValue: 75, dropChance: 3.4 }, caseName: 'Waifu & Anime' },
  { item: { id: 'd14', name: 'AUG | Akihabara Accept', weaponType: 'Rifle', image: '/assets/item-aug-akihabara.webp', rarity: 'Classified', demoValue: 78, dropChance: 3.0 }, caseName: 'Waifu & Anime' },
  { item: { id: 'd15', name: 'Butterfly Knife | Fade', weaponType: 'Knife', image: '/assets/item-knife-fade.webp', rarity: 'Special Item', demoValue: 3200, dropChance: 0.15 }, caseName: 'Doppler Vault' },
];

export default function LiveDropFeed({ drops, className = '' }: LiveDropFeedProps) {
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const entries = (drops && drops.length >= 6 ? drops : DEMO_POOL.map((d, i) => generateDrop(d.item, d.caseName, i))).slice(0, 14);
  const loopEntries = [...entries, ...entries, ...entries];
  return (
    <section className={`relative w-full overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-surface-dark to-ink-900 ${className}`} aria-label="Live drop feed">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-surface-dark via-surface-dark/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-surface-dark via-surface-dark/70 to-transparent" />
      <div className="absolute top-0 left-3 z-20 inline-flex items-center gap-1.5 px-2 py-1 rounded-b-md bg-ink-900 border border-t-0 border-white/[0.06]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
        <Activity className="w-3 h-3 text-red-400" />
        <span className="text-[10px] font-black uppercase tracking-wider text-white">LIVE DROPS</span>
      </div>
      <div className="flex w-max py-3 marquee-track animate-marquee" style={{ willChange: 'transform' }}>
        {loopEntries.map((entry, idx) => <DropCard key={`${entry.id}-${idx}`} entry={entry} />)}
      </div>
    </section>
  );
}
function DropCard({ entry }: { entry: DropEntry }) {
  const color = getRarityColor(entry.item.rarity);
  const tier = getRarityTier(entry.item.rarity);
  const isHigh = tier === 'high' || tier === 'top';
  const isTop = tier === 'top';
  return (
    <div
      className={`flex items-center gap-2.5 mx-1.5 px-2.5 py-2 rounded-lg border transition-all ${
        isTop ? 'border-gold/40 bg-gold/[0.06] shadow-[0_0_18px_rgba(245,182,66,0.25)]' : isHigh ? 'border-pink-500/30 bg-pink-500/[0.04]' : 'border-white/[0.05] bg-surface-dark/60'
      }`}
      style={{ minWidth: isTop ? 280 : 240 }}
    >
      <div className={`relative flex-shrink-0 w-10 h-10 rounded flex items-center justify-center overflow-hidden ${isTop ? 'bg-black/60' : 'bg-black/40'}`} style={isHigh ? { boxShadow: `inset 0 0 12px ${color}30` } : undefined}>
        <ItemImage src={entry.item.image} alt={entry.item.name} width={40} height={40} loading="lazy" className="max-h-9 max-w-9 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color, backgroundColor: `${color}22`, border: `1px solid ${color}55` }}>
            {entry.item.rarity === 'Special Item' ? '★' : ''}{entry.item.rarity.replace(' Item', '')}
          </span>
          <span className="text-[10px] text-text-muted truncate">{entry.user}</span>
        </div>
        <p className="text-xs font-bold text-white truncate leading-tight mt-0.5" title={entry.item.name}>{entry.item.name}</p>
        <p className="text-[10px] text-text-muted truncate" title={entry.caseName}>{entry.caseName} · {entry.id.startsWith('demo-') ? 'just now' : timeAgo(entry.timestamp)}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className={`text-xs font-black price-display ${isTop ? 'metallic-gold' : ''}`} style={!isTop ? { color: tier === 'high' ? '#EC4899' : '#10B981' } : undefined}>
          {formatCompactCurrency(entry.item.demoValue)}
        </p>
      </div>
    </div>
  );
}