import { useState, useEffect, useCallback, useRef } from 'react';
import Guddu from '../common/Guddu';
import Celebration from '../common/Celebration';
import GameShell from '../common/GameShell';
import OptionButton from '../common/OptionButton';
import ParentTip from '../common/ParentTip';
import { useVoice } from '../../hooks/useVoice';
import { useSound } from '../../hooks/useSound';
import doctorData from '../../data/doctor-scenarios.json';

/* ────────────────────── SVG Illustrations ────────────────────── */

function DoctorBag({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <rect x="15" y="28" width="50" height="38" rx="6" fill="#E74C3C" />
      <rect x="28" y="18" width="24" height="14" rx="4" fill="none" stroke="#E74C3C" strokeWidth="4" />
      <rect x="35" y="38" width="10" height="18" rx="2" fill="white" />
      <rect x="30" y="43" width="20" height="8" rx="2" fill="white" />
    </svg>
  );
}

function SymptomIcon({ symptom, size = 100 }) {
  const s = size;
  const icons = {
    headache: (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="#FFD93D" />
        {/* Dizzy eyes */}
        <g transform="translate(37,42)">
          <line x1="0" y1="0" x2="10" y2="10" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="10" y1="0" x2="0" y2="10" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <g transform="translate(53,42)">
          <line x1="0" y1="0" x2="10" y2="10" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="10" y1="0" x2="0" y2="10" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <path d="M40 65 Q50 60 60 65" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        {/* Pain stars */}
        <text x="20" y="25" fontSize="16">⚡</text>
        <text x="65" y="25" fontSize="16">⚡</text>
      </svg>
    ),
    tummy_ache: (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="#FFD93D" />
        <circle cx="38" cy="42" r="3.5" fill="#333" />
        <circle cx="62" cy="42" r="3.5" fill="#333" />
        <path d="M38 62 Q50 55 62 62" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        {/* Tummy swirl */}
        <path d="M42 72 Q50 78 58 72" fill="none" stroke="#98D8A0" strokeWidth="3" strokeLinecap="round" />
        <text x="44" y="85" fontSize="12">🤢</text>
      </svg>
    ),
    cold: (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="#FFD93D" />
        <circle cx="38" cy="42" r="3.5" fill="#333" />
        <circle cx="62" cy="42" r="3.5" fill="#333" />
        {/* Red nose */}
        <circle cx="50" cy="52" r="6" fill="#FF6B6B" />
        <path d="M40 64 Q50 70 60 64" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        {/* Sneeze effect */}
        <text x="68" y="55" fontSize="14">🤧</text>
      </svg>
    ),
    mosquito_bite: (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="#FFD93D" />
        <circle cx="38" cy="42" r="3.5" fill="#333" />
        <circle cx="62" cy="42" r="3.5" fill="#333" />
        <path d="M40 62 Q50 68 60 62" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        {/* Bump on arm */}
        <circle cx="25" cy="70" r="8" fill="#FF9999" stroke="#FF6666" strokeWidth="1.5" />
        <text x="20" y="74" fontSize="10">🦟</text>
      </svg>
    ),
    sore_throat: (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="#FFD93D" />
        <circle cx="38" cy="42" r="3.5" fill="#333" />
        <circle cx="62" cy="42" r="3.5" fill="#333" />
        {/* Open mouth showing red throat */}
        <ellipse cx="50" cy="62" rx="10" ry="8" fill="#FF6666" />
        <ellipse cx="50" cy="62" rx="10" ry="8" fill="none" stroke="#333" strokeWidth="2" />
        {/* Pain indicator */}
        <text x="65" y="55" fontSize="12">😣</text>
      </svg>
    ),
  };

  return icons[symptom] || icons.headache;
}

function RemedyIcon({ remedy, size = 50 }) {
  const icons = {
    water: '💧',
    ajwain: '🌿',
    turmeric: '🥛',
    neem: '🍃',
    honey: '🍯',
  };
  return (
    <span style={{ fontSize: size * 0.6 }}>{icons[remedy] || '💊'}</span>
  );
}

function SpeechBubble({ text }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-lg font-semibold max-w-[300px] relative">
      {text}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm" />
    </div>
  );
}

