import React, { useState, useEffect } from 'react';
import {
  GameState,
  GameConfig,
  TradeOfferSide,
  Player,
  BusinessTile,
} from './types';
import {
  startNewGame,
  createTradeProposal,
  acceptTradeProposal,
  declineTradeProposal,
  buildBusinessTile,
  recallBusinessTile,
  executeEarnPhase,
  advanceToNextRound,
  confirmPlayerLandDraft,
} from './game/gameEngine';
import { TownMap } from './components/TownMap';
import { GameHUD } from './components/GameHUD';
import { ContextInspector } from './components/ContextInspector';
import { PlayerTray } from './components/PlayerTray';
import { VoiceCallOverlay } from './components/VoiceCallOverlay';
import { DealTable } from './components/DealTable';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { GameOverModal } from './components/GameOverModal';
import { RuleBookModal } from './components/RuleBookModal';
import { SetupScreen } from './components/SetupScreen';
import { GameLogsDrawer } from './components/GameLogsDrawer';
import { sound } from './utils/soundEngine';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [selectedTileForPlacement, setSelectedTileForPlacement] = useState<BusinessTile | null>(null);

  // Modals & Overlays
  const [isDealTableOpen, setIsDealTableOpen] = useState<boolean>(false);
  const [dealTablePartnerId, setDealTablePartnerId] = useState<string | undefined>(undefined);
  const [activeCallTarget, setActiveCallTarget] = useState<Player | null>(null);
  const [isRulebookOpen, setIsRulebookOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Keyboard shortcut: ESC clears selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedTileForPlacement) {
          setSelectedTileForPlacement(null);
        } else if (selectedLotId) {
          setSelectedLotId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTileForPlacement, selectedLotId]);

  // Launch Game
  const handleStartGame = (config: GameConfig, playerNames: string[]) => {
    const freshGame = startNewGame(config, playerNames);
    setGameState(freshGame);
    setSelectedLotId(null);
    showToast(`Welcome to Xizhi Town! Year 1 begins with Land & Tile distribution.`);
  };

  // Reset Game
  const handleResetGame = () => {
    if (window.confirm('Start a new game session and reset the town?')) {
      setGameState(null);
      setSelectedLotId(null);
      setActiveCallTarget(null);
      setIsDealTableOpen(false);
    }
  };

  if (!gameState) {
    return (
      <>
        <SetupScreen onStartGame={handleStartGame} />
        {isRulebookOpen && <RuleBookModal onClose={() => setIsRulebookOpen(false)} />}
      </>
    );
  }

  const activePlayer =
    gameState.players.find((p) => p.id === gameState.activePlayerId) || gameState.players[0];

  const activeLandDraft = gameState.pendingLandDrafts[activePlayer.id];

  // Phase Advancement according to Chinatown-style game loop:
  // Distribution -> Inspect -> Negotiate -> Build -> Earn -> Next Year
  const handleAdvancePhase = () => {
    if (gameState.currentPhase === 'distribution') {
      if (activeLandDraft && !activeLandDraft.isConfirmed) {
        showToast(`Please choose and confirm your ${activeLandDraft.keepCount} kept land parcels first.`);
        return;
      }
      setGameState((prev) => (prev ? { ...prev, currentPhase: 'inspect' } : null));
      showToast('Cadastral Inspection: Survey the town parcels and plan your business locations.');
    } else if (gameState.currentPhase === 'inspect') {
      setGameState((prev) => (prev ? { ...prev, currentPhase: 'negotiate' } : null));
      showToast('Trading Desk OPEN: Propose multi-asset trades or radio other tycoons.');
    } else if (gameState.currentPhase === 'negotiate') {
      setGameState((prev) => (prev ? { ...prev, currentPhase: 'build' } : null));
      showToast('Development Phase: Place your business tiles onto your owned parcels.');
    } else if (gameState.currentPhase === 'build') {
      const earnedState = executeEarnPhase(gameState);
      setGameState({ ...earnedState, currentPhase: 'earn' });
      sound.playChainComplete();
      showToast('Fiscal revenues and promissory contracts settled!');
    } else if (gameState.currentPhase === 'earn') {
      const nextRoundState = advanceToNextRound(gameState);
      setGameState(nextRoundState);
      if (nextRoundState.currentPhase !== 'ended') {
        showToast(`Year ${nextRoundState.currentRound} commenced! New land & shop tiles distributed.`);
      }
    }
  };

  // Direct Placement on Map
  const handleBuildTile = (tileId: string, lotId: string) => {
    const res = buildBusinessTile(gameState, activePlayer.id, tileId, lotId);
    if (!res.success) {
      showToast(res.error || 'Could not place tile.');
    } else {
      setGameState(res.state);
      setSelectedTileForPlacement(null);
      setSelectedLotId(lotId);
      sound.playTilePlace();
      showToast(`Shop tile placed on parcel ${lotId}!`);
    }
  };

  // Recall Tile
  const handleRecallTile = (lotId: string) => {
    const res = recallBusinessTile(gameState, activePlayer.id, lotId);
    if (!res.success) {
      showToast(res.error || 'Could not recall tile.');
    } else {
      setGameState(res.state);
      sound.playTilePlace();
      showToast(`Tile returned to your tray.`);
    }
  };

  // Trade Handling
  const handleSendProposal = (proposal: {
    senderId: string;
    receiverId: string;
    offer: TradeOfferSide;
    request: TradeOfferSide;
    note?: string;
  }) => {
    const res = createTradeProposal(gameState, proposal);
    if (!res.success) {
      showToast(res.error || 'Proposal failed.');
    } else {
      setGameState(res.state);
      showToast('Proposal dispatched to Trading Desk!');
      setIsDealTableOpen(false);
    }
  };

  const handleAcceptProposal = (proposalId: string) => {
    const res = acceptTradeProposal(gameState, proposalId);
    if (!res.success) {
      showToast(res.error || 'Could not complete deal.');
    } else {
      setGameState(res.state);
      showToast('DEAL COMPLETED! Assets transferred atomically.');
    }
  };

  const handleDeclineProposal = (proposalId: string) => {
    const updated = declineTradeProposal(gameState, proposalId);
    setGameState(updated);
    showToast('Trade proposal declined.');
  };

  // Voice Call
  const handleStartCall = (target: Player) => {
    if (target.id === activePlayer.id) return;
    setActiveCallTarget(target);
  };

  const handleEndCall = () => {
    setActiveCallTarget(null);
  };

  // Open Deal Table with a specific player
  const handleOpenDealWithPlayer = (partnerId?: string) => {
    setDealTablePartnerId(partnerId);
    setIsDealTableOpen(true);
  };

  // Highlights on board (for instance, dealt lots during land draft)
  const highlightedLotIds =
    gameState.currentPhase === 'distribution' && activeLandDraft && !activeLandDraft.isConfirmed
      ? activeLandDraft.dealtLotIds
      : [];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0e13] text-stone-100 font-sans select-none">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-full shadow-2xl text-xs flex items-center gap-2 border border-amber-300 animate-in fade-in duration-150">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Floating Board-Game HUD */}
      <GameHUD
        currentRound={gameState.currentRound}
        totalRounds={gameState.config.totalRounds}
        currentPhase={gameState.currentPhase}
        players={gameState.players}
        activePlayerId={gameState.activePlayerId}
        onSelectActivePlayer={(id) => {
          setSelectedTileForPlacement(null);
          setGameState((prev) => (prev ? { ...prev, activePlayerId: id } : null));
        }}
        onAdvancePhase={handleAdvancePhase}
        onOpenRulebook={() => setIsRulebookOpen(true)}
        onToggleLogs={() => setIsLogsOpen(!isLogsOpen)}
        onResetGame={handleResetGame}
        onCallPlayer={handleStartCall}
      />

      {/* THE MAP IS THE VISUAL CENTER (Edge-to-edge board viewport) */}
      <main className="absolute inset-0 w-full h-full">
        <TownMap
          lots={gameState.lots}
          players={gameState.players}
          activePlayer={activePlayer}
          selectedLotId={selectedLotId}
          selectedTileForPlacement={selectedTileForPlacement}
          activeDistrictIds={gameState.config.activeDistrictIds}
          highlightedLotIds={highlightedLotIds}
          onSelectLot={(lotId) => {
            setSelectedLotId(lotId);
          }}
          onBuildTileOnLot={handleBuildTile}
        />
      </main>

      {/* Contextual Right Inspector (Floating panel, appears only when a lot is selected) */}
      <ContextInspector
        selectedLotId={selectedLotId}
        lots={gameState.lots}
        players={gameState.players}
        activePlayer={activePlayer}
        playerTiles={gameState.playerTiles}
        currentPhase={gameState.currentPhase}
        onClose={() => setSelectedLotId(null)}
        onCallPlayer={handleStartCall}
        onTradeWithPlayer={(p) => handleOpenDealWithPlayer(p.id)}
        onBuildTileOnLot={handleBuildTile}
        onRecallTileFromLot={handleRecallTile}
      />

      {/* Tactile Player Board Rack at the Bottom */}
      <PlayerTray
        player={activePlayer}
        lots={gameState.lots}
        playerTiles={gameState.playerTiles}
        currentPhase={gameState.currentPhase}
        pendingLandDraft={activeLandDraft}
        promissoryNotes={gameState.promissoryNotes}
        selectedTileForPlacement={selectedTileForPlacement}
        onSelectTileForPlacement={(tile) => setSelectedTileForPlacement(tile)}
        onSelectLot={(lotId) => setSelectedLotId(lotId)}
        onConfirmLandDraft={(keptIds) => {
          const updated = confirmPlayerLandDraft(gameState, activePlayer.id, keptIds);
          setGameState(updated);
          showToast(`Kept ${keptIds.length} parcels. Unkept parcels returned to reserves.`);
        }}
        onOpenTrade={() => handleOpenDealWithPlayer()}
      />

      {/* Lightweight Floating Voice Call Overlay */}
      {activeCallTarget && (
        <VoiceCallOverlay
          activePlayer={activePlayer}
          targetPlayer={activeCallTarget}
          allPlayers={gameState.players}
          onEndCall={handleEndCall}
          onOpenTradeWithPlayer={(pId) => handleOpenDealWithPlayer(pId)}
        />
      )}

      {/* Physical Deal Table / Trade Desk */}
      {isDealTableOpen && (
        <DealTable
          activePlayer={activePlayer}
          players={gameState.players}
          lots={gameState.lots}
          playerTiles={gameState.playerTiles}
          activeProposals={gameState.activeProposals}
          initialPartnerId={dealTablePartnerId}
          currentRound={gameState.currentRound}
          totalRounds={gameState.config.totalRounds}
          onSendProposal={handleSendProposal}
          onAcceptProposal={handleAcceptProposal}
          onDeclineProposal={handleDeclineProposal}
          onCallPlayer={handleStartCall}
          onClose={() => setIsDealTableOpen(false)}
        />
      )}

      {/* Round Earnings Summary Modal */}
      {gameState.currentPhase === 'earn' && gameState.lastRoundIncome && (
        <RoundSummaryModal
          round={gameState.currentRound}
          totalRounds={gameState.config.totalRounds}
          incomes={gameState.lastRoundIncome}
          players={gameState.players}
          onContinue={handleAdvancePhase}
        />
      )}

      {/* Game Over Ceremony */}
      {gameState.currentPhase === 'ended' && (
        <GameOverModal
          winnerId={gameState.winnerId}
          players={gameState.players}
          lots={gameState.lots}
          playerTiles={gameState.playerTiles}
          onPlayAgain={handleResetGame}
        />
      )}

      {/* Rulebook Modal */}
      {isRulebookOpen && <RuleBookModal onClose={() => setIsRulebookOpen(false)} />}

      {/* Town Chronicle Audit Logs */}
      {isLogsOpen && (
        <GameLogsDrawer
          logs={gameState.logs}
          onClose={() => setIsLogsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
