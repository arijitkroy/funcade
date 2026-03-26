import { getAdminDb } from '../../lib/firebaseAdmin';
import admin from 'firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, playerId, playerName } = req.body;

  if (!roomCode || !playerId) {
    return res.status(400).json({ error: 'Missing roomCode or playerId' });
  }

  const adminDb = getAdminDb();
  const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());

  try {
    const result = await adminDb.runTransaction(async (t) => {
      const doc = await t.get(roomRef);
      
      if (!doc.exists) {
        throw new Error('Room not found');
      }

      const roomData = doc.data();
      const players = roomData.players || [];

      if (roomData.gameStarted) {
        throw new Error('Game already started');
      }

      if (players.length >= (roomData.maxPlayers || 8)) {
        throw new Error('Room is full');
      }

      // Check if already in room
      const alreadyIn = players.some((p) => p.uid === playerId);
      if (alreadyIn) {
        return { success: true, alreadyJoined: true };
      }

      // Add player
      const updatedPlayers = [
        ...players,
        {
          uid: playerId,
          name: playerName || 'Player',
          ready: false,
          online: true,
        }
      ];

      t.update(roomRef, {
        players: updatedPlayers,
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error joining room via API:", error);
    return res.status(error.message === 'Room not found' ? 404 : 400).json({ 
      error: error.message || 'Failed to join room' 
    });
  }
}
