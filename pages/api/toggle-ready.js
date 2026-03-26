import { getAdminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, playerId } = req.body;

  if (!roomCode || !playerId) {
    return res.status(400).json({ error: 'Missing roomCode or playerId' });
  }

  const adminDb = getAdminDb();
  const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());

  try {
    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(roomRef);
      if (!doc.exists) throw new Error('Room not found');

      const roomData = doc.data();
      const players = roomData.players || [];
      const updatedPlayers = players.map((p) =>
        p.uid === playerId ? { ...p, ready: !p.ready } : p
      );

      t.update(roomRef, { 
        players: updatedPlayers,
        updatedAt: new Date().toISOString() 
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error toggling ready via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to toggle ready' });
  }
}
