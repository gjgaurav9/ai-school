import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import Character from '../../common/Character';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import traps from '../../../data/lkg/thinking-traps.json';

const TEXT = {
  title: { en: 'Thinking Traps', hi: 'सोच के जाल' },
  intro: {
    en: (n) => `${n ? n + ', o' : 'O'}ur brains make little mistakes called 'Thinking Traps.' Let's learn to spot them!`,
    hi: (n) => `${n ? n + ', ' : ''}हमारा दिमाग़ कभी-कभी छोटी-छोटी गलतियाँ करता है — सोच के जाल। आओ इन्हें पहचानें!`,
  },
  start: { en: 'Spot the Traps!', hi: 'जाल पहचानो!' },
  done: { en: 'You can now spot all 5 thinking traps!', hi: 'अब तुम पाँचों जाल पहचान सकते हो!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  thoughtBubble: { en: "Guddu's thought:", hi: 'गुड्डू सोचता है:' },
};

export default function ThinkingTraps({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');     // intro | scene | feedback | done
  const [trapIdx, setTrapIdx] = useState(0);
  const [picked, setPicked] = useState(new Set());
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const trap = traps[trapIdx];

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'scene') return;
    const t = setTimeout(() => speak(
      `${trap.scene_en} Guddu thinks: ${trap.thought_en}. ${trap.prompt_en}`,
      `${trap.scene_hi} गुड्डू सोचता है: ${trap.thought_hi}। ${trap.prompt_hi}`,
    ), 350);
    return () => clearTimeout(t);
  }, [phase, trapIdx, trap, speak]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.done.en, TEXT.done.hi), 350);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const handlePick = useCallback((opt) => {
    if (picked.has(opt.key)) return;
    sound.tap();
    const next = new Set(picked);
    next.add(opt.key);
    setPicked(next);
    if (opt.good) {
      sound.success();
      speak(
        lang === 'hi' ? 'अच्छी सोच!' : 'Good thinking!',
        lang === 'hi' ? 'अच्छी सोच!' : 'Good thinking!',
      );
    } else {
      sound.gentle();
      speak(
        lang === 'hi' ? 'हम्म, यह जाल वाली सोच है।' : "Hmm, that's a trap thought.",
        lang === 'hi' ? 'हम्म, यह जाल वाली सोच है।' : "Hmm, that's a trap thought.",
      );
    }
  }, [picked, sound, speak, lang]);

  // Allow advance when at least one good option chosen
  const canAdvance = trap?.options.some(o => o.good && picked.has(o.key));

  const handleNext = () => {
    sound.pop();
    setShowConfetti(true);
    if (canAdvance) setScore(s => s + 1);
    speak(trap.lesson_en, trap.lesson_hi);
    advanceTimerRef.current = setTimeout(() => {
      setShowConfetti(false);
      setPicked(new Set());
      if (trapIdx + 1 < traps.length) {
        setTrapIdx(i => i + 1);
        setPhase('scene');
      } else {
        setPhase('done');
      }
    }, 3000);
  };

  const bg = 'bg-gradient-to-b from-[#F0F0FF] via-[#FFF0E0] to-[#FFE0F0]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\ud83e\ude9d'}</div>
          <Character kind="ullu" emotion="curious" size={150} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('scene'); }} className="mt-2 px-10 py-4 rounded-full bg-[#A855F7] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
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
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
          <Character kind="ullu" emotion="happy" size={130} animate />
          <h2 className="text-xl font-bold text-gray-800 text-center">{TEXT.done[lang]}</h2>
          <div className="grid grid-cols-2 gap-2 max-w-[330px]">
            {traps.map(tr => (
              <div key={tr.id} className="bg-white rounded-xl border-2 border-purple-200 p-2 text-center">
                <div className="text-3xl">{tr.icon}</div>
                <div className="text-[10px] font-bold text-gray-700 leading-tight">
                  {lang === 'hi' ? tr.name_hi : tr.name_en}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { stop(); setTrapIdx(0); setScore(0); setPicked(new Set()); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="When your child catastrophizes ('My WHOLE day is ruined!'), gently say: 'Is that the all-or-nothing trap?' Making it playful helps them recognize patterns without feeling lectured."
            tipHi="जब बच्चा बढ़ा-चढ़ाकर कहे ('पूरा दिन बेकार!'), प्यार से पूछें: 'क्या यह सब-या-कुछ-नहीं वाला जाल है?' मज़ाक में पूछने से वे बिना डाँट खाए पैटर्न पहचानते हैं।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={trapIdx} totalRounds={traps.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />

      <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
        <div className="text-center text-sm font-bold text-purple-700 flex items-center justify-center gap-1">
          <span className="text-xl">{trap.icon}</span>
          <span>{lang === 'hi' ? trap.name_hi : trap.name_en}</span>
        </div>

        <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold animate-bounce-in" key={`s-${trapIdx}`}>
          {lang === 'hi' ? trap.scene_hi : trap.scene_en}
        </div>

        {/* Thought bubble */}
        <div className="flex items-start gap-2 px-2">
          <Guddu emotion="sad" size={70} animate />
          <div className="relative bg-white border-3 border-purple-300 rounded-2xl px-3 py-2 flex-1 shadow-md">
            <div className="text-[10px] font-bold text-purple-500 uppercase">{TEXT.thoughtBubble[lang]}</div>
            <div className="text-sm font-bold text-gray-800 italic">"{lang === 'hi' ? trap.thought_hi : trap.thought_en}"</div>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2 text-center text-amber-900 text-sm font-bold">
          {lang === 'hi' ? trap.prompt_hi : trap.prompt_en}
        </div>

        <div className="flex flex-col gap-2 pb-2">
          {trap.options.map(opt => {
            const isPicked = picked.has(opt.key);
            let cls = 'bg-white border-gray-200 text-gray-700';
            if (isPicked) {
              cls = opt.good ? 'bg-green-100 border-green-400 text-green-800' : 'bg-orange-50 border-orange-300 text-orange-700';
            }
            return (
              <button
                key={opt.key}
                onClick={() => handlePick(opt)}
                disabled={isPicked}
                className={`rounded-2xl border-2 px-4 py-3 text-left font-bold text-sm shadow-sm transition-all active:scale-95 ${cls}`}
              >
                {lang === 'hi' ? opt.label_hi : opt.label_en}
              </button>
            );
          })}
        </div>

        {canAdvance && (
          <button onClick={handleNext} className="mx-auto px-8 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90 animate-bounce-in">
            {lang === 'hi' ? 'आगे' : 'Next'}
          </button>
        )}
      </div>
    </GameShell>
  );
}
