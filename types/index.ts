export type Rarity = 
  | 'Consumer' 
  | 'Industrial' 
  | 'Mil-Spec' 
  | 'Restricted' 
  | 'Classified' 
  | 'Covert' 
  | 'Special Item';

export interface Item {
  id: string;
  name: string;
  weaponType: string; // e.g., 'AK-47', 'AWP', 'Knife', 'Glock-18', 'M4A4'
  image: string;
  rarity: Rarity;
  demoValue: number;
  dropChance: number; // weight or percentage
  instanceId?: string; // unique identifier per instance in user's inventory
  unboxedAt?: number;  // timestamp of unboxing
}

export interface Case {
  id: string;
  name: string;
  image: string;
  price: number;
  category: 'POPULAR' | 'NEW' | 'BUDGET' | 'PREMIUM' | 'KNIFE';
  description?: string;
  items: Item[];
}

export interface CaseHistoryEntry {
  caseId: string;
  caseName: string;
  item: Item;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  balance: number;
  xp: number;
  level: number;
  inventory: Item[];
  caseHistory: CaseHistoryEntry[];
}
