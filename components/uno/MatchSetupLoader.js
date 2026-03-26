import { useState, useEffect } from 'react';
import UnoCard from './UnoCard';
import { GAME_ASSETS } from '@/lib/constants';

const LOADING_MESSAGES = [
  "Shuffling the deck...",
  "Dealing cards to players...",
  "Finding your lucky seat...",
  "Syncing with the game server...",
  "Preparing the discard pile...",
  "Applying House Rules...",
  "Removing Mercy for opponents...",
  "Warming up the deck...",
  "Loading premium assets...",
];

export default function MatchSetupLoader({ diagnostic, onReady }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    // Preload game assets with progress tracking
    console.log(`[Loader] Starting preloading of ${GAME_ASSETS.length} assets...`);
    let loadedCount = 0;
    
    if (GAME_ASSETS.length === 0) {
      if (onReady) onReady();
      return;
    }

    GAME_ASSETS.forEach((path) => {
      const img = new Image();
      const handleLoad = () => {
        loadedCount++;
        setLoadProgress(Math.floor((loadedCount / GAME_ASSETS.length) * 100));
        if (loadedCount === GAME_ASSETS.length) {
          console.log('[Loader] All assets cached successfully!');
          if (onReady) onReady();
        }
      };
      img.onload = handleLoad;
      img.onerror = handleLoad; // Count errors as "processed" to avoid getting stuck
      img.src = path;
    });

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [onReady]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-uno-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-12">
          <div className="absolute inset-0 -m-4 border-2 border-dashed border-uno-gold/30 rounded-full animate-spin-slow" />
          
          <div className="w-24 h-36 flex items-center justify-center animate-bounce-subtle">
            <UnoCard faceDown className="shadow-[0_0_40px_rgba(255,255,255,0.1)]" />
            
            <div className="absolute -right-4 -top-4 w-12 h-16 glass rounded-lg border border-white/10 animate-card-fly-1 opacity-0 rotate-12" />
            <div className="absolute -left-4 -bottom-4 w-12 h-16 glass rounded-lg border border-white/10 animate-card-fly-2 opacity-0 -rotate-12" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-white text-3xl font-black italic tracking-tighter mb-4 flex items-center justify-center gap-3">
            SETTING UP <span className="text-uno-gold">MATCH</span>
          </h2>
          
          <div className="h-6 flex flex-col items-center justify-center gap-2">
            <p key={messageIndex} className="text-gray-400 text-sm font-medium tracking-wide animate-fade-in">
              {LOADING_MESSAGES[messageIndex]}
            </p>
            {diagnostic && (
              <p className="text-uno-gold/40 text-[10px] uppercase tracking-[0.2em] animate-pulse">
                {diagnostic}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
          <div 
            className="h-full bg-gradient-to-r from-uno-gold to-yellow-300 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(255,193,7,0.5)]" 
            style={{ width: `${loadProgress}%` }}
          />
        </div>
        <div className="mt-2 text-[10px] text-gray-600 font-mono tracking-widest">
          CACHING ASSETS: {loadProgress}%
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes card-fly-1 {
          0% { transform: translate(0, 0) rotate(12deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(60px, -40px) rotate(45deg); opacity: 0; }
        }
        @keyframes card-fly-2 {
          0% { transform: translate(0, 0) rotate(-12deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(-60px, 40px) rotate(-45deg); opacity: 0; }
        }
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
        .animate-card-fly-1 {
          animation: card-fly-1 1.5s ease-out infinite;
        }
        .animate-card-fly-2 {
          animation: card-fly-2 1.5s ease-out infinite;
          animation-delay: 0.75s;
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
