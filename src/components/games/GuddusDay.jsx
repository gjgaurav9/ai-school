import { useState, useEffect, useCallback, useRef } from 'react';
import Guddu from '../common/Guddu';
import Celebration from '../common/Celebration';
import GameShell from '../common/GameShell';
import ParentTip from '../common/ParentTip';
import { useVoice } from '../../hooks/useVoice';
import { useSound } from '../../hooks/useSound';
import routinesData from '../../data/routines.json';

/* ------------------------------------------------------------------ */
/*  SVG icons for each activity                                        */
/* ------------------------------------------------------------------ */

function IconWake() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Sun */}
      <circle cx="32" cy="14" r="7" fill="#FFD93D" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="32" y1="14" x2={32 + 11 * Math.cos((deg * Math.PI) / 180)}
          y2={14 + 11 * Math.sin((deg * Math.PI) / 180)}
          stroke="#FFD93D" strokeWidth="2" strokeLinecap="round"
        />
      ))}
      {/* Stretch arms */}
      <circle cx="18" cy="30" r="6" fill="#BDBDBD" />
      <line x1="8" y1="26" x2="14" y2="22" stroke="#9E9E9E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="22" x2="28" y2="26" stroke="#9E9E9E" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="15" y="36" width="6" height="8" rx="2" fill="#9E9E9E" />
    </svg>
  );
}

function IconBrush() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Toothbrush handle */}
      <rect x="10" y="20" width="24" height="6" rx="3" fill="#74B9FF" />
      {/* Brush head */}
      <rect x="34" y="18" width="8" height="10" rx="2" fill="#DFE6E9" stroke="#B2BEC3" strokeWidth="1" />
      {/* Bristles */}
      {[36, 38, 40].map((x) => (
        <line key={x} x1={x} y1="19" x2={x} y2="15" stroke="#74B9FF" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {/* Sparkle */}
      <circle cx="40" cy="12" r="2" fill="#FFD93D" />
    </svg>
  );
}

function IconBreakfast() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Plate */}
      <ellipse cx="24" cy="30" rx="16" ry="8" fill="#DFE6E9" stroke="#B2BEC3" strokeWidth="1.5" />
      {/* Food items */}
      <circle cx="20" cy="27" r="4" fill="#FF8C42" /> {/* Roti/pancake */}
      <circle cx="28" cy="27" r="3" fill="#FFD93D" /> {/* Egg */}
      <circle cx="28" cy="27" r="1.5" fill="#FF6B6B" />
      {/* Steam */}
      <path d="M18 18 Q20 15 18 12" stroke="#B2BEC3" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M24 17 Q26 14 24 11" stroke="#B2BEC3" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function IconSchool() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Backpack */}
      <rect x="18" y="16" width="16" height="20" rx="4" fill="#FF6B6B" />
      <rect x="22" y="20" width="8" height="6" rx="2" fill="#FF8C42" />
      {/* Straps */}
      <line x1="20" y1="16" x2="18" y2="12" stroke="#E55039" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="16" x2="34" y2="12" stroke="#E55039" strokeWidth="2" strokeLinecap="round" />
      {/* Wave hand */}
      <circle cx="10" cy="20" r="3" fill="#BDBDBD" />
      <line x1="10" y1="17" x2="8" y2="12" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="12" x2="5" y2="10" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconWash() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Tap */}
      <rect x="20" y="8" width="8" height="4" rx="2" fill="#B2BEC3" />
      <rect x="22" y="12" width="4" height="10" rx="1" fill="#B2BEC3" />
      {/* Water drops */}
      <ellipse cx="24" cy="26" rx="2" ry="3" fill="#74B9FF" />
      <ellipse cx="20" cy="30" rx="1.5" ry="2.5" fill="#74B9FF" opacity="0.7" />
      <ellipse cx="28" cy="29" rx="1.5" ry="2.5" fill="#74B9FF" opacity="0.7" />
      {/* Hands */}
      <path d="M14 32 Q18 28 24 32 Q30 28 34 32" stroke="#BDBDBD" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Bubbles */}
      <circle cx="16" cy="36" r="2" fill="#DFE6E9" stroke="#B2BEC3" strokeWidth="0.5" />
      <circle cx="32" cy="35" r="1.5" fill="#DFE6E9" stroke="#B2BEC3" strokeWidth="0.5" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Ball */}
      <circle cx="24" cy="24" r="12" fill="#FF6B6B" />
      <path d="M14 20 Q24 16 34 20" stroke="#FFD93D" strokeWidth="2" fill="none" />
      <path d="M14 28 Q24 32 34 28" stroke="#FFD93D" strokeWidth="2" fill="none" />
      <line x1="24" y1="12" x2="24" y2="36" stroke="#FFD93D" strokeWidth="2" />
      {/* Bounce lines */}
      <line x1="18" y1="38" x2="14" y2="42" stroke="#B2BEC3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="38" x2="24" y2="43" stroke="#B2BEC3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="38" x2="34" y2="42" stroke="#B2BEC3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconDinner() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Plate */}
      <ellipse cx="24" cy="30" rx="16" ry="8" fill="#DFE6E9" stroke="#B2BEC3" strokeWidth="1.5" />
      {/* Food */}
      <ellipse cx="24" cy="27" rx="6" ry="3" fill="#2DC653" /> {/* Sabzi/veggies */}
      <circle cx="18" cy="28" r="3" fill="#FF8C42" /> {/* Roti */}
      <rect x="28" y="25" width="6" height="5" rx="2" fill="#FFD93D" /> {/* Rice/dal */}
      {/* Family silhouettes (tiny) */}
      <circle cx="10" cy="16" r="3" fill="#BDBDBD" />
      <rect x="8" y="19" width="4" height="5" rx="1" fill="#BDBDBD" />
      <circle cx="38" cy="16" r="3" fill="#BDBDBD" />
      <rect x="36" y="19" width="4" height="5" rx="1" fill="#BDBDBD" />
    </svg>
  );
}

