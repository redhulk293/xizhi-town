import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { sound } from '../utils/soundEngine';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Radio,
  Handshake,
  Minimize2,
  Maximize2,
  UserPlus,
  Users,
} from 'lucide-react';

interface VoiceCallOverlayProps {
  activePlayer: Player;
  targetPlayer: Player;
  allPlayers: Player[];
  onEndCall: () => void;
  onOpenTradeWithPlayer?: (playerId: string) => void;
}

export const VoiceCallOverlay: React.FC<VoiceCallOverlayProps> = ({
  activePlayer,
  targetPlayer,
  allPlayers,
  onEndCall,
  onOpenTradeWithPlayer,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [participants, setParticipants] = useState<string[]>([activePlayer.id, targetPlayer.id]);
  const [showInviteMenu, setShowInviteMenu] = useState(false);
  const [audioBars, setAudioBars] = useState<number[]>([40, 65, 30, 80, 55, 90, 45, 70]);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    sound.playRadioBeep(true);
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
      if (!isMuted) {
        setAudioBars([
          Math.floor(25 + Math.random() * 65),
          Math.floor(40 + Math.random() * 55),
          Math.floor(30 + Math.random() * 60),
          Math.floor(50 + Math.random() * 45),
          Math.floor(20 + Math.random() * 75),
          Math.floor(35 + Math.random() * 60),
          Math.floor(45 + Math.random() * 50),
          Math.floor(30 + Math.random() * 65),
        ]);
      } else {
        setAudioBars([10, 10, 10, 10, 10, 10, 10, 10]);
      }
    }, 280);

    return () => {
      clearInterval(interval);
      sound.playRadioBeep(false);
    };
  }, [isMuted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleMic = () => {
    sound.playRadioBeep(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleInvitePlayer = (pId: string) => {
    sound.playRadioBeep(true);
    if (participants.includes(pId)) {
      setParticipants((prev) => prev.filter((id) => id !== pId));
    } else {
      setParticipants((prev) => [...prev, pId]);
    }
  };

  const connectedTycoons = allPlayers.filter((p) => participants.includes(p.id));
  const uninvitedTycoons = allPlayers.filter((p) => !participants.includes(p.id));

  if (isMinimized) {
    return (
      <div
        id="voice-call-minimized"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-5 z-40 bg-stone-900/95 border-2 border-emerald-500/80 text-stone-100 rounded-full shadow-2xl px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-stone-800 transition-all backdrop-blur-md animate-pulse"
      >
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold font-mono text-emerald-300">
            {connectedTycoons.length > 2
              ? `Town Group Call (${connectedTycoons.length})`
              : targetPlayer.name}{' '}
            ({formatTime(callDuration)})
          </span>
        </div>
        <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
      </div>
    );
  }

  return (
    <div
      id="voice-call-floating-card"
      className="fixed bottom-24 right-5 z-40 w-84 bg-stone-900/95 border-2 border-stone-700/80 text-stone-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      {/* Radio Header */}
      <div className="px-3.5 py-2.5 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400">
            {connectedTycoons.length > 2 ? 'Town Conference Channel' : 'Direct Radio Link'}
          </span>
          <span className="text-[10px] text-stone-500 font-mono">
            {formatTime(callDuration)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInviteMenu(!showInviteMenu)}
            className={`p-1 rounded text-xs transition-colors flex items-center gap-1 ${
              showInviteMenu
                ? 'bg-amber-600 text-white'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="Invite Tycoons"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
          <button
            id="voice-call-minimize-btn"
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 transition-colors"
            title="Minimize call widget"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Invite Dropdown */}
      {showInviteMenu && (
        <div className="p-2.5 bg-stone-950 border-b border-stone-800 text-xs">
          <div className="text-stone-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Add Tycoons to Conference
          </div>
          {uninvitedTycoons.length === 0 ? (
            <div className="text-stone-500 text-[11px] italic">All players are in the channel.</div>
          ) : (
            <div className="flex flex-col gap-1">
              {uninvitedTycoons.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleInvitePlayer(p.id)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-semibold text-xs">{p.name}</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px]">+ Add</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connected Tycoons Roster */}
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {connectedTycoons.map((p) => (
            <div
              key={p.id}
              className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-xl bg-stone-950/80 border border-stone-800"
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-emerald-500"
                style={{ backgroundColor: p.color }}
              >
                {p.name.slice(0, 1)}
              </div>
              <span className="text-[11px] font-bold text-stone-200">{p.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Live Audio Visualizer Bars */}
        <div className="h-8 bg-stone-950/80 rounded-lg border border-stone-800/80 flex items-center justify-center gap-1 px-3">
          {audioBars.map((height, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isMuted ? 'bg-stone-700' : 'bg-emerald-400'
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* Call Controls */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            id="voice-call-mic-btn"
            onClick={handleToggleMic}
            className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold border transition-colors ${
              isMuted
                ? 'bg-rose-950/50 border-rose-500/50 text-rose-300 hover:bg-rose-900/50'
                : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-750'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Muted' : 'Mic On'}</span>
          </button>

          <button
            id="voice-call-speaker-btn"
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold border transition-colors ${
              isSpeakerMuted
                ? 'bg-amber-950/50 border-amber-500/50 text-amber-300 hover:bg-amber-900/50'
                : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-750'
            }`}
          >
            {isSpeakerMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isSpeakerMuted ? 'Deafened' : 'Audio'}</span>
          </button>

          <button
            id="voice-call-trade-btn"
            onClick={() => {
              if (onOpenTradeWithPlayer) {
                onOpenTradeWithPlayer(targetPlayer.id);
              }
            }}
            className="py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors"
            title="Open Deal Table without closing call"
          >
            <Handshake className="w-4 h-4 text-amber-400" />
            <span>Deal</span>
          </button>

          <button
            id="voice-call-leave-btn"
            onClick={onEndCall}
            className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex flex-col items-center justify-center gap-1 text-[10px] transition-colors shadow-lg shadow-rose-900/40"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Hang Up</span>
          </button>
        </div>
      </div>
    </div>
  );
};
