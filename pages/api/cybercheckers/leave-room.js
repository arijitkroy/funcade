import { getAdminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { roomCode, playerId } = req.body;

  if (!roomCode || !playerId) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
    
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(roomRef);
      if (!doc.exists) throw new Error('Room not found');

      const roomData = doc.data();

      // If game is playing, removing a player forfeits the game
      if (roomData.status === 'playing') {
        const otherPlayer = roomData.players.find(p => p.uid !== playerId);
        transaction.update(roomRef, {
          status: 'finished',
          winner: otherPlayer ? otherPlayer.uid : null,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Just remove the player from the lobby
        const newPlayers = roomData.players.filter(p => p.uid !== playerId);
        if (newPlayers.length === 0) {
          transaction.delete(roomRef);
        } else {
          transaction.update(roomRef, {
            players: newPlayers,
            hostId: roomData.hostId === playerId ? newPlayers[0].uid : roomData.hostId, // Reassign host if needed
            updatedAt: new Date().toISOString()
          });
        }
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error leaving room:", error);
    return res.status(500).json({ error: error.message });
  }
}
