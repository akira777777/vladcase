'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { useEconomy } from '@/hooks/useEconomy';
import { useApp } from '@/context/AppContext';
import { Item } from '@/types';
import { ITEMS } from '@/data/mockData';
import ItemImage from '@/components/ui/ItemImage';
import Dialog from '@/components/ui/Dialog';
import UpgradeWheel from '@/components/upgrade/UpgradeWheel';
import { formatCurrency, getRarityColor } from '@/lib/utils';
import { upgradeChance, MAX_CHANCE_PERCENT, MIN_CHANCE_PERCENT } from '@/lib/upgrader';
import { playClickSound, playWinSound, playLoseSound, playCaseOpenSound } from '@/lib/sound';
import {
  TrendingUp,
  Shield,
  Zap,
  Sparkles,
  Search,
  Flame,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

const MULTIPLIERS = [1.5, 2, 5, 10, 20, 50, 100] as const;

type Phase =
  | { kind: 'idle' }
  | { kind: 'confirm'; input: Item; target: Item; chance: number }
  | {
      kind: 'spinning';
      input: Item;
      target: Item;
      chance: number;
      won: boolean;
      rewardInstanceId?: string;
    }
  | {
      kind: 'result';
      input: Item;
      target: Item;
      chance: number;
      won: boolean;
      rewardInstanceId?: string;
    };

export default function UpgradePage() {
  const { inventory } = useInventory();
  const { isLoaded } = useEconomy();
  const { upgradeItem } = useApp();

  const [inputId, setInputId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(2);
  const [showAllTargets, setShowAllTargets] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [actionError, setActionError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  // Celebrate a revealed win with confetti
  useEffect(() => {
    if (phase.kind !== 'result' || !phase.won || reducedMotion) return;
    const rarityColor = getRarityColor(phase.target.rarity);
    let cancelled = false;
    let reset: (() => void) | undefined;
    void import('canvas-confetti')
      .then(({ default: confetti }) => {
        if (cancelled) return;
        reset = confetti.reset;
        void confetti({
          particleCount: 90,
          spread: 90,
          origin: { y: 0.5 },
          colors: [rarityColor, '#10b981', '#06b6d4', '#ffd700', '#ffffff'],
          disableForReducedMotion: true,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      reset?.();
    };
  }, [phase, reducedMotion]);

  const inputItem = useMemo(
    () => inventory.find((entry) => entry.instanceId === inputId) ?? null,
    [inventory, inputId]
  );

  const targetItem = useMemo(
    () => ITEMS.find((entry) => entry.id === targetId) ?? null,
    [targetId]
  );

  const chance = useMemo(() => {
    if (!inputItem || !targetItem) return null;
    const inputCents = Math.round(inputItem.demoValue * 100);
    const targetCents = Math.round(targetItem.demoValue * 100);
    if (targetCents <= inputCents) return null;
    return upgradeChance(inputCents, targetCents);
  }, [inputItem, targetItem]);

  const targetRatio = useMemo(() => {
    if (!inputItem || !targetItem || inputItem.demoValue <= 0) return null;
    return targetItem.demoValue / inputItem.demoValue;
  }, [inputItem, targetItem]);

  const potentialProfit = useMemo(() => {
    if (!inputItem || !targetItem) return null;
    return Math.max(0, targetItem.demoValue - inputItem.demoValue);
  }, [inputItem, targetItem]);

  // Filtered inventory items
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) =>
      item.name.toLowerCase().includes(inventorySearch.toLowerCase().trim())
    );
  }, [inventory, inventorySearch]);

  // Catalog targets near input * multiplier, sorted by value distance.
  const suggestedTargets = useMemo(() => {
    if (!inputItem) return [];
    const desired = inputItem.demoValue * multiplier;
    return ITEMS.filter((entry) => entry.demoValue > inputItem.demoValue)
      .sort(
        (a, b) =>
          Math.abs(a.demoValue - desired) - Math.abs(b.demoValue - desired)
      )
      .slice(0, 18);
  }, [inputItem, multiplier]);

  const allTargets = useMemo(
    () =>
      ITEMS.filter(
        (entry) => entry.demoValue > (inputItem?.demoValue ?? 0)
      ).sort((a, b) => a.demoValue - b.demoValue),
    [inputItem]
  );

  const rawTargets = showAllTargets ? allTargets : suggestedTargets;

  const filteredTargets = useMemo(() => {
    return rawTargets.filter((item) =>
      item.name.toLowerCase().includes(targetSearch.toLowerCase().trim())
    );
  }, [rawTargets, targetSearch]);

  const selectInput = (item: Item) => {
    playClickSound();
    setInputId(item.instanceId ?? null);
    setTargetId(null);
    setPhase({ kind: 'idle' });
  };

  const selectTarget = (item: Item) => {
    playClickSound();
    setTargetId(item.id);
    setPhase({ kind: 'idle' });
  };

  const startUpgrade = async () => {
    if (!inputItem || !targetItem || chance === null || phase.kind !== 'idle')
      return;
    playCaseOpenSound();
    setPhase({ kind: 'confirm', input: inputItem, target: targetItem, chance });
    const result = await upgradeItem(inputItem.instanceId!, targetItem);
    if (!result.ok || !result.upgrade) {
      setPhase({ kind: 'idle' });
      setActionError(result.ok ? 'Upgrade result is unavailable.' : result.message);
      return;
    }
    setPhase({
      kind: 'spinning',
      input: inputItem,
      target: targetItem,
      chance: result.upgrade.chance,
      won: result.upgrade.won,
      rewardInstanceId: result.item?.instanceId,
    });
  };

  const finishSpin = () => {
    if (phase.kind !== 'spinning') return;
    setPhase({ ...phase, kind: 'result' });
    if (phase.won) {
      playWinSound(phase.target.rarity);
    } else {
      playLoseSound();
    }
  };

  const resetRound = () => {
    playClickSound();
    setPhase({ kind: 'idle' });
    setInputId(null);
    setTargetId(null);
    setActionError(null);
  };

  const upgradeAgain = () => {
    playClickSound();
    setPhase({ kind: 'idle' });
    setActionError(null);
    if (phase.kind === 'result' && phase.won && phase.rewardInstanceId) {
      setInputId(phase.rewardInstanceId);
    } else {
      setInputId(null);
    }
    setTargetId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#130f26] via-[#0d0f17] to-[#1a0c1a] p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-0 grid-texture opacity-25" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 20% 40%, rgba(139,92,246,0.18) 0%, transparent 60%)',
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/35 text-brand-300 text-[11px] font-black uppercase tracking-widest shadow-inner">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tactical Upgrader</span>
            </div>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black font-display text-white tracking-tight uppercase flex items-center gap-3">
              Upgrade <span className="metallic">Arena</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-xl">
              Risk your skin for a high-value upgrade. Transparent calculated odds
              with dynamic precision roulette.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-surface-dark/80 p-3 rounded-2xl border border-white/[0.07] backdrop-blur-md">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-[10px] uppercase font-bold text-text-muted">Edge</div>
              <div className="text-sm font-black text-emerald-400 font-display">5.0%</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-[10px] uppercase font-bold text-text-muted">Max Odds</div>
              <div className="text-sm font-black text-cyan-400 font-display">
                {MAX_CHANCE_PERCENT}%
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] uppercase font-bold text-text-muted">Min Odds</div>
              <div className="text-sm font-black text-gold font-display">
                {MIN_CHANCE_PERCENT}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {actionError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3.5 text-sm text-red-300 flex items-center gap-3 shadow-lg"
        >
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Upgrader Arena: 3-Column Grand Showcase */}
      <section className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#111420] to-[#0a0c13] p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Your Skin (Sacrifice) */}
          <div className="lg:col-span-3 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand-300" />
                Your Skin
              </span>
              {inputItem && (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setInputId(null);
                    setTargetId(null);
                  }}
                  className="text-[10px] font-bold text-text-secondary hover:text-white transition-colors"
                >
                  Change
                </button>
              )}
            </div>

            <div
              className={`w-full h-80 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between p-5 relative overflow-hidden ${
                inputItem
                  ? 'bg-surface-dark/90 shadow-xl'
                  : 'bg-white/[0.02] border-dashed border-white/20'
              }`}
              style={{
                borderColor: inputItem
                  ? `${getRarityColor(inputItem.rarity)}60`
                  : undefined,
                boxShadow: inputItem
                  ? `0 0 35px ${getRarityColor(inputItem.rarity)}20`
                  : undefined,
              }}
            >
              {inputItem ? (
                <>
                  <div className="w-full flex justify-between items-center z-10">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: `${getRarityColor(inputItem.rarity)}20`,
                        color: getRarityColor(inputItem.rarity),
                        border: `1px solid ${getRarityColor(inputItem.rarity)}40`,
                      }}
                    >
                      {inputItem.rarity}
                    </span>
                    <span className="text-xs font-black text-emerald-400 font-display">
                      {formatCurrency(inputItem.demoValue)}
                    </span>
                  </div>

                  {/* Ambient artwork glow */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at center, ${getRarityColor(
                        inputItem.rarity
                      )} 0%, transparent 70%)`,
                    }}
                  />

                  <div className="my-auto py-2 z-10 transition-transform duration-300 hover:scale-105">
                    <ItemImage
                      src={inputItem.image}
                      alt={inputItem.name}
                      width={180}
                      height={120}
                      className="max-h-28 object-contain mx-auto drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  <div className="w-full text-center z-10">
                    <h3 className="text-sm font-black text-white truncate font-display">
                      {inputItem.name}
                    </h3>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Selected Sacrifice
                    </p>
                  </div>
                </>
              ) : (
                <div className="my-auto flex flex-col items-center justify-center text-center p-4 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted">
                    <Shield className="w-7 h-7 opacity-40 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">
                      No Skin Chosen
                    </p>
                    <p className="text-[11px] text-text-muted mt-1 max-w-[180px]">
                      Pick any skin from your inventory list below
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Column: The Wheel and Action Console */}
          <div className="lg:col-span-6 flex flex-col items-center gap-5">
            {/* Realtime Odds Bar */}
            <div className="w-full max-w-md flex items-center justify-between px-4 py-2 rounded-xl bg-surface-dark/70 border border-white/[0.08] backdrop-blur-sm text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-text-muted">Multiplier</span>
                <span className="font-black text-cyan-300 font-display">
                  {targetRatio ? `${targetRatio.toFixed(2)}×` : '—'}
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-text-muted">Est. Profit</span>
                <span className="font-black text-emerald-400 font-display">
                  {potentialProfit !== null ? `+${formatCurrency(potentialProfit)}` : '—'}
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTurbo((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black transition-colors ${
                    isTurbo
                      ? 'bg-gold/20 text-gold border border-gold/40'
                      : 'text-text-muted hover:text-white'
                  }`}
                  title="Toggle Turbo Spin speed (1.8s)"
                >
                  <Zap className="w-3 h-3" />
                  Turbo {isTurbo ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* The Upgrade Wheel */}
            <UpgradeWheel
              chancePercent={chance ?? 0}
              spinning={phase.kind === 'spinning'}
              outcome={
                phase.kind === 'spinning'
                  ? phase.won
                    ? 'win'
                    : 'lose'
                  : null
              }
              onComplete={finishSpin}
              targetMultiplier={targetRatio ?? undefined}
              isTurbo={isTurbo}
            />

            {/* Grand Upgrade Button */}
            <div className="w-full max-w-md space-y-2">
              <button
                type="button"
                onClick={() => void startUpgrade()}
                disabled={
                  !inputItem ||
                  !targetItem ||
                  chance === null ||
                  phase.kind !== 'idle' ||
                  !isLoaded
                }
                className="relative w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all duration-300 disabled:cursor-not-allowed overflow-hidden group shadow-2xl flex items-center justify-center gap-2"
                style={{
                  background:
                    !inputItem || !targetItem || chance === null || phase.kind !== 'idle' || !isLoaded
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                  boxShadow:
                    !inputItem || !targetItem || chance === null || phase.kind !== 'idle' || !isLoaded
                      ? 'none'
                      : '0 0 35px rgba(6, 182, 212, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                  color:
                    !inputItem || !targetItem || chance === null || phase.kind !== 'idle' || !isLoaded
                      ? 'rgba(255, 255, 255, 0.3)'
                      : '#ffffff',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  {phase.kind === 'spinning' ? 'Upgrading…' : 'Upgrade'}
                </span>
                {/* Glow sweep animation */}
                {!(!inputItem || !targetItem || chance === null || phase.kind !== 'idle' || !isLoaded) && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)',
                    }}
                  />
                )}
              </button>

              <p className="text-[11px] text-text-muted text-center">
                Outcome is committed to local storage before the visual wheel roll.
              </p>
            </div>
          </div>

          {/* Right Column: Target Skin (Reward) */}
          <div className="lg:col-span-3 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-gold" />
                Target Skin
              </span>
              {targetItem && (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setTargetId(null);
                  }}
                  className="text-[10px] font-bold text-text-secondary hover:text-white transition-colors"
                >
                  Change
                </button>
              )}
            </div>

            <div
              className={`w-full h-80 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between p-5 relative overflow-hidden ${
                targetItem
                  ? 'bg-surface-dark/90 shadow-xl'
                  : 'bg-white/[0.02] border-dashed border-white/20'
              }`}
              style={{
                borderColor: targetItem
                  ? `${getRarityColor(targetItem.rarity)}60`
                  : undefined,
                boxShadow: targetItem
                  ? `0 0 35px ${getRarityColor(targetItem.rarity)}20`
                  : undefined,
              }}
            >
              {targetItem ? (
                <>
                  <div className="w-full flex justify-between items-center z-10">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: `${getRarityColor(targetItem.rarity)}20`,
                        color: getRarityColor(targetItem.rarity),
                        border: `1px solid ${getRarityColor(targetItem.rarity)}40`,
                      }}
                    >
                      {targetItem.rarity}
                    </span>
                    <span className="text-xs font-black text-cyan-400 font-display">
                      {formatCurrency(targetItem.demoValue)}
                    </span>
                  </div>

                  {/* Ambient artwork glow */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at center, ${getRarityColor(
                        targetItem.rarity
                      )} 0%, transparent 70%)`,
                    }}
                  />

                  <div className="my-auto py-2 z-10 transition-transform duration-300 hover:scale-105">
                    <ItemImage
                      src={targetItem.image}
                      alt={targetItem.name}
                      width={180}
                      height={120}
                      className="max-h-28 object-contain mx-auto drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  <div className="w-full text-center z-10">
                    <h3 className="text-sm font-black text-white truncate font-display">
                      {targetItem.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {chance !== null && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-brand/20 text-brand-300 border border-brand/30">
                          {chance.toFixed(1)}% Chance
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="my-auto flex flex-col items-center justify-center text-center p-4 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted">
                    <Flame className="w-7 h-7 opacity-40 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">
                      No Target Chosen
                    </p>
                    <p className="text-[11px] text-text-muted mt-1 max-w-[180px]">
                      Choose an upgrade skin from the catalog below
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dual Selector Panels: Inventory (Left) and Targets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Selector: Your Inventory */}
        <section className="bg-surface/90 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-[640px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Your Inventory</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-black text-text-muted">
                  {inventory.length}
                </span>
              </h2>
              <p className="text-xs text-text-muted mt-0.5">Select a skin to sacrifice</p>
            </div>

            {/* Inventory Search */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search skins…"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-text-muted focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {!isLoaded ? (
            <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
              Loading inventory…
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-muted gap-3">
              <Shield className="w-12 h-12 opacity-30 text-brand-300" />
              <p className="text-sm font-semibold text-white">No skins available</p>
              <p className="text-xs text-text-muted max-w-xs">
                Open cases or win battles to add skins to your upgrade inventory.
              </p>
              <Link
                href="/"
                className="mt-2 py-2 px-5 rounded-xl bg-brand hover:bg-brand-500 text-white font-bold text-xs transition-transform hover:scale-105"
              >
                Go to Cases
              </Link>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-text-muted">
              No matching skins found in inventory.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1.5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredInventory.map((item) => {
                const isSelected = item.instanceId === inputId;
                const color = getRarityColor(item.rarity);
                return (
                  <button
                    key={item.instanceId}
                    type="button"
                    onClick={() => selectInput(item)}
                    aria-pressed={isSelected}
                    style={{
                      borderColor: isSelected ? '#22d3ee' : `${color}35`,
                      boxShadow: isSelected
                        ? `0 0 20px ${color}60, inset 0 0 15px ${color}25`
                        : `0 0 0px transparent`,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    className={`p-3 rounded-2xl border bg-surface-dark/85 cursor-pointer flex flex-col items-center justify-between text-center group relative overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 bg-cyan-950/30 scale-[1.02]'
                        : 'hover:scale-[1.03] hover:bg-surface-light/80 hover:border-white/30'
                    }`}
                  >
                    {/* Top value badge */}
                    <div className="w-full flex justify-between items-center mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] font-black text-emerald-400">
                        {formatCurrency(item.demoValue)}
                      </span>
                    </div>

                    <ItemImage
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={50}
                      className="max-h-14 object-contain my-1.5 transition-transform group-hover:scale-110 drop-shadow-md"
                    />

                    <div className="w-full mt-1">
                      <p className="text-[11px] font-bold text-white truncate w-full">
                        {item.name}
                      </p>
                      <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">
                        {item.rarity}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Selector: Target Catalog */}
        <section className="bg-surface/90 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-[640px]">
          <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Upgrade Targets</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-black text-text-muted">
                    {filteredTargets.length}
                  </span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">Select a weapon to aim for</p>
              </div>

              {/* Target Search */}
              <div className="relative w-40 sm:w-48">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search targets…"
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-text-muted focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Multiplier Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setShowAllTargets((prev) => !prev);
                }}
                aria-pressed={showAllTargets}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                  showAllTargets
                    ? 'bg-gradient-to-r from-gold to-amber-500 text-surface-dark shadow-md'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10'
                }`}
              >
                All
              </button>
              {MULTIPLIERS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setShowAllTargets(false);
                    setMultiplier(val);
                  }}
                  aria-pressed={!showAllTargets && multiplier === val}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all whitespace-nowrap ${
                    !showAllTargets && multiplier === val
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10'
                  }`}
                >
                  ×{val}
                </button>
              ))}
            </div>
          </div>

          {!inputItem ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-muted gap-3">
              <Zap className="w-12 h-12 opacity-30 text-gold" />
              <p className="text-sm font-semibold text-white">Select an inventory skin first</p>
              <p className="text-xs text-text-muted max-w-xs">
                Target options and win percentages are dynamically calculated relative to your selected sacrifice skin.
              </p>
            </div>
          ) : filteredTargets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-text-muted">
              No target skins found matching criteria.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1.5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredTargets.map((item) => {
                const isSelected = item.id === targetId;
                const color = getRarityColor(item.rarity);
                const targetChance = (() => {
                  const inputCents = Math.round(inputItem.demoValue * 100);
                  const targetCents = Math.round(item.demoValue * 100);
                  if (targetCents <= inputCents) return null;
                  return upgradeChance(inputCents, targetCents);
                })();

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTarget(item)}
                    aria-pressed={isSelected}
                    style={{
                      borderColor: isSelected ? '#22d3ee' : `${color}35`,
                      boxShadow: isSelected
                        ? `0 0 20px ${color}60, inset 0 0 15px ${color}25`
                        : `0 0 0px transparent`,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    className={`p-3 rounded-2xl border bg-surface-dark/85 cursor-pointer flex flex-col items-center justify-between text-center group relative overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 bg-cyan-950/30 scale-[1.02]'
                        : 'hover:scale-[1.03] hover:bg-surface-light/80 hover:border-white/30'
                    }`}
                  >
                    {/* Top value + Odds badge */}
                    <div className="w-full flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-cyan-400">
                        {formatCurrency(item.demoValue)}
                      </span>
                      {targetChance !== null ? (
                        <span
                          className="text-[10px] font-black px-1.5 py-0.5 rounded font-display"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color,
                          }}
                        >
                          {targetChance.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted">—</span>
                      )}
                    </div>

                    <ItemImage
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={50}
                      className="max-h-14 object-contain my-1.5 transition-transform group-hover:scale-110 drop-shadow-md"
                    />

                    <div className="w-full mt-1">
                      <p className="text-[11px] font-bold text-white truncate w-full">
                        {item.name}
                      </p>
                      <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">
                        {item.rarity}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Result Dialog Modal */}
      {phase.kind === 'result' && (
        <Dialog
          label={
            phase.won
              ? `Upgrade won ${phase.target.name}`
              : `Upgrade lost ${phase.input.name}`
          }
          onClose={resetRound}
        >
          <div
            className="bg-[#0f121d] border rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
            style={{
              borderColor: phase.won
                ? `${getRarityColor(phase.target.rarity)}80`
                : 'rgba(239, 68, 68, 0.4)',
              boxShadow: phase.won
                ? `0 0 60px ${getRarityColor(phase.target.rarity)}35`
                : '0 0 40px rgba(239, 68, 68, 0.2)',
            }}
          >
            {/* Ambient Background Aura */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: phase.won
                  ? `radial-gradient(circle at center, ${getRarityColor(
                      phase.target.rarity
                    )} 0%, transparent 70%)`
                  : 'radial-gradient(circle at center, rgba(239,68,68,0.4) 0%, transparent 70%)',
              }}
            />

            {phase.won ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider mb-4 border border-emerald-500/40 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Upgrade successful!</span>
                </div>

                <div className="relative my-6 py-2">
                  <ItemImage
                    src={phase.target.image}
                    alt={phase.target.name}
                    width={240}
                    height={150}
                    className="max-h-40 object-contain mx-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] animate-pulse"
                  />
                </div>

                <h3 className="text-2xl font-black text-white font-display">
                  {phase.target.name}
                </h3>
                <p className="text-xl font-black text-emerald-400 mt-2 font-display">
                  Valued at {formatCurrency(phase.target.demoValue)}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Rolled in {phase.chance.toFixed(1)}% win zone
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={upgradeAgain}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-surface-dark font-black hover:opacity-95 transition-transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Upgrade Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetRound}
                    className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-text-secondary font-bold hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider mb-4 border border-rose-500/40">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Upgrade failed</span>
                </div>

                <div className="relative my-6 opacity-40">
                  <ItemImage
                    src={phase.input.image}
                    alt={phase.input.name}
                    width={200}
                    height={130}
                    className="max-h-32 object-contain mx-auto grayscale"
                  />
                </div>

                <h3 className="text-xl font-black text-white font-display">
                  {phase.input.name} was consumed
                </h3>
                <p className="text-xs text-text-secondary mt-2 max-w-xs mx-auto">
                  Better luck next round. {phase.chance.toFixed(1)}% win probability
                  was not hit this time.
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={upgradeAgain}
                    className="flex-1 py-4 rounded-xl bg-white text-surface-dark font-black hover:bg-accent transition-transform hover:scale-[1.02] shadow-lg"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={resetRound}
                    className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-text-secondary font-bold hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
