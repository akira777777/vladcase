import type {
  Case,
  CaseHistoryEntry,
  Item,
  LifetimeStats,
  Rarity,
} from '../types';
import { openCase, type OpeningEnvironment } from './caseLogic';
import {
  upgradeChance,
  rollUpgrade,
  type UpgradeOutcome,
} from './upgrader';
import {
  emptyStats,
  RARITIES,
  RARITY_RANK,
  rebuildStatsFromHistory,
} from './stats';

export const STORAGE_KEY = 'vladcase_state_v2';
export const LEGACY_STORAGE_KEY = 'vladcase_state_v1';
export const HISTORY_LIMIT = 100;

export type { UpgradeOutcome };

export interface Snapshot {
  version: 2;
  balanceCents: number;
  xp: number;
  inventory: Item[];
  history: CaseHistoryEntry[];
  stats: LifetimeStats;
  favoriteIds: string[];
  goalIds: string[];
}

export const initialState = (): Snapshot => ({
  version: 2,
  balanceCents: 100000,
  xp: 0,
  inventory: [],
  history: [],
  stats: emptyStats(),
  favoriteIds: [],
  goalIds: [],
});

function record(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid saved record');
}

function nonnegative(value: unknown): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    throw new Error('Invalid saved amount');
}

function safeTotal(value: number): number {
  if (!Number.isSafeInteger(value)) throw new Error('Amount is too large');
  return value;
}

export function cents(value: number): number {
  nonnegative(value);
  return safeTotal(Math.round(value * 100));
}

function savedCents(value: unknown): number {
  nonnegative(value);
  if (!Number.isSafeInteger(value)) throw new Error('Invalid saved amount');
  return value;
}

function item(value: unknown, fallbackId: string): Item {
  record(value);
  for (const key of ['id', 'name', 'weaponType', 'image']) {
    if (typeof value[key] !== 'string' || !value[key])
      throw new Error('Invalid saved item');
  }
  if (!RARITIES.includes(value.rarity as Rarity))
    throw new Error('Invalid rarity');
  if (
    typeof value.image !== 'string' ||
    !/^(https:\/\/|\/assets\/)/.test(value.image)
  )
    throw new Error('Invalid image URL');
  nonnegative(value.demoValue);
  safeTotal(cents(value.demoValue));
  nonnegative(value.dropChance);
  if (value.unboxedAt !== undefined) nonnegative(value.unboxedAt);
  if (
    value.instanceId !== undefined &&
    (typeof value.instanceId !== 'string' || !value.instanceId)
  )
    throw new Error('Invalid instance ID');
  return {
    ...value,
    instanceId: value.instanceId ?? fallbackId,
    unboxedAt: value.unboxedAt ?? 0,
  } as unknown as Item;
}

function stringList(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || new Set(value).size !== value.length)
    throw new Error(`Invalid ${label}`);
  if (!value.every((entry) => typeof entry === 'string' && entry))
    throw new Error(`Invalid ${label}`);
  return value;
}

function historyEntry(value: unknown, index: number): CaseHistoryEntry {
  record(value);
  nonnegative(value.timestamp);
  if (typeof value.caseId !== 'string' || typeof value.caseName !== 'string')
    throw new Error('Invalid history');
  const parsedItem = item(value.item, `legacy-history-${index}`);
  const casePriceCents =
    value.casePriceCents === undefined
      ? 0
      : savedCents(value.casePriceCents);
  const itemValueCents =
    value.itemValueCents === undefined
      ? cents(parsedItem.demoValue)
      : savedCents(value.itemValueCents);
  return {
    id:
      typeof value.id === 'string' && value.id
        ? value.id
        : `legacy-opening-${parsedItem.instanceId}`,
    caseId: value.caseId,
    caseName: value.caseName,
    casePriceCents,
    item: parsedItem,
    itemValueCents,
    timestamp: value.timestamp,
  };
}

function stats(value: unknown): LifetimeStats {
  record(value);
  for (const key of [
    'totalOpens',
    'totalSpentCents',
    'totalDropValueCents',
    'realizedCents',
    'removedValueCents',
    'currentRareStreak',
    'bestRareStreak',
  ]) {
    if (
      !Number.isSafeInteger(value[key]) ||
      (value[key] as number) < 0
    )
      throw new Error('Invalid lifetime statistics');
  }
  if (
    typeof value.bestDropInstanceId !== 'string' &&
    value.bestDropInstanceId !== null
  )
    throw new Error('Invalid best drop');
  record(value.rarityCounts);
  for (const rarity of RARITIES)
    if (
      !Number.isSafeInteger(value.rarityCounts[rarity]) ||
      (value.rarityCounts[rarity] as number) < 0
    )
      throw new Error('Invalid rarity statistics');
  record(value.caseCounts);
  for (const count of Object.values(value.caseCounts))
    if (
      !Number.isSafeInteger(count) ||
      (count as number) < 0
    )
      throw new Error('Invalid case statistics');
  return value as unknown as LifetimeStats;
}

