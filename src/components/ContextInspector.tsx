import React from 'react';
import {
  LotState,
  Player,
  BusinessTile,
  GamePhase,
} from '../types';
import { LOT_DEFINITIONS, DISTRICTS } from '../data/districts';
import { BUSINESS_DEFINITIONS } from '../data/businesses';
import { sound } from '../utils/soundEngine';
import {
  X,
  Phone,
  Handshake,
  Hammer,
  RotateCcw,
  Sparkles,
  MapPin,
  TrendingUp,
  Layers,
  Anchor,
  Coffee,
  Store,
  ShoppingBag,
  Cpu,
  Mountain,
  Landmark,
  Truck,
  CheckCircle2,
  Crown,
} from 'lucide-react';

interface ContextInspectorProps {
  selectedLotId: string | null;
  lots: Record<string, LotState>;
  players: Player[];
  activePlayer: Player;
  playerTiles: BusinessTile[];
  currentPhase: GamePhase;
  onClose: () => void;
  onCallPlayer: (player: Player) => void;
  onTradeWithPlayer: (player: Player) => void;
  onBuildTileOnLot: (tileId: string, lotId: string) => void;
  onRecallTileFromLot: (lotId: string) => void;
}

export const ContextInspector: React.FC<ContextInspectorProps> = ({
  selectedLotId,
  lots,
  players,
  activePlayer,
  playerTiles,
  currentPhase,
  onClose,
  onCallPlayer,
  onTradeWithPlayer,
  onBuildTileOnLot,
  onRecallTileFromLot,
}) => {
  if (!selectedLotId) return null;

  const lotDef = LOT_DEFINITIONS.find((l) => l.id === selectedLotId);
  const lotState = lots[selectedLotId];
  if (!lotDef || !lotState) return null;

  const district = DISTRICTS[lotDef.districtId];
  const owner = lotState.ownerId ? players.find((p) => p.id === lotState.ownerId) : null;
  const isOwnedByActivePlayer = lotState.ownerId === activePlayer.id;

  const builtBusinessDef = lotState.builtBusiness
    ? BUSINESS_DEFINITIONS[lotState.builtBusiness.businessTypeId]
    : null;

  // Calculate chain progress if business built
  let builtChainCount = 0;
  let chainComplete = false;
  let currentYield = 0;
  if (lotState.builtBusiness && builtBusinessDef) {
    const bType = lotState.builtBusiness.businessTypeId;
    const sameBizLots = Object.values(lots).filter(
      (l) => l.ownerId === lotState.ownerId && l.builtBusiness?.businessTypeId === bType
    );
    builtChainCount = sameBizLots.length;
    chainComplete = builtChainCount >= builtBusinessDef.requiredTiles;
    currentYield = chainComplete
      ? builtBusinessDef.completeIncome
      : (builtBusinessDef.incompleteIncomeByCount[builtChainCount] || 0);
  }

  // Hand tiles that can be built on this lot
  const availableHandTiles = playerTiles.filter((t) => t.ownerId === activePlayer.id && !t.isPlaced);

  const renderIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Anchor': return <Anchor className={className} />;
      case 'Coffee': return <Coffee className={className} />;
      case 'Store': return <Store className={className} />;
      case 'ShoppingBag': return <ShoppingBag className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Mountain': return <Mountain className={className} />;
      case 'Landmark': return <Landmark className={className} />;
      case 'Truck': return <Truck className={className} />;
      default: return <Store className={className} />;
    }
  };

  return (
    <aside
      id="context-inspector-panel"
      className="fixed top-20 right-4 bottom-28 z-30 w-84 sm:w-96 bg-stone-900/95 border-2 border-stone-800 text-stone-100 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-right-8 duration-200"
    >
      {/* Inspector Header with District Tint */}
      <div
        className="px-5 py-4 border-b border-stone-800/80 flex items-center justify-between relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${district.color}25 0%, rgba(28,25,23,0.95) 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg border border-white/20 font-mono"
            style={{ backgroundColor: district.color }}
          >
            {lotDef.id}
          </div>
          <div>
            <h3 className="font-bold text-stone-100 text-base leading-tight tracking-tight">
              {lotDef.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-medium text-stone-400">
                {district.name}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-[11px] font-mono text-stone-400">
                {district.nameZh}
              </span>
            </div>
          </div>
        </div>

        <button
          id="context-inspector-close"
          onClick={() => {
            sound.playMapSelect();
            onClose();
          }}
          className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-750 flex items-center justify-center text-stone-400 hover:text-stone-100 transition-colors border border-stone-700/60"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body scroll */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Geographic Tags */}
        <div className="flex flex-wrap gap-1.5">
          {lotDef.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700/60 text-stone-300 font-medium capitalize flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              {tag} parcel
            </span>
          ))}
        </div>

        {/* Ownership Status Card */}
        <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {owner ? (
              <>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ring-2 ring-stone-800 text-sm"
                  style={{ backgroundColor: owner.color }}
                >
                  {owner.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block">
                    Parcel Titleholder
                  </span>
                  <span className="font-bold text-stone-100 text-sm flex items-center gap-1.5">
                    {owner.name}
                    {isOwnedByActivePlayer && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                        You
                      </span>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 text-stone-400 py-1">
                <div className="w-8 h-8 rounded-full bg-stone-800 border border-dashed border-stone-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-stone-500" />
                </div>
                <span className="font-medium text-stone-300">Unclaimed Municipal Parcel</span>
              </div>
            )}
          </div>

          {owner && !isOwnedByActivePlayer && (
            <div className="flex items-center gap-1.5">
              <button
                id="inspector-call-owner-btn"
                onClick={() => {
                  sound.playRadioBeep(true);
                  onCallPlayer(owner);
                }}
                className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-colors"
                title={`Call ${owner.name}`}
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                id="inspector-trade-owner-btn"
                onClick={() => {
                  sound.playMapSelect();
                  onTradeWithPlayer(owner);
                }}
                className="px-2.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 transition-colors"
                title={`Propose Trade to ${owner.name}`}
              >
                <Handshake className="w-4 h-4" />
                <span>Deal</span>
              </button>
            </div>
          )}
        </div>

        {/* Development & Business State */}
        {builtBusinessDef ? (
          <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner font-mono font-bold text-xs"
                  style={{
                    backgroundColor: `${district.color}20`,
                    borderColor: `${district.color}50`,
                  }}
                >
                  {builtBusinessDef.code}
                </div>
                <div>
                  <h4 className="font-bold text-stone-100 text-sm">
                    {builtBusinessDef.name}
                  </h4>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {builtBusinessDef.nameZh} · {builtBusinessDef.category}
                  </span>
                </div>
              </div>

              {chainComplete ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  COMPLETE!
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">
                  {builtBusinessDef.code} {builtChainCount}/{builtBusinessDef.requiredTiles}
                </span>
              )}
            </div>

            {/* Pips & Revenue */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-800/80 text-[11px]">
              <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Completion Progress</span>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: builtBusinessDef.requiredTiles }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full border ${
                        i < builtChainCount
                          ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'bg-stone-800 border-stone-700'
                      }`}
                    />
                  ))}
                </div>
                {!chainComplete && (
                  <span className="text-[10px] text-amber-400/90 mt-1 block">
                    Needs {builtBusinessDef.requiredTiles - builtChainCount} more to complete!
                  </span>
                )}
              </div>

              <div className="bg-stone-900/80 p-2 rounded-xl border border-stone-800">
                <span className="text-stone-400 block text-[10px]">Current Fiscal Yield</span>
                <span className="font-bold text-emerald-400 font-mono text-xs mt-0.5 block">
                  +${currentYield.toLocaleString()} / year
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Complete Max: +${builtBusinessDef.completeIncome.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Recall Button for Active Player */}
            {isOwnedByActivePlayer && currentPhase === 'build' && (
              <button
                id="inspector-recall-tile-btn"
                onClick={() => {
                  sound.playTilePlace();
                  onRecallTileFromLot(selectedLotId);
                }}
                className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span>Recall Tile to Tray</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-950/70 border border-dashed border-stone-800 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-stone-900 mx-auto flex items-center justify-center text-stone-500">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-300 block">Undeveloped Land</span>
              <span className="text-[11px] text-stone-500">
                {isOwnedByActivePlayer
                  ? 'Ready for business establishment.'
                  : 'No business structures established yet.'}
              </span>
            </div>
          </div>
        )}

        {/* Action: Direct Placement if active player owns this vacant lot */}
        {isOwnedByActivePlayer && !lotState.builtBusiness && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[11px] text-stone-400">
                Deploy Shop Tile
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {availableHandTiles.length} in rack
              </span>
            </div>

            {availableHandTiles.length === 0 ? (
              <p className="text-[11px] text-stone-500 italic">
                No unplaced shop tiles in your rack. Acquire more tiles in the trading phase or next year's distribution.
              </p>
            ) : (
              <div className="space-y-2">
                {availableHandTiles.map((tile) => {
                  const bDef = BUSINESS_DEFINITIONS[tile.businessTypeId];
                  return (
                    <div
                      key={tile.id}
                      className="p-2.5 rounded-xl bg-stone-950/90 border border-stone-800 hover:border-amber-500/60 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
                          {bDef.code}
                        </div>
                        <div>
                          <span className="font-bold text-stone-200 block text-xs">
                            {bDef.name}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            Req {bDef.requiredTiles} | Full: +${bDef.completeIncome.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        id={`inspector-place-tile-${tile.id}`}
                        onClick={() => {
                          sound.playTilePlace();
                          onBuildTileOnLot(tile.id, selectedLotId);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-emerald-950"
                      >
                        <Hammer className="w-3.5 h-3.5" />
                        <span>Place</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Adjacency & Urban Connectivity info */}
        <div className="p-3 rounded-2xl bg-stone-950/50 border border-stone-800/60">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-1">
            Adjacent Parcels
          </span>
          <div className="flex flex-wrap gap-1">
            {lotDef.adjacentLotIds.map((adjId) => {
              const adjLot = lots[adjId];
              return (
                <span
                  key={adjId}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    adjLot?.ownerId === activePlayer.id
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  Lot {adjId}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
