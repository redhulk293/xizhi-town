// Xizhi Town Domain Types — Core Chinatown-Style Negotiation Mechanics

export type GeographicTag =
  | 'waterfront'
  | 'plaza'
  | 'alley'
  | 'corner'
  | 'terrace'
  | 'transit'
  | 'entertainment'
  | 'heights'
  | 'standard';

export interface District {
  id: string; // 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'
  name: string;
  nameZh: string;
  color: string;
  description: string;
  accentClass: string;
}

export interface LotDefinition {
  id: string; // '001', '014', '063', '120', '192'
  districtId: string;
  number: number; // 1 to 192
  name: string;
  tags: GeographicTag[];
  polygon: [number, number][]; // coordinates on persistent town board
  labelPos: [number, number];
  adjacentLotIds: string[];
}

export interface BuiltBusinessOnLot {
  businessTypeId: string;
  playerId: string;
  chainGroup: string; // links contiguous tiles of same chain
}

export interface LotState {
  id: string; // e.g. '063'
  ownerId: string | null; // Player ID or null if unowned
  builtBusiness: BuiltBusinessOnLot | null;
}

export interface BusinessDefinition {
  id: string; // e.g. 'XZD', 'XFC'
  code: string; // short business code e.g. 'XZD'
  name: string;
  nameZh: string;
  category:
    | 'Hospitality'
    | 'Retail'
    | 'Heritage'
    | 'Industry'
    | 'Culinary'
    | 'Transit'
    | 'Entertainment'
    | 'Finance';
  requiredTiles: number; // 3, 4, 5, 6, 7, 8 tiles
  totalSupply: number; // Scarcity pool
  incompleteIncomeByCount: number[]; // income index: [0, 1 tile, 2 tiles, ..., req-1 tiles]
  completeIncome: number; // income when requiredTiles achieved
  requiredTag?: GeographicTag;
  preferredDistrictId?: string;
  iconName: string;
  badgeColor: string;
  textColor: string;
}

export interface BusinessTile {
  id: string; // unique tile id: tile_XZD_1_42
  businessTypeId: string;
  ownerId: string; // player holding tile in hand or placed on lot
  isPlaced: boolean;
  placedLotId?: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatarBg: string;
  cash: number; // integer minor currency
  isHuman: boolean;
}

export interface DeferredPaymentObligation {
  id: string;
  payerId: string;
  payeeId: string;
  assetDescription: string;
  immediatePayment: number;
  amount: number; // deferred amount
  dueRound: number;
  lateFeePercent: number; // e.g. 10%
  status: 'pending' | 'settled' | 'overdue';
  note?: string;
}

export interface TradeOfferSide {
  lotIds: string[]; // e.g. ['063']
  tileIds: string[]; // e.g. ['tile_XZD_1']
  cash: number;
  deferredPayments: {
    amount: number;
    dueRound: number;
    lateFeePercent?: number;
    note?: string;
  }[];
}

export interface TradeProposal {
  id: string;
  senderId: string;
  receiverId: string;
  roundCreated: number;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  offer: TradeOfferSide;
  request: TradeOfferSide;
  note?: string;
  timestamp: number;
}

export type GamePhase =
  | 'distribution' // 1. Land & Shop Tiles Distribution (Choose land to keep, keep ALL shop tiles)
  | 'inspect'      // 2. Town Map & Status Inspection
  | 'negotiate'    // 3. Open Trading Floor & Deal Table
  | 'build'        // 4. Shop Placement onto Owned Parcels
  | 'earn'         // 5. Income Settlement (Incomplete vs Complete) & Fiscal Resolution
  | 'ended';       // Final Town Valuation & Victory

export interface ShopGroupStatus {
  businessTypeId: string;
  businessCode: string;
  playerId: string;
  tileCount: number;
  requiredTiles: number;
  isComplete: boolean;
  income: number;
  lotIds: string[];
}

export interface IncomeBreakdown {
  playerId: string;
  businessIncome: number;
  deferredReceived: number;
  deferredPaid: number;
  netIncome: number;
  details: {
    businessName: string;
    businessCode: string;
    tileCount: number;
    requiredTiles: number;
    isComplete: boolean;
    income: number;
    lots: string[];
  }[];
  settledDebts: {
    otherPlayerName: string;
    amount: number;
    type: 'paid' | 'received' | 'overdue';
  }[];
}

export interface GameLogEntry {
  id: string;
  round: number;
  phase: GamePhase;
  message: string;
  timestamp: number;
  type: 'trade' | 'build' | 'earn' | 'system';
}

export type MapMode = 'small' | 'large';

export interface GameConfig {
  playerCount: number; // 3 to 8
  mapMode: MapMode; // 'small' (3-5 players, 120 lots) or 'large' (6-8 players, 192 lots)
  totalRounds: number; // 6 years for small, 8 years for large
  totalLots: number; // 120 or 192
  activeDistrictIds: string[]; // ['A', 'B', 'C', 'D', 'E', 'F'] for small, + ['G', 'H'] for large
  shopTilesPerPlayer: number; // 3 for 3-4p, 5 for 5-6p, 7 for 7-8p
  startingCash: number; // default 150,000
  seed: number; // deterministic randomness seed
}

// Keep / Return Decision for Land Lots ONLY
export interface PendingLandDraft {
  playerId: string;
  dealtLotIds: string[];
  keepCount: number;
  selectedKeepLotIds: string[];
  isConfirmed: boolean;
}

export interface GameState {
  config: GameConfig;
  currentRound: number;
  currentPhase: GamePhase;
  activePlayerId: string;
  players: Player[];
  lots: Record<string, LotState>;
  tilesInBag: BusinessTile[];
  playerTiles: BusinessTile[];
  unclaimedLotDeck: string[]; // pool of remaining land lots
  activeProposals: TradeProposal[];
  completedProposals: TradeProposal[];
  promissoryNotes: DeferredPaymentObligation[];
  pendingLandDrafts: Record<string, PendingLandDraft>; // Land keep/return decisions
  lastRoundIncome: IncomeBreakdown[] | null;
  logs: GameLogEntry[];
  winnerId: string | null;
  rngState: number; // current PRNG pointer
}
