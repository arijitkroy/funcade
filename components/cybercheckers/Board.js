import { useState } from 'react';
import { getValidMoves } from '@/lib/cyberCheckersLogic';
import { FaRegCircle, FaDotCircle } from 'react-icons/fa';

export default function Board({ boardData, boardShape = 'star', currentPlayerId, userPiece, isMyTurn, onMove }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  // Hex Grid Spacing Constants
  const DX = 5.5; // percentage width
  const DY = DX * 0.866; // percentage height (sqrt(3)/2)

  const handleCellClick = (cell) => {
    if (!isMyTurn) return;

    // 1. If clicking own piece, select it and show valid moves
    if (cell.piece === userPiece) {
      setSelectedCell(cell);
      setValidMoves(getValidMoves(boardData, cell.q, cell.r, boardShape));
      return;
    }

    // 2. If a piece is already selected and we click a valid destination, make move
    if (selectedCell) {
      const isMoveValid = validMoves.some(m => m.q === cell.q && m.r === cell.r);
      if (isMoveValid) {
        onMove({ q: selectedCell.q, r: selectedCell.r }, { q: cell.q, r: cell.r });
        setSelectedCell(null);
        setValidMoves([]);
      } else {
        // Deselect if clicked elsewhere
        setSelectedCell(null);
        setValidMoves([]);
      }
    }
  };

  return (
    <div className={`relative w-full aspect-square max-w-[600px] border border-white/5 rounded-full bg-black/40 shadow-2xl overflow-hidden glass transition-transform duration-700 ${userPiece === 1 ? 'rotate-180' : ''}`}>
      {/* Dynamic Background Glow based on turn */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full transition-colors duration-1000 blur-3xl opacity-20 ${userPiece === 1 ? 'bg-cyan-500' : 'bg-fuchsia-500'}`} />

      {boardData.map((cell) => {
        const xPos = 50 + (cell.q + cell.r / 2) * DX;
        const yPos = 50 + cell.r * DY;

        const isSelected = selectedCell?.q === cell.q && selectedCell?.r === cell.r;
        const isValidMove = validMoves.some(m => m.q === cell.q && m.r === cell.r);
        
        let pieceColor = '';
        let glowClass = '';
        if (cell.piece === 1) {
          pieceColor = 'text-cyan-400';
          glowClass = 'drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]';
        } else if (cell.piece === 2) {
          pieceColor = 'text-fuchsia-500';
          glowClass = 'drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]';
        }

        return (
          <div
            key={cell.id}
            onClick={() => handleCellClick(cell)}
            className={`absolute w-[4.5%] aspect-square -translate-x-[50%] -translate-y-[50%] rounded-full flex items-center justify-center transition-all duration-300
              ${cell.piece !== null ? 'cursor-pointer hover:scale-110' : ''}
              ${isValidMove ? 'cursor-pointer animate-pulse bg-white/20 ring-2 ring-white z-20' : 'bg-white/5 border border-white/10'}
              ${isSelected ? 'ring-2 ring-yellow-400 scale-125 z-30 bg-white/20' : ''}
            `}
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`
            }}
          >
            {cell.piece && (
              <FaDotCircle className={`w-[80%] h-[80%] ${pieceColor} ${glowClass} relative z-10 transition-transform ${isSelected ? 'scale-110' : ''}`} />
            )}
            
            {/* Valid destination dot indicator */}
            {isValidMove && !cell.piece && (
              <div className="w-[30%] h-[30%] rounded-full bg-white opacity-80" />
            )}
          </div>
        );
      })}
    </div>
  );
}
