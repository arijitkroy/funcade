import { useEffect, useState } from 'react';
import { FaUserAstronaut, FaUserSecret } from 'react-icons/fa';

export default function DiceRollOverlay({ startingPlayer }) {
  const [currentFace, setCurrentFace] = useState(0); 

  useEffect(() => {
    let t;
    let ticks = 0;
    let speed = 50;
    
    const roll = () => {
      ticks++;
      // Truly randomize the frames before the final tick lands on the predetermined winner
      setCurrentFace(Math.random() > 0.5 ? 1 : 0);
      
      if (ticks < 20) {
        t = setTimeout(roll, speed);
      } else if (ticks < 30) {
        t = setTimeout(roll, speed * 2);
      } else if (ticks < 38) {
        t = setTimeout(roll, speed * 4);
      } else {
        // Land on winner
        setCurrentFace(startingPlayer?.symbol === 'X' ? 0 : 1);
      }
    };
    
    t = setTimeout(roll, speed);
    return () => clearTimeout(t);
  }, [startingPlayer]);
  
  const isX = currentFace === 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <h2 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white mb-12 tracking-[0.2em] animate-pulse text-center px-4">
        CALCULATING INITIATIVE...
      </h2>

      <div className="relative w-48 h-48 sm:w-56 sm:h-56 perspective-[1000px]">
        <div className={`w-full h-full rounded-3xl flex items-center justify-center border-4 shadow-2xl transition-all duration-75 ${isX ? 'bg-pink-500/20 border-pink-500 shadow-pink-500/50' : 'bg-sky-400/20 border-sky-400 shadow-sky-400/50'}`}>
          {isX ? (
            <div className="flex flex-col items-center scale-110">
              <FaUserAstronaut className="text-pink-400 text-6xl sm:text-7xl mb-4" />
              <span className="text-5xl sm:text-6xl font-mono font-black text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">X</span>
            </div>
          ) : (
            <div className="flex flex-col items-center scale-110">
              <FaUserSecret className="text-sky-400 text-6xl sm:text-7xl mb-4" />
              <span className="text-5xl sm:text-6xl font-mono font-black text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">O</span>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-12 text-gray-400 font-mono tracking-widest uppercase text-sm">
        [ Randomizing Start Order ]
      </p>
    </div>
  );
}
