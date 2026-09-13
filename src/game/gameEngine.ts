import {
  GameState,
  GameConfig,
  Player,
  LotState,
  BusinessTile,
  TradeProposal,
  DeferredPaymentObligation,
  IncomeBreakdown,
  GameLogEntry,
  GamePhase,
  PendingLandDraft,
  ShopGroupStatus,
} from '../types';
import { LOT_DEFINITIONS, formatLotId } from '../data/districts';
import {
  BUSINESS_DEFINITIONS,
  mulberry32,
  seededShuffle,
  generateTileSupplyBag,
} from '../data/businesses';

export const DEFAULT_PLAYER_COLORS = [
  { color: '#dc2626', bg: 'bg-red-600', name: 'Crimson Tycoon' },
  { color: '#2563eb', bg: 'bg-blue-600', name: 'Azure Syndicate' },
  { color: '#16a34a', bg: 'bg-green-600', name: 'Jade Holdings' },
  { color: '#d97706', bg: 'bg-amber-600', name: 'Golden Trust' },
  { color: '#9333ea', bg: 'bg-purple-600', name: 'Amethyst Guild' },
  { color: '#0891b2', bg: 'bg-cyan-600', name: 'Keelung Maritime' },
  { color: '#e11d48', bg: 'bg-rose-600', name: 'Lotus Development' },
  { color: '#ca8a04', bg: 'bg-yellow-600', name: 'Iron Foundry Group' },
];

// Returns Chinatown-style Land Draft quota per player: deal count and keep count
export function getYearlyLandDraftQuota(
  playerCount: number,
  round: number
): { deal: number; keep: number } {
  if (playerCount <= 3) {
    switch (round) {
      case 1:
        return { deal: 7, keep: 5 };
      case 2:
      case 3:
        return { deal: 6, keep: 4 };
      default:
        return { deal: 5, keep: 3 };
    }
  } else if (playerCount === 4) {
    switch (round) {
      case 1:
        return { deal: 6, keep: 4 };
      case 2:
      case 3:
        return { deal: 5, keep: 3 };
      default:
        return { deal: 4, keep: 2 };
    }
  } else if (playerCount === 5) {
    switch (round) {
      case 1:
      case 2:
        return { deal: 5, keep: 3 };
      default:
        return { deal: 4, keep: 2 };
    }
  } else if (playerCount === 6) {
    switch (round) {
      case 1:
        return { deal: 6, keep: 4 };
      case 2:
      case 3:
      case 4:
        return { deal: 5, keep: 3 };
      default:
        return { deal: 4, keep: 2 };
    }
  } else {
    // 7 or 8 players
    switch (round) {
      case 1:
        return { deal: 5, keep: 3 };
      case 2:
      case 3:
      case 4:
        return { deal: 4, keep: 2 };
      default:
        return { deal: 3, keep: 2 };
    }
  }
}

// Get number of shop tiles distributed per player each year based on player count
export function getShopTilesPerPlayerPerYear(playerCount: number): number {
  if (playerCount <= 4) {
    return 5;
  } else if (playerCount <= 6) {
    return 6;
  } else if (playerCount === 7) {
    return 7;
  } else {
    return 8;
  }
}

