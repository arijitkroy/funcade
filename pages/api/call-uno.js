import { getAdminDb } from '../../lib/firebaseAdmin';
import { callUno } from '../../lib/gameLogic';

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
      const newState = callUno(state, playerId);
      newState.updatedAt = new Date().toISOString();

      t.set(gameRef, newState);
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error calling UNO via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to call UNO' });
  }
}
