import { useState, useEffect, useCallback, useRef } from 'react';
import Guddu from '../common/Guddu';
import Celebration from '../common/Celebration';
import GameShell from '../common/GameShell';
import ParentTip from '../common/ParentTip';
import { useVoice } from '../../hooks/useVoice';
import { useSound } from '../../hooks/useSound';
import shapesData from '../../data/shapes.json';

const TOTAL_ROUNDS = shapesData.length;

// Shape fill colors for the options
const SHAPE_COLORS = {
  triangle: '#FF8C42',
  circle: '#0077B6',
  square: '#2DC653',
  rectangle: '#E91E8C',
  diamond: '#A855F7',
};

// ---------------------------------------------------------------------------
// Inline SVG pictures for each round
// ---------------------------------------------------------------------------

function HousePicture({ completed, pulseDone }) {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Chimney */}
      <rect x="140" y="50" width="18" height="40" fill="#8B4513" rx="2" />
      {/* Body */}
      <rect x="40" y="100" width="120" height="80" fill="#E8B87C" stroke="#5D3A1A" strokeWidth="2" rx="3" />
      {/* Door */}
      <rect x="82" y="135" width="36" height="45" fill="#5D3A1A" rx="3" />
      <circle cx="112" cy="160" r="3" fill="#FFCB05" />
      {/* Window left */}
      <rect x="52" y="115" width="22" height="22" fill="#87CEEB" stroke="#5D3A1A" strokeWidth="1.5" rx="2" />
      {/* Window right */}
      <rect x="126" y="115" width="22" height="22" fill="#87CEEB" stroke="#5D3A1A" strokeWidth="1.5" rx="2" />
      {/* Roof - missing or complete */}
      {completed ? (
        <polygon
          points="100,30 30,100 170,100"
          fill="#D94F4F"
          stroke="#8B2020"
          strokeWidth="2"
          className={pulseDone ? 'animate-bounce-in' : ''}
        />
      ) : (
        <polygon
          points="100,30 30,100 170,100"
          fill="none"
          stroke="#999"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
      )}
      {/* Grass */}
      <rect x="0" y="180" width="200" height="20" fill="#7EC850" rx="4" />
    </svg>
  );
}

function CarPicture({ completed, pulseDone }) {
  return (
    <svg viewBox="0 0 220 140" className="w-full h-full">
      {/* Body */}
      <rect x="20" y="50" width="180" height="50" fill="#4A90D9" stroke="#2A5A8A" strokeWidth="2" rx="10" />
      {/* Roof */}
      <path d="M60,50 L80,20 L160,20 L180,50" fill="#3A80C9" stroke="#2A5A8A" strokeWidth="2" />
      {/* Windshield */}
      <path d="M82,24 L68,48 L130,48 L130,24 Z" fill="#C8E6FF" stroke="#2A5A8A" strokeWidth="1" />
      {/* Rear window */}
      <path d="M135,24 L135,48 L172,48 L158,24 Z" fill="#C8E6FF" stroke="#2A5A8A" strokeWidth="1" />
      {/* Headlight */}
      <rect x="188" y="58" width="12" height="10" fill="#FFEB3B" rx="2" />
      {/* Tail light */}
      <rect x="20" y="58" width="8" height="10" fill="#F44336" rx="2" />
      {/* Wheels - missing or complete */}
      {completed ? (
        <>
          <circle cx="65" cy="100" r="20" fill="#333" stroke="#111" strokeWidth="2" className={pulseDone ? 'animate-bounce-in' : ''} />
          <circle cx="65" cy="100" r="10" fill="#888" />
          <circle cx="155" cy="100" r="20" fill="#333" stroke="#111" strokeWidth="2" className={pulseDone ? 'animate-bounce-in' : ''} />
          <circle cx="155" cy="100" r="10" fill="#888" />
        </>
      ) : (
        <>
          <circle cx="65" cy="100" r="20" fill="none" stroke="#999" strokeWidth="2" strokeDasharray="6 4" className="animate-pulse" />
          <circle cx="155" cy="100" r="20" fill="none" stroke="#999" strokeWidth="2" strokeDasharray="6 4" className="animate-pulse" />
        </>
      )}
      {/* Road */}
      <rect x="0" y="120" width="220" height="20" fill="#666" rx="3" />
      <line x1="10" y1="130" x2="40" y2="130" stroke="#FFD" strokeWidth="2" strokeDasharray="8 6" />
      <line x1="70" y1="130" x2="100" y2="130" stroke="#FFD" strokeWidth="2" strokeDasharray="8 6" />
      <line x1="130" y1="130" x2="160" y2="130" stroke="#FFD" strokeWidth="2" strokeDasharray="8 6" />
      <line x1="190" y1="130" x2="210" y2="130" stroke="#FFD" strokeWidth="2" strokeDasharray="8 6" />
    </svg>
  );
}

