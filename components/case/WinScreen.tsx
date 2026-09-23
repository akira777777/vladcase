'use client';

import ItemImage from '@/components/ui/ItemImage';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Item } from '@/types';
import {
  formatCurrency,
  getRarityColor,
  getRarityBadgeClass,
} from '@/lib/utils';
import Dialog from '@/components/ui/Dialog';
import type { Result } from '@/lib/economy';
import { DollarSign, Archive, RefreshCw, X } from 'lucide-react';

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
  const isHighTier =
    item.rarity === 'Covert' ||
    item.rarity === 'Special Item' ||
    item.rarity === 'Classified';

  const reducedMotion = useReducedMotion();
  const [selling, setSelling] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    let reset: (() => void) | undefined;
    void import('canvas-confetti')
      .then(({ default: confetti }) => {
        if (cancelled) return;
        reset = confetti.reset;
        void confetti({
          particleCount: isHighTier ? 100 : 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: [rarityColor, '#FFD700', '#22D3EE'],
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
  }, [isHighTier, rarityColor, reducedMotion]);

  return (
    <Dialog label={`Won ${item.name}`} onClose={onClose}>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative max-w-xl w-full p-8 md:p-10 rounded-3xl border bg-surface/95 text-center shadow-2xl overflow-hidden"
        style={{
          borderColor: `${rarityColor}60`,
          boxShadow: `0 0 50px ${rarityColor}30, 0 20px 40px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Close button top right */}
        <button
          onClick={onClose}
          aria-label="Close result"
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-text-secondary hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient radial glow background */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: rarityColor }}
        />

        {/* Subtitle */}
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
          New Item Unlocked!
        </p>

        {/* Weapon Image with glowing backdrop */}
        <div className="relative inline-block my-4">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse-subtle"
            style={{ backgroundColor: rarityColor }}
          />
          <ItemImage
            loading="eager"
            src={item.image}
            alt={item.name}
            className="relative z-10 w-72 h-44 object-contain mx-auto filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
          />
        </div>

        {/* Item Name */}
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 tracking-tight">
          {item.name}
        </h2>

        {/* Rarity & Value Tags */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getRarityBadgeClass(item.rarity)}`}
          >
            {item.rarity}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-400 border border-emerald-500/30">
            Valued at {formatCurrency(item.demoValue)}
          </span>
        </div>

        {/* Actions */}
        {saleError && (
          <p role="alert" className="text-red-300 mb-4">
            {saleError}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {onSell ? (
            <button
              disabled={selling}
              onClick={async () => {
                if (selling) return;
                setSelling(true);
                try {
                  const result = await onSell(item);
                  if (!result.ok) setSaleError(result.message);
                } finally {
                  setSelling(false);
                }
              }}
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all hover:scale-[1.02]"
            >
              <DollarSign className="w-4 h-4" />
              Sell for {formatCurrency(item.demoValue)}
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-white text-black hover:bg-accent transition-all hover:scale-[1.02]"
          >
            <Archive className="w-4 h-4" />
            Keep in Inventory
          </button>

          {canOpenAgain && onOpenAgain ? (
            <button
              onClick={() => {
                onOpenAgain();
              }}
              className="sm:col-span-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-xs bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Open Another Case
            </button>
          ) : null}
        </div>
      </motion.div>
    </Dialog>
  );
};

export default WinScreen;
