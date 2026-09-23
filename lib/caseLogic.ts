import type { Case, Item } from '../types';
export interface OpeningEnvironment {
  random: () => number;
  now: () => number;
  id: () => string;
}
export function openCase(
  caseData: Case,
  env: OpeningEnvironment = {
    random: Math.random,
    now: Date.now,
    id: () => crypto.randomUUID(),
  }
): Item {
  const { items } = caseData;
  if (
    !items.length ||
    items.some((i) => !Number.isFinite(i.dropChance) || i.dropChance < 0)
  )
    throw new Error('Invalid case weights');
  const total = items.reduce((sum, item) => sum + item.dropChance, 0);
  if (!Number.isFinite(total) || total <= 0)
    throw new Error('Case has no eligible items');
  const random = env.random();
  if (!Number.isFinite(random) || random < 0 || random >= 1)
    throw new Error('Invalid random sample');
  let remaining = random * total;
  const eligible = items.filter((item) => item.dropChance > 0);
  let winner = eligible[eligible.length - 1];
  for (const item of eligible) {
    if (remaining < item.dropChance) {
      winner = item;
      break;
    }
    remaining -= item.dropChance;
  }
  return { ...winner, instanceId: env.id(), unboxedAt: env.now() };
}
