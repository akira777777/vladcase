'use client';
import Link from 'next/link';
import { Case, Item } from '@/types';
import ItemImage from './ItemImage';
import PriceTag from './PriceTag';
import { getRarityColor } from '@/lib/utils';
import { Sparkles, Flame, Star } from 'lucide-react';

interface CaseCardProps {
  caseData: Case;
  /** Optional click handler — if not provided the card navigates to /cases/[id] */
  onOpen?: (caseData: Case) => void;
}

export default function CaseCard({ caseData, onOpen }: CaseCardProps) {
  const topItem = [...caseData.items].sort((a, b) => b.demoValue - a.demoValue)[0];
  const topColor = topItem ? getRarityColor(topItem.rarity) : '#8B5CF6';
  const isPremium = caseData.category === 'PREMIUM' || caseData.category === 'KNIFE';
  const isNew = caseData.category === 'NEW';
  const isPopular = caseData.category === 'POPULAR';
  const isKnife = caseData.category === 'KNIFE';

  const isSpecialTier = topItem && (topItem.rarity === 'Special Item' || topItem.rarity === 'Covert');

  const tag = isNew ? { label: 'NEW', color: '#10B981', icon: Sparkles } :
              isKnife ? { label: 'KNIFE', color: '#FFD700', icon: Star } :
              isPremium ? { label: 'PREMIUM', color: '#F5B642', icon: Flame } :
              isPopular ? { label: 'POPULAR', color: '#EC4899', icon: Flame } :
              null;

  const inner = (
    <article
      className="group relative flex flex-col rounded-xl overflow-hidden bg-surface-dark border border-white/[0.06] hover:border-white/25 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-elevated"
      style={{
        boxShadow: isSpecialTier
          ? `0 0 32px ${topColor}25, 0 12px 28px rgba(0,0,0,0.6)`
          : undefined,
      }}
    >
      {/* Top tag */}
      {tag && (
        <div
          className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
          style={{
            color: tag.color,
            backgroundColor: `${tag.color}1F`,
            border: `1px solid ${tag.color}66`,
          }}
        >
          <tag.icon className="w-2.5 h-2.5" />
          {tag.label}
        </div>
      )}

      {/* Case artwork — 65-75% of card height */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Case category radial glow */}
        <div
          className="absolute inset-0 transition-opacity duration-300 opacity-60 group-hover:opacity-90"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${topColor}30 0%, transparent 65%)`,
          }}
        />
        {/* Subtle grid texture */}
        <div className="absolute inset-0 grid-texture opacity-30" />

        {/* Bottom darkening gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-[1]" />

        {/* Case image */}
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.05]">
          <ItemImage
            src={caseData.image}
            alt={caseData.name}
            loading="lazy"
            className="max-h-[88%] max-w-[88%] object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Top drop preview overlay (bottom-right) */}
        {topItem && (
          <div className="absolute bottom-2 right-2 z-[2] flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 border border-white/10 backdrop-blur-sm">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: topColor, boxShadow: `0 0 6px ${topColor}` }}
            />
            <span
              className="text-[8px] font-black uppercase tracking-wider"
              style={{ color: topColor }}
            >
              TOP
            </span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-col gap-1.5 px-3 py-2.5 bg-gradient-to-b from-surface-dark to-surface-dark/80">
        <h3 className="font-display font-bold text-sm text-white leading-tight truncate" title={caseData.name}>
          {caseData.name}
        </h3>
        <div className="flex items-center justify-between">
          <PriceTag value={caseData.price} variant="default" size="sm" />
          {topItem && (
            <span
              className="text-[10px] font-bold font-mono price-display"
              style={{ color: topColor }}
            >
              {formatTopValue(topItem)}
            </span>
          )}
        </div>
      </div>

      {/* Bottom edge accent */}
      <div
        className="h-0.5"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${topColor}80 50%, transparent 100%)`,
        }}
      />
    </article>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={() => onOpen(caseData)}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xl"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={`/cases/${caseData.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xl"
    >
      {inner}
    </Link>
  );
}

function formatTopValue(item: Item): string {
  if (item.demoValue >= 1000) return `$${(item.demoValue / 1000).toFixed(1)}K`;
  return `$${item.demoValue.toFixed(0)}`;
}