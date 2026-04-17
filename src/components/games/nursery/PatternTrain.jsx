import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import patterns from '../../../data/nursery/patterns.json';

const TEXT = {
  title: { en: 'Pattern Train', hi: 'पैटर्न ट्रेन' },
  intro: {
    en: (n) => `${n ? n + ', the' : 'The'} Pattern Train is here! Some carriages are missing. Can you figure out the pattern?`,
    hi: (n) => `${n ? n + ', ' : ''}पैटर्न ट्रेन आ गई! कुछ डिब्बे ख़ाली हैं। क्या तुम पैटर्न समझ सकते हो?`,
  },
  start: { en: "All Aboard!", hi: 'चढ़ो!' },
  done: { en: 'The train arrived safely!', hi: 'ट्रेन सुरक्षित पहुँच गई!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  whatNext: { en: 'What goes here?', hi: 'यहाँ क्या आएगा?' },
};

function Carriage({ icon, isMissing, isFilled, color }) {
  return (
    <div
      className={`relative flex-shrink-0 rounded-xl border-3 flex items-center justify-center transition-all`}
      style={{
        width: 64, height: 64,
        borderWidth: 3,
        borderColor: isMissing ? '#FFCB05' : '#5A8A9A',
        background: isMissing && !isFilled
          ? 'repeating-linear-gradient(45deg, #FFF8E0, #FFF8E0 6px, #FFE680 6px, #FFE680 10px)'
          : '#E8F4FD',
        boxShadow: '0 3px 0 #2A5A6A',
      }}
    >
      <span className={`text-3xl ${isMissing && !isFilled ? 'animate-pulse' : ''}`}>
        {isMissing && !isFilled ? '?' : icon}
      </span>
    </div>
  );
}

export default function PatternTrain({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0 = none, 1 = highlight repeating unit
  const advanceTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const round = patterns[roundIdx];
  const filledIcon = chosen ? round.options.find(o => o.key === chosen)?.icon : null;
  const isCorrect = chosen === round?.answer;

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setTimeout(() => speak(round.prompt_en, round.prompt_hi), 300);
    return () => clearTimeout(t);
  }, [phase, roundIdx, round, speak]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(
      `${TEXT.done.en} You got ${score} of ${patterns.length}!`,
      `${TEXT.done.hi} ${patterns.length} में से ${score}!`,
    ), 350);
    return () => clearTimeout(t);
  }, [phase, score, speak, sound]);

  const handleChoose = useCallback((key) => {
    if (chosen) return;
    sound.tap();
    setChosen(key);
    if (key === round.answer) {
      sound.success();
      // Train whistle
      sound.playTone(880, 0.18, 'triangle');
      setTimeout(() => sound.playTone(660, 0.25, 'triangle'), 150);
      setShowConfetti(true);
      setScore(s => s + 1);
      speak(
        lang === 'hi' ? 'सही! ट्रेन चलो!' : 'Correct! All aboard!',
        lang === 'hi' ? 'सही! ट्रेन चलो!' : 'Correct! All aboard!',
      );
      advanceTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        setChosen(null);
        setHintLevel(0);
        if (roundIdx + 1 < patterns.length) setRoundIdx(i => i + 1);
        else setPhase('done');
      }, 2000);
    } else {
      sound.gentle();
      const newHint = hintLevel + 1;
      setHintLevel(newHint);
      if (newHint >= 2) {
        speak(
          lang === 'hi' ? 'देखो, यह दोहराव है। पैटर्न पर ध्यान दो।' : 'Look at the repeating part. What keeps coming back?',
          lang === 'hi' ? 'देखो, यह दोहराव है। पैटर्न पर ध्यान दो।' : 'Look at the repeating part. What keeps coming back?',
        );
      } else {
        speak(
          lang === 'hi' ? 'फिर देखो ध्यान से। क्या दोहरा रहा है?' : 'Look again carefully. What keeps repeating?',
          lang === 'hi' ? 'फिर देखो ध्यान से। क्या दोहरा रहा है?' : 'Look again carefully. What keeps repeating?',
        );
      }
      // Allow retry: clear chosen
      advanceTimerRef.current = setTimeout(() => setChosen(null), 1800);
    }
  }, [chosen, round, roundIdx, sound, speak, hintLevel, lang]);

  const bg = 'bg-gradient-to-b from-[#E8F4FD] via-[#FFF8E7] to-[#FFE8C8]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\u{1F682}'}</div>
          <Guddu emotion="happy" size={170} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('playing'); }} className="mt-2 px-10 py-4 rounded-full bg-[#0077B6] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
            {TEXT.start[lang]}
          </button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'done') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <Celebration active type="confetti" />
        <Celebration active type="stars" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <div className="text-7xl animate-bounce-in">{'\u{1F682}'}{'\u{1F4A8}'}</div>
          <Guddu emotion="celebrating" size={170} animate />
          <div className="text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-gray-800">{TEXT.done[lang]}</h2>
            <p className="text-amber-700 text-base font-bold mt-1">
              {lang === 'hi' ? `${patterns.length} में से ${score}!` : `${score} of ${patterns.length} patterns solved!`}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { stop(); setRoundIdx(0); setScore(0); setChosen(null); setHintLevel(0); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Patterns are everywhere! Point them out: tiles, stripes, beats in a song. Ask 'Can you see a pattern?' This is pre-math thinking at its best."
            tipHi="पैटर्न हर जगह हैं! दिखाएँ: टाइलें, धारियाँ, गाने की लय। पूछें 'क्या तुम पैटर्न देख सकते हो?' यह सबसे अच्छा पूर्व-गणित सोच है।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={roundIdx} totalRounds={patterns.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />

      <div className="flex-1 flex flex-col px-3 py-3 gap-4">
        <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold animate-bounce-in" key={`p-${roundIdx}`}>
          {lang === 'hi' ? round.prompt_hi : round.prompt_en}
        </div>

        {/* Train track */}
        <div className="relative">
          {/* Engine */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 px-2">
            <div className="flex-shrink-0 text-5xl">{'\u{1F682}'}</div>
            {round.items.map((item, i) => {
              const isMissing = i + 1 === round.missing_index;
              return (
                <Carriage
                  key={i}
                  icon={item.icon}
                  isMissing={isMissing}
                  isFilled={isMissing && !!chosen}
                />
              );
            })}
          </div>
          {/* Track */}
          <div className="h-2 bg-gray-400 rounded-full mt-1 mx-2" />
          <div className="flex justify-around mx-3 -mt-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-gray-500 rounded" />
            ))}
          </div>
        </div>

        {/* Hint */}
        {hintLevel >= 2 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl px-3 py-2 text-center text-amber-800 text-sm font-semibold animate-bounce-in">
            {lang === 'hi' ? 'दोहराव वाला हिस्सा देखो!' : 'Look at what keeps repeating!'}
          </div>
        )}

        {/* Question prompt */}
        <p className="text-center text-sm font-semibold text-gray-600">{TEXT.whatNext[lang]}</p>

        {/* Options */}
        <div className="flex justify-center gap-3 pb-4">
          {round.options.map(opt => {
            const isThis = chosen === opt.key;
            const isAnswer = opt.key === round.answer;
            let cls = 'bg-white border-gray-300';
            if (chosen) {
              if (isAnswer && isThis) cls = 'bg-green-100 border-green-500 scale-110';
              else if (isThis) cls = 'bg-orange-50 border-orange-300';
            }
            return (
              <button
                key={opt.key}
                onClick={() => handleChoose(opt.key)}
                disabled={!!chosen}
                className={`w-20 h-20 rounded-2xl border-4 shadow-md text-4xl active:scale-95 transition-all ${cls}`}
              >
                {opt.icon}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
