import Cell from './Cell';

export default function Board({ board, boardSize, onCellClick, disabled, winningLine }) {
  let lineStyle = null;
  
  if (winningLine && winningLine.length > 0) {
    const startIdx = winningLine[0];
    const endIdx = winningLine[winningLine.length - 1];

    const startRow = Math.floor(startIdx / boardSize);
    const startCol = startIdx % boardSize;
    const endRow = Math.floor(endIdx / boardSize);
    const endCol = endIdx % boardSize;

    const x1 = ((startCol + 0.5) / boardSize) * 100;
    const y1 = ((startRow + 0.5) / boardSize) * 100;
    const x2 = ((endCol + 0.5) / boardSize) * 100;
    const y2 = ((endRow + 0.5) / boardSize) * 100;

    lineStyle = { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
  }

  return (
    <div className="relative">
      <div 
        className="grid gap-2 sm:gap-3 p-4 bg-white/5 rounded-3xl backdrop-blur-md shadow-2xl border border-white/10 relative z-10"
      style={{
        gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`
      }}
    >
      {board.map((symbol, index) => (
        <Cell 
          key={index}
          symbol={symbol}
          onClick={() => onCellClick(index)}
          disabled={disabled}
        />
      ))}
      </div>

      {lineStyle && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
          <line
            x1={lineStyle.x1}
            y1={lineStyle.y1}
            x2={lineStyle.x2}
            y2={lineStyle.y2}
            stroke="white"
            strokeWidth="10"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            className="animate-strike"
          />
        </svg>
      )}

      <style jsx>{`
        .animate-strike {
          animation: strike 0.6s cubic-bezier(0.2, 1, 0.2, 1) forwards;
        }
        @keyframes strike {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
