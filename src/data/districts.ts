import { District, LotDefinition, GeographicTag } from '../types';

export const DISTRICTS: Record<string, District> = {
  A: {
    id: 'A',
    name: 'Old Town Heritage',
    nameZh: '老街歷史街區',
    color: '#d97706', // Amber-600
    description: 'Dense, irregular brick alleys, heritage streetfronts, and traditional storefronts.',
    accentClass: 'border-amber-500 bg-amber-950/40 text-amber-400',
  },
  B: {
    id: 'B',
    name: 'Market Quarter',
    nameZh: '中正傳統市集區',
    color: '#ea580c', // Orange-600
    description: 'Small commercial lots, lively pedestrian bazaars, and night market food stalls.',
    accentClass: 'border-orange-500 bg-orange-950/40 text-orange-400',
  },
  C: {
    id: 'C',
    name: 'Riverside Wharves',
    nameZh: '基隆河畔碼頭區',
    color: '#0284c7', // Sky-600
    description: 'Waterfront berths, boardwalks, piers, and river freight docks along Keelung River.',
    accentClass: 'border-sky-500 bg-sky-950/40 text-sky-400',
  },
  D: {
    id: 'D',
    name: 'Industrial Quarter',
    nameZh: '大同產業廊帶',
    color: '#64748b', // Slate-500
    description: 'Spacious industrial rail yards, warehouses, assembly plants, and wide freight avenues.',
    accentClass: 'border-slate-500 bg-slate-900/60 text-slate-300',
  },
  E: {
    id: 'E',
    name: 'Residential Terraces',
    nameZh: '文山景觀梯台區',
    color: '#059669', // Emerald-600
    description: 'Elevated green hillside parcels with quiet residential streets, parks, and tea groves.',
    accentClass: 'border-emerald-500 bg-emerald-950/40 text-emerald-400',
  },
  F: {
    id: 'F',
    name: 'Entertainment & Station',
    nameZh: '汐止車站站前商圈',
    color: '#e11d48', // Rose-600
    description: 'Central commuter rail terminal, bustling diagonal retail avenues, and illuminated plazas.',
    accentClass: 'border-rose-500 bg-rose-950/40 text-rose-400',
  },
  // Expanded for Large Town (6-8 Players / 192 lots)
  G: {
    id: 'G',
    name: 'Baozhong Cultural Basin',
    nameZh: '保長文娛觀光特區',
    color: '#ec4899', // Pink-500
    description: 'Riverside amphitheater arcades, theater avenues, arts plazas, and night festivals.',
    accentClass: 'border-pink-500 bg-pink-950/40 text-pink-400',
  },
  H: {
    id: 'H',
    name: 'Financial Heights',
    nameZh: '香山金融高階特區',
    color: '#ca8a04', // Yellow-600
    description: 'Hillside corporate plazas, executive towers, commercial trusts, and banking institutes.',
    accentClass: 'border-yellow-500 bg-yellow-950/40 text-yellow-400',
  },
};

// Pad number to 3-digit string ('001', '014', '063', etc.)
export function formatLotId(num: number): string {
  return num.toString().padStart(3, '0');
}

