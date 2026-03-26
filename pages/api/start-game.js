import { getAdminDb } from '../../lib/firebaseAdmin';
import { initializeGame } from '../../lib/gameLogic';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, playerIds } = req.body;

  if (!roomCode || !playerIds || !playerIds.length) {
    return res.status(400).json({ error: 'Missing roomCode or playerIds' });
  }

  const adminDb = getAdminDb();
  const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
  const gameRef = adminDb.collection('games').doc(roomCode.toUpperCase());

  try {
    const gameState = initializeGame(playerIds);
    
    await adminDb.runTransaction(async (t) => {
      t.update(roomRef, { gameStarted: true });
        t.set(gameRef, {
          ...gameState,
          roomCode: roomCode.toUpperCase(),
          syncedPlayers: {},
          turnStartedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error starting game via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to start game' });
  }
}
