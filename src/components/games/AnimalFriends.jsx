import { useState, useEffect, useCallback, useRef } from 'react';
import Guddu from '../common/Guddu';
import Celebration from '../common/Celebration';
import GameShell from '../common/GameShell';
import OptionButton from '../common/OptionButton';
import ParentTip from '../common/ParentTip';
import Badge from '../common/Badge';
import { useVoice } from '../../hooks/useVoice';
import { useSound } from '../../hooks/useSound';
import scenarios from '../../data/sharing-scenarios.json';

/* ────────────────────── SVG Animal Characters ────────────────────── */

function Chidiya({ size = 130, happy = false }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Body */}
      <ellipse cx={cx} cy={cy + s * 0.05} rx={s * 0.22} ry={s * 0.18} fill="#8B6914" />
      {/* Belly */}
      <ellipse cx={cx} cy={cy + s * 0.1} rx={s * 0.15} ry={s * 0.13} fill="#D2B48C" />
      {/* Head */}
      <circle cx={cx} cy={cy - s * 0.12} r={s * 0.14} fill="#A0722D" />
      {/* Beak */}
      <polygon
        points={`${cx + s * 0.12},${cy - s * 0.12} ${cx + s * 0.22},${cy - s * 0.1} ${cx + s * 0.12},${cy - s * 0.07}`}
        fill="#FF8C00"
      />
      {/* Eye */}
      <circle cx={cx + s * 0.04} cy={cy - s * 0.15} r={s * 0.025} fill="#333" />
      <circle cx={cx + s * 0.045} cy={cy - s * 0.155} r={s * 0.008} fill="white" />
      {/* Wing */}
      <ellipse
        cx={cx - s * 0.1}
        cy={cy + s * 0.02}
        rx={s * 0.15}
        ry={s * 0.1}
        fill="#7A5B12"
        transform={`rotate(${happy ? -15 : -5} ${cx - s * 0.1} ${cy + s * 0.02})`}
        style={{ transition: 'transform 0.3s ease' }}
      />
      {/* Tail feathers */}
      <polygon
        points={`${cx - s * 0.2},${cy + s * 0.02} ${cx - s * 0.35},${cy - s * 0.08} ${cx - s * 0.32},${cy + s * 0.06}`}
        fill="#6B4E10"
      />
      {/* Legs */}
      <line x1={cx - s * 0.06} y1={cy + s * 0.22} x2={cx - s * 0.06} y2={cy + s * 0.34} stroke="#FF8C00" strokeWidth={2} />
      <line x1={cx + s * 0.06} y1={cy + s * 0.22} x2={cx + s * 0.06} y2={cy + s * 0.34} stroke="#FF8C00" strokeWidth={2} />
      {/* Feet */}
      <line x1={cx - s * 0.1} y1={cy + s * 0.34} x2={cx - s * 0.02} y2={cy + s * 0.34} stroke="#FF8C00" strokeWidth={2} strokeLinecap="round" />
      <line x1={cx + s * 0.02} y1={cy + s * 0.34} x2={cx + s * 0.1} y2={cy + s * 0.34} stroke="#FF8C00" strokeWidth={2} strokeLinecap="round" />
      {/* Happy blush */}
      {happy && (
        <>
          <circle cx={cx - s * 0.06} cy={cy - s * 0.07} r={s * 0.025} fill="#FFB6C1" opacity={0.6} />
          <circle cx={cx + s * 0.1} cy={cy - s * 0.07} r={s * 0.025} fill="#FFB6C1" opacity={0.6} />
        </>
      )}
    </svg>
  );
}

