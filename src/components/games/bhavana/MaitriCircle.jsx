import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import ReflectionPrompt from '../../common/ReflectionPrompt';
import June from '../../common/June';
import Character from '../../common/Character';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import data from '../../../data/bhavana/maitri-circle.json';

const TEXT = {
  title: { en: 'Maitri Circle', hi: 'मैत्री वृत्त' },
  intro_line1: {
    en: (name) => `Namaste${name ? ', ' + name : ''}! Ullu has a secret.`,
    hi: (name) => `${name ? name + ', ' : ''}नमस्ते! उल्लू के पास एक रहस्य है।`,
  },
  intro_line2: {
    en: 'For every kind of person you meet, there is a perfect feeling to carry in your heart. Today you will learn four magical feelings!',
    hi: 'हर तरह के इंसान के लिए, दिल में एक खास भावना होती है। आज तुम चार जादुई भावनाएं सीखोगे!',
  },
  start: { en: "Let's Begin", hi: 'शुरू करें' },
  next: { en: 'Next Feeling', hi: 'अगली भावना' },
  practice_intro: { en: 'Tap each one and send them a warm wave.', hi: 'हर एक को टैप करो और उन्हें भावना की लहर भेजो।' },
  begin_practice: { en: 'Begin Practice', hi: 'अभ्यास शुरू' },
  practice_title: { en: 'Which feeling fits?', hi: 'कौन सी भावना सही है?' },
  reveal_title: { en: 'Your Maitri Circle', hi: 'तुम्हारा मैत्री वृत्त' },
  reveal_subtitle: {
    en: 'You now carry four powerful feelings in your heart. No matter who you meet, you have the right feeling ready.',
    hi: 'अब तुम्हारे दिल में चार शक्तिशाली भावनाएं हैं। तुम चाहे जिससे मिलो, तुम्हारे पास सही भावना तैयार है।',
  },
  reflection_q: { en: 'Which feeling is hardest for YOU? Be honest — the hardest one is the one to practice most!', hi: 'तुम्हारे लिए कौन सी भावना सबसे मुश्किल है? सच बताओ — जो सबसे मुश्किल है, उसे ही सबसे ज़्यादा अभ्यास चाहिए!' },
  reflection_thanks: { en: 'Thank you for being honest. That takes courage.', hi: 'सच बताने के लिए धन्यवाद। यह हिम्मत की बात है।' },
  done_title: { en: 'You earned the Four Feelings badge!', hi: 'तुमने चार भावनाओं का बैज जीता!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
};

const TEACHINGS = data.teachings;
const SCENARIOS = data.practice_scenarios;

function FeelingCircle({ teaching, size = 84, active = false, glow = false, onClick, label = true, language = 'en' }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`flex flex-col items-center gap-1 group transition-transform ${onClick ? 'active:scale-90' : ''}`}
    >
      <div
        className={`rounded-full shadow-lg flex items-center justify-center font-extrabold text-white border-4 transition-all duration-300 ${
          active ? 'scale-110' : ''
        } ${glow ? 'animate-pulse-glow' : ''}`}
        style={{
          width: size,
          height: size,
          backgroundColor: teaching.color,
          borderColor: 'rgba(255,255,255,0.6)',
          boxShadow: `0 0 ${active ? 32 : 16}px ${teaching.color}`,
        }}
      >
        <span className="text-base">{teaching.name_hi}</span>
      </div>
      {label && (
        <span className="text-[11px] font-bold text-gray-700">
          {language === 'hi' ? teaching.name_hi : teaching.name_en}
        </span>
      )}
    </button>
  );
}

