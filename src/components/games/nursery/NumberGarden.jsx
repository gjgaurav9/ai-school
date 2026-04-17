import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import Character from '../../common/Character';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import rounds from '../../../data/nursery/number-rounds.json';

const TEXT = {
  title: { en: 'Number Garden', hi: 'नंबर बगीचा' },
  intro: {
    en: (n) => `Welcome${n ? ', ' + n : ''}, to Guddu's Number Garden! Let's count and grow!`,
    hi: (n) => `${n ? n + ', ' : ''}गुड्डू के नंबर बगीचे में स्वागत है! चलो गिनें और उगाएँ!`,
  },
  start: { en: 'Start Counting!', hi: 'गिनना शुरू!' },
  done: { en: "Your garden is blooming!", hi: 'तुम्हारा बगीचा खिल रहा है!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  howMany: { en: 'How many?', hi: 'कितने?' },
  perfect: { en: 'Perfect!', hi: 'बिल्कुल सही!' },
  give: { en: 'Give', hi: 'दें' },
  pickedTooMany: {
    en: (got, want) => `Oops, that's ${got}! We only need ${want}. Tap one to put it back.`,
    hi: (got, want) => `अरे, ये ${got} हैं! हमें केवल ${want} चाहिए। एक वापस रखने के लिए टैप करें।`,
  },
};

// Scatter helper for count rounds — generates non-overlapping positions
function generatePositions(count, seed = 0) {
  const positions = [];
  const cols = count <= 4 ? 2 : count <= 6 ? 3 : 4;
  const rows = Math.ceil(count / cols);
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const baseX = ((c + 0.5) / cols) * 100;
    const baseY = ((r + 0.5) / rows) * 100;
    // Slight jitter
    const jitter = ((i * 31 + seed) % 17) / 17 - 0.5;
    positions.push({ x: baseX + jitter * 6, y: baseY + jitter * 5 });
  }
  return positions;
}