function Titli({ size = 130, happy = false }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Upper left wing */}
      <ellipse cx={cx - s * 0.16} cy={cy - s * 0.1} rx={s * 0.18} ry={s * 0.14} fill="#E91E8C" opacity={0.85}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`0 ${cx} ${cy};${happy ? 15 : 8} ${cx} ${cy};0 ${cx} ${cy}`}
          dur={happy ? '0.3s' : '0.6s'}
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Upper right wing */}
      <ellipse cx={cx + s * 0.16} cy={cy - s * 0.1} rx={s * 0.18} ry={s * 0.14} fill="#A855F7" opacity={0.85}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`0 ${cx} ${cy};${happy ? -15 : -8} ${cx} ${cy};0 ${cx} ${cy}`}
          dur={happy ? '0.3s' : '0.6s'}
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Lower left wing */}
      <ellipse cx={cx - s * 0.14} cy={cy + s * 0.08} rx={s * 0.14} ry={s * 0.11} fill="#FF8C42" opacity={0.8}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`0 ${cx} ${cy};${happy ? 12 : 6} ${cx} ${cy};0 ${cx} ${cy}`}
          dur={happy ? '0.3s' : '0.6s'}
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Lower right wing */}
      <ellipse cx={cx + s * 0.14} cy={cy + s * 0.08} rx={s * 0.14} ry={s * 0.11} fill="#FFCB05" opacity={0.8}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`0 ${cx} ${cy};${happy ? -12 : -6} ${cx} ${cy};0 ${cx} ${cy}`}
          dur={happy ? '0.3s' : '0.6s'}
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Wing inner patterns */}
      <circle cx={cx - s * 0.16} cy={cy - s * 0.1} r={s * 0.05} fill="white" opacity={0.3} />
      <circle cx={cx + s * 0.16} cy={cy - s * 0.1} r={s * 0.05} fill="white" opacity={0.3} />
      {/* Body */}
      <ellipse cx={cx} cy={cy} rx={s * 0.03} ry={s * 0.15} fill="#333" />
      {/* Head */}
      <circle cx={cx} cy={cy - s * 0.17} r={s * 0.045} fill="#333" />
      {/* Antennae */}
      <line x1={cx - s * 0.02} y1={cy - s * 0.2} x2={cx - s * 0.08} y2={cy - s * 0.3} stroke="#333" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={cx - s * 0.08} cy={cy - s * 0.3} r={s * 0.015} fill="#E91E8C" />
      <line x1={cx + s * 0.02} y1={cy - s * 0.2} x2={cx + s * 0.08} y2={cy - s * 0.3} stroke="#333" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={cx + s * 0.08} cy={cy - s * 0.3} r={s * 0.015} fill="#A855F7" />
      {/* Eyes */}
      <circle cx={cx - s * 0.02} cy={cy - s * 0.18} r={s * 0.012} fill="white" />
      <circle cx={cx + s * 0.02} cy={cy - s * 0.18} r={s * 0.012} fill="white" />
    </svg>
  );
}

