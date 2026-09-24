import { describe, expect, it } from 'vitest';
import {
  HOUSE_EDGE,
  MAX_CHANCE_PERCENT,
  MIN_CHANCE_PERCENT,
  rollUpgrade,
  upgradeChance,
} from './upgrader';

describe('upgradeChance', () => {
  it('applies the house edge to the value ratio', () => {
    expect(upgradeChance(9500, 10000)).toBeCloseTo(95 * HOUSE_EDGE, 9);
    expect(upgradeChance(5000, 10000)).toBeCloseTo(47.5, 9);
  });

  it('clamps the displayed chance between the floor and the ceiling', () => {
    expect(upgradeChance(1, 100000)).toBe(MIN_CHANCE_PERCENT);
    expect(upgradeChance(10000, 10001)).toBe(MAX_CHANCE_PERCENT);
  });

  it('rejects non-positive and non-finite values', () => {
    expect(() => upgradeChance(0, 10000)).toThrow();
    expect(() => upgradeChance(10000, 0)).toThrow();
    expect(() => upgradeChance(Infinity, 10000)).toThrow();
    expect(() => upgradeChance(NaN, 10000)).toThrow();
    expect(() => upgradeChance(-100, 10000)).toThrow();
  });

  it('requires the target to be worth more than the input', () => {
    expect(() => upgradeChance(10000, 10000)).toThrow();
    expect(() => upgradeChance(10000, 5000)).toThrow();
  });
});

describe('rollUpgrade', () => {
  it('wins when the random sample lands inside the chance window', () => {
    expect(rollUpgrade(50, { random: () => 0.4999 })).toBe(true);
    expect(rollUpgrade(50, { random: () => 0.5 })).toBe(false);
  });

  it('matches the documented boundary semantics', () => {
    expect(rollUpgrade(47.5, { random: () => 0.4749999 })).toBe(true);
    expect(rollUpgrade(47.5, { random: () => 0.475 })).toBe(false);
    expect(rollUpgrade(90, { random: () => 0.899999 })).toBe(true);
  });

  it('rejects invalid chances and invalid samples', () => {
    expect(() => rollUpgrade(0)).toThrow();
    expect(() => rollUpgrade(-5)).toThrow();
    expect(() => rollUpgrade(101)).toThrow();
    expect(() => rollUpgrade(NaN)).toThrow();
    expect(() => rollUpgrade(50, { random: () => 1 })).toThrow();
    expect(() => rollUpgrade(50, { random: () => NaN })).toThrow();
  });
});