function CountRound({ round, lang, onCorrect, onWrong, sound, speak }) {
  const [tapped, setTapped] = useState(new Set());
  const [chosen, setChosen] = useState(null);
  const positions = useMemo(() => generatePositions(round.count, round.count), [round]);

  const allTapped = tapped.size === round.count;

  const handleTap = (i) => {
    if (tapped.has(i)) return;
    sound.playTone(440 + tapped.size * 50, 0.15, 'sine');
    setTapped(new Set([...tapped, i]));
  };

  const handleChoose = (n) => {
    if (chosen != null) return;
    setChosen(n);
    if (n === round.count) {
      sound.success();
      onCorrect();
    } else {
      sound.gentle();
      onWrong();
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-3 pb-4">
      <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold">
        {lang === 'hi' ? round.prompt_hi : round.prompt_en}
      </div>

      {/* Items grid */}
      <div className="relative bg-green-50 rounded-3xl border-4 border-green-200 mx-2" style={{ height: 240 }}>
        {positions.map((p, i) => (
          <button
            key={i}
            onClick={() => handleTap(i)}
            disabled={allTapped}
            className="absolute transition-all duration-200 active:scale-90"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              transform: `translate(-50%, -50%) scale(${tapped.has(i) ? 1.2 : 1})`,
            }}
          >
            <span className="text-4xl drop-shadow-md">{round.icon}</span>
            {tapped.has(i) && (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-base font-extrabold text-orange-600 bg-white rounded-full px-2 py-0.5 shadow"
                style={{ animation: 'bounce-in 0.3s' }}
              >
                {[...tapped].indexOf(i) + 1 || tapped.size}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* "How many?" + options appears after all tapped */}
      {allTapped && (
        <div className="flex flex-col items-center gap-2 animate-bounce-in">
          <p className="text-sm font-semibold text-gray-600">{TEXT.howMany[lang]}</p>
          <div className="flex gap-3">
            {round.options.map(n => (
              <button
                key={n}
                onClick={() => handleChoose(n)}
                disabled={chosen != null}
                className={`w-16 h-16 rounded-full font-extrabold text-2xl shadow-md border-2 active:scale-90 transition-all ${
                  chosen === n
                    ? n === round.count
                      ? 'bg-green-100 border-green-500 text-green-700 scale-110'
                      : 'bg-orange-50 border-orange-300 text-orange-700'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareRound({ round, lang, onCorrect, onWrong, sound }) {
  const [chosen, setChosen] = useState(null);

  const handleTap = (side) => {
    if (chosen) return;
    setChosen(side);
    if (side === round.more_side) {
      sound.success();
      onCorrect();
    } else {
      sound.gentle();
      onWrong();
    }
  };

  const renderSide = (side, count, icon) => {
    const isCorrectSide = side === round.more_side;
    const isChosen = chosen === side;
    let cls = 'bg-white border-gray-300';
    if (chosen) {
      if (isCorrectSide) cls = 'bg-green-100 border-green-500 scale-105';
      else if (isChosen) cls = 'bg-orange-50 border-orange-300';
    }
    return (
      <button
        onClick={() => handleTap(side)}
        disabled={!!chosen}
        className={`flex-1 rounded-2xl border-4 p-3 transition-all active:scale-95 ${cls}`}
        style={{ minHeight: 220 }}
      >
        <div className="flex flex-col items-center gap-1">
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="text-2xl leading-none">{icon}</span>
          ))}
        </div>
        {chosen && isCorrectSide && (
          <p className="mt-2 text-green-700 font-extrabold text-2xl">{count}</p>
        )}
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-3 pb-4">
      <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold">
        {lang === 'hi' ? round.prompt_hi : round.prompt_en}
      </div>
      <div className="flex gap-3 px-2">
        {renderSide('left', round.left_count, round.icon_left)}
        {renderSide('right', round.right_count, round.icon_right)}
      </div>
      {chosen && (
        <div className="text-center text-amber-700 font-bold text-sm">
          {lang === 'hi'
            ? `${Math.max(round.left_count, round.right_count)}, ${Math.min(round.left_count, round.right_count)} से ज़्यादा है!`
            : `${Math.max(round.left_count, round.right_count)} is more than ${Math.min(round.left_count, round.right_count)}!`}
        </div>
      )}
    </div>
  );
}

function GiveRound({ round, lang, onCorrect, onWrong, sound, speak }) {
  const [picked, setPicked] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [warning, setWarning] = useState(false);

  const handlePick = (i) => {
    if (confirmed) return;
    if (picked.includes(i)) return;
    sound.playTone(440 + picked.length * 40, 0.15, 'sine');
    const next = [...picked, i];
    setPicked(next);
    if (next.length > round.target) {
      setWarning(true);
    } else {
      setWarning(false);
    }
  };

  const handleUnpick = (i) => {
    if (confirmed) return;
    sound.pop();
    const next = picked.filter(x => x !== i);
    setPicked(next);
    if (next.length <= round.target) setWarning(false);
  };

  const handleConfirm = () => {
    if (picked.length !== round.target) return;
    setConfirmed(true);
    sound.success();
    onCorrect();
  };

  const charKind = round.character;
  const CharComp = charKind === 'guddu'
    ? <Guddu emotion="happy" size={90} animate />
    : <Character kind={charKind} emotion="happy" size={90} animate showLabel />;

  return (
    <div className="flex-1 flex flex-col gap-3 pb-4">
      <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold">
        {lang === 'hi' ? round.prompt_hi : round.prompt_en}
      </div>

      {/* Character + target */}
      <div className="flex items-center justify-center gap-3">
        {CharComp}
        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl px-3 py-2 text-center">
          <div className="text-xs text-gray-600 font-semibold">{lang === 'hi' ? 'चाहिए' : 'Wants'}</div>
          <div className="text-3xl font-extrabold text-orange-700">{round.target}</div>
        </div>
      </div>

      {/* Pool of items */}
      <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-3">
        <p className="text-center text-xs font-semibold text-gray-500 mb-1">
          {lang === 'hi' ? 'चुनने के लिए टैप करें' : 'Tap to pick'}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: round.pool }).map((_, i) => {
            const isPicked = picked.includes(i);
            return (
              <button
                key={i}
                onClick={() => isPicked ? handleUnpick(i) : handlePick(i)}
                disabled={confirmed}
                className={`text-3xl transition-all active:scale-90 ${isPicked ? 'opacity-30' : ''}`}
              >
                {round.icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* "Given" basket */}
      <div className="bg-green-50 rounded-2xl border-2 border-green-300 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-600">{lang === 'hi' ? 'दिए गए' : 'Given'}</p>
          <p className="text-lg font-extrabold text-green-700">{picked.length} / {round.target}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-1 mt-1 min-h-[40px]">
          {picked.map((i, idx) => (
            <button
              key={i}
              onClick={() => handleUnpick(i)}
              disabled={confirmed}
              className="text-2xl active:scale-90"
            >
              {round.icon}
            </button>
          ))}
        </div>
      </div>

      {warning && (
        <div className="bg-orange-50 border-2 border-orange-200 text-orange-800 text-sm font-bold text-center rounded-xl px-3 py-2 animate-bounce-in">
          {TEXT.pickedTooMany[lang](picked.length, round.target)}
        </div>
      )}

      {picked.length === round.target && !confirmed && (
        <button
          onClick={handleConfirm}
          className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 text-lg font-bold shadow-md active:scale-95 mx-auto animate-pulse-glow"
        >
          {TEXT.perfect[lang]}
        </button>
      )}
    </div>
  );
}

export default function NumberGarden({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const advanceTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();
  const round = rounds[roundIdx];

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setTimeout(() => speak(round.prompt_en, round.prompt_hi), 300);
    return () => clearTimeout(t);
  }, [phase, roundIdx, round, speak]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(
      `${TEXT.done.en} You scored ${score} out of ${rounds.length}!`,
      `${TEXT.done.hi} ${score} में से ${rounds.length} सही!`,
    ), 350);
    return () => clearTimeout(t);
  }, [phase, score, speak, sound]);

  const advance = useCallback(() => {
    setShowConfetti(false);
    setFeedback(null);
    if (roundIdx + 1 < rounds.length) {
      setRoundIdx(i => i + 1);
    } else {
      setShowConfetti(true);
      setPhase('done');
    }
  }, [roundIdx]);

  const handleCorrect = useCallback(() => {
    setScore(s => s + 1);
    setShowConfetti(true);
    setFeedback('correct');
    speak(
      lang === 'hi' ? 'बहुत बढ़िया!' : 'Excellent counting!',
      lang === 'hi' ? 'बहुत बढ़िया!' : 'Excellent counting!',
    );
    advanceTimerRef.current = setTimeout(advance, 2200);
  }, [advance, speak, lang]);

  const handleWrong = useCallback(() => {
    setFeedback('wrong');
    speak(
      lang === 'hi' ? 'कोई बात नहीं, फिर देखो!' : 'Nice try! Let\'s see the right answer.',
      lang === 'hi' ? 'कोई बात नहीं, फिर देखो!' : 'Nice try! Let\'s see the right answer.',
    );
    advanceTimerRef.current = setTimeout(advance, 2200);
  }, [advance, speak, lang]);

  const bg = 'bg-gradient-to-b from-[#E8F8E0] via-[#D4F4D4] to-[#FFE8C8]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\u{1F33B}'}</div>
          <Guddu emotion="happy" size={170} animate />
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
        <Celebration active={showConfetti} type="confetti" />
        <Celebration active={showConfetti} type="stars" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <div className="text-7xl animate-bounce-in">{'\u{1F33C}'}</div>
          <Guddu emotion="celebrating" size={170} animate />
          <div className="text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-gray-800">{TEXT.done[lang]}</h2>
            <p className="text-amber-700 text-base font-bold mt-1">
              {lang === 'hi' ? `${rounds.length} में से ${score} सही!` : `${score} of ${rounds.length} correct!`}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { stop(); setRoundIdx(0); setScore(0); setShowConfetti(false); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Count EVERYTHING in daily life — stairs, chapatis on the plate, buttons. The more concrete counting, the stronger number sense becomes."
            tipHi="रोज़मर्रा में सब कुछ गिनें — सीढ़ियाँ, थाली में रोटियाँ, बटन। जितना ज़्यादा गिनेंगे, संख्या समझ उतनी मज़बूत होगी।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={roundIdx} totalRounds={rounds.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />
      <div className="px-3" key={roundIdx}>
        {round.type === 'count' && <CountRound round={round} lang={lang} onCorrect={handleCorrect} onWrong={handleWrong} sound={sound} speak={speak} />}
        {round.type === 'compare' && <CompareRound round={round} lang={lang} onCorrect={handleCorrect} onWrong={handleWrong} sound={sound} />}
        {round.type === 'give' && <GiveRound round={round} lang={lang} onCorrect={handleCorrect} onWrong={handleWrong} sound={sound} speak={speak} />}
      </div>
    </GameShell>
  );
}