// Generate the 192 stable, physical parcels of Xizhi Town
// Small Town uses Lots 001 - 120 (Districts A to F)
// Large Town uses Lots 001 - 192 (Districts A to H)
function generateAllTownLots(): LotDefinition[] {
  const lots: LotDefinition[] = [];

  // =======================================================================
  // DISTRICT A: Old Town Heritage (Lots 001 - 020)
  // Characteristic: Dense, irregular brick alleys, varying parcel widths
  // Area: x: 80 - 620, y: 140 - 460
  // =======================================================================
  const oldTownConfigs: {
    num: number;
    x: number;
    y: number;
    w: number;
    h: number;
    tags: GeographicTag[];
    name: string;
  }[] = [
    // Block 1 (North Heritage Lane)
    { num: 1, x: 90, y: 150, w: 75, h: 65, tags: ['corner', 'alley'], name: 'Heritage Archway Corner' },
    { num: 2, x: 175, y: 150, w: 65, h: 65, tags: ['alley'], name: 'Old Tea Merchants Lane' },
    { num: 3, x: 250, y: 150, w: 80, h: 65, tags: ['alley'], name: 'Ancestral Temple Alley' },
    { num: 4, x: 340, y: 150, w: 70, h: 65, tags: ['alley'], name: 'Red Brick Guild Hall' },
    { num: 5, x: 420, y: 150, w: 85, h: 65, tags: ['corner', 'alley'], name: 'Northgate Watchpoint' },

    // Block 2 (Central Market Alley)
    { num: 6, x: 90, y: 225, w: 80, h: 65, tags: ['alley'], name: 'Artisan Pottery Row' },
    { num: 7, x: 180, y: 225, w: 65, h: 65, tags: ['alley'], name: 'Silversmith Lane' },
    { num: 8, x: 255, y: 225, w: 70, h: 65, tags: ['alley'], name: 'Old Town Central Yard' },
    { num: 9, x: 335, y: 225, w: 75, h: 65, tags: ['alley'], name: 'Apothecary Crossing' },
    { num: 10, x: 420, y: 225, w: 85, h: 65, tags: ['corner', 'alley'], name: 'Old East Gate Post' },

    // Block 3 (Narrow South Alley)
    { num: 11, x: 90, y: 300, w: 70, h: 70, tags: ['corner', 'alley'], name: 'Cobblestone Passage West' },
    { num: 12, x: 170, y: 300, w: 75, h: 70, tags: ['alley'], name: 'Lantern Weaver Passage' },
    { num: 13, x: 255, y: 300, w: 75, h: 70, tags: ['alley'], name: 'Historic Pavilion Lot' },
    { num: 14, x: 340, y: 300, w: 70, h: 70, tags: ['alley'], name: 'Bonsai Garden Yard' },
    { num: 15, x: 420, y: 300, w: 85, h: 70, tags: ['corner', 'alley'], name: 'Stone Bridge Gateway' },

    // Block 4 (Southern Heritage Edge)
    { num: 16, x: 90, y: 380, w: 75, h: 65, tags: ['corner', 'alley'], name: 'Old Canal Wharf Entry' },
    { num: 17, x: 175, y: 380, w: 70, h: 65, tags: ['alley'], name: 'Timber Guild Row' },
    { num: 18, x: 255, y: 380, w: 70, h: 65, tags: ['alley'], name: 'Weavers Lane South' },
    { num: 19, x: 335, y: 380, w: 75, h: 65, tags: ['alley'], name: 'Old Grain Depository' },
    { num: 20, x: 420, y: 380, w: 85, h: 65, tags: ['corner', 'plaza'], name: 'Old Town Plaza Corner' },
  ];

  for (const c of oldTownConfigs) {
    const id = formatLotId(c.num);
    const poly: [number, number][] = [
      [c.x, c.y],
      [c.x + c.w, c.y],
      [c.x + c.w, c.y + c.h],
      [c.x, c.y + c.h],
    ];
    lots.push({
      id,
      districtId: 'A',
      number: c.num,
      name: `Lot ${id} • ${c.name}`,
      tags: c.tags,
      polygon: poly,
      labelPos: [c.x + c.w / 2, c.y + c.h / 2],
      adjacentLotIds: [],
    });
  }

  // =======================================================================
  // DISTRICT B: Market Quarter (Lots 021 - 040)
  // Characteristic: Small commercial lots, pedestrian bazaar streets
  // Area: x: 550 - 1050, y: 140 - 460
  // =======================================================================
  const marketConfigs: {
    num: number;
    x: number;
    y: number;
    w: number;
    h: number;
    tags: GeographicTag[];
    name: string;
  }[] = [
    { num: 21, x: 550, y: 150, w: 65, h: 65, tags: ['corner', 'alley'], name: 'Night Market Entrance' },
    { num: 22, x: 625, y: 150, w: 60, h: 65, tags: ['alley'], name: 'Herbal Tea Stall Row' },
    { num: 23, x: 695, y: 150, w: 65, h: 65, tags: ['alley'], name: 'Spicy Noodle Alley' },
    { num: 24, x: 770, y: 150, w: 60, h: 65, tags: ['alley'], name: 'Steamed Bun Bazaar' },
    { num: 25, x: 840, y: 150, w: 75, h: 65, tags: ['corner', 'plaza'], name: 'Market Central Plaza' },

    { num: 26, x: 550, y: 225, w: 65, h: 65, tags: ['alley'], name: 'Fresh Produce Arcade' },
    { num: 27, x: 625, y: 225, w: 60, h: 65, tags: ['alley'], name: 'Poultry & Meat Guild' },
    { num: 28, x: 695, y: 225, w: 65, h: 65, tags: ['alley'], name: 'Fishmonger Crossing' },
    { num: 29, x: 770, y: 225, w: 60, h: 65, tags: ['alley'], name: 'Exotic Spice Stand' },
    { num: 30, x: 840, y: 225, w: 75, h: 65, tags: ['corner', 'alley'], name: 'Market East Walk' },

    { num: 31, x: 550, y: 300, w: 65, h: 70, tags: ['corner', 'alley'], name: 'Textile Bazaar West' },
    { num: 32, x: 625, y: 300, w: 60, h: 70, tags: ['alley'], name: 'Garment Merchant Lane' },
    { num: 33, x: 695, y: 300, w: 65, h: 70, tags: ['alley'], name: 'Shoemaker Corridor' },
    { num: 34, x: 770, y: 300, w: 60, h: 70, tags: ['alley'], name: 'Brassware & Hardware' },
    { num: 35, x: 840, y: 300, w: 75, h: 70, tags: ['corner', 'plaza'], name: 'Market Food Court Hub' },

    { num: 36, x: 550, y: 380, w: 65, h: 65, tags: ['corner', 'alley'], name: 'Sweet Rice Dessert Row' },
    { num: 37, x: 625, y: 380, w: 60, h: 65, tags: ['alley'], name: 'Fried Delicacy Corner' },
    { num: 38, x: 695, y: 380, w: 65, h: 65, tags: ['alley'], name: 'Ice & Fruit Arcade' },
    { num: 39, x: 770, y: 380, w: 60, h: 65, tags: ['alley'], name: 'Night Market Souvenirs' },
    { num: 40, x: 840, y: 380, w: 75, h: 65, tags: ['corner', 'plaza'], name: 'Bazaar Gateway South' },
  ];

  for (const c of marketConfigs) {
    const id = formatLotId(c.num);
    const poly: [number, number][] = [
      [c.x, c.y],
      [c.x + c.w, c.y],
      [c.x + c.w, c.y + c.h],
      [c.x, c.y + c.h],
    ];
    lots.push({
      id,
      districtId: 'B',
      number: c.num,
      name: `Lot ${id} • ${c.name}`,
      tags: c.tags,
      polygon: poly,
      labelPos: [c.x + c.w / 2, c.y + c.h / 2],
      adjacentLotIds: [],
    });
  }

  // =======================================================================
  // DISTRICT C: Riverside Wharves (Lots 041 - 060)
  // Characteristic: Waterfront lots, piers along river curve, bridges
  // Area: x: 960 - 1500, y: 140 - 460 (River curve along y: 60 - 140)
  // =======================================================================
  const riverConfigs: {
    num: number;
    x: number;
    y: number;
    w: number;
    h: number;
    tags: GeographicTag[];
    name: string;
  }[] = [
    { num: 41, x: 960, y: 150, w: 85, h: 65, tags: ['waterfront', 'corner'], name: 'Pier 1 Fisherman Dock' },
    { num: 42, x: 1055, y: 150, w: 90, h: 65, tags: ['waterfront'], name: 'Pier 2 Oyster Wharf' },
    { num: 43, x: 1155, y: 150, w: 85, h: 65, tags: ['waterfront'], name: 'Pier 3 Cargo Slipway' },
    { num: 44, x: 1250, y: 150, w: 90, h: 65, tags: ['waterfront'], name: 'Pier 4 Keelung Ferry Basin' },
    { num: 45, x: 1350, y: 150, w: 95, h: 65, tags: ['waterfront', 'corner'], name: 'East Harbor Marina Quay' },

    { num: 46, x: 960, y: 225, w: 85, h: 65, tags: ['waterfront'], name: 'Fish Packing Depot' },
    { num: 47, x: 1055, y: 225, w: 90, h: 65, tags: ['waterfront'], name: 'Salt & Ice Cold Storage' },
    { num: 48, x: 1155, y: 225, w: 85, h: 65, tags: ['waterfront'], name: 'Boatwright Drydock Yard' },
    { num: 49, x: 1250, y: 225, w: 90, h: 65, tags: ['waterfront'], name: 'Net & Rigging Loft' },
    { num: 50, x: 1350, y: 225, w: 95, h: 65, tags: ['waterfront', 'corner'], name: 'Riverfront Customs Bureau' },

    { num: 51, x: 960, y: 300, w: 85, h: 70, tags: ['waterfront'], name: 'Wharfside Seafood Tavern' },
    { num: 52, x: 1055, y: 300, w: 90, h: 70, tags: ['waterfront'], name: 'Riverview Boardwalk Arc' },
    { num: 53, x: 1155, y: 300, w: 85, h: 70, tags: ['waterfront', 'plaza'], name: 'Riverside Amphitheater Wharf' },
    { num: 54, x: 1250, y: 300, w: 90, h: 70, tags: ['waterfront'], name: 'Anchor Way Crossing' },
    { num: 55, x: 1350, y: 300, w: 95, h: 70, tags: ['waterfront', 'corner'], name: 'Tide Gauge Observation Post' },

    { num: 56, x: 960, y: 380, w: 85, h: 65, tags: ['waterfront', 'corner'], name: 'Canal Lock Gatehouse' },
    { num: 57, x: 1055, y: 380, w: 90, h: 65, tags: ['waterfront'], name: 'River Barge Anchorage' },
    { num: 58, x: 1155, y: 380, w: 85, h: 65, tags: ['waterfront'], name: 'South Embankment Yard' },
    { num: 59, x: 1250, y: 380, w: 90, h: 65, tags: ['waterfront'], name: 'Waterway Tugboat Station' },
    { num: 60, x: 1350, y: 380, w: 95, h: 65, tags: ['waterfront', 'corner'], name: 'River Bridge Toll Plaza' },
  ];

  for (const c of riverConfigs) {
    const id = formatLotId(c.num);
    const poly: [number, number][] = [
      [c.x, c.y],
      [c.x + c.w, c.y],
      [c.x + c.w, c.y + c.h],
      [c.x, c.y + c.h],
    ];
    lots.push({
      id,
      districtId: 'C',
      number: c.num,
      name: `Lot ${id} • ${c.name}`,
      tags: c.tags,
      polygon: poly,
      labelPos: [c.x + c.w / 2, c.y + c.h / 2],
      adjacentLotIds: [],
    });
  }

  // =======================================================================
  // DISTRICT D: Industrial Quarter (Lots 061 - 080)
  // Characteristic: Large parcels, railway spurs, wide trucking lanes
  // Area: x: 90 - 620, y: 520 - 840
  // =======================================================================
  const indConfigs: {
    num: number;
    x: number;
    y: number;
    w: number;
    h: number;
    tags: GeographicTag[];
    name: string;
  }[] = [
    { num: 61, x: 90, y: 530, w: 95, h: 65, tags: ['corner'], name: 'Datong Rail Spur Entry' },
    { num: 62, x: 195, y: 530, w: 95, h: 65, tags: ['standard'], name: 'Heavy Machinery Assembly 1' },
    { num: 63, x: 300, y: 530, w: 100, h: 65, tags: ['standard'], name: 'Precision Motors Complex' },
    { num: 64, x: 410, y: 530, w: 100, h: 65, tags: ['corner'], name: 'Raw Material Storage Yard' },
    { num: 65, x: 520, y: 530, w: 85, h: 65, tags: ['corner'], name: 'Industrial Rail Junction' },

    { num: 66, x: 90, y: 605, w: 95, h: 65, tags: ['standard'], name: 'Foundry & Smelting Works' },
    { num: 67, x: 195, y: 605, w: 95, h: 65, tags: ['standard'], name: 'Automated Press Workshop' },
    { num: 68, x: 300, y: 605, w: 100, h: 65, tags: ['standard'], name: 'Electronics Assembly Line' },
    { num: 69, x: 410, y: 605, w: 100, h: 65, tags: ['standard'], name: 'Testing & Certification Lab' },
    { num: 70, x: 520, y: 605, w: 85, h: 65, tags: ['corner'], name: 'Substation & Power Plant' },

    { num: 71, x: 90, y: 680, w: 95, h: 70, tags: ['standard'], name: 'Heavy Freight Depot North' },
    { num: 72, x: 195, y: 680, w: 95, h: 70, tags: ['standard'], name: 'Chemical Treatment Tank Yard' },
    { num: 73, x: 300, y: 680, w: 100, h: 70, tags: ['standard'], name: 'Industrial Boiler House' },
    { num: 74, x: 410, y: 680, w: 100, h: 70, tags: ['standard'], name: 'Container Staging Ground' },
    { num: 75, x: 520, y: 680, w: 85, h: 70, tags: ['corner'], name: 'Freight Marshalling Yard' },

    { num: 76, x: 90, y: 760, w: 95, h: 65, tags: ['corner'], name: 'Truck Fleet Depot' },
    { num: 77, x: 195, y: 760, w: 95, h: 65, tags: ['standard'], name: 'Steel Fabrication Shop' },
    { num: 78, x: 300, y: 760, w: 100, h: 65, tags: ['standard'], name: 'Logistics Warehouse West' },
    { num: 79, x: 410, y: 760, w: 100, h: 65, tags: ['standard'], name: 'Export Packaging Facility' },
    { num: 80, x: 520, y: 760, w: 85, h: 65, tags: ['corner'], name: 'Industrial Gate & Scalehouse' },
  ];

  for (const c of indConfigs) {
    const id = formatLotId(c.num);
    const poly: [number, number][] = [
      [c.x, c.y],
      [c.x + c.w, c.y],
      [c.x + c.w, c.y + c.h],
      [c.x, c.y + c.h],
    ];
    lots.push({
      id,
      districtId: 'D',
      number: c.num,
      name: `Lot ${id} • ${c.name}`,
      tags: c.tags,
      polygon: poly,
      labelPos: [c.x + c.w / 2, c.y + c.h / 2],
      adjacentLotIds: [],
    });
  }

  // =======================================================================
  // DISTRICT E: Residential & Foothill Terraces (Lots 081 - 100)
  // Characteristic: Terraced hillside contours, garden paths, green parks
  // Area: x: 650 - 1100, y: 520 - 840
  // =======================================================================
  const resConfigs: {
    num: number;
    x: number;
    y: number;
    w: number;
    h: number;
    tags: GeographicTag[];
    name: string;
  }[] = [
    { num: 81, x: 650, y: 530, w: 80, h: 65, tags: ['terrace', 'corner'], name: 'Wenshan Foothill Path Entry' },
    { num: 82, x: 740, y: 530, w: 80, h: 65, tags: ['terrace'], name: 'Terrace Tea Plantation 1' },
    { num: 83, x: 830, y: 530, w: 85, h: 65, tags: ['terrace'], name: 'Mineral Spring Wellspring' },
    { num: 84, x: 925, y: 530, w: 80, h: 65, tags: ['terrace'], name: 'Pine Garden Estate North' },
    { num: 85, x: 1015, y: 530, w: 80, h: 65, tags: ['terrace', 'corner'], name: 'Overlook Ridge Viewpoint' },

    { num: 86, x: 650, y: 605, w: 80, h: 65, tags: ['terrace'], name: 'Hillside Hot Spring Inn' },
    { num: 87, x: 740, y: 605, w: 80, h: 65, tags: ['terrace'], name: 'Camellia Terrace Gardens' },
    { num: 88, x: 830, y: 605, w: 85, h: 65, tags: ['terrace'], name: 'Stone Fountain Plaza' },
    { num: 89, x: 925, y: 605, w: 80, h: 65, tags: ['terrace'], name: 'Bamboo Grove Retreat' },
    { num: 90, x: 1015, y: 605, w: 80, h: 65, tags: ['terrace', 'corner'], name: 'East Ridge Promenade' },

    { num: 91, x: 650, y: 680, w: 80, h: 70, tags: ['terrace'], name: 'Serene Residential Court' },
    { num: 92, x: 740, y: 680, w: 80, h: 70, tags: ['terrace'], name: 'Orchard Hill Villas' },
    { num: 93, x: 830, y: 680, w: 85, h: 70, tags: ['terrace', 'plaza'], name: 'Hilltop Community Hall' },
    { num: 94, x: 925, y: 680, w: 80, h: 70, tags: ['terrace'], name: 'Terrace Tea Tasting House' },
    { num: 95, x: 1015, y: 680, w: 80, h: 70, tags: ['terrace', 'corner'], name: 'Summit Spring Pavilion' },

    { num: 96, x: 650, y: 760, w: 80, h: 65, tags: ['terrace', 'corner'], name: 'Valley Brook Footbridge' },
    { num: 97, x: 740, y: 760, w: 80, h: 65, tags: ['terrace'], name: 'Cedar Wood Residence' },
    { num: 98, x: 830, y: 760, w: 85, h: 65, tags: ['terrace'], name: 'Moss Garden Sanctuary' },
    { num: 99, x: 925, y: 760, w: 80, h: 65, tags: ['terrace'], name: 'Foothill Stargazing Deck' },
    { num: 100, x: 1015, y: 760, w: 80, h: 65, tags: ['terrace', 'corner'], name: 'Wenshan Summit Gate' },
  ];

  for (const c of resConfigs) {
    const id = formatLotId(c.num);
    const poly: [number, number][] = [
      [c.x, c.y],
      [c.x + c.w, c.y],
      [c.x + c.w, c.y + c.h],
      [c.x, c.y + c.h],
    ];
    lots.push({
      id,
      districtId: 'E',
      number: c.num,
      name: `Lot ${id} • ${c.name}`,
      tags: c.tags,
      polygon: poly,
      labelPos: [c.x + c.w / 2, c.y + c.h / 2],
      adjacentLotIds: [],
    });
  }

  // =======================================================================
  // DISTRICT F: Entertainment & Station (Lots 101 - 120)
  // Characteristic: Transit hub, commuter concourses, illuminated plazas
  // Area: x: 1140 - 1580, y: 520 - 840
  // =======================================================================
  const statConfigs: {
    num: number;
    x: number;
    y: number;
    w: number;
    h: number;
    tags: GeographicTag[];
    name: string;
  }[] = [
    { num: 101, x: 1140, y: 530, w: 80, h: 65, tags: ['transit', 'corner'], name: 'Station North Gate Terminal' },
    { num: 102, x: 1230, y: 530, w: 80, h: 65, tags: ['transit'], name: 'Commuter Railway Concourse' },
    { num: 103, x: 1320, y: 530, w: 80, h: 65, tags: ['transit', 'plaza'], name: 'Grand Transit Clocktower Plaza' },
    { num: 104, x: 1410, y: 530, w: 80, h: 65, tags: ['transit'], name: 'High-Speed Rail Interchange' },
    { num: 105, x: 1500, y: 530, w: 80, h: 65, tags: ['transit', 'corner'], name: 'East Station Bus Terminal' },

    { num: 106, x: 1140, y: 605, w: 80, h: 65, tags: ['entertainment'], name: 'Neon Arcade Alley West' },
    { num: 107, x: 1230, y: 605, w: 80, h: 65, tags: ['entertainment'], name: 'Cinema & Grand Theater Lot' },
    { num: 108, x: 1320, y: 605, w: 80, h: 65, tags: ['entertainment', 'plaza'], name: 'Central Neon Fountain Plaza' },
    { num: 109, x: 1410, y: 605, w: 80, h: 65, tags: ['entertainment'], name: 'Karaoke & Entertainment Tower' },
    { num: 110, x: 1500, y: 605, w: 80, h: 65, tags: ['entertainment', 'corner'], name: 'Station Night Bazaar Arcade' },

    { num: 111, x: 1140, y: 680, w: 80, h: 70, tags: ['plaza'], name: 'Commercial Plaza West Front' },
    { num: 112, x: 1230, y: 680, w: 80, h: 70, tags: ['plaza'], name: 'Department Store Anchor 1' },
    { num: 113, x: 1320, y: 680, w: 80, h: 70, tags: ['plaza'], name: 'Atrium Glass Dome Emporium' },
    { num: 114, x: 1410, y: 680, w: 80, h: 70, tags: ['plaza'], name: 'Fashion Galleria Anchor 2' },
    { num: 115, x: 1500, y: 680, w: 80, h: 70, tags: ['plaza', 'corner'], name: 'Plaza South Boulevard Wing' },

    { num: 116, x: 1140, y: 760, w: 80, h: 65, tags: ['transit', 'corner'], name: 'Underground Metro Link' },
    { num: 117, x: 1230, y: 760, w: 80, h: 65, tags: ['transit'], name: 'Bicycle & Taxi Plaza' },
    { num: 118, x: 1320, y: 760, w: 80, h: 65, tags: ['plaza'], name: 'Station South Lawn Park' },
    { num: 119, x: 1410, y: 760, w: 80, h: 65, tags: ['entertainment'], name: 'Bowling & Billiards Arena' },
    { num: 120, x: 1500, y: 760, w: 80, h: 65, tags: ['entertainment', 'corner'], name: 'Grand Boulevard Gateway' },
  ];

  for (const c of statConfigs) {
    const id = formatLotId(c.num);
    const poly: [number, number][] = [
      [c.x, c.y],
      [c.x + c.w, c.y],
      [c.x + c.w, c.y + c.h],
      [c.x, c.y + c.h],
    ];
    lots.push({
      id,
      districtId: 'F',
      number: c.num,
      name: `Lot ${id} • ${c.name}`,
      tags: c.tags,
      polygon: poly,
      labelPos: [c.x + c.w / 2, c.y + c.h / 2],
      adjacentLotIds: [],
    });
  }

  // =======================================================================
  // EXPANDED DISTRICTS FOR LARGE TOWN (Lots 121 - 192)
  // DISTRICT G: Baozhong Cultural Basin (Lots 121 - 156) [36 lots]
  // Area: x: 1620 - 2120, y: 140 - 580
  // =======================================================================
  let lotCounter = 121;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const num = lotCounter++;
      const id = formatLotId(num);
      const x = 1620 + col * 82;
      const y = 140 + row * 72;
      const w = 74;
      const h = 64;
      const tags: GeographicTag[] = [
        row === 0 ? 'waterfront' : 'entertainment',
        col === 0 || col === 5 ? 'corner' : 'plaza',
      ];
      lots.push({
        id,
        districtId: 'G',
        number: num,
        name: `Lot ${id} • Cultural Basin Park ${row + 1}-${col + 1}`,
        tags,
        polygon: [
          [x, y],
          [x + w, y],
          [x + w, y + h],
          [x, y + h],
        ],
        labelPos: [x + w / 2, y + h / 2],
        adjacentLotIds: [],
      });
    }
  }

  // =======================================================================
  // DISTRICT H: Hsiangshan Financial Heights (Lots 157 - 192) [36 lots]
  // Area: x: 1620 - 2120, y: 600 - 1040
  // =======================================================================
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const num = lotCounter++;
      const id = formatLotId(num);
      const x = 1620 + col * 82;
      const y = 600 + row * 72;
      const w = 74;
      const h = 64;
      const tags: GeographicTag[] = [
        'heights',
        col === 0 || col === 5 ? 'corner' : 'plaza',
      ];
      lots.push({
        id,
        districtId: 'H',
        number: num,
        name: `Lot ${id} • Financial Tower Tier ${row + 1}-${col + 1}`,
        tags,
        polygon: [
          [x, y],
          [x + w, y],
          [x + w, y + h],
          [x, y + h],
        ],
        labelPos: [x + w / 2, y + h / 2],
        adjacentLotIds: [],
      });
    }
  }

  // =======================================================================
  // PHYSICAL ADJACENCY COMPUTATION
  // Connect lots within proximity distance (< 95px between centers)
  // =======================================================================
  for (let i = 0; i < lots.length; i++) {
    for (let j = i + 1; j < lots.length; j++) {
      const l1 = lots[i];
      const l2 = lots[j];
      const dx = l1.labelPos[0] - l2.labelPos[0];
      const dy = l1.labelPos[1] - l2.labelPos[1];
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Connect orthogonal or tight diagonal neighbors across street borders
      if (dist <= 100) {
        if (!l1.adjacentLotIds.includes(l2.id)) l1.adjacentLotIds.push(l2.id);
        if (!l2.adjacentLotIds.includes(l1.id)) l2.adjacentLotIds.push(l1.id);
      }
    }
  }

  return lots;
}

export const LOT_DEFINITIONS: LotDefinition[] = generateAllTownLots();
