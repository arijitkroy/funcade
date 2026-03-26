import { COLORS, COLOR_HEX } from '@/lib/constants';

const colorEntries = [
  { key: COLORS.RED, hex: COLOR_HEX.red, label: 'Red' },
  { key: COLORS.BLUE, hex: COLOR_HEX.blue, label: 'Blue' },
  { key: COLORS.GREEN, hex: COLOR_HEX.green, label: 'Green' },
  { key: COLORS.PURPLE, hex: COLOR_HEX.purple, label: 'Purple' },
];

export default function ColorPicker({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 animate-slide-up">
        <h3 className="text-white text-lg font-bold text-center mb-6">Choose a Color</h3>

        <div className="grid grid-cols-2 gap-4">
          {colorEntries.map(({ key, hex, label }) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="group relative h-20 rounded-xl border-3 border-white/20 hover:border-white/50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: hex }}
            >
              <span className="text-white text-sm font-bold drop-shadow-lg">{label}</span>
              <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors" />
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
