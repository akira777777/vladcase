'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CASES } from '@/data/mockData';
import { Case } from '@/types';
import CaseCard from '@/components/ui/CaseCard';
import CategoryTabs, { type SortMode } from '@/components/ui/CategoryTabs';
import LiveDropFeed from '@/components/ui/LiveDropFeed';
import EventHero from '@/components/ui/EventHero';
import GameModeCard from '@/components/ui/GameModeCard';
import BigWinsFeed from '@/components/ui/BigWinsFeed';
import GameStats from '@/components/ui/GameStats';
import { Package, TrendingUp, Flame, Layers, Sparkles, ArrowRight, Swords } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const CATEGORIES = [
  { id: 'ALL', label: 'All' },
  { id: 'NEW', label: 'New' },
  { id: 'POPULAR', label: 'Popular' },
  { id: 'BUDGET', label: 'Budget' },
  { id: 'PREMIUM', label: 'Premium' },
  { id: 'KNIFE', label: 'Knives' },
  { id: 'RIFLE', label: 'Rifles' },
  { id: 'AWP', label: 'AWP' },
  { id: 'PISTOL', label: 'Pistols' },
  { id: 'SPECIAL', label: 'Special' },
];

export default function HomeContent() {
  const { history } = useApp();
  const [active, setActive] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('popular');

  const filteredCases = useMemo(() => {
    let list: Case[] = CASES;
    if (active !== 'ALL') {
      const cat = active;
      const isWeaponFilter = cat === 'RIFLE' || cat === 'AWP' || cat === 'PISTOL' || cat === 'SPECIAL';
      if (isWeaponFilter) {
        list = CASES.filter((c) => c.items.some((i) => {
          const w = i.weaponType.toLowerCase();
          if (cat === 'AWP') return w.includes('awp');
          if (cat === 'RIFLE') return w.includes('ak-') || w.includes('m4') || w.includes('aug') || w.includes('sg ');
          if (cat === 'PISTOL') return w.includes('usp') || w.includes('glock') || w.includes('p250') || w.includes('deagle') || w === 'pistol';
          if (cat === 'SPECIAL') return c.category === 'FANSERVICE' || i.rarity === 'Special Item';
          return false;
        }));
      } else {
        list = CASES.filter((c) => c.category === cat);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'newest': return b.id.localeCompare(a.id);
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'popular':
        default: {
          const score = (c: Case) => c.items.reduce((acc, i) => acc + (i.rarity === 'Special Item' ? 1000 : i.rarity === 'Covert' ? 200 : i.rarity === 'Classified' ? 50 : 0), 0);
          return score(b) - score(a);
        }
      }
    });
    return list;
  }, [active, search, sort]);

  const popularCases = useMemo(() => {
    return CASES.filter((c) => c.category === 'PREMIUM' || c.category === 'KNIFE' || c.category === 'FANSERVICE').slice(0, 4);
  }, []);

  const recentDrops = useMemo(() => history.slice(0, 8).map((h) => ({
    id: h.id,
    item: h.item,
    caseName: h.caseName,
    user: 'You',
    timestamp: h.timestamp,
  })), [history]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 sm:space-y-10">
      <LiveDropFeed drops={recentDrops.length > 0 ? recentDrops : undefined} />
      <EventHero />

      <section aria-label="Game modes">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <Swords className="w-4 h-4 text-brand-300" />
            Game Modes
          </h2>
          <Link href="/inventory" className="text-[11px] font-bold uppercase tracking-wider text-text-muted hover:text-white transition-colors flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GameModeCard href="#cases" title="Case Opening" description="Open cases with weighted odds" icon={Package} accent="brand" count="7 active cases" />
          <GameModeCard href="/battles" title="Battles" description="PvP case showdowns & 1v1 duels" icon={Swords} accent="magenta" count="Live AI Arena" />
          <GameModeCard href="/upgrade" title="Upgrader" description="Trade up to higher value" icon={TrendingUp} accent="gold" count="House edge 5%" />
          <GameModeCard href="/contracts" title="Contracts" description="Trade 10 items for 1 higher" icon={Flame} accent="success" count="Trade-Up 10/10" />
        </div>
      </section>

      <section id="cases" aria-label="Case catalog">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tighter leading-none">
              Browse <span className="text-brand-300 glow-brand">Cases</span>
            </h2>
            <p className="mt-2 text-xs text-text-secondary max-w-xl">
              Open any case for a chance at knives, covert skins, and rare collectibles. All odds are transparent and committed atomically before reveal.
            </p>
          </div>
        </div>
        <CategoryTabs categories={CATEGORIES} active={active} onChange={setActive} searchQuery={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} />

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredCases.length === 0 ? (
            <div className="col-span-full text-center py-16 text-text-muted text-sm">No cases match your filters.</div>
          ) : (
            filteredCases.map((c) => <CaseCard key={c.id} caseData={c} />)
          )}
        </div>
      </section>

      {popularCases.length > 0 && (
        <section aria-label="Trending cases">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-light" />
              Trending
            </h2>
            <Link href="/" className="text-[11px] font-bold uppercase tracking-wider text-text-muted hover:text-white transition-colors flex items-center gap-1">
              See more <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularCases.map((c) => <CaseCard key={c.id} caseData={c} />)}
          </div>
        </section>
      )}

      <BigWinsFeed />

      <section aria-label="Platform stats" className="pt-2">
        <GameStats />
      </section>
    </div>
  );
}