function Machli({ size = 130, happy = false }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Water bubbles when happy */}
      {happy && (
        <>
          <circle cx={cx + s * 0.2} cy={cy - s * 0.2} r={s * 0.02} fill="none" stroke="#87CEEB" strokeWidth={1} opacity={0.6}>
            <animate attributeName="cy" values={`${cy - s * 0.15};${cy - s * 0.35}`} dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx + s * 0.25} cy={cy - s * 0.12} r={s * 0.015} fill="none" stroke="#87CEEB" strokeWidth={1} opacity={0.4}>
            <animate attributeName="cy" values={`${cy - s * 0.1};${cy - s * 0.3}`} dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      {/* Tail fin */}
      <polygon
        points={`${cx - s * 0.22},${cy} ${cx - s * 0.38},${cy - s * 0.12} ${cx - s * 0.38},${cy + s * 0.12}`}
        fill="#FF8C42"
      />
      {/* Body */}
      <ellipse cx={cx} cy={cy} rx={s * 0.25} ry={s * 0.16} fill="#4A90D9" />
      {/* Belly */}
      <ellipse cx={cx + s * 0.02} cy={cy + s * 0.05} rx={s * 0.18} ry={s * 0.08} fill="#87CEEB" />
      {/* Dorsal fin */}
      <polygon
        points={`${cx - s * 0.05},${cy - s * 0.14} ${cx + s * 0.08},${cy - s * 0.26} ${cx + s * 0.1},${cy - s * 0.14}`}
        fill="#FF8C42"
      />
      {/* Pectoral fin */}
      <ellipse cx={cx - s * 0.02} cy={cy + s * 0.1} rx={s * 0.08} ry={s * 0.04} fill="#3A7BC8" transform={`rotate(20 ${cx - s * 0.02} ${cy + s * 0.1})`} />
      {/* Eye */}
      <circle cx={cx + s * 0.12} cy={cy - s * 0.03} r={s * 0.04} fill="white" />
      <circle cx={cx + s * 0.13} cy={cy - s * 0.03} r={s * 0.02} fill="#333" />
      <circle cx={cx + s * 0.135} cy={cy - s * 0.035} r={s * 0.007} fill="white" />
      {/* Mouth */}
      {happy ? (
        <path
          d={`M ${cx + s * 0.2} ${cy + s * 0.02} Q ${cx + s * 0.22} ${cy + s * 0.06} ${cx + s * 0.19} ${cy + s * 0.05}`}
          fill="none" stroke="#333" strokeWidth={1.5} strokeLinecap="round"
        />
      ) : (
        <circle cx={cx + s * 0.22} cy={cy + s * 0.02} r={s * 0.015} fill="#333" />
      )}
      {/* Scales pattern */}
      <path d={`M ${cx - s * 0.08} ${cy - s * 0.04} Q ${cx - s * 0.04} ${cy - s * 0.08} ${cx} ${cy - s * 0.04}`} fill="none" stroke="#3A7BC8" strokeWidth={1} opacity={0.4} />
      <path d={`M ${cx} ${cy - s * 0.04} Q ${cx + s * 0.04} ${cy - s * 0.08} ${cx + s * 0.08} ${cy - s * 0.04}`} fill="none" stroke="#3A7BC8" strokeWidth={1} opacity={0.4} />
    </svg>
  );
}

/* ────────────────────── Garden Background ────────────────────── */

function GardenBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] via-[#B0E0FF] to-[#90EE90]" />

      {/* Sun */}
      <div className="absolute top-4 right-6 w-14 h-14 rounded-full bg-[#FFD93D] shadow-[0_0_20px_8px_rgba(255,217,61,0.3)]" />

      {/* Clouds */}
      <svg className="absolute top-8 left-4" width="80" height="36" viewBox="0 0 80 36">
        <ellipse cx="30" cy="22" rx="28" ry="14" fill="white" opacity="0.7" />
        <ellipse cx="52" cy="18" rx="22" ry="12" fill="white" opacity="0.7" />
        <ellipse cx="18" cy="18" rx="18" ry="10" fill="white" opacity="0.6" />
      </svg>
      <svg className="absolute top-16 right-16" width="60" height="28" viewBox="0 0 60 28">
        <ellipse cx="24" cy="16" rx="22" ry="11" fill="white" opacity="0.5" />
        <ellipse cx="40" cy="14" rx="18" ry="10" fill="white" opacity="0.5" />
      </svg>

      {/* Mango tree */}
      <svg className="absolute left-0 bottom-20" width="100" height="180" viewBox="0 0 100 180">
        {/* Trunk */}
        <rect x="38" y="90" width="24" height="90" rx="6" fill="#8B6914" />
        <rect x="42" y="95" width="5" height="80" rx="2" fill="#A0822D" opacity="0.4" />
        {/* Canopy */}
        <ellipse cx="50" cy="60" rx="48" ry="55" fill="#2E8B57" />
        <ellipse cx="35" cy="45" rx="30" ry="40" fill="#3CB371" />
        <ellipse cx="65" cy="50" rx="28" ry="35" fill="#228B22" />
        {/* Mangoes */}
        <ellipse cx="30" cy="70" rx="7" ry="9" fill="#FFD700" />
        <ellipse cx="60" cy="55" rx="6" ry="8" fill="#FFA500" />
        <ellipse cx="45" cy="80" rx="7" ry="9" fill="#FFD700" />
        <ellipse cx="70" cy="70" rx="6" ry="8" fill="#FF8C42" />
      </svg>

      {/* Ground/grass */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#228B22] via-[#32CD32] to-[#90EE90] rounded-t-[40px]" />

      {/* Small flowers on grass */}
      <svg className="absolute bottom-6 left-[20%]" width="20" height="20" viewBox="0 0 20 20">
        {[0, 72, 144, 216, 288].map((a, i) => (
          <ellipse key={i} cx="10" cy="5" rx="3" ry="5" fill="#FF69B4" transform={`rotate(${a} 10 10)`} />
        ))}
        <circle cx="10" cy="10" r="3" fill="#FFD700" />
      </svg>
      <svg className="absolute bottom-10 left-[50%]" width="16" height="16" viewBox="0 0 16 16">
        {[0, 72, 144, 216, 288].map((a, i) => (
          <ellipse key={i} cx="8" cy="3" rx="2.5" ry="4" fill="#FFCB05" transform={`rotate(${a} 8 8)`} />
        ))}
        <circle cx="8" cy="8" r="2.5" fill="#FF8C42" />
      </svg>
      <svg className="absolute bottom-4 right-[25%]" width="18" height="18" viewBox="0 0 18 18">
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <ellipse key={i} cx="9" cy="4" rx="2" ry="4" fill="#A855F7" transform={`rotate(${a} 9 9)`} />
        ))}
        <circle cx="9" cy="9" r="2.5" fill="#FFD700" />
      </svg>

      {/* Small pond (right side) */}
      <svg className="absolute bottom-2 right-2" width="80" height="36" viewBox="0 0 80 36">
        <ellipse cx="40" cy="20" rx="38" ry="16" fill="#4A90D9" opacity="0.5" />
        <ellipse cx="40" cy="20" rx="30" ry="12" fill="#87CEEB" opacity="0.4" />
        {/* Water shimmer */}
        <ellipse cx="32" cy="18" rx="10" ry="2" fill="white" opacity="0.3" />
      </svg>
    </div>
  );
}

/* ────────────────────── Speech Bubble ────────────────────── */

function SpeechBubble({ text }) {
  return (
    <div className="relative bg-white/95 rounded-2xl px-5 py-4 shadow-md mx-4 mb-2 max-w-[320px] backdrop-blur-sm">
      <p className="text-base font-semibold text-gray-700 leading-snug text-center">{text}</p>
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '10px solid rgba(255,255,255,0.95)',
        }}
      />
    </div>
  );
}

/* ────────────────────── Floating Hearts ────────────────────── */

