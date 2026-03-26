import {
  CARD_TYPES,
  DRAW_CARD_TYPES,
  CARD_POINTS,
  MERCY_THRESHOLD,
  CARDS_PER_PLAYER,
  KNOCKOUT_BONUS,
  UNO_PENALTY,
  GAME_STATES,
} from './constants';
import { generateDeck, shuffleDeck, isSafeStartingCard } from './deck';

export function initializeGame(playerIds) {
  let deck = shuffleDeck(generateDeck());

  const playersHands = {};
  for (const pid of playerIds) {
    playersHands[pid] = deck.splice(0, CARDS_PER_PLAYER);
  }

  let topCard = deck.shift();
  while (!isSafeStartingCard(topCard)) {
    deck.push(topCard);
    topCard = deck.shift();
  }

  return {
    drawPile: deck,
    discardPile: [topCard],
    currentPlayerIndex: 0,
    direction: 1,
    players: playerIds,
    playersHands,
    activePlayers: [...playerIds],
    eliminatedPlayers: [],
    pendingDraw: 0,
    pendingDrawType: null,
    gameState: GAME_STATES.PLAYING,
    winner: null,
    calledUno: {},
    scores: Object.fromEntries(playerIds.map((p) => [p, 0])),
    lastAction: null,
    turnNumber: 0,
    turnStartedAt: new Date().toISOString(),
    roundDeadPoints: 0,
  };
}

function isWild(card) {
  return card.color === null || card.type.startsWith('wild');
}

function isDrawCard(card) {
  return DRAW_CARD_TYPES[card.type] !== undefined;
}

function getDrawAmount(card) {
  return DRAW_CARD_TYPES[card.type] || 0;
}

export function canPlayCard(card, topDiscard, activeColor, pendingDraw, pendingDrawType) {
  const effectiveColor = activeColor || topDiscard.color;

  if (pendingDraw > 0) {
    if (!isDrawCard(card)) return false;
    const cardDraw = getDrawAmount(card);
    const pendDraw = DRAW_CARD_TYPES[pendingDrawType] || 0;
    return cardDraw >= pendDraw;
  }

  if (isWild(card)) return true;

  if (card.color === effectiveColor) return true;

  if (
    card.type === CARD_TYPES.NUMBER &&
    topDiscard.type === CARD_TYPES.NUMBER &&
    card.value === topDiscard.value
  ) {
    return true;
  }

  if (card.type !== CARD_TYPES.NUMBER && card.type === topDiscard.type) return true;

  return false;
}

export function getPlayableCards(hand, topDiscard, activeColor, pendingDraw, pendingDrawType) {
  return hand.filter((c) => canPlayCard(c, topDiscard, activeColor, pendingDraw, pendingDrawType));
}

function getActivePlayerIndex(gameState) {
  return gameState.currentPlayerIndex;
}

function advanceToNextPlayer(gameState, skipCount = 1) {
  const active = gameState.activePlayers;
  let idx = active.indexOf(gameState.activePlayers[gameState.currentPlayerIndex]);
  for (let i = 0; i < skipCount; i++) {
    idx = (idx + gameState.direction + active.length) % active.length;
  }
  return idx;
}

export function getNextPlayerIndex(activePlayers, currentIdx, direction) {
  return (currentIdx + direction + activePlayers.length) % activePlayers.length;
}

function ensureDrawPile(state) {
  if (state.drawPile.length === 0) {
    const topCard = state.discardPile[state.discardPile.length - 1];
    const toShuffle = state.discardPile.slice(0, -1);
    state.drawPile = shuffleDeck(toShuffle);
    state.discardPile = [topCard];
  }
}

function drawCards(state, playerId, count) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    ensureDrawPile(state);
    if (state.drawPile.length === 0) break; // truly empty
    drawn.push(state.drawPile.shift());
  }
  state.playersHands[playerId] = [...(state.playersHands[playerId] || []), ...drawn];
  return drawn;
}

function checkAndApplyMercy(state) {
  const newlyEliminated = [];
  for (const pid of [...state.activePlayers]) {
    const hand = state.playersHands[pid] || [];
    if (hand.length >= MERCY_THRESHOLD) {
      let handValue = 0;
      for (const card of hand) {
        const pointBase = CARD_POINTS[card.type] || 0;
        handValue += pointBase === -1 ? (card.value || 0) : pointBase;
      }
      state.roundDeadPoints = (state.roundDeadPoints || 0) + handValue;

      state.activePlayers = state.activePlayers.filter((p) => p !== pid);
      state.eliminatedPlayers.push(pid);
      state.playersHands[pid] = [];
      newlyEliminated.push(pid);
    }
  }

  if (state.activePlayers.length > 0) {
    state.currentPlayerIndex = state.currentPlayerIndex % state.activePlayers.length;
  }

  return newlyEliminated;
}

