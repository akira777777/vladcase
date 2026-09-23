import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CASES } from '@/data/mockData';
import { caseOdds, rarityOdds } from '@/lib/odds';
import { formatCurrency, getRarityBadgeClass, getRarityColor } from '@/lib/utils';
import { RARITIES } from '@/lib/stats';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import CaseCard from '@/components/case/CaseCard';
import ItemImage from '@/components/ui/ItemImage';

export function generateStaticParams() { return CASES.map((caseItem) => ({ caseId: caseItem.id })); }
export async function generateMetadata({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const caseItem = CASES.find((entry) => entry.id === caseId);
  return {
    title: caseItem ? caseItem.name : 'Case',
    description: caseItem?.description ?? 'Explore VLADCASE simulated case odds.',
  };
}
export default async function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params; const caseItem = CASES.find((entry) => entry.id === caseId); if (!caseItem) notFound(); const odds = caseOdds(caseItem); const tiers = rarityOdds(caseItem); const values = caseItem.items.map((item) => item.demoValue);
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white"><ArrowLeft className="h-4 w-4" />Back to cases</Link><p className="mt-6 text-xs font-bold uppercase tracking-widest text-accent">{caseItem.category} case</p><h1 className="mt-2 text-4xl sm:text-6xl font-black font-display text-white">{caseItem.name}</h1><p className="mt-2 max-w-2xl text-sm text-text-secondary">{caseItem.description}</p></div><div className="flex items-center gap-2 rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent"><ShieldCheck className="h-5 w-5" />{formatCurrency(caseItem.price)} per open</div></div>
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-3xl border border-white/10 bg-surface/80 p-4"><ItemImage src={caseItem.image} alt={caseItem.name} className="mx-auto max-h-80 w-full object-contain" /><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white/5 p-3"><p className="text-[10px] uppercase text-text-muted">Lowest</p><p className="mt-1 font-bold text-white">{formatCurrency(Math.min(...values))}</p></div><div className="rounded-xl bg-white/5 p-3"><p className="text-[10px] uppercase text-text-muted">Average</p><p className="mt-1 font-bold text-white">{formatCurrency(values.reduce((sum, value) => sum + value, 0) / values.length)}</p></div><div className="rounded-xl bg-white/5 p-3"><p className="text-[10px] uppercase text-text-muted">Top drop</p><p className="mt-1 font-bold text-amber-300">{formatCurrency(Math.max(...values))}</p></div></div><div className="mt-4"><CaseCard caseData={caseItem} /></div></div>
    <div className="rounded-3xl border border-white/10 bg-surface/80 p-6"><h2 className="text-2xl font-bold text-white">Transparent simulator odds</h2><p className="mt-2 text-sm text-text-secondary">These are the normalized weights in this local catalog, not official Valve odds or market prices.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{odds.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-surface-dark/60 p-3" style={{ borderColor: `${getRarityColor(item.rarity)}35` }}><ItemImage src={item.image} alt={item.name} className="h-12 w-20 object-contain" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{item.name}</p><span className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${getRarityBadgeClass(item.rarity)}`}>{item.rarity}</span></div><div className="text-right"><p className="text-sm font-black text-accent">{item.dropChance.toFixed(2)}%</p><p className="text-[10px] text-text-muted">{formatCurrency(item.demoValue)}</p></div></div>)}</div><div className="mt-8 border-t border-white/10 pt-6"><h3 className="font-bold text-white">Rarity breakdown</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{RARITIES.filter((rarity) => tiers[rarity] > 0).map((rarity) => <div key={rarity} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm"><span style={{ color: getRarityColor(rarity) }}>{rarity}</span><span className="font-bold text-white">{tiers[rarity].toFixed(2)}%</span></div>)}</div></div></div></div>
  </div>;
}
