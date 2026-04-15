import { useState, useEffect, useCallback, useRef } from 'react';
import Guddu from '../common/Guddu';
import Celebration from '../common/Celebration';
import GameShell from '../common/GameShell';
import OptionButton from '../common/OptionButton';
import ParentTip from '../common/ParentTip';
import { useVoice } from '../../hooks/useVoice';
import { useSound } from '../../hooks/useSound';
import kindnessData from '../../data/kindness.json';

/* ────────────────────── SVG Flower Components ────────────────────── */

function Sunflower({ size = 60 }) {
  const petalCount = 10;
  const r = size * 0.22;
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: petalCount }, (_, i) => {
        const angle = (360 / petalCount) * i;
        return (
          <ellipse
            key={i}
            cx={center}
            cy={center - r}
            rx={size * 0.09}
            ry={size * 0.18}
            fill="#FFD700"
            transform={`rotate(${angle} ${center} ${center})`}
          />
        );
      })}
      <circle cx={center} cy={center} r={size * 0.15} fill="#8B4513" />
      <circle cx={center} cy={center} r={size * 0.1} fill="#A0522D" />
    </svg>
  );
}

function Rose({ size = 60 }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer petals */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={`outer-${i}`}
          cx={c}
          cy={c - size * 0.15}
          rx={size * 0.13}
          ry={size * 0.2}
          fill="#E74C3C"
          transform={`rotate(${angle} ${c} ${c})`}
        />
      ))}
      {/* Inner petals */}
      {[36, 108, 180, 252, 324].map((angle, i) => (
        <ellipse
          key={`inner-${i}`}
          cx={c}
          cy={c - size * 0.1}
          rx={size * 0.09}
          ry={size * 0.14}
          fill="#C0392B"
          transform={`rotate(${angle} ${c} ${c})`}
        />
      ))}
      <circle cx={c} cy={c} r={size * 0.07} fill="#922B21" />
    </svg>
  );
}

function Marigold({ size = 60 }) {
  const c = size / 2;
  const petalCount = 14;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: petalCount }, (_, i) => {
        const angle = (360 / petalCount) * i;
        return (
          <ellipse
            key={i}
            cx={c}
            cy={c - size * 0.17}
            rx={size * 0.07}
            ry={size * 0.17}
            fill={i % 2 === 0 ? '#FF8C00' : '#FFA500'}
            transform={`rotate(${angle} ${c} ${c})`}
          />
        );
      })}
      <circle cx={c} cy={c} r={size * 0.12} fill="#FF6600" />
    </svg>
  );
}

function Lotus({ size = 60 }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Water base */}
      <ellipse cx={c} cy={size * 0.8} rx={size * 0.4} ry={size * 0.08} fill="#87CEEB" opacity={0.5} />
      {/* Outer petals */}
      {[-40, -20, 0, 20, 40].map((angle, i) => (
        <ellipse
          key={`outer-${i}`}
          cx={c}
          cy={c - size * 0.08}
          rx={size * 0.1}
          ry={size * 0.22}
          fill="#FFB6C1"
          transform={`rotate(${angle} ${c} ${c + size * 0.1})`}
        />
      ))}
      {/* Inner petals */}
      {[-15, 0, 15].map((angle, i) => (
        <ellipse
          key={`inner-${i}`}
          cx={c}
          cy={c - size * 0.03}
          rx={size * 0.07}
          ry={size * 0.16}
          fill="#FF69B4"
          transform={`rotate(${angle} ${c} ${c + size * 0.1})`}
        />
      ))}
      <circle cx={c} cy={c + size * 0.05} r={size * 0.06} fill="#FFD700" />
    </svg>
  );
}

function Jasmine({ size = 60 }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx={c}
          cy={c - size * 0.15}
          rx={size * 0.1}
          ry={size * 0.17}
          fill="white"
          stroke="#E0E0E0"
          strokeWidth={0.5}
          transform={`rotate(${angle} ${c} ${c})`}
        />
      ))}
      <circle cx={c} cy={c} r={size * 0.08} fill="#FFFACD" />
    </svg>
  );
}

const FLOWER_COMPONENTS = { sunflower: Sunflower, rose: Rose, marigold: Marigold, lotus: Lotus, jasmine: Jasmine };

/* ────────────────────── Butterfly Component ────────────────────── */