function collection(value: unknown): Item[] {
  if (!Array.isArray(value)) throw new Error('Invalid saved collection');
  const inventory = value.map((entry, index) => item(entry, `legacy-${index}`));
  if (new Set(inventory.map((entry) => entry.instanceId)).size !== inventory.length)
    throw new Error('Duplicate saved instance IDs');
  return inventory;
}

function history(value: unknown): CaseHistoryEntry[] {
  if (!Array.isArray(value)) throw new Error('Invalid saved history');
  return value.slice(0, HISTORY_LIMIT).map(historyEntry);
}

export function validateSnapshot(value: unknown): Snapshot {
  record(value);
  if (value.version !== 2) throw new Error('Unsupported saved version');
  if (!Number.isSafeInteger(value.balanceCents) || (value.balanceCents as number) < 0)
    throw new Error('Invalid saved totals');
  if (!Number.isSafeInteger(value.xp) || (value.xp as number) < 0)
    throw new Error('Invalid saved totals');
  const inventory = collection(value.inventory);
  const entries = history(value.history);
  return {
    version: 2,
    balanceCents: value.balanceCents as number,
    xp: value.xp as number,
    inventory,
    history: entries,
    stats: stats(value.stats),
    favoriteIds: stringList(value.favoriteIds, 'favorites'),
    goalIds: stringList(value.goalIds, 'goals'),
  };
}

function migrateV1(value: unknown): Snapshot {
  record(value);
  if (value.version !== 1) throw new Error('Unsupported saved version');
  if (!Number.isSafeInteger(value.balanceCents) || (value.balanceCents as number) < 0)
    throw new Error('Invalid saved totals');
  if (!Number.isSafeInteger(value.xp) || (value.xp as number) < 0)
    throw new Error('Invalid saved totals');
  const inventory = collection(value.inventory);
  const entries = history(value.history);
  return validateSnapshot({
    version: 2,
    balanceCents: value.balanceCents,
    xp: value.xp,
    inventory,
    history: entries,
    stats: rebuildStatsFromHistory(entries),
    favoriteIds: [],
    goalIds: [],
  });
}

export function readSnapshot(storage: Pick<Storage, 'getItem'>): Snapshot {
  const saved = storage.getItem(STORAGE_KEY);
  if (saved !== null) {
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object' && (parsed as { version?: unknown }).version === 1) {
      return migrateV1(parsed);
    }
    return validateSnapshot(parsed);
  }
  const legacy = storage.getItem(LEGACY_STORAGE_KEY);
  if (legacy !== null) return migrateV1(JSON.parse(legacy));
  const read = (key: string, fallback: unknown): unknown => {
    const raw = storage.getItem(`vladcase_${key}`);
    return raw === null ? fallback : JSON.parse(raw);
  };
  const balance = read('balance', 1000);
  nonnegative(balance);
  return migrateV1({
    version: 1,
    balanceCents: cents(balance),
    xp: read('xp', 0),
    inventory: read('inventory', []),
    history: read('history', []),
  });
}

export type Command =
  | { type: 'open'; caseData: Case }
  | { type: 'openMany'; caseData: Case; count: number }
  | { type: 'credit'; amount: number }
  | { type: 'sell' | 'remove'; id: string }
  | { type: 'sellAll' | 'reset' }
  | { type: 'toggleFavorite' | 'toggleGoal'; id: string }
  | { type: 'contract'; inputIds: string[]; rewardItem: Item }
  | { type: 'upgrade'; inputId: string; targetItem: Item };

export type Result =
  | { ok: true; item?: Item; items?: Item[]; upgrade?: UpgradeOutcome }
  | {
      ok: false;
      code: 'funds' | 'missing' | 'storage' | 'unavailable' | 'invalid';
      message: string;
    };

