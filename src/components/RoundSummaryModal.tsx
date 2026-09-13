import React from 'react';
import { IncomeBreakdown, Player } from '../types';
import {
  Coins,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  FileText,
  Building,
  Award,
} from 'lucide-react';

interface RoundSummaryModalProps {
  round: number;
  totalRounds: number;
  incomes: IncomeBreakdown[];
  players: Player[];
  onContinue: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  round,
  totalRounds,
  incomes,
  players,
  onContinue,
}) => {
  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
              Fiscal Ledger & Revenue Settlement
            </span>
            <h2 className="font-display font-bold text-stone-100 text-xl">
              Round {round} of {totalRounds} Payout Report
            </h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Coins className="w-7 h-7" />
          </div>
        </div>

        {/* Players Income Cards */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {incomes.map((inc) => {
            const player = getPlayer(inc.playerId);
            if (!player) return null;

            return (
              <div
                key={inc.playerId}
                className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/90 flex flex-col gap-3"
              >
                {/* Player Top Line */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="font-display font-bold text-stone-100 text-sm">
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block uppercase">Round Net Cash</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        +${inc.netIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right pl-3 border-l border-stone-800">
                      <span className="text-[10px] text-stone-400 block uppercase">New Balance</span>
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        ${player.cash.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Business Line Items */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 block mb-1">
                    Business Tile Revenue:
                  </span>
                  {inc.details.length === 0 ? (
                    <span className="text-xs text-stone-600 italic">No operational businesses deployed.</span>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {inc.details.map((d, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1.5">
                            {d.isComplete ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Building className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <div>
                              <span className="font-semibold text-stone-200 block">{d.businessName}</span>
                              <span className="text-[10px] text-stone-500">
                                {d.tileCount} tiles on [{d.lots.join(', ')}] ·{' '}
                                {d.isComplete ? 'Complete' : 'Incomplete'}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-stone-100 text-xs">
                            ${d.income.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Settled Promissory Notes */}
                {inc.settledDebts.length > 0 && (
                  <div className="pt-2 border-t border-stone-800/80">
                    <span className="text-[11px] font-semibold text-violet-400 block mb-1">
                      Promissory Notes Settled:
                    </span>
                    <div className="space-y-1">
                      {inc.settledDebts.map((debt, idx) => (
                        <div
                          key={idx}
                          className="text-xs flex items-center justify-between text-stone-300 px-2 py-1 rounded bg-stone-900/60"
                        >
                          <span>
                            {debt.type === 'received'
                              ? `Received promissory payment from ${debt.otherPlayerName}`
                              : `Paid promissory obligation to ${debt.otherPlayerName}`}
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              debt.type === 'received' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {debt.type === 'received' ? '+' : '-'}${debt.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Continue Button */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            {round >= totalRounds ? 'All rounds completed! Proceed to final standings.' : `Prepare for Round ${round + 1} Land & Tile distribution.`}
          </span>

          <button
            onClick={onContinue}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20"
          >
            <span>{round >= totalRounds ? 'View Final Tycoon Standings' : `Advance to Round ${round + 1}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
