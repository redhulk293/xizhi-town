import React, { useState } from 'react';
import {
  Player,
  BusinessTile,
  LotState,
  PendingLandDraft,
  DeferredPaymentObligation,
  GamePhase,
} from '../types';
import { LOT_DEFINITIONS, DISTRICTS } from '../data/districts';
import { BUSINESS_DEFINITIONS } from '../data/businesses';
import { sound } from '../utils/soundEngine';
import {
  Hammer,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Check,
  DollarSign,
  MapPin,
  Handshake,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface PlayerTrayProps {
  player: Player;
  lots: Record<string, LotState>;
  playerTiles: BusinessTile[];
  currentPhase: GamePhase;
  pendingLandDraft?: PendingLandDraft;
  promissoryNotes: DeferredPaymentObligation[];
  selectedTileForPlacement: BusinessTile | null;
  onSelectTileForPlacement: (tile: BusinessTile | null) => void;
  onSelectLot: (lotId: string) => void;
  onConfirmLandDraft: (keptLotIds: string[]) => void;
  onOpenTrade: () => void;
}

export const PlayerTray: React.FC<PlayerTrayProps> = ({
  player,
  lots,
  playerTiles,
  currentPhase,
  pendingLandDraft,
  promissoryNotes,
  selectedTileForPlacement,
  onSelectTileForPlacement,
  onSelectLot,
  onConfirmLandDraft,
  onOpenTrade,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tiles' | 'lots' | 'promissory'>('tiles');
  const [selectedKeepLots, setSelectedKeepLots] = useState<string[]>(
    pendingLandDraft ? pendingLandDraft.selectedKeepLotIds : []
  );

  // Sync draft selection if pendingLandDraft updates
  React.useEffect(() => {
    if (pendingLandDraft) {
      setSelectedKeepLots(pendingLandDraft.selectedKeepLotIds);
    }
  }, [pendingLandDraft]);

  const handTiles = playerTiles.filter((t) => t.ownerId === player.id && !t.isPlaced);
  const ownedLotIds = Object.keys(lots).filter((id) => lots[id].ownerId === player.id);
  const myNotes = promissoryNotes.filter(
    (n) => n.payerId === player.id || n.payeeId === player.id
  );

  const isLandDraftActive =
    currentPhase === 'distribution' && pendingLandDraft && !pendingLandDraft.isConfirmed;

  const toggleKeepLot = (lotId: string) => {
    if (!pendingLandDraft) return;
    sound.playTileSelect();
    if (selectedKeepLots.includes(lotId)) {
      setSelectedKeepLots((prev) => prev.filter((id) => id !== lotId));
    } else {
      if (selectedKeepLots.length < pendingLandDraft.keepCount) {
        setSelectedKeepLots((prev) => [...prev, lotId]);
      }
    }
    // Also focus camera on that lot
    onSelectLot(lotId);
  };

  // Helper to compute existing chain count for a business type for this player
  const getBusinessProgress = (bizTypeId: string) => {
    const bizDef = BUSINESS_DEFINITIONS[bizTypeId];
    if (!bizDef) return { placedCount: 0, required: 3, isComplete: false, need: 3 };

    const placedLots = Object.values(lots).filter(
      (l) => l.ownerId === player.id && l.builtBusiness?.businessTypeId === bizTypeId
    );
    const placedCount = placedLots.length;
    const isComplete = placedCount >= bizDef.requiredTiles;
    const need = Math.max(0, bizDef.requiredTiles - placedCount);
    return { placedCount, required: bizDef.requiredTiles, isComplete, need };
  };

  return (
    <div
      id="player-tray-container"
      className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center transition-all duration-300 ease-out pointer-events-none"
    >
      {/* Wooden Tycoon Rack Container */}
      <div className="w-full max-w-5xl px-3 pointer-events-auto">
        <div className="bg-[#141210]/95 border-t-2 border-x-2 border-amber-900/70 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-800/80 bg-stone-950/70 text-xs">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full ring-2 ring-stone-750 shadow-sm"
                style={{ backgroundColor: player.color }}
              />
              <span className="font-bold text-stone-100 text-sm tracking-wide">
                {player.name}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-stone-900 border border-stone-800 text-emerald-400 font-mono font-bold text-xs shadow-inner">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${player.cash.toLocaleString()}</span>
              </div>
            </div>

            {/* Tray Mode Switchers & Deal Table Shortcut */}
            <div className="flex items-center gap-1.5">
              <button
                id="tray-open-trade-desk-btn"
                onClick={() => {
                  sound.playMapSelect();
                  onOpenTrade();
                }}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all mr-1"
                title="Open The Trading Desk"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Trading Desk</span>
              </button>

              <button
                onClick={() => {
                  sound.playTileSelect();
                  setActiveTab('tiles');
                  setIsCollapsed(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'tiles' && !isLandDraftActive
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Shop Tiles ({handTiles.length})
              </button>

              <button
                onClick={() => {
                  sound.playTileSelect();
                  setActiveTab('lots');
                  setIsCollapsed(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'lots' && !isLandDraftActive
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Parcels ({ownedLotIds.length})
              </button>

              <button
                onClick={() => {
                  sound.playTileSelect();
                  setActiveTab('promissory');
                  setIsCollapsed(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'promissory' && !isLandDraftActive
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Notes ({myNotes.length})
              </button>

              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 ml-1 transition-colors"
                title={isCollapsed ? 'Expand Rack' : 'Minimize Rack'}
              >
                {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Rack Body */}
          {!isCollapsed && (
            <div className="p-3.5 max-h-60 overflow-x-auto overflow-y-hidden">
              {/* 1. LAND PARCEL DRAFT INTERFACE (Choose what to keep, return the rest) */}
              {isLandDraftActive ? (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between bg-stone-900/90 p-2.5 rounded-2xl border border-amber-900/60">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>
                        <strong>Land Distribution:</strong> Choose{' '}
                        <strong className="text-white font-mono">{pendingLandDraft.keepCount}</strong> of{' '}
                        {pendingLandDraft.dealtLotIds.length} parcels to KEEP (Selected:{' '}
                        <strong className="text-amber-400 font-mono">
                          {selectedKeepLots.length}/{pendingLandDraft.keepCount}
                        </strong>
                        ). Unkept parcels return to town reserves.
                      </span>
                    </div>

                    <button
                      id="confirm-land-draft-button"
                      disabled={selectedKeepLots.length !== pendingLandDraft.keepCount}
                      onClick={() => {
                        sound.playTilePlace();
                        onConfirmLandDraft(selectedKeepLots);
                      }}
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        selectedKeepLots.length === pendingLandDraft.keepCount
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer scale-102'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Kept Parcels</span>
                    </button>
                  </div>

                  {/* Dealt Land Lots Cards */}
                  <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                    {pendingLandDraft.dealtLotIds.map((lotId) => {
                      const lotDef = LOT_DEFINITIONS.find((l) => l.id === lotId);
                      if (!lotDef) return null;
                      const district = DISTRICTS[lotDef.districtId];
                      const isSelected = selectedKeepLots.includes(lotId);

                      return (
                        <div
                          key={lotId}
                          onClick={() => toggleKeepLot(lotId)}
                          className={`flex-shrink-0 w-48 p-3 rounded-2xl border-2 cursor-pointer transition-all duration-150 relative ${
                            isSelected
                              ? 'bg-amber-950/70 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.4)] scale-102'
                              : 'bg-stone-900/80 border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className="w-3 h-3 rounded-full shadow"
                              style={{ backgroundColor: district?.color }}
                            />
                            <span className="font-mono font-bold text-stone-100 text-sm">
                              Lot {lotDef.id}
                            </span>
                            {isSelected ? (
                              <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                KEEP
                              </span>
                            ) : (
                              <span className="bg-stone-800 text-stone-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                RETURN
                              </span>
                            )}
                          </div>

                          <div className="text-stone-200 font-bold text-xs truncate">
                            {lotDef.name.replace(`Lot ${lotDef.id} • `, '')}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2 pt-1 border-t border-stone-800">
                            <span>{district?.name.split(' ')[0]}</span>
                            <span className="capitalize text-stone-300 font-mono text-[10px]">
                              {lotDef.tags[0]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : activeTab === 'tiles' ? (
                /* 2. REGULAR BUSINESS TILES IN HAND */
                <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                  {handTiles.length === 0 ? (
                    <div className="text-stone-500 text-xs py-4 px-2 italic">
                      No unplaced shop tiles in hand. Trade with tycoons at the Trading Desk or await next year's distribution.
                    </div>
                  ) : (
                    handTiles.map((tile) => {
                      const bizDef = BUSINESS_DEFINITIONS[tile.businessTypeId];
                      if (!bizDef) return null;
                      const progress = getBusinessProgress(tile.businessTypeId);
                      const isSelected = selectedTileForPlacement?.id === tile.id;

                      return (
                        <div
                          key={tile.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', tile.id);
                            onSelectTileForPlacement(tile);
                          }}
                          onClick={() => {
                            sound.playTileSelect();
                            onSelectTileForPlacement(isSelected ? null : tile);
                          }}
                          className={`flex-shrink-0 w-48 p-2.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 relative select-none ${
                            isSelected
                              ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-102'
                              : 'bg-stone-900/90 border-stone-800 hover:border-amber-600/80 hover:bg-stone-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bizDef.badgeColor}`}
                            >
                              {bizDef.code}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              Req: {bizDef.requiredTiles}
                            </span>
                          </div>

                          <div className="text-stone-100 font-bold text-xs truncate">
                            {bizDef.name}
                          </div>

                          {/* Progress: What I have, What I need */}
                          <div className="mt-2 pt-1 border-t border-stone-800/80">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-stone-300 font-bold">
                                {bizDef.code} {progress.placedCount}/{progress.required}
                              </span>
                              <span className={progress.isComplete ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                                {progress.isComplete ? 'COMPLETE' : `Need ${progress.need} more`}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                              <span className="text-stone-400">
                                Inc: +${bizDef.incompleteIncomeByCount[1]?.toLocaleString() || '10,000'}
                              </span>
                              <span className="text-emerald-400 font-bold">
                                Full: +${bizDef.completeIncome.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-800 text-[10px]">
                            <span className="text-stone-400 flex items-center gap-1 font-semibold">
                              <Hammer className="w-3 h-3 text-amber-400" />
                              {isSelected ? 'Ready on Map' : 'Click/Drag to Lot'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : activeTab === 'lots' ? (
                /* 3. OWNED PARCELS */
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {ownedLotIds.length === 0 ? (
                    <div className="text-stone-500 text-xs py-4 px-2 italic">
                      You currently hold no land titles.
                    </div>
                  ) : (
                    ownedLotIds.map((lotId) => {
                      const lotDef = LOT_DEFINITIONS.find((l) => l.id === lotId);
                      const lotState = lots[lotId];
                      if (!lotDef) return null;
                      const district = DISTRICTS[lotDef.districtId];
                      const builtDef = lotState.builtBusiness
                        ? BUSINESS_DEFINITIONS[lotState.builtBusiness.businessTypeId]
                        : null;

                      return (
                        <div
                          key={lotId}
                          onClick={() => {
                            sound.playMapSelect();
                            onSelectLot(lotId);
                          }}
                          className="flex-shrink-0 w-44 p-2.5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/80 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: district?.color }}
                            />
                            <span className="font-mono font-bold text-stone-100 text-xs">
                              Lot {lotDef.id}
                            </span>
                          </div>
                          <div className="text-stone-200 font-semibold text-xs truncate">
                            {lotDef.name.replace(`Lot ${lotDef.id} • `, '')}
                          </div>
                          <div className="text-[10px] text-stone-400 mt-1 flex items-center justify-between">
                            <span>{district?.name.split(' ')[0]}</span>
                            {builtDef ? (
                              <span className="font-mono text-emerald-400 font-bold">
                                {builtDef.code}
                              </span>
                            ) : (
                              <span className="font-mono text-stone-500">Vacant</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* 4. PROMISSORY NOTES */
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {myNotes.length === 0 ? (
                    <div className="text-stone-500 text-xs py-4 px-2 italic">
                      No active promissory obligations or receivable contracts.
                    </div>
                  ) : (
                    myNotes.map((note) => {
                      const isPayer = note.payerId === player.id;
                      return (
                        <div
                          key={note.id}
                          className={`flex-shrink-0 w-52 p-2.5 rounded-2xl border ${
                            note.status === 'overdue'
                              ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                              : 'bg-stone-900/90 border-stone-800 text-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className={isPayer ? 'text-rose-400' : 'text-emerald-400'}>
                              {isPayer ? 'Debt Payable' : 'Receivable'}
                            </span>
                            <span className="font-mono">${note.amount.toLocaleString()}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 mt-1">
                            Due Year: {note.dueRound} | Status: {note.status.toUpperCase()}
                          </div>
                          {note.note && (
                            <div className="text-[10px] text-stone-400 italic truncate mt-1">
                              {note.note}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