export function startNewGame(config: GameConfig, playerNames: string[]): GameState {
  const rng = mulberry32(config.seed);

  const players: Player[] = playerNames.map((name, i) => ({
    id: `player_${i + 1}`,
    name: name.trim() || `Tycoon ${i + 1}`,
    color: DEFAULT_PLAYER_COLORS[i % DEFAULT_PLAYER_COLORS.length].color,
    avatarBg: DEFAULT_PLAYER_COLORS[i % DEFAULT_PLAYER_COLORS.length].bg,
    cash: config.startingCash,
    isHuman: true,
  }));

  // Select active lots based on map mode (120 lots for small, 192 for large)
  const maxLotNumber = config.mapMode === 'large' ? 192 : 120;
  const activeLots = LOT_DEFINITIONS.filter((l) => l.number <= maxLotNumber);

  const lots: Record<string, LotState> = {};
  const lotDeckIds: string[] = [];
  for (const lotDef of activeLots) {
    lots[lotDef.id] = {
      id: lotDef.id,
      ownerId: null,
      builtBusiness: null,
    };
    lotDeckIds.push(lotDef.id);
  }

  // Shuffle land deck deterministically
  const unclaimedLotDeck = seededShuffle(lotDeckIds, rng);

  // Generate all physical business tiles and shuffle deterministically
  const rawTileBag = generateTileSupplyBag(rng);
  const tilesInBag: BusinessTile[] = rawTileBag.map((t) => ({
    id: t.id,
    businessTypeId: t.businessTypeId,
    ownerId: '',
    isPlaced: false,
  }));

  const initialState: GameState = {
    config: {
      ...config,
      totalLots: maxLotNumber,
      shopTilesPerPlayer: getShopTilesPerPlayerPerYear(config.playerCount),
    },
    currentRound: 1,
    currentPhase: 'distribution',
    activePlayerId: players[0].id,
    players,
    lots,
    tilesInBag,
    playerTiles: [],
    unclaimedLotDeck,
    activeProposals: [],
    completedProposals: [],
    promissoryNotes: [],
    pendingLandDrafts: {},
    lastRoundIncome: null,
    logs: [
      {
        id: `log_init_${Date.now()}`,
        round: 1,
        phase: 'distribution',
        message: `Xizhi Town inaugural Year 1 underway! Map: ${config.mapMode.toUpperCase()} (${maxLotNumber} permanent lots, ${config.totalRounds} years, ${players.length} Tycoons).`,
        timestamp: Date.now(),
        type: 'system',
      },
    ],
    winnerId: null,
    rngState: config.seed + 1,
  };

  return distributeYearlyAssets(initialState);
}

// 1. LAND & SHOP TILE DISTRIBUTION
// - Land: Randomly dealt to each player -> Player chooses which to KEEP and which to RETURN.
// - Shop Tiles: Randomly dealt to each player -> Player KEEPS ALL OF THEM automatically!
export function distributeYearlyAssets(state: GameState): GameState {
  const updatedDeck = [...state.unclaimedLotDeck];
  const updatedBag = [...state.tilesInBag];
  const updatedPlayerTiles = [...state.playerTiles];
  const pendingDrafts: Record<string, PendingLandDraft> = {};
  const logs = [...state.logs];

  const quota = getYearlyLandDraftQuota(state.players.length, state.currentRound);
  const tilesPerPlayer = state.config.shopTilesPerPlayer;

  for (const player of state.players) {
    // A. Deal Land Lots for the Keep/Return decision
    const dealtLots: string[] = [];
    for (let l = 0; l < quota.deal; l++) {
      if (updatedDeck.length > 0) {
        dealtLots.push(updatedDeck.shift()!);
      }
    }

    pendingDrafts[player.id] = {
      playerId: player.id,
      dealtLotIds: dealtLots,
      keepCount: Math.min(quota.keep, dealtLots.length),
      // Preselect first `keepCount` for quick interaction, user can freely adjust
      selectedKeepLotIds: dealtLots.slice(0, Math.min(quota.keep, dealtLots.length)),
      isConfirmed: false,
    };

    // B. Deal Shop Tiles (Player KEEPS ALL OF THEM, NO DISCARD, NO SHOP)
    const dealtTiles: BusinessTile[] = [];
    for (let t = 0; t < tilesPerPlayer; t++) {
      if (updatedBag.length > 0) {
        const tile = updatedBag.shift()!;
        tile.ownerId = player.id;
        tile.isPlaced = false;
        dealtTiles.push(tile);
        updatedPlayerTiles.push(tile);
      }
    }

    const tileSummary = dealtTiles
      .map((dt) => BUSINESS_DEFINITIONS[dt.businessTypeId]?.code || dt.businessTypeId)
      .join(', ');

    logs.push({
      id: `dist_${player.id}_${state.currentRound}_${Date.now()}`,
      round: state.currentRound,
      phase: 'distribution',
      message: `${player.name} dealt ${dealtLots.length} land lots (must keep ${quota.keep}), and received ${dealtTiles.length} shop tiles: [${tileSummary}].`,
      timestamp: Date.now(),
      type: 'system',
    });
  }

  return {
    ...state,
    currentPhase: 'distribution',
    unclaimedLotDeck: updatedDeck,
    tilesInBag: updatedBag,
    playerTiles: updatedPlayerTiles,
    pendingLandDrafts: pendingDrafts,
    logs,
  };
}