function Butterfly({ delay = 0, color = '#E91E8C' }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        animation: `butterfly-drift ${6 + delay * 2}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        top: `${15 + delay * 12}%`,
        left: `${10 + delay * 18}%`,
      }}
    >
      <svg width="28" height="20" viewBox="0 0 28 20">
        <g className="animate-butterfly-wings">
          <ellipse cx="8" cy="8" rx="7" ry="6" fill={color} opacity={0.8}>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 14 10;30 14 10;0 14 10"
              dur="0.4s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="20" cy="8" rx="7" ry="6" fill={color} opacity={0.8}>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 14 10;-30 14 10;0 14 10"
              dur="0.4s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
        <ellipse cx="14" cy="12" rx="1.2" ry="5" fill="#333" />
      </svg>
    </div>
  );
}

/* ────────────────────── Garden Patch + Growing Flower ────────────────────── */

function GardenPatch({ index, planted, flowerType, label, growing, totalPatches, language }) {
  // Position patches in a gentle arc
  const patchWidth = 100 / (totalPatches + 1);
  const xPos = patchWidth * (index + 1);
  const arcOffset = Math.sin(((index + 1) / (totalPatches + 1)) * Math.PI) * 12;

  const FlowerSVG = flowerType ? FLOWER_COMPONENTS[flowerType] : null;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${xPos}%`,
        bottom: `${8 + arcOffset}%`,
        transform: 'translateX(-50%)',
        width: '18%',
      }}
    >
      {/* Flower + stem area */}
      <div className="relative flex flex-col items-center" style={{ minHeight: 100 }}>
        {planted && FlowerSVG && (
          <>
            {/* Flower head */}
            <div
              className={growing ? 'animate-bounce-in' : ''}
              style={{
                animationDelay: growing ? '0.5s' : '0s',
                opacity: growing ? 0 : 1,
                animationFillMode: 'forwards',
              }}
            >
              <FlowerSVG size={48} />
            </div>

            {/* Stem */}
            <div
              className="w-1 rounded-full bg-green-500 origin-bottom"
              style={{
                height: 36,
                animation: growing ? 'grow-flower 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
                transformOrigin: 'bottom',
              }}
            />

            {/* Leaves */}
            <div
              className="absolute flex justify-between"
              style={{
                top: 52,
                width: 30,
                opacity: growing ? 0 : 1,
                animation: growing ? 'bounce-in 0.4s 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
              }}
            >
              <svg width="12" height="10" viewBox="0 0 12 10">
                <ellipse cx="3" cy="5" rx="5" ry="4" fill="#4CAF50" transform="rotate(-30 3 5)" />
              </svg>
              <svg width="12" height="10" viewBox="0 0 12 10">
                <ellipse cx="9" cy="5" rx="5" ry="4" fill="#4CAF50" transform="rotate(30 9 5)" />
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Soil mound */}
      <div
        className={`w-14 h-5 rounded-t-full ${growing ? 'animate-wiggle' : ''}`}
        style={{ backgroundColor: '#8B6914' }}
      />

      {/* Label (only in garden reveal) */}
      {planted && label && (
        <span className="text-xs font-bold text-green-800 mt-1 text-center leading-tight">
          {language === 'hi' ? label.hi : label.en}
        </span>
      )}
    </div>
  );
}

/* ────────────────────── Speech Bubble ────────────────────── */

function SpeechBubble({ text }) {
  return (
    <div className="relative bg-white rounded-2xl px-5 py-4 shadow-md mx-4 mb-2 max-w-[320px]">
      <p className="text-base font-semibold text-gray-700 leading-snug text-center">{text}</p>
      {/* Tail */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '10px solid white',
        }}
      />
    </div>
  );
}

/* ────────────────────── Watering Can (for intro) ────────────────────── */

function WateringCan() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" className="absolute -right-3 top-1/3">
      <rect x="8" y="14" width="20" height="16" rx="4" fill="#4FC3F7" />
      <rect x="24" y="8" width="4" height="10" rx="2" fill="#29B6F6" />
      <line x1="28" y1="8" x2="36" y2="2" stroke="#29B6F6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="36" cy="2" r="2" fill="#81D4FA" />
      <circle cx="34" cy="5" r="1.5" fill="#81D4FA" />
      <circle cx="37" cy="5" r="1" fill="#81D4FA" />
    </svg>
  );
}

/* ────────────────────── Seed Drop Animation ────────────────────── */

