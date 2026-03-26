import { getAdminDb } from '../../../lib/firebaseAdmin';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hostId, hostName, boardSize, winCondition } = req.body;

  if (!hostId || !boardSize || !winCondition) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let roomCode = generateRoomCode();
    let roomRef = adminDb.collection('rooms').doc(roomCode);
    
    // Ensure uniqueness
    let doc = await roomRef.get();
    let attempts = 0;
    while (doc.exists && attempts < 5) {
      roomCode = generateRoomCode();
      roomRef = adminDb.collection('rooms').doc(roomCode);
      doc = await roomRef.get();
      attempts++;
    }

    await roomRef.set({
      roomCode,
      hostId,
      players: [
        {
          uid: hostId,
          name: hostName || 'Player 1',
          symbol: 'X',
        },
      ],
      boardSize: parseInt(boardSize),
      winCondition: parseInt(winCondition),
      board: Array(parseInt(boardSize) * parseInt(boardSize)).fill(""),
      currentPlayer: hostId,
      status: 'lobby', // lobby, playing, finished
      winner: null,
      winningLine: null,
      scores: {
        [hostId]: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ roomCode });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ error: 'Failed to create room on server', details: error.message });
  }
}
