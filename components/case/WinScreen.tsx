'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Item } from '@/types';
import { formatCurrency, getRarityColor, getRarityBadgeClass } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { DollarSign, Archive, RefreshCw, X } from 'lucide-react';

interface WinScreenProps {
  item: Item;
  onClose: () => void;
  onSell?: (item: Item) => void;
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
  const isHighTier = item.rarity === 'Covert' || item.rarity === 'Special Item' || item.rarity === 'Classified';

  useEffect(() => {
    // Fire celebratory confetti for covert/special or any win
    try {
      if (isHighTier) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: [rarityColor, '#FFD700', '#22D3EE', '#FFFFFF'],
        });
      } else {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 },
        });
      }
    } catch {
      // ignore if confetti fails
    }
  }, [isHighTier, rarityColor]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
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
          <img
            src={item.image}
            alt={item.name}
            className="relative z-10 w-72 h-44 object-contain mx-auto filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='170' viewBox='0 0 280 170'><rect width='280' height='170' fill='%2311151C'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238E96A3' font-family='sans-serif' font-size='14' font-weight='bold'>${encodeURIComponent(item.name)}</text></svg>`;
            }}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {onSell ? (
            <button
              onClick={() => {
                onSell(item);
                onClose();
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
                onClose();
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
    </div>
  );
};

export default WinScreen;
