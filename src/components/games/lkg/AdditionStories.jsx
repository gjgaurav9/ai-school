import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Character from '../../common/Character';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import stories from '../../../data/lkg/number-stories.json';

const TEXT = {
  title: { en: 'Addition Stories', hi: 'जोड़ की कहानियाँ' },
  intro: {
    en: (n) => `${n ? n + ', C' : 'C'}hhotu loves counting! Let's help him solve number stories!`,
    hi: (n) => `${n ? n + ', ' : ''}छोटू को गिनती बहुत पसंद है! चलो उसके साथ संख्या कहानियाँ हल करें!`,
  },
  start: { en: "Let's Count!", hi: 'चलो गिनें!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  done: { en: "You're a Number Story Hero!", hi: 'तुम संख्या कथा नायक हो!' },
};

function ItemRow({ count, icon, fadeAfter }) {
  return (
    <div className="flex flex-wrap justify-center gap-1 max-w-[300px]">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`text-3xl transition-all duration-500 ${fadeAfter != null && i >= fadeAfter ? 'opacity-30 scale-75' : ''}`}
        >
          {icon}
        </span>
      ))}
    </div>
  );
}

function StoryAnimation({ story, stage }) {
  // stage = 0 (start), 1 (after delta), 2 (after delta2 — only for two_step)
  const { type } = story;
  if (type === 'add') {
    const total = stage >= 1 ? story.start + story.delta : story.start;
    return (
      <div className="flex flex-col items-center gap-2">
        <ItemRow count={story.start} icon={story.icon} />
        {stage >= 1 && (
          <div className="text-2xl text-amber-700 font-bold animate-bounce-in">+ {story.delta} more</div>
        )}
        {stage >= 1 && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl px-3 py-2 mt-1 animate-bounce-in">
            <ItemRow count={total} icon={story.icon} />
          </div>
        )}
      </div>
    );
  }
  if (type === 'subtract') {
    return (
      <div className="flex flex-col items-center gap-2">
        <ItemRow count={story.start} icon={story.icon} fadeAfter={stage >= 1 ? story.start - story.delta : null} />
        {stage >= 1 && <div className="text-2xl text-amber-700 font-bold animate-bounce-in">− {story.delta} taken away</div>}
      </div>
    );
  }
  if (type === 'two_step') {
    const after1 = story.start + story.delta;          // +2 → 5
    const after2 = after1 + story.delta2;              // -1 → 4
    return (
      <div className="flex flex-col items-center gap-2">
        <ItemRow count={story.start} icon={story.icon} />
        {stage >= 1 && <div className="text-xl text-amber-700 font-bold">+ {story.delta} more</div>}
        {stage >= 1 && <ItemRow count={after1} icon={story.icon} fadeAfter={stage >= 2 ? after2 : null} />}
        {stage >= 2 && <div className="text-xl text-orange-700 font-bold">− 1 lost</div>}
      </div>
    );
  }
  return null;
}

