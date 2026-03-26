import { getAdminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { roomCode, hostId } = req.body;

  if (!roomCode || !hostId) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
    
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(roomRef);
      if (!doc.exists) throw new Error('Room not found');

      const roomData = doc.data();

      if (roomData.hostId !== hostId) throw new Error('Only the host can start the game');
      if (roomData.players.length < 2) throw new Error('Need 2 players to start');
      if (roomData.status === 'playing') throw new Error('Game already started');

      transaction.update(roomRef, {
        status: 'playing',
        currentPlayer: roomData.players[0].uid,
        updatedAt: new Date().toISOString()
      });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error starting game:", error);
    return res.status(500).json({ error: error.message });
  }
}
