'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatCurrency, getRarityColor } from '@/lib/utils';
import { RARITIES } from '@/lib/stats';
import { BarChart3, ArrowLeft, ArrowRight, Trophy, TrendingUp } from 'lucide-react';

export default function StatsPage() {
  const { stats, history, inventory, isLoaded } = useApp();
  if (!isLoaded) return <div className="mx-auto max-w-7xl px-4 py-16 text-text-muted">Loading stats…</div>;
  const roi = stats.totalSpentCents > 0 ? Math.round((stats.totalDropValueCents / stats.totalSpentCents - 1) * 100) : 0;
  const bestDrop = stats.bestDropInstanceId ? history.find((entry) => entry.item.instanceId === stats.bestDropInstanceId)?.item : null;
  const upgradeTotal = stats.upgradeWins + stats.upgradeLosses;
  const upgradeRate = upgradeTotal > 0 ? Math.round((stats.upgradeWins / upgradeTotal) * 100) : null;
  const cards = [
    ['Opens', stats.totalOpens.toLocaleString()],
    ['Spent', formatCurrency(stats.totalSpentCents / 100)],
    ['Drop value', formatCurrency(stats.totalDropValueCents / 100)],
    ['Realized', formatCurrency(stats.realizedCents / 100)],
    ['ROI', `${roi >= 0 ? '+' : ''}${roi}%`],
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Performance lab</p><h1 className="text-4xl sm:text-6xl font-black font-display text-white">Statistics</h1><p className="mt-2 text-sm text-text-secondary">Your local opens, returns, and simulated luck over time.</p></div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white"><ArrowLeft className="h-4 w-4" />Back to cases</Link>
      </div>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">{cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-surface/80 p-4"><p className="text-[10px] uppercase tracking-widest text-text-muted">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p></div>)}</section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-surface/80 p-6"><div className="mb-6 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-accent" /><h2 className="font-bold text-white">Rarity distribution</h2></div><div className="space-y-4">{RARITIES.map((rarity) => { const count = stats.rarityCounts[rarity] ?? 0; const percent = stats.totalOpens ? Math.round((count / stats.totalOpens) * 100) : 0; return <div key={rarity}><div className="mb-1 flex justify-between text-xs"><span style={{ color: getRarityColor(rarity) }}>{rarity}</span><span className="text-text-muted">{count} · {percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: getRarityColor(rarity) }} /></div></div>; })}</div></div>
        <div className="rounded-3xl border border-white/10 bg-surface/80 p-6"><div className="mb-6 flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-300" /><h2 className="font-bold text-white">Luck highlights</h2></div><div className="space-y-4"><div className="rounded-2xl bg-amber-500/10 p-4"><p className="text-xs text-amber-200">Best drop</p><p className="mt-1 font-bold text-white">{bestDrop?.name ?? 'No drops yet'}</p>{bestDrop && <p className="mt-1 text-sm font-black text-emerald-400">{formatCurrency(bestDrop.demoValue)}</p>}</div><div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-text-muted">Rare streak</p><p className="mt-1 text-xl font-black text-white">Current {stats.currentRareStreak} · Best {stats.bestRareStreak}</p></div><div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-text-muted">Inventory value</p><p className="mt-1 text-xl font-black text-emerald-400">{formatCurrency(inventory.reduce((sum, item) => sum + item.demoValue, 0))}</p></div></div></div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h2 className="font-bold text-white">Upgrader performance</h2>
          </div>
          <Link href="/upgrade" className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-accent transition-colors">
            Open Upgrader <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-4"><p className="text-[10px] uppercase tracking-widest text-text-muted">Wins</p><p className="mt-2 text-2xl font-black text-emerald-400">{stats.upgradeWins}</p></div>
          <div className="rounded-2xl bg-white/5 p-4"><p className="text-[10px] uppercase tracking-widest text-text-muted">Losses</p><p className="mt-2 text-2xl font-black text-red-400">{stats.upgradeLosses}</p></div>
          <div className="rounded-2xl bg-white/5 p-4"><p className="text-[10px] uppercase tracking-widest text-text-muted">Win rate</p><p className="mt-2 text-2xl font-black text-white">{upgradeRate === null ? '—' : `${upgradeRate}%`}</p></div>
          <div className="rounded-2xl bg-white/5 p-4"><p className="text-[10px] uppercase tracking-widest text-text-muted">Wagered</p><p className="mt-2 text-2xl font-black text-white">{formatCurrency(stats.upgradeWageredCents / 100)}</p></div>
        </div>
        {upgradeTotal === 0 && (
          <p className="mt-4 text-xs text-text-muted">
            No upgrades yet — exchange an inventory skin on the Upgrader page and your results will appear here.
          </p>
        )}
      </section>
    </div>
  );
}
