import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseProvider';
import { subscribeToRoom, makeMove, leaveRoom } from '@/lib/cyberCheckersService';
import Board from '@/components/cybercheckers/Board';
import { FaUserAstronaut, FaUserSecret } from 'react-icons/fa';

export default function CyberCheckersGame() {
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
      setRoomData(data);
    });

    return () => unsubscribe();
  }, [router.isReady, db, roomId, user]);

  const handleLeaveRoom = async () => {
    if (!roomId || !user) return;
    try {
      await leaveRoom(roomId, user.uid);
      router.push('/cybercheckers');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMove = async (fromPos, toPos) => {
    if (!roomData || !user || isProcessing) return;
    if (roomData.status !== 'playing') return;
    if (roomData.currentPlayer !== user.uid) return;

    setIsProcessing(true);
    try {
      await makeMove(roomId, user.uid, fromPos, toPos);
    } catch (err) {
      console.error("Move error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl text-center max-w-sm w-full border border-red-500/30">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <button onClick={() => router.push('/cybercheckers')} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">Return to Menu</button>
        </div>
      </div>
    );
  }

  if (!roomData) return <div className="min-h-screen bg-[#050505]" />;

  const isMyTurn = roomData.status === 'playing' && roomData.currentPlayer === user?.uid;
  const p1 = roomData.players.find(p => p.piece === 1) || {};
  const p2 = roomData.players.find(p => p.piece === 2) || {};
  
  const isP1Turn = roomData.currentPlayer === p1.uid;
  const userPiece = roomData.players.find(p => p.uid === user?.uid)?.piece;

  let endMessage = '';
  if (roomData.status === 'finished') {
    if (roomData.winner === p1.uid) {
      endMessage = `${p1.name} DOMINATED`;
    } else if (roomData.winner === p2.uid) {
      endMessage = `${p2.name} DOMINATED`;
    } else {
      endMessage = "OPPONENT DISCONNECTED. YOU WIN.";
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden flex flex-col pt-20 pb-10">
      <Head>
        <title>Cyber Checkers Match | Funcade</title>
      </Head>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-1000"
        style={{
          background: roomData.status === 'finished' 
            ? 'radial-gradient(circle at center, rgba(30,10,30,0.8) 0%, #050505 100%)' 
            : 'radial-gradient(circle at top, rgba(16,20,30,0.8) 0%, #050505 100%)'
        }}
      >
        <div className={`absolute top-0 left-0 w-[50%] h-[50%] rounded-full blur-[150px] transition-opacity duration-1000 ${isP1Turn ? 'bg-cyan-500/20 opacity-100' : 'bg-cyan-500/10 opacity-30'}`} />
        <div className={`absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full blur-[150px] transition-opacity duration-1000 ${!isP1Turn ? 'bg-fuchsia-400/20 opacity-100' : 'bg-fuchsia-400/10 opacity-30'}`} />
      </div>

      <main className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full px-4">
        
        {/* HUD Area */}
        <div className="w-full max-w-lg flex justify-between items-end mb-8 relative z-10 glass rounded-3xl p-4 border border-white/5 shadow-xl">
          {/* Player 1 HUD */}
          <div className={`flex flex-col items-center transition-all duration-300 ${isP1Turn ? 'scale-110' : 'opacity-50 grayscale-[0.5]'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-lg transition-colors ${isP1Turn ? 'bg-cyan-500 text-white shadow-cyan-500/40' : 'bg-black/50 border border-gray-700 text-gray-500'}`}>
              <FaUserAstronaut size={28} />
            </div>
            <p className="font-bold text-sm max-w-[100px] truncate text-center">{p1.name}</p>
            <p className="text-cyan-400 font-black font-mono mt-1 text-xs tracking-widest uppercase">Player 1</p>
          </div>

          {/* Turn Indicator */}
          <div className="flex-1 flex flex-col items-center justify-center pb-4">
            <div className="text-2xl font-black mb-1 flex items-center gap-3 drop-shadow-md tracking-wider">
              {roomData.status === 'playing' ? (
                 <span className={`${isMyTurn ? 'text-white' : 'text-gray-500'}`}>
                   {isMyTurn ? 'YOUR TURN' : 'WAITING...'}
                 </span>
              ) : 'SYSTEM HALT'}
            </div>
            
            {roomData.status === 'playing' && (
              <div className="h-1 w-24 bg-white/10 rounded-full relative overflow-hidden mt-2">
                <div 
                  className={`absolute top-0 h-full w-1/2 rounded-full transition-all duration-500 ${isP1Turn ? 'left-0 bg-cyan-500' : 'left-1/2 bg-fuchsia-500'}`} 
                />
              </div>
            )}
            <div className="mt-4 text-[10px] text-gray-600 font-mono tracking-widest text-center uppercase">
              {roomData.boardShape === 'star' && 'Move all 10 to opposite triangle'}
              {roomData.boardShape === 'star_small' && 'Move all 6 to opposite triangle'}
              {roomData.boardShape === 'hexagon' && 'Move all 11 to opposite edge'}
              {roomData.boardShape === 'diamond' && 'Move all 9 to opposite corner'}
              {roomData.boardShape === 'corridor' && 'Push all 9 through corridor'}
              {!roomData.boardShape && 'Move to opposite triangle'}
            </div>
          </div>

          {/* Player 2 HUD */}
          <div className={`flex flex-col items-center transition-all duration-300 ${!isP1Turn ? 'scale-110' : 'opacity-50 grayscale-[0.5]'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-lg transition-colors ${!isP1Turn ? 'bg-fuchsia-500 text-white shadow-fuchsia-500/40' : 'bg-black/50 border border-gray-700 text-gray-500'}`}>
              <FaUserSecret size={28} />
            </div>
            <p className="font-bold text-sm max-w-[100px] truncate text-center">{p2.name}</p>
            <p className="text-fuchsia-400 font-black font-mono mt-1 text-xs tracking-widest uppercase">Player 2</p>
          </div>
        </div>

        {/* The Board */}
        <div className="w-full flex justify-center z-10 perspective-[1000px] my-6">
          <div className={`w-full max-w-2xl transform transition-transform duration-700 ${isMyTurn && roomData.status === 'playing' ? 'scale-[1.02]' : 'scale-100'}`}>
             <Board 
               boardData={roomData.board} 
               boardShape={roomData.boardShape || 'star'}
               currentPlayerId={roomData.currentPlayer}
               userPiece={userPiece}
               isMyTurn={isMyTurn}
               onMove={handleMove}
             />
          </div>
        </div>

        {roomData.status === 'playing' ? (
          <div className="mt-6 z-10">
            <button 
              onClick={handleLeaveRoom}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-6 py-2 rounded-full border border-white/10"
            >
              Surrender Match
            </button>
          </div>
        ) : (
          <div className="mt-6 z-10 flex flex-col items-center animate-slide-up">
            <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-6 text-center drop-shadow-lg uppercase">
              {endMessage}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
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
