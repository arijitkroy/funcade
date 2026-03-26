import {
  doc,
  onSnapshot,
} from 'firebase/firestore';

export async function createRoom(hostId, hostName, boardSize, winCondition) {
  const res = await fetch('/api/tictactoe/create-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, hostName, boardSize, winCondition }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create room');
  return data.roomCode;
}

export async function joinRoom(roomCode, playerId, playerName) {
  const res = await fetch('/api/tictactoe/join-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId, playerName }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to join room');
  return data;
}

export async function makeMove(roomCode, playerId, cellIndex) {
  const res = await fetch('/api/tictactoe/make-move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId, cellIndex }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to make move');
  return data;
}

export async function playAgain(roomCode, playerId) {
  const res = await fetch('/api/tictactoe/play-again', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to request play again');
  return data;
}

export async function leaveRoom(roomCode, playerId) {
  const res = await fetch('/api/tictactoe/leave-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to leave room');
  return data;
}

export async function startGame(roomCode, hostId) {
  const res = await fetch('/api/tictactoe/start-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, hostId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to start game');
  return data;
}

export function subscribeToRoom(db, roomCode, callback) {
  const normalizedCode = roomCode?.toUpperCase();
  const roomRef = doc(db, 'rooms', normalizedCode);
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ ...snapshot.data(), roomCode });
    } else {
      callback(null);
    }
  });
}
