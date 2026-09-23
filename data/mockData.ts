import { Item, Case } from "../types";

export const ITEMS: Item[] = [
  // Special Items (Knives / Gloves)
  {
    id: "item-knife-doppler",
    name: "Karambit | Doppler Phase 2",
    weaponType: "Knife",
    image: "/assets/item-knife-doppler.webp",
    rarity: "Special Item",
    demoValue: 1850.00,
    dropChance: 0.25,
  },
  {
    id: "item-knife-fade",
    name: "Butterfly Knife | Fade",
    weaponType: "Knife",
    image: "/assets/item-knife-fade.webp",
    rarity: "Special Item",
    demoValue: 3200.00,
    dropChance: 0.15,
  },
  {
    id: "item-awp-dragonlore",
    name: "AWP | Dragon Lore",
    weaponType: "AWP",
    image: "/assets/item-awp-dragonlore.webp",
    rarity: "Special Item",
    demoValue: 9500.00,
    dropChance: 0.05,
  },

  // Covert Items
  {
    id: "item-awp-asiimov",
    name: "AWP | Asiimov",
    weaponType: "AWP",
    image: "/assets/item-awp-asiimov.webp",
    rarity: "Covert",
    demoValue: 145.00,
    dropChance: 0.8,
  },
  {
    id: "item-ak-fire-serpent",
    name: "AK-47 | Fire Serpent",
    weaponType: "AK-47",
    image: "/assets/item-ak-fire-serpent.webp",
    rarity: "Covert",
    demoValue: 780.00,
    dropChance: 0.6,
  },
  {
    id: "item-m4-howl",
    name: "M4A4 | Howl",
    weaponType: "M4A4",
    image: "/assets/item-m4-howl.webp",
    rarity: "Covert",
    demoValue: 4200.00,
    dropChance: 0.2,
  },
  {
    id: "item-m4-printstream",
    name: "M4A1-S | Printstream",
    weaponType: "M4A1-S",
    image: "/assets/item-m4-printstream.webp",
    rarity: "Covert",
    demoValue: 310.00,
    dropChance: 1.2,
  },

  // Classified Items
  {
    id: "item-ak-neon-rider",
    name: "AK-47 | Neon Rider",
    weaponType: "AK-47",
    image: "/assets/item-ak-neon-rider.webp",
    rarity: "Classified",
    demoValue: 95.00,
    dropChance: 3.2,
  },
  {
    id: "item-usp-kill-confirmed",
    name: "USP-S | Kill Confirmed",
    weaponType: "Pistol",
    image: "/assets/item-usp-kill-confirmed.webp",
    rarity: "Classified",
    demoValue: 120.00,
    dropChance: 3.0,
  },
  {
    id: "item-awp-hyper-beast",
    name: "AWP | Hyper Beast",
    weaponType: "AWP",
    image: "/assets/item-awp-hyper-beast.webp",
    rarity: "Classified",
    demoValue: 85.00,
    dropChance: 3.5,
  },

  // Restricted Items
  {
    id: "item-glock-water-elemental",
    name: "Glock-18 | Water Elemental",
    weaponType: "Pistol",
    image: "/assets/item-glock-water-elemental.webp",
    rarity: "Restricted",
    demoValue: 24.50,
    dropChance: 12.0,
  },
  {
    id: "item-ak-redline",
    name: "AK-47 | Redline",
    weaponType: "AK-47",
    image: "/assets/item-ak-redline.webp",
    rarity: "Restricted",
    demoValue: 32.00,
    dropChance: 10.0,
  },
  {
    id: "item-m4-desolate-space",
    name: "M4A4 | Desolate Space",
    weaponType: "M4A4",
    image: "/assets/item-m4-desolate-space.webp",
    rarity: "Restricted",
    demoValue: 19.00,
    dropChance: 14.0,
  },

  // Mil-Spec Items
  {
    id: "item-ak-slate",
    name: "AK-47 | Slate",
    weaponType: "AK-47",
    image: "/assets/item-ak-slate.webp",
    rarity: "Mil-Spec",
    demoValue: 8.50,
    dropChance: 25.0,
  },
  {
    id: "item-usp-guardian",
    name: "USP-S | Guardian",
    weaponType: "Pistol",
    image: "/assets/item-usp-guardian.webp",
    rarity: "Mil-Spec",
    demoValue: 6.20,
    dropChance: 28.0,
  },
  {
    id: "item-m4-magnesium",
    name: "M4A4 | Magnesium",
    weaponType: "M4A4",
    image: "/assets/item-m4-magnesium.webp",
    rarity: "Mil-Spec",
    demoValue: 4.80,
    dropChance: 30.0,
  },

  // Industrial / Consumer Items
  {
    id: "item-p250-sanddune",
    name: "P250 | Sand Dune",
    weaponType: "Pistol",
    image: "/assets/item-p250-sanddune.webp",
    rarity: "Consumer",
    demoValue: 0.85,
    dropChance: 45.0,
  },
  {
    id: "item-nova-sanddune",
    name: "Nova | Sand Dune",
    weaponType: "Shotgun",
    image: "/assets/item-nova-sanddune.webp",
    rarity: "Consumer",
    demoValue: 0.50,
    dropChance: 50.0,
  },
  {
    id: "item-mp9-sanddashed",
    name: "MP9 | Sand Dashed",
    weaponType: "SMG",
    image: "/assets/item-mp9-sanddashed.webp",
    rarity: "Industrial",
    demoValue: 1.40,
    dropChance: 38.0,
  },
  // Fanservice & Contraband Expansions (Appended to preserve existing test indices)
  {
    id: "item-awp-gungnir",
    name: "AWP | Gungnir",
    weaponType: "AWP",
    image: "/assets/item-awp-gungnir.webp",
    rarity: "Special Item",
    demoValue: 8500.00,
    dropChance: 0.05,
  },
  {
    id: "item-knife-sapphire",
    name: "Butterfly Knife | Sapphire",
    weaponType: "Knife",
    image: "/assets/item-knife-sapphire.webp",
    rarity: "Special Item",
    demoValue: 4900.00,
    dropChance: 0.10,
  },
  {
    id: "item-aug-akihabara",
    name: "AUG | Akihabara Accept",
    weaponType: "Rifle",
    image: "/assets/item-aug-akihabara.webp",
    rarity: "Covert",
    demoValue: 2100.00,
    dropChance: 0.25,
  },
  {
    id: "item-m4-temukau",
    name: "M4A4 | Temukau",
    weaponType: "M4A4",
    image: "/assets/item-m4-temukau.webp",
    rarity: "Covert",
    demoValue: 340.00,
    dropChance: 0.90,
  },
  {
    id: "item-glock-bulletqueen",
    name: "Glock-18 | Bullet Queen",
    weaponType: "Pistol",
    image: "/assets/item-glock-bulletqueen.webp",
    rarity: "Covert",
    demoValue: 110.00,
    dropChance: 1.40,
  },
  {
    id: "item-deagle-printstream",
    name: "Desert Eagle | Printstream",
    weaponType: "Pistol",
    image: "/assets/item-deagle-printstream.webp",
    rarity: "Covert",
    demoValue: 180.00,
    dropChance: 1.80,
  },
];

