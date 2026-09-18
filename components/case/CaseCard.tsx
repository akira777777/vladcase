'use client';

import React, { useState } from 'react';
import { openCase } from '@/lib/caseLogic';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { Case, Item } from '@/types';
import Roulette from './roulette/Roulette';
import WinScreen from './WinScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, getRarityColor, getRarityBadgeClass } from '@/lib/utils';
import { Sparkles, Zap, X, Eye } from 'lucide-react';

interface CaseCardProps {
  caseData: Case;
  onSuccess?: (item: Item) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, onSuccess }) => {
  const { balance, deductBalance, addXp, addBalance } = useEconomy();
  const { addItem, removeItem } = useInventory();

  const [isSpinning, setIsSpinning] = useState(false);
  const [winningItem, setWinningItem] = useState<Item | null>(null);
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const canAfford = balance >= caseData.price;

  // Standard interactive spin with the 5s roulette animation
  const handleStartSpin = () => {
    if (!canAfford || isSpinning) return;

    const deducted = deductBalance(caseData.price);
    if (!deducted) return;

    const winner = openCase(caseData);
    setWinningItem(winner);
    setIsSpinning(true);
    setShowRouletteModal(true);
  };

  // Instant open for quick gameplay
  const handleQuickOpen = () => {
    if (!canAfford || isSpinning) return;

    const deducted = deductBalance(caseData.price);
    if (!deducted) return;

    const winner = openCase(caseData);
    setWinningItem(winner);
    addXp(50);
    addItem(winner, { id: caseData.id, name: caseData.name });
    if (onSuccess) onSuccess(winner);
    setShowWinScreen(true);
  };

  const handleRouletteComplete = () => {
    if (!winningItem) return;
    setIsSpinning(false);
    setShowRouletteModal(false);
    addXp(50);
    addItem(winningItem, { id: caseData.id, name: caseData.name });
    if (onSuccess) onSuccess(winningItem);
    setShowWinScreen(true);
  };

  const handleSellFromWin = (item: Item) => {
    if (item.instanceId) {
      removeItem(item.instanceId);
    }
    addBalance(item.demoValue);
  };

  return (
    <>
      <div className="glass-card rounded-2xl flex flex-col justify-between border border-white/10 hover:border-accent/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-5 group">
        {/* Case Header & Category Badge */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-accent uppercase tracking-wider">
              {caseData.category}
            </span>
            <button
              onClick={() => setShowPreviewModal(true)}
              className="text-text-muted hover:text-white p-1 rounded-md transition-colors"
              title="View contained items"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Case Image */}
          <div className="relative w-full h-44 flex items-center justify-center mb-4 overflow-hidden rounded-xl bg-surface-dark/50">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-0" />
            <img
              src={caseData.image}
              alt={caseData.name}
              className="max-h-36 max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300 z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'><rect width='200' height='150' fill='%2311151C'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238E96A3' font-family='sans-serif' font-size='12' font-weight='bold'>${encodeURIComponent(caseData.name)}</text></svg>`;
              }}
            />
          </div>

          {/* Name & Price */}
          <div className="mb-4">
            <h3 className="text-xl font-bold font-display text-white group-hover:text-accent transition-colors truncate">
              {caseData.name}
            </h3>
            {caseData.description && (
              <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                {caseData.description}
              </p>
            )}
          </div>

          {/* Item Rarity preview dots */}
          <div className="flex items-center gap-1.5 mb-4 py-1.5 px-3 rounded-lg bg-surface-dark/40 border border-white/5">
            <span className="text-[10px] text-text-muted uppercase tracking-wider mr-1">Contains:</span>
            <div className="flex items-center gap-1.5 overflow-hidden">
              {caseData.items.map((item, idx) => (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getRarityColor(item.rarity) }}
                  title={`${item.name} (${item.rarity})`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Buttons & Cost */}
        <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">Case Price</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(caseData.price)}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={handleStartSpin}
              disabled={!canAfford || isSpinning}
              className={`col-span-4 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                canAfford && !isSpinning
                  ? 'bg-accent hover:bg-accent-hover text-surface-dark shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02]'
                  : 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isSpinning ? 'Opening...' : canAfford ? 'Open Case' : 'Insufficient Funds'}
            </button>

            <button
              onClick={handleQuickOpen}
              disabled={!canAfford || isSpinning}
              title="Instant Open"
              className={`col-span-1 flex items-center justify-center rounded-xl transition-all ${
                canAfford && !isSpinning
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:scale-105'
                  : 'bg-white/5 text-text-muted cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Roulette Modal */}
      <AnimatePresence>
        {showRouletteModal && winningItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full bg-surface/95 border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl text-center"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-display text-white">
                    Opening {caseData.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Spinning for high tier finishes...
                  </p>
                </div>
              </div>

              {/* Roulette Component */}
              <div className="my-6">
                <Roulette
                  items={caseData.items}
                  winningItem={winningItem}
                  isSpinning={isSpinning}
                  onComplete={handleRouletteComplete}
                />
              </div>

              <p className="text-xs text-text-muted italic">
                Good luck! The reel is stopping shortly...
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contained Items Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full bg-surface border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{caseData.name} Contents</h3>
                  <p className="text-xs text-text-secondary">All possible skins in this case</p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {caseData.items.map((item, idx) => {
                  const rarityColor = getRarityColor(item.rarity);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-dark/60 border border-white/5"
                    >
                      <div className="w-14 h-12 flex-shrink-0 flex items-center justify-center bg-surface rounded-lg p-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-10 max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: rarityColor }}
                        >
                          {item.rarity}
                        </p>
                        <p className="text-[11px] text-emerald-400 font-bold">
                          {formatCurrency(item.demoValue)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Win Screen Modal */}
      <AnimatePresence>
        {showWinScreen && winningItem && (
          <WinScreen
            item={winningItem}
            onClose={() => setShowWinScreen(false)}
            onSell={handleSellFromWin}
            onOpenAgain={handleStartSpin}
            canOpenAgain={canAfford}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CaseCard;
