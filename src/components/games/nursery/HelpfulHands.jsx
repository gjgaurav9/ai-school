import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import scenarios from '../../../data/nursery/helping-scenarios.json';

const TEXT = {
  title: { en: 'Helpful Hands', hi: 'मदद के हाथ' },
  intro: {
    en: (n) => `${n ? n + ', G' : 'G'}uddu's family needs help today! Every family member is busy. Let's find ways to help!`,
    hi: (n) => `${n ? n + ', ' : ''}गुड्डू के परिवार को आज मदद चाहिए! हर कोई व्यस्त है। चलो मदद के तरीक़े ढूँढें!`,
  },
  start: { en: "Let's Help!", hi: 'चलो मदद करें!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  done: { en: 'You helped every room!', hi: 'तुमने हर कमरे में मदद की!' },
  hero: { en: 'Helpful Hero', hi: 'मदद का हीरो' },
  task: { en: 'Tap to help!', hi: 'मदद के लिए टैप करें!' },
};

function TaskInteraction({ scenario, lang, sound, onDone }) {
  const [done, setDone] = useState(0);

  const handleTap = (i) => {
    if (i !== done) return;
    sound.playTone(440 + i * 40, 0.18, 'triangle');
    const next = done + 1;
    setDone(next);
    if (next >= scenario.task_count) {
      sound.success();
      setTimeout(onDone, 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-2 animate-bounce-in">
      <p className="text-sm font-bold text-amber-700">{TEXT.task[lang]}</p>
      <div className="flex justify-center gap-3 flex-wrap max-w-[300px]">
        {Array.from({ length: scenario.task_count }).map((_, i) => {
          const tapped = i < done;
          return (
            <button
              key={i}
              onClick={() => handleTap(i)}
              disabled={tapped}
              className={`text-5xl transition-all active:scale-90 ${tapped ? 'opacity-30 scale-75' : i === done ? 'animate-pulse' : ''}`}
            >
              {scenario.task_icon}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">{done} / {scenario.task_count}</p>
    </div>
  );
}

export default function HelpfulHands({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');     // intro | room | task | celebrating | done
  const [roomIdx, setRoomIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [helpedRooms, setHelpedRooms] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const scenario = scenarios[roomIdx];

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'room') return;
    const t = setTimeout(() => speak(
      `${scenario.scene_en} ${scenario.prompt_en}`,
      `${scenario.scene_hi} ${scenario.prompt_hi}`,
    ), 350);
    return () => clearTimeout(t);
  }, [phase, roomIdx, scenario, speak]);

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
      setHelpedRooms(prev => prev.includes(scenario.id) ? prev : [...prev, scenario.id]);
      speak(
        lang === 'hi' ? 'सही चुनाव!' : 'Great choice! Let\'s do it!',
        lang === 'hi' ? 'सही चुनाव!' : 'Great choice! Let\'s do it!',
      );
      advanceTimerRef.current = setTimeout(() => setPhase('task'), 1300);
    } else {
      sound.gentle();
      speak(
        lang === 'hi' ? 'हम्म, सोचो — कौनसा सच्ची मदद है?' : 'Hmm, think again — which one is real help?',
        lang === 'hi' ? 'हम्म, सोचो — कौनसा सच्ची मदद है?' : 'Hmm, think again — which one is real help?',
      );
      advanceTimerRef.current = setTimeout(() => setChosen(null), 1800);
    }
  }, [chosen, scenario, sound, speak, lang]);

  const handleTaskDone = useCallback(() => {
    setShowConfetti(true);
    speak(scenario.lesson_en, scenario.lesson_hi);
    setPhase('celebrating');
    advanceTimerRef.current = setTimeout(() => {
      setShowConfetti(false);
      setChosen(null);
      if (roomIdx + 1 < scenarios.length) {
        setRoomIdx(i => i + 1);
        setPhase('room');
      } else {
        setPhase('done');
      }
    }, 3500);
  }, [scenario, roomIdx, speak]);

  const bg = phase === 'room' || phase === 'task' || phase === 'celebrating'
    ? `bg-[${scenario?.bg_color || '#FFF8E7'}]`
    : 'bg-gradient-to-b from-[#FFF0D4] via-[#FFE8C8] to-[#FFD6A5]';

  const inlineBg = (phase === 'room' || phase === 'task' || phase === 'celebrating') && scenario
    ? { backgroundColor: scenario.bg_color }
    : undefined;

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg="bg-gradient-to-b from-[#FFF0D4] to-[#FFE8C8]">
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\u{1F3E0}'}</div>
          <Guddu emotion="happy" size={170} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('room'); }} className="mt-2 px-10 py-4 rounded-full bg-[#2DC653] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
            {TEXT.start[lang]}
          </button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'done') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg="bg-gradient-to-b from-[#FFF0D4] to-[#FFE8C8]">
        <Celebration active type="confetti" />
        <Celebration active type="stars" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
          <div className="text-7xl animate-bounce-in">{'\u{1F3F5}\u{FE0F}'}</div>
          <Guddu emotion="celebrating" size={150} animate />
          <h2 className="text-2xl font-bold text-gray-800 animate-bounce-in">{TEXT.done[lang]}</h2>
          <p className="text-amber-700 text-sm font-bold">{TEXT.hero[lang]}</p>
          <div className="grid grid-cols-5 gap-2">
            {scenarios.map(s => {
              const helped = helpedRooms.includes(s.id);
              return (
                <div key={s.id} className={`rounded-xl border-2 p-2 text-center ${helped ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                  <div className="text-2xl">{s.icon}</div>
                  <div className="text-[9px] font-bold text-gray-700">{lang === 'hi' ? s.room_hi : s.room_en}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { stop(); setRoomIdx(0); setScore(0); setChosen(null); setHelpedRooms([]); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Give your child one real 'house job' this week — setting napkins, watering one plant. Make it THEIR responsibility. Praise effort, not perfection."
            tipHi="इस हफ्ते अपने बच्चे को एक असली काम दें — नैपकिन रखना, एक पौधे को पानी देना। यह उनकी ज़िम्मेदारी हो। मेहनत की तारीफ़ करें, सही-गलत की नहीं।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={roomIdx} totalRounds={scenarios.length} bg="">
      <div className="flex-1 flex flex-col" style={inlineBg}>
        <Celebration active={showConfetti} type="confetti" />

        <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
          {/* Room title */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{scenario.icon}</span>
            <span className="text-lg font-bold text-gray-700">
              {lang === 'hi' ? scenario.room_hi : scenario.room_en}
            </span>
          </div>

          {/* Scene */}
          <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold animate-bounce-in" key={`scene-${roomIdx}`}>
            {lang === 'hi' ? scenario.scene_hi : scenario.scene_en}
          </div>

          {/* Guddu thinking */}
          <div className="flex justify-center" key={`g-${roomIdx}`}>
            <Guddu emotion={phase === 'celebrating' ? 'celebrating' : 'happy'} size={110} animate />
          </div>

          {/* Question + options OR task */}
          {phase === 'room' && (
            <>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-2 text-center text-amber-900 text-sm font-bold">
                {lang === 'hi' ? scenario.prompt_hi : scenario.prompt_en}
              </div>
              <div className="flex flex-col gap-2 pb-2">
                {scenario.options.map(opt => {
                  const isThis = chosen === opt.key;
                  let cls = 'bg-white border-gray-200 text-gray-700';
                  if (chosen) {
                    if (opt.correct) cls = 'bg-green-100 border-green-400 text-green-800 scale-105';
                    else if (isThis) cls = 'bg-orange-50 border-orange-300 text-orange-700';
                  }
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleChoose(opt)}
                      disabled={!!chosen}
                      className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold text-base shadow-sm transition-all active:scale-95 ${cls}`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="flex-1">{lang === 'hi' ? opt.label_hi : opt.label_en}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {phase === 'task' && (
            <TaskInteraction scenario={scenario} lang={lang} sound={sound} onDone={handleTaskDone} />
          )}

          {phase === 'celebrating' && (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl px-4 py-3 text-center text-green-900 text-sm font-semibold animate-bounce-in">
              {lang === 'hi' ? scenario.lesson_hi : scenario.lesson_en}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}
