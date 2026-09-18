'use client';

import { useApp } from '@/context/AppContext';
import { Item } from '@/types';

export function useInventory() {
  const {
    inventory,
    addItem,
    removeItem,
    sellItem,
    sellAll,
    isLoaded,
  } = useApp();

  return {
    inventory,
    addItem,
    removeItem,
    sellItem,
    sellAll,
    isLoaded,
  };
}
