import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from "@/contexts/FirebaseProvider";
import {
  subscribeToGame,
  playCard,
  drawCardAction,
  callUnoAction,
  challengeUnoAction,
  awardGamePoints,
  exitGame,
  disbandRoom,
  keepCardAction,
  syncHandshake,
  skipTurnAction,
} from '@/lib/gameService';

import { getCurrentPlayerId } from '@/lib/gameLogic';
import { CARD_TYPES, GAME_STATES } from '@/lib/constants';
import { subscribeToRoom } from '@/lib/roomService';

import PlayerHand from '@/components/uno/PlayerHand';
import GameTable from '@/components/uno/GameTable';
import PlayerSeat from '@/components/uno/PlayerSeat';
import UnoButton from '@/components/uno/UnoButton';
import UnoCard from '@/components/uno/UnoCard';
import ColorPicker from '@/components/uno/ColorPicker';
import SwapPicker from '@/components/uno/SwapPicker';
import GameOverModal from '@/components/uno/GameOverModal';
import MatchSetupLoader from '@/components/uno/MatchSetupLoader';

export default function GameBoard() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user, loading } = useAuth();
  const { db } = useFirebase();

  const [gameState, setGameState] = useState(undefined);
  const [room, setRoom] = useState(undefined);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSwapPicker, setShowSwapPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState(null);
  const [pendingDecisionCard, setPendingDecisionCard] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnTimer, setTurnTimer] = useState(15);

  const [isCached, setIsCached] = useState(false);
  const [handshakeTimedOut, setHandshakeTimedOut] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  
  useEffect(() => {
    if (gameState?.gameState === GAME_STATES.FINISHED) {
      localStorage.removeItem('lastActiveRoom');
    }
  }, [gameState?.gameState]);
  
  useEffect(() => {
    if (!loading && !user) {
      console.log('[GameBoard] No user found, redirecting to home.');
      router.push('/uno');
    }
  }, [user, loading, router]);


  useEffect(() => {
    const normalizedRoomId = roomId?.toUpperCase()?.trim();
    if (!normalizedRoomId || !db) return;
    
    console.log(`[GameBoard] Subscribing to game: ${normalizedRoomId}`);
    const unsubGame = subscribeToGame(db, normalizedRoomId, setGameState, (err) => {
      if (err.code === 'permission-denied' || err.code === 'not-found') {
        console.warn('[GameBoard] Game doc became inaccessible (deleted or permission revoked)');
        router.push('/uno');
        return;
      }
      setErrorStatus(`Firestore Error: ${err.code || err.message}`);
    });
    const unsubRoom = subscribeToRoom(db, normalizedRoomId, setRoom);
    
    return () => {
      unsubGame();
      unsubRoom();
    };
  }, [db, roomId]);

  const showMessage = useCallback((msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 5000);
  }, []);

  const lastKnownUpdateRef = useRef(null);
  useEffect(() => {
    if (!gameState?.updatedAt) return;
    if (isProcessing && lastKnownUpdateRef.current && lastKnownUpdateRef.current !== gameState.updatedAt) {
      setIsProcessing(false);
    }
    lastKnownUpdateRef.current = gameState.updatedAt;
  }, [gameState?.updatedAt, isProcessing]);

  useEffect(() => {
    if (!gameState || gameState.gameState !== GAME_STATES.PLAYING || !gameState.turnStartedAt) {
      setTurnTimer(15);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(gameState.turnStartedAt).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      const remaining = Math.max(0, 15 - elapsed);
      
      setTurnTimer(remaining);

      if (remaining === 0 && !isProcessing) {
        clearInterval(interval);
        setTimeout(() => {
          skipTurnAction(roomId, user?.uid).catch(err => console.warn('Auto-skip failed', err));
        }, 500);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.turnStartedAt, gameState?.gameState, roomId, user?.uid, isProcessing]);

  useEffect(() => {
    if (roomId) {
      localStorage.setItem('lastActiveRoom', roomId.toUpperCase());
    }
  }, [roomId]);

  useEffect(() => {
    if (!isProcessing) return;
    const timer = setTimeout(() => setIsProcessing(false), 5000);
    return () => clearTimeout(timer);
  }, [isProcessing]);

  const lastAnimatedTurnRef = useRef(-1);

  const myId = user?.uid;
  const myHand = gameState?.playersHands?.[myId] || [];
  const currentPlayerId = gameState ? getCurrentPlayerId(gameState) : null;
  const isMyTurn = currentPlayerId === myId;
  const topDiscard = gameState?.discardPile?.[gameState.discardPile.length - 1];
  const opponents = gameState?.activePlayers?.filter((pid) => pid !== myId) || [];
  const allPlayers = gameState?.players || [];
  const roomPlayers = room?.players || allPlayers.map((uid) => ({ uid, name: uid.slice(0, 6) }));

  const getPlayerInfo = useCallback((uid) =>
    roomPlayers.find((p) => p.uid === uid) || { uid, name: uid.slice(0, 6) }
  , [roomPlayers]);

  useEffect(() => {
    if (!gameState?.lastAction) return;
    
    const turnNum = gameState.turnNumber || 0;
    if (lastAnimatedTurnRef.current >= turnNum) return;
    lastAnimatedTurnRef.current = turnNum;

    const { type, playerId, card, rouletteTarget, rouletteRevealed, swapTarget, passAll, drawnCount } = gameState.lastAction;
    const isMe = playerId === user?.uid;
    const name = isMe ? 'You' : (getPlayerInfo(playerId)?.name || 'Someone');
    
    if (type === 'DRAW') {
      showMessage(`${name} took ${drawnCount || 1} card(s)`);
      return;
    }

    if (type === 'SKIP') {
       showMessage(`${name} played SKIP 🚫`);
       return;
    }

    if (passAll) {
       showMessage(`${name} played 0! Everyone passed hands 🔄`);
       return;
    }

    if (swapTarget) {
       const targetName = getPlayerInfo(swapTarget)?.name || 'Someone';
       showMessage(`${name} swapped hands with ${targetName}! 🤝`);
       return;
    }

    if (rouletteTarget && card) {
       const targetName = getPlayerInfo(rouletteTarget)?.name || 'Someone';
       showMessage(`${name} used ${card.type.toUpperCase()} on ${targetName}! (${rouletteRevealed} cards) 🎡`);
       return;
    }

    if (card) {
      if (!isMe) {
        const cardDesc = card.type === CARD_TYPES.NUMBER ? `${card.color} ${card.value}` : `${card.type.replace('_', ' ').toUpperCase()}`;
        showMessage(`${name} played ${cardDesc}`);
      }
    }
  }, [gameState?.lastAction, gameState?.turnNumber, user?.uid, getPlayerInfo, showMessage]);

  useEffect(() => {
    if (gameState?.gameState === GAME_STATES.FINISHED &&
      gameState?.winner === user?.uid &&
      !gameState?.pointsAwarded
    ) {
      awardGamePoints(roomId, user.uid)
        .then((res) => {
          if (res.awardedPoints > 0) {
            showMessage(`🏆 You won! +${res.awardedPoints} points`);
          }
        })
        .catch((err) => console.error('Award points error:', err));
    }
  }, [gameState?.gameState, gameState?.winner, gameState?.pointsAwarded, user?.uid, db, roomId]);

  useEffect(() => {
    const normalizedRoomId = roomId?.toUpperCase()?.trim();
    if (normalizedRoomId && user?.uid) {
      syncHandshake(normalizedRoomId, user.uid);
    }
  }, [roomId, user?.uid]);

  useEffect(() => {
    if (!roomId) return;
    const timer = setTimeout(() => {
        setHandshakeTimedOut(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [roomId]);

  useEffect(() => {
    if (gameState === null || room === null) {
      if (!isProcessing) {
        console.log('[GameBoard] Game or Room doc explicitly not found, redirecting...');
        router.push('/uno');
      }
      return;
    }

    if (gameState === undefined || room === undefined || !user || isProcessing) return;

    const isMember = gameState.players?.includes(user?.uid);
    
    if (gameState.gameState === GAME_STATES.PLAYING && !isMember) {
      console.warn('[GameBoard] Not a member of this game (UD: ' + user?.uid + '), redirecting...');
      router.push('/uno');
      return;
    }
  }, [gameState, room, isProcessing, router, user]);

  const allSynced = gameState && (gameState.activePlayers || []).every(p => gameState.syncedPlayers?.[p]);

  if (errorStatus) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-white text-2xl font-black mb-4">CONNECTION LOST</h2>
        <p className="text-gray-400 mb-8">{errorStatus}</p>
        <button 
          onClick={() => router.push('/uno')}
          className="px-8 py-3 bg-uno-gold text-black font-bold rounded-xl shadow-lg"
        >
          BACK TO HOME
        </button>
      </div>
    );
  }

  const isFreshStart = gameState && (gameState.turnNumber || 0) === 0;
  const shouldShowLoader = !gameState || !user || !isCached || (isFreshStart && !allSynced && !handshakeTimedOut);
  
  if (shouldShowLoader) {
    console.log(`[GameBoard] Showing loader. State: ${!!gameState}, User: ${!!user}, Cached: ${isCached}`);
    return (
      <MatchSetupLoader 
        diagnostic={!user ? 'Authenticating...' : !isCached ? 'Caching assets...' : !gameState ? 'Connecting...' : 'Starting...'} 
        onReady={() => setIsCached(true)}
      />
    );
  }

  const handleExitGame = async () => {
    if (!window.confirm('Are you sure you want to leave the game?')) return;
    setIsProcessing(true);
    try {
      await exitGame(roomId, user?.uid);
      localStorage.removeItem('lastActiveRoom');
      router.push('/uno');
    } catch (err) {
      showMessage(err.message || 'Failed to exit game');
    }
    setIsProcessing(false);
  };

  const handleDisbandRoom = async () => {
    if (!window.confirm('DISBAND ROOM? This will kick everyone out and end the game.')) return;
    setIsProcessing(true);
    try {
      await disbandRoom(roomId, user?.uid);
      localStorage.removeItem('lastActiveRoom');
      router.push('/uno');
    } catch (err) {
      showMessage(err.message || 'Failed to disband room');
    }
    setIsProcessing(false);
  };


  const handlePlayCard = async (card) => {
    if (isProcessing || !isMyTurn) return;

    const isWild = card.color === null || card.type.startsWith('wild');
    const is7Swap = card.type === CARD_TYPES.NUMBER && card.value === 7 && opponents.length > 0;

    if (isWild) {
      setPendingCard(card);
      setShowColorPicker(true);
      return;
    }

    if (is7Swap) {
      setPendingCard(card);
      setShowSwapPicker(true);
      return;
    }

    setIsProcessing(true);
    try {
      await playCard(roomId, myId, card.id);
    } catch (err) {
      showMessage(err.message || 'Cannot play that card');
      setIsProcessing(false);
    }
  };

  const handleColorSelect = async (color) => {
    setShowColorPicker(false);
    if (!pendingCard) return;
    setIsProcessing(true);
    try {
      await playCard(roomId, myId, pendingCard.id, color);
    } catch (err) {
      showMessage(err.message || 'Failed to play card');
    }
    setPendingCard(null);
    setIsProcessing(false);
  };

  const handleSwapSelect = async (targetId) => {
    setShowSwapPicker(false);
    if (!pendingCard) return;
    setIsProcessing(true);
    try {
      await playCard(roomId, myId, pendingCard.id, null, targetId);
    } catch (err) {
      showMessage(err.message || 'Failed to swap');
    }
    setPendingCard(null);
    setIsProcessing(false);
  };

  const handleDrawCard = async () => {
    if (isProcessing || !isMyTurn) return;
    setIsProcessing(true);
    try {
      const result = await drawCardAction(roomId, myId);
      if (result?.autoPlayCard) {
        setPendingDecisionCard(result.autoPlayCard);
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      showMessage(err.message || 'Cannot draw');
      setIsProcessing(false);
    }
  };

  const handlePlayDrawnCard = async () => {
    if (!pendingDecisionCard) return;
    const card = pendingDecisionCard;
    setPendingDecisionCard(null);
    handlePlayCard(card);
  };

  const handleKeepDrawnCard = async () => {
    if (!pendingDecisionCard) return;
    setIsProcessing(true);
    try {
      await keepCardAction(roomId, myId);
      setPendingDecisionCard(null);
    } catch (err) {
      showMessage(err.message || 'Failed to keep card');
      setIsProcessing(false);
    }
  };

  const handleCallUno = async () => {
    try {
      await callUnoAction(roomId, myId);
      showMessage('UNO! 🎉');
    } catch (err) { showMessage('Failed to call UNO'); }
  };

  const handleChallengeUno = async (targetId) => {
    try {
      const success = await challengeUnoAction(roomId, myId, targetId);
      showMessage(success ? 'Caught them! +2 cards 😈' : 'They already called UNO!');
    } catch (err) { showMessage('Failed to challenge'); }
  };

  const getOpponentPosition = (index, total) => {
    if (total === 1) return 'top';
    if (total === 2) return index === 0 ? 'top-left' : 'top-right';
    if (total === 3) return ['left', 'top', 'right'][index];
    if (total <= 5) return ['left', 'top-left', 'top', 'top-right', 'right'][index];
    return 'top';
  };

  const showUnoButton = myHand.length === 2 && isMyTurn && !gameState.calledUno?.[myId];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">


      {actionMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-uno-surface border border-gray-700 text-white text-sm px-6 py-2.5 rounded-full shadow-xl animate-slide-up">
          {actionMessage}
        </div>
      )}

      <div className="fixed top-14 sm:top-16 left-0 right-0 z-20 px-4 flex justify-between items-start pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button onClick={handleExitGame} className="px-3 py-1.5 glass-button text-gray-300 text-[10px] sm:text-xs font-bold rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center gap-1.5">
            <span className="opacity-70">←</span> Exit
          </button>
          {room?.hostId === myId && (
            <button onClick={handleDisbandRoom} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] sm:text-xs font-bold rounded-xl border border-red-500/20 transition-all">
              Disband
            </button>
          )}
        </div>

        <div className="pointer-events-auto">
          <div className={`px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all duration-500 ${isMyTurn ? 'bg-uno-gold text-black shadow-[0_0_20px_rgba(255,193,7,0.3)]' : 'glass border border-white/10 text-gray-400'}`}>
            {isMyTurn ? (
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                </span>
                YOUR TURN
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] font-black ${turnTimer <= 5 ? 'bg-red-500 animate-pulse' : 'bg-black/20'}`}>
                  {turnTimer}s
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2 uppercase tracking-wider">
                {getPlayerInfo(currentPlayerId)?.name}'S TURN
                <span className="opacity-50 font-medium">({turnTimer}s)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col pt-12 sm:pt-14 overflow-hidden">
        <div className="relative flex-1 min-h-[140px] sm:min-h-[220px]">
          <div className="flex items-start justify-center gap-2 sm:gap-8 flex-wrap pt-4 sm:pt-6 px-4">
            {opponents.map((pid, idx) => (
              <PlayerSeat
                key={pid}
                player={getPlayerInfo(pid)}
                cardCount={gameState.playersHands?.[pid]?.length || 0}
                score={gameState.scores?.[pid] || 0}
                isCurrentTurn={currentPlayerId === pid}
                isEliminated={gameState.eliminatedPlayers?.includes(pid)}
                calledUno={gameState.calledUno?.[pid] || false}
                onChallengeUno={(gameState.playersHands?.[pid]?.length || 0) === 1 && !gameState.calledUno?.[pid] && !gameState.eliminatedPlayers?.includes(pid) ? () => handleChallengeUno(pid) : null}
                position={getOpponentPosition(idx, opponents.length)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center py-2 sm:py-4">
          <GameTable
            discardPile={gameState.discardPile || []}
            drawPileCount={gameState.drawPile?.length || 0}
            activeColor={gameState.activeColor}
            direction={gameState.direction}
            pendingDraw={gameState.pendingDraw || 0}
            onDrawCard={handleDrawCard}
            isMyTurn={isMyTurn && !isProcessing}
          />
        </div>

        <div className="mt-auto glass border-t border-white/5">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-uno-gold animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-sm text-gray-300 font-semibold">{user.displayName || 'You'}</span>
              <span className="text-xs text-gray-500">({myHand.length} cards)</span>
              {(gameState.scores?.[myId] || 0) > 0 && (
                <span className="text-[10px] text-uno-gold font-bold ml-1">🏆 {gameState.scores[myId]}</span>
              )}
            </div>
            {gameState.pendingDraw > 0 && isMyTurn && (
              <div className="bg-red-600/20 border border-red-500/30 px-3 py-1 rounded-lg animate-pulse flex items-center gap-2">
                <span className="text-red-400 text-xs font-black uppercase tracking-tighter">⚠ STACK +{gameState.pendingDraw} OR DRAW</span>
              </div>
            )}
          </div>

          <PlayerHand
            cards={myHand}
            topDiscard={topDiscard}
            activeColor={gameState.activeColor}
            pendingDraw={gameState.pendingDraw || 0}
            pendingDrawType={gameState.pendingDrawType}
            isMyTurn={isMyTurn && !isProcessing}
            onPlayCard={handlePlayCard}
          />
        </div>
      </div>

      <UnoButton visible={showUnoButton} onClick={handleCallUno} />

      {showColorPicker && (
        <ColorPicker onSelect={handleColorSelect} onClose={() => { setShowColorPicker(false); setPendingCard(null); }} />
      )}

      {showSwapPicker && (
        <SwapPicker
          players={roomPlayers.map((p) => ({ ...p, cardCount: gameState.playersHands?.[p.uid]?.length || 0 }))}
          currentPlayerId={myId}
          onSelect={handleSwapSelect}
          onClose={() => { setShowSwapPicker(false); setPendingCard(null); }}
        />
      )}

      {gameState.gameState === GAME_STATES.FINISHED && gameState.winner && (
        <GameOverModal
          winner={gameState.winner}
          scores={gameState.scores || {}}
          players={roomPlayers}
          onPlayAgain={() => router.push(`/uno/lobby/${roomId}`)}
          onLeave={() => router.push('/uno')}
        />
      )}

      {pendingDecisionCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-3xl p-8 max-w-sm w-full border border-white/10 text-center animate-scale-up">
            <h3 className="text-2xl font-black text-white mb-2 italic">LUCKY DRAW!</h3>
            <p className="text-gray-400 text-sm mb-6">You drew a playable card. What would you like to do?</p>
            <div className="flex justify-center mb-8"><UnoCard card={pendingDecisionCard} /></div>
            <div className="flex flex-col gap-3">
              <button onClick={handlePlayDrawnCard} className="w-full py-4 bg-uno-gold text-black font-black rounded-2xl shadow-[0_0_20px_rgba(255,193,7,0.3)] hover:scale-105 transition-transform">PLAY THIS CARD</button>
              <button onClick={handleKeepDrawnCard} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all">KEEP IN HAND</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
