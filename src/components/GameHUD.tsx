import React from 'react';
import { Player, GamePhase } from '../types';
import { sound } from '../utils/soundEngine';
import {
  Coins,
  Radio,
  BookOpen,
  History,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowRight,
  User,
  Users,
} from 'lucide-react';

interface GameHUDProps {
  currentRound: number;
  totalRounds: number;
  currentPhase: GamePhase;
  players: Player[];
  activePlayerId: string;
  onSelectActivePlayer: (id: string) => void;
  onAdvancePhase: () => void;
  onOpenRulebook: () => void;
  onToggleLogs: () => void;
  onResetGame: () => void;
  onCallPlayer: (player: Player) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentRound,
  totalRounds,
  currentPhase,
  players,
  activePlayerId,
  onSelectActivePlayer,
  onAdvancePhase,
  onOpenRulebook,
  onToggleLogs,
  onResetGame,
  onCallPlayer,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const activePlayer = players.find((p) => p.id === activePlayerId) || players[0];

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const getPhaseName = (phase: GamePhase) => {
    switch (phase) {
      case 'distribution': return 'Land & Tile Distribution';
      case 'inspect': return 'Cadastral Inspection';
      case 'negotiate': return 'Open Trading Desk';
      case 'build': return 'Development & Placement';
      case 'earn': return 'Fiscal Payouts';
      case 'ended': return 'Final Valuation';
      default: return phase;
    }
  };

  return (
    <header
      id="main-boardgame-hud"
      className="fixed top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4 flex items-center justify-between"
    >
      {/* Left: Round & Phase Minimalist Board Badge */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-stone-900/90 border border-stone-800/90 rounded-2xl p-2 px-3 sm:px-4 shadow-[0_10px_30px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-amber-400 uppercase tracking-widest">
              Round {currentRound} <span className="text-stone-600 font-normal">/ {totalRounds}</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold text-stone-200 tracking-tight">
              {getPhaseName(currentPhase)}
            </span>
          </div>
        </div>

        <button
          id="hud-advance-phase-btn"
          onClick={() => {
            sound.playMapSelect();
            onAdvancePhase();
          }}
          className="ml-2 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          title="Advance to next phase"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Interactive Seat Switcher / Hotseat Tycoons */}
      <div className="pointer-events-auto hidden md:flex items-center gap-1.5 bg-stone-900/90 border border-stone-800/90 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] backdrop-blur-md">
        {players.map((p) => {
          const isActive = p.id === activePlayerId;
          return (
            <button
              key={p.id}
              id={`hud-player-seat-${p.id}`}
              onClick={() => {
                sound.playMapSelect();
                onSelectActivePlayer(p.id);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-stone-800 text-stone-100 ring-2 ring-amber-400/80 shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
              title={isActive ? `${p.name} (Active Turn)` : `Switch perspective to ${p.name}`}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-black"
                style={{ backgroundColor: p.color }}
              >
                {p.name.slice(0, 1)}
              </div>
              <span className="truncate max-w-[80px]">{p.name}</span>
              <span className="font-mono text-[11px] text-amber-400">
                ${(p.cash / 1000).toFixed(0)}k
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Tools (Sound, Rulebook, Logs, Reset) */}
      <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-900/90 border border-stone-800/90 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.7)] backdrop-blur-md">
        {/* Sound Toggle */}
        <button
          id="hud-sound-toggle"
          onClick={handleToggleSound}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          title={isMuted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-stone-300" />}
        </button>

        {/* Rulebook */}
        <button
          id="hud-rulebook-btn"
          onClick={() => {
            sound.playMapSelect();
            onOpenRulebook();
          }}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          title="Game Rules & Four Pillars"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Town Chronicle Audit Log */}
        <button
          id="hud-logs-btn"
          onClick={() => {
            sound.playMapSelect();
            onToggleLogs();
          }}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          title="Town Chronicle & Deal History"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Reset Session */}
        <button
          id="hud-reset-game-btn"
          onClick={onResetGame}
          className="p-2 rounded-xl text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors"
          title="Reset Game Session"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