export default function AdditionStories({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');
  const [roundIdx, setRoundIdx] = useState(0);
  const [stage, setStage] = useState(0);     // animation stage
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const stageTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const story = stories[roundIdx];
  const isTwoStep = story?.type === 'two_step';

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); clearTimeout(stageTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  // Animate story stages
  useEffect(() => {
    if (phase !== 'playing') return;
    setStage(0);
    setChosen(null);
    speak(
      `${story.scene_en} ${story.question_en}`,
      `${story.scene_hi} ${story.question_hi}`,
    );
    stageTimerRef.current = setTimeout(() => setStage(1), 1800);
    if (isTwoStep) {
      const t2 = setTimeout(() => setStage(2), 3400);
      return () => { clearTimeout(stageTimerRef.current); clearTimeout(t2); };
    }
    return () => clearTimeout(stageTimerRef.current);
  }, [phase, roundIdx, story, isTwoStep, speak]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.done.en, TEXT.done.hi), 350);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const handleChoose = useCallback((n) => {
    if (chosen) return;
    sound.tap();
    setChosen(n);
    if (n === story.answer) {
      sound.success();
      setScore(s => s + 1);
      setShowConfetti(true);
      const sentence = story.type === 'add'
        ? `${story.start} and ${story.delta} more makes ${story.answer}!`
        : story.type === 'subtract'
          ? `${story.start} take away ${story.delta} leaves ${story.answer}!`
          : `Wow! You solved a TWO-STEP problem! ${story.answer} is correct!`;
      speak(sentence, sentence);
      advanceTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        if (roundIdx + 1 < stories.length) setRoundIdx(i => i + 1);
        else setPhase('done');
      }, 2400);
    } else {
      sound.gentle();
      speak(
        `Hmm, count again. The answer is ${story.answer}.`,
        `फिर गिनो। जवाब ${story.answer} है।`,
      );
      advanceTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        if (roundIdx + 1 < stories.length) setRoundIdx(i => i + 1);
        else setPhase('done');
      }, 2700);
    }
  }, [chosen, story, roundIdx, speak, sound]);

  const bg = 'bg-gradient-to-b from-[#FFF8E0] via-[#E8F8E0] to-[#E0F4FF]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <Character kind="chhotu" emotion="happy" size={150} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('playing'); }} className="mt-2 px-10 py-4 rounded-full bg-[#2DC653] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
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
          <div className="text-7xl animate-bounce-in">{'\u{1F3C5}'}</div>
          <Character kind="chhotu" emotion="happy" size={130} animate />
          <h2 className="text-xl font-bold text-gray-800">{TEXT.done[lang]}</h2>
          <p className="text-amber-700 font-bold">
            {lang === 'hi' ? `${stories.length} में से ${score}!` : `${score} of ${stories.length} solved!`}
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { stop(); setRoundIdx(0); setScore(0); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Make everyday situations into math stories: 'You have 3 grapes. I'm giving you 2 more. How many?' Use REAL objects. Physical counting beats worksheets at this age."
            tipHi="रोज़मर्रा को गणित कहानी बनाएँ: '3 अंगूर हैं, 2 और दूँ — कितने?' असली चीज़ें इस्तेमाल करें। इस उम्र में वर्कशीट से गिनना ज़्यादा अच्छा है।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={roundIdx} totalRounds={stories.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />
      <div className="flex-1 flex flex-col items-center px-4 py-3 gap-3 overflow-y-auto" key={roundIdx}>
        <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold animate-bounce-in">
          {lang === 'hi' ? story.scene_hi : story.scene_en}
        </div>

        <StoryAnimation story={story} stage={stage} />

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2 text-center text-amber-900 text-base font-bold mt-2">
          {lang === 'hi' ? story.question_hi : story.question_en}
        </div>

        <div className="flex gap-3 pb-3">
          {story.options.map(n => {
            const isThis = chosen === n;
            const isAnswer = n === story.answer;
            let cls = 'bg-white border-gray-300 text-gray-700';
            if (chosen) {
              if (isAnswer) cls = 'bg-green-100 border-green-500 text-green-700 scale-110';
              else if (isThis) cls = 'bg-orange-50 border-orange-300 text-orange-700';
            }
            return (
              <button
                key={n}
                onClick={() => handleChoose(n)}
                disabled={!!chosen}
                className={`w-16 h-16 rounded-full border-3 font-extrabold text-2xl shadow-md active:scale-95 transition-all ${cls}`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {chosen === story.answer && (
          <div className="text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-1 animate-bounce-in">
            {story.type === 'add' && `${story.start} + ${story.delta} = ${story.answer}`}
            {story.type === 'subtract' && `${story.start} − ${story.delta} = ${story.answer}`}
            {story.type === 'two_step' && `${story.start} + ${story.delta} − 1 = ${story.answer}`}
          </div>
        )}
      </div>
    </GameShell>
  );
}
