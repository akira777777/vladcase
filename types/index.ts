export type Rarity = 'Consumer' | 'Industrial' | 'Mil-Spec' | 'Restricted' | 'Classified' | 'Covert' | 'Special Item';

export interface Item {
  id: string;
  name: string;
  weaponType: string; // e.g., 'AK-47', 'AWP', 'Knife'
  image: string;
  rarity: Rarity;
  demoValue: number;
  dropChance: number; // 0 to 100
}

export interface Case {
  id: string;
  name: string;
  image: string;
  price: number;
  category: 'POPULAR' | 'NEW' | 'BUDGET' | 'PREMIUM' | 'KNIFE';
  items: Item[];
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  credits: number;
  xp: number;
  level: number;
  inventory: Item[];
  caseHistory: {
    caseId: string;
    itemId: string;
    timestamp: number;
    value: number;
  }[];
  achievements: string[];
}
