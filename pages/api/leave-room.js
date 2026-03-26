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
      if (!doc.exists) return;

      const roomData = doc.data();
      const players = roomData.players || [];
      const updatedPlayers = players.filter((p) => p.uid !== playerId);

      if (updatedPlayers.length === players.length) return; // Already removed

      if (updatedPlayers.length === 0) {
        t.delete(roomRef);
      } else {
        const updates = { players: updatedPlayers };
        if (roomData.hostId === playerId) {
          updates.hostId = updatedPlayers[0].uid;
        }
        t.update(roomRef, updates);
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error leaving room via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to leave room' });
  }
}
