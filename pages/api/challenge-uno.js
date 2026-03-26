import { getAdminDb } from '../../lib/firebaseAdmin';
import { challengeUno } from '../../lib/gameLogic';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, challengerId, targetId } = req.body;

  if (!roomCode || !challengerId || !targetId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const adminDb = getAdminDb();
  const gameRef = adminDb.collection('games').doc(roomCode.toUpperCase());

  try {
    const success = await adminDb.runTransaction(async (t) => {
      const snap = await t.get(gameRef);
      if (!snap.exists) throw new Error('Game not found');

      const state = snap.data();
      const result = challengeUno(state, targetId);
      result.state.updatedAt = new Date().toISOString();

      t.set(gameRef, result.state);
      return result.success;
    });

    return res.status(200).json({ success });
  } catch (error) {
    console.error("Error challenging UNO via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to challenge UNO' });
  }
}
