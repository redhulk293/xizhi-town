import React, { useState } from 'react';
import {
  Player,
  LotState,
  BusinessTile,
  TradeProposal,
  TradeOfferSide,
} from '../types';
import { LOT_DEFINITIONS, DISTRICTS } from '../data/districts';
import { BUSINESS_DEFINITIONS } from '../data/businesses';
import { sound } from '../utils/soundEngine';
import {
  X,
  Handshake,
  Coins,
  Scroll,
  Layers,
  Check,
  RotateCcw,
  ArrowLeftRight,
  Phone,
  Anchor,
  Coffee,
  Store,
  ShoppingBag,
  Cpu,
  Mountain,
  Landmark,
  Truck,
  Plus,
  Minus,
} from 'lucide-react';

interface DealTableProps {
  activePlayer: Player;
  players: Player[];
  lots: Record<string, LotState>;
  playerTiles: BusinessTile[];
  activeProposals: TradeProposal[];
  initialPartnerId?: string;
  currentRound: number;
  totalRounds: number;
  onSendProposal: (proposal: {
    senderId: string;
    receiverId: string;
    offer: TradeOfferSide;
    request: TradeOfferSide;
    note?: string;
  }) => void;
  onAcceptProposal: (proposalId: string) => void;
  onDeclineProposal: (proposalId: string) => void;
  onCallPlayer: (player: Player) => void;
  onClose: () => void;
}