function IconSleep() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* Bed */}
      <rect x="8" y="26" width="32" height="14" rx="3" fill="#A29BFE" />
      <rect x="8" y="32" width="32" height="8" rx="2" fill="#6C5CE7" />
      {/* Pillow */}
      <ellipse cx="16" cy="28" rx="6" ry="3" fill="white" />
      {/* Blanket */}
      <rect x="10" y="30" width="28" height="8" rx="2" fill="#A29BFE" opacity="0.7" />
      {/* Moon */}
      <circle cx="38" cy="12" r="6" fill="#FFD93D" />
      <circle cx="40" cy="10" r="5" fill="#2D3436" /> {/* Dark bite for crescent */}
      {/* Stars */}
      <circle cx="28" cy="8" r="1.5" fill="#FFD93D" />
      <circle cx="22" cy="12" r="1" fill="#FFD93D" />
    </svg>
  );
}

const ACTIVITY_ICONS = {
  wake: IconWake,
  brush: IconBrush,
  breakfast: IconBreakfast,
  school: IconSchool,
  wash: IconWash,
  play: IconPlay,
  dinner: IconDinner,
  sleep: IconSleep,
};

const CARD_COLORS = {
  wake: '#FFD93D',
  brush: '#74B9FF',
  breakfast: '#FF8C42',
  school: '#FF6B6B',
  wash: '#74B9FF',
  play: '#FF6B6B',
  dinner: '#2DC653',
  sleep: '#A29BFE',
};

/* ------------------------------------------------------------------ */
/*  Hint messages for wrong placement                                  */
/* ------------------------------------------------------------------ */

