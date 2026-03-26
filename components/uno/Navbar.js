import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaTrophy, FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
  }, [isMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/uno"
          onClick={closeMenu}
          className="flex items-center gap-2 text-white font-black text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="text-uno-red">U</span>
          <span className="text-uno-purple">N</span>
          <span className="text-uno-green">O</span>
          <span className="text-gray-400 font-semibold text-sm ml-1">No Mercy</span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/uno/leaderboard"
            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1"
          >
            <FaTrophy className="text-uno-gold/70" />
            <span>Leaderboard</span>
          </Link>
          
          {user && (
            <>
              <div className="h-4 w-px bg-gray-700 mx-1" />
              <Link
                href="/uno/rules"
                className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1"
              >
                Rules
              </Link>
              <div className="h-4 w-px bg-gray-700 mx-1" />
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 truncate max-w-[120px] font-medium">
                  {user.displayName || 'Anonymous'}
                </span>
                <button
                  onClick={signOut}
                  className="text-xs bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>
      </div>

      <div 
        className={`
          md:hidden fixed inset-0 top-14 z-[980] bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeMenu}
      />

      <div 
        className={`
          md:hidden h-[calc(100dvh-56px)] fixed top-14 right-0 bottom-0 w-[280px] z-[990] bg-[#121212] border-l border-white/10
          transition-transform duration-300 ease-out flex flex-col p-6 gap-6 shadow-2xl
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <Link
          href="/uno/leaderboard"
          onClick={closeMenu}
          className="flex items-center gap-3 text-gray-300 hover:text-white text-sm font-medium p-3 bg-white/5 rounded-xl transition-all"
        >
          <FaTrophy className="text-uno-gold" />
          Leaderboard
        </Link>
        
        {user && (
          <>
            <Link
              href="/uno/rules"
              onClick={closeMenu}
              className="text-gray-300 hover:text-white text-sm font-medium p-3 bg-white/5 rounded-xl transition-all"
            >
              Game Rules
            </Link>
            
            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
              <div className="px-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Signed in as</div>
                <div className="text-sm text-white font-semibold truncate">
                  {user.displayName || 'Anonymous Player'}
                </div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  closeMenu();
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
