'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Case, CaseHistoryEntry } from '@/types';

interface AppContextType {
  balance: number;
  xp: number;
  level: number;
  inventory: Item[];
  history: CaseHistoryEntry[];
  isLoaded: boolean;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  addXp: (amount: number) => void;
  addItem: (item: Item, caseInfo?: { id: string; name: string }) => void;
  removeItem: (instanceId: string) => void;
  sellItem: (instanceId: string) => number;
  sellAll: () => number;
  resetEconomy: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(1000);
  const [xp, setXp] = useState<number>(0);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [history, setHistory] = useState<CaseHistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedBalance = localStorage.getItem('vladcase_balance');
      const savedXp = localStorage.getItem('vladcase_xp');
      const savedInventory = localStorage.getItem('vladcase_inventory');
      const savedHistory = localStorage.getItem('vladcase_history');

      if (savedBalance !== null) {
        const parsed = Number(savedBalance);
        if (!isNaN(parsed)) setBalance(parsed);
      }
      if (savedXp !== null) {
        const parsed = Number(savedXp);
        if (!isNaN(parsed)) setXp(parsed);
      }
      if (savedInventory !== null) {
        const parsed = JSON.parse(savedInventory);
        if (Array.isArray(parsed)) setInventory(parsed);
      }
      if (savedHistory !== null) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Level is derived deterministically from XP (1000 XP per level)
  const level = Math.floor(xp / 1000) + 1;

  const addBalance = (amount: number) => {
    setBalance(prev => {
      const next = Math.max(0, +(prev + amount).toFixed(2));
      localStorage.setItem('vladcase_balance', next.toString());
      return next;
    });
  };

  const deductBalance = (amount: number): boolean => {
    if (balance < amount) return false;
    setBalance(prev => {
      const next = Math.max(0, +(prev - amount).toFixed(2));
      localStorage.setItem('vladcase_balance', next.toString());
      return next;
    });
    return true;
  };

  const addXp = (amount: number) => {
    setXp(prev => {
      const next = prev + amount;
      localStorage.setItem('vladcase_xp', next.toString());
      return next;
    });
  };

  const addItem = (item: Item, caseInfo?: { id: string; name: string }) => {
    const itemWithMeta: Item = {
      ...item,
      instanceId: item.instanceId || `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      unboxedAt: item.unboxedAt || Date.now(),
    };

    setInventory(prev => {
      const next = [itemWithMeta, ...prev];
      localStorage.setItem('vladcase_inventory', JSON.stringify(next));
      return next;
    });

    if (caseInfo) {
      const newHistoryEntry: CaseHistoryEntry = {
        caseId: caseInfo.id,
        caseName: caseInfo.name,
        item: itemWithMeta,
        timestamp: Date.now(),
      };
      setHistory(prev => {
        const next = [newHistoryEntry, ...prev.slice(0, 19)];
        localStorage.setItem('vladcase_history', JSON.stringify(next));
        return next;
      });
    }
  };

  const removeItem = (instanceId: string) => {
    setInventory(prev => {
      const next = prev.filter(i => (i.instanceId || i.id) !== instanceId);
      localStorage.setItem('vladcase_inventory', JSON.stringify(next));
      return next;
    });
  };

  const sellItem = (instanceId: string): number => {
    const target = inventory.find(i => (i.instanceId || i.id) === instanceId);
    if (!target) return 0;

    const value = target.demoValue || 0;
    removeItem(instanceId);
    addBalance(value);
    return value;
  };

  const sellAll = (): number => {
    const totalValue = inventory.reduce((acc, curr) => acc + (curr.demoValue || 0), 0);
    setInventory([]);
    localStorage.setItem('vladcase_inventory', JSON.stringify([]));
    addBalance(totalValue);
    return totalValue;
  };

  const resetEconomy = () => {
    setBalance(1000);
    setXp(0);
    setInventory([]);
    setHistory([]);
    localStorage.removeItem('vladcase_balance');
    localStorage.removeItem('vladcase_xp');
    localStorage.removeItem('vladcase_inventory');
    localStorage.removeItem('vladcase_history');
  };

  return (
    <AppContext.Provider
      value={{
        balance,
        xp,
        level,
        inventory,
        history,
        isLoaded,
        addBalance,
        deductBalance,
        addXp,
        addItem,
        removeItem,
        sellItem,
        sellAll,
        resetEconomy,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
