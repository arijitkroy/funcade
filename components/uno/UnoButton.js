export default function UnoButton({ onClick, visible = false }) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-36 right-4 sm:bottom-40 sm:right-8 z-40
        w-16 h-16 sm:w-20 sm:h-20 rounded-full
        uno-btn-pulse
        flex items-center justify-center
        text-white text-xs sm:text-sm font-black tracking-wider
        shadow-2xl hover:scale-110 active:scale-95
        transition-transform duration-150
        border-3 border-white/30
      "
    >
      UNO!
    </button>
  );
}
