export function getRandomWeighted(items: { id: string; dropChance: number }[], totalWeight: number): string {
  const random = Math.random() * totalWeight;
  let currentSum = 0;

  for (const item of items) {
    currentSum += item.dropChance;
    if (random <= currentSum) {
      return item.id;
    }
  }

  return items[items.length - 1].id;
}
