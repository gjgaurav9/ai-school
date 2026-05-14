import { useState, useEffect } from 'react';

// Guided "what did you learn?" moment. Renders a soft full-section prompt with
// optional tap-choices. Calls onReflect({ text }) or onReflect(null) on skip.
export default function ReflectionPrompt({
  questionEn,
  questionHi,
  options = [],         // [{ key, label_en, label_hi }]  — optional
  language = 'en',
  onReflect,
  showSkip = true,
  autoAdvanceMs = 0,    // if > 0, advances with null after timeout (silent reflection)
}) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!autoAdvanceMs) return undefined;
    const t = setTimeout(() => onReflect?.(null), autoAdvanceMs);
    return () => clearTimeout(t);
  }, [autoAdvanceMs, onReflect]);

  const question = language === 'hi' ? (questionHi || questionEn) : questionEn;

  const handlePick = (opt) => {
    setSelected(opt.key);
    setTimeout(() => onReflect?.({ key: opt.key, text: language === 'hi' ? opt.label_hi : opt.label_en }), 350);
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 py-6 rounded-3xl bg-gradient-to-b from-[#FFF5F0] to-[#FFE8DD] border-2 border-amber-200 shadow-md text-center">
      <div className="text-3xl mb-3">{'\u{1FAB7}'}</div>
      <p className="text-base font-bold text-amber-900 leading-snug mb-4">{question}</p>

      {options.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {options.map((opt) => {
            const chosen = selected === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handlePick(opt)}
                disabled={selected !== null}
                className={`px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all active:scale-95 ${
                  chosen
                    ? 'bg-amber-500 border-amber-600 text-white scale-105'
                    : 'bg-white border-amber-200 text-amber-900 hover:border-amber-400'
                }`}
              >
                {language === 'hi' ? opt.label_hi : opt.label_en}
              </button>
            );
          })}
        </div>
      )}

      {showSkip && (
        <button
          onClick={() => onReflect?.(null)}
          className="mt-2 text-xs font-semibold text-amber-700 underline"
        >
          {language === 'hi' ? 'अभी आगे बढ़ो' : 'Just continue'}
        </button>
      )}
    </div>
  );
}