export function checkWinCondition(state) {
  for (const pid of state.activePlayers) {
    if (state.playersHands[pid]?.length === 0) {
      return pid;
    }
  }
  if (state.activePlayers.length === 1) {
    return state.activePlayers[0];
  }
  return null;
}

function finishGame(state, winnerId) {
  if (state.gameState === GAME_STATES.FINISHED) return state;

  state.winner = winnerId;
  state.gameState = GAME_STATES.FINISHED;
  
  const roundScore = calculateRoundScore(state, winnerId);
  state.scores[winnerId] = (state.scores[winnerId] || 0) + roundScore;
  
  return state;
}

export function calculateRoundScore(state, winnerId) {
  let total = state.roundDeadPoints || 0;

  for (const pid of state.players) {
    if (pid === winnerId) continue;
    const hand = state.playersHands[pid] || [];
    for (const card of hand) {
      const pointBase = CARD_POINTS[card.type] || 0;
      total += pointBase === -1 ? (card.value || 0) : pointBase;
    }
  }

  total += (state.eliminatedPlayers?.length || 0) * KNOCKOUT_BONUS;

  return total;
}

export function applyCardEffect(state, playerId, card, chosenColor = null, swapTargetId = null) {
  state.playersHands[playerId] = state.playersHands[playerId].filter((c) => c.id !== card.id);
  state.discardPile.push(card);

  state.activeColor = chosenColor || card.color;

  const currentIdx = state.activePlayers.indexOf(playerId);
  let skipNext = 0;
  let extraTurn = false;

  state.lastAction = { type: card.type, playerId, card };

  switch (card.type) {
    case CARD_TYPES.NUMBER:
      if (card.value === 7 && swapTargetId && state.activePlayers.includes(swapTargetId)) {
        const temp = state.playersHands[playerId];
        state.playersHands[playerId] = state.playersHands[swapTargetId];
        state.playersHands[swapTargetId] = temp;
        state.lastAction.swapTarget = swapTargetId;
      }
      if (card.value === 0) {
        const active = state.activePlayers;
        const handsBackup = {};
        for (const p of active) {
          handsBackup[p] = state.playersHands[p];
        }
        for (let i = 0; i < active.length; i++) {
          const nextIdx = (i + state.direction + active.length) % active.length;
          state.playersHands[active[nextIdx]] = handsBackup[active[i]];
        }
        state.lastAction.passAll = true;
      }
      break;

    case CARD_TYPES.SKIP:
      skipNext = 1;
      break;

    case CARD_TYPES.REVERSE:
      state.direction *= -1;
      break;

    case CARD_TYPES.DRAW_TWO:
      state.pendingDraw += 2;
      state.pendingDrawType = card.type;
      skipNext = 0;
      break;

    case CARD_TYPES.DISCARD_ALL: {
      const discardColor = card.color;
      const toDiscard = state.playersHands[playerId].filter((c) => c.color === discardColor);
      state.playersHands[playerId] = state.playersHands[playerId].filter(
        (c) => c.color !== discardColor
      );
      state.discardPile.pop();
      state.discardPile.push(...toDiscard);
      state.discardPile.push(card);
      state.lastAction.discardedCount = toDiscard.length;
      break;
    }

    case CARD_TYPES.SKIP_EVERYONE:
      extraTurn = true;
      break;

    case CARD_TYPES.WILD_REVERSE_DRAW_FOUR:
      state.direction *= -1;
      state.pendingDraw += 4;
      state.pendingDrawType = card.type;
      break;

    case CARD_TYPES.WILD_DRAW_SIX:
      state.pendingDraw += 6;
      state.pendingDrawType = card.type;
      break;

    case CARD_TYPES.WILD_DRAW_TEN:
      state.pendingDraw += 10;
      state.pendingDrawType = card.type;
      break;

    case CARD_TYPES.WILD_COLOR_ROULETTE: {
      const nextIdx = getNextPlayerIndex(
        state.activePlayers,
        currentIdx,
        state.direction
      );
      const targetPlayer = state.activePlayers[nextIdx];
      const revealed = [];
      let found = false;

      while (!found) {
        ensureDrawPile(state);
        if (state.drawPile.length === 0) break;
        const revealedCard = state.drawPile.shift();
        revealed.push(revealedCard);
        if (revealedCard.color === chosenColor) {
          found = true;
        }
      }

      state.playersHands[targetPlayer] = [
        ...(state.playersHands[targetPlayer] || []),
        ...revealed,
      ];
      state.lastAction.rouletteRevealed = revealed.length;
      state.lastAction.rouletteTarget = targetPlayer;
      skipNext = 1;
      break;
    }

    default:
      break;
  }

  const winner = checkWinCondition(state);
  if (winner) {
    return finishGame(state, winner);
  }

  checkAndApplyMercy(state);

  if (extraTurn) {
  } else {
    let nextIdx = getNextPlayerIndex(
      state.activePlayers,
      state.activePlayers.indexOf(playerId),
      state.direction
    );

    for (let i = 0; i < skipNext; i++) {
      nextIdx = getNextPlayerIndex(state.activePlayers, nextIdx, state.direction);
    }

    state.currentPlayerIndex = nextIdx;
  }

  state.turnNumber++;
  state.turnStartedAt = new Date().toISOString();

  const winnerAfterEffects = checkWinCondition(state);
  if (winnerAfterEffects) {
    return finishGame(state, winnerAfterEffects);
  }

  return state;
}

