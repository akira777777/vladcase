import { Item, Case } from "../types";

export const ITEMS: Item[] = [
  // Special Items (Knives / Gloves)
  {
    id: "item-knife-doppler",
    name: "Karambit | Doppler Phase 2",
    weaponType: "Knife",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/Karambit_Doppler.png",
    rarity: "Special Item",
    demoValue: 1850.00,
    dropChance: 0.25,
  },
  {
    id: "item-knife-fade",
    name: "Butterfly Knife | Fade",
    weaponType: "Knife",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/Butterfly_Knife_Fade.png",
    rarity: "Special Item",
    demoValue: 3200.00,
    dropChance: 0.15,
  },
  {
    id: "item-awp-dragonlore",
    name: "AWP | Dragon Lore",
    weaponType: "AWP",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/AWP_Dragon_Lore.png",
    rarity: "Special Item",
    demoValue: 9500.00,
    dropChance: 0.05,
  },

  // Covert Items
  {
    id: "item-awp-asiimov",
    name: "AWP | Asiimov",
    weaponType: "AWP",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/AWP_Asiimov.png",
    rarity: "Covert",
    demoValue: 145.00,
    dropChance: 0.8,
  },
  {
    id: "item-ak-fire-serpent",
    name: "AK-47 | Fire Serpent",
    weaponType: "AK-47",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/AK-47_Fire_Serpent.png",
    rarity: "Covert",
    demoValue: 780.00,
    dropChance: 0.6,
  },
  {
    id: "item-m4-howl",
    name: "M4A4 | Howl",
    weaponType: "M4A4",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/M4A4_Howl.png",
    rarity: "Covert",
    demoValue: 4200.00,
    dropChance: 0.2,
  },
  {
    id: "item-m4-printstream",
    name: "M4A1-S | Printstream",
    weaponType: "M4A1-S",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/M4A1-S_Printstream.png",
    rarity: "Covert",
    demoValue: 310.00,
    dropChance: 1.2,
  },

  // Classified Items
  {
    id: "item-ak-neon-rider",
    name: "AK-47 | Neon Rider",
    weaponType: "AK-47",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/AK-47_Neon_Rider.png",
    rarity: "Classified",
    demoValue: 95.00,
    dropChance: 3.2,
  },
  {
    id: "item-usp-kill-confirmed",
    name: "USP-S | Kill Confirmed",
    weaponType: "Pistol",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/USP-S_Kill_Confirmed.png",
    rarity: "Classified",
    demoValue: 120.00,
    dropChance: 3.0,
  },
  {
    id: "item-awp-hyper-beast",
    name: "AWP | Hyper Beast",
    weaponType: "AWP",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/AWP_Hyper_Beast.png",
    rarity: "Classified",
    demoValue: 85.00,
    dropChance: 3.5,
  },

  // Restricted Items
  {
    id: "item-glock-water-elemental",
    name: "Glock-18 | Water Elemental",
    weaponType: "Pistol",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/Glock-18_Water_Elemental.png",
    rarity: "Restricted",
    demoValue: 24.50,
    dropChance: 12.0,
  },
  {
    id: "item-ak-redline",
    name: "AK-47 | Redline",
    weaponType: "AK-47",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/AK-47_Redline.png",
    rarity: "Restricted",
    demoValue: 32.00,
    dropChance: 10.0,
  },
  {
    id: "item-m4-desolate-space",
    name: "M4A4 | Desolate Space",
    weaponType: "M4A4",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/M4A4_Desolate_Space.png",
    rarity: "Restricted",
    demoValue: 19.00,
    dropChance: 14.0,
  },

  // Mil-Spec Items
  {
    id: "item-ak-slate",
    name: "AK-47 | Slate",
    weaponType: "AK-47",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/AK-47_Slate.png",
    rarity: "Mil-Spec",
    demoValue: 8.50,
    dropChance: 25.0,
  },
  {
    id: "item-usp-guardian",
    name: "USP-S | Guardian",
    weaponType: "Pistol",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/USP-S_Guardian.png",
    rarity: "Mil-Spec",
    demoValue: 6.20,
    dropChance: 28.0,
  },
  {
    id: "item-m4-magnesium",
    name: "M4A4 | Magnesium",
    weaponType: "M4A4",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/M4A4_Magnesium.png",
    rarity: "Mil-Spec",
    demoValue: 4.80,
    dropChance: 30.0,
  },

  // Industrial / Consumer Items
  {
    id: "item-p250-sanddune",
    name: "P250 | Sand Dune",
    weaponType: "Pistol",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/P250_Sand_Dune.png",
    rarity: "Consumer",
    demoValue: 0.85,
    dropChance: 45.0,
  },
  {
    id: "item-nova-sanddune",
    name: "Nova | Sand Dune",
    weaponType: "Shotgun",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/Nova_Sand_Dune.png",
    rarity: "Consumer",
    demoValue: 0.50,
    dropChance: 50.0,
  },
  {
    id: "item-mp9-sanddashed",
    name: "MP9 | Sand Dashed",
    weaponType: "SMG",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/MP9_Sand_Dashed.png",
    rarity: "Industrial",
    demoValue: 1.40,
    dropChance: 38.0,
  },
];

export const CASES: Case[] = [
  {
    id: "case-budget-starter",
    name: "Starter Recruit",
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/Recoil_Case.png",
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
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/Revolution_Case.png",
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
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/Kilowatt_Case.png",
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
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/Fracture_Case.png",
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
    image: "https://raw.githubusercontent.com/josh-eng/csgo-skin-images/master/images/Dreams_%26_Nightmares_Case.png",
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
];
