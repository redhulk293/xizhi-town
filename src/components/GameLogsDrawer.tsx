import React from 'react';
import { GameLogEntry } from '../types';
import { X, ScrollText, Clock, Tag } from 'lucide-react';

interface GameLogsDrawerProps {
  logs: GameLogEntry[];
  onClose: () => void;
}

export const GameLogsDrawer: React.FC<GameLogsDrawerProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-display font-bold text-stone-100 text-sm">
              Town Chronicle & Ledger
            </h3>
            <span className="text-[10px] text-stone-400">
              Audit log of all trades, builds, distributions & earnings
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {logs.length === 0 ? (
          <div className="text-center py-10 text-xs text-stone-500 italic">
            No logged events yet.
          </div>
        ) : (
          logs.map((log) => {
            let badgeStyle = 'bg-stone-800 text-stone-400';
            if (log.type === 'trade') badgeStyle = 'bg-amber-950/80 text-amber-300 border border-amber-800/50';
            if (log.type === 'build') badgeStyle = 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50';
            if (log.type === 'earn') badgeStyle = 'bg-sky-950/80 text-sky-300 border border-sky-800/50';

            return (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${badgeStyle}`}>
                    {log.type}
                  </span>
                  <span className="text-stone-500 font-mono">
                    Round {log.round} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-stone-200 mt-1 leading-snug">{log.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
