'use client';

import ItemImage from '@/components/ui/ItemImage';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { Item, Rarity } from '@/types';
import { formatCurrency, getRarityColor } from '@/lib/utils';
import {
  Package,
  Trash2,
  DollarSign,
  Search,
  ArrowUpDown,
  Filter,
  Sparkles,
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
    const id = item.instanceId || item.id;
    sellItem(id);
  };

  const handleSellAll = () => {
    if (inventory.length === 0) return;
    if (
      confirm(
        `Sell all ${inventory.length} items in your inventory for ${formatCurrency(totalValuation)}?`
      )
    ) {
      sellAll();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Inventory Valuation Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-accent uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Item Vault</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight">
            Inventory
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage, inspect, and liquidate your collection of weapon finishes.
          </p>
        </div>

        {/* Valuation & Sell All */}
        <div className="flex flex-wrap items-center gap-4 bg-surface p-4 rounded-2xl border border-white/10">
          <div className="pr-4 border-r border-white/10">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Total Net Worth
            </p>
            <p className="text-2xl font-black text-emerald-400 font-display">
              {isLoaded ? formatCurrency(totalValuation) : '$0.00'}
            </p>
            <p className="text-[10px] text-text-secondary">
              {inventory.length} Total{' '}
              {inventory.length === 1 ? 'Item' : 'Items'}
            </p>
          </div>

          <button
            onClick={handleSellAll}
            disabled={!isLoaded || inventory.length === 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              inventory.length > 0
                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:scale-105 active:scale-95'
                : 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Sell All
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search inventory"
            placeholder="Search by weapon or skin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white placeholder-text-muted text-sm focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Rarity Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            aria-label="Filter rarity"
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:border-accent focus:outline-none appearance-none cursor-pointer"
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
        </div>

        {/* Sort By */}
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            aria-label="Sort inventory"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white text-sm focus:border-accent focus:outline-none appearance-none cursor-pointer"
          >
            <option value="newest">Recently Unboxed</option>
            <option value="value_desc">Price: High to Low</option>
            <option value="value_asc">Price: Low to High</option>
            <option value="rarity_desc">Highest Rarity</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* Quick Reset Filters */}
        {(filterRarity !== 'ALL' || searchQuery !== '') && (
          <button
            onClick={() => {
              setFilterRarity('ALL');
              setSearchQuery('');
            }}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-sm font-medium border border-white/10 transition-colors"
          >
            Clear Filters
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-surface-dark font-bold text-sm hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              <Sparkles className="w-4 h-4" />
              Explore Cases
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

            return (
              <div
                key={instanceKey}
                className="bg-surface rounded-2xl border flex flex-col justify-between p-3.5 hover:border-white/30 transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] group relative overflow-hidden"
                style={{ borderColor: `${rarityColor}35` }}
              >
                {/* Top Rarity Accent Strip */}
                <div
                  className="absolute top-0 inset-x-0 h-1"
                  style={{ backgroundColor: rarityColor }}
                />

                {/* Card Top: Weapon Type & Wear */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase">
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
                  <div className="relative w-full h-28 flex items-center justify-center my-2 bg-surface-dark/60 rounded-xl overflow-hidden p-1">
                    <ItemImage
                      src={item.image}
                      alt={item.name}
                      className="max-h-24 max-w-full object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
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
                    <p className="text-sm font-black text-emerald-400 font-display mt-0.5">
                      {formatCurrency(item.demoValue)}
                    </p>
                  </div>
                </div>

                {/* Actions: Sell & Delete */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/5">
                  <button
                    disabled={!isLoaded}
                    onClick={() => handleSellOne(item)}
                    title={`Sell for ${formatCurrency(item.demoValue)}`}
                    className="col-span-3 py-2 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
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
                    className="col-span-1 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-text-muted hover:text-red-400 border border-white/5 flex items-center justify-center transition-colors"
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
        <button
          className="rounded-xl border border-white/20 px-6 py-3"
          onClick={() => setVisibleCount((count) => count + 48)}
        >
          Load more ({sortedItems.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
