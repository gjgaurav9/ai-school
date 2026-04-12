import { useState, useEffect, useCallback, useRef } from 'react';
import Guddu from '../common/Guddu';
import Celebration from '../common/Celebration';
import GameShell from '../common/GameShell';
import ParentTip from '../common/ParentTip';
import { useVoice } from '../../hooks/useVoice';
import { useSound } from '../../hooks/useSound';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COLORS = [
  { id: 'red', hex: '#EF4444', label: 'Red' },
  { id: 'yellow', hex: '#FFCB05', label: 'Yellow' },
  { id: 'blue', hex: '#87CEEB', label: 'Blue' },
  { id: 'green', hex: '#2DC653', label: 'Green' },
  { id: 'orange', hex: '#FF8C42', label: 'Orange' },
  { id: 'purple', hex: '#A855F7', label: 'Purple' },
];

const COLOR_REACTIONS = {
  red: {
    en: "Ooh, red! That's a strong color!",
    hi: 'ओह, लाल! कितना मज़बूत रंग!',
  },
  yellow: {
    en: 'Yellow like sunshine! Bright!',
    hi: 'पीला जैसे धूप! चमकदार!',
  },
  blue: {
    en: 'Blue like the sky! Cool!',
    hi: 'नीला जैसे आसमान! ठंडा!',
  },
  green: {
    en: 'Green like trees! Fresh!',
    hi: 'हरा जैसे पेड़! ताज़ा!',
  },
  orange: {
    en: 'Orange like a carrot! Crunchy!',
    hi: 'नारंगी जैसे गाजर! कुरकुरा!',
  },
  purple: {
    en: 'Purple like a butterfly! Beautiful!',
    hi: 'बैंगनी जैसे तितली! सुंदर!',
  },
};

const WARM_IDS = new Set(['red', 'yellow', 'orange']);
const COOL_IDS = new Set(['blue', 'green', 'purple']);

const TOTAL_SECTIONS = 6;
const CANVAS_SIZE = 280;
const CANVAS_R = CANVAS_SIZE / 2;
const DOT_SIZE = 56;

/* ------------------------------------------------------------------ */
/*  SVG helpers — pie slice paths                                      */
/* ------------------------------------------------------------------ */

