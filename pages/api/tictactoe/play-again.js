import { getAdminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, playerId } = req.body;

  if (!roomCode || !playerId) {
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

      // We only allow play-again if the game is finished
      if (roomData.status !== 'finished') {
        throw new Error('Game is not finished yet');
      }

      // We need both players to hit "play again" ideally, or just the host.
      // Let's make it simple: first player to hit "play again" resets the board
      // Or we can track playAgainRequests. Let's just reset immediately for fast arcade action.
      // Reset the board:
      const newBoard = Array(roomData.boardSize * roomData.boardSize).fill("");
      
      // Randomize who goes first, or winner goes first?
      // Let's just make Player 1 go first always, or swap?
      // For now, host goes first.
      // Randomize who goes first
      const p1 = roomData.players[0].uid;
      const p2 = roomData.players[1].uid;
      
      const nodeCrypto = require('crypto');
      const cryptoRandom = nodeCrypto.randomInt(0, 2);
      const startingPlayerId = cryptoRandom === 0 ? p1 : p2;

      transaction.update(roomRef, {
        board: newBoard,
        status: 'rolling',
        winner: null,
        winningLine: null,
        currentPlayer: startingPlayerId,
        updatedAt: new Date().toISOString()
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error requesting play again:", error);
    return res.status(500).json({ error: error.message });
  }
}