function openMany(
  state: Snapshot,
  caseData: Case,
  count: number,
  env?: OpeningEnvironment
): { state: Snapshot; items: Item[] } {
  if (!Number.isSafeInteger(count) || count < 1 || count > 100)
    throw new Error('Open count must be between 1 and 100');
  const priceCents = cents(caseData.price);
  const totalPriceCents = safeTotal(priceCents * count);
  if (totalPriceCents > state.balanceCents)
    throw new Error('Insufficient funds for this batch');
  const awarded = Array.from({ length: count }, () =>
    openCase(caseData, env)
  );
  const entries = awarded.map((awardedItem): CaseHistoryEntry => ({
    id: `opening-${awardedItem.instanceId}`,
    caseId: caseData.id,
    caseName: caseData.name,
    casePriceCents: priceCents,
    item: awardedItem,
    itemValueCents: cents(awardedItem.demoValue),
    timestamp: awardedItem.unboxedAt!,
  }));
  const rarityCounts = { ...state.stats.rarityCounts };
  const caseCounts = { ...state.stats.caseCounts };
  let currentRareStreak = state.stats.currentRareStreak;
  let bestRareStreak = state.stats.bestRareStreak;
  let bestDropInstanceId = state.stats.bestDropInstanceId;
  let bestDropValueCents = -1;
  if (state.history[0]?.item.instanceId) {
    bestDropInstanceId = state.history[0].item.instanceId;
    bestDropValueCents = state.history[0].itemValueCents;
  }
  for (const entry of entries) {
    rarityCounts[entry.item.rarity] += 1;
    caseCounts[caseData.id] = (caseCounts[caseData.id] ?? 0) + 1;
    currentRareStreak =
      RARITY_RANK[entry.item.rarity] >= RARITY_RANK.Classified
        ? currentRareStreak + 1
        : 0;
    bestRareStreak = Math.max(bestRareStreak, currentRareStreak);
    if (entry.itemValueCents > bestDropValueCents) {
      bestDropInstanceId = entry.item.instanceId!;
      bestDropValueCents = entry.itemValueCents;
    }
  }
  const next: Snapshot = {
    ...state,
    balanceCents: safeTotal(state.balanceCents - totalPriceCents),
    xp: safeTotal(state.xp + count * 50),
    inventory: [...awarded.reverse(), ...state.inventory],
    history: [...entries.reverse(), ...state.history].slice(0, HISTORY_LIMIT),
    stats: {
      ...state.stats,
      totalOpens: safeTotal(state.stats.totalOpens + count),
      totalSpentCents: safeTotal(state.stats.totalSpentCents + totalPriceCents),
      totalDropValueCents: safeTotal(
        state.stats.totalDropValueCents +
          entries.reduce((sum, entry) => sum + entry.itemValueCents, 0)
      ),
      rarityCounts,
      caseCounts,
      currentRareStreak,
      bestRareStreak,
      bestDropInstanceId,
    },
  };
  return { state: validateSnapshot(next), items: awarded };
}

function toggleId(ids: string[], id: string): string[] {
  if (typeof id !== 'string' || !id) throw new Error('Invalid catalog ID');
  return ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id];
}

