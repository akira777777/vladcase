'use client';

import ItemImage from '@/components/ui/ItemImage';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Dialog from '@/components/ui/Dialog';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { Case, Item } from '@/types';
const Roulette = dynamic(() => import('./roulette/Roulette'), {
  loading: () => (
    <div className="h-52 flex items-center justify-center text-accent text-sm" role="status">
      Initializing roulette reel…
    </div>
  ),
});
const WinScreen = dynamic(() => import('./WinScreen'), {
  loading: () => (
    <div
      role="status"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center text-white"
    >
      Revealing drop…
    </div>
  ),
});
import { formatCurrency, getRarityColor, getRarityBadgeClass } from '@/lib/utils';
import { Sparkles, Zap, X, Eye, FastForward, Trophy } from 'lucide-react';

interface CaseCardProps {
  caseData: Case;
  onSuccess?: (item: Item) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, onSuccess }) => {
  const { balance, openCase, finishOpening, isLoaded, activeOpening } =
    useEconomy();
  const { sellItem } = useInventory();
  const ownsOpening = useRef(false);
  const pendingOpening = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (ownsOpening.current && !pendingOpening.current) finishOpening();
    };
  }, [finishOpening]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [winningItem, setWinningItem] = useState<Item | null>(null);
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const canAfford = isLoaded && balance >= caseData.price;
  const closeOpening = useCallback(() => {
    setShowWinScreen(false);
    setShowRouletteModal(false);
    setIsSpinning(false);
    ownsOpening.current = false;
    finishOpening();
  }, [finishOpening]);

  const startOpening = async (quick: boolean) => {
    if (!canAfford || ownsOpening.current) return;
    ownsOpening.current = true;
    pendingOpening.current = true;
    const result = await openCase(caseData);
    pendingOpening.current = false;
    if (!mounted.current) {
      ownsOpening.current = false;
      if (result.ok) finishOpening();
      return;
    }
    if (!result.ok || !result.item) {
      ownsOpening.current = false;
      return;
    }
    setWinningItem(result.item);
    onSuccess?.(result.item);
    if (quick || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      setShowWinScreen(true);
    else {
      setIsSpinning(true);
      setShowRouletteModal(true);
    }
  };
  const handleStartSpin = () => void startOpening(false);
  const handleQuickOpen = () => void startOpening(true);
  const handleRouletteComplete = useCallback(() => {
    setIsSpinning(false);
    setShowRouletteModal(false);
    setShowWinScreen(true);
  }, []);
  const handleSellFromWin = async (item: Item) => {
    const result = await sellItem(item.instanceId!);
    if (result.ok) closeOpening();
    return result;
  };

  const topPrize = useMemo(() => {
    return [...caseData.items].sort(
      (a, b) => (b.demoValue || 0) - (a.demoValue || 0)
    )[0];
  }, [caseData.items]);

  const categoryStyle = useMemo(() => {
    switch (caseData.category) {
      case 'KNIFE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'PREMIUM':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'BUDGET':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'POPULAR':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-white/10 text-white border-white/15';
    }
  }, [caseData.category]);

  return (
    <>
      <div className="glass-card rounded-2xl flex flex-col justify-between border border-white/10 hover:border-accent/40 transition-all duration-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)] p-5 group relative">
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Case Header & Category Badge */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${categoryStyle}`}
            >
              {caseData.category}
            </span>
            <button
              disabled={activeOpening}
              aria-label={`View ${caseData.name} contents`}
              onClick={() => setShowPreviewModal(true)}
              className="text-text-muted hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="View contained items"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Case Image */}
          <div className="relative w-full h-44 flex items-center justify-center mb-4 overflow-hidden rounded-xl bg-gradient-to-b from-surface-dark/40 to-surface-dark/80 border border-white/5">
            <div className="absolute inset-0 bg-radial from-accent/5 via-transparent to-transparent pointer-events-none" />
            <ItemImage
              src={caseData.image}
              alt={caseData.name}
              className="max-h-36 max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-300 z-10"
            />
          </div>

          {/* Name & Price */}
          <div className="mb-3">
            <h3 className="text-xl font-bold font-display text-white group-hover:text-accent transition-colors truncate">
              {caseData.name}
            </h3>
            {caseData.description && (
              <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                {caseData.description}
              </p>
            )}
          </div>

          {/* Top Prize preview */}
          {topPrize && (
            <div className="flex items-center justify-between text-[11px] mb-3 py-1 px-2.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-text-muted flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Top prize:</span>
              </span>
              <span className="font-bold text-amber-300 truncate max-w-[150px]">
                {topPrize.name}
              </span>
            </div>
          )}

          {/* Item Rarity preview dots */}
          <div className="flex items-center justify-between gap-1.5 mb-4 py-1.5 px-3 rounded-lg bg-surface-dark/60 border border-white/5">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              {caseData.items.length} Skins
            </span>
            <div className="flex items-center gap-1.5 overflow-hidden">
              {caseData.items.map((item, idx) => (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
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
            <span className="text-xl font-black text-white font-display">
              {formatCurrency(caseData.price)}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={handleStartSpin}
              disabled={!canAfford || activeOpening}
              className={`col-span-4 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                canAfford && !isSpinning
                  ? 'bg-accent hover:bg-accent-hover text-surface-dark shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-95'
                  : 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isSpinning
                ? 'Opening...'
                : canAfford
                  ? 'Open Case'
                  : 'Insufficient Funds'}
            </button>

            <button
              onClick={handleQuickOpen}
              disabled={!canAfford || activeOpening}
              title="Instant Open"
              className={`col-span-1 flex items-center justify-center rounded-xl transition-all ${
                canAfford && !isSpinning
                  ? 'bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                  : 'bg-white/5 text-text-muted cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Roulette Modal */}
      <>
        {showRouletteModal && winningItem && (
          <Dialog label={`Opening ${caseData.name}`} onClose={closeOpening}>
            <div className="relative max-w-4xl w-full bg-surface/95 border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl text-center backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold font-display text-white">
                    Opening {caseData.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Spinning for high tier weapon finishes…
                  </p>
                </div>
                <button
                  onClick={closeOpening}
                  aria-label="Skip opening"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
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

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <button
                  onClick={closeOpening}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-text-secondary hover:text-white transition-all"
                >
                  <FastForward className="w-3.5 h-3.5 text-accent" />
                  <span>Skip reveal — item saved in inventory</span>
                </button>
              </div>
            </div>
          </Dialog>
        )}
      </>

      {/* Contained Items Preview Modal */}
      <>
        {showPreviewModal && (
          <Dialog
            label={`${caseData.name} contents`}
            onClose={() => setShowPreviewModal(false)}
          >
            <div className="relative max-w-3xl w-full bg-surface/95 border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[85vh] flex flex-col backdrop-blur-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                      {caseData.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${categoryStyle}`}
                    >
                      {caseData.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Contains {caseData.items.length} weapon finishes with authentic weighted drop odds.
                  </p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  aria-label="Close contents"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-text-secondary hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items Grid */}
              <div className="overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {caseData.items.map((item, idx) => {
                  const rarityColor = getRarityColor(item.rarity);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-surface-dark/70 border hover:border-white/20 transition-all"
                      style={{ borderColor: `${rarityColor}30` }}
                    >
                      <div className="w-16 h-14 flex-shrink-0 flex items-center justify-center bg-surface rounded-xl p-1 relative overflow-hidden">
                        <ItemImage
                          src={item.image}
                          alt={item.name}
                          className="max-h-12 max-w-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getRarityBadgeClass(item.rarity)}`}
                          >
                            {item.rarity}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {item.dropChance}%
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400 font-bold font-display mt-0.5">
                          {formatCurrency(item.demoValue)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-text-muted">
                  Case Price: <strong className="text-white">{formatCurrency(caseData.price)}</strong>
                </span>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </Dialog>
        )}
      </>

      {/* Win Screen Modal */}
      <>
        {showWinScreen && winningItem && (
          <WinScreen
            item={winningItem}
            onClose={closeOpening}
            onSell={handleSellFromWin}
            onOpenAgain={() => {
              closeOpening();
              handleStartSpin();
            }}
            canOpenAgain={canAfford}
          />
        )}
      </>
    </>
  );
};

export default CaseCard;
