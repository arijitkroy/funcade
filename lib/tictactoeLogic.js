export function checkWin(board, boardSize, winCondition, symbol) {
  // board is a 1D array of length boardSize * boardSize
  
  // Check rows
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c <= boardSize - winCondition; c++) {
      let win = true;
      for (let i = 0; i < winCondition; i++) {
        if (board[r * boardSize + c + i] !== symbol) {
          win = false;
          break;
        }
      }
      if (win) {
        return Array.from({length: winCondition}, (_, idx) => r * boardSize + c + idx);
      }
    }
  }

  // Check columns
  for (let c = 0; c < boardSize; c++) {
    for (let r = 0; r <= boardSize - winCondition; r++) {
      let win = true;
      for (let i = 0; i < winCondition; i++) {
        if (board[(r + i) * boardSize + c] !== symbol) {
          win = false;
          break;
        }
      }
      if (win) {
        return Array.from({length: winCondition}, (_, idx) => (r + idx) * boardSize + c);
      }
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let r = 0; r <= boardSize - winCondition; r++) {
    for (let c = 0; c <= boardSize - winCondition; c++) {
      let win = true;
      for (let i = 0; i < winCondition; i++) {
        if (board[(r + i) * boardSize + (c + i)] !== symbol) {
          win = false;
          break;
        }
      }
      if (win) {
        return Array.from({length: winCondition}, (_, idx) => (r + idx) * boardSize + (c + idx));
      }
    }
  }

  // Check anti-diagonals (top-right to bottom-left)
  for (let r = 0; r <= boardSize - winCondition; r++) {
    for (let c = winCondition - 1; c < boardSize; c++) {
      let win = true;
      for (let i = 0; i < winCondition; i++) {
        if (board[(r + i) * boardSize + (c - i)] !== symbol) {
          win = false;
          break;
        }
      }
      if (win) {
        return Array.from({length: winCondition}, (_, idx) => (r + idx) * boardSize + (c - idx));
      }
    }
  }

  return null;
}

export function checkTie(board) {
  return board.every(cell => cell !== "");
}
