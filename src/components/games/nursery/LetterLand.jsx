import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import letters from '../../../data/nursery/letters.json';

const LETTERS_PER_SESSION = 6;

const TEXT = {
  title: { en: 'Letter Land', hi: 'अक्षर लोक' },
  intro: {
    en: (n) => `${n ? n + ', w' : 'W'}elcome to Letter Land! Every letter has a special sound. Let's discover them!`,
    hi: (n) => `${n ? n + ', ' : ''}अक्षर लोक में स्वागत है! हर अक्षर की एक खास ध्वनि होती है। चलो जानें!`,
  },
  start: { en: "Let's Learn!", hi: 'सीखें!' },
  startsWith: {
    en: (l) => `Which one starts with the letter ${l}?`,
    hi: (l) => `कौनसा अक्षर ${l} से शुरू होता है?`,
  },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  done: { en: 'You learned 6 letters!', hi: 'तुमने 6 अक्षर सीखे!' },
  collection: { en: 'Tap a letter to hear it again', hi: 'फिर सुनने के लिए अक्षर पर टैप करो' },
};

function shuffleSlice(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export default function LetterLand({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');   // intro | playing | feedback | done
  const [roundIdx, setRoundIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const { speak, speakSequence, stop } = useVoice(lang);
  const sound = useSound();

  // Pick a random subset of letters for this session
  const sessionLetters = useMemo(() => shuffleSlice(letters, LETTERS_PER_SESSION), []);
  const round = sessionLetters[roundIdx];

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'playing' || !round) return;
    const t = setTimeout(() => {
      speakSequence([
        { en: `This is the letter ${round.letter}.`, hi: `यह अक्षर ${round.letter} है।` },
        { en: `${round.letter} says ${round.sound}.`, hi: `${round.letter} कहता है ${round.sound}।` },
        { en: `${round.letter} for ${round.word_en}.`, hi: `${round.letter} for ${round.word_hi}` },
        { en: TEXT.startsWith.en(round.letter), hi: TEXT.startsWith.hi(round.letter) },
      ]);
    }, 350);
    return () => clearTimeout(t);
  }, [phase, roundIdx, round, speakSequence]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.done.en, TEXT.done.hi), 350);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const handleChoose = useCallback((opt) => {
    if (chosen) return;
    sound.tap();
    setChosen(opt.key);
    const correct = opt.icon === round.icon_correct;

    if (correct) {
      sound.success();
      setShowConfetti(true);
      setScore(s => s + 1);
      speak(
        `Yes! ${opt.label} starts with ${round.letter}! ${round.sound}, ${opt.label}!`,
        `सही! ${opt.label} ${round.letter} से शुरू होता है!`,
      );
      advanceTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        setChosen(null);
        if (roundIdx + 1 < sessionLetters.length) setRoundIdx(i => i + 1);
        else setPhase('done');
      }, 2500);
    } else {
      sound.gentle();
      const correctOpt = round.options.find(o => o.icon === round.icon_correct);
      speak(
        `Hmm, that's ${opt.label}. The answer is ${correctOpt.label}, which starts with ${round.letter}.`,
        `हम्म, यह ${opt.label} है। उत्तर ${correctOpt.label} है, जो ${round.letter} से शुरू है।`,
      );
      advanceTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        setChosen(null);
        if (roundIdx + 1 < sessionLetters.length) setRoundIdx(i => i + 1);
        else setPhase('done');
      }, 2800);
    }
  }, [chosen, round, roundIdx, sessionLetters, sound, speak]);

  const playLetterSound = (l) => {
    speak(`${l.letter}. ${l.sound}. ${l.letter} for ${l.word_en}.`, `${l.letter}. ${l.sound}. ${l.letter} for ${l.word_hi}.`);
  };

  const bg = 'bg-gradient-to-b from-[#FFF8E0] via-[#FFE8D0] to-[#FFE0E8]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-9xl font-extrabold animate-bounce-in" style={{ color: '#FF8C42', textShadow: '4px 4px 0 #FFE680' }}>A</div>
          <Guddu emotion="happy" size={150} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('playing'); }} className="mt-2 px-10 py-4 rounded-full bg-[#E91E8C] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
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
        <div className="flex-1 flex flex-col items-center px-4 py-3 gap-3 overflow-y-auto">
          <Guddu emotion="celebrating" size={140} animate />
          <h2 className="text-2xl font-bold text-gray-800 animate-bounce-in">{TEXT.done[lang]}</h2>
          <p className="text-sm text-gray-600 font-semibold">{TEXT.collection[lang]}</p>
          <div className="grid grid-cols-3 gap-3 max-w-[330px] py-2">
            {sessionLetters.map((l, i) => (
              <button
                key={l.letter}
                onClick={() => { sound.pop(); playLetterSound(l); }}
                className="rounded-2xl p-3 shadow-md active:scale-95 transition-transform"
                style={{ backgroundColor: l.color + '22', border: `3px solid ${l.color}` }}
              >
                <div className="text-5xl font-extrabold text-center" style={{ color: l.color }}>{l.letter}</div>
                <div className="text-xl text-center mt-1">{l.icon_correct}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { stop(); setRoundIdx(0); setScore(0); setChosen(null); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Point out letters in your environment — shop signs, food packets. Ask 'Can you find the letter A?' Don't push writing yet — recognition comes first."
            tipHi="आसपास के अक्षर दिखाएँ — दुकान के बोर्ड, पैकेट। पूछें 'क्या तुम A अक्षर ढूँढ सकते हो?' अभी लिखाई पर ज़ोर न दें — पहले पहचान।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={roundIdx} totalRounds={sessionLetters.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />

      <div className="flex-1 flex flex-col items-center px-4 py-3 gap-4">
        {/* Big letter */}
        <div
          key={`L-${roundIdx}`}
          className="rounded-3xl flex items-center justify-center shadow-lg animate-bounce-in"
          style={{
            width: 180, height: 180,
            backgroundColor: round.color + '33',
            border: `5px solid ${round.color}`,
          }}
        >
          <span className="text-9xl font-extrabold" style={{ color: round.color, lineHeight: 1 }}>{round.letter}</span>
        </div>

        {/* Sound */}
        <div className="text-2xl font-bold text-gray-700">
          {round.letter} says <span className="text-[#E91E8C]">"{round.sound}"</span>
        </div>
        <div className="text-base font-semibold text-gray-600">
          {round.letter} for {lang === 'hi' ? round.word_hi : round.word_en}
        </div>

        <p className="text-sm font-semibold text-amber-700 mt-2">
          {TEXT.startsWith[lang](round.letter)}
        </p>

        {/* Options */}
        <div className="flex justify-center gap-3 pb-3">
          {round.options.map(opt => {
            const isThis = chosen === opt.key;
            const isAnswer = opt.icon === round.icon_correct;
            let cls = 'bg-white border-gray-300';
            if (chosen) {
              if (isAnswer) cls = 'bg-green-100 border-green-500 scale-110';
              else if (isThis) cls = 'bg-orange-50 border-orange-300';
            }
            return (
              <button
                key={opt.key}
                onClick={() => handleChoose(opt)}
                disabled={!!chosen}
                className={`flex flex-col items-center gap-1 rounded-2xl border-4 p-3 shadow-md transition-all active:scale-95 ${cls}`}
                style={{ minWidth: 88 }}
              >
                <span className="text-5xl">{opt.icon}</span>
                <span className="text-xs font-bold text-gray-700">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
