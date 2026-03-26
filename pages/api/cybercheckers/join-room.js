import { getAdminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { roomCode, playerId, playerName } = req.body;
  if (!roomCode || !playerId || !playerName) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
    
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(roomRef);
      if (!doc.exists) throw new Error('Room not found');

      const roomData = doc.data();

      if (roomData.gameType !== 'cybercheckers') {
        throw new Error('This room is not a Cyber Checkers game');
      }

      if (roomData.players.length >= 2) {
        // If player is already in room, just let them in (reconnect)
        if (!roomData.players.some(p => p.uid === playerId)) {
          throw new Error('Room is full');
        }
      } else {
        // Join as Player 2
        if (!roomData.players.some(p => p.uid === playerId)) {
          const newPlayers = [...roomData.players, {
            uid: playerId,
            name: playerName,
            piece: 2 // Player 2
          }];
          transaction.update(roomRef, {
            players: newPlayers,
            updatedAt: new Date().toISOString()
          });
        }
      }
    });

    return res.status(200).json({ success: true, roomCode });
  } catch (error) {
    console.error("Error joining room:", error);
    return res.status(500).json({ error: error.message });
  }
}
