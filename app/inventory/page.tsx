'use client';

import ItemImage from '@/components/ui/ItemImage';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { usePreferences } from '@/hooks/usePreferences';
import { Item, Rarity } from '@/types';
import { formatCurrency, getRarityColor, getItemWear } from '@/lib/utils';
import { playCashSound } from '@/lib/sound';
import {
  Package,
  Trash2,
  DollarSign,
  Search,
  ArrowUpDown,
  Filter,
  Sparkles,
  Trophy,
  X,
  ChevronDown,
} from 'lucide-react';

// CS2 Rarity numeric weight for sorting
const rarityRank: Record<Rarity, number> = {
  'Special Item': 7,
  Covert: 6,
  Classified: 5,
  Restricted: 4,
  'Mil-Spec': 3,
  Industrial: 2,
  Consumer: 1,
};

export default function InventoryPage() {
  const { inventory, removeItem, sellItem, sellAll, isLoaded } = useInventory();
  const [visibleCount, setVisibleCount] = useState(48);

  const [filterRarity, setFilterRarity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'value_desc' | 'value_asc' | 'rarity_desc' | 'name' | 'newest'
  >('newest');

  // Total inventory net worth calculation
  const totalValuation = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.demoValue || 0), 0);
  }, [inventory]);

  // Top valued item in collection
  const topItem = useMemo(() => {
    if (inventory.length === 0) return null;
    return [...inventory].sort((a, b) => (b.demoValue || 0) - (a.demoValue || 0))[0];
  }, [inventory]);

  useEffect(() => {
    setVisibleCount(48);
  }, [filterRarity, searchQuery, sortBy]);

  // Filter items
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return inventory.filter((item) => {
      // Rarity filter
      if (filterRarity !== 'ALL' && item.rarity !== filterRarity) {
        return false;
      }
      // Search query
      if (query !== '') {
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesWeapon = item.weaponType.toLowerCase().includes(query);
        return matchesName || matchesWeapon;
      }
      return true;
    });
  }, [inventory, filterRarity, searchQuery]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'value_desc':
          return (b.demoValue || 0) - (a.demoValue || 0);
        case 'value_asc':
          return (a.demoValue || 0) - (b.demoValue || 0);
        case 'rarity_desc':
          return (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return (b.unboxedAt || 0) - (a.unboxedAt || 0);
      }
    });
  }, [filteredItems, sortBy]);

  const handleSellOne = (item: Item) => {
    playCashSound();
    const id = item.instanceId || item.id;
    void sellItem(id);
  };

  const handleSellAll = () => {
    if (inventory.length === 0) return;
    if (
      confirm(
        `Sell all ${inventory.length} items in your inventory for ${formatCurrency(totalValuation)}?`
      )
    ) {
      playCashSound();
      void sellAll();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Inventory Valuation Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-accent uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5 text-accent" />
            <span>Vault Collection</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight">
            Inventory
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage, inspect, and liquidate your collection of weapon finishes.
          </p>
        </div>

        {/* Valuation & Sell All Banner */}
        <div className="flex flex-wrap items-center gap-4 bg-surface/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl">
          <div className="pr-4 border-r border-white/10">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Total Net Worth
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
              {isLoaded ? formatCurrency(totalValuation) : '$0.00'}
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5">
              {inventory.length} Total {inventory.length === 1 ? 'Skin' : 'Skins'}
            </p>
          </div>

          {topItem && (
            <div className="hidden lg:block pr-4 border-r border-white/10 max-w-[200px]">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" /> Top Asset
              </p>
              <p className="text-xs font-bold text-white truncate mt-1" title={topItem.name}>
                {topItem.name}
              </p>
              <p className="text-xs font-bold text-emerald-400 font-display">
                {formatCurrency(topItem.demoValue)}
              </p>
            </div>
          )}

          <button
            onClick={handleSellAll}
            disabled={!isLoaded || inventory.length === 0}
            className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              inventory.length > 0
                ? 'bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Sell All</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            aria-label="Search inventory"
            placeholder="Search by weapon or skin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface/90 border border-white/10 text-white placeholder-text-muted text-sm focus:border-accent focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Rarity Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            aria-label="Filter rarity"
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-surface/90 border border-white/10 text-white text-sm focus:border-accent focus:outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">All Rarities</option>
            <option value="Special Item">Special Items (Gold)</option>
            <option value="Covert">Covert (Red)</option>
            <option value="Classified">Classified (Pink)</option>
            <option value="Restricted">Restricted (Purple)</option>
            <option value="Mil-Spec">Mil-Spec (Blue)</option>
            <option value="Industrial">Industrial (Light Blue)</option>
            <option value="Consumer">Consumer (White)</option>
          </select>
          <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort By */}
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            aria-label="Sort inventory"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-surface/90 border border-white/10 text-white text-sm focus:border-accent focus:outline-none appearance-none cursor-pointer"
          >
            <option value="newest">Recently Unboxed</option>
            <option value="value_desc">Price: High to Low</option>
            <option value="value_asc">Price: Low to High</option>
            <option value="rarity_desc">Highest Rarity</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
          <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Quick Reset Filters */}
        {(filterRarity !== 'ALL' || searchQuery !== '') && (
          <button
            onClick={() => {
              setFilterRarity('ALL');
              setSearchQuery('');
            }}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-sm font-medium border border-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Inventory Grid */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-24 bg-surface-dark/40 rounded-3xl border border-dashed border-white/15">
          <Package className="w-14 h-14 text-text-muted mx-auto mb-4 opacity-40" />
          <h3 className="text-xl font-bold text-white mb-1">
            {inventory.length === 0
              ? 'No items in your inventory'
              : 'No items match your filters'}
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto mb-6">
            {inventory.length === 0
              ? 'Start opening cases to unbox rare weapons, knives, and gloves.'
              : 'Try clearing your search query or changing the rarity filter.'}
          </p>
          {inventory.length === 0 ? (
            <Link
              href="/#cases"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-surface-dark font-bold text-sm hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Cases</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                setFilterRarity('ALL');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium text-xs hover:bg-white/20 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sortedItems.slice(0, visibleCount).map((item, idx) => {
            const rarityColor = getRarityColor(item.rarity);
            const instanceKey = item.instanceId || `${item.id}-${idx}`;
            const wear = getItemWear(item);

            return (
              <div
                key={instanceKey}
                className="bg-surface/90 rounded-2xl border flex flex-col justify-between p-3.5 hover:border-white/30 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] group relative overflow-hidden"
                style={{
                  borderColor: `${rarityColor}35`,
                  boxShadow: `0 4px 15px ${rarityColor}08`,
                }}
              >
                {/* Top Rarity Accent Strip */}
                <div
                  className="absolute top-0 inset-x-0 h-1"
                  style={{
                    backgroundColor: rarityColor,
                    boxShadow: `0 0 8px ${rarityColor}`,
                  }}
                />

                {/* Card Top: Weapon Type & Wear */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {item.weaponType}
                    </span>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: rarityColor }}
                    >
                      {item.rarity}
                    </span>
                  </div>

                  {/* Weapon Image */}
                  <div className="relative w-full h-28 flex items-center justify-center my-2 bg-surface-dark/70 rounded-xl overflow-hidden p-1 border border-white/5">
                    <ItemImage
                      src={item.image}
                      alt={item.name}
                      className="max-h-24 max-w-full object-contain group-hover:scale-110 transition-transform duration-300 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]"
                    />
                  </div>

                  {/* Skin Name & Valuation */}
                  <div className="mb-3">
                    <h4
                      className="text-xs font-bold text-white truncate"
                      title={item.name}
                    >
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-text-muted">
                        {wear}
                      </span>
                      <p className="text-sm font-black text-emerald-400 font-display">
                        {formatCurrency(item.demoValue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions: Sell & Delete */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/5">
                  <button
                    disabled={!isLoaded}
                    onClick={() => handleSellOne(item)}
                    title={`Sell for ${formatCurrency(item.demoValue)}`}
                    className="col-span-3 py-2 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Sell</span>
                  </button>

                  <button
                    disabled={!isLoaded}
                    onClick={() => {
                      if (confirm(`Remove ${item.name} without selling it?`))
                        void removeItem(item.instanceId!);
                    }}
                    title="Remove from inventory"
                    className="col-span-1 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-text-muted hover:text-red-400 border border-white/5 flex items-center justify-center transition-colors active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {visibleCount < sortedItems.length && (
        <div className="flex justify-center pt-4">
          <button
            className="rounded-2xl border border-white/20 bg-surface/80 hover:bg-white/10 px-8 py-3.5 font-bold text-xs text-white transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
            onClick={() => setVisibleCount((count) => count + 48)}
          >
            <ChevronDown className="w-4 h-4 text-accent" />
            <span>Load more ({sortedItems.length - visibleCount} remaining)</span>
          </button>
        </div>
      )}
    </div>
  );
}
