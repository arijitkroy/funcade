import { CARD_TYPES, CARD_SYMBOLS, getCardImagePath, COLOR_HEX } from '@/lib/constants';
import Image from 'next/image';
import { GiCardRandom } from 'react-icons/gi';

const colorBorderClasses = {
  red: 'border-[#E53935]',
  blue: 'border-[#1E88E5]',
  green: 'border-[#43A047]',
  purple: 'border-[#8E24AA]',
};

export default function UnoCard({
  card,
  onClick,
  playable = false,
  faceDown = false,
  small = false,
  animated = false,
  className = '',
}) {
  const sizeClasses = small
    ? 'w-10 h-16 sm:w-12 sm:h-20 rounded-lg'
    : 'w-16 h-28 sm:w-24 sm:h-36 rounded-xl';

  if (faceDown) {
    return (
      <div
        className={`${sizeClasses} relative overflow-hidden border-2 border-gray-600
          bg-gray-800 shadow-lg cursor-default select-none font-bold text-white ${className}`}
      >
        <Image
          src="/assets/card_back.png"
          alt="Card Back"
          fill
          className="object-cover"
          sizes={small ? '48px' : '96px'}
          draggable={false}
        />
      </div>
    );
  }

  const imagePath = getCardImagePath(card);
  const isWild = card.color === null || card.type?.startsWith('wild');
  const borderClass = card.color ? (colorBorderClasses[card.color] || 'border-gray-600') : 'border-gray-500';

  if (imagePath) {
    return (
      <button
        onClick={playable ? onClick : undefined}
        disabled={!playable}
        className={`
          ${sizeClasses} relative overflow-hidden border-3 shadow-lg select-none
          ${borderClass} bg-black
          ${playable ? 'card-hover cursor-pointer ring-2 ring-white/30 hover:ring-white/60' : 'cursor-default opacity-80'}
          ${animated ? 'animate-card-draw' : ''}
          transition-all duration-200
          ${className}
        `}
      >
        <Image
          src={imagePath}
          alt={getCardLabel(card)}
          fill
          className="object-cover"
          sizes={small ? '48px' : '96px'}
          draggable={false}
        />

        {playable && (
          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
        )}
      </button>
    );
  }

  const display =
    card.type === CARD_TYPES.NUMBER
      ? card.value?.toString()
      : CARD_SYMBOLS[card.type] || '?';

  return (
    <button
      onClick={playable ? onClick : undefined}
      disabled={!playable}
      className={`
        ${sizeClasses} relative flex flex-col items-center justify-center
        border-3 shadow-lg select-none font-bold text-white
        bg-gradient-to-br from-[#E53935] via-[#1E88E5] to-[#43A047]
        ${borderClass}
        ${playable ? 'card-hover cursor-pointer ring-2 ring-white/30 hover:ring-white/60' : 'cursor-default opacity-80'}
        ${animated ? 'animate-card-draw' : ''}
        transition-all duration-200
        ${className}
      `}
    >
      <span className="absolute top-1 left-1.5 text-[10px] sm:text-xs font-black drop-shadow-md">
        {display}
      </span>
      <span className="text-lg sm:text-2xl font-black drop-shadow-lg leading-none">
        {display}
      </span>
      <span className="absolute bottom-1 right-1.5 text-[10px] sm:text-xs font-black rotate-180 drop-shadow-md">
        {display}
      </span>
      {playable && (
        <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse pointer-events-none" />
      )}
    </button>
  );
}

function getCardLabel(card) {
  if (!card) return 'Card';
  if (card.type === CARD_TYPES.NUMBER) {
    return `${card.color || ''} ${card.value}`.trim();
  }
  const symbol = CARD_SYMBOLS[card.type] || card.type;
  return `${card.color || 'wild'} ${symbol}`.trim();
}
