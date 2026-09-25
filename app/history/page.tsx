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

  const entries = useMemo(() => {
    return history.filter((entry) => {
      const matchesRarity = rarity === 'ALL' || entry.item.rarity === rarity;
      const text = `${entry.item.name} ${entry.caseName}`.toLowerCase();
      return matchesRarity && text.includes(query.trim().toLowerCase());
    });
  }, [history, query, rarity]);

  const totalDroppedValue = useMemo(() => {
    return history.reduce((sum, entry) => sum + entry.itemValueCents / 100, 0);
  }, [history]);

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-20 text-center text-text-muted">
        Loading activity...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand/20 text-brand-300 border border-brand/40">
              AUDIT LOG
            </span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Atomic Transactions
            </span>
          </div>
          <h1 className="mt-1 text-3xl sm:text-5xl font-display font-black text-white tracking-tighter uppercase leading-none">
            Drop <span className="text-brand-300 glow-brand">History</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-2xl">
            Complete transaction ledger of your last {history.length} simulated unboxings. Every record is stored with verified odds in your local browser state.
          </p>
        </div>

        <div className="flex items-center gap-3 panel p-3">
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Total Unboxed</span>
            <p className="text-sm font-display font-black text-emerald-400 price-display">
              {formatCurrency(totalDroppedValue)}
            </p>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Total Opens</span>
            <p className="text-sm font-display font-black text-white">{history.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 panel-raised p-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skin name or case..."
            aria-label="Search history"
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-surface-dark border border-white/[0.06] text-white placeholder:text-text-muted focus:outline-none focus:border-brand/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            aria-label="Filter by rarity"
            className="px-3 py-2 rounded-lg text-xs bg-surface-dark border border-white/[0.06] text-white appearance-none focus:outline-none focus:border-brand/50 cursor-pointer w-full sm:w-auto"
          >
            <option value="ALL">All Rarities</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-20 panel">
          <History className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <p className="text-white font-bold text-sm">No drop records found</p>
          <p className="text-xs text-text-muted mt-1">Open a case in the catalog to generate verified history.</p>
          <Link href="/" className="btn-primary inline-flex text-xs uppercase tracking-wider font-black mt-4">
            Open Cases
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry) => {
            const color = getRarityColor(entry.item.rarity);
            const isProfit = entry.itemValueCents >= entry.casePriceCents;
            return (
              <article
                key={entry.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-white/[0.06] bg-surface-dark hover:border-white/20 transition-all overflow-hidden"
                style={{ boxShadow: `inset 3px 0 0 ${color}` }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="relative w-14 h-14 rounded-lg flex items-center justify-center bg-black/40 border border-white/5 flex-shrink-0"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${color}25 0%, rgba(0,0,0,0.5) 70%)` }}
                  >
                    <ItemImage
                      src={entry.item.image}
                      alt={entry.item.name}
                      width={52}
                      height={42}
                      className="max-h-11 max-w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
                      >
                        {entry.item.rarity}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="mt-0.5 text-xs sm:text-sm font-bold text-white truncate" title={entry.item.name}>
                      {entry.item.name}
                    </h3>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">
                      Case: <span className="text-text-secondary">{entry.caseName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Case Cost</span>
                    <p className="text-xs font-mono font-bold text-text-secondary">
                      {formatCurrency(entry.casePriceCents / 100)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Drop Value</span>
                    <p
                      className="text-sm font-mono font-black price-display"
                      style={{ color: isProfit ? '#10B981' : '#F5B642' }}
                    >
                      {formatCurrency(entry.itemValueCents / 100)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
