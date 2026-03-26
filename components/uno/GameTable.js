import UnoCard from './UnoCard';
import { COLOR_HEX } from '@/lib/constants';

export default function GameTable({
  discardPile = [],
  drawPileCount = 0,
  activeColor,
  direction,
  pendingDraw,
  onDrawCard,
  isMyTurn,
}) {
  const topCard = discardPile[discardPile.length - 1];
  const colorIndicator = activeColor ? COLOR_HEX[activeColor] : '#666';

  return (
    <div className="relative flex items-center justify-center gap-4 sm:gap-10 py-4 sm:py-6">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-gray-400 text-[10px] sm:text-sm flex items-center gap-2">
        <span
          className="text-xl sm:text-2xl transition-transform duration-500"
          style={{ transform: direction === 1 ? 'scaleX(1)' : 'scaleX(-1)' }}
        >
          ↻
        </span>
        <span className="text-[10px] sm:text-xs opacity-60">
          {direction === 1 ? 'Clockwise' : 'Counter-clockwise'}
        </span>
      </div>

      <button
        id="draw-pile-target"
        onClick={isMyTurn ? onDrawCard : undefined}
        disabled={!isMyTurn}
        className={`relative group ${isMyTurn ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="relative">
          <div className="absolute top-1 left-1 w-16 h-28 sm:w-24 sm:h-36 rounded-xl bg-gray-800 border-2 border-gray-600" />
          <div className="absolute top-0.5 left-0.5 w-16 h-28 sm:w-24 sm:h-36 rounded-xl bg-gray-750 border-2 border-gray-600" />
          <UnoCard card={{}} faceDown />
        </div>

        <div className="absolute -top-2 -right-2 bg-uno-surface-light border border-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-white shadow-lg">
          {drawPileCount}
        </div>
        <div className={`mt-2 text-center text-xs font-semibold ${isMyTurn ? 'text-uno-gold animate-pulse' : 'text-gray-500'}`}>
          {isMyTurn ? 'DRAW' : 'Draw Pile'}
        </div>

        {isMyTurn && (
          <div className="absolute inset-0 rounded-xl bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      <div id="discard-pile-target" className="relative">
        {topCard ? (
          <>
            {discardPile.length > 2 && (
              <div className="absolute top-2 left-1 w-16 h-28 sm:w-24 sm:h-36 rounded-xl bg-gray-700/50 rotate-3" />
            )}
            {discardPile.length > 1 && (
              <div className="absolute top-1 left-0.5 w-16 h-28 sm:w-24 sm:h-36 rounded-xl bg-gray-700/30 -rotate-2" />
            )}
            <UnoCard card={topCard} />
          </>
        ) : (
          <div className="w-16 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-sm">
            Empty
          </div>
        )}

        <div className="flex items-center justify-center mt-2 gap-1.5">
          <div
            className="w-4 h-4 rounded-full border-2 border-white/30 shadow-lg transition-colors duration-300"
            style={{ backgroundColor: colorIndicator }}
          />
          <span className="text-xs text-gray-400 capitalize">{activeColor || 'none'}</span>
        </div>

        <div className="text-center text-xs text-gray-500 font-semibold mt-1">
          Discard Pile
        </div>
      </div>

      {pendingDraw > 0 && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] sm:text-xs font-black px-4 py-2 rounded-xl animate-bounce shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/30 whitespace-nowrap">
            +{pendingDraw} CARDS STACKED! 💀
          </div>
        </div>
      )}
    </div>
  );
}
