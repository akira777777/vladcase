'use client';
import { Package, TrendingUp, Flame, Layers } from 'lucide-react';

interface GameStatsProps {
  casesOpened?: number;
  itemsWon?: number;
  contracts?: number;
  upgrades?: number;
  className?: string;
}

export default function GameStats({
  casesOpened = 1_284_491,
  itemsWon = 1_018_221,
  contracts = 94_241,
  upgrades = 312_482,
  className = '',
}: GameStatsProps) {
  const stats = [
    { label: 'CASES OPENED', value: casesOpened.toLocaleString(), icon: Package, color: 'text-brand-300', glow: 'rgba(139, 92, 246, 0.4)' },
    { label: 'ITEMS WON', value: itemsWon.toLocaleString(), icon: Layers, color: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.4)' },
    { label: 'CONTRACTS', value: contracts.toLocaleString(), icon: Flame, color: 'text-magenta-400', glow: 'rgba(236, 72, 153, 0.4)' },
    { label: 'UPGRADES', value: upgrades.toLocaleString(), icon: TrendingUp, color: 'text-gold-light', glow: 'rgba(245, 182, 66, 0.4)' },
  ];

  return (
    <section className={className} aria-label="Platform statistics">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="relative rounded-lg border border-white/[0.06] bg-gradient-to-b from-surface-raised to-surface-dark p-4 overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-15 blur-2xl" style={{ backgroundColor: s.glow }} />
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`mt-3 text-2xl font-display font-black ${s.color} price-display`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}