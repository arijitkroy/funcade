import { getAdminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomCode, hostId } = req.body;

  if (!roomCode || !hostId) {
    return res.status(400).json({ error: 'Missing roomCode or hostId' });
  }

  const adminDb = getAdminDb();
  const roomRef = adminDb.collection('rooms').doc(roomCode.toUpperCase());
  const gameRef = adminDb.collection('games').doc(roomCode.toUpperCase());

  try {
    const roomSnap = await roomRef.get();
    if (!roomSnap.exists) throw new Error('Room not found');
    
    const roomData = roomSnap.data();
    if (roomData.hostId !== hostId) {
      return res.status(403).json({ error: 'Only the host can disband the room' });
    }

    const batch = adminDb.batch();
    batch.delete(roomRef);
    batch.delete(gameRef);
    await batch.commit();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error disbanding room via API:", error);
    return res.status(400).json({ error: error.message || 'Failed to disband room' });
  }
}
