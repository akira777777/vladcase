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
import { upgradeChance } from './upgrader';

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
  it('migrates v1 snapshots into v2 and preserves the legacy source', () => {
    const legacy = {
      version: 1,
      balanceCents: 100000,
      xp: 50,
      inventory: [],
      history: [],
    };
    const saved = storage({ vladcase_state_v1: JSON.stringify(legacy) });
    const migrated = readSnapshot(saved);
    expect(migrated.version).toBe(2);
    expect(migrated.balanceCents).toBe(100000);
    expect(migrated.stats.totalOpens).toBe(0);
    expect(saved.getItem('vladcase_state_v1')).toBe(JSON.stringify(legacy));
  });

  it('opens a batch atomically and records every reward once', () => {
    const saved = storage();
    let id = 0;
    const result = commit(
      saved,
      { type: 'openMany', caseData: sample, count: 3 },
      { ...env, id: () => `batch-${++id}` }
    );
    expect(result.result.ok).toBe(true);
    const next = readSnapshot(saved);
    expect(next.balanceCents).toBe(95500);
    expect(next.inventory).toHaveLength(3);
    expect(next.history).toHaveLength(3);
    expect(new Set(next.inventory.map((item) => item.instanceId)).size).toBe(3);
    expect(next.stats.totalOpens).toBe(3);
  });

  it('rejects invalid v1 snapshots without overwriting the legacy record', () => {
    const raw = '{"version":1,"inventory":[null]}';
    const saved = storage({ vladcase_state_v1: raw });
    expect(() => readSnapshot(saved)).toThrow();
    expect(saved.getItem('vladcase_state_v1')).toBe(raw);
  });

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

describe('upgrade transactions', () => {
  const targetItem = {
    ...sample.items[0],
    id: 'upgrade-target',
    name: 'Target Skin',
    demoValue: 40,
  };

  function prepared() {
    const saved = storage();
    let n = 0;
    const id = () => `instance-${++n}`;
    return { saved, env: { ...env, id } };
  }

  it('rolls the outcome inside the transaction and awards the target on a win', () => {
    const { saved, env: localEnv } = prepared();
    commit(saved, { type: 'open', caseData: sample }, localEnv);
    const input = readSnapshot(saved).inventory[0];
    const inputCents = Math.round(input.demoValue * 100);
    const baseline = readSnapshot(saved).stats.rarityCounts[targetItem.rarity];
    const change = commit(
      saved,
      { type: 'upgrade', inputId: input.instanceId!, targetItem },
      { ...localEnv, random: () => 0.001 }
    );
    expect(change.result.ok).toBe(true);
    if (!change.result.ok) return;
    expect(change.result.upgrade).toMatchObject({
      won: true,
      chance: upgradeChance(inputCents, 4000),
    });
    const next = readSnapshot(saved);
    expect(next.inventory).toHaveLength(1);
    expect(next.inventory[0]).toMatchObject({
      id: 'upgrade-target',
      instanceId: 'instance-2',
    });
    expect(next.stats.rarityCounts[targetItem.rarity]).toBe(baseline + 1);
  });

  it('burns the input and records removed value on a loss', () => {
    const { saved, env: localEnv } = prepared();
    commit(saved, { type: 'open', caseData: sample }, localEnv);
    const input = readSnapshot(saved).inventory[0];
    const inputCents = Math.round(input.demoValue * 100);
    const change = commit(
      saved,
      { type: 'upgrade', inputId: input.instanceId!, targetItem },
      { ...localEnv, random: () => 0.9 }
    );
    expect(change.result.ok).toBe(true);
    if (!change.result.ok) return;
    expect(change.result.upgrade?.won).toBe(false);
    const next = readSnapshot(saved);
    expect(next.inventory).toHaveLength(0);
    expect(next.stats.removedValueCents).toBe(inputCents);
    expect(next.xp).toBe(75);
  });

  it('rejects targets that are not worth more without mutating storage', () => {
    const { saved, env: localEnv } = prepared();
    commit(saved, { type: 'open', caseData: sample }, localEnv);
    const input = readSnapshot(saved).inventory[0];
    const before = saved.getItem(STORAGE_KEY);
    const change = commit(saved, {
      type: 'upgrade',
      inputId: input.instanceId!,
      targetItem: { ...targetItem, demoValue: 0.01 },
    });
    expect(change.result).toMatchObject({ ok: false, code: 'invalid' });
    expect(saved.getItem(STORAGE_KEY)).toBe(before);
  });

  it('rejects a missing input without mutating storage', () => {
    const saved = storage();
    const change = commit(saved, {
      type: 'upgrade',
      inputId: 'ghost',
      targetItem,
    });
    expect(change.result).toMatchObject({ ok: false, code: 'missing' });
    expect(saved.getItem(STORAGE_KEY)).toBeNull();
  });

  it('backfills upgrade counters for snapshots saved before them', () => {
    const legacy = {
      ...initialState(),
      stats: {
        ...initialState().stats,
        upgradeWins: undefined,
        upgradeLosses: undefined,
        upgradeWageredCents: undefined,
      },
    };
    // Simulate an old snapshot: delete the new keys after JSON round-trip.
    const raw = JSON.parse(JSON.stringify({ ...legacy, stats: { ...legacy.stats } }));
    delete raw.stats.upgradeWins;
    delete raw.stats.upgradeLosses;
    delete raw.stats.upgradeWageredCents;
    const saved = storage({ [STORAGE_KEY]: JSON.stringify(raw) });
    const loaded = readSnapshot(saved);
    expect(loaded.stats.upgradeWins).toBe(0);
    expect(loaded.stats.upgradeLosses).toBe(0);
    expect(loaded.stats.upgradeWageredCents).toBe(0);
  });

  it('rejects negative upgrade counters', () => {
    const broken = {
      ...initialState(),
      stats: { ...initialState().stats, upgradeWins: -1 },
    };
    const saved = storage({ [STORAGE_KEY]: JSON.stringify(broken) });
    expect(() => readSnapshot(saved)).toThrow();
  });
});
