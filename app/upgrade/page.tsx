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
import { playClickSound, playWinSound, playCaseOpenSound } from '@/lib/sound';
import { TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

const MULTIPLIERS = [2, 5, 10, 20, 50] as const;

type Phase =
  | { kind: 'idle' }
  | { kind: 'confirm'; input: Item; target: Item; chance: number }
  | { kind: 'spinning'; input: Item; target: Item; chance: number; won: boolean }
  | { kind: 'result'; input: Item; target: Item; chance: number; won: boolean };

export default function UpgradePage() {
  const { inventory } = useInventory();
  const { isLoaded } = useEconomy();
  const { upgradeItem } = useApp();

  const [inputId, setInputId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(2);
  const [showAllTargets, setShowAllTargets] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [actionError, setActionError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  // Celebrate a revealed win with confetti, mirroring WinScreen behavior.
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
          particleCount: 70,
          spread: 80,
          origin: { y: 0.55 },
          colors: [rarityColor, '#16a34a', '#FFD700', '#22D3EE', '#FFFFFF'],
          disableForReducedMotion: true,
        });
      })
      .catch(() => {
        /* Celebration is optional; the committed result remains available. */
      });
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

  // Catalog targets near input * multiplier, sorted by value distance.
  const suggestedTargets = useMemo(() => {
    if (!inputItem) return [];
    const desired = inputItem.demoValue * multiplier;
    return ITEMS.filter((entry) => entry.demoValue > inputItem.demoValue)
      .sort(
        (a, b) =>
          Math.abs(a.demoValue - desired) - Math.abs(b.demoValue - desired)
      )
      .slice(0, 12);
  }, [inputItem, multiplier]);

  const allTargets = useMemo(
    () =>
      ITEMS.filter(
        (entry) => entry.demoValue > (inputItem?.demoValue ?? 0)
      ).sort((a, b) => a.demoValue - b.demoValue),
    [inputItem]
  );

  const targets = showAllTargets ? allTargets : suggestedTargets;

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
    });
  };

  const finishSpin = () => {
    if (phase.kind !== 'spinning') return;
    setPhase({ ...phase, kind: 'result' });
    if (phase.won) playWinSound(phase.target.rarity);
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
    setTargetId(null);
    setActionError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-dark via-surface to-surface-dark border border-white/10 p-8 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Skin Upgrader</span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
          Upgrade your <span className="text-accent text-glow">skins</span>
        </h1>
        <p className="mt-2 text-sm text-text-secondary max-w-2xl">
          Exchange any inventory skin for a more valuable one. The win chance is
          proportional to the value ratio with a 5% house edge — the outcome is
          decided and saved before the wheel spins.
        </p>
      </section>

      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: inventory selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface/90 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col h-[620px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Your inventory</h3>
              <span className="text-xs text-text-muted">
                {inventory.length} available
              </span>
            </div>
            {!isLoaded ? (
              <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
                Loading…
              </div>
            ) : inventory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-muted gap-3">
                <Shield className="w-10 h-10 opacity-30 text-accent" />
                <p className="text-sm font-semibold text-white">
                  No skins available
                </p>
                <p className="text-xs text-text-muted max-w-xs">
                  Open some cases first to unbox skins for upgrading.
                </p>
                <Link
                  href="/"
                  className="mt-2 py-2 px-4 rounded-xl bg-accent hover:bg-accent-hover text-surface-dark font-bold text-xs transition-transform hover:scale-105"
                >
                  Go to Cases
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {inventory.map((item) => {
                  const isSelected = item.instanceId === inputId;
                  const color = getRarityColor(item.rarity);
                  return (
                    <button
                      key={item.instanceId}
                      type="button"
                      onClick={() => selectInput(item)}
                      aria-pressed={isSelected}
                      style={{ borderColor: isSelected ? '#22d3ee' : `${color}25` }}
                      className={`p-2.5 rounded-xl border bg-surface-dark/80 cursor-pointer flex flex-col items-center justify-between text-center transition-all ${
                        isSelected
                          ? 'ring-2 ring-accent bg-accent/10'
                          : 'hover:border-white/25'
                      }`}
                    >
                      <ItemImage
                        src={item.image}
                        alt={item.name}
                        width={70}
                        height={45}
                        className="max-h-12 object-contain my-1"
                      />
                      <p className="text-[10px] font-bold text-white truncate w-full">
                        {item.name}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-400 mt-0.5">
                        {formatCurrency(item.demoValue)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center: wheel and action */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface/90 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col items-center gap-6">
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
                  You give
                </p>
                {inputItem ? (
                  <p className="text-xs font-bold text-white truncate">
                    {inputItem.name} · {formatCurrency(inputItem.demoValue)}
                  </p>
                ) : (
                  <p className="text-xs text-text-muted">Pick an item</p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
                  You get
                </p>
                {targetItem ? (
                  <p className="text-xs font-bold text-white truncate">
                    {targetItem.name} · {formatCurrency(targetItem.demoValue)}
                  </p>
                ) : (
                  <p className="text-xs text-text-muted">Pick a target</p>
                )}
              </div>
            </div>

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
            />

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
              className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-white/5 disabled:text-text-muted text-surface-dark font-black text-sm uppercase tracking-wide transition-all disabled:cursor-not-allowed"
            >
              {phase.kind === 'spinning' ? 'Upgrading…' : 'Upgrade'}
            </button>
            <p className="text-[11px] text-text-muted text-center -mt-3">
              Win chance range {MIN_CHANCE_PERCENT}–{MAX_CHANCE_PERCENT}% ·
              outcome is committed before the wheel animation
            </p>
          </div>
        </div>

        {/* Right: target selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface/90 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col h-[620px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Upgrade target</h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setShowAllTargets((previous) => !previous);
                  }}
                  aria-pressed={showAllTargets}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${
                    showAllTargets
                      ? 'bg-gold text-surface-dark'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                {MULTIPLIERS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setMultiplier(value);
                    }}
                    aria-pressed={multiplier === value}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${
                      multiplier === value
                        ? 'bg-accent text-surface-dark'
                        : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    ×{value}
                  </button>
                ))}
              </div>
            </div>
            {!inputItem ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-muted gap-3">
                <Zap className="w-10 h-10 opacity-30 text-gold" />
                <p className="text-sm font-semibold text-white">
                  Select an item first
                </p>
                <p className="text-xs text-text-muted max-w-xs">
                  Choose a skin from your inventory to see upgrade targets.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {targets.map((item) => {
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
                      style={{ borderColor: isSelected ? '#22d3ee' : `${color}25` }}
                      className={`p-2.5 rounded-xl border bg-surface-dark/80 cursor-pointer flex flex-col items-center justify-between text-center transition-all ${
                        isSelected
                          ? 'ring-2 ring-accent bg-accent/10'
                          : 'hover:border-white/25'
                      }`}
                    >
                      <ItemImage
                        src={item.image}
                        alt={item.name}
                        width={70}
                        height={45}
                        className="max-h-12 object-contain my-1"
                      />
                      <p className="text-[10px] font-bold text-white truncate w-full">
                        {item.name}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-400 mt-0.5">
                        {formatCurrency(item.demoValue)}
                      </p>
                      <p
                        className="text-[9px] font-black mt-0.5"
                        style={{ color: color }}
                      >
                        {targetChance !== null
                          ? `${targetChance.toFixed(1)}%`
                          : '—'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result dialog — the wheel stays visible on the page while spinning */}
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
            className="bg-surface border rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            style={{
              borderColor: `${getRarityColor(phase.target.rarity)}60`,
              boxShadow: `0 0 50px ${getRarityColor(phase.target.rarity)}30`,
            }}
          >
            {phase.won ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span>Upgrade successful!</span>
                </div>
                <div className="relative my-6">
                  <ItemImage
                    src={phase.target.image}
                    alt={phase.target.name}
                    width={240}
                    height={150}
                    className="max-h-36 object-contain mx-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                  />
                </div>
                <h3 className="text-2xl font-black text-white font-display">
                  {phase.target.name}
                </h3>
                <p className="text-lg font-black text-emerald-400 mt-2 font-display">
                  Valued at {formatCurrency(phase.target.demoValue)}
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={upgradeAgain}
                    className="flex-1 py-3.5 rounded-xl bg-white text-surface-dark font-black hover:bg-accent transition-colors"
                  >
                    Upgrade Again
                  </button>
                  <button
                    type="button"
                    onClick={resetRound}
                    className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary font-bold hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <Shield className="w-4 h-4" />
                  <span>Upgrade failed</span>
                </div>
                <div className="relative my-6 opacity-60">
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
                <p className="text-sm text-text-secondary mt-2">
                  Better luck next time — {phase.chance.toFixed(1)}% was not
                  enough this round.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={upgradeAgain}
                    className="flex-1 py-3.5 rounded-xl bg-white text-surface-dark font-black hover:bg-accent transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={resetRound}
                    className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary font-bold hover:bg-white/10 transition-colors"
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