export default function MaitriCircle({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro'); // intro | teach | practice | reveal | reflect | done
  const [teachIdx, setTeachIdx] = useState(0);
  const [tappedBeings, setTappedBeings] = useState([]);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [waveAt, setWaveAt] = useState(null);
  const [hardest, setHardest] = useState(null);
  const feedbackTimer = useRef(null);

  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  useEffect(() => () => { stop(); clearTimeout(feedbackTimer.current); }, [stop]);

  // Intro narration
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(`${TEXT.intro_line1.en(childName)} ${TEXT.intro_line2.en}`, `${TEXT.intro_line1.hi(childName)} ${TEXT.intro_line2.hi}`), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  // Teaching narration
  const currentTeaching = TEACHINGS[teachIdx];
  useEffect(() => {
    if (phase !== 'teach' || !currentTeaching) return;
    const t = setTimeout(() => speak(
      `${currentTeaching.name_en}. ${currentTeaching.meaning_en}. ${currentTeaching.trigger_en}`,
      `${currentTeaching.name_hi}। ${currentTeaching.meaning_hi}। ${currentTeaching.trigger_hi}`,
    ), 350);
    return () => clearTimeout(t);
  }, [phase, teachIdx, currentTeaching, speak]);

  const currentScenario = SCENARIOS[scenarioIdx];

  // Scenario narration
  useEffect(() => {
    if (phase !== 'practice' || !currentScenario || selected) return;
    const t = setTimeout(() => speak(currentScenario.scene_en, currentScenario.scene_hi), 350);
    return () => clearTimeout(t);
  }, [phase, scenarioIdx, currentScenario, selected, speak]);

  // Done narration
  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.done_title.en, TEXT.done_title.hi), 400);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  // Handle tapping a practice being during a teaching
  const handleBeingTap = (idx) => {
    if (tappedBeings.includes(idx)) return;
    sound.pop();
    setTappedBeings(prev => [...prev, idx]);
    setWaveAt(idx);
    setTimeout(() => setWaveAt(null), 800);
  };

  const advanceTeaching = () => {
    sound.pop();
    stop();
    setTappedBeings([]);
    if (teachIdx < TEACHINGS.length - 1) {
      setTeachIdx(teachIdx + 1);
    } else {
      setPhase('practice');
    }
  };

  // Practice scenario choice
  const handleFeelingPick = useCallback((teachingId) => {
    if (selected) return;
    sound.tap();
    setSelected(teachingId);
    const correct = teachingId === currentScenario.correct;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
      setConfetti(true);
      sound.success();
    } else {
      sound.gentle();
    }
    speak(currentScenario.feedback_en, currentScenario.feedback_hi);
    feedbackTimer.current = setTimeout(() => {
      setConfetti(false);
      setSelected(null);
      if (scenarioIdx < SCENARIOS.length - 1) {
        setScenarioIdx(scenarioIdx + 1);
      } else {
        setPhase('reveal');
      }
    }, 3200);
  }, [selected, currentScenario, scenarioIdx, speak, sound]);

  const handleStart = () => { sound.pop(); stop(); setTeachIdx(0); setTappedBeings([]); setPhase('teach'); };
  const handleReveal = () => { sound.pop(); stop(); setPhase('reflect'); };
  const handleReflect = (answer) => {
    if (answer) speak(TEXT.reflection_thanks.en, TEXT.reflection_thanks.hi);
    setHardest(answer?.key || null);
    setConfetti(true);
    setPhase('done');
  };
  const handleReplay = () => {
    stop();
    setTeachIdx(0); setTappedBeings([]); setScenarioIdx(0);
    setSelected(null); setScore(0); setConfetti(false); setHardest(null);
    setPhase('intro');
  };

  const bg = 'bg-gradient-to-b from-[#FFF5F0] via-[#FFE8DD] to-[#FFD7C2]';

  // ============ INTRO ============
  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <Character kind="ullu" emotion="neutral" size={170} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 max-w-[330px] animate-bounce-in">
            <p className="text-base font-bold text-amber-900 mb-1">{TEXT.intro_line1[lang](childName)}</p>
            <p className="text-sm text-gray-700 font-semibold">{TEXT.intro_line2[lang]}</p>
          </div>
          <div className="flex gap-3 items-center">
            {TEACHINGS.map((t) => (
              <div key={t.id} className="w-10 h-10 rounded-full shadow-md animate-pulse-glow" style={{ backgroundColor: t.color }} />
            ))}
          </div>
          <button
            onClick={handleStart}
            className="mt-2 px-10 py-4 rounded-full text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90 transition-transform"
            style={{ background: 'linear-gradient(135deg, #FF9933, #D4A017)' }}
          >
            {TEXT.start[lang]}
          </button>
        </div>
      </GameShell>
    );
  }

  // ============ TEACH ============
  if (phase === 'teach' && currentTeaching) {
    const beings = currentTeaching.practice_beings || currentTeaching.scenes || [];
    const allTapped = tappedBeings.length === beings.length;
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} round={teachIdx} totalRounds={TEACHINGS.length} bg={bg}>
        <div className="flex-1 flex flex-col items-center px-4 py-3 gap-4 overflow-y-auto">
          {/* Title chip */}
          <div
            className="px-5 py-2 rounded-full text-white font-extrabold text-xl shadow-md animate-bounce-in"
            style={{ backgroundColor: currentTeaching.color }}
          >
            {currentTeaching.name_hi} · {currentTeaching.name_en}
          </div>

          {/* Big feeling circle */}
          <FeelingCircle teaching={currentTeaching} size={140} active glow label={false} language={lang} />

          {/* Meaning */}
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm text-center max-w-[340px] animate-bounce-in" style={{ animationDelay: '0.1s' }}>
            <p className="text-sm font-bold text-gray-800">{lang === 'hi' ? currentTeaching.meaning_hi : currentTeaching.meaning_en}</p>
            <p className="text-xs text-gray-600 mt-1">{lang === 'hi' ? currentTeaching.trigger_hi : currentTeaching.trigger_en}</p>
          </div>

          {/* Practice beings */}
          <div className="text-xs font-bold text-amber-800">{TEXT.practice_intro[lang]}</div>
          <div className="flex gap-3 flex-wrap justify-center">
            {beings.map((b, i) => {
              const tapped = tappedBeings.includes(i);
              const showWave = waveAt === i;
              return (
                <button
                  key={i}
                  onClick={() => handleBeingTap(i)}
                  disabled={tapped}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-2 transition-all active:scale-90 ${
                    tapped ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <span className="text-3xl">{b.icon}</span>
                  <span className="text-[10px] font-bold text-gray-700">{lang === 'hi' ? b.label_hi : b.label_en}</span>
                  {showWave && (
                    <span
                      className="absolute inset-0 rounded-2xl pointer-events-none animate-ping"
                      style={{ backgroundColor: currentTeaching.color, opacity: 0.5 }}
                    />
                  )}
                  {tapped && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tagline */}
          {allTapped && (
            <div
              className="px-4 py-3 rounded-2xl text-white text-sm font-bold text-center max-w-[340px] animate-bounce-in"
              style={{ backgroundColor: currentTeaching.color }}
            >
              "{lang === 'hi' ? currentTeaching.tagline_hi : currentTeaching.tagline_en}"
            </div>
          )}

          {/* Next */}
          <button
            onClick={advanceTeaching}
            disabled={!allTapped}
            className={`mt-2 px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 ${
              allTapped ? 'bg-amber-500 text-white animate-pulse-glow' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {teachIdx === TEACHINGS.length - 1 ? TEXT.begin_practice[lang] : TEXT.next[lang]}
          </button>
        </div>
      </GameShell>
    );
  }

  // ============ PRACTICE ============
  if (phase === 'practice' && currentScenario) {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} round={scenarioIdx} totalRounds={SCENARIOS.length} bg={bg}>
        <Celebration active={confetti} type="confetti" />
        <div className="flex-1 flex flex-col px-4 py-3 gap-4 overflow-y-auto">
          <div className="text-center text-sm font-bold text-amber-700">{TEXT.practice_title[lang]}</div>

          {/* Scene */}
          <div className="bg-white/90 rounded-2xl px-5 py-4 shadow-sm text-center animate-bounce-in" key={`scene-${scenarioIdx}`}>
            <div className="text-5xl mb-2">{currentScenario.icon}</div>
            <p className="text-sm font-bold text-gray-800">{lang === 'hi' ? currentScenario.scene_hi : currentScenario.scene_en}</p>
          </div>

          {/* Four circles */}
          <div className="grid grid-cols-4 gap-2 px-2">
            {TEACHINGS.map(t => {
              const chosen = selected === t.id;
              const isAnswer = t.id === currentScenario.correct;
              let extraCls = '';
              if (selected) {
                if (isAnswer) extraCls = 'ring-4 ring-green-400 scale-110';
                else if (chosen) extraCls = 'ring-4 ring-orange-300 opacity-70';
                else extraCls = 'opacity-40';
              }
              return (
                <div key={t.id} className={`transition-all duration-300 ${extraCls} rounded-full`}>
                  <FeelingCircle
                    teaching={t}
                    size={62}
                    onClick={selected ? null : () => handleFeelingPick(t.id)}
                    glow={!selected}
                    label
                    language={lang}
                  />
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          {selected && (
            <div
              className={`px-4 py-3 rounded-2xl text-sm font-semibold text-center animate-bounce-in ${
                isCorrect ? 'bg-green-50 border-2 border-green-300 text-green-800' : 'bg-amber-50 border-2 border-amber-300 text-amber-900'
              }`}
            >
              {lang === 'hi' ? currentScenario.feedback_hi : currentScenario.feedback_en}
            </div>
          )}
        </div>
      </GameShell>
    );
  }

  // ============ REVEAL (Maitri Circle) ============
  if (phase === 'reveal') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 gap-4">
          <h2 className="text-xl font-extrabold text-amber-800">{TEXT.reveal_title[lang]}</h2>

          {/* Circle of four around childName */}
          <div className="relative w-72 h-72">
            <div className="absolute inset-0 flex items-center justify-center">
              <June emotion="happy" size={120} animate />
            </div>
            {TEACHINGS.map((t, i) => {
              const positions = [
                { top: '0%', left: '50%' },     // top - maitri
                { top: '50%', left: '100%' },   // right - karuna
                { top: '100%', left: '50%' },   // bottom - pramod
                { top: '50%', left: '0%' },     // left - madhyastha
              ];
              const pos = positions[i];
              return (
                <div
                  key={t.id}
                  className="absolute animate-bounce-in"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    transform: 'translate(-50%, -50%)',
                    animationDelay: `${i * 0.25}s`,
                  }}
                >
                  <FeelingCircle teaching={t} size={68} glow label language={lang} />
                </div>
              );
            })}
            {/* Connecting diamond */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points="50,5 95,50 50,95 5,50"
                fill="none"
                stroke="#D4A017"
                strokeWidth="0.6"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            </svg>
          </div>

          <p className="text-sm text-gray-700 text-center max-w-[340px] font-semibold">
            {TEXT.reveal_subtitle[lang]}
          </p>

          <button
            onClick={handleReveal}
            className="mt-2 px-8 py-3 rounded-full text-white font-bold shadow-md animate-pulse-glow active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FF9933, #D4A017)' }}
          >
            {lang === 'hi' ? 'जारी रखें' : 'Continue'}
          </button>
        </div>
      </GameShell>
    );
  }

  // ============ REFLECT ============
  if (phase === 'reflect') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 gap-4">
          <Character kind="ullu" emotion="neutral" size={120} animate />
          <ReflectionPrompt
            questionEn={TEXT.reflection_q.en}
            questionHi={TEXT.reflection_q.hi}
            options={TEACHINGS.map(t => ({
              key: t.id,
              label_en: `${t.name_en} — ${t.meaning_en.split('&')[0].trim()}`,
              label_hi: `${t.name_hi} — ${t.meaning_hi}`,
            }))}
            language={lang}
            onReflect={handleReflect}
            showSkip
          />
        </div>
      </GameShell>
    );
  }

  // ============ DONE ============
  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
      <Celebration active={confetti} type="confetti" />
      <Celebration active={confetti} type="stars" />
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <div className="text-5xl animate-bounce-in">{'\u{1FAB7}'}</div>
        <June emotion="celebrating" size={160} animate />
        <div className="text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-amber-800">{lang === 'hi' ? 'बधाई हो!' : 'Beautifully done!'}</h2>
          <p className="text-gray-700 text-base mt-1 font-semibold">{TEXT.done_title[lang]}</p>
          <p className="text-amber-700 text-sm font-bold mt-2">
            {lang === 'hi' ? `${SCENARIOS.length} में से ${score} सही!` : `${score} of ${SCENARIOS.length} scenarios correct!`}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReplay} className="px-6 py-3 rounded-full bg-amber-500 text-white font-bold shadow-md active:scale-90">
            {TEXT.again[lang]}
          </button>
          <button
            onClick={() => { stop(); onComplete?.({ score, hardest, total: SCENARIOS.length }); }}
            className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90"
          >
            {TEXT.back[lang]}
          </button>
        </div>
        <ParentTip tipEn={data.parent_tip_en} tipHi={data.parent_tip_hi} language={lang} />
      </div>
    </GameShell>
  );
}
