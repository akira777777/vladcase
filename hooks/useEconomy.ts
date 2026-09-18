'use client';

import { useApp } from '@/context/AppContext';

export function useEconomy() {
  const {
    balance,
    xp,
    level,
    addBalance,
    deductBalance,
    addXp,
    resetEconomy,
    isLoaded,
  } = useApp();

  const updateBalance = (amount: number) => {
    addBalance(amount);
  };

  return {
    balance,
    xp,
    level,
    updateBalance,
    addBalance,
    deductBalance,
    addXp,
    resetEconomy,
    isLoaded,
  };
}
