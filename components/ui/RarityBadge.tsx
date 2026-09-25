'use client';
import { Rarity } from '@/types';
import { getRarityColor, getRarityShort } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RarityBadgeProps {
  rarity: Rarity;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export default function RarityBadge({ rarity, size = 'sm', className = '', showIcon = false }: RarityBadgeProps) {
  const color = getRarityColor(rarity);
  const isSpecial = rarity === 'Special Item';
  const sizeClass =
    size === 'xs' ? 'text-[9px] px-1.5 py-0.5' :
    size === 'md' ? 'text-xs px-2.5 py-1' :
    'text-[10px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded-md border ${sizeClass} ${className}`}
      style={{
        color,
        backgroundColor: `${color}1A`,
        borderColor: `${color}55`,
        textShadow: isSpecial ? `0 0 6px ${color}80` : undefined,
      }}
    >
      {showIcon && isSpecial && <Star className="w-2.5 h-2.5" fill="currentColor" />}
      {getRarityShort(rarity)}
    </span>
  );
}