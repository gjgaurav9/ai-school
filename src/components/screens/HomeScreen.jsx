import Guddu from '../common/Guddu';

const GAMES = [
  { id: 'mood-mirror', name: 'Mood Mirror', subtitle: 'Feelings Game', icon: '\u{1FA9E}', color: '#FFD93D' },
  { id: 'color-feelings', name: 'Color Feelings', subtitle: 'Paint Your Mood', icon: '\u{1F3A8}', color: '#A855F7' },
  { id: 'guddus-day', name: "Guddu's Day", subtitle: 'Daily Routine', icon: '\u{1F305}', color: '#FF8C42' },
  { id: 'animal-friends', name: 'Animal Friends', subtitle: 'Sharing Garden', icon: '\u{1F33B}', color: '#2DC653' },
  { id: 'sound-safari', name: 'Sound Safari', subtitle: 'Listen & Find', icon: '\u{1F3B5}', color: '#0077B6' },
  { id: 'shape-world', name: 'Shape World', subtitle: 'Build With Shapes', icon: '\u{1F537}', color: '#E91E8C' },
  { id: 'kindness-seeds', name: 'Kindness Seeds', subtitle: 'Grow Kindness', icon: '\u{1F331}', color: '#22C55E' },
];

function darken(hex, amount = 0.25) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function HomeScreen({ onSelectGame, language, onToggleLanguage, stars = 0, childName = '' }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF8E7' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Guddu emotion="happy" size={80} animate={false} />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 leading-tight">AI School</h1>
            <p className="text-xs text-gray-500">
              {childName ? (language === 'hi' ? `नमस्ते, ${childName}!` : `Hi, ${childName}!`) : 'Learn, Play & Grow!'}
            </p>
          </div>
        </div>
        <button
          onClick={onToggleLanguage}
          className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white shadow-md border border-gray-200 active:scale-95 transition-transform"
        >
          {language === 'en' ? (
            <span>EN | <span className="text-gray-400">{'\u0939\u093F'}</span></span>
          ) : (
            <span><span className="text-gray-400">EN</span> | {'\u0939\u093F'}</span>
          )}
        </button>
      </div>

      {/* Game Grid - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="rounded-2xl shadow-lg active:scale-95 transition-transform duration-150 text-left"
              style={{
                background: `linear-gradient(135deg, ${game.color}, ${darken(game.color, 0.15)})`,
                height: '160px',
              }}
            >
              <div className="flex flex-col items-center justify-center h-full px-2">
                <span className="text-5xl mb-2">{game.icon}</span>
                <span className="text-sm font-bold text-white drop-shadow-sm text-center leading-tight">
                  {game.name}
                </span>
                <span className="text-[10px] text-white/80 mt-0.5 text-center">
                  {game.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stars Counter */}
      <div className="flex justify-center py-3">
        <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-4 py-1.5 shadow-md border border-yellow-200">
          <span className="text-lg">{'\u2B50'}</span>
          <span className="text-sm font-bold text-gray-700">{stars} stars earned</span>
        </div>
      </div>
    </div>
  );
}
