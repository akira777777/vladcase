'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import ItemImage from '@/components/ui/ItemImage';
import { formatCurrency, getRarityColor } from '@/lib/utils';
import { RARITIES } from '@/lib/stats';
import { ArrowLeft, History, Search } from 'lucide-react';

export default function HistoryPage() {
  const { history, isLoaded } = useApp();
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('ALL');
  const entries = useMemo(() => history.filter((entry) => {
    const matchesRarity = rarity === 'ALL' || entry.item.rarity === rarity;
    const text = `${entry.item.name} ${entry.caseName}`.toLowerCase();
    return matchesRarity && text.includes(query.trim().toLowerCase());
  }), [history, query, rarity]);
  if (!isLoaded) return <div className="mx-auto max-w-7xl px-4 py-16 text-text-muted">Loading history…</div>;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">Local activity</p><h1 className="text-4xl font-black font-display text-white sm:text-6xl">Opening History</h1><p className="mt-2 text-sm text-text-secondary">The last {history.length} simulated openings saved in this browser.</p></div><Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white"><ArrowLeft className="h-4 w-4" />Back to cases</Link></div>
      <div className="grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><span className="sr-only">Search history</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search item or case" className="w-full rounded-xl border border-white/10 bg-surface py-3 pl-10 pr-4 text-sm text-white placeholder:text-text-muted" /></label><select aria-label="Filter history rarity" value={rarity} onChange={(event) => setRarity(event.target.value)} className="rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white"><option value="ALL">All rarities</option>{RARITIES.map((entry) => <option key={entry}>{entry}</option>)}</select></div>
      {entries.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 py-24 text-center"><History className="mx-auto h-12 w-12 text-text-muted" /><p className="mt-4 font-semibold text-white">No openings match this view</p><p className="mt-1 text-sm text-text-secondary">Open a case to create your first history entry.</p></div> : <div className="space-y-3">{entries.map((entry) => <article key={entry.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface/80 p-4 sm:flex-row sm:items-center"><ItemImage src={entry.item.image} alt={entry.item.name} className="h-16 w-full rounded-xl object-contain sm:w-24" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-white">{entry.item.name}</h2><span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: getRarityColor(entry.item.rarity) }}>{entry.item.rarity}</span></div><p className="mt-1 text-xs text-text-muted">{entry.caseName} · {new Date(entry.timestamp).toLocaleString()}</p></div><div className="flex items-center justify-between gap-6 sm:justify-end"><div className="text-right"><p className="text-[10px] uppercase tracking-wider text-text-muted">Drop value</p><p className="font-black text-emerald-400">{formatCurrency(entry.itemValueCents / 100)}</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-wider text-text-muted">Case cost</p><p className="font-bold text-text-secondary">{formatCurrency(entry.casePriceCents / 100)}</p></div></div></article>)}</div>}
    </div>
  );
}
