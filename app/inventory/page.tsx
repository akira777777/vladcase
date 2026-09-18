import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Item } from '@/types';

export default function InventoryPage() {
  const { inventory, removeItem } = useInventory();
  const [filter, setFilter] = useState<'all' | 'common' | 'uncommon' | 'rare' | 'mythic' | 'legendary' | 'exotic'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rarity'>('name');

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true;
    return item.rarity.toLowerCase() === filter;
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      const rarityOrder: Record<string, number> = {
        common: 1,
        uncommon: 2,
        rare: 3,
        mythic: 4,
        legendary: 5,
        exotic: 6,
      };
      return (rarityOrder[a.rarity.toLowerCase()] || 0) - (rarityOrder[b.rarity.toLowerCase()] || 0);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-display font-bold metallic-text">Your Inventory</h1>
          <p className="text-secondary mt-2">Manage your collection of rare items</p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-secondary uppercase font-bold">Filter by Rarity</p>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-white/5 border border-white/10 p-2 rounded-lg text-white focus:border-accent outline-none"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="mythic">Mythic</option>
              <option value="legendary">Legendary</option>
              <option value="exotic">Exotic</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-secondary uppercase font-bold">Sort By</p>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 p-2 rounded-lg text-white focus:border-accent outline-none"
            >
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
        </div>
      </div>

      {sortedInventory.length === 0 ? (
        <div className="text-center py-40 bg-white/5 rounded-3xl border border-dashed border-white/20">
          <p className="text-secondary text-xl">Your inventory is empty.</p>
          <p className="text-secondary text-sm mt-2">Open some cases to start your collection!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedInventory.map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`}
              className="glass-card p-4 rounded-2xl border border-white/5 hover:border-white/20 group transition-all"
            >
              <div className="relative overflow-hidden rounded-xl mb-4">
                <img src={item.image} alt={item.name} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${item.rarity === 'legendary' ? 'text-yellow-400' : 'text-white'}`}>
                    {item.rarity}
                  </span>
                </div>
              </div>
              <h4 className="font-bold text-white truncate mb-4">{item.name}</h4>
              <button 
                onClick={() => removeItem(item.id)}
                className="w-full py-2 text-xs text-secondary hover:text-red-500 transition-colors"
              >
                Remove Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
