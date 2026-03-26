import {
  doc,
  onSnapshot,
} from 'firebase/firestore';

export async function createRoom(hostId, hostName) {
  const res = await fetch('/api/create-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, hostName }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create room');
  return data.roomCode;
}

export async function joinRoom(roomCode, playerId, playerName) {
  const res = await fetch('/api/join-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId, playerName }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to join room');
  return data;
}

export async function leaveRoom(roomCode, playerId) {
  const res = await fetch('/api/leave-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to leave room');
  return data;
}

export async function toggleReady(roomCode, playerId) {
  const res = await fetch('/api/toggle-ready', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, playerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle ready');
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