function TrainPicture({ completed, pulseDone }) {
  return (
    <svg viewBox="0 0 220 150" className="w-full h-full">
      {/* Engine body */}
      <rect x="10" y="50" width="90" height="60" fill="#D94F4F" stroke="#8B2020" strokeWidth="2" rx="6" />
      {/* Smokestack */}
      <rect x="25" y="30" width="16" height="25" fill="#555" rx="3" />
      <ellipse cx="33" cy="28" rx="12" ry="6" fill="#999" />
      {/* Smoke puffs */}
      <circle cx="30" cy="18" r="6" fill="#DDD" opacity="0.7" />
      <circle cx="22" cy="10" r="5" fill="#DDD" opacity="0.5" />
      <circle cx="36" cy="6" r="4" fill="#DDD" opacity="0.3" />
      {/* Cabin */}
      <rect x="60" y="35" width="40" height="75" fill="#B83030" stroke="#8B2020" strokeWidth="2" rx="4" />
      {/* Cabin roof */}
      <rect x="56" y="30" width="48" height="8" fill="#8B2020" rx="3" />
      {/* Cabin window */}
      <rect x="68" y="44" width="24" height="20" fill="#87CEEB" stroke="#8B2020" strokeWidth="1.5" rx="3" />
      {/* Cargo car */}
      <rect x="110" y="60" width="70" height="50" fill="#4A90D9" stroke="#2A5A8A" strokeWidth="2" rx="4" />
      {/* Cargo window - missing or complete */}
      {completed ? (
        <rect
          x="127" y="70" width="36" height="30"
          fill="#87CEEB" stroke="#2A5A8A" strokeWidth="2" rx="2"
          className={pulseDone ? 'animate-bounce-in' : ''}
        />
      ) : (
        <rect
          x="127" y="70" width="36" height="30"
          fill="none" stroke="#999" strokeWidth="2" strokeDasharray="5 3" rx="2"
          className="animate-pulse"
        />
      )}
      {/* Waving person when complete */}
      {completed && (
        <g className="animate-bounce-in">
          <circle cx="145" cy="78" r="5" fill="#FFDAB9" />
          <line x1="150" y1="82" x2="155" y2="76" stroke="#FFDAB9" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {/* Connector */}
      <rect x="100" y="80" width="12" height="6" fill="#555" rx="1" />
      {/* Wheels */}
      <circle cx="30" cy="115" r="12" fill="#333" stroke="#111" strokeWidth="2" />
      <circle cx="30" cy="115" r="5" fill="#888" />
      <circle cx="75" cy="115" r="12" fill="#333" stroke="#111" strokeWidth="2" />
      <circle cx="75" cy="115" r="5" fill="#888" />
      <circle cx="130" cy="115" r="12" fill="#333" stroke="#111" strokeWidth="2" />
      <circle cx="130" cy="115" r="5" fill="#888" />
      <circle cx="170" cy="115" r="12" fill="#333" stroke="#111" strokeWidth="2" />
      <circle cx="170" cy="115" r="5" fill="#888" />
      {/* Track */}
      <rect x="0" y="127" width="220" height="6" fill="#8B7355" rx="2" />
      <rect x="0" y="133" width="220" height="4" fill="#666" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={5 + i * 18} y="137" width="10" height="4" fill="#8B7355" rx="1" />
      ))}
    </svg>
  );
}

