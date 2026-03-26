import { getAdminDb } from '../../../lib/firebaseAdmin';
import { getInitialState } from '../../../lib/cyberCheckersLogic';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { hostId, hostName, boardShape } = req.body;
  if (!hostId || !hostName) return res.status(400).json({ error: 'Missing host details' });

  try {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomRef = adminDb.collection('rooms').doc(roomCode);

    const initialBoard = getInitialState(boardShape || 'star');

    await roomRef.set({
      gameType: 'cybercheckers',
      boardShape: boardShape || 'star',
      status: 'waiting', // waiting, playing, finished
      hostId,
      players: [{
        uid: hostId,
        name: hostName,
        piece: 1 // Player 1
      }],
      board: initialBoard,
      currentPlayer: null,
      winner: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ roomCode, success: true });
  } catch (error) {
    console.error("Error creating Cyber Checkers room:", error);
    return res.status(500).json({ error: error.message });
  }
}
