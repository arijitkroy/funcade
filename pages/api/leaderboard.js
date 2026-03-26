import { getAdminDb } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminDb = getAdminDb();

  try {
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef
      .orderBy('totalPoints', 'desc')
      .limit(50)
      .get();

    const leaderboard = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Only include users who have actually earned points or were registered
      if (data.totalPoints || data.displayName) {
        leaderboard.push({
          uid: doc.id,
          displayName: data.displayName || 'Anonymous',
          photoURL: data.photoURL || null,
          totalPoints: data.totalPoints || 0,
          gamesWon: data.gamesWon || 0,
          gamesPlayed: data.gamesPlayed || 0,
        });
      }
    });

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      details: error.message 
    });
  }
}
