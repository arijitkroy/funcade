import { COLOR_VALUES, CARD_TYPES } from './constants';

let cardIdCounter = 0;

function createCard(type, color, value = null) {
  return {
    id: `c_${Math.random().toString(36).substr(2, 9)}`,
    type,
    color,
    value,
  };
}

export function generateDeck() {
  cardIdCounter = 0;
  const deck = [];

  for (const color of COLOR_VALUES) {
    deck.push(createCard(CARD_TYPES.NUMBER, color, 0));

    for (let n = 1; n <= 9; n++) {
      deck.push(createCard(CARD_TYPES.NUMBER, color, n));
      deck.push(createCard(CARD_TYPES.NUMBER, color, n));
    }

    for (let i = 0; i < 3; i++) {
      deck.push(createCard(CARD_TYPES.SKIP, color));
      deck.push(createCard(CARD_TYPES.REVERSE, color));
    }

    for (let i = 0; i < 3; i++) {
      deck.push(createCard(CARD_TYPES.DRAW_TWO, color));
    }

    deck.push(createCard(CARD_TYPES.DISCARD_ALL, color));

    deck.push(createCard(CARD_TYPES.SKIP_EVERYONE, color));
  }

  for (const color of COLOR_VALUES) {
    deck.push(createCard(CARD_TYPES.REVERSE, color));
    deck.push(createCard(CARD_TYPES.REVERSE, color));
    deck.push(createCard(CARD_TYPES.DRAW_TWO, color));
    deck.push(createCard(CARD_TYPES.DRAW_TWO, color));
    deck.push(createCard(CARD_TYPES.DISCARD_ALL, color));
    deck.push(createCard(CARD_TYPES.SKIP_EVERYONE, color));
    deck.push(createCard(CARD_TYPES.SKIP_EVERYONE, color));
  }

  for (let i = 0; i < 3; i++) {
    deck.push(createCard(CARD_TYPES.WILD_DRAW_TEN, null));
  }
  for (let i = 0; i < 4; i++) {
    deck.push(createCard(CARD_TYPES.WILD_DRAW_SIX, null));
  }
  for (let i = 0; i < 8; i++) {
    deck.push(createCard(CARD_TYPES.WILD_REVERSE_DRAW_FOUR, null));
    deck.push(createCard(CARD_TYPES.WILD_COLOR_ROULETTE, null));
  }

  return deck;
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isSafeStartingCard(card) {
  return card.type === CARD_TYPES.NUMBER;
}