const WRONG_HINTS = {
  morning: {
    wake: {
      en: 'Guddu needs to wake up first before anything else!',
      hi: 'गुड्डू को सबसे पहले उठना होगा!',
    },
    brush: {
      en: 'Hmm, does Guddu brush teeth before waking up? Let\'s try again!',
      hi: 'क्या गुड्डू उठने से पहले दाँत साफ़ करता है? फिर से कोशिश करो!',
    },
    breakfast: {
      en: 'Guddu should brush his teeth before eating breakfast!',
      hi: 'गुड्डू को नाश्ते से पहले दाँत साफ़ करने चाहिए!',
    },
    school: {
      en: 'Guddu goes to school at the end! What comes first?',
      hi: 'गुड्डू आखिर में स्कूल जाता है! पहले क्या होता है?',
    },
  },
  evening: {
    wash: {
      en: 'Guddu should wash hands first when coming home!',
      hi: 'गुड्डू को घर आकर पहले हाथ धोने चाहिए!',
    },
    play: {
      en: 'Does Guddu play before washing hands? Let\'s think again!',
      hi: 'क्या गुड्डू हाथ धोने से पहले खेलता है? फिर सोचो!',
    },
    dinner: {
      en: 'Guddu eats dinner after playing! What\'s next?',
      hi: 'गुड्डू खेलने के बाद खाना खाता है! आगे क्या है?',
    },
    sleep: {
      en: 'Story time and sleep come at the very end!',
      hi: 'कहानी और नींद सबसे आखिर में आती है!',
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Shuffle helper                                                     */
/* ------------------------------------------------------------------ */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/*  Activity Card                                                      */
/* ------------------------------------------------------------------ */

function ActivityCard({ step, selected, placed, language, onTap }) {
  const Icon = ACTIVITY_ICONS[step.id];
  const borderColor = CARD_COLORS[step.id];
  const label = language === 'hi' ? step.label_hi : step.label_en;

  return (
    <button
      onClick={onTap}
      disabled={placed}
      className="relative flex flex-col items-center justify-center rounded-2xl bg-white transition-all duration-200 active:scale-95"
      style={{
        width: 140,
        height: 100,
        border: `3px solid ${placed ? '#D1D5DB' : borderColor}`,
        opacity: placed ? 0.35 : 1,
        boxShadow: selected
          ? `0 0 0 4px ${borderColor}44, 0 4px 16px ${borderColor}33`
          : '0 2px 8px rgba(0,0,0,0.08)',
        transform: selected ? 'scale(1.06)' : 'scale(1)',
        cursor: placed ? 'default' : 'pointer',
      }}
    >
      {Icon && <Icon />}
      <span className="text-xs font-semibold text-gray-700 mt-1 leading-tight text-center px-1">
        {label}
      </span>
      {selected && (
        <div
          className="absolute inset-0 rounded-2xl animate-pulse-glow pointer-events-none"
          style={{ border: `2px solid ${borderColor}` }}
        />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Slot                                                               */
/* ------------------------------------------------------------------ */

function Slot({ index, placedStep, language, onTap, animating }) {
  const Icon = placedStep ? ACTIVITY_ICONS[placedStep.id] : null;
  const borderColor = placedStep ? CARD_COLORS[placedStep.id] : '#9CA3AF';
  const label = placedStep
    ? (language === 'hi' ? placedStep.label_hi : placedStep.label_en)
    : null;

  return (
    <button
      onClick={onTap}
      disabled={!!placedStep}
      className="relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300"
      style={{
        width: 76,
        height: 88,
        border: placedStep ? `3px solid ${borderColor}` : '3px dashed #D1D5DB',
        backgroundColor: placedStep ? 'white' : 'rgba(255,255,255,0.4)',
        cursor: placedStep ? 'default' : 'pointer',
        transform: animating ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      {placedStep ? (
        <div className="animate-bounce-in flex flex-col items-center">
          {Icon && (
            <div style={{ transform: 'scale(0.6)', marginTop: -6, marginBottom: -6 }}>
              <Icon />
            </div>
          )}
          <span className="text-[9px] font-semibold text-gray-600 leading-tight text-center px-0.5">
            {label}
          </span>
        </div>
      ) : (
        <span className="text-lg font-bold text-gray-300">{index + 1}</span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Star burst mini-animation                                          */
/* ------------------------------------------------------------------ */

function StarBurst({ show }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <div
          key={deg}
          className="absolute animate-float-up"
          style={{
            transform: `rotate(${deg}deg) translateY(-30px)`,
            animationDelay: `${deg / 1000}s`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD93D">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Intro scene                                                        */
/* ------------------------------------------------------------------ */

function IntroScene({ language, onStart, childName }) {
  const [sunUp, setSunUp] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSunUp(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Sun rising */}
      <div
        className="absolute transition-all duration-[2000ms] ease-out"
        style={{
          right: 40,
          top: sunUp ? 40 : 200,
          opacity: sunUp ? 1 : 0.3,
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="24" fill="#FFD93D" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="40" y1="40"
              x2={40 + 34 * Math.cos((deg * Math.PI) / 180)}
              y2={40 + 34 * Math.sin((deg * Math.PI) / 180)}
              stroke="#FFD93D" strokeWidth="3" strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      {/* Guddu sleeping / waking */}
      <div className="mb-6">
        <Guddu emotion={sunUp ? 'happy' : 'neutral'} size={160} animate />
      </div>

      {/* Bed */}
      <div className="mb-6">
        <svg width="200" height="40" viewBox="0 0 200 40">
          <rect x="10" y="5" width="180" height="30" rx="8" fill="#A29BFE" />
          <rect x="10" y="15" width="180" height="20" rx="6" fill="#6C5CE7" />
          <ellipse cx="50" cy="12" rx="20" ry="8" fill="white" opacity="0.8" />
        </svg>
      </div>

      <p className="text-center text-gray-700 text-lg font-bold mb-2">
        {language === 'hi'
          ? (childName ? `${childName}, सुप्रभात!` : 'सुप्रभात, गुड्डू!')
          : (childName ? `${childName}, good morning!` : 'Good morning, Guddu!')}
      </p>
      <p className="text-center text-gray-500 text-sm mb-8">
        {language === 'hi'
          ? 'गुड्डू को तैयार होने में मदद करो!'
          : 'Help Guddu get ready for his day!'}
      </p>

      <button
        onClick={onStart}
        className="px-8 py-4 rounded-2xl bg-[#FFCB05] text-gray-800 text-lg font-bold shadow-lg active:scale-95 transition-transform"
      >
        {language === 'hi' ? 'चलो शुरू करें!' : "Let's go!"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Celebration scene                                                  */
/* ------------------------------------------------------------------ */

function CelebrationScene({ language, onComplete, childName }) {
  const [showMoon, setShowMoon] = useState(false);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowMoon(true), 400);
    const t2 = setTimeout(() => setShowStars(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const starPositions = [
    { x: 15, y: 8, size: 14, delay: 0 },
    { x: 70, y: 12, size: 10, delay: 0.2 },
    { x: 40, y: 5, size: 12, delay: 0.4 },
    { x: 85, y: 15, size: 8, delay: 0.1 },
    { x: 25, y: 18, size: 9, delay: 0.3 },
    { x: 60, y: 6, size: 11, delay: 0.5 },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Moon */}
      <div
        className="absolute transition-all duration-[1500ms] ease-out"
        style={{
          right: 30,
          top: showMoon ? 30 : -60,
          opacity: showMoon ? 1 : 0,
        }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="20" fill="#FFD93D" />
          <circle cx="36" cy="24" r="16" fill="#1A1A2E" />
        </svg>
      </div>

      {/* Stars */}
      {showStars && starPositions.map((s, i) => (
        <div
          key={i}
          className="absolute animate-sparkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="#FFD93D">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      ))}

      {/* Guddu sleeping */}
      <div className="mb-4">
        <Guddu emotion="happy" size={140} animate />
      </div>

      {/* Bed */}
      <div className="mb-6">
        <svg width="180" height="36" viewBox="0 0 180 36">
          <rect x="5" y="4" width="170" height="28" rx="8" fill="#A29BFE" />
          <rect x="5" y="14" width="170" height="18" rx="6" fill="#6C5CE7" />
          <ellipse cx="45" cy="10" rx="18" ry="7" fill="white" opacity="0.8" />
        </svg>
      </div>

      <p className="text-center text-gray-700 text-xl font-bold mb-2">
        {language === 'hi'
          ? (childName ? `शाबाश ${childName}! तुमने गुड्डू का दिन बना दिया!` : 'शाबाश! तुमने गुड्डू का दिन बना दिया!')
          : (childName ? `${childName}, you helped Guddu have a wonderful day!` : 'You helped Guddu have a wonderful day!')}
      </p>
      <p className="text-center text-gray-400 text-sm mb-8">
        {language === 'hi'
          ? 'गुड्डू अब सो रहा है। शुभ रात्रि!'
          : 'Guddu is sleeping now. Good night!'}
      </p>

      <button
        onClick={onComplete}
        className="px-8 py-4 rounded-2xl bg-[#FFCB05] text-gray-800 text-lg font-bold shadow-lg active:scale-95 transition-transform"
      >
        {language === 'hi' ? 'पूरा हुआ!' : 'All done!'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Routine phase (morning / evening)                                  */
/* ------------------------------------------------------------------ */

function RoutinePhase({ routine, routineKey, language, onPhaseComplete, childName }) {
  const { speak, speakSequence } = useVoice(language);
  const { success, tap, gentle } = useSound();

  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [placedCards, setPlacedCards] = useState([null, null, null, null]);
  const [starSlot, setStarSlot] = useState(null);
  const [bounceCard, setBounceCard] = useState(null);
  const [animatingSlot, setAnimatingSlot] = useState(null);
  const [allPlaced, setAllPlaced] = useState(false);
  const completedRef = useRef(false);

  // Shuffle steps on mount
  useEffect(() => {
    setShuffledSteps(shuffle(routine.steps));
    setSelectedCard(null);
    setPlacedCards([null, null, null, null]);
    setAllPlaced(false);
    completedRef.current = false;
  }, [routine]);

  // Speak the routine title + card options on mount
  useEffect(() => {
    const items = [
      { en: routine.title_en, hi: routine.title_hi },
      { en: 'The cards are:', hi: 'कार्ड हैं:' },
      ...routine.steps.map(s => ({ en: s.label_en, hi: s.label_hi })),
      { en: 'Put them in the right order!', hi: 'इन्हें सही क्रम में लगाओ!' },
    ];
    speakSequence(items);
  }, [routine, speakSequence]);

  // Find the next empty slot index
  const nextEmptySlot = placedCards.findIndex((c) => c === null);

  // Handle tapping an activity card
  const handleCardTap = useCallback(
    (step) => {
      // Don't select if already placed
      if (placedCards.some((c) => c && c.id === step.id)) return;
      tap();
      setSelectedCard((prev) => (prev?.id === step.id ? null : step));
    },
    [placedCards, tap],
  );

  // Handle tapping a slot
  const handleSlotTap = useCallback(
    (slotIndex) => {
      if (!selectedCard) return;
      if (placedCards[slotIndex] !== null) return;

      const correctOrder = slotIndex + 1; // slots are 1-indexed in data

      if (selectedCard.order === correctOrder) {
        // Correct placement
        success();
        setAnimatingSlot(slotIndex);
        setStarSlot(slotIndex);

        const newPlaced = [...placedCards];
        newPlaced[slotIndex] = selectedCard;
        setPlacedCards(newPlaced);
        setSelectedCard(null);

        speak(
          childName ? `Great job ${childName}!` : 'Great job!',
          childName ? `बहुत अच्छे ${childName}!` : 'बहुत अच्छे!',
        );

        setTimeout(() => {
          setStarSlot(null);
          setAnimatingSlot(null);
        }, 1000);

        // Check if all slots filled
        const filledCount = newPlaced.filter((c) => c !== null).length;
        if (filledCount === 4) {
          setTimeout(() => {
            setAllPlaced(true);
          }, 1200);
        }
      } else {
        // Wrong placement - bounce back
        gentle();
        setBounceCard(selectedCard.id);

        const hint = WRONG_HINTS[routineKey]?.[selectedCard.id];
        if (hint) {
          speak(hint.en, hint.hi);
        }

        setTimeout(() => {
          setBounceCard(null);
          setSelectedCard(null);
        }, 800);
      }
    },
    [selectedCard, placedCards, success, gentle, speak, language, routineKey],
  );

  // Transition to next phase after montage
  useEffect(() => {
    if (allPlaced && !completedRef.current) {
      completedRef.current = true;
      const t = setTimeout(() => {
        onPhaseComplete();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [allPlaced, onPhaseComplete]);

  const title = language === 'hi' ? routine.title_hi : routine.title_en;
  const isCardPlaced = (step) => placedCards.some((c) => c && c.id === step.id);

  return (
    <div className="flex-1 flex flex-col px-4 pb-4">
      {/* Guddu + title */}
      <div className="flex items-center gap-3 mb-3 mt-1">
        <Guddu
          emotion={allPlaced ? 'celebrating' : selectedCard ? 'surprised' : 'happy'}
          size={64}
          animate
        />
        <p className="text-sm font-bold text-gray-700 flex-1">{title}</p>
      </div>

      {/* Slots row */}
      <div className="flex justify-center gap-2 mb-5">
        {placedCards.map((placed, i) => (
          <div key={i} className="relative">
            <Slot
              index={i}
              placedStep={placed}
              language={language}
              onTap={() => handleSlotTap(i)}
              animating={animatingSlot === i}
            />
            <StarBurst show={starSlot === i} />
          </div>
        ))}
      </div>

      {/* Instruction */}
      <p className="text-xs text-gray-400 text-center mb-3">
        {selectedCard
          ? (language === 'hi'
            ? 'अब एक खाली जगह पर टैप करो!'
            : 'Now tap an empty slot!')
          : (language === 'hi'
            ? 'एक कार्ड पर टैप करो, फिर सही जगह पर रखो'
            : 'Tap a card, then place it in the right slot')}
      </p>

      {/* Activity cards - 2x2 grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-3">
          {shuffledSteps.map((step) => (
            <div
              key={step.id}
              className="transition-transform duration-300"
              style={{
                transform: bounceCard === step.id ? 'translateX(8px)' : 'translateX(0)',
                animation: bounceCard === step.id ? 'wiggle 0.5s ease-in-out' : 'none',
              }}
            >
              <ActivityCard
                step={step}
                selected={selectedCard?.id === step.id}
                placed={isCardPlaced(step)}
                language={language}
                onTap={() => handleCardTap(step)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* All placed montage overlay */}
      {allPlaced && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-white rounded-3xl px-8 py-6 shadow-2xl animate-bounce-in">
            <p className="text-2xl font-bold text-center">
              {routineKey === 'morning' ? (
                language === 'hi' ? 'सुबह पूरी!' : 'Morning done!'
              ) : (
                language === 'hi' ? 'शाम पूरी!' : 'Evening done!'
              )}
            </p>
            <Guddu emotion="celebrating" size={80} animate className="mx-auto mt-2" />
          </div>
        </div>
      )}

      <Celebration active={allPlaced} type="stars" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function GuddusDay({ onComplete, onBack, language = 'en', childName = '' }) {
  const [phase, setPhase] = useState('intro');
  const { speak, stop } = useVoice(language);
  const { celebrate } = useSound();

  // Background gradient based on phase
  const bgClass = phase === 'evening' || phase === 'celebration'
    ? 'bg-gradient-to-b from-[#2D3436] via-[#6C5CE7] to-[#A29BFE]'
    : 'bg-gradient-to-b from-[#FFE082] via-[#FFF8E7] to-[#FFF3CD]';

  // Title for GameShell
  const phaseTitle = {
    intro: language === 'hi' ? 'गुड्डू का दिन' : "Guddu's Day",
    morning: language === 'hi' ? 'सुबह की दिनचर्या' : 'Morning Routine',
    evening: language === 'hi' ? 'शाम की दिनचर्या' : 'Evening Routine',
    celebration: language === 'hi' ? 'शुभ रात्रि!' : 'Good Night!',
  };

  // Speak intro on mount
  useEffect(() => {
    if (phase === 'intro') {
      speak(
        childName
          ? `${childName}, good morning! Help Guddu get ready for his day!`
          : 'Good morning, Guddu! Help him get ready for his day!',
        childName
          ? `${childName}, सुप्रभात! गुड्डू को तैयार होने में मदद करो!`
          : 'सुप्रभात, गुड्डू! उसे अपने दिन के लिए तैयार होने में मदद करो!',
      );
    }
    return () => stop();
  }, [phase, speak, stop, childName]);

  const handleStart = useCallback(() => {
    setPhase('morning');
  }, []);

  const handleMorningComplete = useCallback(() => {
    setPhase('evening');
  }, []);

  const handleEveningComplete = useCallback(() => {
    celebrate();
    speak(
      childName
        ? `${childName}, you helped Guddu have a wonderful day!`
        : 'You helped Guddu have a wonderful day!',
      childName
        ? `${childName}, तुमने गुड्डू का पूरा दिन बना दिया!`
        : 'तुमने गुड्डू का पूरा दिन बना दिया!',
    );
    setPhase('celebration');
  }, [celebrate, speak, childName]);

  const handleFinish = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // Round indicator for GameShell
  const roundMap = { intro: 0, morning: 1, evening: 2, celebration: 3 };

  return (
    <GameShell
      onBack={onBack}
      title={phaseTitle[phase]}
      round={roundMap[phase]}
      totalRounds={4}
      bg={bgClass}
    >
      {phase === 'intro' && (
        <IntroScene language={language} onStart={handleStart} childName={childName} />
      )}

      {phase === 'morning' && (
        <RoutinePhase
          routine={routinesData.morning}
          routineKey="morning"
          language={language}
          onPhaseComplete={handleMorningComplete}
          childName={childName}
        />
      )}

      {phase === 'evening' && (
        <RoutinePhase
          routine={routinesData.evening}
          routineKey="evening"
          language={language}
          onPhaseComplete={handleEveningComplete}
          childName={childName}
        />
      )}

      {phase === 'celebration' && (
        <CelebrationScene language={language} onComplete={handleFinish} childName={childName} />
      )}

      <Celebration active={phase === 'celebration'} type="confetti" />

      <ParentTip
        tipEn="Create a visual routine chart at home with your child. Let THEM draw or stick pictures for each step. Ownership of routine builds independence."
        tipHi="अपने बच्चे के साथ घर पर एक दिनचर्या चार्ट बनाएं। उन्हें हर कदम के लिए चित्र बनाने या चिपकाने दें। दिनचर्या पर बच्चे का अधिकार उसकी आत्मनिर्भरता बढ़ाता है।"
        language={language}
      />
    </GameShell>
  );
}
