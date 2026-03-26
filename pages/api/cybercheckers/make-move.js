import { getAdminDb } from '../../../lib/firebaseAdmin';
import { getValidMoves, checkWinPattern } from '../../../lib/cyberCheckersLogic';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { roomCode, playerId, fromPos, toPos } = req.body;

  if (!roomCode || !playerId || !fromPos || !toPos) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
    
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(roomRef);
      if (!doc.exists) throw new Error('Room not found');

      const roomData = doc.data();

      if (roomData.status !== 'playing') throw new Error('Game is not active');
      if (roomData.currentPlayer !== playerId) throw new Error('Not your turn');

      const player = roomData.players.find(p => p.uid === playerId);
      if (!player) throw new Error('Player not in room');

      const board = [...roomData.board];
      const fromCellIndex = board.findIndex(c => c.q === fromPos.q && c.r === fromPos.r);
      if (fromCellIndex === -1) throw new Error('Invalid start position');
      
      const fromCell = board[fromCellIndex];
      if (fromCell.piece !== player.piece) throw new Error('Not your piece');

      // Validate move
      const shape = roomData.boardShape || 'star';
      const validMoves = getValidMoves(board, fromPos.q, fromPos.r, shape);
      const isValid = validMoves.some(m => m.q === toPos.q && m.r === toPos.r);
      if (!isValid) throw new Error('Invalid move');

      const toCellIndex = board.findIndex(c => c.q === toPos.q && c.r === toPos.r);
      if (toCellIndex === -1) throw new Error('Invalid end position');

      // Apply move
      board[fromCellIndex].piece = null;
      board[toCellIndex].piece = player.piece;

      // Check win condition
      const winnerPiece = checkWinPattern(board, shape);
      let newStatus = 'playing';
      let winnerId = null;

      if (winnerPiece) {
        newStatus = 'finished';
        const winningPlayer = roomData.players.find(p => p.piece === winnerPiece);
        winnerId = winningPlayer ? winningPlayer.uid : null;
      }

      // Determine next player
      let nextPlayer = roomData.currentPlayer;
      if (newStatus === 'playing') {
        const otherPlayer = roomData.players.find(p => p.uid !== playerId);
        if (otherPlayer) nextPlayer = otherPlayer.uid;
      }

      transaction.update(roomRef, {
        board,
        status: newStatus,
        winner: winnerId,
        currentPlayer: nextPlayer,
        updatedAt: new Date().toISOString()
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error making move:", error);
    return res.status(500).json({ error: error.message });
  }
}
