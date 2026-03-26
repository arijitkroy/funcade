import { getAdminDb } from '../../../lib/firebaseAdmin';

export default async function handler(req, res) {
  const adminDb = getAdminDb();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).json({ error: 'Missing roomCode' });
  }

  try {
    const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
    
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(roomRef);
      if (!doc.exists) {
        throw new Error('Room not found');
      }

      const roomData = doc.data();

      // Only transition if actually rolling
      if (roomData.status === 'rolling') {
        transaction.update(roomRef, {
          status: 'playing',
          updatedAt: new Date().toISOString()
        });
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error finishing roll:", error);
    return res.status(500).json({ error: error.message });
  }
}
