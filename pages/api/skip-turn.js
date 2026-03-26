import { getAdminDb } from '../../lib/firebaseAdmin';
import { getNextPlayerIndex } from '../../lib/gameLogic';
import { GAME_STATES } from '../../lib/constants';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, requesterId } = req.body;

  if (!roomCode || !requesterId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const adminDb = getAdminDb();
  const gameRef = adminDb.collection('games').doc(roomCode.toUpperCase());

  try {
    await adminDb.runTransaction(async (t) => {
      const snap = await t.get(gameRef);
      if (!snap.exists) throw new Error('Game not found');

      const state = snap.data();

      if (state.gameState !== GAME_STATES.PLAYING) {
        throw new Error('Game is not in progress');
      }

      // Only skip if turn has been idle for at least 15 seconds (with 3s grace for sync)
      const turnStart = state.turnStartedAt ? new Date(state.turnStartedAt).getTime() : 0;
      const now = Date.now();
      if (now - turnStart < 12000) {
        throw new Error('Turn timeout not reached yet');
      }

      const currentIdx = state.currentPlayerIndex;
      const nextIdx = getNextPlayerIndex(
        state.activePlayers,
        currentIdx,
        state.direction
      );

      state.currentPlayerIndex = nextIdx;
      state.turnNumber = (state.turnNumber || 0) + 1;
      state.turnStartedAt = new Date().toISOString();
      state.lastAction = { type: 'SKIP_TIMEOUT', playerId: state.activePlayers[currentIdx] };
      state.updatedAt = new Date().toISOString();

      // Clear any pending draw for the skipped player
      if (state.pendingDraw > 0) {
        state.pendingDraw = 0;
        state.pendingDrawType = null;
      }

      t.set(gameRef, state);
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error skipping turn:", error);
    return res.status(400).json({ error: error.message || 'Failed to skip turn' });
  }
}