export function handleDraw(state, playerId) {
  let drawnCards = [];

  if (state.calledUno?.[playerId]) {
    state.calledUno[playerId] = false;
  }

  if (state.pendingDraw > 0) {
    drawnCards = drawCards(state, playerId, state.pendingDraw);
    state.pendingDraw = 0;
    state.pendingDrawType = null;

    const eliminated = checkAndApplyMercy(state);

    state.lastAction = { type: 'DRAW', playerId, drawnCount: drawnCards.length };

    if (state.activePlayers.length > 0) {
      state.currentPlayerIndex = state.currentPlayerIndex % state.activePlayers.length;
      
      if (!eliminated.includes(playerId)) {
        state.currentPlayerIndex = getNextPlayerIndex(
          state.activePlayers,
          state.activePlayers.indexOf(playerId),
          state.direction
        );
      }
    }

    const winner = checkWinCondition(state);
    if (winner) {
      return { state: finishGame(state, winner), drawnCards, autoPlayCard: null };
    }
    state.turnNumber++;
    state.turnStartedAt = new Date().toISOString();

    return { state, drawnCards, autoPlayCard: null };
  }

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  ensureDrawPile(state);
  
  if (state.drawPile.length === 0) {
    return { state, drawnCards: [], autoPlayCard: null };
  }

  const drawn = state.drawPile.shift();
  state.playersHands[playerId].push(drawn);
  drawnCards.push(drawn);

  const isPlayable = canPlayCard(drawn, topDiscard, state.activeColor, 0, null);

  const eliminated = checkAndApplyMercy(state);
  
  if (eliminated.includes(playerId)) {
    if (state.activePlayers.length > 0) {
      state.currentPlayerIndex = state.currentPlayerIndex % state.activePlayers.length;
    }
    const winner = checkWinCondition(state);
    if (winner) {
      return { state: finishGame(state, winner), drawnCards, autoPlayCard: null };
    }
    state.turnNumber++;
    state.turnStartedAt = new Date().toISOString();
    return { state, drawnCards, autoPlayCard: null };
  }

  if (isPlayable) {
    return { state, drawnCards, autoPlayCard: drawn };
  }

  state.currentPlayerIndex = getNextPlayerIndex(
    state.activePlayers,
    state.activePlayers.indexOf(playerId),
    state.direction
  );
  state.turnNumber++;
  state.turnStartedAt = new Date().toISOString();

  return { state, drawnCards, autoPlayCard: null };
}

export function callUno(state, playerId) {
  state.calledUno[playerId] = true;
  return state;
}

export function challengeUno(state, targetId) {
  const hand = state.playersHands[targetId];
  if (hand && hand.length === 1 && !state.calledUno[targetId]) {
    drawCards(state, targetId, UNO_PENALTY);
    state.calledUno[targetId] = false;
    checkAndApplyMercy(state);
    return { state, success: true };
  }
  return { state, success: false };
}

export function getCurrentPlayerId(state) {
  return state.activePlayers[state.currentPlayerIndex];
}

export function validateMove(state, playerId, card) {
  if (getCurrentPlayerId(state) !== playerId) {
    return { valid: false, reason: 'Not your turn' };
  }
  if (state.gameState !== GAME_STATES.PLAYING) {
    return { valid: false, reason: 'Game is not active' };
  }
  if (!state.playersHands[playerId]?.find((c) => c.id === card.id)) {
    return { valid: false, reason: 'Card not in hand' };
  }
  const topDiscard = state.discardPile[state.discardPile.length - 1];
  if (!canPlayCard(card, topDiscard, state.activeColor, state.pendingDraw, state.pendingDrawType)) {
    return { valid: false, reason: 'Card cannot be played' };
  }
  return { valid: true };
}