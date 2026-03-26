import UnoCard from './UnoCard';
import { canPlayCard } from '@/lib/gameLogic';

export default function PlayerHand({
  cards = [],
  topDiscard,
  activeColor,
  pendingDraw,
  pendingDrawType,
  isMyTurn,
  onPlayCard,
}) {
  const getOverlapClass = () => {
    if (cards.length > 20) return '-ml-10 sm:-ml-16';
    if (cards.length > 15) return '-ml-8 sm:-ml-12';
    if (cards.length > 10) return '-ml-6 sm:-ml-10';
    return '-ml-4 sm:ml-0'; 
  };

  return (
    <div id="my-hand-target" className="w-full px-2 py-3 overflow-visible">
      <div
        className="flex pb-8 px-4 sm:px-10 overflow-x-auto overflow-y-visible scroll-smooth snap-x touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-end justify-start min-w-max mx-auto h-40 sm:h-52 px-10">
          {cards.map((card, idx) => {
            const playable =
              isMyTurn &&
              canPlayCard(card, topDiscard, activeColor, pendingDraw, pendingDrawType);

            return (
              <div
                key={card.id || idx}
                className={`
                  flex-shrink-0 animate-slide-up transition-all duration-300 snap-center
                  first:ml-0 ${getOverlapClass()}
                `}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                <UnoCard
                  card={card}
                  playable={playable}
                  onClick={() => onPlayCard(card)}
                  className={playable ? 'hover:-translate-y-12 hover:z-20 relative transition-transform' : 'hover:-translate-y-4'}
                />
              </div>
            );
          })}
        </div>

        {cards.length === 0 && (
          <div className="w-full text-center text-gray-500 text-sm italic py-8">
            No cards in hand
          </div>
        )}
      </div>
    </div>
  );
}
