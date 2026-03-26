import UnoCard from '@/components/uno/UnoCard';
import { CARD_TYPES, COLORS } from '@/lib/constants';

import { FaGamepad, FaBolt, FaFire, FaSkull, FaTrophy } from 'react-icons/fa';
import { GiCardRandom } from 'react-icons/gi';

const sections = [
  {
    title: 'Number Cards (0–9)',
    desc: 'Match by color or number. One 0 per color, two of each 1–9.',
    cards: [
      { type: CARD_TYPES.NUMBER, color: COLORS.RED, value: 7, id: 'ex1' },
      { type: CARD_TYPES.NUMBER, color: COLORS.BLUE, value: 3, id: 'ex2' },
      { type: CARD_TYPES.NUMBER, color: COLORS.GREEN, value: 0, id: 'ex3' },
      { type: CARD_TYPES.NUMBER, color: COLORS.PURPLE, value: 9, id: 'ex4' },
    ],
    rules: [
      '**0 — Pass**: All players pass their hand to the next player in the direction of play.',
      '**7 — Swap**: Choose any player to swap your entire hand with.',
    ],
  },
  {
    title: 'Skip',
    desc: 'Next player loses their turn.',
    cards: [
      { type: CARD_TYPES.SKIP, color: COLORS.RED, id: 'skip1' },
      { type: CARD_TYPES.SKIP, color: COLORS.BLUE, id: 'skip2' },
    ],
    rules: [],
  },
  {
    title: 'Reverse',
    desc: 'Reverses the direction of play. In a 2-player game, acts like Skip.',
    cards: [
      { type: CARD_TYPES.REVERSE, color: COLORS.GREEN, id: 'rev1' },
      { type: CARD_TYPES.REVERSE, color: COLORS.PURPLE, id: 'rev2' },
    ],
    rules: [],
  },
  {
    title: 'Draw Two (+2)',
    desc: 'Next player draws 2 cards and loses their turn. Can be stacked!',
    cards: [
      { type: CARD_TYPES.DRAW_TWO, color: COLORS.RED, id: 'dt1' },
      { type: CARD_TYPES.DRAW_TWO, color: COLORS.GREEN, id: 'dt2' },
    ],
    rules: ['Can be countered with an equal or higher draw card (+2, +4, +6, +10).'],
  },
  {
    title: 'Discard All',
    desc: 'Discard every card in your hand that matches this card\'s color.',
    cards: [
      { type: CARD_TYPES.DISCARD_ALL, color: COLORS.BLUE, id: 'da1' },
      { type: CARD_TYPES.DISCARD_ALL, color: COLORS.PURPLE, id: 'da2' },
    ],
    rules: [],
  },
  {
    title: 'Skip Everyone',
    desc: 'Skip all other players. You take another turn immediately.',
    cards: [
      { type: CARD_TYPES.SKIP_EVERYONE, color: COLORS.RED, id: 'se1' },
      { type: CARD_TYPES.SKIP_EVERYONE, color: COLORS.GREEN, id: 'se2' },
    ],
    rules: [],
  },
  {
    title: 'Wild Reverse Draw Four',
    desc: 'Reverse direction, then next player draws 4. Stackable.',
    cards: [{ type: CARD_TYPES.WILD_REVERSE_DRAW_FOUR, color: null, id: 'wrdf1' }],
    rules: [],
  },
  {
    title: 'Wild Draw Six (+6)',
    desc: 'Choose a color. Next player draws 6 and skips. Stackable.',
    cards: [{ type: CARD_TYPES.WILD_DRAW_SIX, color: null, id: 'wds1' }],
    rules: [],
  },
  {
    title: 'Wild Draw Ten (+10)',
    desc: 'Choose a color. Next player draws 10 and skips. Stackable.',
    cards: [{ type: CARD_TYPES.WILD_DRAW_TEN, color: null, id: 'wdt1' }],
    rules: [],
  },
  {
    title: 'Wild Color Roulette',
    desc: 'Choose a color. Cards are flipped from the draw pile until that color appears — all go to the next player.',
    cards: [{ type: CARD_TYPES.WILD_COLOR_ROULETTE, color: null, id: 'wcr1' }],
    rules: [],
  },
];

export default function Rules() {
  return (
    <div className="min-h-screen bg-[#050505]">

      <main className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
          <span className="text-uno-red">U</span>
          <span className="text-uno-purple">N</span>
          <span className="text-uno-green">O</span>
          <span className="text-gray-400 ml-2 text-2xl">No Mercy</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10">Complete rules reference</p>

        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><FaGamepad /> How to Play</h2>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>Each player starts with <strong>7 cards</strong>.</li>
            <li>Match the top card of the discard pile by <strong>color</strong>, <strong>number</strong>, or <strong>symbol</strong>.</li>
            <li>If you can&apos;t play, draw cards until you find a playable one — it&apos;s played automatically.</li>
            <li>When you have <strong>1 card left</strong>, press the <strong>UNO</strong> button. If someone catches you first, you draw 2 penalty cards.</li>
            <li>First player to empty their hand <strong>wins the round</strong>.</li>
          </ol>
        </section>

        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><FaBolt /> Special Rules</h2>

          <div className="space-y-4 text-sm">
            <div className="bg-uno-surface-light/50 rounded-xl p-4">
              <h3 className="text-uno-red font-bold mb-1 flex items-center gap-2"><FaFire /> Stacking</h3>
              <p className="text-gray-300">Draw cards (+2, +4, +6, +10) can be stacked. Counter with an equal or higher draw card. The total penalty goes to the next player who can&apos;t counter.</p>
            </div>

            <div className="bg-uno-surface-light/50 rounded-xl p-4">
              <h3 className="text-uno-gold font-bold mb-1 flex items-center gap-2"><FaSkull /> Mercy Rule</h3>
              <p className="text-gray-300">If a player ever holds <strong>25 or more cards</strong>, they are <strong>eliminated</strong> from the game. Their cards are set aside.</p>
            </div>

            <div className="bg-uno-surface-light/50 rounded-xl p-4">
              <h3 className="text-uno-green font-bold mb-1 flex items-center gap-2"><FaTrophy /> Scoring</h3>
              <p className="text-gray-300">Winner gets points from all opponents&apos; remaining hands: number cards = face value, action cards = 20 pts, wilds = 50 pts. <strong>+250</strong> per eliminated player. First to <strong>1000 points</strong> wins the match.</p>
            </div>
          </div>
        </section>

        <h2 className="text-lg font-bold text-white mb-4 mt-10 flex items-center gap-2"><GiCardRandom /> Card Reference</h2>
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex gap-2 flex-shrink-0">
                  {section.cards.map((card) => (
                    <UnoCard key={card.id} card={card} small />
                  ))}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-white font-bold text-sm mb-1">{section.title}</h3>
                  <p className="text-gray-400 text-xs mb-2">{section.desc}</p>
                  {section.rules.length > 0 && (
                    <ul className="text-gray-500 text-xs space-y-1">
                      {section.rules.map((r, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: r }} />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
