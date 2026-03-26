export default function Cell({ symbol, onClick, disabled }) {
  const isX = symbol === 'X';
  const isO = symbol === 'O';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || symbol !== ""}
      className={`
        w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 
        flex items-center justify-center 
        bg-black/50 border border-white/10 rounded-2xl 
        transition-all duration-300 ease-out
        ${!symbol && !disabled ? 'hover:bg-white/5 hover:border-white/30 cursor-pointer hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]' : ''}
        ${disabled && !symbol ? 'cursor-not-allowed opacity-60' : ''}
      `}
    >
      {isX && (
        <svg viewBox="0 0 100 100" className="w-3/5 h-3/5 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">
          <path
            d="M 20 20 L 80 80 M 80 20 L 20 80"
            fill="none"
            stroke="#ec4899"
            strokeWidth="12"
            strokeLinecap="round"
            className="animate-draw-path"
            style={{ strokeDasharray: 200, strokeDashoffset: 0 }}
          />
        </svg>
      )}
      
      {isO && (
        <svg viewBox="0 0 100 100" className="w-3/5 h-3/5 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="12"
            strokeLinecap="round"
            className="animate-draw-circle"
            style={{ strokeDasharray: 250, strokeDashoffset: 0 }}
          />
        </svg>
      )}

      <style jsx>{`
        .animate-draw-path {
          animation: drawPath 0.4s ease-out forwards;
        }
        .animate-draw-circle {
          animation: drawCircle 0.5s ease-out forwards;
        }
        @keyframes drawPath {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawCircle {
          from { stroke-dashoffset: 250; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </button>
  );
}
