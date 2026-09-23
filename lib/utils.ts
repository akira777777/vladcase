import { Item, Rarity } from "../types";

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'Consumer':
      return '#B0C3D9';
    case 'Industrial':
      return '#5E98D9';
    case 'Mil-Spec':
      return '#4B69FF';
    case 'Restricted':
      return '#8847FF';
    case 'Classified':
      return '#D32CE6';
    case 'Covert':
      return '#EB4B4B';
    case 'Special Item':
      return '#FFD700';
    default:
      return '#FFFFFF';
  }
}

export function getRarityBadgeClass(rarity: Rarity): string {
  switch (rarity) {
    case 'Consumer':
      return 'bg-zinc-700/50 text-zinc-300 border-zinc-500/30';
    case 'Industrial':
      return 'bg-blue-900/40 text-blue-300 border-blue-500/40';
    case 'Mil-Spec':
      return 'bg-blue-700/40 text-blue-200 border-blue-400/50 shadow-[0_0_10px_rgba(75,105,255,0.3)]';
    case 'Restricted':
      return 'bg-purple-900/40 text-purple-200 border-purple-400/50 shadow-[0_0_10px_rgba(136,71,255,0.3)]';
    case 'Classified':
      return 'bg-pink-900/40 text-pink-200 border-pink-400/50 shadow-[0_0_12px_rgba(211,44,230,0.35)]';
    case 'Covert':
      return 'bg-red-900/40 text-red-200 border-red-500/60 shadow-[0_0_15px_rgba(235,75,75,0.4)]';
    case 'Special Item':
      return 'bg-amber-900/50 text-amber-200 border-amber-400/70 shadow-[0_0_20px_rgba(255,215,0,0.5)]';
    default:
      return 'bg-white/10 text-white border-white/20';
  }
}

export function getRankTitle(level: number): { title: string; color: string } {
  if (level >= 10) return { title: 'The Global Elite', color: '#FFD700' };
  if (level >= 8) return { title: 'Supreme Master', color: '#EB4B4B' };
  if (level >= 6) return { title: 'Legendary Eagle', color: '#D32CE6' };
  if (level >= 4) return { title: 'Master Guardian', color: '#8847FF' };
  if (level >= 3) return { title: 'Gold Nova Master', color: '#4B69FF' };
  if (level >= 2) return { title: 'Gold Nova', color: '#5E98D9' };
  return { title: 'Silver Elite', color: '#B0C3D9' };
}

export function getItemWear(item: Item): string {
  if (item.rarity === 'Special Item') return '★ Factory New';
  if (item.demoValue > 500) return 'Factory New';
  if (item.demoValue > 100) return 'Minimal Wear';
  if (item.demoValue > 20) return 'Field-Tested';
  return 'Battle-Scarred';
}
