export default function GameShell({ children, onBack, title, round, totalRounds, bg = 'bg-[#FFF8E7]' }) {
  return (
    <div className={`min-h-dvh ${bg} flex flex-col`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-white/80 flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {title && (
          <span className="text-sm font-semibold text-gray-600 truncate mx-2">
            {title}
          </span>
        )}

        {round != null && totalRounds && (
          <div className="flex gap-1.5">
            {Array.from({ length: totalRounds }, (_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < round ? 'bg-[#FFCB05] scale-100' : i === round ? 'bg-[#FFCB05]/50 scale-110' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
