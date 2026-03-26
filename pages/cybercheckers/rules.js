import { FaGamepad, FaSitemap } from 'react-icons/fa';
import { GiHexagonalNut } from 'react-icons/gi';

export default function CyberCheckersRules() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 mb-2">
          Cyber Checkers
        </h1>
        <p className="text-gray-400 text-sm mb-10 tracking-widest uppercase">Official Matrix Protocol</p>

        <section className="glass rounded-2xl p-6 mb-6 border border-white/10 shadow-[0_0_30px_rgba(217,70,239,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500" />
          <h2 className="text-lg font-bold text-fuchsia-400 mb-4 flex items-center gap-2 tracking-widest uppercase"><FaGamepad /> How to Navigate</h2>
          <ol className="text-gray-300 text-sm space-y-3 list-decimal list-outside ml-4">
            <li>Each player starts with their pieces located in their designated <strong>starting zone</strong> on opposite ends of the grid.</li>
            <li>Players take turns moving <strong>one piece per turn</strong>.</li>
            <li>Pieces can move one adjacent step in any of the 6 valid hexagonal directions into an empty space.</li>
            <li>Alternatively, pieces can <strong>jump over exactly one adjacent piece</strong> (yours or your opponent&apos;s) landing into a directly opposite empty space.</li>
            <li>Jumps can be <strong>chained consecutively</strong> in a single turn if valid jump paths continue to exist from the landing spot! A smart setup can cross the entire board in one turn.</li>
            <li>The first player to move <strong>all their pieces</strong> into their opponent&apos;s starting zone wins the match.</li>
          </ol>
        </section>

        <section className="glass rounded-2xl p-6 mb-6 border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2 tracking-widest uppercase"><FaSitemap /> Network Layouts</h2>
          
          <div className="space-y-4 text-sm">
            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <h3 className="text-white font-bold mb-1 flex items-center gap-2"><GiHexagonalNut className="text-fuchsia-500" /> Star (Default)</h3>
              <p className="text-gray-400">The traditional 121-cell Chinese Checkers star board. 10 pieces per player. Offers the widest area for flanks and long jumps.</p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <h3 className="text-white font-bold mb-1 flex items-center gap-2"><GiHexagonalNut className="text-purple-400" /> Compact Star</h3>
              <p className="text-gray-400">A miniaturized 73-cell star board for rapid engagements. 6 pieces per player. Minimal room for error.</p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <h3 className="text-white font-bold mb-1 flex items-center gap-2"><GiHexagonalNut className="text-blue-400" /> Hexagon Duel</h3>
              <p className="text-gray-400">A pure 61-cell hexagon with no protruding triangles. 11 pieces start lined up on the opposite extreme edges. Focuses heavily on the center clash.</p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <h3 className="text-white font-bold mb-1 flex items-center gap-2"><GiHexagonalNut className="text-cyan-400" /> Diamond Clash</h3>
              <p className="text-gray-400">A vertically oriented 41-cell rhombus. You start at the very tips with 9 pieces and must funnel through the wide center.</p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <h3 className="text-white font-bold mb-1 flex items-center gap-2"><GiHexagonalNut className="text-emerald-400" /> Neon Corridor</h3>
              <p className="text-gray-400">A rigid 5-cell wide vertical pathway mapping 9 pieces. Forces direct head-to-head blocks and precision jumping with zero room to flank.</p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <a href="/cybercheckers" className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold">
            ← Return to Initialization
          </a>
        </div>
      </main>
    </div>
  );
}