export const DealTable: React.FC<DealTableProps> = ({
  activePlayer,
  players,
  lots,
  playerTiles,
  activeProposals,
  initialPartnerId,
  currentRound,
  totalRounds,
  onSendProposal,
  onAcceptProposal,
  onDeclineProposal,
  onCallPlayer,
  onClose,
}) => {
  const otherPlayers = players.filter((p) => p.id !== activePlayer.id);
  const [partnerId, setPartnerId] = useState<string>(
    initialPartnerId && initialPartnerId !== activePlayer.id
      ? initialPartnerId
      : otherPlayers[0]?.id || ''
  );

  const partner = players.find((p) => p.id === partnerId) || otherPlayers[0];

  // Offer State (Sender gives)
  const [offerLots, setOfferLots] = useState<string[]>([]);
  const [offerTiles, setOfferTiles] = useState<string[]>([]);
  const [offerCash, setOfferCash] = useState<number>(0);
  const [offerDeferredAmount, setOfferDeferredAmount] = useState<number>(0);
  const [offerDeferredRound, setOfferDeferredRound] = useState<number>(
    Math.min(currentRound + 1, totalRounds)
  );

  // Request State (Sender wants from partner)
  const [reqLots, setReqLots] = useState<string[]>([]);
  const [reqTiles, setReqTiles] = useState<string[]>([]);
  const [reqCash, setReqCash] = useState<number>(0);
  const [reqDeferredAmount, setReqDeferredAmount] = useState<number>(0);
  const [reqDeferredRound, setReqDeferredRound] = useState<number>(
    Math.min(currentRound + 1, totalRounds)
  );

  const [activeTab, setActiveTab] = useState<'create' | 'incoming'>('create');

  // Available assets for activePlayer
  const myOwnedLots = Object.keys(lots).filter((id) => lots[id].ownerId === activePlayer.id);
  const myHandTiles = playerTiles.filter((t) => t.ownerId === activePlayer.id && !t.isPlaced);

  // Available assets for partner
  const partnerOwnedLots = partner
    ? Object.keys(lots).filter((id) => lots[id].ownerId === partner.id)
    : [];
  const partnerHandTiles = partner
    ? playerTiles.filter((t) => t.ownerId === partner.id && !t.isPlaced)
    : [];

  // Incoming proposals for active player
  const incomingProposals = activeProposals.filter(
    (p) => p.receiverId === activePlayer.id && p.status === 'pending'
  );

  // Outgoing pending proposals from active player
  const outgoingProposals = activeProposals.filter(
    (p) => p.senderId === activePlayer.id && p.status === 'pending'
  );

  const renderIcon = (iconName: string, className = 'w-3.5 h-3.5') => {
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

  const handlePropose = () => {
    if (!partner) return;
    if (
      offerLots.length === 0 &&
      offerTiles.length === 0 &&
      offerCash === 0 &&
      offerDeferredAmount === 0 &&
      reqLots.length === 0 &&
      reqTiles.length === 0 &&
      reqCash === 0 &&
      reqDeferredAmount === 0
    ) {
      alert('Please place at least one asset on the deal table.');
      return;
    }

    sound.playDealGavel();
    onSendProposal({
      senderId: activePlayer.id,
      receiverId: partner.id,
      offer: {
        lotIds: offerLots,
        tileIds: offerTiles,
        cash: offerCash,
        deferredPayments:
          offerDeferredAmount > 0
            ? [{ amount: offerDeferredAmount, dueRound: offerDeferredRound }]
            : [],
      },
      request: {
        lotIds: reqLots,
        tileIds: reqTiles,
        cash: reqCash,
        deferredPayments:
          reqDeferredAmount > 0
            ? [{ amount: reqDeferredAmount, dueRound: reqDeferredRound }]
            : [],
      },
    });

    // Reset Table
    setOfferLots([]);
    setOfferTiles([]);
    setOfferCash(0);
    setOfferDeferredAmount(0);
    setReqLots([]);
    setReqTiles([]);
    setReqCash(0);
    setReqDeferredAmount(0);
  };

  const handleCounterProposal = (prop: TradeProposal) => {
    // Invert the proposal assets onto the table for instant editing
    setPartnerId(prop.senderId);
    setOfferLots(prop.request.lotIds);
    setOfferTiles(prop.request.tileIds);
    setOfferCash(prop.request.cash);
    setOfferDeferredAmount(prop.request.deferredPayments[0]?.amount || 0);

    setReqLots(prop.offer.lotIds);
    setReqTiles(prop.offer.tileIds);
    setReqCash(prop.offer.cash);
    setReqDeferredAmount(prop.offer.deferredPayments[0]?.amount || 0);

    // Decline existing so new counter can take its place
    onDeclineProposal(prop.id);
    setActiveTab('create');
    sound.playMapSelect();
  };

  return (
    <div
      id="deal-table-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl bg-stone-900 border-2 border-stone-700/80 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Table Top Banner */}
        <div className="px-6 py-4 bg-stone-950/90 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-100 text-lg leading-tight flex items-center gap-2">
                <span>The Trading Desk</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-400 font-normal">
                  Round {currentRound}
                </span>
              </h2>
              <span className="text-xs text-stone-400">
                Direct physical multi-asset negotiation and promissory agreements
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button
                id="trade-tab-create"
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'create'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Draft Deal
              </button>
              <button
                id="trade-tab-incoming"
                onClick={() => setActiveTab('incoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                  activeTab === 'incoming'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>Proposals</span>
                {incomingProposals.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[10px]">
                    {incomingProposals.length}
                  </span>
                )}
              </button>
            </div>

            <button
              id="deal-table-close-btn"
              onClick={() => {
                sound.playMapSelect();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors border border-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'create' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Trade Partner Bar */}
            <div className="flex items-center justify-between bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Trading With:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {otherPlayers.map((p) => {
                    const isSelected = p.id === partnerId;
                    return (
                      <button
                        key={p.id}
                        id={`deal-partner-select-${p.id}`}
                        onClick={() => {
                          sound.playMapSelect();
                          setPartnerId(p.id);
                          setReqLots([]);
                          setReqTiles([]);
                          setReqCash(0);
                          setReqDeferredAmount(0);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                          isSelected
                            ? 'bg-stone-800 border-amber-400 text-stone-100 ring-2 ring-amber-400/40'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span>{p.name}</span>
                        <span className="font-mono text-[11px] text-amber-400">
                          ${(p.cash / 1000).toFixed(0)}k
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {partner && (
                <button
                  id="deal-call-partner-btn"
                  onClick={() => {
                    sound.playRadioBeep(true);
                    onCallPlayer(partner);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {partner.name}</span>
                </button>
              )}
            </div>

            {/* The Physical Table: Left (You give) vs Right (You get) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* YOUR SIDE */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-3xl p-4 sm:p-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: activePlayer.color }}
                    />
                    <h3 className="font-bold text-stone-200 text-sm">
                      Your Offer (What You Put Up)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-amber-400">
                    Avail: ${activePlayer.cash.toLocaleString()}
                  </span>
                </div>

                {/* Lots on table */}
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-1.5">
                    Land Parcels ({offerLots.length} selected)
                  </span>
                  {myOwnedLots.length === 0 ? (
                    <span className="text-xs text-stone-500 italic block">No land titles held</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {myOwnedLots.map((lotId) => {
                        const lDef = LOT_DEFINITIONS.find((l) => l.id === lotId);
                        const isSelected = offerLots.includes(lotId);
                        const d = lDef ? DISTRICTS[lDef.districtId] : null;
                        return (
                          <button
                            key={lotId}
                            onClick={() => {
                              sound.playMapSelect();
                              setOfferLots(
                                isSelected
                                  ? offerLots.filter((id) => id !== lotId)
                                  : [...offerLots, lotId]
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: d?.color }}
                            />
                            <span>{lotId}</span>
                            <span className="text-[10px] text-stone-500">
                              {lDef?.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Business tiles on table */}
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-1.5">
                    Business Tiles in Hand ({offerTiles.length} selected)
                  </span>
                  {myHandTiles.length === 0 ? (
                    <span className="text-xs text-stone-500 italic block">No unplaced tiles</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {myHandTiles.map((tile) => {
                        const bDef = BUSINESS_DEFINITIONS[tile.businessTypeId];
                        const isSelected = offerTiles.includes(tile.id);
                        return (
                          <button
                            key={tile.id}
                            onClick={() => {
                              sound.playTilePlace();
                              setOfferTiles(
                                isSelected
                                  ? offerTiles.filter((id) => id !== tile.id)
                                  : [...offerTiles, tile.id]
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            {renderIcon(bDef.iconName, 'w-3.5 h-3.5 text-amber-400')}
                            <span>{bDef.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Immediate Cash */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
                      Immediate Cash Transfer
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      ${offerCash.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[10000, 25000, 50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          sound.playCashChip();
                          setOfferCash((prev) => Math.min(activePlayer.cash, prev + amt));
                        }}
                        className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[11px] font-mono text-amber-300 font-semibold transition-colors"
                      >
                        +${amt / 1000}k
                      </button>
                    ))}
                    <button
                      onClick={() => setOfferCash(0)}
                      className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-[11px] text-stone-500 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Deferred Promissory Note */}
                <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                      <Scroll className="w-3.5 h-3.5 text-amber-400" />
                      Issue Promissory Note
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      ${offerDeferredAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playCashChip();
                        setOfferDeferredAmount((prev) => prev + 25000);
                      }}
                      className="px-2 py-1 rounded-lg bg-stone-800 border border-stone-700 text-[11px] text-amber-300 font-mono font-bold"
                    >
                      +$25k Note
                    </button>
                    <button
                      onClick={() => setOfferDeferredAmount(0)}
                      className="px-2 py-1 rounded-lg bg-stone-800 text-[11px] text-stone-500"
                    >
                      Clear
                    </button>
                    {offerDeferredAmount > 0 && (
                      <div className="ml-auto text-[11px] text-stone-400">
                        Due: Rnd {offerDeferredRound}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* THEIR SIDE */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-3xl p-4 sm:p-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: partner?.color }}
                    />
                    <h3 className="font-bold text-stone-200 text-sm">
                      Their Side (What You Want from {partner?.name})
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-amber-400">
                    Avail: ${partner ? partner.cash.toLocaleString() : '0'}
                  </span>
                </div>

                {/* Partner Lots */}
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-1.5">
                    Their Land Parcels ({reqLots.length} requested)
                  </span>
                  {partnerOwnedLots.length === 0 ? (
                    <span className="text-xs text-stone-500 italic block">
                      {partner?.name} has no land titles
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {partnerOwnedLots.map((lotId) => {
                        const lDef = LOT_DEFINITIONS.find((l) => l.id === lotId);
                        const isSelected = reqLots.includes(lotId);
                        const d = lDef ? DISTRICTS[lDef.districtId] : null;
                        return (
                          <button
                            key={lotId}
                            onClick={() => {
                              sound.playMapSelect();
                              setReqLots(
                                isSelected
                                  ? reqLots.filter((id) => id !== lotId)
                                  : [...reqLots, lotId]
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: d?.color }}
                            />
                            <span>{lotId}</span>
                            <span className="text-[10px] text-stone-500">
                              {lDef?.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Partner Business Tiles */}
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-1.5">
                    Their Hand Tiles ({reqTiles.length} requested)
                  </span>
                  {partnerHandTiles.length === 0 ? (
                    <span className="text-xs text-stone-500 italic block">
                      {partner?.name} has no unplaced tiles in hand
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {partnerHandTiles.map((tile) => {
                        const bDef = BUSINESS_DEFINITIONS[tile.businessTypeId];
                        const isSelected = reqTiles.includes(tile.id);
                        return (
                          <button
                            key={tile.id}
                            onClick={() => {
                              sound.playTilePlace();
                              setReqTiles(
                                isSelected
                                  ? reqTiles.filter((id) => id !== tile.id)
                                  : [...reqTiles, tile.id]
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            {renderIcon(bDef.iconName, 'w-3.5 h-3.5 text-cyan-400')}
                            <span>{bDef.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Requested Cash */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
                      Requested Cash Payment
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      ${reqCash.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[10000, 25000, 50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          sound.playCashChip();
                          setReqCash((prev) =>
                            partner ? Math.min(partner.cash, prev + amt) : prev + amt
                          );
                        }}
                        className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[11px] font-mono text-cyan-300 font-semibold transition-colors"
                      >
                        +${amt / 1000}k
                      </button>
                    ))}
                    <button
                      onClick={() => setReqCash(0)}
                      className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-[11px] text-stone-500 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Request Promissory Note */}
                <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                      <Scroll className="w-3.5 h-3.5 text-cyan-400" />
                      Request Promissory Note
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      ${reqDeferredAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playCashChip();
                        setReqDeferredAmount((prev) => prev + 25000);
                      }}
                      className="px-2 py-1 rounded-lg bg-stone-800 border border-stone-700 text-[11px] text-cyan-300 font-mono font-bold"
                    >
                      +$25k Note
                    </button>
                    <button
                      onClick={() => setReqDeferredAmount(0)}
                      className="px-2 py-1 rounded-lg bg-stone-800 text-[11px] text-stone-500"
                    >
                      Clear
                    </button>
                    {reqDeferredAmount > 0 && (
                      <div className="ml-auto text-[11px] text-stone-400">
                        Due: Rnd {reqDeferredRound}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action: Propose Deal */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-stone-400 italic">
                Deals take effect atomically when approved by the counterparty.
              </span>

              <button
                id="deal-send-proposal-btn"
                onClick={handlePropose}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-950/60 active:scale-95 transition-all"
              >
                <Handshake className="w-5 h-5" />
                <span>Send Proposal to {partner?.name}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Incoming & Outgoing Proposals Tab */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="font-bold text-stone-200 text-sm mb-3 flex items-center gap-2">
                <span>Offers Received for Your Review</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-xs">
                  {incomingProposals.length}
                </span>
              </h3>

              {incomingProposals.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-stone-950/50 border border-stone-800 text-stone-500 text-xs">
                  No pending proposals waiting for your review.
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingProposals.map((prop) => {
                    const sender = players.find((p) => p.id === prop.senderId);
                    return (
                      <div
                        key={prop.id}
                        className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                              style={{ backgroundColor: sender?.color }}
                            >
                              {sender?.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-stone-200 text-sm block">
                                {sender?.name} proposes a trade deal
                              </span>
                              <span className="text-[11px] text-stone-500">
                                Dispatched in Round {prop.roundCreated}
                              </span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                            Awaiting Your Decision
                          </span>
                        </div>

                        {/* Proposal Breakdown Table */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-1.5">
                            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
                              You Receive:
                            </span>
                            {prop.offer.lotIds.length > 0 && (
                              <div>
                                Lots:{' '}
                                <strong className="text-stone-200">
                                  {prop.offer.lotIds.join(', ')}
                                </strong>
                              </div>
                            )}
                            {prop.offer.tileIds.length > 0 && (
                              <div>
                                Tiles:{' '}
                                <strong className="text-stone-200">
                                  {prop.offer.tileIds
                                    .map((tId) => {
                                      const t = playerTiles.find((pt) => pt.id === tId);
                                      return t ? BUSINESS_DEFINITIONS[t.businessTypeId]?.name : tId;
                                    })
                                    .join(', ')}
                                </strong>
                              </div>
                            )}
                            {prop.offer.cash > 0 && (
                              <div className="font-mono text-amber-400 font-bold">
                                Cash: +${prop.offer.cash.toLocaleString()}
                              </div>
                            )}
                            {prop.offer.deferredPayments.length > 0 && (
                              <div className="font-mono text-amber-300">
                                Promissory Note: +$
                                {prop.offer.deferredPayments[0].amount.toLocaleString()} (Due Rnd{' '}
                                {prop.offer.deferredPayments[0].dueRound})
                              </div>
                            )}
                          </div>

                          <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-1.5">
                            <span className="text-[11px] uppercase tracking-wider text-rose-400 font-bold block">
                              You Give:
                            </span>
                            {prop.request.lotIds.length > 0 && (
                              <div>
                                Lots:{' '}
                                <strong className="text-stone-200">
                                  {prop.request.lotIds.join(', ')}
                                </strong>
                              </div>
                            )}
                            {prop.request.tileIds.length > 0 && (
                              <div>
                                Tiles:{' '}
                                <strong className="text-stone-200">
                                  {prop.request.tileIds
                                    .map((tId) => {
                                      const t = playerTiles.find((pt) => pt.id === tId);
                                      return t ? BUSINESS_DEFINITIONS[t.businessTypeId]?.name : tId;
                                    })
                                    .join(', ')}
                                </strong>
                              </div>
                            )}
                            {prop.request.cash > 0 && (
                              <div className="font-mono text-amber-400 font-bold">
                                Cash: -${prop.request.cash.toLocaleString()}
                              </div>
                            )}
                            {prop.request.deferredPayments.length > 0 && (
                              <div className="font-mono text-amber-300">
                                Promissory Note: -$
                                {prop.request.deferredPayments[0].amount.toLocaleString()} (Due Rnd{' '}
                                {prop.request.deferredPayments[0].dueRound})
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800/80">
                          <button
                            id={`deal-decline-${prop.id}`}
                            onClick={() => {
                              sound.playMapSelect();
                              onDeclineProposal(prop.id);
                            }}
                            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-bold transition-colors"
                          >
                            Decline
                          </button>

                          <button
                            id={`deal-counter-${prop.id}`}
                            onClick={() => handleCounterProposal(prop)}
                            className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>Counter Offer</span>
                          </button>

                          <button
                            id={`deal-accept-${prop.id}`}
                            onClick={() => {
                              sound.playDealGavel();
                              onAcceptProposal(prop.id);
                            }}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all active:scale-95"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Deal</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Outgoing proposals status */}
            <div>
              <h3 className="font-bold text-stone-400 text-xs uppercase tracking-wider mb-2">
                Your Dispatched Proposals ({outgoingProposals.length} pending)
              </h3>
              {outgoingProposals.map((prop) => {
                const receiver = players.find((p) => p.id === prop.receiverId);
                return (
                  <div
                    key={prop.id}
                    className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="text-stone-300">
                      Dispatched to <strong>{receiver?.name}</strong> • Waiting for their response
                    </span>
                    <span className="text-stone-500 font-mono text-[11px]">Pending</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