// Confirm player's chosen kept land parcels (The keep / return decision)
export function confirmPlayerLandDraft(
  state: GameState,
  playerId: string,
  keptLotIds: string[]
): GameState {
  const draft = state.pendingLandDrafts[playerId];
  if (!draft) return state;

  if (keptLotIds.length !== draft.keepCount) {
    return state;
  }

  const updatedLots = { ...state.lots };
  const updatedDeck = [...state.unclaimedLotDeck];
  const returnedLots: string[] = [];

  // Assign kept lots to player
  for (const lotId of draft.dealtLotIds) {
    if (keptLotIds.includes(lotId)) {
      updatedLots[lotId] = {
        ...updatedLots[lotId],
        ownerId: playerId,
      };
    } else {
      // Returned lots go back to unclaimed deck
      updatedDeck.push(lotId);
      returnedLots.push(lotId);
    }
  }

  const player = state.players.find((p) => p.id === playerId);
  const logs = [...state.logs];
  logs.push({
    id: `land_draft_${playerId}_${Date.now()}`,
    round: state.currentRound,
    phase: 'distribution',
    message: `${player?.name || 'Player'} kept ${keptLotIds.length} parcels (${keptLotIds.map((id) => `Lot ${id}`).join(', ')}) and returned ${returnedLots.length} parcels to town reserves.`,
    timestamp: Date.now(),
    type: 'system',
  });

  const updatedDrafts = {
    ...state.pendingLandDrafts,
    [playerId]: {
      ...draft,
      selectedKeepLotIds: keptLotIds,
      isConfirmed: true,
    },
  };

  return {
    ...state,
    lots: updatedLots,
    unclaimedLotDeck: updatedDeck,
    pendingLandDrafts: updatedDrafts,
    logs,
  };
}

// Compute contiguous shops on the board
// A shop is formed by contiguous parcels owned by the SAME player with the SAME business type.
export function computePlayerShops(state: GameState, playerId: string): ShopGroupStatus[] {
  const playerLots = Object.values(state.lots).filter(
    (l) => l.ownerId === playerId && l.builtBusiness?.businessTypeId
  );

  const visited = new Set<string>();
  const shops: ShopGroupStatus[] = [];

  for (const startLot of playerLots) {
    if (visited.has(startLot.id)) continue;
    const bTypeId = startLot.builtBusiness!.businessTypeId;
    const bizDef = BUSINESS_DEFINITIONS[bTypeId];
    if (!bizDef) continue;

    // Breadth-first search for contiguous matching parcels
    const queue: string[] = [startLot.id];
    visited.add(startLot.id);
    const connectedLotIds: string[] = [startLot.id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const lotDef = LOT_DEFINITIONS.find((l) => l.id === currentId);
      if (!lotDef) continue;

      for (const adjId of lotDef.adjacentLotIds) {
        if (!visited.has(adjId)) {
          const adjLot = state.lots[adjId];
          if (
            adjLot &&
            adjLot.ownerId === playerId &&
            adjLot.builtBusiness?.businessTypeId === bTypeId
          ) {
            visited.add(adjId);
            connectedLotIds.push(adjId);
            queue.push(adjId);
          }
        }
      }
    }

    const tileCount = connectedLotIds.length;
    const isComplete = tileCount >= bizDef.requiredTiles;

    let income = 0;
    if (isComplete) {
      income = bizDef.completeIncome;
    } else {
      // Incomplete income based on tile count
      const idx = Math.min(tileCount, bizDef.incompleteIncomeByCount.length - 1);
      income = bizDef.incompleteIncomeByCount[idx] || 0;
    }

    shops.push({
      businessTypeId: bTypeId,
      businessCode: bizDef.code,
      playerId,
      tileCount,
      requiredTiles: bizDef.requiredTiles,
      isComplete,
      income,
      lotIds: connectedLotIds,
    });
  }

  return shops;
}

