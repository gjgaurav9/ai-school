import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import Character from '../../common/Character';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import cases from '../../../data/nursery/detective-cases.json';

const TEXT = {
  title: { en: 'Feelings Detective', hi: 'भावना जासूस' },
  intro: {
    en: (name) => `Welcome${name ? ', ' + name : ''}, Detective! Today we're solving feeling mysteries. Let's figure out how everyone feels and WHY!`,
    hi: (name) => `${name ? name + ', ' : ''}जासूस का स्वागत है! आज हम भावनाओं के रहस्य सुलझाएँगे। चलो जानें सबको कैसा लग रहा है और क्यों!`,
  },
  start: { en: "Let's Solve!", hi: 'चलो सुलझाएँ!' },
  badge: { en: 'You earned the Feelings Detective badge!', hi: 'तुमने भावना जासूस बैज जीता!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
};

function CharacterRenderer({ token, size = 110 }) {
  const [kind, emotion] = token.split(':');
  if (kind === 'guddu') return <Guddu emotion={emotion} size={size} animate />;
  return <Character kind={kind} emotion={emotion} size={size} animate showLabel />;
}

export default function FeelingsDetective({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');     // intro | playing | feedback | done
  const [caseIdx, setCaseIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const feedbackTimerRef = useRef(null);

  const { speak, speakSequence, stop } = useVoice(lang);
  const sound = useSound();

  const currentCase = cases[caseIdx];
  const currentQuestion = currentCase?.questions[questionIdx];
  const isLastQuestion = currentCase && questionIdx === currentCase.questions.length - 1;
  const isLastCase = caseIdx === cases.length - 1;

  useEffect(() => () => { stop(); clearTimeout(feedbackTimerRef.current); }, [stop]);

  // Intro narration
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 400);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  // Per-case scene + question narration
  useEffect(() => {
    if (phase !== 'playing' || !currentCase) return;
    const items = [];
    if (questionIdx === 0) {
      items.push({ en: currentCase.scene_en, hi: currentCase.scene_hi });
    }
    items.push({ en: currentQuestion.prompt_en, hi: currentQuestion.prompt_hi });
    const optsEn = currentQuestion.options.map(o => o.label_en).join(', or ');
    const optsHi = currentQuestion.options.map(o => o.label_hi).join(', या ');
    items.push({ en: optsEn, hi: optsHi });
    const t = setTimeout(() => speakSequence(items), 350);
    return () => clearTimeout(t);
  }, [phase, caseIdx, questionIdx, currentCase, currentQuestion, speakSequence]);

  // Done narration
  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.badge.en, TEXT.badge.hi), 400);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const handleChoice = useCallback((opt) => {
    if (phase !== 'playing' || selected) return;
    sound.tap();
    setSelected(opt.key);
    const correct = opt.key === currentQuestion.correct;
    setIsCorrect(correct);

    let speechDone;
    if (correct) {
      setScore(s => s + 1);
      setShowConfetti(true);
      sound.success();
      speechDone = isLastQuestion
        ? speak(currentCase.lesson_en, currentCase.lesson_hi)
        : speak(lang === 'hi' ? 'सही!' : 'Yes! Good thinking!', lang === 'hi' ? 'सही!' : 'Yes! Good thinking!');
    } else {
      sound.gentle();
      const correctOpt = currentQuestion.options.find(o => o.key === currentQuestion.correct);
      speechDone = speak(
        `Hmm, look closely. The answer is: ${correctOpt.label_en}. ${isLastQuestion ? currentCase.lesson_en : ''}`,
        `देखो ध्यान से। जवाब है: ${correctOpt.label_hi}। ${isLastQuestion ? currentCase.lesson_hi : ''}`,
      );
    }

    setPhase('feedback');
    const minDelay = new Promise(r => { feedbackTimerRef.current = setTimeout(r, 1500); });
    Promise.all([speechDone, minDelay]).then(() => {
      setShowConfetti(false);
      setSelected(null);
      if (!isLastQuestion) {
        setQuestionIdx(q => q + 1);
        setPhase('playing');
      } else if (!isLastCase) {
        setCaseIdx(c => c + 1);
        setQuestionIdx(0);
        setPhase('playing');
      } else {
        setShowConfetti(true);
        setPhase('done');
      }
    });
  }, [phase, selected, currentQuestion, currentCase, isLastQuestion, isLastCase, speak, sound, lang]);

  const handleStart = () => { sound.pop(); stop(); setPhase('playing'); };
  const handleReplay = () => {
    stop();
    setCaseIdx(0); setQuestionIdx(0); setScore(0); setSelected(null);
    setShowConfetti(false); setPhase('intro');
  };

  const bg = 'bg-gradient-to-b from-[#FFF0D4] via-[#FFE0D6] to-[#FFD0E0]';

  // ---- INTRO ----
  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="relative animate-bounce-in">
            <Guddu emotion="happy" size={180} animate />
            {/* Detective hat */}
            <div className="absolute" style={{ top: -10, left: '50%', transform: 'translateX(-50%)' }}>
              <span className="text-5xl">{'\u{1F575}\u{FE0F}\u200D\u2642\u{FE0F}'}</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={handleStart} className="mt-2 px-10 py-4 rounded-full bg-[#FFCB05] text-gray-800 text-xl font-bold shadow-lg animate-pulse-glow active:scale-90 transition-transform">
            {TEXT.start[lang]}
          </button>
        </div>
      </GameShell>
    );
  }

  // ---- DONE ----
  if (phase === 'done') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <Celebration active={showConfetti} type="confetti" />
        <Celebration active={showConfetti} type="stars" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-6xl animate-bounce-in">{'\u{1F50D}'}</div>
          <Guddu emotion="celebrating" size={170} animate />
          <div className="text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-gray-800">{lang === 'hi' ? 'बधाई हो!' : 'Mystery Solved!'}</h2>
            <p className="text-gray-600 text-base mt-1">{TEXT.badge[lang]}</p>
            <p className="text-amber-600 text-sm font-bold mt-2">{lang === 'hi' ? `${cases.length} में से ${score} सही!` : `${score} of ${cases.reduce((n,c) => n + c.questions.length, 0)} clues correct!`}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleReplay} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Your child is learning that emotions are complex. When they say 'I feel happy AND sad,' validate BOTH. Resist the urge to simplify their emotional experience."
            tipHi="आपका बच्चा सीख रहा है कि भावनाएँ जटिल हो सकती हैं। जब वे कहें 'मैं खुश और उदास दोनों हूँ', दोनों को मान्यता दें। उनके अनुभव को सरल बनाने से बचें।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  // ---- PLAYING / FEEDBACK ----
  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={caseIdx} totalRounds={cases.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />

      <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
        {/* Case title */}
        <div className="text-center text-sm font-bold text-gray-500">
          {lang === 'hi' ? `केस ${caseIdx + 1}: ${currentCase.title_hi}` : `Case ${caseIdx + 1}: ${currentCase.title_en}`}
        </div>

        {/* Scene description */}
        <div className="bg-white/85 rounded-2xl px-5 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold animate-bounce-in" key={`scene-${caseIdx}`}>
          {lang === 'hi' ? currentCase.scene_hi : currentCase.scene_en}
        </div>

        {/* Characters */}
        <div className="flex justify-center gap-2 flex-wrap" key={`chars-${caseIdx}`}>
          {currentCase.characters.map((tk, i) => (
            <div key={i} className="animate-bounce-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <CharacterRenderer token={tk} size={90} />
            </div>
          ))}
        </div>

        {/* Question */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 shadow-sm animate-bounce-in" key={`q-${caseIdx}-${questionIdx}`}>
          <p className="text-sm font-bold text-amber-900 text-center">
            {lang === 'hi' ? currentQuestion.prompt_hi : currentQuestion.prompt_en}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2 pb-4">
          {currentQuestion.options.map((opt) => {
            const chosen = selected === opt.key;
            const isAnswer = opt.key === currentQuestion.correct;
            let cls = 'bg-white border-gray-200 text-gray-700';
            if (phase === 'feedback') {
              if (isAnswer) cls = 'bg-green-100 border-green-400 text-green-800 scale-105';
              else if (chosen) cls = 'bg-orange-50 border-orange-300 text-orange-700';
            }
            return (
              <button
                key={opt.key}
                onClick={() => handleChoice(opt)}
                disabled={phase === 'feedback'}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold text-base shadow-sm transition-all active:scale-95 ${cls}`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="flex-1">{lang === 'hi' ? opt.label_hi : opt.label_en}</span>
              </button>
            );
          })}
        </div>

        {/* Lesson on last question feedback */}
        {phase === 'feedback' && isLastQuestion && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl px-4 py-3 text-center text-purple-900 text-sm font-semibold animate-bounce-in">
            {lang === 'hi' ? currentCase.lesson_hi : currentCase.lesson_en}
          </div>
        )}
      </div>
    </GameShell>
  );
}