function piePath(index, total, radius) {
  const angle = (2 * Math.PI) / total;
  const startAngle = index * angle - Math.PI / 2;
  const endAngle = startAngle + angle;

  const x1 = radius + radius * Math.cos(startAngle);
  const y1 = radius + radius * Math.sin(startAngle);
  const x2 = radius + radius * Math.cos(endAngle);
  const y2 = radius + radius * Math.sin(endAngle);

  const largeArc = angle > Math.PI ? 1 : 0;

  return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

/* ------------------------------------------------------------------ */
/*  Reveal message logic                                               */
/* ------------------------------------------------------------------ */

function getRevealMessage(sections, childName = '') {
  const filled = sections.filter(Boolean);
  const warmCount = filled.filter((c) => WARM_IDS.has(c)).length;
  const coolCount = filled.filter((c) => COOL_IDS.has(c)).length;
  const nameEn = childName ? `${childName}, ` : '';
  const nameHi = childName ? `${childName}, ` : '';

  if (warmCount > 0 && coolCount === 0) {
    return {
      en: `${nameEn}you picked warm colors today! Warm colors can mean energy and excitement!`,
      hi: `${nameHi}तुमने आज गर्म रंग चुने! गर्म रंगों का मतलब हो सकता है ऊर्जा और उत्साह!`,
    };
  }
  if (coolCount > 0 && warmCount === 0) {
    return {
      en: `${nameEn}you picked cool colors today! Cool colors can mean calm and peaceful!`,
      hi: `${nameHi}तुमने आज ठंडे रंग चुने! ठंडे रंगों का मतलब हो सकता है शांति और सुकून!`,
    };
  }
  return {
    en: `${nameEn}you picked so many colors! You have lots of different feelings — and that's wonderful!`,
    hi: `${nameHi}तुमने कितने सारे रंग चुने! तुम्हारे अंदर बहुत सारी भावनाएँ हैं — और यह अद्भुत है!`,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ColorFeelings({ onComplete, onBack, language = 'en', childName = '' }) {
  const { speak, stop } = useVoice(language);
  const { success, celebrate, pop } = useSound();

  const [phase, setPhase] = useState('intro'); // 'intro' | 'painting' | 'reveal'
  const [sections, setSections] = useState(Array(TOTAL_SECTIONS).fill(null));
  const [currentSection, setCurrentSection] = useState(0);
  const [gudduEmotion, setGudduEmotion] = useState('happy');
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  // Track which sections were just painted for the fill animation
  const [animatingSection, setAnimatingSection] = useState(null);

  const revealTimeoutRef = useRef(null);

  /* ---- Cleanup ---- */
  useEffect(() => {
    return () => {
      stop();
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, [stop]);

  /* ---- Phase: INTRO ---- */
  useEffect(() => {
    if (phase === 'intro') {
      speak(
        childName
          ? `Hi ${childName}! Let's paint how you feel today! Tap any color you like!`
          : "Let's paint how you feel today! Tap any color you like!",
        childName
          ? `हाय ${childName}! आओ आज अपनी भावनाओं को रंगों से सजाएँ! कोई भी रंग चुनो!`
          : 'आओ आज अपनी भावनाओं को रंगों से सजाएँ! कोई भी रंग चुनो!'
      );
    }
  }, [phase, speak, childName]);

  /* ---- Phase: REVEAL ---- */
  useEffect(() => {
    if (phase === 'reveal') {
      const msg = getRevealMessage(sections, childName);
      celebrate();
      setShowCelebration(true);
      setGudduEmotion('celebrating');

      // Small delay so the celebration starts before the voice
      const t = setTimeout(() => {
        speak(msg.en, msg.hi);
      }, 400);

      revealTimeoutRef.current = t;
    }
  }, [phase, sections, celebrate, speak, childName]);

  /* ---- Handlers ---- */

  const handleStartPainting = useCallback(() => {
    setPhase('painting');
    setGudduEmotion('happy');
  }, []);

  const handleColorTap = useCallback(
    (color) => {
      if (phase !== 'painting') return;
      if (currentSection >= TOTAL_SECTIONS) return;

      pop();
      setSelectedColor(color.id);
      setAnimatingSection(currentSection);

      // Update sections
      setSections((prev) => {
        const next = [...prev];
        next[currentSection] = color.id;
        return next;
      });

      // Guddu reacts
      const reaction = COLOR_REACTIONS[color.id];
      speak(reaction.en, reaction.hi);
      setGudduEmotion('surprised');

      // Reset Guddu after a beat
      setTimeout(() => setGudduEmotion('happy'), 1200);

      // Clear animation flag
      setTimeout(() => setAnimatingSection(null), 600);

      const nextSection = currentSection + 1;
      setCurrentSection(nextSection);

      // If all sections filled, move to reveal after a short pause
      if (nextSection >= TOTAL_SECTIONS) {
        setTimeout(() => {
          success();
          setPhase('reveal');
        }, 1500);
      }
    },
    [phase, currentSection, pop, speak, success]
  );

  const handleReplay = useCallback(() => {
    stop();
    setShowCelebration(false);
    setSections(Array(TOTAL_SECTIONS).fill(null));
    setCurrentSection(0);
    setSelectedColor(null);
    setAnimatingSection(null);
    setGudduEmotion('happy');
    setPhase('intro');
  }, [stop]);

  /* ---- Derive reveal message for display ---- */
  const revealMsg = phase === 'reveal' ? getRevealMessage(sections, childName) : null;

  /* ---- Render ---- */
  return (
    <GameShell onBack={onBack} title={language === 'hi' ? 'रंग और भावनाएँ' : 'Color Feelings'}>
      <Celebration active={showCelebration} type="confetti" />

      <div className="flex-1 flex flex-col items-center justify-between px-4 py-4 overflow-y-auto">
        {/* Guddu — top-right corner */}
        <div className="w-full flex justify-end">
          <Guddu emotion={gudduEmotion} size={120} animate className="drop-shadow-md" />
        </div>

        {/* ========== INTRO ========== */}
        {phase === 'intro' && (
          <div className="flex flex-col items-center gap-6 flex-1 justify-center -mt-8">
            {/* Paintbrush icon */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              className="animate-bounce"
            >
              <rect x="34" y="40" width="12" height="32" rx="3" fill="#B8860B" />
              <rect x="32" y="36" width="16" height="8" rx="2" fill="#C0C0C0" />
              <path
                d="M32 36 C32 18, 48 18, 48 36"
                fill="#EF4444"
                stroke="#D32F2F"
                strokeWidth="1.5"
              />
              {/* paint drip */}
              <circle cx="36" cy="38" r="2" fill="#EF4444" />
            </svg>

            <p className="text-center text-lg font-semibold text-gray-700 max-w-[280px] leading-relaxed">
              {language === 'hi'
                ? childName
                  ? `हाय ${childName}! आओ आज अपनी भावनाओं को रंगों से सजाएँ! कोई भी रंग चुनो!`
                  : 'आओ आज अपनी भावनाओं को रंगों से सजाएँ! कोई भी रंग चुनो!'
                : childName
                  ? `Hi ${childName}! Let's paint how you feel today! Tap any color you like!`
                  : "Let's paint how you feel today! Tap any color you like!"}
            </p>

            <button
              onClick={handleStartPainting}
              className="px-10 py-4 rounded-full bg-[#FFCB05] text-gray-800 font-bold text-lg shadow-lg active:scale-95 transition-transform"
            >
              {language === 'hi' ? 'शुरू करो!' : "Let's Paint!"}
            </button>
          </div>
        )}

        {/* ========== PAINTING ========== */}
        {phase === 'painting' && (
          <div className="flex flex-col items-center gap-6 flex-1 justify-center -mt-4">
            {/* Canvas */}
            <div className="relative">
              <svg
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                className="drop-shadow-lg"
                role="img"
                aria-label={
                  language === 'hi' ? 'रंग भरने का कैनवास' : 'Painting canvas'
                }
              >
                {/* Background circle for border */}
                <circle
                  cx={CANVAS_R}
                  cy={CANVAS_R}
                  r={CANVAS_R - 1}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />

                {/* Pie sections */}
                {Array.from({ length: TOTAL_SECTIONS }, (_, i) => {
                  const colorId = sections[i];
                  const colorObj = COLORS.find((c) => c.id === colorId);
                  const fillColor = colorObj ? colorObj.hex : '#F3F4F6';
                  const isAnimating = animatingSection === i;

                  return (
                    <path
                      key={i}
                      d={piePath(i, TOTAL_SECTIONS, CANVAS_R)}
                      fill={fillColor}
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        transformOrigin: `${CANVAS_R}px ${CANVAS_R}px`,
                        transition: 'fill 0.4s ease, transform 0.3s ease',
                        transform: isAnimating ? 'scale(1.04)' : 'scale(1)',
                      }}
                    />
                  );
                })}

                {/* Center dot — decorative */}
                <circle
                  cx={CANVAS_R}
                  cy={CANVAS_R}
                  r={12}
                  fill="white"
                  stroke="#E5E7EB"
                  strokeWidth="1.5"
                />

                {/* Section numbers as subtle guides */}
                {Array.from({ length: TOTAL_SECTIONS }, (_, i) => {
                  const angle =
                    (2 * Math.PI * i) / TOTAL_SECTIONS -
                    Math.PI / 2 +
                    Math.PI / TOTAL_SECTIONS;
                  const labelR = CANVAS_R * 0.6;
                  const lx = CANVAS_R + labelR * Math.cos(angle);
                  const ly = CANVAS_R + labelR * Math.sin(angle);
                  const isEmpty = !sections[i];
                  const isCurrent = i === currentSection;

                  return (
                    isEmpty && (
                      <text
                        key={`label-${i}`}
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="18"
                        fontWeight="600"
                        fill={isCurrent ? '#9CA3AF' : '#D1D5DB'}
                        className="pointer-events-none select-none"
                      >
                        {i + 1}
                      </text>
                    )
                  );
                })}
              </svg>

              {/* Pulse ring on current section indicator */}
              {currentSection < TOTAL_SECTIONS && (
                <div
                  className="absolute rounded-full border-2 border-[#FFCB05] animate-ping"
                  style={{
                    width: 24,
                    height: 24,
                    top: CANVAS_R - 12,
                    left: CANVAS_R - 12,
                    opacity: 0.4,
                  }}
                />
              )}
            </div>

            {/* Progress indicator */}
            <p className="text-sm text-gray-400 font-medium">
              {language === 'hi'
                ? `${currentSection} / ${TOTAL_SECTIONS} रंग भरे`
                : `${currentSection} / ${TOTAL_SECTIONS} painted`}
            </p>

            {/* Color palette */}
            <div className="flex flex-wrap justify-center gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorTap(color)}
                  disabled={currentSection >= TOTAL_SECTIONS}
                  aria-label={color.label}
                  className="relative transition-transform active:scale-90 disabled:opacity-40"
                  style={{ width: DOT_SIZE, height: DOT_SIZE }}
                >
                  <span
                    className="block w-full h-full rounded-full shadow-md border-4 border-white"
                    style={{ backgroundColor: color.hex }}
                  />
                  {/* Highlight ring if this is the last selected color */}
                  {selectedColor === color.id && (
                    <span
                      className="absolute inset-0 rounded-full border-3 border-gray-800 opacity-30 pointer-events-none"
                      style={{ margin: -2 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========== REVEAL ========== */}
        {phase === 'reveal' && (
          <div className="flex flex-col items-center gap-5 flex-1 justify-center -mt-4">
            {/* Completed canvas with sparkle */}
            <div className="relative">
              <svg
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                className="drop-shadow-xl"
              >
                {Array.from({ length: TOTAL_SECTIONS }, (_, i) => {
                  const colorId = sections[i];
                  const colorObj = COLORS.find((c) => c.id === colorId);
                  return (
                    <path
                      key={i}
                      d={piePath(i, TOTAL_SECTIONS, CANVAS_R)}
                      fill={colorObj ? colorObj.hex : '#F3F4F6'}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
                <circle
                  cx={CANVAS_R}
                  cy={CANVAS_R}
                  r={12}
                  fill="white"
                  stroke="#E5E7EB"
                  strokeWidth="1.5"
                />

                {/* Sparkle particles scattered over the canvas */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                  const sparkleR = CANVAS_R * 0.72;
                  const rad = (deg * Math.PI) / 180;
                  const sx = CANVAS_R + sparkleR * Math.cos(rad);
                  const sy = CANVAS_R + sparkleR * Math.sin(rad);
                  return (
                    <g key={`sparkle-${i}`}>
                      <circle cx={sx} cy={sy} r={3} fill="white" opacity={0.9}>
                        <animate
                          attributeName="opacity"
                          values="0.3;1;0.3"
                          dur={`${1 + i * 0.2}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="r"
                          values="2;4;2"
                          dur={`${1 + i * 0.2}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Reveal message */}
            <p className="text-center text-base font-semibold text-gray-700 max-w-[300px] leading-relaxed px-2">
              {language === 'hi' ? revealMsg.hi : revealMsg.en}
            </p>

            {/* Action buttons */}
            <div className="flex gap-4 mt-2">
              <button
                onClick={handleReplay}
                className="px-6 py-3 rounded-full bg-white text-gray-700 font-semibold shadow-md border border-gray-200 active:scale-95 transition-transform"
              >
                {language === 'hi' ? 'फिर से खेलो' : 'Paint Again'}
              </button>
              <button
                onClick={() => {
                  stop();
                  if (onComplete) onComplete();
                }}
                className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-95 transition-transform"
              >
                {language === 'hi' ? 'आगे बढ़ो' : 'Done'}
              </button>
            </div>
          </div>
        )}

        {/* Parent Tip — shown in painting and reveal phases */}
        {(phase === 'painting' || phase === 'reveal') && (
          <div className="mt-auto pt-4 pb-2">
            <ParentTip
              tipEn="Your child's color choices may reflect their mood. Don't interpret too deeply — the goal is to make them comfortable EXPRESSING, not to diagnose. Ask: 'Tell me about your painting!' rather than 'Why did you pick red?'"
              tipHi="आपके बच्चे की रंग चुनने की पसंद उनके मूड को दर्शा सकती है। इसे बहुत गहराई से न समझें — लक्ष्य यह है कि वे अपनी भावनाओं को व्यक्त करने में सहज महसूस करें, न कि उनका निदान करें। पूछें: 'अपनी पेंटिंग के बारे में बताओ!' बजाय 'तुमने लाल क्यों चुना?'"
              language={language}
            />
          </div>
        )}
      </div>
    </GameShell>
  );
}
