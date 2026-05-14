import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import ReflectionPrompt from '../../common/ReflectionPrompt';
import ThreeGates from '../../common/ThreeGates';
import WordCatcher from '../../common/WordCatcher';
import June from '../../common/June';
import Character from '../../common/Character';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import data from '../../../data/bhavana/vaani-vatika.json';

const TEXT = {
  title: { en: 'Word Garden', hi: 'वाणी वाटिका' },
  intro_line1: { en: 'Welcome to the Word Garden!', hi: 'वाणी वाटिका में स्वागत है!' },
  intro_line2: {
    en: 'In this garden, kind words grow flowers and harsh words grow thorns. Let\'s grow a beautiful garden together!',
    hi: 'इस बगीचे में, अच्छे शब्द फूल उगाते हैं और कड़वे शब्द काँटे। चलो मिलकर एक सुंदर बगीचा बनाते हैं!',
  },
  start: { en: 'Begin', hi: 'शुरू करें' },
  teach_title: { en: 'The Word Catcher', hi: 'शब्द-पकड़' },
  teach_line1: {
    en: 'Before a word leaves your mouth, it passes through your MIND first. That\'s where you can catch it!',
    hi: 'कोई शब्द मुँह से निकलने से पहले, सबसे पहले दिमाग में आता है। वहीं तुम उसे पकड़ सकते हो!',
  },
  teach_line2: {
    en: 'Tap the red harsh-word bubble before it reaches the mouth line. Then pick a kinder thing to say.',
    hi: 'लाल कड़वे शब्द के बुलबुले को मुँह तक पहुँचने से पहले टैप करो। फिर कुछ अच्छा कहने का चुनो।',
  },
  try_demo: { en: 'Try a Practice Round', hi: 'अभ्यास करें' },
  what_to_say: { en: 'What can you say instead?', hi: 'इसकी जगह क्या कह सकते हो?' },
  retry: { en: 'Try Again', hi: 'फिर कोशिश करें' },
  garden_title: { en: 'Your Word Garden', hi: 'तुम्हारा शब्द बगीचा' },
  see_gates: { en: 'See the Three Gates', hi: 'तीन द्वार देखें' },
  reflection_q: {
    en: 'Think about the last time you said something harsh. What could you have said instead?',
    hi: 'सोचो, पिछली बार जब तुमने कुछ कड़वा कहा था। तुम उसकी जगह क्या कह सकते थे?',
  },
  done_title: { en: 'You earned the Word Gardener badge!', hi: 'तुमने शब्द-माली का बैज जीता!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
};

// Flower/thorn icons by points
function GardenItem({ type, delay = 0 }) {
  const icon = type === 'flower_full' ? '🌸' : type === 'flower_bud' ? '🌱' : '🥀';
  return (
    <span
      className="text-2xl inline-block animate-bounce-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {icon}
    </span>
  );
}

function OptionButton({ option, onClick, disabled, language }) {
  const iconMap = { flower_full: '🌸', flower_bud: '🌱', thorn: '🥀' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold text-sm shadow-sm transition-all active:scale-95 ${
        disabled ? 'opacity-50' : 'bg-white border-amber-200 hover:border-amber-400'
      }`}
    >
      <span className="text-2xl flex-shrink-0">{iconMap[option.type]}</span>
      <span className="flex-1 text-gray-800">{language === 'hi' ? option.text_hi : option.text_en}</span>
    </button>
  );
}

export default function VaaniVatika({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');   // intro | teach | demo | scenario | garden | gates | reflect | done
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [catchResult, setCatchResult] = useState(null); // null | 'caught' | 'escaped'
  const [demoCatchResult, setDemoCatchResult] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [garden, setGarden] = useState([]); // accumulated picks
  const [confetti, setConfetti] = useState(false);
  const advanceTimer = useRef(null);

  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  useEffect(() => () => { stop(); clearTimeout(advanceTimer.current); }, [stop]);

  // Narration: intro
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(`${TEXT.intro_line1.en} ${TEXT.intro_line2.en}`, `${TEXT.intro_line1.hi} ${TEXT.intro_line2.hi}`), 350);
    return () => clearTimeout(t);
  }, [phase, speak]);

  // Narration: teach
  useEffect(() => {
    if (phase !== 'teach') return;
    const t = setTimeout(() => speak(`${TEXT.teach_line1.en} ${TEXT.teach_line2.en}`, `${TEXT.teach_line1.hi} ${TEXT.teach_line2.hi}`), 350);
    return () => clearTimeout(t);
  }, [phase, speak]);

  // Narration: scenario scene
  const currentScenario = phase === 'demo' ? data.demo : data.scenarios[scenarioIdx];
  useEffect(() => {
    if (phase !== 'demo' && phase !== 'scenario') return;
    if (catchResult || selectedOption) return;
    const t = setTimeout(() => speak(currentScenario.scene_en, currentScenario.scene_hi), 350);
    return () => clearTimeout(t);
  }, [phase, scenarioIdx, currentScenario, catchResult, selectedOption, speak]);

  // Narration: done
  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.done_title.en, TEXT.done_title.hi), 400);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const handleStart = () => { sound.pop(); stop(); setPhase('teach'); };
  const handleStartDemo = () => { sound.pop(); stop(); setCatchResult(null); setSelectedOption(null); setDemoCatchResult(null); setPhase('demo'); };
  const handleStartScenarios = () => { sound.pop(); stop(); setCatchResult(null); setSelectedOption(null); setScenarioIdx(0); setPhase('scenario'); };

  // Catch outcome
  const handleCaught = useCallback((wasCaught) => {
    if (phase === 'demo') setDemoCatchResult(wasCaught ? 'caught' : 'escaped');
    setCatchResult(wasCaught ? 'caught' : 'escaped');
    if (wasCaught) sound.success();
    else sound.gentle();
  }, [phase, sound]);

  // Retry the catch if escaped
  const retryCatch = () => {
    sound.pop();
    setCatchResult(null);
    if (phase === 'demo') setDemoCatchResult(null);
  };

  // Pick option after catch
  const handleOptionPick = useCallback((option) => {
    if (selectedOption) return;
    sound.tap();
    setSelectedOption(option);
    if (option.type === 'thorn') {
      sound.gentle();
    } else {
      sound.success();
      setConfetti(true);
    }
    speak(currentScenario.insight_en, currentScenario.insight_hi);

    advanceTimer.current = setTimeout(() => {
      setConfetti(false);
      if (phase === 'demo') {
        // Demo done, start real scenarios
        setSelectedOption(null);
        setCatchResult(null);
        setDemoCatchResult(null);
        setPhase('scenario');
        setScenarioIdx(0);
      } else {
        // Add to garden, advance
        setGarden(g => [...g, { type: option.type, scenarioId: currentScenario.id }]);
        setSelectedOption(null);
        setCatchResult(null);
        if (scenarioIdx < data.scenarios.length - 1) {
          setScenarioIdx(scenarioIdx + 1);
        } else {
          setPhase('garden');
        }
      }
    }, 4200);
  }, [selectedOption, currentScenario, phase, scenarioIdx, speak, sound]);

  const handleGardenContinue = () => { sound.pop(); stop(); setPhase('gates'); };
  const handleGatesDone = () => { sound.pop(); stop(); setPhase('reflect'); };
  const handleReflectDone = () => { setConfetti(true); setPhase('done'); };

  const handleReplay = () => {
    stop();
    setScenarioIdx(0); setCatchResult(null); setSelectedOption(null);
    setGarden([]); setConfetti(false); setDemoCatchResult(null);
    setPhase('intro');
  };

  const score = garden.reduce((sum, g) => sum + (g.type === 'flower_full' ? 3 : g.type === 'flower_bud' ? 2 : 0), 0);
  const flowerCount = garden.filter(g => g.type !== 'thorn').length;
  const thornCount = garden.filter(g => g.type === 'thorn').length;

  const bg = 'bg-gradient-to-b from-[#FFF5F0] via-[#FFE8DD] to-[#E8F5E9]';

  // ============ INTRO ============
  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <Character kind="ullu" emotion="neutral" size={150} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center max-w-[340px] animate-bounce-in">
            <p className="text-base font-bold text-amber-900 mb-1">
              {childName ? `${TEXT.intro_line1[lang]} ${childName}!` : TEXT.intro_line1[lang]}
            </p>
            <p className="text-sm text-gray-700 font-semibold">{TEXT.intro_line2[lang]}</p>
          </div>
          <div className="flex gap-4 items-center text-3xl">
            <span>🌸</span><span className="text-gray-400 text-xl">vs</span><span>🥀</span>
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

  // ============ TEACH (explain mechanic) ============
  if (phase === 'teach') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 gap-4 overflow-y-auto">
          <h2 className="text-xl font-extrabold text-amber-800">{TEXT.teach_title[lang]}</h2>
          <Character kind="ullu" emotion="neutral" size={110} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center max-w-[340px]">
            <p className="text-sm text-gray-800 font-semibold mb-2">{TEXT.teach_line1[lang]}</p>
            <p className="text-sm text-gray-700">{TEXT.teach_line2[lang]}</p>
          </div>

          {/* Visual hint */}
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 border-2 border-red-300">😠 harsh</span>
            <span>→</span>
            <span className="text-2xl">☝</span>
            <span>→</span>
            <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 border-2 border-green-300">🌸 kind</span>
          </div>

          <button
            onClick={handleStartDemo}
            className="mt-2 px-8 py-3 rounded-full text-white font-bold shadow-md animate-pulse-glow active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FF9933, #D4A017)' }}
          >
            {TEXT.try_demo[lang]}
          </button>
        </div>
      </GameShell>
    );
  }

  // ============ DEMO + SCENARIO (same layout, differ only by data) ============
  if (phase === 'demo' || phase === 'scenario') {
    const isDemo = phase === 'demo';
    const sc = currentScenario;
    const showOptions = catchResult !== null;
    return (
      <GameShell
        onBack={onBack}
        title={TEXT.title[lang]}
        round={isDemo ? null : scenarioIdx}
        totalRounds={isDemo ? null : data.scenarios.length}
        bg={bg}
      >
        <Celebration active={confetti} type="confetti" />

        <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
          {isDemo && (
            <div className="text-center text-xs font-bold text-amber-700 uppercase tracking-wide">
              {lang === 'hi' ? 'अभ्यास' : 'Practice Round'}
            </div>
          )}

          {/* Scene */}
          <div className="bg-white/90 rounded-2xl px-4 py-3 shadow-sm text-center animate-bounce-in" key={`scene-${scenarioIdx}-${phase}`}>
            <p className="text-sm font-bold text-gray-800">{lang === 'hi' ? sc.scene_hi : sc.scene_en}</p>
          </div>

          {/* Catch zone OR options */}
          {!showOptions && (
            <div className="bg-white/70 rounded-2xl border-2 border-red-200 px-2 py-2 animate-bounce-in" key={`catcher-${scenarioIdx}-${phase}`}>
              <p className="text-[11px] font-bold text-red-700 text-center mb-1">
                {lang === 'hi' ? 'इस सोच को टैप करके पकड़ो!' : 'Tap this thought to catch it!'}
              </p>
              <WordCatcher
                key={`wc-${scenarioIdx}-${phase}-${catchResult ?? 'init'}`}
                harshTextEn={sc.harsh_thought_en}
                harshTextHi={sc.harsh_thought_hi}
                language={lang}
                catchSeconds={sc.catch_time_seconds || 3}
                onCaught={handleCaught}
              />
            </div>
          )}

          {/* Retry button if escaped (no option chosen yet) */}
          {catchResult === 'escaped' && !selectedOption && (
            <div className="flex justify-center mt-2">
              <button
                onClick={retryCatch}
                className="px-6 py-2.5 rounded-full bg-amber-500 text-white font-bold shadow-md active:scale-95"
              >
                {TEXT.retry[lang]}
              </button>
              <button
                onClick={() => setCatchResult('caught')}
                className="ml-2 px-6 py-2.5 rounded-full bg-white text-gray-700 font-bold shadow-md active:scale-95 border-2 border-gray-200"
              >
                {lang === 'hi' ? 'फिर भी चुनो' : 'Choose anyway'}
              </button>
            </div>
          )}

          {/* Options after catch */}
          {catchResult === 'caught' && !selectedOption && (
            <div className="flex flex-col gap-2 mt-2 animate-bounce-in">
              <p className="text-sm font-bold text-amber-800 text-center">{TEXT.what_to_say[lang]}</p>
              {sc.options.map((opt, i) => (
                <OptionButton
                  key={i}
                  option={opt}
                  onClick={() => handleOptionPick(opt)}
                  disabled={false}
                  language={lang}
                />
              ))}
            </div>
          )}

          {/* Insight after pick */}
          {selectedOption && (
            <div
              className={`px-4 py-3 rounded-2xl text-sm font-semibold text-center animate-bounce-in ${
                selectedOption.type === 'thorn'
                  ? 'bg-amber-50 border-2 border-amber-300 text-amber-900'
                  : 'bg-green-50 border-2 border-green-300 text-green-800'
              }`}
            >
              <div className="text-2xl mb-1">
                {selectedOption.type === 'flower_full' ? '🌸' : selectedOption.type === 'flower_bud' ? '🌱' : '🥀'}
              </div>
              {lang === 'hi' ? sc.insight_hi : sc.insight_en}
            </div>
          )}
        </div>
      </GameShell>
    );
  }

  // ============ GARDEN REVEAL ============
  if (phase === 'garden') {
    const perfect = thornCount === 0;
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col px-4 py-3 gap-4 overflow-y-auto">
          <h2 className="text-xl font-extrabold text-amber-800 text-center">{TEXT.garden_title[lang]}</h2>

          {/* Garden visualization */}
          <div className="bg-gradient-to-b from-[#E8F5E9] to-[#C8E6C9] rounded-3xl p-5 border-2 border-green-300 shadow-md min-h-[180px]">
            <div className="flex flex-wrap gap-2 justify-center items-end">
              {garden.map((g, i) => (
                <GardenItem key={i} type={g.type} delay={i * 0.1} />
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <span className="font-bold text-green-700">🌸 {flowerCount}</span>
              <span className="font-bold text-amber-700">🥀 {thornCount}</span>
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-2xl px-5 py-4 text-center shadow-sm">
            {perfect ? (
              <p className="text-sm font-bold text-green-800">
                {lang === 'hi'
                  ? 'क्या सुंदर बगीचा! तुमने हर कड़वे शब्द को पकड़ा। तुम्हारे शब्द दुनिया में सुंदरता रचते हैं।'
                  : 'A perfect garden! You caught every harsh word. Your words create beauty.'}
              </p>
            ) : (
              <p className="text-sm font-semibold text-gray-800">
                {lang === 'hi'
                  ? 'कुछ काँटे उगे — और यह ठीक है! हर दिन फिर से ज़्यादा फूल उगाने का मौका है।'
                  : 'Some thorns grew — and that\'s okay! Every day is a new chance to grow more flowers.'}
              </p>
            )}
          </div>

          <button
            onClick={handleGardenContinue}
            className="mt-2 px-8 py-3 mx-auto rounded-full text-white font-bold shadow-md animate-pulse-glow active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FF9933, #D4A017)' }}
          >
            {TEXT.see_gates[lang]}
          </button>
        </div>
      </GameShell>
    );
  }

  // ============ THREE GATES ============
  if (phase === 'gates') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <ThreeGates gates={data.three_gates} language={lang} onAllOpened={handleGatesDone} />
      </GameShell>
    );
  }

  // ============ REFLECT ============
  if (phase === 'reflect') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 gap-4">
          <Character kind="ullu" emotion="neutral" size={110} animate />
          <ReflectionPrompt
            questionEn={TEXT.reflection_q.en}
            questionHi={TEXT.reflection_q.hi}
            options={[]}
            language={lang}
            onReflect={handleReflectDone}
            showSkip
            autoAdvanceMs={6000}
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
        <div className="text-5xl animate-bounce-in">{'🌸'}</div>
        <June emotion="celebrating" size={160} animate />
        <div className="text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-amber-800">{lang === 'hi' ? 'सुंदर बगीचा!' : 'Beautiful Garden!'}</h2>
          <p className="text-gray-700 text-base mt-1 font-semibold">{TEXT.done_title[lang]}</p>
          <p className="text-amber-700 text-sm font-bold mt-2">
            🌸 {flowerCount} · 🥀 {thornCount} · ⭐ {score}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReplay} className="px-6 py-3 rounded-full bg-amber-500 text-white font-bold shadow-md active:scale-90">
            {TEXT.again[lang]}
          </button>
          <button
            onClick={() => { stop(); onComplete?.({ score, flowers: flowerCount, thorns: thornCount, total: data.scenarios.length }); }}
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
