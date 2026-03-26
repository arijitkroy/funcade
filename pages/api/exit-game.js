import { getAdminDb } from '../../lib/firebaseAdmin';
import { GAME_STATES } from '../../lib/constants';
import { calculateRoundScore } from '../../lib/gameLogic';

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
  const gameRef = adminDb.collection('games').doc(roomCode.toUpperCase());

  try {
    await adminDb.runTransaction(async (t) => {
      const gameSnap = await t.get(gameRef);
      const roomSnap = await t.get(roomRef);

      if (!gameSnap.exists || !roomSnap.exists) return;

      const gameState = gameSnap.data();
      const roomData = roomSnap.data();

      // Remove from active players
      const newActivePlayers = (gameState.activePlayers || []).filter(id => id !== playerId);
      const newPlayers = (gameState.players || []).filter(id => id !== playerId);

      const updates = {
        activePlayers: newActivePlayers,
        players: newPlayers,
        turnNumber: (gameState.turnNumber || 0) + 1,
        updatedAt: new Date().toISOString()
      };

      // If only one player remains, they win by default
      // Calculate score BEFORE clearing the exiting player's hand so their cards count
      if (newActivePlayers.length === 1 && gameState.gameState === GAME_STATES.PLAYING) {
        const winnerId = newActivePlayers[0];
        updates.winner = winnerId;
        updates.gameState = GAME_STATES.FINISHED;
        
        const roundScore = calculateRoundScore(gameState, winnerId);
        updates.scores = { ...gameState.scores };
        updates.scores[winnerId] = (updates.scores[winnerId] || 0) + roundScore;
      } else if (newActivePlayers.length === 0) {
        updates.gameState = GAME_STATES.FINISHED;
      }

      // Now clear the exiting player's hand (after score calculation)
      const newPlayersHands = { ...gameState.playersHands };
      delete newPlayersHands[playerId];
      updates.playersHands = newPlayersHands;

      // If it was this player's turn, advance it
      if (gameState.activePlayers[gameState.currentPlayerIndex] === playerId && newActivePlayers.length > 0) {
        updates.currentPlayerIndex = gameState.currentPlayerIndex % newActivePlayers.length;
      }

      t.update(gameRef, updates);

      // Also update the room record
      const newRoomPlayers = (roomData.players || []).filter(p => p.uid !== playerId);
      const roomUpdates = { players: newRoomPlayers };
      
      if (roomData.hostId === playerId && newRoomPlayers.length > 0) {
        roomUpdates.hostId = newRoomPlayers[0].uid;
      }

      if (newRoomPlayers.length === 0) {
        t.delete(roomRef);
        t.delete(gameRef);
      } else {
        t.update(roomRef, roomUpdates);
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error exiting game via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to exit game' });
  }
}
