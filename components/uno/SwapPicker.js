export default function SwapPicker({ players, currentPlayerId, onSelect, onClose }) {
  const otherPlayers = players.filter((p) => p.uid !== currentPlayerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 animate-slide-up">
        <h3 className="text-white text-lg font-bold text-center mb-2">Swap Hands</h3>
        <p className="text-gray-400 text-sm text-center mb-6">
          Choose a player to swap your hand with
        </p>

        <div className="flex flex-col gap-3">
          {otherPlayers.map((player) => (
            <button
              key={player.uid}
              onClick={() => onSelect(player.uid)}
              className="
                flex items-center gap-3 p-3 rounded-xl
                bg-uno-surface-light hover:bg-uno-surface border border-gray-700
                hover:border-uno-gold/50 transition-all duration-200
                group
              "
            >
              <div className="w-10 h-10 rounded-full bg-uno-surface flex items-center justify-center text-sm font-bold text-white border-2 border-gray-600 group-hover:border-uno-gold transition-colors">
                {player.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="text-left">
                <div className="text-white text-sm font-semibold">{player.name}</div>
                <div className="text-gray-500 text-xs">
                  {player.cardCount || '?'} cards
                </div>
              </div>
              <span className="ml-auto text-gray-600 group-hover:text-uno-gold transition-colors text-lg">
                ⇄
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
