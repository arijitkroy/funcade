import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseProvider';
import { FaUserCircle, FaBars, FaTimes, FaGamepad } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';

export default function GlobalNavbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { db } = useFirebase();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
  }, [isMenuOpen]);

  useEffect(() => {
    async function fetchProfile() {
      if (user && !user.isAnonymous && db) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          }
        } catch (err) {
          console.warn('Failed to fetch user profile.', err);
        }
      } else {
        setUserProfile(null);
      }
    }
    fetchProfile();
  }, [user, db]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-white font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity"
        >
          <FaGamepad className="text-purple-500 text-3xl" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Funcade
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">                    
          {user ? (
            <div className="flex items-center gap-4">
              {userProfile && (
                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-purple-500/30">
                  <span className="text-xs text-gray-400">PTS</span>
                  <span className="text-sm text-purple-400 font-bold">{userProfile.totalPoints?.toLocaleString() || 0}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
                ) : (
                  <FaUserCircle className="text-2xl text-gray-400" />
                )}
                <span className="text-sm text-gray-200 truncate max-w-[120px] font-medium">
                  {user.displayName?.split(' ')[0] || 'Player'}
                </span>
                <button
                  onClick={signOut}
                  className="text-xs bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg border border-white/5 transition-all ml-2"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/30"
            >
              Sign In
            </button>
          )}
        </div>

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </div>

      <div 
        className={`md:hidden fixed inset-0 top-16 z-[980] bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
      />

      <div 
        className={`md:hidden h-[calc(100dvh-64px)] fixed top-16 right-0 bottom-0 w-[280px] z-[990] bg-[#0a0a0a] border-l border-white/10 transition-transform duration-300 ease-out flex flex-col p-6 gap-6 shadow-2xl ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >        
        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20" />
                ) : (
                  <FaUserCircle className="text-4xl text-gray-400" />
                )}
                <div>
                  <div className="text-sm text-white font-bold">{user.displayName || 'Player'}</div>
                  <div className="text-xs text-purple-400 font-medium">{userProfile?.totalPoints?.toLocaleString() || 0} pts</div>
                </div>
              </div>
              <button
                onClick={() => { signOut(); closeMenu(); }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 py-3 rounded-xl font-bold transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { signInWithGoogle(); closeMenu(); }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
