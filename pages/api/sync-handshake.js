import { getAdminDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, playerId } = req.body;

  if (!roomCode || !playerId) {
    return res.status(400).json({ error: 'Missing roomCode or playerId' });
  }

  const adminDb = getAdminDb();
  const gameRef = adminDb.collection('games').doc(roomCode.toUpperCase());

  try {
    await gameRef.update({
      [`syncedPlayers.${playerId}`]: true,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in sync-handshake via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to sync player' });
  }
}
