export type Rarity =
  | 'Consumer'
  | 'Industrial'
  | 'Mil-Spec'
  | 'Restricted'
  | 'Classified'
  | 'Covert'
  | 'Special Item';

export interface Item {
  id: string;
  name: string;
  weaponType: string;
  image: string;
  rarity: Rarity;
  demoValue: number;
  dropChance: number;
  instanceId?: string;
  unboxedAt?: number;
}

export interface Case {
  id: string;
  name: string;
  image: string;
  price: number;
  category:
    | 'POPULAR'
    | 'NEW'
    | 'BUDGET'
    | 'PREMIUM'
    | 'KNIFE'
    | 'FANSERVICE';
  description?: string;
  items: Item[];
}

export interface CaseHistoryEntry {
  id: string;
  caseId: string;
  caseName: string;
  casePriceCents: number;
  item: Item;
  itemValueCents: number;
  timestamp: number;
}

export interface LifetimeStats {
  totalOpens: number;
  totalSpentCents: number;
  totalDropValueCents: number;
  realizedCents: number;
  removedValueCents: number;
  rarityCounts: Record<Rarity, number>;
  caseCounts: Record<string, number>;
  currentRareStreak: number;
  bestRareStreak: number;
  bestDropInstanceId: string | null;
  /** Number of successful upgrader exchanges. */
  upgradeWins: number;
  /** Number of failed upgrades (input consumed). */
  upgradeLosses: number;
  /** Sum of input value cents offered to the upgrader across wins and losses. */
  upgradeWageredCents: number;
}
