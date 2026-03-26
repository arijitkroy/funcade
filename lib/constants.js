export const COLORS = {
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple',
};

export const COLOR_VALUES = Object.values(COLORS);

export const COLOR_HEX = {
  red: '#E53935',
  blue: '#1E88E5',
  green: '#43A047',
  purple: '#8E24AA',
  wild: '#333333',
};

export const COLOR_DISPLAY = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  purple: 'Purple',
};

export const CARD_TYPES = {
  NUMBER: 'number',
  SKIP: 'skip',
  REVERSE: 'reverse',
  DRAW_TWO: 'draw_two',
  DISCARD_ALL: 'discard_all',
  SKIP_EVERYONE: 'skip_everyone',
  WILD_REVERSE_DRAW_FOUR: 'wild_reverse_draw_four',
  WILD_DRAW_SIX: 'wild_draw_six',
  WILD_DRAW_TEN: 'wild_draw_ten',
  WILD_COLOR_ROULETTE: 'wild_color_roulette',
};

export const DRAW_CARD_TYPES = {
  [CARD_TYPES.DRAW_TWO]: 2,
  [CARD_TYPES.WILD_REVERSE_DRAW_FOUR]: 4,
  [CARD_TYPES.WILD_DRAW_SIX]: 6,
  [CARD_TYPES.WILD_DRAW_TEN]: 10,
};

export const CARD_SYMBOLS = {
  [CARD_TYPES.SKIP]: '⊘',
  [CARD_TYPES.REVERSE]: '⇄',
  [CARD_TYPES.DRAW_TWO]: '+2',
  [CARD_TYPES.DISCARD_ALL]: '✕All',
  [CARD_TYPES.SKIP_EVERYONE]: '⊘All',
  [CARD_TYPES.WILD_REVERSE_DRAW_FOUR]: 'W⇄+4',
  [CARD_TYPES.WILD_DRAW_SIX]: 'W+6',
  [CARD_TYPES.WILD_DRAW_TEN]: 'W+10',
  [CARD_TYPES.WILD_COLOR_ROULETTE]: 'W🎰',
};

export const CARD_POINTS = {
  [CARD_TYPES.NUMBER]: -1,
  [CARD_TYPES.SKIP]: 20,
  [CARD_TYPES.REVERSE]: 20,
  [CARD_TYPES.DRAW_TWO]: 20,
  [CARD_TYPES.DISCARD_ALL]: 20,
  [CARD_TYPES.SKIP_EVERYONE]: 20,
  [CARD_TYPES.WILD_REVERSE_DRAW_FOUR]: 50,
  [CARD_TYPES.WILD_DRAW_SIX]: 50,
  [CARD_TYPES.WILD_DRAW_TEN]: 50,
  [CARD_TYPES.WILD_COLOR_ROULETTE]: 50,
};

export function getCardImagePath(card) {
  if (!card) return null;

  const color = card.color;

  switch (card.type) {
    case CARD_TYPES.NUMBER:
      if (color && card.value != null) {
        return `/assets/${color}_${card.value}.png`;
      }
      return null;

    case CARD_TYPES.SKIP:
      return color ? `/assets/${color}_skip.png` : null;

    case CARD_TYPES.REVERSE:
      return color ? `/assets/${color}_reverse.png` : null;

    case CARD_TYPES.DRAW_TWO:
      return color ? `/assets/${color}_draw_2.png` : null;

    case CARD_TYPES.DISCARD_ALL:
      return color ? `/assets/${color}_discard_all.png` : null;

    case CARD_TYPES.SKIP_EVERYONE:
      return color ? `/assets/${color}_skip_all.png` : null;

    case CARD_TYPES.WILD_REVERSE_DRAW_FOUR:
      return `/assets/draw_4_reverse.png`;

    case CARD_TYPES.WILD_DRAW_SIX:
      return `/assets/draw_6.png`;

    case CARD_TYPES.WILD_DRAW_TEN:
      return `/assets/draw_10.png`;

    case CARD_TYPES.WILD_COLOR_ROULETTE:
      return `/assets/draw_until.png`;

    default:
      return null;
  }
}

export const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
};

export const MERCY_THRESHOLD = 25;
export const CARDS_PER_PLAYER = 7;
export const WIN_SCORE = 1000;
export const KNOCKOUT_BONUS = 250;
export const UNO_PENALTY = 2;
export const GAME_ASSETS = [
  '/assets/card_back.png',
  ...COLOR_VALUES.flatMap(color => [
    ...[0,1,2,3,4,5,6,7,8,9].map(n => `/assets/${color}_${n}.png`),
    `/assets/${color}_skip.png`,
    `/assets/${color}_reverse.png`,
    `/assets/${color}_draw_2.png`,
    `/assets/${color}_discard_all.png`,
    `/assets/${color}_skip_all.png`,
  ]),
  '/assets/draw_4_reverse.png',
  '/assets/draw_6.png',
  '/assets/draw_10.png',
  '/assets/draw_until.png',
];
