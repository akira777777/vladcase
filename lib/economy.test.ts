import { describe, expect, it } from 'vitest';
import { CASES } from '../data/mockData';
import { openCase } from './caseLogic';
import {
  commit,
  initialState,
  readSnapshot,
  STORAGE_KEY,
  transition,
  validateSnapshot,
} from './economy';

const env = { random: () => 0, now: () => 100, id: () => 'instance-1' };
const sample = CASES[0];
function storage(entries: Record<string, string> = {}) {
  const data = new Map(Object.entries(entries));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}
describe('weighted selection', () => {
  it('excludes zero weights even at zero and uses exclusive interval boundaries', () => {
    const data = {
      ...sample,
      items: [0, 1, 1].map((dropChance, i) => ({
        ...sample.items[0],
        id: String(i),
        dropChance,
      })),
    };
    expect(openCase(data, env).id).toBe('1');
    expect(openCase(data, { ...env, random: () => 0.5 }).id).toBe('2');
    expect(openCase(data, { ...env, random: () => 0.999999 }).id).toBe('2');
  });
  it.each([[], [0], [-1], [Infinity], [NaN]].map((weights) => ({ weights })))(
    'rejects invalid weights $weights',
    ({ weights }) => {
      expect(() =>
        openCase(
          {
            ...sample,
            items: weights.map((dropChance) => ({
              ...sample.items[0],
              dropChance,
            })),
          },
          env
        )
      ).toThrow();
    }
  );
});
describe('economy transactions', () => {
  it('persists price, reward, XP and history in a single write', () => {
    const saved = storage();
    const result = commit(saved, { type: 'open', caseData: sample }, env);
    expect(result.result.ok).toBe(true);
    const next = readSnapshot(saved);
    expect(next.balanceCents).toBe(98500);
    expect(next.inventory).toHaveLength(1);
    expect(next.xp).toBe(50);
    expect(next.history[0].item.instanceId).toBe(next.inventory[0].instanceId);
  });
  it('rejects insufficient funds without changing saved data', () => {
    const saved = storage({
      [STORAGE_KEY]: JSON.stringify({ ...initialState(), balanceCents: 1 }),
    });
    const before = saved.getItem(STORAGE_KEY);
    expect(
      commit(saved, { type: 'open', caseData: sample }, env).result
    ).toMatchObject({ ok: false, code: 'funds' });
    expect(saved.getItem(STORAGE_KEY)).toBe(before);
  });
  it('re-reads storage and prevents double sales', () => {
    const saved = storage();
    commit(saved, { type: 'open', caseData: sample }, env);
    commit(saved, { type: 'sell', id: 'instance-1' });
    const balance = readSnapshot(saved).balanceCents;
    expect(
      commit(saved, { type: 'sell', id: 'instance-1' }).result
    ).toMatchObject({ ok: false, code: 'missing' });
    expect(readSnapshot(saved).balanceCents).toBe(balance);
  });
  it('sell-all uses exact cents and cannot credit twice', () => {
    const saved = storage();
    commit(saved, { type: 'open', caseData: sample }, env);
    commit(
      saved,
      { type: 'open', caseData: sample },
      { ...env, id: () => 'instance-2' }
    );
    commit(saved, { type: 'sellAll' });
    expect(readSnapshot(saved).balanceCents).toBe(97170);
    commit(saved, { type: 'sellAll' });
    expect(readSnapshot(saved).balanceCents).toBe(97170);
  });
  it('does not mutate previous state on failed persistence', () => {
    const saved = storage();
    const previous = readSnapshot(saved);
    expect(() =>
      commit(
        {
          ...saved,
          setItem: () => {
            throw new Error('Quota exceeded');
          },
        },
        { type: 'open', caseData: sample },
        env
      )
    ).toThrow();
    expect(readSnapshot(saved)).toEqual(previous);
  });
  it('rejects invalid amounts and invalid pools without mutation', () => {
    expect(() =>
      transition(initialState(), { type: 'credit', amount: Infinity })
    ).toThrow();
    const saved = storage();
    expect(() =>
      commit(saved, { type: 'open', caseData: { ...sample, items: [] } }, env)
    ).toThrow();
    expect(saved.getItem(STORAGE_KEY)).toBeNull();
  });
});
describe('saved progress', () => {
  it('migrates duplicate catalog items with distinct stable IDs and retains legacy keys', () => {
    const saved = storage({
      vladcase_inventory: JSON.stringify([sample.items[0], sample.items[0]]),
      vladcase_balance: '12.34',
    });
    const migrated = readSnapshot(saved);
    expect(migrated.balanceCents).toBe(1234);
    expect(migrated.inventory.map((i) => i.instanceId)).toEqual([
      'legacy-0',
      'legacy-1',
    ]);
    expect(readSnapshot(saved)).toEqual(migrated);
    expect(saved.getItem('vladcase_inventory')).not.toBeNull();
  });
  it.each(['{', 'null', '{"version":2}', '{"version":1,"inventory":[null]}'])(
    'preserves malformed snapshots %s',
    (raw) => {
      const saved = storage({ [STORAGE_KEY]: raw });
      expect(() => readSnapshot(saved)).toThrow();
      expect(saved.getItem(STORAGE_KEY)).toBe(raw);
    }
  );
  it('rejects duplicate instance IDs and unsafe numeric totals', () => {
    const entry = { ...sample.items[0], instanceId: 'same' };
    expect(() =>
      validateSnapshot({ ...initialState(), inventory: [entry, entry] })
    ).toThrow();
    expect(() =>
      validateSnapshot({
        ...initialState(),
        balanceCents: Number.MAX_SAFE_INTEGER + 1,
      })
    ).toThrow();
  });
});
