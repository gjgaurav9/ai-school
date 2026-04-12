import { useState, useEffect, useCallback, useRef } from 'react';
import Guddu from '../common/Guddu';
import Celebration from '../common/Celebration';
import GameShell from '../common/GameShell';
import ParentTip from '../common/ParentTip';
import { useVoice } from '../../hooks/useVoice';
import { useSound } from '../../hooks/useSound';
import emotions from '../../data/emotions.json';

const TOTAL_ROUNDS = 5;

// ---------------------------------------------------------------------------
// Bilingual text helpers
// ---------------------------------------------------------------------------
const TEXT = {
  title: { en: 'Mood Mirror', hi: 'मूड मिरर' },
  introGreet: {
    en: (name) => name ? `Hi ${name}! I'm Guddu! Can you tell how I feel?` : "Hi! I'm Guddu! Can you tell how I feel?",
    hi: (name) => name ? `नमस्ते ${name}! मैं गुड्डू हूँ! क्या तुम बता सकते हो मुझे कैसा लग रहा है?` : 'नमस्ते! मैं गुड्डू हूँ! क्या तुम बता सकते हो मुझे कैसा लग रहा है?',
  },
  play: { en: "Let's Play!", hi: 'खेलते हैं!' },
  correctPrefix: {
    en: (e) => `Yes! Guddu is ${e.toUpperCase()}!`,
    hi: (e) => {
      const map = { happy: 'खुश', sad: 'उदास', angry: 'गुस्सा', scared: 'डरा हुआ', surprised: 'हैरान' };
      return `हाँ! गुड्डू ${map[e] || e} है!`;
    },
  },
  incorrectPrefix: {
    en: (correct) => {
      const cues = {
        happy: 'See his big smile!',
        sad: 'See his droopy eyes!',
        angry: 'See his furrowed brows!',
        scared: 'See his wide eyes!',
        surprised: 'See his big eyes!',
      };
      return `Good try! Guddu is actually ${correct.toUpperCase()}! ${cues[correct] || ''}`;
    },
    hi: (correct) => {
      const map = { happy: 'खुश', sad: 'उदास', angry: 'गुस्सा', scared: 'डरा हुआ', surprised: 'हैरान' };
      const cues = {
        happy: 'देखो उसकी बड़ी मुस्कान!',
        sad: 'देखो उसकी उदास आँखें!',
        angry: 'देखो उसकी तनी हुई भौहें!',
        scared: 'देखो उसकी बड़ी-बड़ी आँखें!',
        surprised: 'देखो उसकी बड़ी-बड़ी आँखें!',
      };
      return `अच्छा प्रयास! गुड्डू असल में ${map[correct] || correct} है! ${cues[correct] || ''}`;
    },
  },
  howFeel: { en: 'How is Guddu feeling?', hi: 'गुड्डू को कैसा लग रहा है?' },
  amazing: {
    en: (name) => name ? `${name}, you did amazing!` : 'Amazing job!',
    hi: (name) => name ? `${name}, बहुत बढ़िया!` : 'बहुत बढ़िया!',
  },
  youFound: {
    en: (n, name) => name ? `${name}, you found ${n} out of ${TOTAL_ROUNDS} emotions!` : `You found ${n} out of ${TOTAL_ROUNDS} emotions!`,
    hi: (n, name) => name ? `${name}, तुमने ${TOTAL_ROUNDS} में से ${n} भावनाएँ पहचानीं!` : `तुमने ${TOTAL_ROUNDS} में से ${n} भावनाएँ पहचानीं!`,
  },
  playAgain: { en: 'Play Again', hi: 'फिर खेलें' },
  goBack: { en: 'Back Home', hi: 'वापस जाएँ' },
  emotionLabels: {
    en: { happy: 'Happy', sad: 'Sad', angry: 'Angry', scared: 'Scared', surprised: 'Surprised' },
    hi: { happy: 'खुश', sad: 'उदास', angry: 'गुस्सा', scared: 'डरा', surprised: 'हैरान' },
  },
};

const t = (key, lang) => (TEXT[key]?.[lang] ?? TEXT[key]?.en ?? '');

