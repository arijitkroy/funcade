import { FaSkull } from 'react-icons/fa';
import { GiCardRandom } from 'react-icons/gi';

export default function PlayerSeat({
  player,
  cardCount = 0,
  score = 0,
  isCurrentTurn = false,
  isEliminated = false,
  calledUno = false,
  onChallengeUno,
  position = 'top',
}) {
  const positionClasses = {
    top: 'flex-col',
    left: 'flex-row',
    right: 'flex-row-reverse',
    'top-left': 'flex-col',
    'top-right': 'flex-col',
  };

  return (
    <div
      id={`player-seat-${player?.uid}`}
      className={`
        flex ${positionClasses[position] || 'flex-col'} items-center gap-2
        ${isEliminated ? 'opacity-40' : ''}
        transition-all duration-300
      `}
    >
      <div
        className={`
          relative w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
          text-sm sm:text-lg font-bold border-3 transition-all duration-500
          ${isCurrentTurn ? 'turn-glow border-uno-gold scale-110' : 'border-gray-600 bg-uno-surface'}
          ${isEliminated ? 'bg-red-900/50 border-red-500/50' : 'bg-uno-surface-light'}
        `}
      >
        <span className="text-base sm:text-xl flex items-center justify-center">
          {isEliminated ? <FaSkull /> : (player?.name?.[0]?.toUpperCase() || '?')}
        </span>

        {calledUno && (
          <div className="absolute -top-1 -right-1 bg-uno-gold text-black text-[8px] font-black px-1.5 py-0.5 rounded-full animate-stack-bounce">
            UNO!
          </div>
        )}
      </div>

      <div className="text-center min-w-0">
        <div className={`text-xs sm:text-sm font-semibold truncate max-w-[80px] ${isCurrentTurn ? 'text-uno-gold' : 'text-gray-300'}`}>
          {player?.name || 'Player'}
        </div>

        {!isEliminated && (
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <GiCardRandom className="text-[12px] text-gray-400" />
            <span className={`text-xs font-bold ${cardCount <= 2 ? 'text-red-400' : 'text-gray-400'}`}>
              {cardCount}
            </span>
          </div>
        )}

        {isEliminated && (
          <span className="text-[10px] text-red-400 font-semibold">ELIMINATED</span>
        )}

        {!isEliminated && score > 0 && (
          <div className="text-[10px] text-uno-gold font-bold flex items-center gap-0.5 justify-center">
            🏆 {score}
          </div>
        )}

        {cardCount === 1 && !calledUno && !isEliminated && onChallengeUno && (
          <button
            onClick={onChallengeUno}
            className="mt-1 text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded-full font-bold transition-colors animate-pulse"
          >
            Catch!
          </button>
        )}
      </div>
    </div>
  );
}
