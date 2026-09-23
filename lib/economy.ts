import type { Case, CaseHistoryEntry, Item, Rarity } from '../types';
import { openCase, type OpeningEnvironment } from './caseLogic';

export const STORAGE_KEY = 'vladcase_state_v1';
export interface Snapshot {
  version: 1;
  balanceCents: number;
  xp: number;
  inventory: Item[];
  history: CaseHistoryEntry[];
}
export const initialState = (): Snapshot => ({
  version: 1,
  balanceCents: 100000,
  xp: 0,
  inventory: [],
  history: [],
});
const rarities: Rarity[] = [
  'Consumer',
  'Industrial',
  'Mil-Spec',
  'Restricted',
  'Classified',
  'Covert',
  'Special Item',
];
function record(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid saved record');
}
function nonnegative(value: unknown): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    throw new Error('Invalid saved amount');
}
export function cents(value: number): number {
  nonnegative(value);
  const result = Math.round(value * 100);
  if (!Number.isSafeInteger(result)) throw new Error('Amount is too large');
  return result;
}
function item(value: unknown, fallbackId: string): Item {
  record(value);
  for (const key of ['id', 'name', 'weaponType', 'image']) {
    if (typeof value[key] !== 'string' || !value[key])
      throw new Error('Invalid saved item');
  }
  if (!rarities.includes(value.rarity as Rarity))
    throw new Error('Invalid rarity');
  if (
    typeof value.image !== 'string' ||
    !/^(https:\/\/|\/assets\/)/.test(value.image)
  )
    throw new Error('Invalid image URL');
  nonnegative(value.demoValue);
  cents(value.demoValue);
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
export function validateSnapshot(value: unknown): Snapshot {
  record(value);
  if (value.version !== 1) throw new Error('Unsupported saved version');
  nonnegative(value.balanceCents);
  nonnegative(value.xp);
  if (
    !Number.isSafeInteger(value.balanceCents) ||
    !Number.isSafeInteger(value.xp)
  )
    throw new Error('Invalid saved totals');
  if (!Array.isArray(value.inventory) || !Array.isArray(value.history))
    throw new Error('Invalid saved collection');
  const inventory = value.inventory.map((entry, index) =>
    item(entry, `legacy-${index}`)
  );
  if (
    new Set(inventory.map((entry) => entry.instanceId)).size !==
    inventory.length
  )
    throw new Error('Duplicate saved instance IDs');
  const history = value.history
    .map((entry, index): CaseHistoryEntry => {
      record(entry);
      nonnegative(entry.timestamp);
      if (
        typeof entry.caseId !== 'string' ||
        typeof entry.caseName !== 'string'
      )
        throw new Error('Invalid history');
      return {
        caseId: entry.caseId,
        caseName: entry.caseName,
        timestamp: entry.timestamp,
        item: item(entry.item, `legacy-history-${index}`),
      };
    })
    .slice(0, 20);
  return {
    version: 1,
    balanceCents: value.balanceCents,
    xp: value.xp,
    inventory,
    history,
  };
}
export function readSnapshot(storage: Pick<Storage, 'getItem'>): Snapshot {
  const saved = storage.getItem(STORAGE_KEY);
  if (saved !== null) return validateSnapshot(JSON.parse(saved));
  const read = (key: string, fallback: unknown): unknown => {
    const raw = storage.getItem(`vladcase_${key}`);
    return raw === null ? fallback : JSON.parse(raw);
  };
  const balance = read('balance', 1000);
  nonnegative(balance);
  return validateSnapshot({
    version: 1,
    balanceCents: cents(balance),
    xp: read('xp', 0),
    inventory: read('inventory', []),
    history: read('history', []),
  });
}
export type Command =
  | { type: 'open'; caseData: Case }
  | { type: 'credit'; amount: number }
  | { type: 'sell' | 'remove'; id: string }
  | { type: 'sellAll' | 'reset' };
export type Result =
  | { ok: true; item?: Item }
  | {
      ok: false;
      code: 'funds' | 'missing' | 'storage' | 'unavailable' | 'invalid';
      message: string;
    };
export function transition(
  state: Snapshot,
  command: Command,
  env?: OpeningEnvironment
): { state: Snapshot; result: Result } {
  let next = state;
  let awarded: Item | undefined;
  switch (command.type) {
    case 'open': {
      const price = cents(command.caseData.price);
      if (price > state.balanceCents)
        return {
          state,
          result: { ok: false, code: 'funds', message: 'Insufficient funds.' },
        };
      awarded = openCase(command.caseData, env);
      next = {
        ...state,
        balanceCents: state.balanceCents - price,
        xp: state.xp + 50,
        inventory: [awarded, ...state.inventory],
        history: [
          {
            caseId: command.caseData.id,
            caseName: command.caseData.name,
            item: awarded,
            timestamp: awarded.unboxedAt!,
          },
          ...state.history,
        ].slice(0, 20),
      };
      break;
    }
    case 'credit':
      next = {
        ...state,
        balanceCents: state.balanceCents + cents(command.amount),
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
      next = {
        ...state,
        balanceCents:
          state.balanceCents +
          (command.type === 'sell' ? cents(target.demoValue) : 0),
        inventory: state.inventory.filter(
          (entry) => entry.instanceId !== command.id
        ),
      };
      break;
    }
    case 'sellAll':
      next = {
        ...state,
        balanceCents:
          state.balanceCents +
          state.inventory.reduce(
            (sum, entry) => sum + cents(entry.demoValue),
            0
          ),
        inventory: [],
      };
      break;
    case 'reset':
      next = initialState();
      break;
  }
  validateSnapshot(next);
  return { state: next, result: { ok: true, item: awarded } };
}

// Hold the origin-wide storage lock across the read, transition, and write.
export function commit(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  command: Command,
  env?: OpeningEnvironment
) {
  const change = transition(readSnapshot(storage), command, env);
  if (change.result.ok)
    storage.setItem(STORAGE_KEY, JSON.stringify(change.state));
  return change;
}
