import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseProvider';
import { createRoom, joinRoom } from '@/lib/cyberCheckersService';
import { FaTimes, FaHashtag, FaCircleNotch, FaLink } from 'react-icons/fa';
import { GiHexagonalNut } from 'react-icons/gi';

export default function CyberCheckersHome() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { db } = useFirebase();
  const router = useRouter();
  
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [boardShape, setBoardShape] = useState('star');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!user) return;
    setIsCreating(true);
    setError('');
    try {
      const code = await createRoom(user.uid, user.displayName || 'Player', boardShape);
      router.push(`/cybercheckers/lobby/${code}`);
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
      router.push(`/cybercheckers/lobby/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err.message || 'Failed to join room.');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden text-white font-sans">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-cyan-600/10 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-[800px] h-20 bg-blue-500/20 blur-[100px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-32 pb-12">
        <div className="mb-10 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <GiHexagonalNut className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] text-5xl sm:text-7xl animate-bounce-subtle" />
            <GiHexagonalNut className="text-fuchsia-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)] text-5xl sm:text-7xl" />
            <GiHexagonalNut className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] text-5xl sm:text-7xl animate-bounce-subtle" style={{ animationDelay: '0.5s' }} />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500">
            Cyber Checkers
          </h1>
          <div className="text-sm sm:text-lg text-gray-400 font-semibold tracking-widest uppercase mt-4">
            Navigate the Cyber Grid
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 animate-pulse">Initializing HUD...</div>
        ) : !user ? (
          <div className="glass rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
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
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-[0_0_30px_rgba(217,70,239,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <span className="text-fuchsia-500">⚙</span> Initialization
              </h2>

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-2 block">
                  Network Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBoardShape('star')}
                    className={`py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all ${boardShape === 'star' ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-400' : 'bg-black/40 border-white/10 text-gray-500 hover:text-gray-300'}`}
                  >
                    STAR (DEFAULT)
                  </button>
                  <button
                    onClick={() => setBoardShape('star_small')}
                    className={`py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all ${boardShape === 'star_small' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-black/40 border-white/10 text-gray-500 hover:text-gray-300'}`}
                  >
                    COMPACT STAR
                  </button>
                  <button
                    onClick={() => setBoardShape('hexagon')}
                    className={`py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all ${boardShape === 'hexagon' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-black/40 border-white/10 text-gray-500 hover:text-gray-300'}`}
                  >
                    HEXAGON DUEL
                  </button>
                  <button
                    onClick={() => setBoardShape('diamond')}
                    className={`py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all ${boardShape === 'diamond' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-black/40 border-white/10 text-gray-500 hover:text-gray-300'}`}
                  >
                    DIAMOND CLASH
                  </button>
                  <button
                    onClick={() => setBoardShape('corridor')}
                    className={`col-span-2 py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all ${boardShape === 'corridor' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/40 border-white/10 text-gray-500 hover:text-gray-300'}`}
                  >
                    NEON CORRIDOR
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50"
              >
                {isCreating ? 'BOOTING...' : 'INITIALIZE STAR GRID'}
              </button>
            </div>

            {/* Join Room Section */}
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <span className="text-cyan-400"><FaLink /></span> Direct Connect
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ACCESS CODE"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="flex-1 bg-black/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-widest text-center uppercase focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={isJoining || !roomCode.trim()}
                  className="px-6 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-xl font-bold text-sm hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-cyan-500/20 disabled:hover:text-cyan-400"
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
                href="/cybercheckers/rules"
                className="text-xs text-gray-500 hover:text-fuchsia-400 transition-colors uppercase tracking-widest font-bold underline underline-offset-4"
              >
                How to play Cyber Checkers →
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
