import type { OpeningEnvironment } from './caseLogic';

/**
 * Payout factor applied to the raw value ratio, mirroring the house edge
 * convention of OpenCase-style upgraders. 0.95 means the site keeps ~5%.
 */
export const HOUSE_EDGE = 0.95;
export const MIN_CHANCE_PERCENT = 1;
export const MAX_CHANCE_PERCENT = 90;

export interface UpgradeOutcome {
  chance: number;
  won: boolean;
  inputItem: Item;
}

export function upgradeChance(inputCents: number, targetCents: number): number {
  if (
    !Number.isFinite(inputCents) ||
    !Number.isFinite(targetCents) ||
    inputCents <= 0 ||
    targetCents <= 0
  )
    throw new Error('Invalid upgrade values');
  if (targetCents <= inputCents)
    throw new Error('Upgrade target must be worth more than the input');
  const raw = (inputCents / targetCents) * 100 * HOUSE_EDGE;
  return Math.min(MAX_CHANCE_PERCENT, Math.max(MIN_CHANCE_PERCENT, raw));
}

export function rollUpgrade(
  chancePercent: number,
  env?: Pick<OpeningEnvironment, 'random'>
): boolean {
  if (
    !Number.isFinite(chancePercent) ||
    chancePercent <= 0 ||
    chancePercent > 100
  )
    throw new Error('Invalid upgrade chance');
  const random = env?.random() ?? Math.random();
  if (!Number.isFinite(random) || random < 0 || random >= 1)
    throw new Error('Invalid random sample');
  return random * 100 < chancePercent;
}
