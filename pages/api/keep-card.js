import { getAdminDb } from '../../lib/firebaseAdmin';
import { getCurrentPlayerId, getNextPlayerIndex } from '../../lib/gameLogic';
import { GAME_STATES } from '../../lib/constants';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, playerId } = req.body;

  if (!roomCode || !playerId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const adminDb = getAdminDb();
  const gameRef = adminDb.collection('games').doc(roomCode.toUpperCase());

  try {
    await adminDb.runTransaction(async (t) => {
      const snap = await t.get(gameRef);
      if (!snap.exists) throw new Error('Game not found');

      const state = snap.data();

      if (getCurrentPlayerId(state) !== playerId) {
        throw new Error('Not your turn');
      }

      if (state.gameState !== GAME_STATES.PLAYING) {
        throw new Error('Game is not active');
      }

      // Advance turn to next player
      const nextIdx = getNextPlayerIndex(
        state.activePlayers,
        state.activePlayers.indexOf(playerId),
        state.direction
      );

      t.update(gameRef, {
        currentPlayerIndex: nextIdx,
        turnNumber: (state.turnNumber || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error keeping card via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to keep card' });
  }
}
