import { Case, Item } from "../types";
import { getRandomWeighted } from "./utils";

/**
 * Opens a case and returns the winning item based on weighted drop chances.
 * @param caseData The case being opened.
 * @returns The winning Item object.
 */
export function openCase(caseData: Case): Item {
  const items = caseData.items;
  
  // Calculate total weight of all items in the case
  const totalWeight = items.reduce((acc, item) => acc + item.dropChance, 0);
  
  // Pick a random number between 0 and totalWeight
  const randomNum = Math.random() * totalWeight;
  
  let currentSum = 0;
  for (const item of items) {
    currentSum += item.dropChance;
    if (randomNum <= currentSum) {
      return item;
    }
  }

  // Fallback to the last item if for some reason the loop completes
  return items[items.length - 1];
}
