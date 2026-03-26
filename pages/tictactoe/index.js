import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseProvider';
import { createRoom, joinRoom } from '@/lib/tictactoeService';
import { GiCardRandom } from 'react-icons/gi';
import { FaHashtag, FaTimes, FaRegCircle } from 'react-icons/fa';

export default function TicTacToeHome() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { db } = useFirebase();
  const router = useRouter();
  
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const [boardSize, setBoardSize] = useState(3);
  const [winCondition, setWinCondition] = useState(3);

  // Ensure win condition doesn't exceed board size
  useEffect(() => {
    if (winCondition > boardSize) {
      setWinCondition(boardSize);
    }
  }, [boardSize, winCondition]);

  const handleCreateRoom = async () => {
    if (!user) return;
    setIsCreating(true);
    setError('');
    try {
      const code = await createRoom(user.uid, user.displayName || 'Player', boardSize, winCondition);
      router.push(`/tictactoe/lobby/${code}`);
    } catch (err) {
      setError(err.message || 'Failed to create room.');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !db || !roomCode.trim()) return;
    setIsJoining(true);
    setError('');
    try {
      await joinRoom(roomCode.trim().toUpperCase(), user.uid, user.displayName || 'Player');
      router.push(`/tictactoe/lobby/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err.message || 'Failed to join room.');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden text-white font-sans">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-[800px] h-20 bg-purple-500/20 blur-[100px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-32 pb-12">
        <div className="mb-10 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <FaTimes className="text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] text-5xl sm:text-7xl animate-bounce-subtle" />
            <FaHashtag className="text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] text-5xl sm:text-7xl" />
            <FaRegCircle className="text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)] text-5xl sm:text-7xl animate-bounce-subtle" style={{ animationDelay: '0.5s' }} />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400">
            Tic-Tac-Toe Advanced
          </h1>
          <div className="text-sm sm:text-lg text-gray-400 font-semibold tracking-widest uppercase mt-4">
            The grid awaits.
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 animate-pulse">Initializing HUD...</div>
        ) : !user ? (
          <div className="glass rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
            <h2 className="text-white text-center text-xl font-bold mb-6">Connect to Matrix</h2>

            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6">
            
            {/* Create Room Section */}
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-[0_0_30px_rgba(236,72,153,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <span className="text-pink-500">⚙</span> Initialization
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1 text-gray-400 font-medium">
                    <span>Board Size</span>
                    <span className="text-white font-bold">{boardSize} x {boardSize}</span>
                  </div>
                  <input 
                    type="range" 
                    min="3" max="5" 
                    value={boardSize} 
                    onChange={(e) => setBoardSize(parseInt(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1 text-gray-400 font-medium">
                    <span>Matches to Win</span>
                    <span className="text-white font-bold">{winCondition} in a row</span>
                  </div>
                  <input 
                    type="range" 
                    min="3" max={boardSize} 
                    value={winCondition} 
                    onChange={(e) => setWinCondition(parseInt(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                  {winCondition === boardSize && boardSize > 3 && (
                     <p className="text-[10px] text-pink-400 mt-1 italic">Hardcore mode enabled.</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-sm hover:from-pink-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] disabled:opacity-50"
              >
                {isCreating ? 'BOOTING...' : 'INITIALIZE GRID'}
              </button>
            </div>

            {/* Join Room Section */}
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <span className="text-sky-400">⚡</span> Direct Connect
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ACCESS CODE"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="flex-1 bg-black/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-widest text-center uppercase focus:outline-none focus:border-sky-500/50 focus:bg-white/5 transition-all"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={isJoining || !roomCode.trim()}
                  className="px-6 py-3 bg-sky-500/20 text-sky-400 border border-sky-500/50 rounded-xl font-bold text-sm hover:bg-sky-500 hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-sky-500/20 disabled:hover:text-sky-400"
                >
                  {isJoining ? '...' : 'LINK'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center font-medium animate-in fade-in slide-in-from-bottom-2">
                {error}
              </div>
            )}

            <div className="mt-6 text-center">
              <a
                href="/tictactoe/rules"
                className="text-xs text-gray-500 hover:text-pink-500 transition-colors uppercase tracking-widest font-bold underline underline-offset-4"
              >
                How to play Tic-Tac-Toe Advanced →
              </a>
            </div>

            <div className="text-center pt-4">
              <button onClick={() => router.push('/')} className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold">
                ← Back to Funcade Mainframe
              </button>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}
