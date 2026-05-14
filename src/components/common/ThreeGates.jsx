import { useState, useEffect } from 'react';

// Reusable "Three Gates of Speech" teaching screen — True / Necessary / Kind.
// gates: [{ name_en, name_hi, explanation_en, explanation_hi }] (3 items)
// onAllOpened: called after the third gate is opened and reveals the garden.
export default function ThreeGates({ gates, language = 'en', onAllOpened }) {
  const [opened, setOpened] = useState([false, false, false]);
  const allOpen = opened.every(Boolean);

  useEffect(() => {
    if (!allOpen) return undefined;
    const t = setTimeout(() => onAllOpened?.(), 1400);
    return () => clearTimeout(t);
  }, [allOpen, onAllOpened]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-3">
      <h3 className="text-lg font-extrabold text-amber-700 text-center">
        {language === 'hi' ? 'वाणी के तीन द्वार' : 'The Three Gates of Speech'}
      </h3>
      <p className="text-xs text-gray-600 text-center max-w-[300px]">
        {language === 'hi'
          ? 'बोलने से पहले, अपने शब्दों को तीन द्वारों से गुज़रने दो।'
          : 'Before you speak, let your words pass through three gates.'}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-md mt-2">
        {gates.map((g, i) => {
          const isOpen = opened[i];
          const prevOpen = i === 0 || opened[i - 1];
          const locked = !prevOpen;
          return (
            <button
              key={i}
              disabled={locked || isOpen}
              onClick={() => setOpened(o => o.map((v, j) => j === i ? true : v))}
              className={`relative rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-95 ${
                isOpen
                  ? 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-500 shadow-md'
                  : locked
                  ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-amber-50 border-amber-300 shadow-sm animate-pulse-glow'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                  isOpen ? 'bg-amber-400' : 'bg-amber-200'
                }`}>
                  {isOpen ? '\u{1F511}' : '\u{1F6AA}'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-amber-900">
                    {language === 'hi' ? g.name_hi : g.name_en}
                  </div>
                  {isOpen && (
                    <div className="text-xs text-gray-700 mt-1 leading-snug">
                      {language === 'hi' ? g.explanation_hi : g.explanation_en}
                    </div>
                  )}
                  {!isOpen && !locked && (
                    <div className="text-[11px] text-amber-700 mt-0.5 font-semibold">
                      {language === 'hi' ? 'खोलने के लिए टैप करें' : 'Tap to open'}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {allOpen && (
        <div className="mt-3 text-center animate-bounce-in">
          <div className="text-4xl">{'\u{1F33C}\u{1F338}\u{1F33A}'}</div>
          <p className="text-sm font-bold text-amber-800 mt-1">
            {language === 'hi'
              ? 'जो शब्द तीनों द्वार पार करें — वे बोलने योग्य हैं।'
              : 'Words that pass all three gates deserve to be spoken.'}
          </p>
        </div>
      )}
    </div>
  );
}