function FloatingHearts({ active }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (!active) {
      setHearts([]);
      return;
    }
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 hearts
    const newHearts = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40, // 30%-70% horizontal spread
      size: 18 + Math.random() * 14, // 18-32px
      color: ['#FF6B6B', '#FF1493', '#FF69B4', '#E91E8C', '#FF4D6D'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1,
      drift: -15 + Math.random() * 30, // slight horizontal drift
    }));
    setHearts(newHearts);
    const t = setTimeout(() => setHearts([]), 3000);
    return () => clearTimeout(t);
  }, [active]);

  if (!hearts.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {hearts.map(h => (
        <div
          key={h.id}
          className="absolute"
          style={{
            left: `${h.x}%`,
            bottom: '30%',
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            animation: `heart-float ${h.duration}s ${h.delay}s ease-out forwards`,
          }}
        >
          <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill={h.color}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────── Scene Animal Renderer ────────────────────── */

function SceneAnimal({ scenarioId, happy, size = 130 }) {
  // Map scenario ids to animals
  const animalMap = {
    sharing_food: 'chidiya',
    taking_turns: 'titli',
    including_others: 'machli',
    saying_sorry: 'chidiya',
  };
  const animal = animalMap[scenarioId] || 'chidiya';

  const style = {
    transition: 'transform 0.3s ease',
    transform: happy ? 'scale(1.1)' : 'scale(1)',
  };

  return (
    <div style={style}>
      {animal === 'chidiya' && <Chidiya size={size} happy={happy} />}
      {animal === 'titli' && <Titli size={size} happy={happy} />}
      {animal === 'machli' && <Machli size={size} happy={happy} />}
    </div>
  );
}

/* ────────────────────── Badge Icons (SVG) ────────────────────── */

const BADGES = [
  {
    id: 'share_star',
    icon: '⭐',
    label_en: 'Share Star',
    label_hi: 'शेयर स्टार',
  },
  {
    id: 'turn_taker',
    icon: '🔄',
    label_en: 'Turn-Taker',
    label_hi: 'बारी लेने वाला',
  },
  {
    id: 'includer',
    icon: '👫',
    label_en: 'Includer',
    label_hi: 'सबको शामिल करने वाला',
  },
  {
    id: 'sorry_hero',
    icon: '💖',
    label_en: 'Sorry Hero',
    label_hi: 'सॉरी हीरो',
  },
];

/* ────────────────────── Parent Tip Text ────────────────────── */

const PARENT_TIP_EN =
  "Role-play these scenarios at home with stuffed animals or dolls. When your child practices sharing and turn-taking in play, they internalize it faster. Praise the BEHAVIOR not the child: 'That was kind sharing!' rather than 'You're a good boy/girl.'";
const PARENT_TIP_HI =
  "इन परिदृश्यों को घर पर गुड़ियों या भरवां जानवरों के साथ अभिनय करें। जब आपका बच्चा खेल में बाँटना और बारी लेना अभ्यास करता है, तो वह इसे तेज़ी से सीखता है। बच्चे की नहीं, व्यवहार की तारीफ़ करें: 'बहुत अच्छा बाँटा!' न कि 'तुम अच्छे बच्चे हो।'";

/* ────────────────────── Dancing Animals (Celebration) ────────────────────── */

function DancingAnimals() {
  return (
    <div className="flex items-end justify-center gap-2 mt-2">
      <div className="animate-wiggle" style={{ animationIterationCount: 'infinite', animationDuration: '0.8s' }}>
        <Chidiya size={70} happy />
      </div>
      <div className="animate-wiggle" style={{ animationIterationCount: 'infinite', animationDuration: '0.7s', animationDelay: '0.15s' }}>
        <Titli size={80} happy />
      </div>
      <div className="animate-wiggle" style={{ animationIterationCount: 'infinite', animationDuration: '0.9s', animationDelay: '0.3s' }}>
        <Machli size={70} happy />
      </div>
    </div>
  );
}

/* ────────────────────── Main Component ────────────────────── */

const TOTAL_ROUNDS = 4;

export default function AnimalFriends({ onComplete, onBack, language = 'en', childName = '' }) {
  const [gameState, setGameState] = useState('intro'); // intro | playing | nudge | response | celebration
  const [currentRound, setCurrentRound] = useState(0);
  const [showHearts, setShowHearts] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gudduEmotion, setGudduEmotion] = useState('happy');
  const [animalHappy, setAnimalHappy] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [nudgeText, setNudgeText] = useState('');
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [badgeRevealIndex, setBadgeRevealIndex] = useState(-1);

  const { speak, speakSequence, stop } = useVoice(language);
  const { success, tap, celebrate, gentle } = useSound();
  const timeoutsRef = useRef([]);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [stop]);

  const scenario = scenarios[currentRound] || scenarios[0];

  /* ────────── Intro ────────── */
  useEffect(() => {
    if (gameState === 'intro') {
      setGudduEmotion('happy');
      const introEn = childName
        ? `Hi ${childName}! I'm Guddu! Welcome to my garden! Let's learn to be good friends!`
        : "Hi! I'm Guddu! Welcome to my garden! Let's learn to be good friends!";
      const introHi = childName
        ? `नमस्ते ${childName}! मैं गुड्डू हूँ! मेरे बगीचे में आपका स्वागत है! चलो अच्छे दोस्त बनना सीखें!`
        : "नमस्ते! मैं गुड्डू हूँ! मेरे बगीचे में आपका स्वागत है! चलो अच्छे दोस्त बनना सीखें!";
      speak(introEn, introHi);
      schedule(() => {
        setGameState('playing');
      }, 3500);
    }
  }, [gameState, speak, schedule, childName]);

  /* ────────── Speak scenario + options when playing ────────── */
  useEffect(() => {
    if (gameState === 'playing') {
      setGudduEmotion('neutral');
      setAnimalHappy(false);
      setDisabled(false);
      speakSequence([
        { en: scenario.scene_en, hi: scenario.scene_hi },
        { en: `Green heart: ${scenario.kind_option_en}`, hi: `हरा दिल: ${scenario.kind_option_hi}` },
        { en: `Or: ${scenario.other_option_en}`, hi: `या: ${scenario.other_option_hi}` },
      ]);
    }
  }, [gameState, currentRound, scenario, speakSequence]);

  /* ────────── Handle Kind Choice ────────── */
  const handleKindChoice = useCallback(() => {
    if (disabled) return;
    setDisabled(true);
    tap();
    setGudduEmotion('happy');
    setAnimalHappy(true);
    success();

    // Show hearts
    setShowHearts(true);
    schedule(() => setShowHearts(false), 2500);

    // Show kind response
    const resp = language === 'hi' ? scenario.kind_response_hi : scenario.kind_response_en;
    setResponseText(resp);
    setGameState('response');
    const speechDone = speak(scenario.kind_response_en, scenario.kind_response_hi);

    // After response, move to next round or celebration
    schedule(() => {
      setGudduEmotion('celebrating');
      setShowCelebration(true);
    }, 2000);

    speechDone.then(() => {
      schedule(() => {
        setShowCelebration(false);
        setShowHearts(false);
        setAnimalHappy(false);
        setResponseText('');

        if (currentRound < TOTAL_ROUNDS - 1) {
          setCurrentRound(prev => prev + 1);
          setGameState('playing');
        } else {
          // All rounds complete - celebration
          setGameState('celebration');
          setGudduEmotion('celebrating');
          celebrate();
          setEarnedBadges(BADGES.map(b => b.id));
        }
      }, 500);
    });
  }, [disabled, tap, success, celebrate, language, scenario, currentRound, schedule, speak]);

  /* ────────── Handle Other Choice (nudge) ────────── */
  const handleOtherChoice = useCallback(() => {
    if (disabled) return;
    setDisabled(true);
    tap();
    setGudduEmotion('sad');
    setAnimalHappy(false);
    gentle();

    const nudge = language === 'hi' ? scenario.nudge_hi : scenario.nudge_en;
    setNudgeText(nudge);
    setGameState('nudge');
    const nudgeDone = speak(scenario.nudge_en, scenario.nudge_hi);

    // After nudge speech finishes, auto-guide to kind response (second chance)
    nudgeDone.then(() => {
      schedule(() => {
        setGudduEmotion('happy');
        setAnimalHappy(true);
        success();
        setShowHearts(true);

        const resp = language === 'hi' ? scenario.kind_response_hi : scenario.kind_response_en;
        setResponseText(resp);
        setNudgeText('');
        setGameState('response');
        const responseDone = speak(scenario.kind_response_en, scenario.kind_response_hi);

        schedule(() => setShowHearts(false), 2500);

        schedule(() => {
          setShowCelebration(true);
          setGudduEmotion('celebrating');
        }, 2000);

        responseDone.then(() => {
          schedule(() => {
            setShowCelebration(false);
            setAnimalHappy(false);
            setResponseText('');

            if (currentRound < TOTAL_ROUNDS - 1) {
              setCurrentRound(prev => prev + 1);
              setGameState('playing');
            } else {
              setGameState('celebration');
              setGudduEmotion('celebrating');
              celebrate();
              setEarnedBadges(BADGES.map(b => b.id));
            }
          }, 500);
        });
      }, 500);
    });
  }, [disabled, tap, gentle, success, celebrate, language, scenario, currentRound, schedule, speak]);

  /* ────────── Badge reveal animation in celebration ────────── */
  useEffect(() => {
    if (gameState !== 'celebration') return;

    const revealEn = childName
      ? `${childName}, you're an amazing friend! Look at all the badges you earned!`
      : "You're an amazing friend! Look at all the badges you earned!";
    const revealHi = childName
      ? `${childName}, तुम एक शानदार दोस्त हो! देखो तुमने कितने बैज कमाए!`
      : "तुम एक शानदार दोस्त हो! देखो तुमने कितने बैज कमाए!";
    speak(revealEn, revealHi);

    // Reveal badges one by one with ding sound
    BADGES.forEach((_, i) => {
      schedule(() => {
        setBadgeRevealIndex(i);
        // Play a short ding for each badge
        tap();
      }, 1200 + i * 800);
    });
  }, [gameState, speak, schedule, tap, childName]);

  /* ────────── Render ────────── */

  const sceneText = language === 'hi' ? scenario.scene_hi : scenario.scene_en;
  const kindText = language === 'hi' ? scenario.kind_option_hi : scenario.kind_option_en;
  const otherText = language === 'hi' ? scenario.other_option_hi : scenario.other_option_en;

  return (
    <GameShell
      onBack={onBack}
      title={language === 'hi' ? 'जानवर दोस्त' : 'Animal Friends'}
      round={gameState === 'celebration' ? TOTAL_ROUNDS : currentRound}
      totalRounds={TOTAL_ROUNDS}
      bg="bg-transparent"
    >
      {/* Heart float animation keyframes */}
      <style>{`
        @keyframes heart-float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 1;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateY(-160px) translateX(${Math.random() > 0.5 ? '' : '-'}20px) scale(0.4);
            opacity: 0;
          }
        }
      `}</style>

      <Celebration active={showCelebration} type="stars" />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Garden background behind everything */}
        <GardenBackground />

        {/* ────── INTRO STATE ────── */}
        {gameState === 'intro' && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-4 animate-bounce-in">
            <SpeechBubble
              text={
                language === 'hi'
                  ? childName
                    ? `नमस्ते ${childName}! मैं गुड्डू हूँ! चलो अच्छे दोस्त बनना सीखें!`
                    : 'नमस्ते! मैं गुड्डू हूँ! चलो अच्छे दोस्त बनना सीखें!'
                  : childName
                    ? `Hi ${childName}! I'm Guddu! Let's learn to be good friends!`
                    : "Hi! I'm Guddu! Let's learn to be good friends!"
              }
            />
            <Guddu emotion="happy" size={160} animate />
            {/* Intro animals peek in */}
            <div className="flex items-end justify-center gap-4 mt-2">
              <div className="animate-bounce-in" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
                <Chidiya size={60} happy />
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
                <Titli size={70} happy />
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: '0.9s', opacity: 0, animationFillMode: 'forwards' }}>
                <Machli size={60} happy />
              </div>
            </div>
          </div>
        )}

        {/* ────── PLAYING / NUDGE / RESPONSE STATES ────── */}
        {(gameState === 'playing' || gameState === 'nudge' || gameState === 'response') && (
          <div className="relative z-10 flex-1 flex flex-col">
            {/* Floating hearts overlay */}
            <FloatingHearts active={showHearts} />

            {/* Top: speech bubble + characters */}
            <div className="flex flex-col items-center pt-2 px-4">
              <SpeechBubble
                text={
                  gameState === 'response'
                    ? responseText
                    : gameState === 'nudge'
                      ? nudgeText
                      : sceneText
                }
              />

              {/* Characters row: Guddu + scene animal */}
              <div className="flex items-end justify-center gap-3 mt-1">
                <Guddu emotion={gudduEmotion} size={120} animate />
                <SceneAnimal
                  scenarioId={scenario.id}
                  happy={animalHappy}
                  size={100}
                />
              </div>
            </div>

            {/* Options */}
            <div className="px-5 mt-4 space-y-3">
              {gameState === 'nudge' ? (
                <div className="text-center px-4 py-2">
                  <p className="text-sm text-gray-500 italic">
                    {language === 'hi' ? 'सोचो... क्या सही है?' : 'Thinking... what is right?'}
                  </p>
                </div>
              ) : gameState === 'response' ? null : (
                <>
                  <OptionButton
                    onClick={handleKindChoice}
                    icon="💚"
                    variant="kind"
                    disabled={disabled}
                  >
                    {kindText}
                  </OptionButton>
                  <OptionButton
                    onClick={handleOtherChoice}
                    icon="🤔"
                    variant="neutral"
                    disabled={disabled}
                  >
                    {otherText}
                  </OptionButton>
                </>
              )}
            </div>

            {/* Spacer to push content up from grass */}
            <div className="mt-auto h-24" />
          </div>
        )}

        {/* ────── CELEBRATION STATE ────── */}
        {gameState === 'celebration' && (
          <div className="relative z-10 flex-1 flex flex-col">
            {/* Title */}
            <div className="text-center pt-4 px-4">
              <h2 className="text-xl font-extrabold text-white drop-shadow-md animate-bounce-in">
                {language === 'hi'
                  ? childName
                    ? `शाबाश ${childName}! तुम सच्चे दोस्त हो!`
                    : 'शाबाश! तुम सच्चे दोस्त हो!'
                  : childName
                    ? `Amazing ${childName}! You are a true friend!`
                    : 'Amazing! You are a true friend!'}
              </h2>
            </div>

            {/* Dancing Guddu + animals */}
            <div className="flex flex-col items-center mt-2">
              <div className="animate-wiggle" style={{ animationIterationCount: 'infinite', animationDuration: '0.6s' }}>
                <Guddu emotion="celebrating" size={110} animate />
              </div>
              <DancingAnimals />
            </div>

            {/* Badges */}
            <div className="mx-4 mt-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <p className="text-center text-sm font-bold text-gray-600 mb-3">
                {language === 'hi' ? 'तुम्हारे बैज' : 'Your Badges'}
              </p>
              <div className="flex justify-center gap-3">
                {BADGES.map((badge, i) => (
                  <div
                    key={badge.id}
                    className={i <= badgeRevealIndex ? 'animate-bounce-in' : 'opacity-0'}
                    style={{
                      animationFillMode: 'forwards',
                      animationDelay: '0s',
                    }}
                  >
                    <Badge
                      icon={badge.icon}
                      label={language === 'hi' ? badge.label_hi : badge.label_en}
                      earned={earnedBadges.includes(badge.id)}
                      size={60}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Finish button + Parent Tip */}
            <div className="px-5 pb-5 pt-4 mt-auto space-y-2">
              <button
                onClick={onComplete}
                className="w-full py-4 rounded-2xl bg-[#2DC653] text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
              >
                {language === 'hi' ? 'शाबाश! पूरा हुआ!' : 'Well done! Finish!'}
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
