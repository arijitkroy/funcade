import { getAdminDb } from '../../../lib/firebaseAdmin';
import { checkWin, checkTie } from '../../../lib/tictactoeLogic';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, playerId, cellIndex } = req.body;

  if (!roomCode || !playerId || cellIndex === undefined || cellIndex === null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
    
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(roomRef);
      if (!doc.exists) {
        throw new Error('Room not found');
      }

      const roomData = doc.data();

      if (roomData.status !== 'playing') {
        throw new Error('Game is not active');
      }

      if (roomData.currentPlayer !== playerId) {
        throw new Error('Not your turn');
      }

      const board = [...roomData.board];
      
      if (board[cellIndex] !== "") {
        throw new Error('Cell already occupied');
      }

      // Find player symbol
      const player = roomData.players.find(p => p.uid === playerId);
      if (!player) throw new Error('Player not in room');
      
      const symbol = player.symbol;

      // Update board
      board[cellIndex] = symbol;

      // Check win/tie
      let newStatus = roomData.status;
      let winner = null;

      let updates = {
        board,
        updatedAt: new Date().toISOString()
      };

      const winningLine = checkWin(board, roomData.boardSize, roomData.winCondition, symbol);
      
      if (winningLine) {
        newStatus = 'finished';
        winner = playerId;
        updates.winningLine = winningLine;
        updates[`scores.${playerId}`] = (roomData.scores?.[playerId] || 0) + 1;
      } else if (checkTie(board)) {
        newStatus = 'finished';
        winner = 'tie';
        updates.winningLine = null;
      }

      // Determine next player if not finished
      let nextPlayer = roomData.currentPlayer;
      if (newStatus === 'playing') {
        const otherPlayer = roomData.players.find(p => p.uid !== playerId);
        if (otherPlayer) {
          nextPlayer = otherPlayer.uid;
        }
      }

      updates.status = newStatus;
      updates.winner = winner;
      updates.currentPlayer = nextPlayer;

      transaction.update(roomRef, updates);
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error making move:", error);
    return res.status(500).json({ error: error.message });
  }
}