// Get what a player has and what they need for each business
export function getPlayerBusinessStatus(
  state: GameState,
  playerId: string
): {
  businessCode: string;
  businessName: string;
  requiredTiles: number;
  tilesInHand: number;
  tilesPlaced: number;
  shops: ShopGroupStatus[];
  needCount: number; // tiles still needed to complete best shop
}[] {
  const shops = computePlayerShops(state, playerId);
  const handTiles = state.playerTiles.filter(
    (t) => t.ownerId === playerId && !t.isPlaced
  );
  const placedTiles = state.playerTiles.filter(
    (t) => t.ownerId === playerId && t.isPlaced
  );

  const result = [];
  for (const def of Object.values(BUSINESS_DEFINITIONS)) {
    const inHand = handTiles.filter((t) => t.businessTypeId === def.id).length;
    const placed = placedTiles.filter((t) => t.businessTypeId === def.id).length;
    const bizShops = shops.filter((s) => s.businessTypeId === def.id);

    // Calculate maximum tiles placed in any one contiguous shop
    const maxInOneShop = bizShops.reduce((max, s) => Math.max(max, s.tileCount), 0);
    const needCount = Math.max(0, def.requiredTiles - maxInOneShop);

    if (inHand > 0 || placed > 0 || bizShops.length > 0) {
      result.push({
        businessCode: def.code,
        businessName: def.name,
        requiredTiles: def.requiredTiles,
        tilesInHand: inHand,
        tilesPlaced: placed,
        shops: bizShops,
        needCount,
      });
    }
  }

  return result;
}

// Place a shop tile from player hand onto an owned vacant parcel
export function buildBusinessTile(
  state: GameState,
  playerId: string,
  tileId: string,
  lotId: string
): { success: boolean; error?: string; state: GameState } {
  const lot = state.lots[lotId];
  if (!lot) return { success: false, error: 'Parcel does not exist.', state };
  if (lot.ownerId !== playerId) {
    return { success: false, error: 'You do not own this parcel.', state };
  }
  if (lot.builtBusiness) {
    return { success: false, error: 'Parcel is already developed.', state };
  }

  const tile = state.playerTiles.find((t) => t.id === tileId && t.ownerId === playerId && !t.isPlaced);
  if (!tile) {
    return { success: false, error: 'Tile is not in your hand.', state };
  }

  const bizDef = BUSINESS_DEFINITIONS[tile.businessTypeId];
  if (!bizDef) {
    return { success: false, error: 'Invalid business definition.', state };
  }

  const lotDef = LOT_DEFINITIONS.find((l) => l.id === lotId);
  if (bizDef.requiredTag && lotDef && !lotDef.tags.includes(bizDef.requiredTag)) {
    return {
      success: false,
      error: `This business requires a "${bizDef.requiredTag}" parcel.`,
      state,
    };
  }

  // Update lot state
  const updatedLots = {
    ...state.lots,
    [lotId]: {
      ...lot,
      builtBusiness: {
        businessTypeId: tile.businessTypeId,
        playerId,
        chainGroup: `${tile.businessTypeId}_${playerId}`,
      },
    },
  };

  // Update tile state
  const updatedPlayerTiles = state.playerTiles.map((t) => {
    if (t.id === tileId) {
      return {
        ...t,
        isPlaced: true,
        placedLotId: lotId,
      };
    }
    return t;
  });

  const player = state.players.find((p) => p.id === playerId);
  const logs = [...state.logs];
  logs.push({
    id: `build_${Date.now()}`,
    round: state.currentRound,
    phase: 'build',
    message: `${player?.name || 'Tycoon'} deployed ${bizDef.code} (${bizDef.name}) on Lot ${lotId}.`,
    timestamp: Date.now(),
    type: 'build',
  });

  return {
    success: true,
    state: {
      ...state,
      lots: updatedLots,
      playerTiles: updatedPlayerTiles,
      logs,
    },
  };
}

