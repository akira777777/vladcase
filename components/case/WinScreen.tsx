'use client';

import ItemImage from '@/components/ui/ItemImage';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Item } from '@/types';
import {
  formatCurrency,
  getRarityColor,
  getRarityBadgeClass,
  getItemWear,
} from '@/lib/utils';
import { playWinSound, playCashSound } from '@/lib/sound';
import Dialog from '@/components/ui/Dialog';
import type { Result } from '@/lib/economy';
import { DollarSign, Archive, RefreshCw, X, Sparkles, Trophy } from 'lucide-react';

interface WinScreenProps {
  item: Item;
  onClose: () => void;
  onSell?: (item: Item) => Promise<Result>;
  onOpenAgain?: () => void;
  canOpenAgain?: boolean;
}

export const WinScreen: React.FC<WinScreenProps> = ({
  item,
  onClose,
  onSell,
  onOpenAgain,
  canOpenAgain = false,
}) => {
  const rarityColor = getRarityColor(item.rarity);
  const isSpecial = item.rarity === 'Special Item';
  const isCovert = item.rarity === 'Covert';
  const isHighTier = isSpecial || isCovert || item.rarity === 'Classified';
  const wear = getItemWear(item);

  const reducedMotion = useReducedMotion();
  const [selling, setSelling] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);

  useEffect(() => {
    playWinSound(item.rarity);

    if (reducedMotion) return;
    let cancelled = false;
    let reset: (() => void) | undefined;
    void import('canvas-confetti')
      .then(({ default: confetti }) => {
        if (cancelled) return;
        reset = confetti.reset;
        void confetti({
          particleCount: isSpecial ? 120 : isCovert ? 90 : 45,
          spread: 80,
          origin: { y: 0.55 },
          colors: [rarityColor, '#FFD700', '#22D3EE', '#FFFFFF'],
          disableForReducedMotion: true,
        });
      })
      .catch(() => {
        /* Celebration is optional; the saved result remains available. */
      });
    return () => {
      cancelled = true;
      reset?.();
    };
  }, [item.rarity, isHighTier, isSpecial, isCovert, rarityColor, reducedMotion]);

  const handleSellClick = async () => {
    if (selling || !onSell) return;
    setSelling(true);
    try {
      playCashSound();
      const result = await onSell(item);
      if (!result.ok) setSaleError(result.message);
    } finally {
      setSelling(false);
    }
  };

  return (
    <Dialog label={`Won ${item.name}`} onClose={onClose}>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative max-w-xl w-full p-8 md:p-10 rounded-3xl border bg-surface/95 text-center shadow-2xl overflow-hidden backdrop-blur-2xl"
        style={{
          borderColor: `${rarityColor}70`,
          boxShadow: `0 0 60px ${rarityColor}35, 0 24px 48px rgba(0,0,0,0.85)`,
        }}
      >
        {/* Close button top right */}
        <button
          onClick={onClose}
          aria-label="Close result"
          className="absolute top-5 right-5 p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-text-secondary hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient radial glow background */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ backgroundColor: rarityColor }}
        />

        {/* Header tag */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {isHighTier ? (
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          ) : (
            <Sparkles className="w-4 h-4 text-accent" />
          )}
          <span className="text-xs font-black uppercase tracking-widest text-text-secondary">
            {isSpecial ? '★ Rare Special Item Unboxed! ★' : isCovert ? 'Covert Finish Unlocked!' : 'New Item Unlocked!'}
          </span>
        </div>

        {/* Weapon Image with glowing backdrop */}
        <div className="relative inline-block my-4">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-45 animate-pulse-subtle"
            style={{ backgroundColor: rarityColor }}
          />
          <ItemImage
            loading="eager"
            src={item.image}
            alt={item.name}
            className="relative z-10 w-72 h-44 object-contain mx-auto filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]"
          />
        </div>

        {/* Item Name */}
        <h2 className="text-2xl md:text-3xl font-display font-black text-white mb-2 tracking-tight">
          {item.name}
        </h2>

        {/* Rarity & Wear & Value Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getRarityBadgeClass(item.rarity)}`}
          >
            {item.rarity}
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-text-secondary border border-white/10">
            {wear}
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-display">
            Valued at {formatCurrency(item.demoValue)}
          </span>
        </div>

        {/* Errors if any */}
        {saleError && (
          <p role="alert" className="text-red-300 text-xs mb-4 bg-red-950/60 p-2.5 rounded-xl border border-red-500/40">
            {saleError}
          </p>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {onSell ? (
            <button
              disabled={selling}
              onClick={handleSellClick}
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <DollarSign className="w-4 h-4" />
              <span>Sell for {formatCurrency(item.demoValue)}</span>
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-white/10 hover:bg-accent text-white hover:text-surface-dark border border-white/15 transition-all hover:scale-[1.02] active:scale-95 shadow-md"
          >
            <Archive className="w-4 h-4" />
            <span>Keep in Inventory</span>
          </button>

          {canOpenAgain && onOpenAgain ? (
            <button
              onClick={() => {
                onOpenAgain();
              }}
              className="sm:col-span-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Open Another Case</span>
            </button>
          ) : null}
        </div>
      </motion.div>
    </Dialog>
  );
};

export default WinScreen;
