import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseProvider';
import { createRoom, joinRoom } from '@/lib/roomService';
import { GiCardRandom } from 'react-icons/gi';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { db } = useFirebase();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [lastActiveRoom, setLastActiveRoom] = useState(null);
  const [isResuming, setIsResuming] = useState(false);


  useEffect(() => {
    async function fetchProfile() {
      if (user && !user.isAnonymous) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          }
        } catch (err) {
          console.warn('Failed to fetch user profile.', err);
        }
      }
    }
    fetchProfile();
  }, [user?.uid, db]);

  useEffect(() => {
    const checkActiveRoom = async () => {
      const savedRoom = localStorage.getItem('lastActiveRoom');
      if (savedRoom && user && db) {
        try {
          const roomRef = doc(db, 'rooms', savedRoom);
          const roomSnap = await getDoc(roomRef);
          if (roomSnap.exists()) {
            const data = roomSnap.data();
            const isMember = data.players?.some(p => p.uid === user.uid);
            console.log('[Home] Active room found:', savedRoom, 'IsMember:', isMember, 'Started:', data.gameStarted);
            if (isMember) {
              setLastActiveRoom({
                code: savedRoom,
                started: data.gameStarted
              });
            } else {
              console.log('[Home] User is not a member of room', savedRoom);
              localStorage.removeItem('lastActiveRoom');
              setLastActiveRoom(null);
            }
          } else {
            console.log('[Home] Room', savedRoom, 'does not exist anymore.');
            localStorage.removeItem('lastActiveRoom');
            setLastActiveRoom(null);
          }
        } catch (err) {
          console.warn('Error checking active room:', err);
        }
      } else {
        setLastActiveRoom(null);
      }
    };
    checkActiveRoom();
  }, [user, db]);

  const handleCreateRoom = async () => {
    if (!user) return;
    setIsCreating(true);
    setError('');
    try {
      const code = await createRoom(user.uid, user.displayName || 'Player');
      router.push(`/uno/lobby/${code}`);
    } catch (err) {
      setError('Failed to create room. Try again.');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !db || !roomCode.trim()) return;
    setIsJoining(true);
    setError('');
    try {
      await joinRoom(roomCode.trim().toUpperCase(), user.uid, user.displayName || 'Player');
      router.push(`/uno/lobby/${roomCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err.message || 'Failed to join room.');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-uno-red/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-uno-blue/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-uno-green/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-uno-purple/8 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="absolute top-24 right-6 z-20 flex gap-4">
        <button 
          onClick={() => router.push('/uno/leaderboard')}
          className="bg-uno-gold/20 text-uno-gold border border-uno-gold hover:bg-uno-gold hover:text-black transition-colors px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-yellow-900/20"
        >
          🏆 Leaderboard
        </button>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-32 pb-12">
        <div className="mb-8 text-center">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-2">
            <span className="text-uno-red">U</span>
            <span className="text-uno-purple">N</span>
            <span className="text-uno-green">O</span>
          </h1>
          <div className="text-lg sm:text-xl text-gray-400 font-semibold tracking-widest uppercase">
            No Mercy
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Real-time multiplayer card game
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 animate-pulse">Initializing Interface...</div>
        ) : !user ? (
          <div className="glass rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-[0_0_50px_rgba(255,0,0,0.15)] animate-slide-up">
            <h2 className="text-white text-center text-xl font-bold mb-6">Enter the Arena</h2>

            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign In with Google
            </button>

            {error && (
              <p className="text-red-400 text-xs text-center mt-3">{error}</p>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6 animate-slide-up">
            <div className="text-center mb-2">
              <div className="text-sm text-gray-400">Welcome back, <span className="text-white font-bold">{user.displayName || 'Player'}</span></div>
              {userProfile && (
                <div className="mt-2 inline-flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full border border-uno-gold/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                  <span className="text-xl">🏆</span>
                  <span className="text-uno-gold font-black">{userProfile.totalPoints?.toLocaleString() || 0}</span>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">PTS</span>
                </div>
              )}
            </div>

            {lastActiveRoom && (
              <button
                onClick={() => {
                  setIsResuming(true);
                  const path = lastActiveRoom.started ? `/uno/game/${lastActiveRoom.code}` : `/uno/lobby/${lastActiveRoom.code}`;
                  router.push(path);
                }}
                disabled={isResuming}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-uno-gold to-yellow-500 text-black font-black text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-bounce-subtle border border-yellow-300/50"
              >
                {isResuming ? '⚡ RESUMING...' : `🚀 RESUME ${lastActiveRoom.started ? 'MATCH' : 'LOBBY'}: ${lastActiveRoom.code}`}
              </button>
            )}

            {/* Create Room Section */}
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-[0_0_30px_rgba(255,0,0,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-uno-red to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <span className="text-uno-red">⚙</span> Host Match
              </h2>

              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-uno-red to-red-600 text-white font-bold text-sm hover:from-red-600 hover:to-red-700 transition-all shadow-[0_0_20px_rgba(255,0,0,0.3)] disabled:opacity-50"
              >
                {isCreating ? 'CREATING LOBBY...' : <span className="flex items-center justify-center gap-2"><GiCardRandom size={18} /> INITIALIZE ROOM</span>}
              </button>
            </div>

            {/* Join Room Section */}
            <div className="glass rounded-3xl p-6 border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-uno-blue to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <span className="text-uno-blue">⚡</span> Direct Connect
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ROOM CODE"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="flex-1 bg-black/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-widest text-center uppercase focus:outline-none focus:border-uno-blue/50 focus:bg-white/5 transition-all"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={isJoining || !roomCode.trim()}
                  className="px-6 py-3 bg-uno-blue/20 text-blue-400 border border-uno-blue/50 rounded-xl font-bold text-sm hover:bg-uno-blue hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-uno-blue/20 disabled:hover:text-blue-400"
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
                href="/uno/rules"
                className="text-xs text-gray-500 hover:text-uno-gold transition-colors uppercase tracking-widest font-bold underline underline-offset-4"
              >
                How to play UNO No Mercy →
              </a>
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <button onClick={() => router.push('/')} className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold">
            ← Back to Funcade Mainframe
          </button>
        </div>
      </main>
    </div>
  );
}