// Recall a placed business tile back to hand
export function recallBusinessTile(
  state: GameState,
  playerId: string,
  lotId: string
): { success: boolean; error?: string; state: GameState } {
  const lot = state.lots[lotId];
  if (!lot || lot.ownerId !== playerId || !lot.builtBusiness) {
    return { success: false, error: 'Cannot recall tile from this parcel.', state };
  }

  const placedTile = state.playerTiles.find(
    (t) => t.isPlaced && t.placedLotId === lotId && t.ownerId === playerId
  );
  if (!placedTile) {
    return { success: false, error: 'Placed tile record not found.', state };
  }

  const updatedLots = {
    ...state.lots,
    [lotId]: {
      ...lot,
      builtBusiness: null,
    },
  };

  const updatedPlayerTiles = state.playerTiles.map((t) => {
    if (t.id === placedTile.id) {
      return {
        ...t,
        isPlaced: false,
        placedLotId: undefined,
      };
    }
    return t;
  });

  return {
    success: true,
    state: {
      ...state,
      lots: updatedLots,
      playerTiles: updatedPlayerTiles,
    },
  };
}

// CREATE TRADE PROPOSAL
export function createTradeProposal(
  state: GameState,
  proposalData: {
    senderId: string;
    receiverId: string;
    offer: TradeProposal['offer'];
    request: TradeProposal['request'];
    note?: string;
  }
): { success: boolean; error?: string; state: GameState } {
  const sender = state.players.find((p) => p.id === proposalData.senderId);
  const receiver = state.players.find((p) => p.id === proposalData.receiverId);
  if (!sender || !receiver) {
    return { success: false, error: 'Invalid trade participants.', state };
  }

  if (sender.cash < proposalData.offer.cash) {
    return { success: false, error: 'Insufficient funds for offer.', state };
  }

  const newProposal: TradeProposal = {
    id: `prop_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    senderId: proposalData.senderId,
    receiverId: proposalData.receiverId,
    roundCreated: state.currentRound,
    status: 'pending',
    offer: proposalData.offer,
    request: proposalData.request,
    note: proposalData.note,
    timestamp: Date.now(),
  };

  const logs = [...state.logs];
  logs.push({
    id: `log_trade_prop_${newProposal.id}`,
    round: state.currentRound,
    phase: state.currentPhase,
    message: `${sender.name} proposed trade to ${receiver.name}.`,
    timestamp: Date.now(),
    type: 'trade',
  });

  return {
    success: true,
    state: {
      ...state,
      activeProposals: [...state.activeProposals, newProposal],
      logs,
    },
  };
}

// ACCEPT TRADE PROPOSAL ATOMICALLY
export function acceptTradeProposal(
  state: GameState,
  proposalId: string
): { success: boolean; error?: string; state: GameState } {
  const proposal = state.activeProposals.find((p) => p.id === proposalId);
  if (!proposal) return { success: false, error: 'Proposal not found.', state };

  const sender = state.players.find((p) => p.id === proposal.senderId);
  const receiver = state.players.find((p) => p.id === proposal.receiverId);
  if (!sender || !receiver) {
    return { success: false, error: 'Trade participants invalid.', state };
  }

  if (sender.cash < proposal.offer.cash) {
    return { success: false, error: `${sender.name} lacks cash to execute.`, state };
  }
  if (receiver.cash < proposal.request.cash) {
    return { success: false, error: `${receiver.name} lacks cash to execute.`, state };
  }

  // Transfer cash
  const updatedPlayers = state.players.map((p) => {
    if (p.id === sender.id) {
      return { ...p, cash: p.cash - proposal.offer.cash + proposal.request.cash };
    }
    if (p.id === receiver.id) {
      return { ...p, cash: p.cash - proposal.request.cash + proposal.offer.cash };
    }
    return p;
  });

  // Transfer lots
  const updatedLots = { ...state.lots };
  for (const lotId of proposal.offer.lotIds) {
    if (updatedLots[lotId]) {
      updatedLots[lotId] = {
        ...updatedLots[lotId],
        ownerId: receiver.id,
        builtBusiness: updatedLots[lotId].builtBusiness
          ? { ...updatedLots[lotId].builtBusiness!, playerId: receiver.id }
          : null,
      };
    }
  }
  for (const lotId of proposal.request.lotIds) {
    if (updatedLots[lotId]) {
      updatedLots[lotId] = {
        ...updatedLots[lotId],
        ownerId: sender.id,
        builtBusiness: updatedLots[lotId].builtBusiness
          ? { ...updatedLots[lotId].builtBusiness!, playerId: sender.id }
          : null,
      };
    }
  }

  // Transfer shop tiles
  const updatedPlayerTiles = state.playerTiles.map((t) => {
    if (proposal.offer.tileIds.includes(t.id)) {
      return { ...t, ownerId: receiver.id };
    }
    if (proposal.request.tileIds.includes(t.id)) {
      return { ...t, ownerId: sender.id };
    }
    return t;
  });

  // Create deferred promissory notes
  const newNotes: DeferredPaymentObligation[] = [];
  proposal.offer.deferredPayments.forEach((dp, idx) => {
    newNotes.push({
      id: `note_${proposal.id}_offer_${idx}`,
      payerId: sender.id,
      payeeId: receiver.id,
      assetDescription: `Trade Deal #${proposal.id.slice(-4)}`,
      immediatePayment: proposal.offer.cash,
      amount: dp.amount,
      dueRound: dp.dueRound,
      lateFeePercent: dp.lateFeePercent || 10,
      status: 'pending',
      note: dp.note,
    });
  });

  proposal.request.deferredPayments.forEach((dp, idx) => {
    newNotes.push({
      id: `note_${proposal.id}_req_${idx}`,
      payerId: receiver.id,
      payeeId: sender.id,
      assetDescription: `Trade Deal #${proposal.id.slice(-4)}`,
      immediatePayment: proposal.request.cash,
      amount: dp.amount,
      dueRound: dp.dueRound,
      lateFeePercent: dp.lateFeePercent || 10,
      status: 'pending',
      note: dp.note,
    });
  });

  const updatedActive = state.activeProposals.filter((p) => p.id !== proposalId);
  const completedProposal: TradeProposal = { ...proposal, status: 'accepted' };

  const logs = [...state.logs];
  logs.push({
    id: `log_deal_executed_${proposal.id}`,
    round: state.currentRound,
    phase: state.currentPhase,
    message: `DEAL SEALED: ${sender.name} and ${receiver.name} completed transaction atomically!`,
    timestamp: Date.now(),
    type: 'trade',
  });

  return {
    success: true,
    state: {
      ...state,
      players: updatedPlayers,
      lots: updatedLots,
      playerTiles: updatedPlayerTiles,
      promissoryNotes: [...state.promissoryNotes, ...newNotes],
      activeProposals: updatedActive,
      completedProposals: [...state.completedProposals, completedProposal],
      logs,
    },
  };
}

