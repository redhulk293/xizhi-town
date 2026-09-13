import React, { useState } from 'react';
import { GameConfig, MapMode } from '../types';
import { sound } from '../utils/soundEngine';
import {
  Compass,
  Play,
  RotateCcw,
  Sliders,
  MapPin,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SetupScreenProps {
  onStartGame: (config: GameConfig, playerNames: string[]) => void;
}

const DISTRICT_KEYS_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => {
  const [mapMode, setMapMode] = useState<MapMode>('small');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 900000) + 100000);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Tycoon Chen (陳董)',
    'Lin Syndicate (林總裁)',
    'Wang Harbor (王船長)',
    'Huang Logistics (黃部長)',
    'Chang Heights (張理事長)',
    'Tsai Development (蔡總裁)',
    'Wu Transit (吳董事長)',
    'Kuo Holdings (郭總督)',
  ]);

  const handleModeChange = (mode: MapMode) => {
    sound.playTileSelect();
    setMapMode(mode);
    if (mode === 'small') {
      if (playerCount > 5) setPlayerCount(4);
    } else {
      if (playerCount < 6) setPlayerCount(6);
    }
  };

  const currentCount = playerCount;
  const totalRounds = mapMode === 'small' ? 6 : 8;
  const totalLots = mapMode === 'small' ? 120 : 192;
  const activeDistrictCount = mapMode === 'small' ? 6 : 8;
  const activeDistrictIds = DISTRICT_KEYS_ORDER.slice(0, activeDistrictCount);

  const handleStart = () => {
    sound.playDealSealed();
    const config: GameConfig = {
      playerCount: currentCount,
      mapMode,
      totalRounds,
      totalLots,
      activeDistrictIds,
      shopTilesPerPlayer: currentCount <= 4 ? 3 : currentCount <= 6 ? 5 : 7,
      startingCash: 150000,
      seed,
    };
    const activeNames = playerNames.slice(0, currentCount);
    onStartGame(config, activeNames);
  };

  const randomizeSeed = () => {
    sound.playTileSelect();
    setSeed(Math.floor(Math.random() * 900000) + 100000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090d12] flex items-center justify-center p-4 overflow-y-auto">
      {/* Subtle Blueprint Grid Backdrop */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative w-full max-w-2xl bg-[#13171f] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {/* Title & Authentic Theme Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Negotiation Board Game</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-100 uppercase font-serif">
            Xizhi Town <span className="text-amber-500 font-sans">汐止小鎮</span>
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
            Trade land parcels, negotiate shop tiles, complete business groups, and build the Keelung River economic powerhouse.
          </p>
        </div>

        {/* 1. Map Mode Selection */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Town Map Scope</span>
            <span className="text-amber-400 text-[11px] font-mono lowercase">permanent cadastral parcels</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleModeChange('small')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                mapMode === 'small'
                  ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-stone-100 text-sm">Small Town</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono">
                  6 Years
                </span>
              </div>
              <div className="text-xs text-stone-400 mt-2">
                120 Parcels (Lot 001–120) • 3 to 5 Tycoons
              </div>
              <div className="text-[11px] text-amber-400/80 mt-1 font-mono">
                Districts A to F • 6 Districts
              </div>
            </button>

            <button
              onClick={() => handleModeChange('large')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                mapMode === 'large'
                  ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-400" />
                  <span className="font-bold text-stone-100 text-sm">Large Town</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-400 font-mono">
                  8 Years
                </span>
              </div>
              <div className="text-xs text-stone-400 mt-2">
                192 Parcels (Lot 001–192) • 6 to 8 Tycoons
              </div>
              <div className="text-[11px] text-pink-400/80 mt-1 font-mono">
                Districts A to H • Includes Cultural & Financial Heights
              </div>
            </button>
          </div>
        </div>

        {/* 2. Player Count Selector */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
            Number of Tycoons ({currentCount} Players • {currentCount <= 4 ? 3 : currentCount <= 6 ? 5 : 7} Shop Tiles/Year)
          </label>
          <div className="flex items-center gap-2">
            {(mapMode === 'small' ? [3, 4, 5] : [6, 7, 8]).map((num) => (
              <button
                key={num}
                onClick={() => {
                  sound.playTileSelect();
                  setPlayerCount(num);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  playerCount === num
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black scale-105'
                    : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-white'
                }`}
              >
                {num} Players
              </button>
            ))}
          </div>
        </div>

        {/* 3. Core Rules Summary Pill */}
        <div className="mb-5 p-3 rounded-2xl bg-stone-900/70 border border-stone-800 text-xs flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-stone-200 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Rules Overview:</span>
          </div>
          <div className="text-[11px] text-stone-400 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <strong className="text-amber-300">Land Lots:</strong> Randomly dealt, players choose which lots to KEEP and return the rest.
            </div>
            <div>
              <strong className="text-emerald-300">Shop Tiles:</strong> Randomly dealt, players KEEP ALL tiles received into their hand!
            </div>
            <div className="col-span-1 sm:col-span-2 text-stone-400">
              <strong className="text-sky-300">Shops & Income:</strong> 3 to 8 piece shops. Incomplete shops earn partial income; completed groups earn maximum income (8-piece harbor yields highest potential $260k).
            </div>
          </div>
        </div>

        {/* 4. Player Names Customization */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
            Tycoon Rosters
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {Array.from({ length: currentCount }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-stone-900/80 border border-stone-800 px-3 py-1.5 rounded-xl"
              >
                <span className="text-[11px] font-mono font-bold text-amber-500">P{idx + 1}</span>
                <input
                  type="text"
                  value={playerNames[idx]}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[idx] = e.target.value;
                    setPlayerNames(newNames);
                  }}
                  className="bg-transparent text-xs text-stone-200 font-semibold focus:outline-none w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Deterministic Seed Control */}
        <div className="mb-6 flex items-center justify-between p-3 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs">
          <div>
            <div className="font-bold text-stone-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-stone-400" />
              <span>Deterministic Board Seed</span>
            </div>
            <div className="text-[11px] text-stone-500">
              Guarantees reproducible tile & lot distribution
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-400 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
              #{seed}
            </span>
            <button
              onClick={randomizeSeed}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Roll New Seed"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Launch Button */}
        <button
          id="start-game-button"
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-stone-950" />
          <span>Open Xizhi Town Board</span>
        </button>
      </div>
    </div>
  );
};
