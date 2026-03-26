import { FaGamepad, FaSlidersH } from 'react-icons/fa';
import { FaTimes, FaHashtag, FaRegCircle } from 'react-icons/fa';

export default function TicTacToeRules() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        
        <div className="flex gap-3 mb-2">
          <FaTimes className="text-pink-500 text-3xl" />
          <FaRegCircle className="text-sky-400 text-3xl" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400 mb-2">
          Tic-Tac-Toe Advanced
        </h1>
        <p className="text-gray-400 text-sm mb-10 tracking-widest uppercase">Official Matrix Protocol</p>

        <section className="glass rounded-2xl p-6 mb-6 border border-white/10 shadow-[0_0_30px_rgba(236,72,153,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-pink-500" />
          <h2 className="text-lg font-bold text-pink-500 mb-4 flex items-center gap-2 tracking-widest uppercase"><FaGamepad /> How to Dominate</h2>
          <ol className="text-gray-300 text-sm space-y-3 list-decimal list-outside ml-4">
            <li>The game is played on a customizable square grid ranging from 3x3 up to 5x5.</li>
            <li>Players take turns placing their neon mark (<strong>X</strong> for Player 1, <strong>O</strong> for Player 2) onto an empty cell.</li>
            <li>The first player to align their marks in an unbroken line (horizontally, vertically, or diagonally) meeting the required <strong>En-Suite win condition</strong> wins the match!</li>
            <li>If the entire grid fills up without any player meeting the win criteria, the system halts in a <strong>Gridlock (Tie)</strong>.</li>
          </ol>
        </section>

        <section className="glass rounded-2xl p-6 mb-6 border border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-sky-400" />
          <h2 className="text-lg font-bold text-sky-400 mb-4 flex items-center gap-2 tracking-widest uppercase"><FaSlidersH /> Protocol Variations</h2>
          
          <div className="space-y-4 text-sm">
            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <h3 className="text-white font-bold mb-1 text-sm tracking-widest uppercase">Grid Size</h3>
              <p className="text-gray-400">Expand the digital battlefield. Choose between standard <strong>3x3</strong> classic, expanded <strong>4x4</strong> skirmish, or the massive <strong>5x5</strong> tactical grid.</p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <h3 className="text-white font-bold mb-1 text-sm tracking-widest uppercase">En-Suite Parameter</h3>
              <p className="text-gray-400">Determines exactly how many marks in a row are required to execute a win. For example, you can play on a massive 5x5 grid, but only require 4 marks in a row to win! Hardcore mode requires the En-Suite condition to perfectly match the grid size (e.g. 5 in a row on a 5x5 grid).</p>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <a href="/tictactoe" className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold">
            ← Return to Initialization
          </a>
        </div>
      </main>
    </div>
  );
}
