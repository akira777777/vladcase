import { Case, Item } from "../types";

/**
 * Opens a case and returns the winning item based on weighted drop chances.
 * Also assigns a unique instanceId and unboxedAt timestamp.
 * @param caseData The case being opened.
 * @returns The winning Item object.
 */
export function openCase(caseData: Case): Item {
  const items = caseData.items;
  if (!items || items.length === 0) {
    throw new Error("Case contains no items");
  }
  
  const totalWeight = items.reduce((acc, item) => acc + (item.dropChance || 1), 0);
  const randomNum = Math.random() * totalWeight;
  
  let currentSum = 0;
  for (const item of items) {
    currentSum += (item.dropChance || 1);
    if (randomNum <= currentSum) {
      return {
        ...item,
        instanceId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        unboxedAt: Date.now(),
      };
    }
  }

  const lastItem = items[items.length - 1];
  return {
    ...lastItem,
    instanceId: `${lastItem.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    unboxedAt: Date.now(),
  };
}
