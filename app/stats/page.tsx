'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatCurrency, getRarityColor } from '@/lib/utils';
import { RARITIES } from '@/lib/stats';
import { BarChart3, ArrowLeft, ArrowRight, Trophy, TrendingUp, Sparkles, Percent, Target } from 'lucide-react';

export default function StatsPage() {
  const { stats, history, inventory, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-20 text-center text-text-muted">
        Loading performance lab…
      </div>
    );
  }

  const roi = stats.totalSpentCents > 0
    ? Math.round((stats.totalDropValueCents / stats.totalSpentCents - 1) * 100)
    : 0;

  const bestDrop = stats.bestDropInstanceId
    ? history.find((entry) => entry.item.instanceId === stats.bestDropInstanceId)?.item
    : null;

  const upgradeTotal = stats.upgradeWins + stats.upgradeLosses;
  const upgradeRate = upgradeTotal > 0 ? Math.round((stats.upgradeWins / upgradeTotal) * 100) : null;

  const cards = [
    { label: 'CASES OPENED', value: stats.totalOpens.toLocaleString('en-US'), icon: Target, color: 'text-brand-300', glow: 'rgba(139,92,246,0.3)' },
    { label: 'TOTAL SPENT', value: formatCurrency(stats.totalSpentCents / 100), icon: BarChart3, color: 'text-white', glow: 'rgba(255,255,255,0.2)' },
    { label: 'DROP VALUE', value: formatCurrency(stats.totalDropValueCents / 100), icon: Trophy, color: 'text-gold', glow: 'rgba(245,182,66,0.3)' },
    { label: 'REALIZED (SOLD)', value: formatCurrency(stats.realizedCents / 100), icon: TrendingUp, color: 'text-emerald-400', glow: 'rgba(16,185,129,0.3)' },
    { label: 'SIMULATED ROI', value: `${roi >= 0 ? '+' : ''}${roi}%`, icon: Percent, color: roi >= 0 ? 'text-emerald-400' : 'text-red-400', glow: roi >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cases
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gold/20 text-gold-light border border-gold/40">
              REWARDS &amp; METRICS
            </span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Platform Analytics
            </span>
          </div>
          <h1 className="mt-1 text-3xl sm:text-5xl font-display font-black text-white tracking-tighter uppercase leading-none">
            Performance <span className="text-gold-light glow-gold">Lab</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-2xl">
            Live telemetry of your simulated luck, drop frequencies, realized balance, and upgrader performance over time.
          </p>
        </div>

        <Link
          href="/upgrade"
          className="btn-primary inline-flex items-center gap-2 text-xs uppercase tracking-wider font-black"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Test Upgrader
        </Link>
      </div>

      {/* Top 5 KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3" aria-label="Key metrics">
        {cards.map((c) => (
          <div
            key={c.label}
            className="relative rounded-xl border border-white/[0.06] bg-surface-dark p-4 overflow-hidden transition-all hover:border-white/20"
          >
            <div
              className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-15 blur-xl pointer-events-none"
              style={{ backgroundColor: c.glow }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{c.label}</span>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className={`mt-3 text-2xl font-display font-black price-display ${c.color}`}>
              {c.value}
            </p>
          </div>
        ))}
      </section>

      {/* Grid: Rarity Breakdown & Luck Highlights */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rarity distribution */}
        <div className="panel p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <BarChart3 className="w-4 h-4 text-brand-300" />
            <h2 className="text-sm font-display font-black text-white uppercase tracking-wider">
              Rarity Drop Distribution
            </h2>
          </div>

          <div className="space-y-3.5">
            {RARITIES.map((rarity) => {
              const count = stats.rarityCounts[rarity] ?? 0;
              const percent = stats.totalOpens ? Math.round((count / stats.totalOpens) * 100) : 0;
              const color = getRarityColor(rarity);

              return (
                <div key={rarity} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5" style={{ color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      {rarity}
                    </span>
                    <span className="text-text-muted font-mono font-bold text-[11px]">
                      {count} items ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/50 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Luck highlights */}
        <div className="panel p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Trophy className="w-4 h-4 text-gold-light" />
            <h2 className="text-sm font-display font-black text-white uppercase tracking-wider">
              Luck Highlights &amp; Milestones
            </h2>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gold/[0.06] border border-gold/30">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-light">
                Highest Single Drop
              </span>
              <p className="mt-1 text-base font-bold text-white">
                {bestDrop?.name ?? 'No rare drops yet'}
              </p>
              {bestDrop && (
                <p className="text-sm font-display font-black text-emerald-400 mt-0.5 price-display">
                  {formatCurrency(bestDrop.demoValue)}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-surface-dark border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Rare Streak (Classified+)
                </span>
                <p className="text-lg font-display font-black text-white mt-0.5">
                  Current: {stats.currentRareStreak} · Record: {stats.bestRareStreak}
                </p>
              </div>
              <Sparkles className="w-6 h-6 text-magenta-400 opacity-60" />
            </div>

            <div className="p-4 rounded-xl bg-surface-dark border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Total Inventory Net Worth
                </span>
                <p className="text-lg font-display font-black text-emerald-400 mt-0.5 price-display">
                  {formatCurrency(inventory.reduce((sum, item) => sum + item.demoValue, 0))}
                </p>
              </div>
              <span className="text-xs text-text-muted font-bold">{inventory.length} items</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrader Performance */}
      <section className="panel p-6 space-y-4" aria-label="Upgrader analytics">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-display font-black text-white uppercase tracking-wider">
              Upgrader Performance
            </h2>
          </div>
          <Link
            href="/upgrade"
            className="text-xs font-bold text-brand-300 hover:text-white transition-colors flex items-center gap-1"
          >
            Open Upgrader <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-surface-dark border border-white/[0.06]">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Wins</span>
            <p className="text-xl font-display font-black text-emerald-400 mt-1">{stats.upgradeWins.toLocaleString('en-US')}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-dark border border-white/[0.06]">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Losses</span>
            <p className="text-xl font-display font-black text-red-400 mt-1">{stats.upgradeLosses.toLocaleString('en-US')}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-dark border border-white/[0.06]">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Win Rate</span>
            <p className="text-xl font-display font-black text-white mt-1">
              {upgradeRate === null ? '—' : `${upgradeRate}%`}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface-dark border border-white/[0.06]">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Total Wagered</span>
            <p className="text-xl font-display font-black text-white mt-1 price-display">
              {formatCurrency(stats.upgradeWageredCents / 100)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