function KitePicture({ completed, pulseDone }) {
  return (
    <svg viewBox="0 0 160 220" className="w-full h-full">
      {/* String */}
      <line x1="80" y1="130" x2="80" y2="210" stroke="#8B7355" strokeWidth="1.5" />
      {/* Tail bows */}
      <g>
        <path d="M74,150 Q80,145 86,150" fill="none" stroke="#FF6B6B" strokeWidth="2" />
        <path d="M72,170 Q80,165 88,170" fill="none" stroke="#4FC3F7" strokeWidth="2" />
        <path d="M74,190 Q80,185 86,190" fill="none" stroke="#FFCB05" strokeWidth="2" />
      </g>
      {/* Cross sticks - shown behind the kite shape */}
      <line x1="80" y1="20" x2="80" y2="130" stroke="#8B7355" strokeWidth="2" />
      <line x1="30" y1="60" x2="130" y2="60" stroke="#8B7355" strokeWidth="2" />
      {/* Diamond shape - missing or complete */}
      {completed ? (
        <polygon
          points="80,20 130,60 80,130 30,60"
          fill="#FF8C42"
          stroke="#CC5500"
          strokeWidth="2"
          className={pulseDone ? 'animate-bounce-in' : ''}
        />
      ) : (
        <polygon
          points="80,20 130,60 80,130 30,60"
          fill="none"
          stroke="#999"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
      )}
      {/* Cross sticks - in front when complete for visual detail */}
      {completed && (
        <>
          <line x1="80" y1="20" x2="80" y2="130" stroke="#8B7355" strokeWidth="1.5" opacity="0.5" />
          <line x1="30" y1="60" x2="130" y2="60" stroke="#8B7355" strokeWidth="1.5" opacity="0.5" />
        </>
      )}
      {/* Clouds */}
      <ellipse cx="25" cy="25" rx="18" ry="10" fill="#FFF" opacity="0.6" />
      <ellipse cx="140" cy="15" rx="15" ry="8" fill="#FFF" opacity="0.5" />
    </svg>
  );
}

function IceCreamPicture({ completed, pulseDone }) {
  return (
    <svg viewBox="0 0 140 200" className="w-full h-full">
      {/* Cone - missing or complete */}
      {completed ? (
        <polygon
          points="40,100 100,100 70,190"
          fill="#D2A060"
          stroke="#8B6914"
          strokeWidth="2"
          className={pulseDone ? 'animate-bounce-in' : ''}
        />
      ) : (
        <polygon
          points="40,100 100,100 70,190"
          fill="none"
          stroke="#999"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
      )}
      {/* Waffle lines on cone when complete */}
      {completed && (
        <g opacity="0.3">
          <line x1="48" y1="115" x2="92" y2="115" stroke="#8B6914" strokeWidth="1" />
          <line x1="53" y1="130" x2="87" y2="130" stroke="#8B6914" strokeWidth="1" />
          <line x1="58" y1="145" x2="82" y2="145" stroke="#8B6914" strokeWidth="1" />
          <line x1="63" y1="160" x2="77" y2="160" stroke="#8B6914" strokeWidth="1" />
          <line x1="50" y1="110" x2="70" y2="180" stroke="#8B6914" strokeWidth="1" />
          <line x1="70" y1="110" x2="70" y2="185" stroke="#8B6914" strokeWidth="1" />
          <line x1="90" y1="110" x2="70" y2="180" stroke="#8B6914" strokeWidth="1" />
        </g>
      )}
      {/* Scoop */}
      <path d="M35,100 A35,35 0 0,1 105,100" fill="#F48FB1" stroke="#C2185B" strokeWidth="2" />
      {/* Scoop highlight */}
      <ellipse cx="60" cy="82" rx="10" ry="6" fill="#F8BBD0" opacity="0.6" />
      {/* Cherry */}
      <circle cx="70" cy="62" r="8" fill="#F44336" stroke="#C62828" strokeWidth="1.5" />
      <ellipse cx="67" cy="59" rx="3" ry="2" fill="#FF8A80" opacity="0.7" />
      {/* Cherry stem */}
      <path d="M70,54 Q75,45 72,40" fill="none" stroke="#4CAF50" strokeWidth="1.5" />
      {/* Leaf */}
      <ellipse cx="74" cy="42" rx="5" ry="3" fill="#4CAF50" transform="rotate(-30 74 42)" />
    </svg>
  );
}

