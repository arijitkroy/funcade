import { FaTrophy, FaMedal } from 'react-icons/fa';

export default function GameOverModal({ winner, scores, players, onPlayAgain, onLeave }) {
  const sortedPlayers = [...players].sort(
    (a, b) => (scores[b.uid] || 0) - (scores[a.uid] || 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass rounded-2xl p-6 sm:p-10 max-w-md w-full mx-4 animate-slide-up text-center">
        <FaTrophy className="text-6xl mb-4 animate-float text-uno-gold mx-auto" />
        <h2 className="text-2xl sm:text-3xl font-black text-uno-gold mb-2">
          Game Over!
        </h2>

        <p className="text-gray-300 text-sm mb-6">
          <span className="text-white font-bold">
            {players.find((p) => p.uid === winner)?.name || 'Unknown'}
          </span>{' '}
          wins this round!
        </p>

        <div className="bg-[#050505]/50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Scoreboard
          </h3>
          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.uid}
                className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  player.uid === winner
                    ? 'bg-uno-gold/10 border border-uno-gold/30'
                    : 'bg-uno-surface-light/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5">
                    {idx === 0 ? <FaMedal className="text-yellow-400" size={16} /> : idx === 1 ? <FaMedal className="text-gray-300" size={16} /> : idx === 2 ? <FaMedal className="text-amber-600" size={16} /> : <span className="text-sm font-bold text-gray-400">{idx + 1}.</span>}
                  </span>
                  <span className={`text-sm font-semibold ${player.uid === winner ? 'text-uno-gold' : 'text-gray-300'}`}>
                    {player.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">
                  {scores[player.uid] || 0} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onLeave}
            className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors font-semibold text-sm"
          >
            Leave
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-uno-green to-uno-blue text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
