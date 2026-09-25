'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Eye, Package, ShieldCheck, Percent } from 'lucide-react';
import { CASES } from '@/data/mockData';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { usePreferences } from '@/hooks/usePreferences';
import type { Item } from '@/types';
import ItemImage from '@/components/ui/ItemImage';
import PriceTag from '@/components/ui/PriceTag';
import RarityBadge from '@/components/ui/RarityBadge';
import SkinCard from '@/components/ui/SkinCard';
import Roulette from './roulette/Roulette';
import WinScreen from './WinScreen';
import { formatCurrency, getRarityColor, getRarityTier } from '@/lib/utils';
import { playClickSound } from '@/lib/sound';

type Stage = 'idle' | 'spinning' | 'reveal' | 'batch';
export default function CaseOpenPage({ caseId }: { caseId: string }) {
  const caseItem = CASES.find((c) => c.id === caseId);
  const { balance, openCase, openMany, finishOpening, isLoaded, activeOpening } = useEconomy();
  const { sellItem } = useInventory();
  const { preferences } = usePreferences();
  const [stage, setStage] = useState<Stage>('idle');
  const [winningItem, setWinningItem] = useState<Item | null>(null);
  const [batchItems, setBatchItems] = useState<Item[]>([]);
  const [showBatch, setShowBatch] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const ownsOpening = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (ownsOpening.current) finishOpening();
    };
  }, [finishOpening]);

  const sortedContents = useMemo(() => {
    if (!caseItem) return [];
    return [...caseItem.items].sort((a, b) => b.demoValue - a.demoValue);
  }, [caseItem]);

  const topItem = sortedContents[0];
  const topColor = topItem ? getRarityColor(topItem.rarity) : '#8B5CF6';
  const totalChance = useMemo(
    () => (caseItem ? caseItem.items.reduce((s, i) => s + i.dropChance, 0) : 0),
    [caseItem]
  );

  const closeAll = useCallback(() => {
    setShowWin(false);
    setShowBatch(false);
    setBatchItems([]);
    setIsSpinning(false);
    setStage('idle');
    setWinningItem(null);
    setActionError(null);
    ownsOpening.current = false;
    finishOpening();
  }, [finishOpening]);

  const startSingle = useCallback(
    async (quick: boolean) => {
      if (!caseItem || ownsOpening.current || !isLoaded) return;
      setActionError(null);
      playClickSound();
      ownsOpening.current = true;
      const result = await openCase(caseItem);
      if (!mounted.current) {
        ownsOpening.current = false;
        if (result.ok) finishOpening();
        return;
      }
      if (!result.ok || !result.item) {
        ownsOpening.current = false;
        if (!result.ok) setActionError(result.message);
        return;
      }
      setWinningItem(result.item);
      const instant =
        quick ||
        preferences.revealMode === 'instant' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (instant) {
        setStage('reveal');
        setShowWin(true);
      } else {
        setStage('spinning');
        setIsSpinning(true);
        setSpinKey((k) => k + 1);
      }
    },
    [caseItem, isLoaded, openCase, finishOpening, preferences.revealMode]
  );

  const startBatch = useCallback(
    async (count: 3 | 5) => {
      if (!caseItem || ownsOpening.current || !isLoaded) return;
      setActionError(null);
      playClickSound();
      ownsOpening.current = true;
      const result = await openMany(caseItem, count);
      ownsOpening.current = false;
      if (!mounted.current) return;
      if (result.ok && result.items) {
        setBatchItems(result.items);
        setShowBatch(true);
        setStage('batch');
      } else {
        if (!result.ok) setActionError(result.message);
      }
    },
    [caseItem, isLoaded, openMany]
  );

  const handleRouletteComplete = useCallback(() => {
    setIsSpinning(false);
    setStage('reveal');
    setShowWin(true);
  }, []);

  const handleSellFromWin = useCallback(
    async (item: Item) => {
      const result = await sellItem(item.instanceId!);
      if (result.ok) closeAll();
      return result;
    },
    [sellItem, closeAll]
  );

  const sellBatchItem = useCallback(
    async (item: Item) => {
      await sellItem(item.instanceId!);
      setBatchItems((prev) => prev.filter((i) => i.instanceId !== item.instanceId));
    },
    [sellItem]
  );

  if (!caseItem) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-display font-black text-white">Case not found</h1>
        <p className="mt-2 text-text-secondary text-sm">The case &quot;{caseId}&quot; is not in our catalog.</p>
        <Link href="/" className="mt-6 inline-flex btn-primary">Back to cases</Link>
      </div>
    );
  }

  const canOpen1 = isLoaded && balance >= caseItem.price;
  const canOpen3 = isLoaded && balance >= caseItem.price * 3;
  const canOpen5 = isLoaded && balance >= caseItem.price * 5;
  const busy = activeOpening || stage === 'spinning';
  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> All cases
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border" style={{ color: topColor, borderColor: `${topColor}55`, backgroundColor: `${topColor}14` }}>
              {caseItem.category} case
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Provably fair
            </span>
          </div>
          <h1 className="mt-1.5 text-3xl sm:text-5xl font-display font-black text-white tracking-tighter uppercase leading-none">
            {caseItem.name}
          </h1>
          {caseItem.description && <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">{caseItem.description}</p>}
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-dark border border-white/[0.06] w-fit">
          <ItemImage src={caseItem.image} alt={caseItem.name} width={56} height={56} className="w-12 h-12 object-contain" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Price per open</p>
            <PriceTag value={caseItem.price} size="lg" />
          </div>
        </div>
      </div>

      <section aria-label="Case opening game" className="panel relative overflow-hidden">
        <div className="absolute inset-0 grid-texture opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 55% 60% at 50% 30%, ${topColor}1F 0%, transparent 65%)` }} />
        <div className="relative p-4 sm:p-8">
          {stage === 'idle' && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-center">
              <div className="relative mx-auto w-full max-w-[340px]">
                <div className="absolute inset-0 rounded-2xl opacity-60 blur-2xl" style={{ background: `radial-gradient(circle at 50% 55%, ${topColor}45 0%, transparent 70%)` }} />
                <div className="relative rounded-2xl border border-white/10 bg-black/50 p-6 overflow-hidden">
                  <div className="absolute inset-0 stripes-diag opacity-40" />
                  <ItemImage src={caseItem.image} alt={caseItem.name} width={300} height={300} loading="eager" className="relative w-full aspect-square object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.8)] animate-float" />
                  {topItem && (
                    <div className="relative mt-2 flex items-center justify-between rounded-lg bg-black/60 border border-white/10 px-3 py-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Top drop</span>
                      <span className="text-[11px] font-bold text-white truncate max-w-[55%]" title={topItem.name}>{topItem.name}</span>
                      <span className="text-[11px] font-black font-mono" style={{ color: topColor }}>{formatCurrency(topItem.demoValue)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Choose your opening</p>
                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 max-w-xl mx-auto lg:mx-0">
                  <OpenButton label="Open 1" sub={formatCurrency(caseItem.price)} disabled={!canOpen1 || busy} onClick={() => void startSingle(false)} primary />
                  <OpenButton label="Open 3" sub={formatCurrency(caseItem.price * 3)} disabled={!canOpen3 || busy} onClick={() => void startBatch(3)} />
                  <OpenButton label="Open 5" sub={formatCurrency(caseItem.price * 5)} disabled={!canOpen5 || busy} onClick={() => void startBatch(5)} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <button type="button" disabled={!canOpen1 || busy} onClick={() => void startSingle(true)} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-secondary hover:text-white transition-colors disabled:opacity-40">
                    <Zap className="w-3.5 h-3.5 text-gold-light" /> Quick open (no animation)
                  </button>
                  {!canOpen1 && isLoaded && (
                    <span className="text-[11px] font-bold text-red-300">Insufficient balance — add funds from the header.</span>
                  )}
                </div>
                {actionError && <p role="alert" className="mt-3 text-xs text-red-300 bg-red-950/50 border border-red-500/30 rounded-lg px-3 py-2 max-w-xl mx-auto lg:mx-0">{actionError}</p>}
                <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  <span className="inline-flex items-center gap-1"><Percent className="w-3 h-3 text-brand-300" /> Transparent odds</span>
                  <span className="inline-flex items-center gap-1"><Package className="w-3 h-3 text-brand-300" /> {caseItem.items.length} possible drops</span>
                  <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3 text-brand-300" /> Contents below</span>
                </div>
              </div>
            </div>
          )}
          {stage === 'spinning' && winningItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">Opening {caseItem.name}...</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Good luck — the reel decides your finish.</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-magenta-500/10 border border-magenta-500/40 text-magenta-300 text-[11px] font-black uppercase tracking-wider win-anticipation">
                  Rolling
                </span>
              </div>
              <Roulette key={spinKey} items={caseItem.items} winningItem={winningItem} isSpinning={isSpinning} onComplete={handleRouletteComplete} />
              <p className="text-center text-[11px] text-text-muted">Item is committed before the animation — the reveal only visualizes the result.</p>
            </div>
          )}
          {stage === 'batch' && showBatch && (
            <BatchResults items={batchItems} onSell={sellBatchItem} onAgain={() => { setShowBatch(false); setStage('idle'); }} onClose={closeAll} />
          )}
          {stage === 'reveal' && !showWin && winningItem && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6">
              <button type="button" onClick={() => setShowWin(true)} className="btn-primary font-display font-black uppercase tracking-widest text-sm px-8 py-3">View reward</button>
              <button type="button" onClick={closeAll} className="btn-ghost text-sm">Back to case</button>
            </div>
          )}
        </div>
      </section>
      <section aria-label="Case contents" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">Case contents</h2>
            <p className="text-xs text-text-muted mt-1">{caseItem.items.length} drops · probabilities shown per item · values in USD (simulated)</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Sorted by value</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {sortedContents.map((item) => (
            <div key={item.id} className="relative">
              <SkinCard item={item} showChance density="compact" />
              {getRarityTier(item.rarity) === 'top' && (
                <span className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-gold/20 text-gold-light border border-gold/50">Rare</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Related cases" className="space-y-3">
        <h2 className="font-display font-black text-lg text-white uppercase tracking-tight">You may also like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CASES.filter((c) => c.id !== caseItem.id && c.category === caseItem.category).slice(0, 4).map((c) => (
            <Link key={c.id} href={`/cases/${c.id}`} className="group flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-surface-dark hover:border-brand/50 hover:-translate-y-0.5 transition-all">
              <ItemImage src={c.image} alt={c.name} width={64} height={64} className="w-14 h-14 object-contain" />
              <span className="min-w-0">
                <span className="block text-xs font-bold text-white truncate group-hover:text-brand-300">{c.name}</span>
                <span className="block text-[11px] font-black text-emerald-400 price-display mt-0.5">{formatCurrency(c.price)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {showWin && winningItem && (
        <WinScreen
          item={winningItem}
          onClose={closeAll}
          onSell={handleSellFromWin}
          onOpenAgain={() => { closeAll(); setTimeout(() => void startSingle(false), 60); }}
          canOpenAgain={canOpen1}
        />
      )}
    </div>
  );
}

function OpenButton({ label, sub, disabled, onClick, primary }: { label: string; sub: string; disabled?: boolean; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={primary ? 'btn-primary flex flex-col items-center py-3.5 font-display' : 'btn-ghost flex flex-col items-center py-3.5 font-display hover:border-brand/50'}
    >
      <span className="text-sm font-black uppercase tracking-widest">{label}</span>
      <span className={`text-[11px] font-bold font-mono mt-0.5 ${primary ? 'text-white/85' : 'text-emerald-400'}`}>{sub}</span>
    </button>
  );
}

function BatchResults({ items, onSell, onAgain, onClose }: { items: Item[]; onSell: (i: Item) => void; onAgain: () => void; onClose: () => void }) {
  const total = items.reduce((s, i) => s + (i.demoValue || 0), 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display font-black text-xl text-white uppercase">{items.length}x opening — results</h2>
        <span className="text-xs font-black text-emerald-400 price-display">Total {formatCurrency(total)}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">All items sold. Nice profit run.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {items.map((item) => (
            <div key={item.instanceId || item.id} className="rounded-xl border border-white/10 bg-black/40 p-3 text-center" style={{ boxShadow: `inset 0 2px 0 ${getRarityColor(item.rarity)}` }}>
              <ItemImage src={item.image} alt={item.name} className="h-20 w-full object-contain" />
              <p className="mt-2 text-[11px] font-bold text-white truncate" title={item.name}>{item.name}</p>
              <RarityBadge rarity={item.rarity} size="xs" className="mt-1" />
              <p className="mt-1 text-[11px] font-black text-emerald-400 price-display">{formatCurrency(item.demoValue)}</p>
              <button type="button" onClick={() => onSell(item)} className="mt-2 text-[10px] font-black uppercase tracking-wider text-emerald-300 hover:text-emerald-200">Sell</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button type="button" onClick={onAgain} className="btn-primary font-display font-black uppercase tracking-widest text-sm">Open again</button>
        <button type="button" onClick={onClose} className="btn-ghost text-sm">Back to case</button>
      </div>
    </div>
  );
}