const PICTURE_COMPONENTS = {
  house: HousePicture,
  car: CarPicture,
  train: TrainPicture,
  kite: KitePicture,
  icecream: IceCreamPicture,
};

// ---------------------------------------------------------------------------
// Shape option SVGs (80px touch targets)
// ---------------------------------------------------------------------------

function ShapeOption({ shape, size = 80, onClick, disabled, wiggle }) {
  const color = SHAPE_COLORS[shape] || '#999';
  const half = size / 2;

  const renderShape = () => {
    switch (shape) {
      case 'triangle':
        return (
          <polygon
            points={`${half},${size * 0.1} ${size * 0.9},${size * 0.9} ${size * 0.1},${size * 0.9}`}
            fill={color}
            stroke="#222"
            strokeWidth="3"
          />
        );
      case 'circle':
        return (
          <circle
            cx={half}
            cy={half}
            r={half * 0.8}
            fill={color}
            stroke="#222"
            strokeWidth="3"
          />
        );
      case 'square':
        return (
          <rect
            x={size * 0.12}
            y={size * 0.12}
            width={size * 0.76}
            height={size * 0.76}
            fill={color}
            stroke="#222"
            strokeWidth="3"
            rx="3"
          />
        );
      case 'rectangle':
        return (
          <rect
            x={size * 0.08}
            y={size * 0.2}
            width={size * 0.84}
            height={size * 0.6}
            fill={color}
            stroke="#222"
            strokeWidth="3"
            rx="3"
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${half},${size * 0.08} ${size * 0.92},${half} ${half},${size * 0.92} ${size * 0.08},${half}`}
            fill={color}
            stroke="#222"
            strokeWidth="3"
          />
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center rounded-2xl bg-white shadow-md
        active:scale-90 transition-transform duration-150
        ${wiggle ? 'animate-wiggle' : ''}
      `}
      style={{ width: size, height: size, minWidth: size }}
      aria-label={shape}
    >
      <svg width={size * 0.75} height={size * 0.75} viewBox={`0 0 ${size} ${size}`}>
        {renderShape()}
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Parade item for celebration phase
// ---------------------------------------------------------------------------

function ParadeItem({ picture, index }) {
  const PictureComponent = PICTURE_COMPONENTS[picture];
  if (!PictureComponent) return null;

  return (
    <div
      className="inline-block w-20 h-20 mx-3 flex-shrink-0"
      style={{
        animation: `parade-slide 8s linear infinite`,
        animationDelay: `${index * 1.5}s`,
      }}
    >
      <PictureComponent completed pulseDone={false} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ShapeWorld({ onComplete, onBack, language = 'en', childName = '' }) {
  const [phase, setPhase] = useState('intro'); // intro | playing | correct_feedback | celebration
  const [round, setRound] = useState(0);
  const [completedPictures, setCompletedPictures] = useState([]);
  const [wrongShake, setWrongShake] = useState(null); // index of wrong option being wiggled
  const [flyingShape, setFlyingShape] = useState(null);
  const [picturePulse, setPicturePulse] = useState(false);
  const [gudduEmotion, setGudduEmotion] = useState('happy');

  const timerRef = useRef(null);
  const { speak, stop } = useVoice(language);
  const sound = useSound();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stop]);

  // Intro phase
  useEffect(() => {
    if (phase === 'intro') {
      speak(
        childName
          ? `${childName}, Guddu is building things! Help him find the right shapes!`
          : "Guddu is building things! Help him find the right shapes!",
        childName
          ? `${childName}, गुड्डू चीज़ें बना रहा है! उसे सही आकार ढूँढने में मदद करो!`
          : "गुड्डू चीज़ें बना रहा है! उसे सही आकार ढूँढने में मदद करो!"
      );
      timerRef.current = setTimeout(() => {
        setPhase('playing');
      }, 3000);
    }
  }, [phase, speak, childName]);

  // Speaking round descriptions
  useEffect(() => {
    if (phase === 'playing' && round < TOTAL_ROUNDS) {
      const data = shapesData[round];
      speak(data.description_en, data.description_hi);
    }
  }, [phase, round, speak]);

  // Celebration phase
  useEffect(() => {
    if (phase === 'celebration') {
      sound.celebrate();
      speak(
        childName
          ? `${childName}, you're a shape master!`
          : "You're a shape master!",
        childName
          ? `${childName}, तुम आकार के उस्ताद हो!`
          : "तुम आकार के उस्ताद हो!"
      );
      timerRef.current = setTimeout(() => {
        onComplete?.();
      }, 5000);
    }
  }, [phase, sound, speak, onComplete, childName]);

  const currentData = shapesData[round] || shapesData[0];
  const isCompleted = completedPictures.includes(round);

  const handleOptionTap = useCallback((shape, optionIndex) => {
    if (phase !== 'playing' || flyingShape !== null) return;

    sound.tap();

    if (shape === currentData.missing_shape) {
      // Correct!
      setFlyingShape(shape);
      setGudduEmotion('celebrating');

      // After shape flies and snaps
      timerRef.current = setTimeout(() => {
        sound.success();
        setCompletedPictures(prev => [...prev, round]);
        setFlyingShape(null);
        setPicturePulse(true);
        setPhase('correct_feedback');

        // Speak completion text
        speak(currentData.completion_en, currentData.completion_hi);

        // Brief pulse then advance
        setTimeout(() => {
          setPicturePulse(false);
        }, 600);

        setTimeout(() => {
          if (round + 1 < TOTAL_ROUNDS) {
            setRound(prev => prev + 1);
            setPhase('playing');
            setGudduEmotion('happy');
          } else {
            setPhase('celebration');
            setGudduEmotion('celebrating');
          }
        }, 2200);
      }, 700); // duration of fly animation
    } else {
      // Wrong
      setWrongShake(optionIndex);
      sound.gentle();
      speak(
        childName
          ? `Hmm ${childName}, try another shape!`
          : "Hmm, try another shape!",
        childName
          ? `हम्म ${childName}, कोई और आकार आज़माओ!`
          : "हम्म, कोई और आकार आज़माओ!"
      );
      setGudduEmotion('surprised');

      timerRef.current = setTimeout(() => {
        setWrongShake(null);
        setGudduEmotion('happy');
      }, 600);
    }
  }, [phase, flyingShape, currentData, round, sound, speak, childName]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const PictureComponent = PICTURE_COMPONENTS[currentData.picture];

  // Intro screen
  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={language === 'hi' ? 'आकार की दुनिया' : 'Shape World'} bg="bg-[#FFF5E6]">
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Workshop background hint */}
          <div className="relative">
            <div className="absolute -inset-8 bg-[#F5E6D0] rounded-3xl -z-10 opacity-60" />
            <Guddu emotion="happy" size={160} animate />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {language === 'hi' ? 'आकार की दुनिया' : 'Shape World'}
            </h2>
            <p className="text-base text-gray-500 leading-relaxed max-w-[280px] mx-auto">
              {language === 'hi'
                ? (childName
                    ? `${childName}, गुड्डू चीज़ें बना रहा है! उसे सही आकार ढूँढने में मदद करो!`
                    : 'गुड्डू चीज़ें बना रहा है! उसे सही आकार ढूँढने में मदद करो!')
                : (childName
                    ? `${childName}, Guddu is building things! Help him find the right shapes!`
                    : "Guddu is building things! Help him find the right shapes!")}
            </p>
          </div>
          {/* Decorative shapes floating */}
          <div className="flex gap-4 mt-2">
            {['triangle', 'circle', 'square'].map((s, i) => (
              <div
                key={s}
                className="animate-bounce-in"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <ShapeOption shape={s} size={56} onClick={() => {}} disabled />
              </div>
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  // Celebration screen
  if (phase === 'celebration') {
    return (
      <GameShell onBack={onBack} title={language === 'hi' ? 'आकार की दुनिया' : 'Shape World'} bg="bg-[#FFF5E6]">
        <Celebration active type="confetti" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <Guddu emotion="celebrating" size={140} animate />
          <h2 className="text-2xl font-bold text-gray-700 text-center">
            {language === 'hi'
              ? (childName ? `${childName}, तुम आकार के उस्ताद हो!` : 'तुम आकार के उस्ताद हो!')
              : (childName ? `${childName}, you're a shape master!` : "You're a shape master!")}
          </h2>
          {/* Parade of completed objects */}
          <div className="w-full overflow-hidden mt-4">
            <div className="flex items-center justify-center">
              {shapesData.map((item, i) => {
                const PC = PICTURE_COMPONENTS[item.picture];
                return (
                  <div
                    key={item.picture}
                    className="inline-block w-16 h-16 mx-2 flex-shrink-0 animate-bounce-in"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <PC completed pulseDone={false} />
                  </div>
                );
              })}
            </div>
          </div>
          <ParentTip
            tipEn="Play 'shape hunt' at home! Walk around and ask: 'Can you find something round? Something square?' Real-world shape recognition builds the foundation for geometry and spatial reasoning."
            tipHi="घर पर 'आकार की खोज' खेलें! घूमें और पूछें: 'क्या तुम कुछ गोल ढूँढ सकते हो? कुछ चौकोर?' असली दुनिया में आकार पहचानना ज्यामिति और स्थानिक समझ की नींव बनाता है।"
            language={language}
          />
        </div>
      </GameShell>
    );
  }

  // Playing / correct_feedback
  return (
    <GameShell
      onBack={onBack}
      title={language === 'hi' ? 'आकार की दुनिया' : 'Shape World'}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      bg="bg-[#FFF5E6]"
    >
      {/* Flying shape animation CSS */}
      <style>{`
        @keyframes fly-to-spot {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          40% {
            transform: translate(0, -80px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translate(0, -200px) scale(0.6);
            opacity: 0;
          }
        }
        .fly-shape {
          animation: fly-to-spot 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes picture-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .picture-pulse {
          animation: picture-pulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div className="flex-1 flex flex-col items-center justify-between px-4 pb-4">
        {/* Guddu + speech */}
        <div className="flex items-center gap-3 w-full mt-1 mb-2">
          <Guddu
            emotion={gudduEmotion}
            size={64}
            animate
          />
          <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm flex-1">
            <p className="text-sm text-gray-600 leading-snug">
              {phase === 'correct_feedback'
                ? (language === 'hi' ? currentData.completion_hi : currentData.completion_en)
                : (language === 'hi' ? currentData.description_hi : currentData.description_en)}
            </p>
          </div>
        </div>

        {/* Picture area - 60% of remaining space */}
        <div
          className={`flex-1 flex items-center justify-center w-full max-w-[300px] ${picturePulse ? 'picture-pulse' : ''}`}
          style={{ maxHeight: '55vh' }}
        >
          {PictureComponent && (
            <PictureComponent
              completed={isCompleted || phase === 'correct_feedback'}
              pulseDone={phase === 'correct_feedback'}
            />
          )}
        </div>

        {/* Shape options */}
        <div className="w-full mt-3 mb-1">
          <div className="flex items-center justify-center gap-5">
            {currentData.options.map((shape, idx) => (
              <div key={`${round}-${shape}-${idx}`} className="relative">
                <ShapeOption
                  shape={shape}
                  size={80}
                  onClick={() => handleOptionTap(shape, idx)}
                  disabled={phase === 'correct_feedback' || flyingShape !== null}
                  wiggle={wrongShake === idx}
                />
                {/* Flying duplicate when this is the correct shape being animated */}
                {flyingShape === shape && shape === currentData.options[idx] && idx === currentData.options.indexOf(shape) && (
                  <div className="absolute inset-0 fly-shape pointer-events-none">
                    <ShapeOption shape={shape} size={80} onClick={() => {}} disabled />
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Shape name label */}
          <p className="text-center text-xs text-gray-400 mt-2">
            {language === 'hi' ? 'सही आकार चुनो!' : 'Tap the right shape!'}
          </p>
        </div>
      </div>
    </GameShell>
  );
}
