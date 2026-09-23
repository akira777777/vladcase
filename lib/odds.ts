import type { Case, Item, Rarity } from '../types';
import { RARITIES } from './stats';

export function caseOdds(caseData: Case): Item[] {
  const total = caseData.items.reduce((sum, item) => sum + item.dropChance, 0);
  if (total <= 0) return [];
  return caseData.items.map((item) => ({ ...item, dropChance: (item.dropChance / total) * 100 }));
}

export function rarityOdds(caseData: Case): Record<Rarity, number> {
  const result = Object.fromEntries(RARITIES.map((rarity) => [rarity, 0])) as Record<Rarity, number>;
  for (const item of caseOdds(caseData)) result[item.rarity] += item.dropChance;
  return result;
}
