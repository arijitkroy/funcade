import { useRouter } from 'next/router';

export default function GameOverlay({ status, winner, isHost, onPlayAgain }) {
  const router = useRouter();

  if (status !== 'finished') return null;

  const isTie = winner === 'tie';
  const winnerText = isTie ? "IT'S A TIE" : "WE HAVE A WINNER";
  const winnerColor = isTie ? 'text-gray-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-500">
      <div className="glass max-w-md w-full rounded-3xl p-8 border border-white/10 text-center shadow-[0_0_50px_rgba(236,72,153,0.15)] relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent blur-3xl -z-10 animate-spin-slow" />

        <h2 className={`text-4xl md:text-5xl font-black mb-2 animate-bounce-subtle ${winnerColor}`}>
          {winnerText}
        </h2>

        {!isTie && (
          <p className="text-gray-400 mb-8 font-medium">
            Player <span className="text-white font-bold">{winner === 'X' ? '1 (X)' : '2 (O)'}</span> dominated the grid!
          </p>
        )}
        {isTie && (
          <p className="text-gray-400 mb-8 font-medium">
            The grid was perfectly balanced.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button 
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all hover:scale-105"
          >
            PLAY AGAIN
          </button>
          
          <button 
            onClick={() => router.push('/tictactoe')}
            className="w-full sm:w-auto px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
          >
            EXIT GAME
          </button>
        </div>

      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
