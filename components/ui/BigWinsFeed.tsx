'use client';
import { Item } from '@/types';
import ItemImage from './ItemImage';
import { getRarityColor, getRarityTier, formatCompactCurrency, timeAgo } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface BigWin {
  id: string;
  user: string;
  item: Item;
  caseName: string;
  multiplier?: number;
  timestamp: number;
}

interface BigWinsFeedProps {
  wins?: BigWin[];
  className?: string;
}

const DEMO_WINS: BigWin[] = [
  { id: 'w1', user: 'shadowkill', item: { id: 'w1i', name: 'Karambit | Doppler Phase 2', weaponType: 'Knife', image: '/assets/item-knife-doppler.webp', rarity: 'Special Item', demoValue: 1850, dropChance: 0.25 }, caseName: 'Doppler Vault', timestamp: 0 },
  { id: 'w2', user: 'vortex', item: { id: 'w2i', name: 'AWP | Dragon Lore', weaponType: 'AWP', image: '/assets/item-awp-dragonlore.webp', rarity: 'Special Item', demoValue: 9500, dropChance: 0.05 }, caseName: 'High Roller Vault', multiplier: 12, timestamp: 0 },
  { id: 'w3', user: 'fade', item: { id: 'w3i', name: 'Butterfly Knife | Sapphire', weaponType: 'Knife', image: '/assets/item-knife-sapphire.webp', rarity: 'Special Item', demoValue: 4200, dropChance: 0.1 }, caseName: 'Waifu & Anime', multiplier: 8, timestamp: 0 },
  { id: 'w4', user: 'kyo', item: { id: 'w4i', name: 'M4A4 | Howl', weaponType: 'M4A4', image: '/assets/item-m4-howl.webp', rarity: 'Covert', demoValue: 4200, dropChance: 0.2 }, caseName: 'High Roller Vault', timestamp: 0 },
  { id: 'w5', user: 'nyxer', item: { id: 'w5i', name: 'AWP | Gungnir', weaponType: 'AWP', image: '/assets/item-awp-gungnir.webp', rarity: 'Special Item', demoValue: 5800, dropChance: 0.05 }, caseName: 'High Roller Vault', multiplier: 15, timestamp: 0 },
  { id: 'w6', user: 'rush_b', item: { id: 'w6i', name: 'Butterfly Knife | Fade', weaponType: 'Knife', image: '/assets/item-knife-fade.webp', rarity: 'Special Item', demoValue: 3200, dropChance: 0.15 }, caseName: 'Doppler Vault', timestamp: 0 },
];

export default function BigWinsFeed({ wins, className = '' }: BigWinsFeedProps) {
  const list = wins && wins.length >= 3 ? wins : DEMO_WINS;

  return (
    <section className={className} aria-label="Recent big wins">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold-light" />
          <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
            Recent Big Wins
          </h2>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gold/15 text-gold-light border border-gold/40">
            Hot
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {list.slice(0, 6).map((win) => (
          <BigWinCard key={win.id} win={win} />
        ))}
      </div>
    </section>
  );
}

function BigWinCard({ win }: { win: BigWin }) {
  const color = getRarityColor(win.item.rarity);
  const tier = getRarityTier(win.item.rarity);
  const isTop = tier === 'top';
  const isHigh = tier === 'high';

  return (
    <article
      className={`group relative rounded-lg overflow-hidden border transition-all duration-200 hover:-translate-y-1 ${
        isTop
          ? 'border-gold/45 bg-gradient-to-b from-gold/[0.08] to-surface-dark shadow-[0_0_22px_rgba(245,182,66,0.22)]'
          : isHigh
          ? 'border-pink-500/40 bg-gradient-to-b from-pink-500/[0.06] to-surface-dark'
          : 'border-white/[0.08] bg-surface-dark'
      }`}
    >
      <div className="relative aspect-square w-full flex items-center justify-center bg-black/40 overflow-hidden">
        {isTop && (
          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 50% 50%, ${color}60 0%, transparent 70%)` }} />
        )}
        <ItemImage
          src={win.item.image}
          alt={win.item.name}
          loading="lazy"
          className="max-h-[88%] max-w-[88%] object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform"
        />
        {win.multiplier && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span>×{win.multiplier}</span>
          </div>
        )}
      </div>
      <div className="p-2.5 space-y-1">
        <p className="text-[11px] font-bold text-white truncate" title={win.item.name}>{win.item.name}</p>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] text-text-muted truncate" title={win.user}>{win.user}</span>
          <span className="text-[11px] font-black price-display" style={{ color: isTop ? '#FFD66B' : '#EC4899' }}>
            {formatCompactCurrency(win.item.demoValue)}
          </span>
        </div>
        <p className="text-[9px] text-text-muted truncate" title={win.caseName}>
          {win.caseName} · {win.timestamp > 0 ? timeAgo(win.timestamp) : 'Demo showcase'}
        </p>
      </div>
    </article>
  );
}
