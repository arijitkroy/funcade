import { getAdminDb } from '../../lib/firebaseAdmin';
import { validateMove, applyCardEffect } from '../../lib/gameLogic';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, playerId, cardId, chosenColor, swapTargetId } = req.body;

  if (!roomCode || !playerId || !cardId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const adminDb = getAdminDb();
  const gameRef = adminDb.collection('games').doc(roomCode.toUpperCase());

  try {
    await adminDb.runTransaction(async (t) => {
      const snap = await t.get(gameRef);
      if (!snap.exists) throw new Error('Game not found');

      const state = snap.data();
      const card = state.playersHands[playerId]?.find((c) => c.id === cardId);
      if (!card) throw new Error('Card not in hand');

      const validation = validateMove(state, playerId, card);
      if (!validation.valid) throw new Error(validation.reason);

      if (state.calledUno) {
        state.calledUno[playerId] = false;
      }

      const newState = applyCardEffect(state, playerId, card, chosenColor, swapTargetId);
      newState.updatedAt = new Date().toISOString();

      t.set(gameRef, newState);
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error playing card via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to play card' });
  }
}
