import type { CaseHistoryEntry, Item, LifetimeStats, Rarity } from '../types';

export const RARITIES: readonly Rarity[] = [
  'Consumer',
  'Industrial',
  'Mil-Spec',
  'Restricted',
  'Classified',
  'Covert',
  'Special Item',
];

export const RARITY_RANK: Record<Rarity, number> = {
  Consumer: 1,
  Industrial: 2,
  'Mil-Spec': 3,
  Restricted: 4,
  Classified: 5,
  Covert: 6,
  'Special Item': 7,
};

export function emptyStats(): LifetimeStats {
  return {
    totalOpens: 0,
    totalSpentCents: 0,
    totalDropValueCents: 0,
    realizedCents: 0,
    removedValueCents: 0,
    rarityCounts: Object.fromEntries(
      RARITIES.map((rarity) => [rarity, 0])
    ) as Record<Rarity, number>,
    caseCounts: {},
    currentRareStreak: 0,
    bestRareStreak: 0,
    bestDropInstanceId: null,
    upgradeWins: 0,
    upgradeLosses: 0,
    upgradeWageredCents: 0,
  };
}

export function rebuildStatsFromHistory(
  history: CaseHistoryEntry[]
): LifetimeStats {
  const stats = emptyStats();
  for (const entry of [...history].reverse()) {
    stats.totalOpens += 1;
    stats.totalSpentCents += entry.casePriceCents;
    stats.totalDropValueCents += entry.itemValueCents;
    stats.rarityCounts[entry.item.rarity] += 1;
    stats.caseCounts[entry.caseId] =
      (stats.caseCounts[entry.caseId] ?? 0) + 1;
    if (RARITY_RANK[entry.item.rarity] >= RARITY_RANK.Classified)
      stats.currentRareStreak += 1;
    else stats.currentRareStreak = 0;
    stats.bestRareStreak = Math.max(
      stats.bestRareStreak,
      stats.currentRareStreak
    );
    if (
      !stats.bestDropInstanceId ||
      entry.itemValueCents >
        (history.find(
          (candidate) =>
            candidate.item.instanceId === stats.bestDropInstanceId
        )?.itemValueCents ?? -1)
    )
      stats.bestDropInstanceId = entry.item.instanceId ?? null;
  }
  return stats;
}

export function inventoryValueCents(inventory: Item[]): number {
  return inventory.reduce(
    (sum, entry) => sum + Math.round(entry.demoValue * 100),
    0
  );
}
