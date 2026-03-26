import { doc, onSnapshot } from 'firebase/firestore';

export async function createRoom(hostId, hostName, boardShape = 'star') {
  const res = await fetch('/api/cybercheckers/create-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, hostName, boardShape }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create room');
  return data.roomCode;
}

export async function joinRoom(roomCode, playerId, playerName) {
  const res = await fetch('/api/cybercheckers/join-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId, playerName }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to join room');
  return data;
}

export async function startGame(roomCode, hostId) {
  const res = await fetch('/api/cybercheckers/start-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, hostId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to start game');
  return data;
}

export async function makeMove(roomCode, playerId, fromPos, toPos) {
  const res = await fetch('/api/cybercheckers/make-move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId, fromPos, toPos }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to make move');
  return data;
}

export async function leaveRoom(roomCode, playerId) {
  const res = await fetch('/api/cybercheckers/leave-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to leave room');
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
