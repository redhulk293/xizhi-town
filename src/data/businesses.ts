import { BusinessDefinition } from '../types';

export const BUSINESS_DEFINITIONS: Record<string, BusinessDefinition> = {
  // ========================================================
  // SIZE 3 SHOPS (Low incomplete, Higher complete: $50,000)
  // ========================================================
  XZT: {
    id: 'XZT',
    code: 'XZT',
    name: 'Old Guild Teahouse',
    nameZh: '汐止百年老茶莊',
    category: 'Heritage',
    requiredTiles: 3,
    totalSupply: 7,
    incompleteIncomeByCount: [0, 10000, 20000],
    completeIncome: 50000,
    preferredDistrictId: 'A',
    iconName: 'Coffee',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    textColor: 'text-amber-400',
  },
  SFD: {
    id: 'SFD',
    code: 'SFD',
    name: 'Seafood Wharf & Docks',
    nameZh: '水產漁港與海味街',
    category: 'Culinary',
    requiredTiles: 3,
    totalSupply: 7,
    incompleteIncomeByCount: [0, 10000, 20000],
    completeIncome: 50000,
    requiredTag: 'waterfront',
    iconName: 'Anchor',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    textColor: 'text-sky-400',
  },
  HSM: {
    id: 'HSM',
    code: 'HSM',
    name: 'Hillside Mineral Springs',
    nameZh: '文山景觀溫泉山莊',
    category: 'Hospitality',
    requiredTiles: 3,
    totalSupply: 6,
    incompleteIncomeByCount: [0, 10000, 20000],
    completeIncome: 50000,
    requiredTag: 'terrace',
    iconName: 'Mountain',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    textColor: 'text-emerald-400',
  },

  // ========================================================
  // SIZE 4 SHOPS (Low incomplete, Higher complete: $70,000)
  // ========================================================
  XFC: {
    id: 'XFC',
    code: 'XFC',
    name: 'Heritage Night Market',
    nameZh: '中正觀光夜市商圈',
    category: 'Culinary',
    requiredTiles: 4,
    totalSupply: 8,
    incompleteIncomeByCount: [0, 10000, 20000, 30000],
    completeIncome: 70000,
    requiredTag: 'alley',
    iconName: 'Store',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    textColor: 'text-orange-400',
  },
  CPE: {
    id: 'CPE',
    code: 'CPE',
    name: 'Central Plaza Emporium',
    nameZh: '市政百貨購物商場',
    category: 'Retail',
    requiredTiles: 4,
    totalSupply: 8,
    incompleteIncomeByCount: [0, 10000, 20000, 30000],
    completeIncome: 70000,
    requiredTag: 'plaza',
    iconName: 'ShoppingBag',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    textColor: 'text-violet-400',
  },
  RVL: {
    id: 'RVL',
    code: 'RVL',
    name: 'River Freight Logistics',
    nameZh: '基隆河內河貨運倉儲',
    category: 'Industry',
    requiredTiles: 4,
    totalSupply: 8,
    incompleteIncomeByCount: [0, 10000, 20000, 30000],
    completeIncome: 70000,
    requiredTag: 'waterfront',
    iconName: 'Truck',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    textColor: 'text-cyan-400',
  },

  // ========================================================
  // SIZE 5 SHOPS (Low incomplete, Higher complete: $100,000)
  // ========================================================
  TPD: {
    id: 'TPD',
    code: 'TPD',
    name: 'Tech & Precision Depot',
    nameZh: '大同精密科技園區',
    category: 'Industry',
    requiredTiles: 5,
    totalSupply: 10,
    incompleteIncomeByCount: [0, 10000, 20000, 30000, 40000],
    completeIncome: 100000,
    preferredDistrictId: 'D',
    iconName: 'Cpu',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    textColor: 'text-slate-300',
  },
  XTR: {
    id: 'XTR',
    code: 'XTR',
    name: 'Xizhi Transit Junction',
    nameZh: '汐止車站共構商城',
    category: 'Transit',
    requiredTiles: 5,
    totalSupply: 10,
    incompleteIncomeByCount: [0, 10000, 20000, 30000, 40000],
    completeIncome: 100000,
    requiredTag: 'transit',
    iconName: 'Train',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    textColor: 'text-rose-400',
  },

  // ========================================================
  // SIZE 6 SHOPS (Moderate incomplete, High complete: $140,000)
  // ========================================================
  XZD: {
    id: 'XZD',
    code: 'XZD',
    name: 'Datong Heavy Machinery',
    nameZh: '汐止重工機械廠',
    category: 'Industry',
    requiredTiles: 6,
    totalSupply: 11,
    incompleteIncomeByCount: [0, 12000, 25000, 40000, 60000, 80000],
    completeIncome: 140000,
    preferredDistrictId: 'D',
    iconName: 'Wrench',
    badgeColor: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
    textColor: 'text-amber-400',
  },
  BCA: {
    id: 'BCA',
    code: 'BCA',
    name: 'Baozhong Amphitheater',
    nameZh: '保長河岸音樂演藝中心',
    category: 'Entertainment',
    requiredTiles: 6,
    totalSupply: 11,
    incompleteIncomeByCount: [0, 12000, 25000, 40000, 60000, 80000],
    completeIncome: 140000,
    requiredTag: 'entertainment',
    iconName: 'Music',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    textColor: 'text-pink-400',
  },

  // ========================================================
  // SIZE 7 SHOPS (Moderate incomplete, Very High complete: $190,000)
  // ========================================================
  XCB: {
    id: 'XCB',
    code: 'XCB',
    name: 'Commercial Bank & Trust',
    nameZh: '汐止商業金融信託銀行',
    category: 'Finance',
    requiredTiles: 7,
    totalSupply: 12,
    incompleteIncomeByCount: [0, 15000, 30000, 50000, 75000, 105000, 140000],
    completeIncome: 190000,
    requiredTag: 'plaza',
    iconName: 'Landmark',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    textColor: 'text-yellow-400',
  },

  // ========================================================
  // SIZE 8 SHOPS (High incomplete, HIGHEST complete: $260,000)
  // ========================================================
  KMG: {
    id: 'KMG',
    code: 'KMG',
    name: 'Keelung River Mega-Harbor',
    nameZh: '基隆河港國際物流巨擘',
    category: 'Industry',
    requiredTiles: 8,
    totalSupply: 14,
    incompleteIncomeByCount: [0, 20000, 40000, 65000, 95000, 130000, 170000, 215000],
    completeIncome: 260000,
    requiredTag: 'waterfront',
    iconName: 'Ship',
    badgeColor: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
    textColor: 'text-blue-400',
  },
};

// Deterministic Mulberry32 Pseudo-Random Number Generator
export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic Fisher-Yates shuffle
export function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate the finite pool of all business tiles for a game using PRNG
export function generateTileSupplyBag(rng: () => number): { id: string; businessTypeId: string }[] {
  const bag: { id: string; businessTypeId: string }[] = [];
  let index = 1;

  for (const def of Object.values(BUSINESS_DEFINITIONS)) {
    for (let i = 0; i < def.totalSupply; i++) {
      bag.push({
        id: `tile_${def.code}_${i + 1}_${index++}`,
        businessTypeId: def.id,
      });
    }
  }

  return seededShuffle(bag, rng);
}
