import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import vowels from '../../../data/lkg/hindi-vowels.json';

const VOWELS_PER_SESSION = 6;

const TEXT = {
  title: { en: 'Hindi Akshar', hi: 'हिंदी अक्षर' },
  intro: {
    en: (n) => `${n ? n + ', l' : 'L'}et's learn Hindi letters today! Starting with vowels.`,
    hi: (n) => `${n ? n + ', ' : ''}चलो आज हिंदी के अक्षर सीखते हैं! पहले स्वर!`,
  },
  start: { en: "Let's Learn!", hi: 'सीखें!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  done: { en: 'You learned 6 Hindi akshar!', hi: 'तुमने 6 हिंदी अक्षर सीखे!' },
  whichStarts: { en: 'Which one starts with this akshar?', hi: 'इस अक्षर से कौनसा शुरू होता है?' },
  collection: { en: 'Tap to hear again', hi: 'फिर सुनने के लिए टैप करें' },
};

function shuffleSlice(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export default function HindiAkshar({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');
  const [roundIdx, setRoundIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const { speak, speakSequence, stop } = useVoice(lang);
  const sound = useSound();

  const session = useMemo(() => shuffleSlice(vowels, VOWELS_PER_SESSION), []);
  const v = session[roundIdx];

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'playing' || !v) return;
    const t = setTimeout(() => {
      speakSequence([
        { en: `This is ${v.char}.`, hi: `यह है ${v.char}` },
        { en: `${v.char} says ${v.sound}.`, hi: `${v.char} कहता है ${v.sound}` },
        { en: `${v.char} for ${v.translit}`, hi: `${v.char} से ${v.word}` },
        { en: TEXT.whichStarts.en, hi: TEXT.whichStarts.hi },
      ]);
    }, 350);
    return () => clearTimeout(t);
  }, [phase, roundIdx, v, speakSequence]);

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
    const correct = opt.icon === v.icon_correct;
    if (correct) {
      sound.success();
      setShowConfetti(true);
      setScore(s => s + 1);
      speak(
        `Yes! ${v.translit} starts with ${v.char}!`,
        `सही! ${v.word} ${v.char} से शुरू होता है!`,
      );
      advanceTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        setChosen(null);
        if (roundIdx + 1 < session.length) setRoundIdx(i => i + 1);
        else setPhase('done');
      }, 2400);
    } else {
      sound.gentle();
      const correctOpt = v.options.find(o => o.icon === v.icon_correct);
      speak(
        `Hmm, the answer is ${correctOpt.label_en}.`,
        `नहीं, उत्तर ${correctOpt.label_hi} है।`,
      );
      advanceTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        setChosen(null);
        if (roundIdx + 1 < session.length) setRoundIdx(i => i + 1);
        else setPhase('done');
      }, 2700);
    }
  }, [chosen, v, roundIdx, session, sound, speak]);

  const playVowel = (item) => {
    speak(`${item.char}. ${item.sound}. ${item.char} for ${item.translit}.`, `${item.char}. ${item.sound}. ${item.char} से ${item.word}.`);
  };

  const bg = 'bg-gradient-to-b from-[#FFE0E0] via-[#FFE8C8] to-[#FFF0D8]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-9xl font-extrabold animate-bounce-in" style={{ color: '#E91E8C', textShadow: '4px 4px 0 #FFE680' }}>{'\u0905'}</div>
          <Guddu emotion="happy" size={150} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('playing'); }} className="mt-2 px-10 py-4 rounded-full bg-[#FF8C42] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
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
          <h2 className="text-xl font-bold text-gray-800 animate-bounce-in">{TEXT.done[lang]}</h2>
          <p className="text-sm text-gray-600 font-semibold">{TEXT.collection[lang]}</p>
          <div className="grid grid-cols-3 gap-3 max-w-[330px] py-2">
            {session.map((item) => (
              <button
                key={item.char}
                onClick={() => { sound.pop(); playVowel(item); }}
                className="rounded-2xl p-3 shadow-md active:scale-95 transition-transform"
                style={{ backgroundColor: item.color + '22', border: `3px solid ${item.color}` }}
              >
                <div className="text-5xl font-extrabold text-center" style={{ color: item.color }}>{item.char}</div>
                <div className="text-xl text-center mt-1">{item.icon_correct}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { stop(); setRoundIdx(0); setScore(0); setChosen(null); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Hindi and English learning happen in PARALLEL. Bilingual letter learning strengthens BOTH languages. Point out Hindi signs — shops, auto plates, TV credits."
            tipHi="हिंदी और अंग्रेज़ी साथ-साथ सीखी जा सकती हैं। दोनों एक-दूसरे को मज़बूत करती हैं। दुकान के बोर्ड, ऑटो की प्लेट, टीवी के क्रेडिट दिखाएँ।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={roundIdx} totalRounds={session.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />

      <div className="flex-1 flex flex-col items-center px-4 py-3 gap-4">
        <div
          key={`v-${roundIdx}`}
          className="rounded-3xl flex items-center justify-center shadow-lg animate-bounce-in"
          style={{
            width: 180, height: 180,
            backgroundColor: v.color + '33',
            border: `5px solid ${v.color}`,
          }}
        >
          <span className="text-9xl font-extrabold" style={{ color: v.color, lineHeight: 1 }}>{v.char}</span>
        </div>

        <div className="text-2xl font-bold text-gray-700">
          {v.char} <span className="text-[#E91E8C]">"{v.sound}"</span>
        </div>
        <div className="text-base font-semibold text-gray-600">
          {v.char} {lang === 'hi' ? 'से' : 'for'} {lang === 'hi' ? v.word : v.translit}
        </div>

        <p className="text-sm font-semibold text-amber-700 mt-1">
          {TEXT.whichStarts[lang]}
        </p>

        <div className="flex justify-center gap-3 pb-3">
          {v.options.map(opt => {
            const isThis = chosen === opt.key;
            const isAnswer = opt.icon === v.icon_correct;
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
                <span className="text-[10px] font-bold text-gray-700">{lang === 'hi' ? opt.label_hi : opt.label_en}</span>
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
