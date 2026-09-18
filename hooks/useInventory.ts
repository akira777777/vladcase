import { useState, useEffect } from 'react';
import { Item } from '@/types';

export function useInventory() {
  const [inventory, setInventory] = useState<Item[]>([]);

  useEffect(() => {
    const savedInventory = localStorage.getItem('vladcase_inventory');
    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (e) {
        console.error("Failed to parse inventory", e);
      }
    }
  }, []);

  const addItem = (item: Item) => {
    setInventory(prev => {
      const newInventory = [...prev, item];
      localStorage.setItem('vladcase_inventory', JSON.stringify(newInventory));
      return newInventory;
    });
  };

  const removeItem = (itemId: string) => {
    setInventory(prev => {
      const newInventory = prev.filter(i => i.id !== itemId);
      localStorage.setItem('vladcase_inventory', JSON.stringify(newInventory));
      return newInventory;
    });
  };

  return { inventory, addItem, removeItem };
}
