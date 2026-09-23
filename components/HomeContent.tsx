'use client';

import ItemImage from '@/components/ui/ItemImage';

import React, { useState } from 'react';
import Link from 'next/link';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { useApp } from '@/context/AppContext';
import { CASES } from '@/data/mockData';
import CaseCard from '@/components/case/CaseCard';
import { formatCurrency, getRarityColor } from '@/lib/utils';
import { Package, Shield, History, RotateCcw } from 'lucide-react';

export default function HomeContent({ hero }: { hero: React.ReactNode }) {
  const { balance, level, xp, addBalance, resetEconomy, isLoaded } =
    useEconomy();
  const { inventory } = useInventory();
  const { history } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'POPULAR', 'BUDGET', 'PREMIUM', 'KNIFE'];

  const filteredCases =
    selectedCategory === 'ALL'
      ? CASES
      : CASES.filter((c) => c.category === selectedCategory);

  const xpProgress = xp % 1000;
  const xpPercentage = Math.min(100, Math.round((xpProgress / 1000) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Live Recent Unboxings Ticker */}
      {history.length > 0 && (
        <section className="bg-surface-dark/80 border border-white/5 rounded-2xl p-3 overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 mb-2 px-2">
            <History className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Live Drops
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {history.map((entry, idx) => (
              <div
                key={`${entry.item.instanceId || entry.item.id}-${idx}`}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface border border-white/5 flex-shrink-0 min-w-[200px]"
                style={{
                  borderColor: `${getRarityColor(entry.item.rarity)}30`,
                }}
              >
                <ItemImage
                  src={entry.item.image}
                  alt={entry.item.name}
                  className="w-10 h-8 object-contain"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-[130px]">
                    {entry.item.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-bold uppercase"
                      style={{ color: getRarityColor(entry.item.rarity) }}
                    >
                      {entry.item.rarity}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {formatCurrency(entry.item.demoValue)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="text-center pt-8 pb-12">
        {hero}

        {/* Player Stats Bar */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Balance Card */}
          <div className="bg-surface/80 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2">
              <button
                disabled={!isLoaded}
                onClick={() => void addBalance(500)}
                title="Add $500 free credits"
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              >
                + $500
              </button>
            </div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Wallet Balance
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
              {isLoaded ? formatCurrency(balance) : '$0.00'}
            </p>
          </div>

          {/* Level & XP Card */}
          <div className="bg-surface/80 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Account Level
            </p>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-2xl sm:text-3xl font-black text-white font-display">
                Level {isLoaded ? level : 1}
              </span>
            </div>
            <div className="w-full max-w-[160px] bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <span className="text-[10px] text-text-muted mt-1">
              {xpProgress} / 1000 XP
            </span>
          </div>

          {/* Inventory Card */}
          <div className="bg-surface/80 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Inventory Size
            </p>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              <span className="text-2xl sm:text-3xl font-black text-white font-display">
                {isLoaded ? inventory.length : 0} Skins
              </span>
            </div>
            <Link
              href="/inventory"
              className="text-[10px] font-bold text-accent hover:underline mt-1"
            >
              View collection →
            </Link>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <a
            href="#cases"
            className="bg-white text-surface-dark px-8 py-3.5 rounded-full font-bold text-base hover:bg-accent transition-all transform hover:scale-105 shadow-lg shadow-white/10"
          >
            Explore Cases
          </a>
          <Link
            href="/inventory"
            className="bg-white/5 border border-white/15 text-white px-8 py-3.5 rounded-full font-bold text-base hover:bg-white/10 transition-all"
          >
            My Inventory ({inventory.length})
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
      <section id="cases" className="py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Featured Cases
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Choose a case to spin the roulette and unbox premium finishes.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-surface-dark rounded-2xl border border-white/10 self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                aria-pressed={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent text-surface-dark shadow-[0_0_15px_rgba(34,211,238,0.3)]'
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
                  className="bg-surface p-3 rounded-2xl border flex flex-col justify-between group hover:border-white/25 transition-all"
                  style={{ borderColor: `${rarityColor}35` }}
                >
                  <div className="relative w-full h-24 flex items-center justify-center bg-surface-dark rounded-xl mb-2 overflow-hidden">
                    <ItemImage
                      src={item.image}
                      alt={item.name}
                      className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform"
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
                      <span className="text-[10px] text-emerald-400 font-bold">
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
