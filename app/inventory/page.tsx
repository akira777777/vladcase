'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { usePreferences } from '@/hooks/usePreferences';
import { Item, Rarity } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { playCashSound } from '@/lib/sound';
import SkinCard from '@/components/ui/SkinCard';
import { Package, Search, ChevronDown, Heart, ArrowUpDown, Trophy, Layers } from 'lucide-react';
import { RARITIES } from '@/lib/stats';

const SORT_LABELS: Record<string, string> = {
  newest: 'Newest', value_desc: 'Value High → Low', value_asc: 'Value Low → High', rarity_desc: 'Rarity', name: 'Name (A-Z)',
};
const RANK: Record<Rarity, number> = { 'Special Item': 7, Covert: 6, Classified: 5, Restricted: 4, 'Mil-Spec': 3, Industrial: 2, Consumer: 1 };

export default function InventoryPage() {
  const { inventory, favoriteIds, toggleFavorite, sellItem } = useInventory();
  const { preferences } = usePreferences();
  const [visibleCount, setVisibleCount] = useState(48);
  const [filterRarity, setFilterRarity] = useState<string>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'value_desc' | 'value_asc' | 'rarity_desc' | 'name' | 'newest'>('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalValuation = useMemo(() => inventory.reduce((acc, item) => acc + (item.demoValue || 0), 0), [inventory]);

  useEffect(() => { setVisibleCount(48); }, [filterRarity, searchQuery, sortBy, favoritesOnly]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return inventory.filter((item) => {
      if (favoritesOnly && !favoriteIds.includes(item.id)) return false;
      if (filterRarity !== 'ALL' && item.rarity !== filterRarity) return false;
      if (query !== '') {
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesWeapon = item.weaponType.toLowerCase().includes(query);
        return matchesName || matchesWeapon;
      }
      return true;
    });
  }, [inventory, filterRarity, searchQuery, favoritesOnly, favoriteIds]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'value_desc': return (b.demoValue || 0) - (a.demoValue || 0);
        case 'value_asc': return (a.demoValue || 0) - (b.demoValue || 0);
        case 'rarity_desc': return RANK[b.rarity] - RANK[a.rarity];
        case 'name': return a.name.localeCompare(b.name);
        case 'newest':
        default: return (b.unboxedAt || 0) - (a.unboxedAt || 0);
      }
    });
  }, [filteredItems, sortBy]);

  const toggleSelect = (item: Item) => {
    const id = item.instanceId || '';
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSellOne = (item: Item) => {
    if (preferences.confirmSales && !window.confirm(`Sell ${item.name} for ${formatCurrency(item.demoValue)}?`)) return;
    playCashSound();
    void sellItem(item.instanceId!);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-brand-300">Local Collection</p>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tighter uppercase leading-none">Inventory</h1>
          <p className="mt-2 text-xs text-text-secondary max-w-2xl">Every weapon you unbox is stored locally in this browser. Sell, favorite, or build your collection.</p>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white">← Back to cases</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="ITEMS" value={inventory.length.toLocaleString()} icon={Package} color="text-brand-300" glow="rgba(139, 92, 246, 0.45)" />
        <StatTile label="NET WORTH" value={formatCurrency(totalValuation)} icon={Trophy} color="text-gold-light" glow="rgba(245, 182, 66, 0.45)" />
        <StatTile label="FAVORITES" value={favoriteIds.length.toLocaleString()} icon={Heart} color="text-magenta-400" glow="rgba(236, 72, 153, 0.45)" />
        <StatTile label="SELECTED" value={selectedIds.size.toLocaleString()} icon={Layers} color="text-emerald-400" glow="rgba(16, 185, 129, 0.45)" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 panel-raised p-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items or weapons" className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-surface-dark border border-white/[0.06] text-white placeholder:text-text-muted focus:outline-none focus:border-brand/50" />
          </div>
          <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} aria-label="Filter by rarity" className="pl-3 pr-7 py-2 rounded-lg text-xs bg-surface-dark border border-white/[0.06] text-white appearance-none focus:outline-none focus:border-brand/50 cursor-pointer">
            <option value="ALL">All rarities</option>
            {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button type="button" onClick={() => setFavoritesOnly((f) => !f)} aria-pressed={favoritesOnly} className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${favoritesOnly ? 'bg-pink-500/15 text-pink-300 border-pink-500/40' : 'bg-surface-dark border-white/[0.06] text-text-secondary hover:text-pink-300'}`}>
            <Heart className="w-3.5 h-3.5" fill={favoritesOnly ? 'currentColor' : 'none'} />Favorites
          </button>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} aria-label="Sort items" className="px-3 py-2 rounded-lg text-xs bg-surface-dark border border-white/[0.06] text-white appearance-none focus:outline-none focus:border-brand/50 cursor-pointer">
            {Object.entries(SORT_LABELS).map(([k, label]) => <option key={k} value={k}>Sort: {label}</option>)}
          </select>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="text-center py-20 panel">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary font-bold">No items match this view</p>
          <p className="text-xs text-text-muted mt-1">Open a case to start collecting weapons.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sortedItems.slice(0, visibleCount).map((item) => (
            <SkinCard
              key={item.instanceId || item.id}
              item={item}
              selectable
              selected={selectedIds.has(item.instanceId || '')}
              onClick={toggleSelect}
              onSell={handleSellOne}
              onFavorite={(it) => void toggleFavorite(it.id)}
              favorite={favoriteIds.includes(item.id)}
              showFavorite
              showSell
              showWear
            />
          ))}
        </div>
      )}

      {visibleCount < sortedItems.length && (
        <div className="flex justify-center pt-2">
          <button type="button" onClick={() => setVisibleCount((count) => count + 48)} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-surface-dark border border-white/[0.06] hover:border-white/20 hover:bg-surface-raised text-white transition-all">
            <ChevronDown className="w-4 h-4 text-brand-300" />
            <span>Load more ({sortedItems.length - visibleCount} remaining)</span>
          </button>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, icon: Icon, color, glow }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string; glow: string }) {
  return (
    <div className="relative rounded-lg border border-white/[0.06] bg-gradient-to-b from-surface-raised to-surface-dark p-4 overflow-hidden">
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-15 blur-2xl" style={{ backgroundColor: glow }} />
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`mt-3 text-xl font-display font-black ${color} price-display`}>{value}</p>
    </div>
  );
}