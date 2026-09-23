'use client';

import ItemImage from '@/components/ui/ItemImage';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { useApp } from '@/context/AppContext';
import { CASES, ITEMS } from '@/data/mockData';
import CaseCard from '@/components/case/CaseCard';
import { formatCurrency, getRarityColor, getRankTitle } from '@/lib/utils';
import { playCashSound } from '@/lib/sound';
import { Package, Shield, History, RotateCcw, Plus, Sparkles, TrendingUp } from 'lucide-react';

export default function HomeContent({ hero }: { hero: React.ReactNode }) {
  const { balance, level, xp, addBalance, resetEconomy, isLoaded } =
    useEconomy();
  const { inventory } = useInventory();
  const { history } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'POPULAR', 'FANSERVICE', 'BUDGET', 'PREMIUM', 'KNIFE'];

  const filteredCases =
    selectedCategory === 'ALL'
      ? CASES
      : CASES.filter((c) => c.category === selectedCategory);

  const xpProgress = xp % 1000;
  const xpPercentage = Math.min(100, Math.round((xpProgress / 1000) * 100));

  const totalInventoryValue = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.demoValue || 0), 0);
  }, [inventory]);

  const rank = getRankTitle(isLoaded ? level : 1);

  // Showcase drops to show if user has no recent drops yet
  const displayDrops = useMemo(() => {
    if (history.length > 0) {
      return history.map((h) => ({
        id: h.item.instanceId || h.item.id,
        name: h.item.name,
        rarity: h.item.rarity,
        demoValue: h.item.demoValue,
        image: h.item.image,
        weaponType: h.item.weaponType,
        isSimulated: false,
      }));
    }
    // High-tier representative skins for a lively ticker
    return [
      ITEMS[0], // Karambit Doppler
      ITEMS[4], // AK-47 Fire Serpent
      ITEMS[3], // AWP Asiimov
      ITEMS[1], // Butterfly Fade
      ITEMS[6], // M4A1-S Printstream
      ITEMS[7], // AK-47 Neon Rider
    ].map((item) => ({
      id: item.id,
      name: item.name,
      rarity: item.rarity,
      demoValue: item.demoValue,
      image: item.image,
      weaponType: item.weaponType,
      isSimulated: true,
    }));
  }, [history]);

  const handleAddCredits = () => {
    playCashSound();
    void addBalance(500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Live Recent Unboxings Ticker */}
      <section className="bg-surface-dark/90 border border-white/10 rounded-2xl p-3 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5 px-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <History className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-black uppercase tracking-wider text-white">
              {history.length > 0 ? 'Recent Drops' : 'Featured Drops'}
            </span>
          </div>
          <span className="text-[10px] text-text-muted">
            {history.length > 0 ? `${history.length} local drops recorded` : 'Illustrative catalog drops'}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {displayDrops.map((item, idx) => {
            const rarityColor = getRarityColor(item.rarity);
            return (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface/90 border flex-shrink-0 min-w-[210px] hover:border-white/30 transition-all group"
                style={{
                  borderColor: `${rarityColor}40`,
                  boxShadow: `0 2px 10px ${rarityColor}10`,
                }}
              >
                <div className="w-12 h-10 flex-shrink-0 flex items-center justify-center bg-surface-dark/80 rounded-lg p-0.5">
                  <ItemImage
                    src={item.image}
                    alt={item.name}
                    className="max-h-8 max-w-full object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate max-w-[130px]">
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: rarityColor }}
                    >
                      {item.rarity}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold font-display">
                      {formatCurrency(item.demoValue)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hero Section */}
      <section className="text-center pt-4 pb-8">
        {hero}

        {/* Player Stats Bar */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Balance Card */}
          <div className="glass-card-interactive border border-emerald-500/20 p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_4px_20px_rgba(16,185,129,0.06)]">
            <div className="absolute top-0 right-0 p-2.5">
              <button
                disabled={!isLoaded}
                onClick={handleAddCredits}
                title="Add $500 free test credits"
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>$500</span>
              </button>
            </div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Wallet Balance
            </p>
            <p className="text-3xl font-black text-emerald-400 font-display tracking-tight">
              {isLoaded ? formatCurrency(balance) : '$0.00'}
            </p>
            <span className="text-[10px] text-emerald-400/70 mt-1 font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Instant reload available
            </span>
          </div>

          {/* Level & Rank Card */}
          <div className="glass-card-interactive border border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full mb-1 px-1">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                Account Rank
              </p>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                style={{ color: rank.color }}
              >
                {rank.title}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-3xl font-black text-white font-display">
                Level {isLoaded ? level : 1}
              </span>
            </div>

            <div className="w-full bg-surface-dark h-2 rounded-full overflow-hidden mt-1 border border-white/5">
              <div
                className="bg-gradient-to-r from-accent to-cyan-300 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <div className="flex justify-between w-full text-[10px] text-text-muted mt-1 px-1">
              <span>{xpProgress} XP</span>
              <span>1000 XP for next level</span>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="glass-card-interactive border border-purple-500/20 p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-[0_4px_20px_rgba(136,71,255,0.06)]">
            <div className="absolute top-0 right-0 p-2.5">
              <span className="text-[10px] font-bold text-purple-300 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {formatCurrency(totalInventoryValue)}
              </span>
            </div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Inventory Vault
            </p>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              <span className="text-3xl font-black text-white font-display">
                {isLoaded ? inventory.length : 0} Skins
              </span>
            </div>
            <Link
              href="/inventory"
              className="text-[11px] font-bold text-accent hover:underline mt-1.5 flex items-center gap-1"
            >
              Open Collection Vault →
            </Link>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <a
            href="#cases"
            className="bg-white text-surface-dark px-8 py-3.5 rounded-full font-bold text-base hover:bg-accent transition-all transform hover:scale-105 shadow-xl shadow-cyan-500/10 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-surface-dark" />
            <span>Explore Cases</span>
          </a>
          <Link
            href="/inventory"
            className="bg-white/5 border border-white/15 text-white px-8 py-3.5 rounded-full font-bold text-base hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-purple-400" />
            <span>My Inventory ({inventory.length})</span>
          </Link>
          <button
            onClick={() => {
              if (
                confirm(
                  'Reset your balance, XP, and inventory to starting defaults?'
                )
              ) {
                resetEconomy();
              }
            }}
            disabled={!isLoaded}
            aria-label="Reset progress"
            title="Reset to default starting state"
            className="p-3.5 rounded-full bg-white/5 hover:bg-red-500/20 text-text-muted hover:text-red-400 border border-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Featured Cases Section */}
      <section id="cases" className="py-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
                Featured Cases
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-accent">
                {filteredCases.length}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Choose a case to spin the roulette and unbox premium finishes.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-surface-dark rounded-2xl border border-white/10 self-start md:self-auto shadow-inner">
            {categories.map((cat) => (
              <button
                key={cat}
                aria-pressed={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent text-surface-dark shadow-[0_0_15px_rgba(34,211,238,0.35)] scale-105'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseData={caseItem} />
          ))}
        </div>
      </section>

      {/* Inventory Preview Section */}
      <section className="py-8 border-t border-white/10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Recent Collection
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Your latest unboxed items stored in your local inventory.
            </p>
          </div>
          <Link
            href="/inventory"
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
          >
            Open Full Inventory ({inventory.length}) →
          </Link>
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-16 bg-surface-dark/50 rounded-3xl border border-dashed border-white/15">
            <Package className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-text-secondary font-medium">
              Your inventory is empty
            </p>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              Open any case above to begin collecting rare weapons and building
              your inventory valuation!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {inventory.slice(0, 6).map((item, idx) => {
              const rarityColor = getRarityColor(item.rarity);
              return (
                <div
                  key={`${item.instanceId || item.id}-${idx}`}
                  className="bg-surface p-3 rounded-2xl border flex flex-col justify-between group hover:border-white/25 transition-all shadow-md"
                  style={{ borderColor: `${rarityColor}35` }}
                >
                  <div className="relative w-full h-24 flex items-center justify-center bg-surface-dark/90 rounded-xl mb-2 overflow-hidden">
                    <ItemImage
                      src={item.image}
                      alt={item.name}
                      className="max-h-20 max-w-full object-contain group-hover:scale-110 transition-transform filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: rarityColor }}
                      >
                        {item.rarity}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold font-display">
                        {formatCurrency(item.demoValue)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
