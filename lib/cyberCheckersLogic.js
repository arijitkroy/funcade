// game logic for Cyber Checkers
// Using Axial Coordinates (q, r) for hexagonal grid
// Directions in axial coordinates
export const HEX_DIRECTIONS = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
];

export function isBoardCell(q, r, shape = 'star') {
  const s = -q - r;
  
  if (shape === 'hexagon') {
    return Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= 4;
  }
  if (shape === 'star_small') {
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= 3) return true;
    if (r <= -4 && q >= 1 && s >= 1 && r >= -6) return true;
    if (r >= 4 && q <= -1 && s <= -1 && r <= 6) return true;
    if (q >= 4 && r <= -1 && s <= -1 && q <= 6) return true;
    if (q <= -4 && r >= 1 && s >= 1 && q >= -6) return true;
    if (s >= 4 && r >= 1 && q <= -1 && s <= 6) return true;
    if (s <= -4 && r <= -1 && q >= 1 && s >= -6) return true;
    return false;
  }
  if (shape === 'diamond') {
    return Math.abs(q + r) <= 4 && Math.abs(q - r) <= 4;
  }
  if (shape === 'corridor') {
    return Math.abs(2 * q + r) <= 4 && Math.abs(r) <= 6;
  }

  // star (default)
  if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= 4) return true;
  if (r <= -5 && q >= 1 && s >= 1 && r >= -8) return true;
  if (r >= 5 && q <= -1 && s <= -1 && r <= 8) return true;
  if (q >= 5 && r <= -1 && s <= -1 && q <= 8) return true;
  if (q <= -5 && r >= 1 && s >= 1 && q >= -8) return true;
  if (s >= 5 && r >= 1 && q <= -1 && s <= 8) return true;
  if (s <= -5 && r <= -1 && q >= 1 && s >= -8) return true;

  return false;
}

export function getInitialState(shape = 'star') {
  const board = [];
  for (let r = -8; r <= 8; r++) {
    for (let q = -8; q <= 8; q++) {
      if (isBoardCell(q, r, shape)) {
        let piece = null; 
        
        if (shape === 'star') {
          if (r <= -5) piece = 1;
          if (r >= 5) piece = 2;
        } else if (shape === 'star_small') {
          if (r <= -4) piece = 1;
          if (r >= 4) piece = 2;
        } else if (shape === 'hexagon') {
          if (r <= -3) piece = 1;
          if (r >= 3) piece = 2;
        } else if (shape === 'diamond') {
          if (r <= -2) piece = 1;
          if (r >= 2) piece = 2;
        } else if (shape === 'corridor') {
          if (r <= -5) piece = 1;
          if (r >= 5) piece = 2;
        }
        
        board.push({ id: `${q},${r}`, q, r, piece });
      }
    }
  }
  return board;
}

export function getValidMoves(boardData, startQ, startR, shape = 'star') {
  const findCell = (q, r) => boardData.find(c => c.q === q && c.r === r);
  const startCell = findCell(startQ, startR);
  
  if (!startCell || startCell.piece === null) return [];

  const validMoves = [];
  const visitedJumps = new Set([`${startQ},${startR}`]);

  // 1. Single Steps
  for (let dir of HEX_DIRECTIONS) {
    const targetQ = startQ + dir.q;
    const targetR = startR + dir.r;
    if (isBoardCell(targetQ, targetR, shape)) {
      const targetCell = findCell(targetQ, targetR);
      if (targetCell && targetCell.piece === null) {
        validMoves.push({ q: targetQ, r: targetR, isJump: false });
      }
    }
  }

  // 2. Jumps (Recursive DFS or BFS)
  const jumpsQueue = [{ q: startQ, r: startR }];

  while (jumpsQueue.length > 0) {
    const curr = jumpsQueue.shift();
    
    for (let dir of HEX_DIRECTIONS) {
      const overQ = curr.q + dir.q;
      const overR = curr.r + dir.r;
      const landQ = curr.q + (dir.q * 2);
      const landR = curr.r + (dir.r * 2);

      if (isBoardCell(landQ, landR, shape)) {
        const overCell = findCell(overQ, overR);
        const landCell = findCell(landQ, landR);

        // Can jump if overCell has a piece and landCell is empty
        if (overCell && overCell.piece !== null && landCell && landCell.piece === null) {
          const jumpId = `${landQ},${landR}`;
          if (!visitedJumps.has(jumpId)) {
            visitedJumps.add(jumpId);
            validMoves.push({ q: landQ, r: landR, isJump: true });
            jumpsQueue.push({ q: landQ, r: landR });
          }
        }
      }
    }
  }

  return validMoves;
}

export function checkWinPattern(boardData, shape = 'star') {
  let p1Pieces = 0, p1InGoal = 0;
  let p2Pieces = 0, p2InGoal = 0;

  for (let cell of boardData) {
    if (cell.piece === 1) {
      p1Pieces++;
      if (shape === 'star' && cell.r >= 5) p1InGoal++;
      else if (shape === 'star_small' && cell.r >= 4) p1InGoal++;
      else if (shape === 'hexagon' && cell.r >= 3) p1InGoal++;
      else if (shape === 'diamond' && cell.r >= 2) p1InGoal++;
      else if (shape === 'corridor' && cell.r >= 5) p1InGoal++;
    } else if (cell.piece === 2) {
      p2Pieces++;
      if (shape === 'star' && cell.r <= -5) p2InGoal++;
      else if (shape === 'star_small' && cell.r <= -4) p2InGoal++;
      else if (shape === 'hexagon' && cell.r <= -3) p2InGoal++;
      else if (shape === 'diamond' && cell.r <= -2) p2InGoal++;
      else if (shape === 'corridor' && cell.r <= -5) p2InGoal++;
    }
  }

  if (p1Pieces > 0 && p1Pieces === p1InGoal) return 1;
  if (p2Pieces > 0 && p2Pieces === p2InGoal) return 2;

  return null;
}
