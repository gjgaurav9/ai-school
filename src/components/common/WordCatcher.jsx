import { useState, useEffect, useRef } from 'react';

// Reusable "catch the harsh thought" mechanic.
// Renders a red harsh-word bubble that drifts from top to bottom over catchSeconds.
// onCaught(true) if tapped before the drift ends; onCaught(false) if it escapes.
export default function WordCatcher({
  harshTextEn,
  harshTextHi,
  language = 'en',
  catchSeconds = 3,
  onCaught,
  active = true,
}) {
  const [progress, setProgress] = useState(0);   // 0..1 along the path
  const [popped, setPopped] = useState(false);
  const [escaped, setEscaped] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!active || popped || escaped) return undefined;

    const tick = (t) => {
      if (startRef.current == null) startRef.current = t;
      const elapsed = (t - startRef.current) / 1000;
      const p = Math.min(1, elapsed / catchSeconds);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setEscaped(true);
        onCaught?.(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, popped, escaped, catchSeconds, onCaught]);

  const handleCatch = () => {
    if (popped || escaped) return;
    setPopped(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    onCaught?.(true);
  };

  const text = language === 'hi' ? harshTextHi : harshTextEn;

  // Path: starts near top (10% from top), drifts to ~75% (mouth-line)
  const topPct = 10 + progress * 65;
  const scale = 0.85 + progress * 0.5;

  return (
    <div className="relative w-full h-72 select-none">
      {/* Mouth line marker (visual cue) */}
      <div className="absolute left-4 right-4" style={{ top: '78%' }}>
        <div className="border-t-2 border-dashed border-red-300/60" />
        <div className="text-[10px] text-red-400 mt-0.5 text-center font-bold">
          {language === 'hi' ? 'मुँह' : 'mouth line'}
        </div>
      </div>

      {/* Harsh thought bubble */}
      {!popped && !escaped && (
        <button
          onClick={handleCatch}
          aria-label="Catch the harsh word"
          className="absolute left-1/2 -translate-x-1/2 transition-none active:scale-90 focus:outline-none"
          style={{
            top: `${topPct}%`,
            transform: `translateX(-50%) scale(${scale})`,
          }}
        >
          <div className="relative">
            <div
              className="px-5 py-3 rounded-2xl border-2 max-w-[260px] font-extrabold text-sm leading-tight text-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #FECACA, #F87171)',
                borderColor: '#B91C1C',
                color: '#7F1D1D',
                clipPath: 'polygon(0% 10%, 5% 0%, 95% 0%, 100% 10%, 100% 80%, 95% 90%, 50% 90%, 45% 100%, 40% 90%, 5% 90%, 0% 80%)',
              }}
            >
              {text}
            </div>
            {/* Tap hint */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-300 border-2 border-amber-600 flex items-center justify-center text-xs font-extrabold text-amber-900 animate-pulse-glow">
              {'☝'}
            </div>
          </div>
        </button>
      )}

      {/* Popped feedback */}
      {popped && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-bounce-in pointer-events-none">
          <div className="text-5xl">{'✨'}</div>
          <p className="text-sm font-bold text-green-700 mt-1">
            {language === 'hi' ? 'अच्छा पकड़ा!' : 'Great catch!'}
          </p>
        </div>
      )}

      {/* Escaped feedback */}
      {escaped && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-bounce-in pointer-events-none">
          <div className="text-5xl">{'\u{1F4A8}'}</div>
          <p className="text-sm font-bold text-red-600 mt-1 text-center px-4 max-w-[280px]">
            {language === 'hi'
              ? 'शब्द बाहर निकल गए। एक बार बाहर निकले शब्द वापस नहीं आते।'
              : 'The harsh words slipped out. Once spoken, words can\'t be unsaid.'}
          </p>
        </div>
      )}
    </div>
  );
}