// DECLINE TRADE PROPOSAL
export function declineTradeProposal(state: GameState, proposalId: string): GameState {
  const proposal = state.activeProposals.find((p) => p.id === proposalId);
  if (!proposal) return state;

  const updatedActive = state.activeProposals.filter((p) => p.id !== proposalId);
  const declined: TradeProposal = { ...proposal, status: 'declined' };

  return {
    ...state,
    activeProposals: updatedActive,
    completedProposals: [...state.completedProposals, declined],
  };
}

// 5. EARN PHASE — REVENUE & DEBT SETTLEMENT
export function executeEarnPhase(state: GameState): GameState {
  const round = state.currentRound;
  const breakdown: IncomeBreakdown[] = [];
  const updatedPlayers = [...state.players];
  const updatedNotes = [...state.promissoryNotes];
  const logs = [...state.logs];

  for (let i = 0; i < updatedPlayers.length; i++) {
    const player = updatedPlayers[i];
    const shops = computePlayerShops(state, player.id);

    let businessTotal = 0;
    const shopDetails = [];

    for (const s of shops) {
      businessTotal += s.income;
      const def = BUSINESS_DEFINITIONS[s.businessTypeId];
      shopDetails.push({
        businessName: def?.name || s.businessTypeId,
        businessCode: s.businessCode,
        tileCount: s.tileCount,
        requiredTiles: s.requiredTiles,
        isComplete: s.isComplete,
        income: s.income,
        lots: s.lotIds,
      });
    }

    // Process promissory obligations
    let deferredReceived = 0;
    let deferredPaid = 0;
    const settledDebts = [];

    for (let nIdx = 0; nIdx < updatedNotes.length; nIdx++) {
      const note = updatedNotes[nIdx];
      if (note.status === 'pending' && note.dueRound <= round) {
        if (note.payeeId === player.id) {
          const payer = state.players.find((p) => p.id === note.payerId);
          deferredReceived += note.amount;
          settledDebts.push({
            otherPlayerName: payer?.name || 'Tycoon',
            amount: note.amount,
            type: 'received' as const,
          });
        }
        if (note.payerId === player.id) {
          const payee = state.players.find((p) => p.id === note.payeeId);
          deferredPaid += note.amount;
          settledDebts.push({
            otherPlayerName: payee?.name || 'Tycoon',
            amount: note.amount,
            type: 'paid' as const,
          });
          note.status = 'settled';
        }
      }
    }

    const net = businessTotal + deferredReceived - deferredPaid;
    updatedPlayers[i] = {
      ...player,
      cash: player.cash + net,
    };

    breakdown.push({
      playerId: player.id,
      businessIncome: businessTotal,
      deferredReceived,
      deferredPaid,
      netIncome: net,
      details: shopDetails,
      settledDebts,
    });

    logs.push({
      id: `earn_${player.id}_${round}_${Date.now()}`,
      round,
      phase: 'earn',
      message: `${player.name} earned $${net.toLocaleString()} net income in Year ${round} ($${businessTotal.toLocaleString()} from ${shopDetails.length} shops).`,
      timestamp: Date.now(),
      type: 'earn',
    });
  }

  return {
    ...state,
    players: updatedPlayers,
    promissoryNotes: updatedNotes,
    lastRoundIncome: breakdown,
    logs,
  };
}

// ADVANCE TO NEXT ROUND
export function advanceToNextRound(state: GameState): GameState {
  if (state.currentRound >= state.config.totalRounds) {
    // Game ends! Determine winner by total net worth
    let maxCash = -1;
    let winId: string | null = null;
    for (const p of state.players) {
      if (p.cash > maxCash) {
        maxCash = p.cash;
        winId = p.id;
      }
    }

    const logs = [...state.logs];
    const winner = state.players.find((p) => p.id === winId);
    logs.push({
      id: `game_over_${Date.now()}`,
      round: state.currentRound,
      phase: 'ended',
      message: `TOWN CONCLAVE CONCLUDED! ${winner?.name || 'Tycoon'} wins Xizhi Town with $${maxCash.toLocaleString()} total capital!`,
      timestamp: Date.now(),
      type: 'system',
    });

    return {
      ...state,
      currentPhase: 'ended',
      winnerId: winId,
      logs,
    };
  }

  const nextRound = state.currentRound + 1;
  const nextRoundState: GameState = {
    ...state,
    currentRound: nextRound,
    currentPhase: 'distribution',
  };

  return distributeYearlyAssets(nextRoundState);
}
