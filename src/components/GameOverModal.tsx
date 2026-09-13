import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, LotState, BusinessTile } from '../types';
import { Trophy, Award, RefreshCw, Crown } from 'lucide-react';

interface GameOverModalProps {
  winnerId: string | null;
  players: Player[];
  lots: Record<string, LotState>;
  playerTiles: BusinessTile[];
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winnerId,
  players,
  lots,
  playerTiles,
  onPlayAgain,
}) => {
  useEffect(() => {
    // Launch festive confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, []);

  // Compute final net worth rankings
  const rankings = players.map((player) => {
    const playerLots = Object.values(lots).filter((l) => l.ownerId === player.id);
    const placedTiles = playerTiles.filter((t) => t.ownerId === player.id && t.isPlaced);
    const landValue = playerLots.length * 30000;
    const businessEquity = placedTiles.length * 50000;
    const totalNetWorth = player.cash + landValue + businessEquity;

    return {
      player,
      cash: player.cash,
      lotsCount: playerLots.length,
      landValue,
      tilesCount: placedTiles.length,
      businessEquity,
      totalNetWorth,
    };
  }).sort((a, b) => b.totalNetWorth - a.totalNetWorth);

  const champion = rankings[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 flex flex-col text-center">
        {/* Banner */}
        <div className="p-8 bg-gradient-to-b from-amber-950/60 via-stone-900 to-stone-950 border-b border-stone-800 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20 animate-bounce">
            <Crown className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
            Grand Finale Concluded
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-100 mt-1">
            {champion.player.name} is the Tycoon of Xizhi!
          </h2>
          <p className="text-xs text-stone-400 max-w-md mt-2">
            Having built the most lucrative commercial and land empire across Keelung Riverfront, Old Street, Commercial Plaza, Industrial Corridor, and Wenshan Terraces.
          </p>
        </div>

        {/* Standings Table */}
        <div className="p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 text-left">
            Final Tycoon Standings (Net Worth Valuation)
          </h3>

          <div className="space-y-2 text-left">
            {rankings.map((rank, idx) => (
              <div
                key={rank.player.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  idx === 0
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-md'
                    : 'bg-stone-950/60 border-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                      idx === 0
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-stone-100 text-sm">
                        {rank.player.name}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Winner
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Cash: ${rank.cash.toLocaleString()} · {rank.lotsCount} Lots · {rank.tilesCount} Businesses
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block uppercase">Net Wealth</span>
                  <span className="font-mono font-bold text-amber-300 text-base">
                    ${rank.totalNetWorth.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-center">
          <button
            onClick={onPlayAgain}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Launch New Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