export function transition(
  state: Snapshot,
  command: Command,
  env?: OpeningEnvironment
): { state: Snapshot; result: Result } {
  let next = state;
  let awarded: Item | undefined;
  let items: Item[] | undefined;
  let upgrade: UpgradeOutcome | undefined;
  switch (command.type) {
    case 'open':
    case 'openMany': {
      const count = command.type === 'open' ? 1 : command.count;
      const priceCents = cents(command.caseData.price);
      if (priceCents * count > state.balanceCents)
        return {
          state,
          result: { ok: false, code: 'funds', message: 'Insufficient funds.' },
        };
      const opened = openMany(state, command.caseData, count, env);
      next = opened.state;
      items = opened.items;
      awarded = opened.items[0];
      break;
    }
    case 'credit':
      next = {
        ...state,
        balanceCents: safeTotal(state.balanceCents + cents(command.amount)),
      };
      break;
    case 'sell':
    case 'remove': {
      const target = state.inventory.find(
        (entry) => entry.instanceId === command.id
      );
      if (!target)
        return {
          state,
          result: {
            ok: false,
            code: 'missing',
            message: 'This item is no longer in your inventory.',
          },
        };
      const valueCents = cents(target.demoValue);
      next = {
        ...state,
        balanceCents: safeTotal(
          state.balanceCents + (command.type === 'sell' ? valueCents : 0)
        ),
        inventory: state.inventory.filter(
          (entry) => entry.instanceId !== command.id
        ),
        stats: {
          ...state.stats,
          realizedCents: safeTotal(
            state.stats.realizedCents +
              (command.type === 'sell' ? valueCents : 0)
          ),
          removedValueCents: safeTotal(
            state.stats.removedValueCents +
              (command.type === 'remove' ? valueCents : 0)
          ),
        },
      };
      break;
    }
    case 'sellAll': {
      const valueCents = safeTotal(
        state.inventory.reduce(
          (sum, entry) => safeTotal(sum + cents(entry.demoValue)),
          0
        )
      );
      next = {
        ...state,
        balanceCents: safeTotal(state.balanceCents + valueCents),
        inventory: [],
        stats: {
          ...state.stats,
          realizedCents: safeTotal(state.stats.realizedCents + valueCents),
        },
      };
      break;
    }
    case 'toggleFavorite':
      next = { ...state, favoriteIds: toggleId(state.favoriteIds, command.id) };
      break;
    case 'toggleGoal':
      next = { ...state, goalIds: toggleId(state.goalIds, command.id) };
      break;
    case 'contract': {
      const inputs = state.inventory.filter((entry) =>
        command.inputIds.includes(entry.instanceId!)
      );
      if (inputs.length !== command.inputIds.length) {
        return {
          state,
          result: {
            ok: false,
            code: 'missing',
            message: 'Some items selected for trade-up are missing.',
          },
        };
      }
      const reward: Item = {
        ...command.rewardItem,
        instanceId:
          env?.id() ??
          `contract-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        unboxedAt: env?.now() ?? Date.now(),
      };
      const rarityCounts = { ...state.stats.rarityCounts };
      rarityCounts[reward.rarity] = (rarityCounts[reward.rarity] ?? 0) + 1;
      next = {
        ...state,
        xp: safeTotal(state.xp + 150),
        inventory: [
          reward,
          ...state.inventory.filter(
            (entry) => !command.inputIds.includes(entry.instanceId!)
          ),
        ],
        stats: {
          ...state.stats,
          rarityCounts,
        },
      };
      awarded = reward;
      break;
    }
    case 'upgrade': {
      const target = state.inventory.find(
        (entry) => entry.instanceId === command.inputId
      );
      if (!target) {
        return {
          state,
          result: {
            ok: false,
            code: 'missing',
            message: 'Item selected for upgrade is missing.',
          },
        };
      }
      const inputCents = cents(target.demoValue);
      const targetCents = cents(command.targetItem.demoValue);
      if (targetCents <= inputCents) {
        return {
          state,
          result: {
            ok: false,
            code: 'invalid',
            message: 'Upgrade target must be worth more than the item.',
          },
        };
      }
      const chance = upgradeChance(inputCents, targetCents);
      const won = rollUpgrade(chance, env);
      const remainingInventory = state.inventory.filter(
        (entry) => entry.instanceId !== command.inputId
      );
      if (won) {
        const reward: Item = {
          ...command.targetItem,
          instanceId:
            env?.id() ??
            `upgraded-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          unboxedAt: env?.now() ?? Date.now(),
        };
        const rarityCounts = { ...state.stats.rarityCounts };
        rarityCounts[reward.rarity] = (rarityCounts[reward.rarity] ?? 0) + 1;
        next = {
          ...state,
          xp: safeTotal(state.xp + 200),
          inventory: [reward, ...remainingInventory],
          stats: {
            ...state.stats,
            rarityCounts,
          },
        };
        awarded = reward;
      } else {
        next = {
          ...state,
          xp: safeTotal(state.xp + 25),
          inventory: remainingInventory,
          stats: {
            ...state.stats,
            removedValueCents: safeTotal(
              state.stats.removedValueCents + inputCents
            ),
          },
        };
      }
      upgrade = { chance, won, inputItem: target };
      break;
    }
    case 'reset':
      next = initialState();
      break;
  }
  validateSnapshot(next);
  return {
    state: next,
    result: { ok: true, item: awarded, items, upgrade },
  };
}

export function commit(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  command: Command,
  env?: OpeningEnvironment
) {
  const change = transition(readSnapshot(storage), command, env);
  if (change.result.ok) {
    const v1State = {
      version: 1,
      balanceCents: change.state.balanceCents,
      xp: change.state.xp,
      inventory: change.state.inventory,
      history: change.state.history,
    };
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(v1State));
    storage.setItem(STORAGE_KEY, JSON.stringify(change.state));
  }
  return change;
}