function SeedDrop({ active, targetIndex, totalPatches }) {
  if (!active) return null;

  const patchWidth = 100 / (totalPatches + 1);
  const xPos = patchWidth * (targetIndex + 1);

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        left: `${xPos}%`,
        top: '30%',
        transform: 'translateX(-50%)',
        animation: 'seed-drop 0.6s ease-in forwards',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16">
        <ellipse cx="8" cy="8" rx="5" ry="7" fill="#8B6914" />
        <ellipse cx="8" cy="7" rx="3" ry="4" fill="#A0822D" />
      </svg>
    </div>
  );
}

/* ────────────────────── Main Component ────────────────────── */

const TOTAL_ROUNDS = 5;

const PARENT_TIP_EN =
  "Start a 'kindness journal' \u2014 before bed, ask your child to name one kind thing they did today and one kind thing someone did for them. This builds gratitude AND empathy.";
const PARENT_TIP_HI =
  "'दयालुता डायरी' शुरू करें \u2014 सोने से पहले, अपने बच्चे से पूछें कि आज उन्होंने एक अच्छा काम क्या किया और किसी ने उनके लिए क्या अच्छा किया। इससे कृतज्ञता और सहानुभूति दोनों बनती हैं।";

export default function KindnessSeeds({ onComplete, onBack, language = 'en', childName = '' }) {
  const [gameState, setGameState] = useState('intro'); // intro | playing | nudge | feedback | garden_reveal
  const [currentRound, setCurrentRound] = useState(0);
  const [plantedFlowers, setPlantedFlowers] = useState([]); // array of { type, label: { en, hi } }
  const [growingIndex, setGrowingIndex] = useState(null);
  const [seedDropping, setSeedDropping] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gudduEmotion, setGudduEmotion] = useState('neutral');
  const [disabled, setDisabled] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [nudgeText, setNudgeText] = useState('');

  const { speak, speakSequence, stop } = useVoice(language);
  const { success, tap, celebrate, gentle, pop } = useSound();
  const timeoutsRef = useRef([]);

  // Helper to schedule a timeout and track it for cleanup
  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      stop();
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [stop]);

  const scenario = kindnessData[currentRound] || kindnessData[0];

  /* ────────── Intro ────────── */
  useEffect(() => {
    if (gameState === 'intro') {
      setGudduEmotion('happy');
      const introEn = childName
        ? `${childName}, welcome to the Kindness Garden! Let's plant flowers by being kind!`
        : "Welcome to the Kindness Garden! Let's plant flowers by being kind!";
      const introHi = childName
        ? `${childName}, दयालुता के बगीचे में आपका स्वागत है! चलो दयालु बनकर फूल लगाते हैं!`
        : "दयालुता के बगीचे में आपका स्वागत है! चलो दयालु बनकर फूल लगाते हैं!";
      speak(introEn, introHi);
      schedule(() => {
        setGameState('playing');
      }, 3000);
    }
  }, [gameState, speak, schedule]);

  /* ────────── Speak scenario text + options when round changes ────────── */
  useEffect(() => {
    if (gameState === 'playing') {
      setGudduEmotion('neutral');
      setDisabled(false);
      speakSequence([
        { en: scenario.scene_en, hi: scenario.scene_hi },
        { en: `Option 1: ${scenario.kind_option_en}`, hi: `विकल्प 1: ${scenario.kind_option_hi}` },
        { en: `Option 2: ${scenario.neutral_option_en}`, hi: `विकल्प 2: ${scenario.neutral_option_hi}` },
      ]);
    }
  }, [gameState, currentRound, scenario, speakSequence]);

  /* ────────── Handle Kind Choice ────────── */
  const handleKindChoice = useCallback(() => {
    if (disabled) return;
    setDisabled(true);
    tap();
    setGudduEmotion('happy');

    const namePrefix = childName ? `${childName}, ` : '';
    const responseTextEn = namePrefix + scenario.kind_response_en;
    const responseTextHi = namePrefix + scenario.kind_response_hi;
    const responseText = language === 'hi' ? responseTextHi : responseTextEn;
    setFeedbackText(responseText);
    setGameState('feedback');
    const speechDone = speak(responseTextEn, responseTextHi);
    success();

    // Seed drop animation
    setSeedDropping(true);
    schedule(() => {
      setSeedDropping(false);
      // Plant the flower and trigger growing animation
      const flowerIndex = plantedFlowers.length;
      setPlantedFlowers(prev => [
        ...prev,
        { type: scenario.flower, label: { en: scenario.label_en, hi: scenario.label_hi } },
      ]);
      setGrowingIndex(flowerIndex);
      pop();
    }, 600);

    // After flower grows, move to next round or garden reveal
    schedule(() => {
      setGrowingIndex(null);
      setGudduEmotion('celebrating');
      setShowCelebration(true);
    }, 1800);

    // Wait for BOTH speech to finish AND a minimum delay before advancing
    const minDelay = new Promise(resolve => setTimeout(resolve, 3200));
    Promise.all([speechDone, minDelay]).then(() => {
      setShowCelebration(false);
      if (currentRound < TOTAL_ROUNDS - 1) {
        setCurrentRound(prev => prev + 1);
        setGameState('playing');
        setFeedbackText('');
      } else {
        setGameState('garden_reveal');
        celebrate();
        setGudduEmotion('celebrating');
      }
    });
  }, [
    disabled, tap, language, scenario, speak, success, pop, celebrate,
    plantedFlowers.length, currentRound, schedule, childName,
  ]);

  /* ────────── Handle Neutral Choice ────────── */
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

    // Re-enable after nudge so they can try again
    schedule(() => {
      setDisabled(false);
    }, 2000);
  }, [disabled, tap, language, scenario, speak, gentle, schedule]);

  /* ────────── Handle trying again after nudge (always the kind choice) ────────── */
  const handleNudgeRetry = useCallback(() => {
    setNudgeText('');
    setGameState('playing');
    // Small pause then auto-progress to kind choice is not needed;
    // just let them tap the kind option again
  }, []);

  /* ────────── Repeat the current question ────────── */
  const handleRepeatQuestion = useCallback(() => {
    speakSequence([
      { en: scenario.scene_en, hi: scenario.scene_hi },
      { en: `Option 1: ${scenario.kind_option_en}`, hi: `विकल्प 1: ${scenario.kind_option_hi}` },
      { en: `Option 2: ${scenario.neutral_option_en}`, hi: `विकल्प 2: ${scenario.neutral_option_hi}` },
    ]);
  }, [scenario, speakSequence]);

  /* ────────── Garden reveal voice ────────── */
  useEffect(() => {
    if (gameState === 'garden_reveal') {
      const revealEn = childName
        ? `${childName}, look at your beautiful kindness garden! Every flower grew from a kind heart!`
        : "Look at our beautiful kindness garden! Every flower grew from a kind heart!";
      const revealHi = childName
        ? `${childName}, देखो तुम्हारा सुंदर दयालुता का बगीचा! हर फूल एक दयालु दिल से उगा!`
        : "देखो हमारा सुंदर दयालुता का बगीचा! हर फूल एक दयालु दिल से उगा!";
      speak(revealEn, revealHi);
    }
  }, [gameState, speak]);

  /* ────────── Render ────────── */

  const sceneText = language === 'hi' ? scenario.scene_hi : scenario.scene_en;
  const kindText = language === 'hi' ? scenario.kind_option_hi : scenario.kind_option_en;
  const neutralText = language === 'hi' ? scenario.neutral_option_hi : scenario.neutral_option_en;
  const showLabels = gameState === 'garden_reveal';

  return (
    <GameShell
      onBack={onBack}
      title={language === 'hi' ? 'दयालुता का बगीचा' : 'Kindness Garden'}
      round={gameState === 'garden_reveal' ? TOTAL_ROUNDS : currentRound}
      totalRounds={TOTAL_ROUNDS}
      bg="bg-gradient-to-b from-sky-200 via-sky-100 to-green-200"
    >
      {/* Inline keyframes for seed drop and butterfly drift */}
      <style>{`
        @keyframes seed-drop {
          0% { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(220px); opacity: 0.6; }
        }
        @keyframes butterfly-drift {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(30px, -15px); }
          50%  { transform: translate(60px, 5px); }
          75%  { transform: translate(20px, 20px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>

      <Celebration active={showCelebration} type="stars" />

      <div className="flex-1 flex flex-col relative overflow-hidden">

        {/* ────── INTRO STATE ────── */}
        {gameState === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4 animate-bounce-in">
            <SpeechBubble
              text={
                language === 'hi'
                  ? (childName
                    ? `${childName}, दयालुता के बगीचे में आपका स्वागत है! चलो दयालु बनकर फूल लगाते हैं!`
                    : 'दयालुता के बगीचे में आपका स्वागत है! चलो दयालु बनकर फूल लगाते हैं!')
                  : (childName
                    ? `${childName}, welcome to the Kindness Garden! Let's plant flowers by being kind!`
                    : "Welcome to the Kindness Garden! Let's plant flowers by being kind!")
              }
            />
            <div className="relative">
              <Guddu emotion="happy" size={160} animate />
              <WateringCan />
            </div>
          </div>
        )}

        {/* ────── PLAYING / NUDGE / FEEDBACK STATES ────── */}
        {(gameState === 'playing' || gameState === 'nudge' || gameState === 'feedback') && (
          <div className="flex-1 flex flex-col">
            {/* Top: Guddu + speech bubble */}
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
              <Guddu
                emotion={gudduEmotion}
                size={120}
                animate
              />
            </div>

            {/* Options */}
            <div className="px-5 mt-3 space-y-3">
              {gameState === 'nudge' ? (
                /* After nudge, show just the kind option as a retry */
                <OptionButton
                  onClick={handleNudgeRetry}
                  icon="💚"
                  variant="kind"
                >
                  {language === 'hi' ? 'फिर से सोचो!' : "Let's try again!"}
                </OptionButton>
              ) : (
                <>
                  <OptionButton
                    onClick={handleKindChoice}
                    number={1}
                    variant="kind"
                    disabled={disabled}
                  >
                    {kindText}
                  </OptionButton>
                  <OptionButton
                    onClick={handleNeutralChoice}
                    number={2}
                    variant="neutral"
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

            {/* Garden area at bottom */}
            <div className="relative mt-auto" style={{ height: 180 }}>
              {/* Grass strip */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-green-400 to-green-300 rounded-t-3xl" />

              {/* Seed drop animation */}
              <SeedDrop
                active={seedDropping}
                targetIndex={plantedFlowers.length}
                totalPatches={TOTAL_ROUNDS}
              />

              {/* Soil patches + planted flowers */}
              {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
                const flower = plantedFlowers[i];
                return (
                  <GardenPatch
                    key={i}
                    index={i}
                    totalPatches={TOTAL_ROUNDS}
                    planted={!!flower}
                    flowerType={flower?.type}
                    label={showLabels ? flower?.label : null}
                    growing={growingIndex === i}
                    language={language}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ────── GARDEN REVEAL STATE ────── */}
        {gameState === 'garden_reveal' && (
          <div className="flex-1 flex flex-col">
            {/* Title */}
            <div className="text-center pt-3 px-4">
              <h2 className="text-xl font-extrabold text-green-800 animate-bounce-in">
                {language === 'hi'
                  ? (childName ? `${childName} का दयालुता का बगीचा!` : 'तुम्हारा दयालुता का बगीचा!')
                  : (childName ? `${childName}'s Kindness Garden!` : 'Your Kindness Garden!')}
              </h2>
              <p className="text-sm text-green-700 mt-1">
                {language === 'hi'
                  ? 'हर फूल एक दयालु काम से उगा'
                  : 'Every flower grew from a kind deed'}
              </p>
            </div>

            {/* Guddu celebrating */}
            <div className="flex justify-center mt-2">
              <Guddu emotion="celebrating" size={100} animate />
            </div>

            {/* Butterflies */}
            <Butterfly delay={0} color="#E91E8C" />
            <Butterfly delay={1} color="#A855F7" />
            <Butterfly delay={2} color="#FF8C42" />

            {/* Full garden */}
            <div className="relative mt-auto" style={{ height: 200 }}>
              {/* Grass */}
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-green-500 to-green-300 rounded-t-3xl" />

              {/* All flowers with labels */}
              {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
                const flower = plantedFlowers[i];
                return (
                  <GardenPatch
                    key={i}
                    index={i}
                    totalPatches={TOTAL_ROUNDS}
                    planted={!!flower}
                    flowerType={flower?.type}
                    label={flower?.label || null}
                    growing={false}
                    language={language}
                  />
                );
              })}
            </div>

            {/* Finish button + Parent Tip */}
            <div className="px-5 pb-5 pt-3 space-y-2">
              <button
                onClick={onComplete}
                className="w-full py-4 rounded-2xl bg-green-500 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
              >
                {language === 'hi'
                  ? (childName ? `शाबाश ${childName}! पूरा हुआ!` : 'शाबाश! पूरा हुआ!')
                  : (childName ? `Well done ${childName}! Finish!` : 'Well done! Finish!')}
              </button>

              <ParentTip
                tipEn={PARENT_TIP_EN}
                tipHi={PARENT_TIP_HI}
                language={language}
              />
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
