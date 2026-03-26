import { getAdminDb } from '../../lib/firebaseAdmin';
import { GAME_STATES } from '../../lib/constants';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  const admin = require('firebase-admin');
  const FieldValue = admin.firestore.FieldValue;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, winnerId } = req.body;

  if (!roomCode || !winnerId) {
    return res.status(400).json({ error: 'Missing roomCode or winnerId' });
  }
  try {
    const gameRef = adminDb.collection('games').doc(roomCode.toUpperCase());
    const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
    
    const result = await adminDb.runTransaction(async (t) => {
      const gameDoc = await t.get(gameRef);
      if (!gameDoc.exists) throw new Error('Game not found');
      
      const gameData = gameDoc.data();
      if (gameData.gameState !== GAME_STATES.FINISHED) throw new Error('Game is not finished yet');
      if (gameData.winner !== winnerId) throw new Error('Invalid winner ID');
      if (gameData.pointsAwarded) {
        return { message: 'Points already awarded for this game', awardedPoints: 0 };
      }

      // Get room data for player names (backup if user doc doesn't exist)
      const roomDoc = await t.get(roomRef);
      const roomData = roomDoc.exists ? roomDoc.data() : { players: [] };
      const getPlayerName = (uid) => 
        roomData.players?.find(p => p.uid === uid)?.name || 'Unknown Player';

      const awardedPoints = gameData.scores?.[winnerId] || 0;
      
      // 1. Fetch all user documents first (ALL READS MUST COME BEFORE WRITES)
      const userRefs = gameData.players.map(pid => adminDb.collection('users').doc(pid));
      const userSnaps = await t.getAll(...userRefs);
      const userDocsMap = Object.fromEntries(userSnaps.map(snap => [snap.id, snap]));

      // 2. Now perform all updates (WRITES)
      for (const playerId of gameData.players) {
        const userRef = adminDb.collection('users').doc(playerId);
        const userDoc = userDocsMap[playerId];
        
        const isWinner = playerId === winnerId;
        const updates = {
          gamesPlayed: FieldValue.increment(1),
          updatedAt: new Date().toISOString()
        };

        if (isWinner && awardedPoints > 0) {
          updates.totalPoints = FieldValue.increment(awardedPoints);
          updates.gamesWon = FieldValue.increment(1);
        }

        if (userDoc.exists) {
          t.update(userRef, updates);
        } else {
          // Create stub profile if missing (e.g. Anon players)
          t.set(userRef, {
            uid: playerId,
            displayName: getPlayerName(playerId),
            totalPoints: isWinner ? awardedPoints : 0,
            gamesWon: isWinner ? 1 : 0,
            gamesPlayed: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      // 6. Mark game as points awarded
      t.update(gameRef, {
        pointsAwarded: true,
        awardedPoints, // Store it for history
        awardedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { message: 'Points and stats updated for all players', awardedPoints };
    });
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Error awarding points via API:', error);
    return res.status(500).json({ 
      error: 'Failed to award points', 
      details: error.message || String(error)
    });
  }
}
