import React from 'react';
import { X, BookOpen, Scroll, ShieldCheck, Scale, MapPin, Layers, Coins, Handshake } from 'lucide-react';

interface RuleBookModalProps {
  onClose: () => void;
}

export const RuleBookModal: React.FC<RuleBookModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-stone-100 text-lg">
                Xizhi Town Design Constitution & Rulebook
              </h2>
              <p className="text-xs text-stone-400">
                Official game mechanics, pillars, and authoritative rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-stone-300 leading-relaxed">
          {/* Section: The Four Pillars */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <h3 className="font-display font-bold text-sm text-amber-400 mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>The Four Pillars of Xizhi Town</span>
            </h3>
            <p className="text-stone-400 mb-3">
              Xizhi Town is an online multiplayer negotiation board game for 3–8 players. Everything in the game revolves strictly around four pillars:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-center">
                <MapPin className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                <strong className="text-stone-100 block">1. Land</strong>
                <span className="text-[10px] text-stone-500">Contextual value</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-center">
                <Layers className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <strong className="text-stone-100 block">2. Business Tiles</strong>
                <span className="text-[10px] text-stone-500">Strict scarcity</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-center">
                <Coins className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <strong className="text-stone-100 block">3. Money</strong>
                <span className="text-[10px] text-stone-500">Integer liquidity</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-center">
                <Handshake className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <strong className="text-stone-100 block">4. Deals</strong>
                <span className="text-[10px] text-stone-500">Free negotiation</span>
              </div>
            </div>
          </div>

          {/* Core Loop */}
          <div>
            <h3 className="font-display font-bold text-stone-100 text-sm mb-2 flex items-center gap-2 text-amber-300">
              <Scroll className="w-4 h-4" />
              <span>The Authoritative Core Loop</span>
            </h3>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-200">1. Receive</span>
              <span className="text-stone-500 self-center">→</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-200">2. Inspect</span>
              <span className="text-stone-500 self-center">→</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-200">3. Negotiate</span>
              <span className="text-stone-500 self-center">→</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-200">4. Trade</span>
              <span className="text-stone-500 self-center">→</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-200">5. Build</span>
              <span className="text-stone-500 self-center">→</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-200">6. Earn</span>
              <span className="text-stone-500 self-center">→</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-amber-300">Repeat</span>
            </div>
          </div>

          {/* Business & Scarcity */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-200 text-xs uppercase tracking-wider text-amber-400">
              Business Philosophy & Scarcity
            </h4>
            <p>
              Businesses require a specific number of contiguous tiles to complete (e.g., 3 or 4 tiles).
              The total supply in the entire game is intentionally scarce (for example, only 5 tiles exist for a 3-tile business).
              Completed businesses yield a major revenue multiplier, while incomplete businesses yield partial revenue per tile.
            </p>
          </div>

          {/* Negotiation & Deferred Payments */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-200 text-xs uppercase tracking-wider text-amber-400">
              Deferred Player-to-Player Payments
            </h4>
            <p>
              Deferred payment is an intentional core mechanic. During negotiation, players can write binding Promissory Notes
              (e.g., <em>"$100k now + $200k in Round 4"</em>). When that round arrives, the authoritative game engine automatically settles the debt during the Earnings phase.
            </p>
          </div>

          {/* The Players ARE the Economy */}
          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-stone-400">
            <strong className="text-stone-200 block mb-1">Principle: The Players ARE the Economy</strong>
            Xizhi Town does not rely on random artificial economic events. The drama, scarcity, and tension arise organically
            from player ownership, lot positioning, business completion rivalries, and master negotiations.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors"
          >
            Close Rulebook
          </button>
        </div>
      </div>
    </div>
  );
};
