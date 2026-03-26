import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseProvider';
import { subscribeToRoom, startGame } from '@/lib/tictactoeService';
import { FaUserAstronaut, FaUserSecret, FaCircleNotch, FaCopy, FaCheck, FaRocket } from 'react-icons/fa';

export default function TicTacToeLobby() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useAuth();
  const { db } = useFirebase();
  
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!router.isReady || !db || !roomId) return;
    
    const unsubscribe = subscribeToRoom(db, roomId, (data) => {
      if (!data) {
        setError('Room not found or has been disbanded.');
        return;
      }
      setRoomData(data);
      if (data.status === 'playing' || data.status === 'rolling' || data.status === 'finished') {
        router.push(`/tictactoe/game/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [router.isReady, db, roomId, router]);

  const copyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    if (!roomId || !user) return;
    setStarting(true);
    setError('');
    try {
      await startGame(roomId, user.uid);
    } catch (err) {
      setError(err.message || 'Failed to start game');
      setStarting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl border border-red-500/30 text-center max-w-md w-full">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <button onClick={() => router.push('/tictactoe')} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <FaCircleNotch className="animate-spin text-4xl text-pink-500" />
      </div>
    );
  }

  const players = roomData.players || [];
  const p1 = players[0];
  const p2 = players[1];
  const isHost = user?.uid === p1?.uid;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden">
      <Head>
        <title>Tic-Tac-Toe Lobby | Funcade</title>
      </Head>

      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-md mx-auto px-4 pt-24">
        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl relative">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-2">
              NEON GRID LINK
            </h1>
            <p className="text-sm text-gray-400">Waiting for Challenger...</p>
          </div>

          <div className="bg-black/40 rounded-2xl p-4 mb-8 flex items-center justify-between border border-white/5 group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-pink-500" />
             <div>
               <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">Access Code</p>
               <p className="font-mono text-3xl tracking-[0.2em] font-light">{roomId}</p>
             </div>
             <button 
                onClick={copyCode}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
             >
               {copied ? <FaCheck className="text-green-400 text-xl" /> : <FaCopy className="text-xl" />}
             </button>
          </div>

          <div className="space-y-4">
            {/* Player 1 Details */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-transparent border border-pink-500/20">
               <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/50 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                 <FaUserAstronaut size={24} />
               </div>
               <div>
                 <p className="font-bold text-lg">{p1?.name}</p>
                 <p className="text-xs text-pink-400 uppercase tracking-widest font-semibold font-mono">Player 1 • [ X ]</p>
               </div>
            </div>

            {/* Player 2 Details */}
            {p2 ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-sky-400/10 to-transparent border border-sky-400/20">
                 <div className="w-12 h-12 rounded-full bg-sky-400/20 flex items-center justify-center border border-sky-400/50 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                   <FaUserSecret size={24} />
                 </div>
                 <div>
                   <p className="font-bold text-lg">{p2.name}</p>
                   <p className="text-xs text-sky-400 uppercase tracking-widest font-semibold font-mono">Player 2 • [ O ]</p>
                 </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 border-dashed animate-pulse">
                 <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center border border-gray-600 text-gray-500">
                   <FaCircleNotch className="animate-spin" size={20} />
                 </div>
                 <div>
                   <p className="font-bold text-lg text-gray-400 italic">Scanning matrix...</p>
                 </div>
              </div>
            )}
          </div>

          {isHost && (
            <div className="mt-6">
              <button
                onClick={handleStartGame}
                disabled={starting || !p2}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400 text-white font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(236,72,153,0.3)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {starting ? 'INITIALIZING MATRIX...' : <><FaRocket /> START MATRIX</>}
              </button>
              {!p2 && (
                <p className="text-[10px] text-pink-400/60 text-center mt-2 animate-pulse uppercase tracking-widest font-mono">
                  AWAITING CHALLENGER CONNECTION...
                </p>
              )}
            </div>
          )}
          {!isHost && p2 && (
            <div className="mt-6 text-center text-sm text-sky-400 animate-pulse font-mono tracking-widest uppercase">
              Awaiting host to secure matrix...
            </div>
          )}

          <div className="mt-8 text-center bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-gray-400 font-mono">
               RULES: <span className="text-white">{roomData.winCondition} EN-SUITE</span> ON A <span className="text-white">{roomData.boardSize}x{roomData.boardSize}</span> GRID
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
