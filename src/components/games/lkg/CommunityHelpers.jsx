import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import scenarios from '../../../data/lkg/community-helpers.json';

const TEXT = {
  title: { en: 'Community Helpers', hi: 'समाज के साथी' },
  intro: {
    en: (n) => `${n ? n + ', G' : 'G'}uddu's town is full of helpers! Every person does something important. Let's meet them!`,
    hi: (n) => `${n ? n + ', ' : ''}गुड्डू के शहर में बहुत साथी हैं! हर कोई कुछ ज़रूरी करता है। चलो मिलें!`,
  },
  start: { en: 'Visit the Town', hi: 'शहर चलें' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  done: { en: 'Everyone needs everyone!', hi: 'हर किसी को हर किसी की ज़रूरत है!' },
  whoHelps: { en: 'Who can help?', hi: 'कौन मदद कर सकता है?' },
  futureQ: { en: 'What kind of helper would YOU like to be?', hi: 'तुम बड़े होकर कौनसे साथी बनना चाहोगे?' },
  badge: { en: 'Community Explorer', hi: 'समाज खोजकर्ता' },
};

export default function CommunityHelpers({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');     // intro | scene | feedback | finale | done
  const [scenIdx, setScenIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [futureChoice, setFutureChoice] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const scen = scenarios[scenIdx];

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'scene') return;
    const t = setTimeout(() => speak(
      `${scen.problem_en} ${TEXT.whoHelps.en}`,
      `${scen.problem_hi} ${TEXT.whoHelps.hi}`,
    ), 350);
    return () => clearTimeout(t);
  }, [phase, scenIdx, scen, speak]);

  useEffect(() => {
    if (phase !== 'finale') return;
    const t = setTimeout(() => speak(
      `Everyone needs everyone! The doctor needs the farmer for food. The farmer needs the plumber for water. Our town works because everyone helps. ${TEXT.futureQ.en}`,
      `सबको सबकी ज़रूरत है! डॉक्टर को किसान चाहिए खाने के लिए। किसान को नल वाला चाहिए पानी के लिए। शहर इसी से चलता है। ${TEXT.futureQ.hi}`,
    ), 350);
    return () => clearTimeout(t);
  }, [phase, speak]);

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
    if (opt.correct) {
      sound.success();
      setScore(s => s + 1);
      setShowConfetti(true);
      speak(scen.lesson_en, scen.lesson_hi);
      advanceTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        setChosen(null);
        if (scenIdx + 1 < scenarios.length) {
          setScenIdx(i => i + 1);
        } else {
          setPhase('finale');
        }
      }, 3500);
    } else {
      sound.gentle();
      const correctOpt = scen.options.find(o => o.correct);
      speak(
        `Hmm, that's not the right helper. The answer is ${correctOpt.label_en}.`,
        `नहीं, सही साथी नहीं। उत्तर ${correctOpt.label_hi} है।`,
      );
      advanceTimerRef.current = setTimeout(() => setChosen(null), 2500);
    }
  }, [chosen, scen, scenIdx, sound, speak]);

  const handleFutureChoice = (opt) => {
    sound.success();
    setFutureChoice(opt);
    speak(
      `Welcome to the team, future ${opt.label_en}!`,
      `टीम में आपका स्वागत है, भावी ${opt.label_hi}!`,
    );
    setTimeout(() => setPhase('done'), 2200);
  };

  // Unique helpers across all scenarios for finale picker
  const allHelpers = [];
  scenarios.forEach(s => s.options.filter(o => o.correct).forEach(o => {
    if (!allHelpers.find(x => x.key === o.key)) allHelpers.push(o);
  }));

  const bg = 'bg-gradient-to-b from-[#E8F4FD] via-[#FFF8E0] to-[#FFE0E8]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\ud83c\udfd8\ufe0f'}</div>
          <Guddu emotion="happy" size={150} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('scene'); }} className="mt-2 px-10 py-4 rounded-full bg-[#0EA5E9] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
            {TEXT.start[lang]}
          </button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'finale') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto items-center">
          <h2 className="text-base font-bold text-purple-700 text-center mt-2">
            {lang === 'hi' ? 'सब आपस में जुड़े हैं' : 'Everyone is connected!'}
          </h2>
          {/* Helpers in a circle */}
          <div className="grid grid-cols-3 gap-3 max-w-[330px]">
            {allHelpers.map(h => (
              <div key={h.key} className="bg-white rounded-2xl border-2 border-amber-200 p-3 text-center shadow-sm">
                <div className="text-3xl">{h.icon}</div>
                <div className="text-[10px] font-bold text-gray-700 mt-1">{lang === 'hi' ? h.label_hi : h.label_en}</div>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 text-center text-amber-900 text-sm font-bold">
            {TEXT.futureQ[lang]}
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-[330px]">
            {allHelpers.map(h => (
              <button
                key={h.key}
                onClick={() => handleFutureChoice(h)}
                disabled={!!futureChoice}
                className={`rounded-2xl border-2 p-3 transition-all active:scale-95 ${
                  futureChoice?.key === h.key ? 'bg-green-100 border-green-500 scale-110' : 'bg-white border-gray-200'
                }`}
              >
                <div className="text-3xl">{h.icon}</div>
                <div className="text-[10px] font-bold text-gray-700 mt-1">{lang === 'hi' ? h.label_hi : h.label_en}</div>
              </button>
            ))}
          </div>
          {futureChoice && (
            <div className="text-sm font-bold text-green-700 animate-bounce-in">
              {lang === 'hi' ? `भावी ${futureChoice.label_hi}, टीम में स्वागत है!` : `Welcome, future ${futureChoice.label_en}!`}
            </div>
          )}
        </div>
      </GameShell>
    );
  }

  if (phase === 'done') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <Celebration active type="confetti" />
        <Celebration active type="stars" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
          <div className="text-7xl animate-bounce-in">{'\ud83c\udfc5'}</div>
          <Guddu emotion="celebrating" size={140} animate />
          <h2 className="text-xl font-bold text-gray-800">{TEXT.done[lang]}</h2>
          <p className="text-amber-700 text-sm font-bold">{TEXT.badge[lang]}</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { stop(); setScenIdx(0); setScore(0); setChosen(null); setFutureChoice(null); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="When you see people working — auto driver, shopkeeper, security guard — say 'Thank you' in front of your child. Point out: 'See how that person is helping?' This builds gratitude and breaks down biases early."
            tipHi="कामकाजी लोगों को देखकर — ऑटो वाले, दुकानदार, गार्ड — बच्चे के सामने 'धन्यवाद' कहें। बताएँ: 'देखो, ये कैसे मदद कर रहे हैं?' इससे कृतज्ञता बढ़ती है और भेदभाव कम।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={scenIdx} totalRounds={scenarios.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />
      <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
        <div className="flex justify-center text-7xl animate-bounce-in" key={`scen-icon-${scenIdx}`}>
          {scen.scene_icon}
        </div>

        <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold animate-bounce-in" key={`scen-${scenIdx}`}>
          {lang === 'hi' ? scen.problem_hi : scen.problem_en}
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-2 text-center text-amber-900 text-base font-bold">
          {TEXT.whoHelps[lang]}
        </div>

        <div className="grid grid-cols-3 gap-2 pb-2">
          {scen.options.map(opt => {
            const isThis = chosen === opt.key;
            let cls = 'bg-white border-gray-300';
            if (chosen) {
              if (opt.correct) cls = 'bg-green-100 border-green-500 scale-105';
              else if (isThis) cls = 'bg-orange-50 border-orange-300';
            }
            return (
              <button
                key={opt.key}
                onClick={() => handleChoose(opt)}
                disabled={!!chosen}
                className={`rounded-2xl border-3 p-3 text-center shadow-md active:scale-95 transition-all ${cls}`}
              >
                <div className="text-4xl">{opt.icon}</div>
                <div className="text-[11px] font-bold text-gray-700 mt-1">{lang === 'hi' ? opt.label_hi : opt.label_en}</div>
              </button>
            );
          })}
        </div>

        {chosen === scen.options.find(o => o.correct).key && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl px-3 py-2 text-center text-green-900 text-sm font-semibold animate-bounce-in">
            {lang === 'hi' ? scen.lesson_hi : scen.lesson_en}
          </div>
        )}
      </div>
    </GameShell>
  );
}
