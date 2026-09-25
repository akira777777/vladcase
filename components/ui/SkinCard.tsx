'use client';
import { Item } from '@/types';
import ItemImage from './ItemImage';
import RarityBadge from './RarityBadge';
import PriceTag from './PriceTag';
import { getRarityColor, getItemWear } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface SkinCardProps {
  item: Item;
  onClick?: (item: Item) => void;
  onSell?: (item: Item) => void;
  onFavorite?: (item: Item) => void;
  selected?: boolean;
  selectable?: boolean;
  favorite?: boolean;
  showSell?: boolean;
  showWear?: boolean;
  showFavorite?: boolean;
  showChance?: boolean;
  density?: 'compact' | 'normal' | 'detailed';
  className?: string;
}

export default function SkinCard({
  item,
  onClick,
  onSell,
  onFavorite,
  selected = false,
  selectable = false,
  favorite = false,
  showSell = false,
  showWear = false,
  showFavorite = false,
  showChance = false,
  density = 'normal',
  className = '',
}: SkinCardProps) {
  const rarityColor = getRarityColor(item.rarity);
  const wear = getItemWear(item);

  const isHighTier =
    item.rarity === 'Special Item' ||
    item.rarity === 'Covert' ||
    item.rarity === 'Classified';

  const padding = density === 'compact' ? 'p-2' : 'p-3';
  const imageHeight = density === 'compact' ? 'h-16' : density === 'detailed' ? 'h-28' : 'h-20';

  return (
    <div
      onClick={() => onClick?.(item)}
      role={selectable || onClick ? 'button' : undefined}
      tabIndex={selectable || onClick ? 0 : undefined}
      aria-pressed={selectable ? selected : undefined}
      className={`group relative flex flex-col rounded-lg border transition-all overflow-hidden panel-v ${
        selected
          ? 'border-brand bg-brand/10 shadow-glow-brand'
          : 'border-white/[0.06] bg-surface-dark hover:border-white/20 hover:bg-surface-raised'
      } ${selectable || onClick ? 'cursor-pointer' : ''} ${padding} ${className}`}
      style={!selected ? { boxShadow: `inset 3px 0 0 ${rarityColor}80` } : undefined}
    >
      {/* Rarity top accent line */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 opacity-70"
        style={{ backgroundColor: rarityColor, boxShadow: isHighTier ? `0 0 12px ${rarityColor}` : undefined }}
      />

      {/* High tier ambient glow */}
      {isHighTier && (
        <div
          className="absolute -inset-2 -z-10 rounded-xl opacity-15 blur-2xl pointer-events-none"
          style={{ backgroundColor: rarityColor }}
        />
      )}

      {/* Selection check */}
      {selectable && (
        <div
          className={`absolute top-1.5 right-1.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
            selected ? 'bg-brand border-brand' : 'border-white/30 group-hover:border-white/50'
          }`}
        >
          {selected && (
            <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none">
              <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}

      {/* Favorite heart */}
      {showFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(item);
          }}
          aria-label={favorite ? 'Unfavorite' : 'Favorite'}
          className={`absolute top-1.5 left-1.5 p-1 rounded transition-colors ${
            favorite ? 'text-pink-400' : 'text-text-muted opacity-0 group-hover:opacity-100 hover:text-pink-400'
          }`}
        >
          <Heart className="w-3.5 h-3.5" fill={favorite ? 'currentColor' : 'none'} />
        </button>
      )}

      {/* Weapon image */}
      <div className={`relative w-full ${imageHeight} flex items-center justify-center bg-black/40 rounded mb-2 overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${rarityColor}40 0%, transparent 70%)`,
          }}
        />
        <ItemImage
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="relative max-h-full max-w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Meta info */}
      <div className="flex-1 flex flex-col gap-1">
        <h4 className="text-[11px] font-bold text-white leading-tight truncate" title={item.name}>
          {item.name}
        </h4>
        <div className="flex items-center justify-between gap-1">
          <RarityBadge rarity={item.rarity} size="xs" />
          {showChance && (
            <span className="text-[10px] font-mono font-black text-brand-200 bg-brand/20 px-1.5 py-0.5 rounded border border-brand/40">
              {item.dropChance.toFixed(2)}%
            </span>
          )}
        </div>
        {showWear && (
          <p className="text-[9px] uppercase tracking-wider text-text-muted">
            {wear}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <PriceTag value={item.demoValue} size="sm" />
          {showSell && onSell && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSell(item);
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300"
            >
              Sell
            </button>
          )}
        </div>
      </div>
    </div>
  );
}