export const CASES: Case[] = [
  {
    id: "case-budget-starter",
    name: "Starter Recruit",
    image: "/assets/case-budget-starter.webp",
    price: 15.00,
    category: "BUDGET",
    description: "Affordable starter case with solid entry-level finishes and a chance at Covert skins.",
    items: [
      ITEMS[16], // P250 Sand Dune (Consumer)
      ITEMS[17], // Nova Sand Dune (Consumer)
      ITEMS[18], // MP9 Sand Dashed (Industrial)
      ITEMS[13], // AK-47 Slate (Mil-Spec)
      ITEMS[14], // USP-S Guardian (Mil-Spec)
      ITEMS[10], // Glock Water Elemental (Restricted)
      ITEMS[3],  // AWP Asiimov (Covert)
    ],
  },
  {
    id: "case-ak-legends",
    name: "Kalashnikov Special",
    image: "/assets/case-ak-legends.webp",
    price: 65.00,
    category: "POPULAR",
    description: "Dedicated to the most iconic rifle in counter-strike history.",
    items: [
      ITEMS[13], // AK Slate (Mil-Spec)
      ITEMS[11], // AK Redline (Restricted)
      ITEMS[7],  // AK Neon Rider (Classified)
      ITEMS[4],  // AK Fire Serpent (Covert)
    ],
  },
  {
    id: "case-sniper-elite",
    name: "Sniper Elite",
    image: "/assets/case-sniper-elite.webp",
    price: 95.00,
    category: "POPULAR",
    description: "High velocity precision rifles including Asiimov, Hyper Beast and Dragon Lore.",
    items: [
      ITEMS[14], // USP Guardian (Mil-Spec)
      ITEMS[10], // Glock Water Elemental (Restricted)
      ITEMS[9],  // AWP Hyper Beast (Classified)
      ITEMS[3],  // AWP Asiimov (Covert)
      ITEMS[2],  // AWP Dragon Lore (Special)
    ],
  },
  {
    id: "case-covert-hunt",
    name: "Covert Arsenal",
    image: "/assets/case-covert-hunt.webp",
    price: 240.00,
    category: "PREMIUM",
    description: "Guaranteed high-tier drops from Classified to Covert masterpieces.",
    items: [
      ITEMS[7],  // AK Neon Rider (Classified)
      ITEMS[8],  // USP Kill Confirmed (Classified)
      ITEMS[6],  // M4A1-S Printstream (Covert)
      ITEMS[4],  // AK Fire Serpent (Covert)
      ITEMS[5],  // M4A4 Howl (Covert)
    ],
  },
  {
    id: "case-knife-hunt",
    name: "Doppler & Fade Knives",
    image: "/assets/case-knife-hunt.webp",
    price: 550.00,
    category: "KNIFE",
    description: "Exclusive case featuring the highest chance of unboxing rare Karambit and Butterfly knives.",
    items: [
      ITEMS[8],  // USP Kill Confirmed (Classified)
      ITEMS[6],  // M4A1-S Printstream (Covert)
      ITEMS[3],  // AWP Asiimov (Covert)
      ITEMS[0],  // Karambit Doppler (Special)
      ITEMS[1],  // Butterfly Knife Fade (Special)
    ],
  },
  {
    id: "case-fanservice-anime",
    name: "Waifu & Anime",
    image: "/assets/case-fanservice-anime.webp",
    price: 120.00,
    category: "FANSERVICE",
    description: "Cyberpunk kawaii aesthetics, top anime finishes, and the mythical Sapphire Butterfly Knife.",
    items: [
      ITEMS[10], // Glock Water Elemental
      ITEMS[7],  // AK Neon Rider
      ITEMS[9],  // AWP Hyper Beast
      ITEMS[24], // Desert Eagle Printstream
      ITEMS[23], // Glock Bullet Queen
      ITEMS[22], // M4A4 Temukau
      ITEMS[21], // AUG Akihabara Accept
      ITEMS[20], // Butterfly Sapphire
    ],
  },
  {
    id: "case-contraband-gods",
    name: "High Roller Vault",
    image: "/assets/case-contraband-gods.webp",
    price: 750.00,
    category: "PREMIUM",
    description: "Ultra-luxury tier containing AWP Gungnir, Dragon Lore, Howl, and rare Doppler knives.",
    items: [
      ITEMS[4],  // AK Fire Serpent
      ITEMS[5],  // M4 Howl
      ITEMS[0],  // Karambit Doppler
      ITEMS[1],  // Butterfly Fade
      ITEMS[20], // Butterfly Sapphire
      ITEMS[2],  // AWP Dragon Lore
      ITEMS[19], // AWP Gungnir
    ],
  },
];
