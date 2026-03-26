import {
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

export async function startGame(roomCode, playerIds) {
  const res = await fetch('/api/start-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerIds }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to start game');
  return data;
}

export async function playCard(roomCode, playerId, cardId, chosenColor = null, swapTargetId = null) {
  const res = await fetch('/api/play-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId, cardId, chosenColor, swapTargetId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to play card');
  return data;
}

export async function drawCardAction(roomCode, playerId) {
  const res = await fetch('/api/draw-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to draw card');
  return data;
}

export async function autoPlayDrawnCard(roomCode, playerId, cardId, chosenColor = null) {
  return playCard(roomCode, playerId, cardId, chosenColor);
}

export async function callUnoAction(roomCode, playerId) {
  const res = await fetch('/api/call-uno', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to call UNO');
  return data;
}

export async function challengeUnoAction(roomCode, challengerId, targetId) {
  const res = await fetch('/api/challenge-uno', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, challengerId, targetId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to challenge UNO');
  return data.success;
}

export function subscribeToGame(db, roomCode, callback, onError) {
  const normalizedCode = roomCode?.toUpperCase();
  if (!normalizedCode) return () => {};
  const gameRef = doc(db, 'games', normalizedCode);
  return onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  }, (err) => {
    console.error(`Subscription error for game ${normalizedCode}:`, err);
    if (onError) onError(err);
  });
}

export async function getGameState(db, roomCode) {
  const normalizedCode = roomCode?.toUpperCase();
  const gameRef = doc(db, 'games', normalizedCode);
  const snap = await getDoc(gameRef);
  return snap.exists() ? snap.data() : null;
}

export async function awardGamePoints(roomCode, winnerId) {
  try {
    const res = await fetch('/api/award-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, winnerId }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.details || data.error || 'Failed to award points');
    }
    
    return data;
  } catch (err) {
    console.error('Error awarding points:', err);
    throw err;
  }
}

export async function syncHandshake(roomCode, playerId) {
    try {
      const res = await fetch('/api/sync-handshake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId }),
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Handshake failed:', err);
      return false;
    }
}

export async function exitGame(roomCode, playerId) {
  const res = await fetch('/api/exit-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to exit game');
  return data;
}

export async function disbandRoom(roomCode, hostId) {
  const res = await fetch('/api/disband-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, hostId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to disband room');
  return data;
}

export async function keepCardAction(roomCode, playerId) {
  const res = await fetch('/api/keep-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to keep card');
  return data;
}

export async function skipTurnAction(roomCode, requesterId) {
  const res = await fetch('/api/skip-turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, requesterId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to skip turn');
  return data;
}

