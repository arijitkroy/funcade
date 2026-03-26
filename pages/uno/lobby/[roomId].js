import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from "@/contexts/FirebaseProvider";
import { subscribeToRoom, leaveRoom, toggleReady } from '@/lib/roomService';
import { startGame } from '@/lib/gameService';

import { FaClipboardList, FaCheck, FaCrown, FaRocket } from 'react-icons/fa';

export default function Lobby() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user, loading } = useAuth();
  const [room, setRoom] = useState(undefined);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const { db } = useFirebase();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/uno');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!roomId || !db || !user) return;
    const unsubscribe = subscribeToRoom(db, roomId, (data) => {
      if (!data) {
        if (!loading) router.push('/uno');
        return;
      }

      // Always update room state and localStorage first
      setRoom(data);
      localStorage.setItem('lastActiveRoom', roomId.toUpperCase());

      // Check membership only if user is loaded
      if (user) {
        const isMember = data.players?.some((p) => p.uid === user.uid);
        if (!isMember) {
          console.warn('[Lobby] User not a member, redirecting home...');
          router.push('/uno');
          return;
        }

        if (data.gameStarted) {
          router.push(`/uno/game/${roomId}`);
        }
      }
    });
    return () => unsubscribe();
  }, [db, roomId, router, user]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (roomId && user) {
      await leaveRoom(roomId, user.uid);
      localStorage.removeItem('lastActiveRoom');
      router.push('/uno');
    }
  };

  const handleToggleReady = async () => {
    if (roomId && user) {
      await toggleReady(roomId, user.uid);
    }
  };

  const handleStartGame = async () => {
    if (!room || !user || room.hostId !== user.uid) return;
    setStarting(true);
    setError('');
    try {
      const playerIds = room.players.map((p) => p.uid);
      if (playerIds.length < 2) {
        setError('Need at least 2 players to start');
        setStarting(false);
        return;
      }
      await startGame(roomId, playerIds);
    } catch (err) {
      setError(err.message || 'Failed to start game');
      setStarting(false);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading lobby...</div>
      </div>
    );
  }

  const isHost = user?.uid === room.hostId;
  const myPlayer = room.players?.find((p) => p.uid === user?.uid);
  const allReady = room.players?.every((p) => p.ready);

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">


      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-uno-red/8 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-uno-blue/8 blur-3xl" />
      </div>

      <main className="relative z-10 flex flex-col items-center pt-20 px-4 min-h-screen">
        <div className="glass rounded-2xl p-6 sm:p-8 max-w-md w-full animate-slide-up mb-6">
          <div className="text-center mb-6">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Room Code</div>
            <button
              onClick={handleCopyCode}
              className="group relative inline-flex items-center gap-2"
            >
              <span className="text-3xl sm:text-4xl font-black tracking-[0.3em] text-white font-mono">
                {roomId}
              </span>
              <span className="text-gray-500 group-hover:text-uno-gold transition-colors text-lg">
                {copied ? <FaCheck /> : <FaClipboardList />}
              </span>
            </button>
            {copied && (
              <div className="text-uno-green text-xs mt-1 animate-fade-in">Copied!</div>
            )}
            <p className="text-xs text-gray-600 mt-2">Share this code with friends to join</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              Players ({room.players?.length || 0}/{room.maxPlayers || 8})
            </h3>
            <div className="space-y-2">
              {room.players?.map((player) => (
                <div
                  key={player.uid}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    player.ready
                      ? 'bg-uno-green/10 border border-uno-green/30'
                      : 'bg-uno-surface-light border border-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-uno-surface flex items-center justify-center text-sm font-bold text-white border-2 border-gray-600">
                    {player.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate flex items-center gap-1">
                      {player.name}
                      {player.uid === room.hostId && (
                        <span className="ml-2 text-uno-gold text-xs flex items-center gap-1"><FaCrown /> Host</span>
                      )}
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${player.ready ? 'text-uno-green' : 'text-gray-500'}`}>
                      {player.ready ? <><FaCheck /> Ready</> : 'Not ready'}
                    </div>
                  </div>

                  <div className={`w-3 h-3 rounded-full ${player.ready ? 'bg-uno-green' : 'bg-gray-600'}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleToggleReady}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                myPlayer?.ready
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-uno-green text-white hover:opacity-90'
              }`}
            >
              {myPlayer?.ready ? 'Cancel Ready' : "I'm Ready!"}
            </button>

            {isHost && (
              <div className="space-y-2">
                <button
                  onClick={handleStartGame}
                  disabled={starting || (room.players?.length || 0) < 2 || !allReady}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-uno-red via-uno-purple to-uno-green text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {starting ? 'Starting...' : <span className="flex items-center justify-center gap-2"><FaRocket /> Start Game</span>}
                </button>
                {!allReady && room.players?.length >= 2 && (
                  <p className="text-[10px] text-uno-gold/60 text-center animate-pulse">Waiting for all players to be ready...</p>
                )}
              </div>
            )}

            <button
              onClick={handleLeave}
              className="w-full py-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
            >
              Leave Room
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center mt-3">{error}</p>
          )}
        </div>

        {!isHost && (
          <div className="text-gray-500 text-sm animate-pulse text-center">
            Waiting for host to start the game...
          </div>
        )}
      </main>
    </div>
  );
}
