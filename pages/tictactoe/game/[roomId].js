import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseProvider';
import { subscribeToRoom, makeMove, playAgain, leaveRoom } from '@/lib/tictactoeService';
import Board from '@/components/tictactoe/Board';
import DiceRollOverlay from '@/components/tictactoe/DiceRollOverlay';
import { FaUserAstronaut, FaUserSecret } from 'react-icons/fa';

export default function TicTacToeGame() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useAuth();
  const { db } = useFirebase();

  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!router.isReady || !db || !roomId || !user) return;
    
    const unsubscribe = subscribeToRoom(db, roomId, (data) => {
      if (!data) {
        setError('Room disbanded.');
        return;
      }
      if (data.status === 'disbanded') {
        setError('The other player abandoned the match. Room disbanded.');
        return;
      }
      setRoomData(data);
    });

    return () => unsubscribe();
  }, [router.isReady, db, roomId, user]);

  const handleLeaveRoom = async () => {
    if (!roomId || !user) return;
    try {
      await leaveRoom(roomId, user.uid);
      router.push('/tictactoe');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (roomData?.status === 'rolling' && roomData?.hostId === user?.uid) {
      const timer = setTimeout(() => {
        fetch('/api/tictactoe/finish-roll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode: roomId })
        }).catch(console.error);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [roomData?.status, roomData?.hostId, user?.uid, roomId]);

  const handleCellClick = async (index) => {
    if (!roomData || !user || isProcessing) return;
    if (roomData.status !== 'playing') return;
    if (roomData.currentPlayer !== user.uid) return;
    if (roomData.board[index] !== "") return;

    setIsProcessing(true);
    try {
      await makeMove(roomId, user.uid, index);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAgain = async () => {
    if (!roomData || !user || isProcessing) return;
    setIsProcessing(true);
    try {
      await playAgain(roomId, user.uid);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl text-center max-w-sm w-full border border-red-500/30">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <button onClick={() => router.push('/tictactoe')} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">Return to Menu</button>
        </div>
      </div>
    );
  }

  if (!roomData) return <div className="min-h-screen bg-[#050505]" />;

  const isMyTurn = roomData.status === 'playing' && roomData.currentPlayer === user?.uid;
  const p1 = roomData.players[0] || {};
  const p2 = roomData.players[1] || {};
  
  const isP1Turn = roomData.currentPlayer === p1.uid;
  const startingPlayer = roomData.players?.find(p => p.uid === roomData.currentPlayer);
  
  // Decide who won locally to pass to overlay easily
  let winnerSymbol = null;
  if (roomData.winner && roomData.winner !== 'tie') {
    const winnerPlayer = roomData.players.find(p => p.uid === roomData.winner);
    winnerSymbol = winnerPlayer ? winnerPlayer.symbol : null;
  } else if (roomData.winner === 'tie') {
    winnerSymbol = 'tie';
  }

  // Determine Endgame Text
  let endMessage = '';
  if (roomData.status === 'finished') {
    if (winnerSymbol === 'tie') {
      endMessage = "IT'S A GRIDLOCK";
    } else if (winnerSymbol === 'X') {
      endMessage = `${p1.name} DOMINATED`;
    } else {
      endMessage = `${p2.name} DOMINATED`;
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden flex flex-col pt-20">
      <Head>
        <title>Tic-Tac-Toe Match | Funcade</title>
      </Head>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-1000"
        style={{
          background: roomData.status === 'finished' 
            ? 'radial-gradient(circle at center, rgba(30,10,30,0.8) 0%, #050505 100%)' 
            : 'radial-gradient(circle at top, rgba(16,20,30,0.8) 0%, #050505 100%)'
        }}
      >
        <div className={`absolute top-0 left-0 w-[50%] h-[50%] rounded-full blur-[150px] transition-opacity duration-1000 ${isP1Turn ? 'bg-pink-500/10 opacity-100' : 'bg-pink-500/10 opacity-30'}`} />
        <div className={`absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full blur-[150px] transition-opacity duration-1000 ${!isP1Turn ? 'bg-sky-400/10 opacity-100' : 'bg-sky-400/10 opacity-30'}`} />
      </div>

      {roomData.status === 'rolling' && startingPlayer && (
        <DiceRollOverlay startingPlayer={startingPlayer} />
      )}

      <main className="flex-1 flex flex-col items-center max-w-lg mx-auto w-full px-4 mb-10">
        
        {/* HUD Area */}
        <div className="w-full flex justify-between items-end mb-8 relative z-10 glass rounded-3xl p-4 border border-white/5 shadow-xl">
          {/* Player 1 HUD */}
          <div className={`flex flex-col items-center transition-all duration-300 ${isP1Turn ? 'scale-110' : 'opacity-50 grayscale-[0.5]'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-lg transition-colors ${isP1Turn ? 'bg-pink-500 text-white shadow-pink-500/40' : 'bg-black/50 border border-gray-700 text-gray-500'}`}>
              <FaUserAstronaut size={28} />
            </div>
            <p className="font-bold text-sm max-w-[100px] truncate text-center">{p1.name}</p>
            <p className="text-pink-400 font-black font-mono mt-1">X</p>
          </div>

          {/* Turn Indicator */}
          <div className="flex-1 flex flex-col items-center justify-center pb-4">
            <div className="text-3xl font-black mb-1 flex items-center gap-3 drop-shadow-md">
              <span className="text-pink-500">{roomData.scores?.[p1.uid] || 0}</span>
              <span className="text-gray-600 text-sm tracking-widest">VS</span>
              <span className="text-sky-400">{roomData.scores?.[p2.uid] || 0}</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2 text-center">
              {roomData.status === 'playing' ? 'Active Matrix' : 'SYSTEM HALT'}
            </div>
            {roomData.status === 'playing' && (
              <div className="h-1 w-16 bg-white/10 rounded-full relative overflow-hidden">
                <div 
                  className={`absolute top-0 h-full w-1/2 rounded-full transition-all duration-500 ${isP1Turn ? 'left-0 bg-pink-500' : 'left-1/2 bg-sky-400'}`} 
                />
              </div>
            )}
            <div className="mt-4 text-[10px] text-gray-600 font-mono tracking-widest text-center uppercase">
              {roomData.winCondition} EN-SUITE TO WIN
            </div>
          </div>

          {/* Player 2 HUD */}
          <div className={`flex flex-col items-center transition-all duration-300 ${!isP1Turn ? 'scale-110' : 'opacity-50 grayscale-[0.5]'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-lg transition-colors ${!isP1Turn ? 'bg-sky-400 text-black shadow-sky-400/40' : 'bg-black/50 border border-gray-700 text-gray-500'}`}>
              <FaUserSecret size={28} />
            </div>
            <p className="font-bold text-sm max-w-[100px] truncate text-center">{p2.name}</p>
            <p className="text-sky-400 font-black font-mono mt-1">O</p>
          </div>
        </div>

        {/* The Board */}
        <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center z-10 perspective-[1000px]">
          <div className={`transform transition-transform duration-700 ${isMyTurn && roomData.status === 'playing' ? 'scale-[1.02]' : 'scale-100 hover:scale-100'} ${roomData.status === 'playing' ? '' : 'pointer-events-none'}`}>
             <Board 
               board={roomData.board} 
               boardSize={roomData.boardSize} 
               onCellClick={handleCellClick}
               disabled={!isMyTurn || isProcessing || roomData.status !== 'playing'}
               winningLine={roomData.winningLine}
             />
          </div>
        </div>

        {roomData.status === 'playing' || roomData.status === 'rolling' ? (
          <div className="mt-10 mb-8 z-10">
            <button 
              onClick={handleLeaveRoom}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-6 py-2 rounded-full border border-white/10"
            >
              Leave Match
            </button>
          </div>
        ) : (
          <div className="mt-10 mb-8 z-10 flex flex-col items-center animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-6 text-center drop-shadow-lg">
              {endMessage}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={handlePlayAgain}
                disabled={isProcessing}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-black tracking-widest shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isProcessing ? 'REBOOTING...' : 'PLAY AGAIN'}
              </button>
              <button 
                onClick={handleLeaveRoom}
                className="px-8 py-4 bg-black border border-white/20 rounded-2xl font-bold hover:bg-white/10 transition-colors text-white"
              >
                EXIT LOBBY
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