/* ────────────────────── Main Component ────────────────────── */

const TOTAL_ROUNDS = 5;

const PARENT_TIP_EN =
  "Use this game as a starting point to teach your child about simple home remedies. Talk about how grandma and grandpa used natural cures. Always consult a doctor for real illnesses — this game teaches awareness, not treatment.";
const PARENT_TIP_HI =
  "इस खेल को बच्चे को सरल घरेलू नुस्खों के बारे में सिखाने के लिए शुरुआत के रूप में उपयोग करें। बात करें कि दादा-दादी कैसे प्राकृतिक उपचार करते थे। असली बीमारियों के लिए हमेशा डॉक्टर से सलाह लें।";

export default function DoctorGame({ onComplete, onBack, language = 'en', childName = '' }) {
  const [gameState, setGameState] = useState('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [healedPatients, setHealedPatients] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gudduEmotion, setGudduEmotion] = useState('neutral');
  const [disabled, setDisabled] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [nudgeText, setNudgeText] = useState('');
  const [patientHappy, setPatientHappy] = useState(false);

  const { speak, speakSequence, stop } = useVoice(language);
  const { success, tap, celebrate, gentle, pop } = useSound();
  const timeoutsRef = useRef([]);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      stop();
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [stop]);

  const scenario = doctorData[currentRound] || doctorData[0];

  /* ────────── Intro ────────── */
  useEffect(() => {
    if (gameState === 'intro') {
      setGudduEmotion('happy');
      const introEn = childName
        ? `${childName}, welcome to the Little Doctor clinic! Our friends are not feeling well. Can you help them?`
        : "Welcome to the Little Doctor clinic! Our friends are not feeling well. Can you help them?";
      const introHi = childName
        ? `${childName}, छोटे डॉक्टर के क्लिनिक में आपका स्वागत है! हमारे दोस्तों की तबीयत ठीक नहीं है। क्या तुम उनकी मदद कर सकते हो?`
        : "छोटे डॉक्टर के क्लिनिक में आपका स्वागत है! हमारे दोस्तों की तबीयत ठीक नहीं है। क्या तुम उनकी मदद कर सकते हो?";
      speak(introEn, introHi);
      schedule(() => {
        setGameState('playing');
      }, 4000);
    }
  }, [gameState, speak, schedule, childName]);

  /* ────────── Speak scenario + options ────────── */
  useEffect(() => {
    if (gameState === 'playing') {
      setGudduEmotion('neutral');
      setDisabled(false);
      setPatientHappy(false);
      speakSequence([
        { en: scenario.scene_en, hi: scenario.scene_hi },
        { en: `Option 1: ${scenario.kind_option_en}`, hi: `विकल्प 1: ${scenario.kind_option_hi}` },
        { en: `Option 2: ${scenario.neutral_option_en}`, hi: `विकल्प 2: ${scenario.neutral_option_hi}` },
      ]);
    }
  }, [gameState, currentRound, scenario, speakSequence]);

  /* ────────── Handle correct remedy ────────── */
  const handleKindChoice = useCallback(() => {
    if (disabled) return;
    setDisabled(true);
    tap();
    setGudduEmotion('happy');
    setPatientHappy(true);

    const namePrefix = childName ? `${childName}, ` : '';
    const responseTextEn = namePrefix + scenario.kind_response_en;
    const responseTextHi = namePrefix + scenario.kind_response_hi;
    const responseText = language === 'hi' ? responseTextHi : responseTextEn;
    setFeedbackText(responseText);
    setGameState('feedback');
    const speechPromise = speak(responseTextEn, responseTextHi);
    success();

    schedule(() => {
      setHealedPatients(prev => [
        ...prev,
        { remedy: scenario.remedy, label: { en: scenario.label_en, hi: scenario.label_hi } },
      ]);
      pop();
    }, 600);

    schedule(() => {
      setGudduEmotion('celebrating');
      setShowCelebration(true);
    }, 1800);

    speechPromise.then(() => {
      schedule(() => {
        setShowCelebration(false);
        if (currentRound < TOTAL_ROUNDS - 1) {
          setCurrentRound(prev => prev + 1);
          setGameState('playing');
          setFeedbackText('');
        } else {
          setGameState('clinic_reveal');
          celebrate();
          setGudduEmotion('celebrating');
        }
      }, 800);
    });
  }, [
    disabled, tap, language, scenario, speak, success, pop, celebrate,
    healedPatients.length, currentRound, schedule, childName,
  ]);

  /* ────────── Handle wrong choice ────────── */
  const handleNeutralChoice = useCallback(() => {
    if (disabled) return;
    setDisabled(true);
    tap();
    setGudduEmotion('sad');
    gentle();

    const nudge = language === 'hi' ? scenario.nudge_hi : scenario.nudge_en;
    setNudgeText(nudge);
    setGameState('nudge');
    speak(scenario.nudge_en, scenario.nudge_hi);

    schedule(() => {
      setDisabled(false);
    }, 2000);
  }, [disabled, tap, language, scenario, speak, gentle, schedule]);

  /* ────────── Nudge retry ────────── */
  const handleNudgeRetry = useCallback(() => {
    setNudgeText('');
    setGameState('playing');
  }, []);

  /* ────────── Repeat the current question ────────── */
  const handleRepeatQuestion = useCallback(() => {
    speakSequence([
      { en: scenario.scene_en, hi: scenario.scene_hi },
      { en: `Option 1: ${scenario.kind_option_en}`, hi: `विकल्प 1: ${scenario.kind_option_hi}` },
      { en: `Option 2: ${scenario.neutral_option_en}`, hi: `विकल्प 2: ${scenario.neutral_option_hi}` },
    ]);
  }, [scenario, speakSequence]);

  /* ────────── Clinic reveal voice ────────── */
  useEffect(() => {
    if (gameState === 'clinic_reveal') {
      const revealEn = childName
        ? `${childName}, you are an amazing little doctor! You helped all your friends feel better!`
        : "You are an amazing little doctor! You helped all your friends feel better!";
      const revealHi = childName
        ? `${childName}, तुम एक शानदार छोटे डॉक्टर हो! तुमने सभी दोस्तों को ठीक किया!`
        : "तुम एक शानदार छोटे डॉक्टर हो! तुमने सभी दोस्तों को ठीक किया!";
      speak(revealEn, revealHi);
    }
  }, [gameState, speak, childName]);

  /* ────────── Render ────────── */

  const sceneText = language === 'hi' ? scenario.scene_hi : scenario.scene_en;
  const kindText = language === 'hi' ? scenario.kind_option_hi : scenario.kind_option_en;
  const neutralText = language === 'hi' ? scenario.neutral_option_hi : scenario.neutral_option_en;

  return (
    <GameShell
      onBack={onBack}
      title={language === 'hi' ? 'छोटा डॉक्टर' : 'Little Doctor'}
      round={gameState === 'clinic_reveal' ? TOTAL_ROUNDS : currentRound}
      totalRounds={TOTAL_ROUNDS}
      bg="bg-gradient-to-b from-blue-100 via-blue-50 to-green-100"
    >
      <Celebration active={showCelebration} type="stars" />

      <div className="flex-1 flex flex-col relative overflow-hidden">

        {/* ────── INTRO ────── */}
        {gameState === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4 animate-bounce-in">
            <SpeechBubble
              text={
                language === 'hi'
                  ? (childName
                    ? `${childName}, छोटे डॉक्टर के क्लिनिक में स्वागत है! चलो दोस्तों को ठीक करें!`
                    : 'छोटे डॉक्टर के क्लिनिक में स्वागत है! चलो दोस्तों को ठीक करें!')
                  : (childName
                    ? `${childName}, welcome to the Little Doctor clinic! Let's help our friends!`
                    : "Welcome to the Little Doctor clinic! Let's help our friends!")
              }
            />
            <div className="relative">
              <Guddu emotion="happy" size={160} animate />
              <div className="absolute -bottom-2 -right-2">
                <DoctorBag size={60} />
              </div>
            </div>
          </div>
        )}

        {/* ────── PLAYING / NUDGE / FEEDBACK ────── */}
        {(gameState === 'playing' || gameState === 'nudge' || gameState === 'feedback') && (
          <div className="flex-1 flex flex-col">
            {/* Symptom + speech bubble */}
            <div className="flex flex-col items-center pt-2 px-4">
              <SpeechBubble
                text={
                  gameState === 'feedback'
                    ? feedbackText
                    : gameState === 'nudge'
                      ? nudgeText
                      : sceneText
                }
              />
              <div className="mt-3 relative">
                <SymptomIcon symptom={scenario.symptom} size={100} />
                {patientHappy && (
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="px-5 mt-4 space-y-3">
              {gameState === 'nudge' ? (
                <OptionButton
                  onClick={handleNudgeRetry}
                  icon="💊"
                  variant="kind"
                >
                  {language === 'hi' ? 'फिर से सोचो!' : "Let's try again!"}
                </OptionButton>
              ) : (
                <>
                  <OptionButton
                    onClick={handleKindChoice}
                    number={1}
                    disabled={disabled}
                  >
                    {kindText}
                  </OptionButton>
                  <OptionButton
                    onClick={handleNeutralChoice}
                    number={2}
                    disabled={disabled}
                  >
                    {neutralText}
                  </OptionButton>

                  {/* Repeat question button */}
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={handleRepeatQuestion}
                      disabled={disabled}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-gray-200 shadow-sm text-gray-500 text-sm font-semibold active:scale-95 transition-transform disabled:opacity-40"
                      aria-label={language === 'hi' ? 'सवाल दोहराएं' : 'Repeat question'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                      {language === 'hi' ? 'फिर सुनें' : 'Repeat'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Healed patients at bottom */}
            <div className="mt-auto px-4 py-3">
              <div className="flex justify-center gap-3">
                {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
                  const healed = healedPatients[i];
                  return (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        healed
                          ? 'border-green-400 bg-green-50 scale-110'
                          : 'border-dashed border-gray-300 bg-white/50'
                      }`}
                    >
                      {healed ? (
                        <RemedyIcon remedy={healed.remedy} size={40} />
                      ) : (
                        <span className="text-gray-300 text-lg">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ────── CLINIC REVEAL ────── */}
        {gameState === 'clinic_reveal' && (
          <div className="flex-1 flex flex-col items-center px-4 pt-4">
            <Celebration active type="confetti" />

            <h2 className="text-xl font-bold text-green-700 mb-3">
              {language === 'hi' ? '🏥 सभी दोस्त ठीक हो गए!' : '🏥 All Friends Healed!'}
            </h2>

            {/* Remedies learned */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {healedPatients.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 animate-bounce-in"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
                    <RemedyIcon remedy={h.remedy} size={48} />
                  </div>
                  <span className="text-[10px] font-bold text-green-700 text-center leading-tight">
                    {language === 'hi' ? h.label.hi : h.label.en}
                  </span>
                </div>
              ))}
            </div>

            <Guddu emotion="celebrating" size={140} animate />

            <p className="text-sm text-gray-600 font-medium text-center mt-2 mb-3">
              {language === 'hi'
                ? 'तुमने ये घरेलू नुस्खे सीखे!'
                : 'You learned these home remedies!'}
            </p>

            <ParentTip tipEn={PARENT_TIP_EN} tipHi={PARENT_TIP_HI} language={language} />

            <div className="flex gap-3 mt-3 mb-4">
              <button
                onClick={() => {
                  stop();
                  setCurrentRound(0);
                  setHealedPatients([]);
                  setGameState('intro');
                  setShowCelebration(false);
                  setFeedbackText('');
                  setNudgeText('');
                  setPatientHappy(false);
                }}
                className="px-6 py-3 rounded-full bg-blue-400 text-white font-bold shadow-md active:scale-95 transition-transform"
              >
                {language === 'hi' ? 'फिर खेलें' : 'Play Again'}
              </button>
              <button
                onClick={() => {
                  stop();
                  onComplete?.({});
                }}
                className="px-6 py-3 rounded-full bg-gray-300 text-gray-700 font-bold shadow-md active:scale-95 transition-transform"
              >
                {language === 'hi' ? 'वापस जाएँ' : 'Back Home'}
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
