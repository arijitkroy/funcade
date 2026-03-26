import { getAdminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, playerId, playerName } = req.body;

  if (!roomCode || !playerId) {
    return res.status(400).json({ error: 'Missing roomCode or playerId' });
  }

  try {
    const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
    
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(roomRef);
      if (!doc.exists) {
        throw new Error('Room not found');
      }

      const roomData = doc.data();
      const players = roomData.players || [];

      // Check if already in room
      if (players.some(p => p.uid === playerId)) {
        return; // Already joined
      }

      if (players.length >= 2) {
        throw new Error('Room is full');
      }

      // Add as Player 2
      players.push({
        uid: playerId,
        name: playerName || 'Player 2',
        symbol: 'O',
      });

      let status = roomData.status;

      transaction.update(roomRef, {
        players,
        status,
        [`scores.${playerId}`]: 0,
        updatedAt: new Date().toISOString()
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error joining room:", error);
    return res.status(500).json({ error: error.message });
  }
}
