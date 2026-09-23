'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '@/hooks/useInventory';
import { useEconomy } from '@/hooks/useEconomy';
import { useApp } from '@/context/AppContext';
import { Item, Rarity } from '@/types';
import { ITEMS } from '@/data/mockData';
import ItemImage from '@/components/ui/ItemImage';
import {
  formatCurrency,
  getRarityColor,
  getRarityBadgeClass,
} from '@/lib/utils';
import {
  playClickSound,
  playWinSound,
  playCaseOpenSound,
  playDepositSound,
} from '@/lib/sound';
import {
  Flame,
  Sparkles,
  CheckCircle2,
  Gift,
  Plus,
  Trash2,
  Shield,
} from 'lucide-react';

const RARITY_TIERS: Rarity[] = [
  'Consumer',
  'Industrial',
  'Mil-Spec',
  'Restricted',
  'Classified',
  'Covert',
  'Special Item',
];

export default function ContractsPage() {
  const { inventory } = useInventory();
  const { isLoaded } = useEconomy();
  const { tradeUpContract, addBalance } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [rewardItem, setRewardItem] = useState<Item | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  // Group inventory items
  const selectedItems = useMemo(() => {
    return selectedIds
      .map((id) => inventory.find((it) => it.instanceId === id))
      .filter((it): it is Item => it !== undefined);
  }, [inventory, selectedIds]);

  const totalInputValue = useMemo(() => {
    return selectedItems.reduce((acc, it) => acc + (it.demoValue || 0), 0);
  }, [selectedItems]);

  // Determine dominant or average rarity of inputs
  const targetRarity = useMemo<Rarity | null>(() => {
    if (selectedItems.length === 0) return null;
    const rarities = selectedItems.map((it) => it.rarity);
    // Find highest rarity among inputs
    let highestIdx = 0;
    for (const r of rarities) {
      const idx = RARITY_TIERS.indexOf(r);
      if (idx > highestIdx) highestIdx = idx;
    }
    // Target is next tier up, max out at Special Item
    const targetIdx = Math.min(highestIdx + 1, RARITY_TIERS.length - 1);
    return RARITY_TIERS[targetIdx];
  }, [selectedItems]);

  // Potential reward pool
  const potentialRewards = useMemo(() => {
    if (!targetRarity) return [];
    return ITEMS.filter((it) => it.rarity === targetRarity);
  }, [targetRarity]);

  const toggleSelect = (item: Item) => {
    playClickSound();
    if (!item.instanceId) return;
    if (selectedIds.includes(item.instanceId)) {
      setSelectedIds((prev) => prev.filter((id) => id !== item.instanceId));
    } else {
      if (selectedIds.length >= 10) return;
      setSelectedIds((prev) => [...prev, item.instanceId!]);
    }
  };

  const clearSelection = () => {
    playClickSound();
    setSelectedIds([]);
  };

  const fillFiveRandom = () => {
    playClickSound();
    const available = inventory.filter((it) => it.instanceId && !selectedIds.includes(it.instanceId));
    const toAdd = available.slice(0, 5 - selectedIds.length).map((it) => it.instanceId!);
    setSelectedIds((prev) => [...prev, ...toAdd]);
  };

  const handleSignContract = async () => {
    if (selectedItems.length < 3 || isSigning || potentialRewards.length === 0) return;
    setIsSigning(true);
    playCaseOpenSound();

    // Pick a random reward from the target pool weighted slightly by value
    const randomIndex = Math.floor(Math.random() * potentialRewards.length);
    const chosenReward = potentialRewards[randomIndex];

    setTimeout(async () => {
      const res = await tradeUpContract(selectedIds, chosenReward);
      setIsSigning(false);
      if (res.ok) {
        setRewardItem(chosenReward);
        playWinSound(chosenReward.rarity);
        setSelectedIds([]);
      }
    }, 1600);
  };

  const handleDailyBonus = () => {
    if (dailyClaimed) return;
    setDailyClaimed(true);
    playDepositSound();
    void addBalance(250);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-dark via-surface to-surface-dark border border-white/10 p-8 shadow-2xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>CS2 Trade-Up System</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            Trade-Up <span className="text-amber-400">Contracts</span>
          </h1>
          <p className="text-sm text-text-secondary">
            Deposit between 3 and 10 skins to exchange for a guaranteed higher-tier weapon finish. Turn entry-level drops into Covert & Knife masterpieces.
          </p>
        </div>

        {/* Daily Fan-Service Bonus Box */}
        <div className="bg-surface-dark/90 border border-amber-500/20 p-5 rounded-2xl flex flex-col items-center gap-3 text-center w-full md:w-auto min-w-[260px]">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Gift className="w-4 h-4" />
            <span>Daily Funservice Gift</span>
          </div>
          <p className="text-xs text-text-muted">Claim free $250 demo credit booster!</p>
          <button
            onClick={handleDailyBonus}
            disabled={dailyClaimed}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              dailyClaimed
                ? 'bg-white/5 text-text-muted border border-white/5 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-surface-dark font-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]'
            }`}
          >
            {dailyClaimed ? '✓ Claimed Today' : '+ $250 Free Bonus'}
          </button>
        </div>
      </section>

      {/* Main Trade-Up Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Contract Clipboard & Input Slots */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface/90 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Contract Materials</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-accent font-semibold">
                    {selectedIds.length} / 10
                  </span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Select at least 3 skins from inventory to sign.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                    title="Clear selected slots"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
                {inventory.length >= 3 && selectedIds.length < 5 && (
                  <button
                    onClick={fillFiveRandom}
                    className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
                  >
                    Quick 5
                  </button>
                )}
              </div>
            </div>

            {/* 10 Visual Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {Array.from({ length: 10 }).map((_, index) => {
                const item = selectedItems[index];
                if (item) {
                  const color = getRarityColor(item.rarity);
                  return (
                    <div
                      key={item.instanceId || index}
                      onClick={() => toggleSelect(item)}
                      style={{ borderColor: `${color}40` }}
                      className="h-28 rounded-2xl bg-surface-dark border p-2 flex flex-col justify-between items-center relative group cursor-pointer hover:border-red-400/50 transition-all overflow-hidden"
                    >
                      <div
                        className="absolute top-0 inset-x-0 h-1"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[9px] font-bold text-text-muted truncate w-full text-center">
                        {item.weaponType}
                      </span>
                      <ItemImage
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={40}
                        className="max-h-12 object-contain my-auto"
                      />
                      <div className="w-full text-center">
                        <p className="text-[10px] font-bold text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[9px] font-bold text-emerald-400">
                          {formatCurrency(item.demoValue)}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-red-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-red-300 text-xs font-bold">
                        Remove
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-28 rounded-2xl border-2 border-dashed border-white/10 bg-surface-dark/30 flex flex-col items-center justify-center text-text-muted gap-1 text-[11px]"
                  >
                    <Plus className="w-4 h-4 opacity-40" />
                    <span>Slot {index + 1}</span>
                  </div>
                );
              })}
            </div>

            {/* Summary & Sign Action */}
            <div className="p-4 rounded-2xl bg-surface-dark/60 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-text-secondary block">
                  Total Material Value:
                </span>
                <span className="text-xl font-bold text-emerald-400 font-display">
                  {formatCurrency(totalInputValue)}
                </span>
              </div>

              <button
                onClick={handleSignContract}
                disabled={!isLoaded || selectedItems.length < 3 || isSigning}
                className={`py-3.5 px-8 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  selectedItems.length >= 3 && !isSigning
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-surface-dark shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-[1.02] font-black'
                    : 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
                }`}
              >
                <Flame className="w-4 h-4" />
                {isSigning ? 'Forging Contract…' : `Sign Trade-Up (${selectedItems.length}/10)`}
              </button>
            </div>
          </div>

          {/* Target Tier Probability Preview */}
          {targetRarity && (
            <div className="bg-surface/80 border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Target Upgrade Tier
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getRarityBadgeClass(targetRarity)}`}
                >
                  Guaranteed: {targetRarity}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {potentialRewards.map((rew) => (
                  <div
                    key={rew.id}
                    className="flex-shrink-0 w-28 p-2 rounded-xl bg-surface-dark border border-white/5 text-center"
                    style={{ borderColor: `${getRarityColor(rew.rarity)}30` }}
                  >
                    <ItemImage
                      src={rew.image}
                      alt={rew.name}
                      width={80}
                      height={50}
                      className="max-h-12 object-contain mx-auto mb-1"
                    />
                    <p className="text-[10px] font-bold text-white truncate">
                      {rew.name}
                    </p>
                    <p className="text-[9px] font-semibold text-emerald-400">
                      {formatCurrency(rew.demoValue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Available Inventory Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface/90 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col h-[650px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Your Skins Pool</h3>
              <span className="text-xs text-text-muted">
                {inventory.length} available
              </span>
            </div>

            {inventory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-muted gap-3">
                <Shield className="w-10 h-10 opacity-30 text-accent" />
                <p className="text-sm font-semibold text-white">No skins available</p>
                <p className="text-xs text-text-muted max-w-xs">
                  Open some cases first to unbox skins for trade-up contracts.
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
                  const isSelected = selectedIds.includes(item.instanceId!);
                  const color = getRarityColor(item.rarity);
                  return (
                    <div
                      key={item.instanceId}
                      onClick={() => toggleSelect(item)}
                      style={{
                        borderColor: isSelected ? '#f59e0b' : `${color}25`,
                      }}
                      className={`p-2.5 rounded-xl border bg-surface-dark/80 cursor-pointer flex flex-col items-center justify-between text-center transition-all ${
                        isSelected
                          ? 'ring-2 ring-amber-400 bg-amber-500/10'
                          : 'hover:border-white/20'
                      }`}
                    >
                      <div className="w-full flex justify-between items-center mb-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract Win Modal Reveal */}
      <AnimatePresence>
        {rewardItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-surface border border-amber-500/40 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
              style={{
                boxShadow: `0 0 50px ${getRarityColor(rewardItem.rarity)}30`,
              }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Trade-Up Successful!</span>
              </div>

              <div className="relative my-6">
                <ItemImage
                  src={rewardItem.image}
                  alt={rewardItem.name}
                  width={240}
                  height={150}
                  className="max-h-36 object-contain mx-auto filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                />
              </div>

              <h3 className="text-2xl font-black text-white font-display">
                {rewardItem.name}
              </h3>
              <p
                className="text-xs font-bold uppercase tracking-wider mt-1"
                style={{ color: getRarityColor(rewardItem.rarity) }}
              >
                {rewardItem.rarity}
              </p>
              <p className="text-lg font-black text-emerald-400 mt-2 font-display">
                Valued at {formatCurrency(rewardItem.demoValue)}
              </p>

              <button
                onClick={() => setRewardItem(null)}
                className="mt-6 w-full py-3.5 rounded-xl bg-white text-surface-dark font-black hover:bg-accent transition-colors"
              >
                Collect Weapon
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