// ---------------------------------------------------------------------------
// SVG emotion faces for option buttons
// ---------------------------------------------------------------------------
function EmotionFace({ emotion, size = 90 }) {
  const r = size / 2;
  const bgColors = {
    happy: '#FFD93D',
    sad: '#74B9FF',
    angry: '#FF6B6B',
    scared: '#A29BFE',
    surprised: '#FFEAA7',
  };
  const bg = bgColors[emotion] || '#E0E0E0';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Face circle */}
      <circle cx={r} cy={r} r={r - 2} fill={bg} stroke="#0002" strokeWidth={2} />

      {/* --- Per-emotion details --- */}
      {emotion === 'happy' && (
        <>
          {/* Crinkled eyes - happy arcs */}
          <path d={`M ${r - 18} ${r - 10} Q ${r - 13} ${r - 18} ${r - 8} ${r - 10}`}
            fill="none" stroke="#333" strokeWidth={2.5} strokeLinecap="round" />
          <path d={`M ${r + 8} ${r - 10} Q ${r + 13} ${r - 18} ${r + 18} ${r - 10}`}
            fill="none" stroke="#333" strokeWidth={2.5} strokeLinecap="round" />
          {/* Big smile */}
          <path d={`M ${r - 16} ${r + 6} Q ${r} ${r + 26} ${r + 16} ${r + 6}`}
            fill="none" stroke="#333" strokeWidth={2.5} strokeLinecap="round" />
        </>
      )}

      {emotion === 'sad' && (
        <>
          {/* Droopy eyes */}
          <ellipse cx={r - 13} cy={r - 6} rx={4} ry={5} fill="#333" />
          <ellipse cx={r + 13} cy={r - 6} rx={4} ry={5} fill="#333" />
          {/* Droopy eyebrows */}
          <line x1={r - 20} y1={r - 16} x2={r - 8} y2={r - 14}
            stroke="#333" strokeWidth={2} strokeLinecap="round" />
          <line x1={r + 8} y1={r - 14} x2={r + 20} y2={r - 16}
            stroke="#333" strokeWidth={2} strokeLinecap="round" />
          {/* Turned-down mouth */}
          <path d={`M ${r - 12} ${r + 12} Q ${r} ${r + 2} ${r + 12} ${r + 12}`}
            fill="none" stroke="#333" strokeWidth={2.5} strokeLinecap="round" />
          {/* Tear */}
          <ellipse cx={r - 9} cy={r + 2} rx={2} ry={3} fill="#5B9BD5" opacity={0.7} />
        </>
      )}

      {emotion === 'angry' && (
        <>
          {/* Furrowed brows */}
          <line x1={r - 20} y1={r - 12} x2={r - 6} y2={r - 18}
            stroke="#333" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={r + 6} y1={r - 18} x2={r + 20} y2={r - 12}
            stroke="#333" strokeWidth={2.5} strokeLinecap="round" />
          {/* Eyes */}
          <circle cx={r - 13} cy={r - 5} r={4} fill="#333" />
          <circle cx={r + 13} cy={r - 5} r={4} fill="#333" />
          {/* Tight mouth */}
          <line x1={r - 12} y1={r + 12} x2={r + 12} y2={r + 12}
            stroke="#333" strokeWidth={2.5} strokeLinecap="round" />
        </>
      )}

      {emotion === 'scared' && (
        <>
          {/* Wide eyes */}
          <circle cx={r - 13} cy={r - 6} r={7} fill="white" stroke="#333" strokeWidth={2} />
          <circle cx={r - 13} cy={r - 6} r={3.5} fill="#333" />
          <circle cx={r + 13} cy={r - 6} r={7} fill="white" stroke="#333" strokeWidth={2} />
          <circle cx={r + 13} cy={r - 6} r={3.5} fill="#333" />
          {/* Raised eyebrows */}
          <path d={`M ${r - 20} ${r - 18} Q ${r - 13} ${r - 24} ${r - 6} ${r - 18}`}
            fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
          <path d={`M ${r + 6} ${r - 18} Q ${r + 13} ${r - 24} ${r + 20} ${r - 18}`}
            fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
          {/* Small open mouth */}
          <ellipse cx={r} cy={r + 12} rx={5} ry={6} fill="#333" />
        </>
      )}

      {emotion === 'surprised' && (
        <>
          {/* Wide eyes */}
          <circle cx={r - 13} cy={r - 6} r={7} fill="white" stroke="#333" strokeWidth={2} />
          <circle cx={r - 13} cy={r - 6} r={3.5} fill="#333" />
          <circle cx={r + 13} cy={r - 6} r={7} fill="white" stroke="#333" strokeWidth={2} />
          <circle cx={r + 13} cy={r - 6} r={3.5} fill="#333" />
          {/* Raised eyebrows */}
          <path d={`M ${r - 20} ${r - 18} Q ${r - 13} ${r - 26} ${r - 6} ${r - 18}`}
            fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
          <path d={`M ${r + 6} ${r - 18} Q ${r + 13} ${r - 26} ${r + 20} ${r - 18}`}
            fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
          {/* Big O mouth */}
          <ellipse cx={r} cy={r + 12} rx={8} ry={10} fill="#333" />
        </>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function MoodMirror({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;

  // State
  const [phase, setPhase] = useState('intro');       // intro | playing | feedback | celebration
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);     // chosen emotion in current round
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [roundResults, setRoundResults] = useState([]); // per-round { correct, chosen, wasCorrect }
  const feedbackTimerRef = useRef(null);

  // Hooks
  const { speak, speakSequence, stop } = useVoice(lang);
  const sound = useSound();

  // Current round data
  const currentRound = emotions[roundIndex] || emotions[0];

  // Derive Guddu's emotion from phase instead of setting it in effects
  const gudduEmotion =
    phase === 'celebration' ? 'celebrating' :
    phase === 'playing' ? currentRound.correct :
    phase === 'feedback' ? currentRound.correct :
    'neutral';

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      stop();
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [stop]);

  // ------ Intro phase: narrate greeting ------
  useEffect(() => {
    if (phase !== 'intro') return;
    const timer = setTimeout(() => {
      speak(TEXT.introGreet.en(childName), TEXT.introGreet.hi(childName));
    }, 400);
    return () => clearTimeout(timer);
  }, [phase, speak, childName]);

  // ------ Start of each round: narrate scenario + options ------
  useEffect(() => {
    if (phase !== 'playing') return;
    const optionsEn = currentRound.options.map(e => TEXT.emotionLabels.en[e] || e).join(', ');
    const optionsHi = currentRound.options.map(e => TEXT.emotionLabels.hi[e] || e).join(', ');
    const timer = setTimeout(() => {
      speakSequence([
        { en: currentRound.scenario_en, hi: currentRound.scenario_hi },
        { en: `Is Guddu feeling ${optionsEn}?`, hi: `क्या गुड्डू ${optionsHi} है?` },
      ]);
    }, 400);
    return () => clearTimeout(timer);
  }, [phase, roundIndex, currentRound, speakSequence]);

  // ------ Celebration: trigger sounds & narration ------
  useEffect(() => {
    if (phase !== 'celebration') return;
    sound.celebrate();
    const timer = setTimeout(() => {
      speak(
        `${TEXT.amazing.en(childName)} ${TEXT.youFound.en(score, childName)}`,
        `${TEXT.amazing.hi(childName)} ${TEXT.youFound.hi(score, childName)}`,
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [phase, score, speak, sound, childName]);

  // ------ Handle option selection ------
  const handleChoice = useCallback(
    (chosenEmotion) => {
      if (phase !== 'playing' || selected) return; // prevent double-tap

      sound.tap();
      setSelected(chosenEmotion);

      const correct = chosenEmotion === currentRound.correct;
      setIsCorrect(correct);

      const newResult = { correct: currentRound.correct, chosen: chosenEmotion, wasCorrect: correct };
      setRoundResults((prev) => [...prev, newResult]);

      let speechDone;
      if (correct) {
        setScore((s) => s + 1);
        setShowConfetti(true);
        sound.success();
        speechDone = speak(
          TEXT.correctPrefix.en(currentRound.correct),
          TEXT.correctPrefix.hi(currentRound.correct),
        );
      } else {
        sound.gentle();
        speechDone = speak(
          TEXT.incorrectPrefix.en(currentRound.correct),
          TEXT.incorrectPrefix.hi(currentRound.correct),
        );
      }

      setPhase('feedback');

      // Wait for speech to finish, then advance
      const minDelay = new Promise(r => { feedbackTimerRef.current = setTimeout(r, 1200); });
      Promise.all([speechDone, minDelay]).then(() => {
        setShowConfetti(false);
        setShowStars(false);
        setSelected(null);
        if (roundIndex + 1 < TOTAL_ROUNDS) {
          setRoundIndex((r) => r + 1);
          setPhase('playing');
        } else {
          setShowConfetti(true);
          setShowStars(true);
          setPhase('celebration');
        }
      });
    },
    [phase, selected, currentRound, roundIndex, sound, speak],
  );

  // ------ Start game ------
  const handleStart = useCallback(() => {
    sound.pop();
    stop();
    setPhase('playing');
  }, [sound, stop]);

  // ------ Replay ------
  const handleReplay = useCallback(() => {
    stop();
    setRoundIndex(0);
    setScore(0);
    setSelected(null);
    setRoundResults([]);
    setShowConfetti(false);
    setShowStars(false);
    setPhase('intro');
  }, [stop]);

  // ------ End game ------
  const handleFinish = useCallback(() => {
    stop();
    onComplete?.(score, { rounds: roundResults });
  }, [stop, onComplete, score, roundResults]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Warm afternoon gradient background
  const bgClass = 'bg-gradient-to-b from-[#FFF0D4] via-[#FFE8C8] to-[#FFD6A5]';

  // ---- INTRO ----
  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={t('title', lang)} bg={bgClass}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Guddu waving */}
          <div
            className="animate-bounce-in"
            style={{ animationDelay: '0.1s' }}
          >
            <Guddu emotion="neutral" size={200} animate />
          </div>

          {/* Speech bubble */}
          <div
            className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-lg font-semibold max-w-[280px] animate-bounce-in"
            style={{ animationDelay: '0.4s' }}
          >
            {TEXT.introGreet[lang](childName)}
          </div>

          {/* Play button */}
          <button
            onClick={handleStart}
            className="mt-2 px-10 py-4 rounded-full bg-[#FFCB05] text-gray-800 text-xl font-bold shadow-lg
                       animate-pulse-glow active:scale-90 transition-transform duration-300"
            style={{
              animation: 'pulse-glow 2s infinite, bounce-in 0.5s 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {t('play', lang)}
          </button>
        </div>
      </GameShell>
    );
  }

  // ---- PLAYING & FEEDBACK ----
  if (phase === 'playing' || phase === 'feedback') {
    return (
      <GameShell
        onBack={onBack}
        title={t('title', lang)}
        round={roundIndex}
        totalRounds={TOTAL_ROUNDS}
        bg={bgClass}
      >
        <Celebration active={showConfetti} type="confetti" />
        <Celebration active={showStars} type="stars" />

        <div className="flex-1 flex flex-col items-center justify-between px-4 py-3 gap-3">
          {/* Scenario text */}
          <div
            className="bg-white/80 rounded-2xl px-5 py-3 shadow-sm text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in"
            key={`scenario-${roundIndex}`}
          >
            {lang === 'hi' ? currentRound.scenario_hi : currentRound.scenario_en}
          </div>

          {/* Guddu showing body language */}
          <div
            className="flex-shrink-0 animate-bounce-in"
            key={`guddu-${roundIndex}`}
            style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <Guddu emotion={gudduEmotion} size={200} animate />
          </div>

          {/* Feedback text (shown during feedback phase) */}
          {phase === 'feedback' && (
            <div
              className={`rounded-2xl px-5 py-3 text-center font-bold text-base max-w-[320px] animate-bounce-in ${
                isCorrect
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {isCorrect
                ? TEXT.correctPrefix[lang](currentRound.correct)
                : TEXT.incorrectPrefix[lang](currentRound.correct)}
            </div>
          )}

          {/* "How is Guddu feeling?" prompt */}
          {phase === 'playing' && (
            <p className="text-gray-500 text-sm font-medium">{t('howFeel', lang)}</p>
          )}

          {/* Emotion option buttons */}
          <div className="flex justify-center gap-4 pb-4">
            {currentRound.options.map((emotion) => {
              const isChosen = selected === emotion;
              const isAnswer = emotion === currentRound.correct;
              // During feedback, highlight the correct answer
              let ringClass = '';
              if (phase === 'feedback') {
                if (isAnswer) {
                  ringClass = 'ring-4 ring-green-400 scale-110';
                } else if (isChosen && !isCorrect) {
                  ringClass = 'ring-4 ring-amber-300';
                }
              }

              return (
                <button
                  key={emotion}
                  onClick={() => handleChoice(emotion)}
                  disabled={phase === 'feedback'}
                  className={`flex flex-col items-center gap-1 transition-all duration-300
                    ${phase === 'feedback' ? 'pointer-events-none' : 'active:scale-90'}
                    ${ringClass}`}
                  style={{
                    borderRadius: '50%',
                    minWidth: 80,
                    minHeight: 80,
                  }}
                  aria-label={TEXT.emotionLabels[lang]?.[emotion] || emotion}
                >
                  <div
                    className={`rounded-full overflow-hidden shadow-md transition-all duration-300
                      ${phase === 'feedback' ? '' : 'hover:shadow-lg hover:scale-105'}
                      ${ringClass}`}
                  >
                    <EmotionFace emotion={emotion} size={90} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 mt-0.5">
                    {TEXT.emotionLabels[lang]?.[emotion] || emotion}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </GameShell>
    );
  }

  // ---- CELEBRATION ----
  if (phase === 'celebration') {
    return (
      <GameShell onBack={onBack} title={t('title', lang)} bg={bgClass}>
        <Celebration active={showConfetti} type="confetti" />
        <Celebration active={showStars} type="stars" />

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          {/* Guddu celebrating */}
          <div className="animate-bounce-in">
            <Guddu emotion="celebrating" size={200} animate />
          </div>

          {/* Score message */}
          <div className="text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-gray-800">{TEXT.amazing[lang](childName)}</h2>
            <p className="text-gray-600 text-lg mt-1">
              {TEXT.youFound[lang](score, childName)}
            </p>
          </div>

          {/* Emotion summary - show which emotions were found */}
          <div
            className="flex justify-center gap-3 flex-wrap animate-bounce-in"
            style={{ animationDelay: '0.4s' }}
          >
            {roundResults.map((result, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`rounded-full overflow-hidden shadow-sm transition-all duration-300 ${
                    result.wasCorrect ? 'ring-2 ring-green-400' : 'ring-2 ring-gray-300 opacity-60'
                  }`}
                >
                  <EmotionFace emotion={result.correct} size={50} />
                </div>
                <span className="text-[10px] font-medium text-gray-500">
                  {TEXT.emotionLabels[lang]?.[result.correct] || result.correct}
                </span>
                {result.wasCorrect && (
                  <span className="text-green-500 text-xs">&#9733;</span>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div
            className="flex gap-3 mt-2 animate-bounce-in"
            style={{ animationDelay: '0.6s' }}
          >
            <button
              onClick={handleReplay}
              className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold text-base shadow-md
                         active:scale-90 transition-transform duration-300 min-w-[120px]"
            >
              {t('playAgain', lang)}
            </button>
            <button
              onClick={onBack || handleFinish}
              className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold text-base shadow-md
                         active:scale-90 transition-transform duration-300 min-w-[120px]"
            >
              {t('goBack', lang)}
            </button>
          </div>

          {/* Parent tip */}
          <ParentTip
            tipEn="Tonight at dinner, ask your child: 'What made you happy today? What made you sad?' Naming emotions is the first step to managing them."
            tipHi="आज रात खाने पर अपने बच्चे से पूछें: 'आज तुम्हें किस बात से खुशी हुई? किस बात से दुख हुआ?' भावनाओं को नाम देना उन्हें समझने की पहली सीढ़ी है।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return null;
}
