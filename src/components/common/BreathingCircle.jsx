import { useEffect, useState, useRef } from 'react';

/**
 * BreathingCircle — guided in/out breathing animation.
 * Circle expands while "breathing in" and contracts while "breathing out".
 * Calls onComplete after the requested number of cycles finishes.
 */
export default function BreathingCircle({
  cycles = 5,
  inSeconds = 3,
  outSeconds = 3,
  size = 220,
  active = true,
  onComplete,
  color = '#74B9FF',
  language = 'en',
}) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'in' | 'out' | 'done'
  const [cycleIdx, setCycleIdx] = useState(0);
  const timerRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      setCycleIdx(0);
      completedRef.current = false;
      return;
    }
    setPhase('in');
    setCycleIdx(0);
    completedRef.current = false;
  }, [active, cycles, inSeconds, outSeconds]);

  useEffect(() => {
    if (!active || phase === 'idle' || phase === 'done') return;

    const dur = (phase === 'in' ? inSeconds : outSeconds) * 1000;
    timerRef.current = setTimeout(() => {
      if (phase === 'in') {
        setPhase('out');
      } else {
        const next = cycleIdx + 1;
        if (next >= cycles) {
          setPhase('done');
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
        } else {
          setCycleIdx(next);
          setPhase('in');
        }
      }
    }, dur);

    return () => clearTimeout(timerRef.current);
  }, [phase, cycleIdx, cycles, inSeconds, outSeconds, active, onComplete]);

  const scale = phase === 'in' ? 1 : phase === 'out' ? 0.55 : 0.55;
  const transitionDur = phase === 'in' ? inSeconds : outSeconds;

  const label = phase === 'in'
    ? (language === 'hi' ? 'साँस अंदर...' : 'Breathe in...')
    : phase === 'out'
      ? (language === 'hi' ? 'साँस बाहर...' : 'Breathe out...')
      : phase === 'done'
        ? (language === 'hi' ? 'बहुत बढ़िया!' : 'Well done!')
        : '';

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* outer ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            border: `2px dashed ${color}66`,
          }}
        />
        {/* breathing circle */}
        <div
          className="rounded-full shadow-lg"
          style={{
            width: size * 0.82,
            height: size * 0.82,
            background: `radial-gradient(circle at 35% 30%, ${color}EE, ${color}99)`,
            transform: `scale(${scale})`,
            transition: `transform ${transitionDur}s ease-in-out`,
          }}
        />
      </div>
      <div className="text-xl font-bold text-gray-700 min-h-[28px]">
        {label}
      </div>
      {active && phase !== 'done' && (
        <div className="text-sm text-gray-500">
          {language === 'hi'
            ? `${cycleIdx + 1} / ${cycles}`
            : `Round ${cycleIdx + 1} of ${cycles}`}
        </div>
      )}
    </div>
  );
}
