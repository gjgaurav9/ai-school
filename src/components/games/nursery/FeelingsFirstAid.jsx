import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import Character from '../../common/Character';
import BreathingCircle from '../../common/BreathingCircle';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import strategies from '../../../data/nursery/coping-strategies.json';

const TOOL_ICONS = {
  breathing: '\u{1FAC1}',
  comfort: '\u{1F9F8}',
  talk: '\u{1F5E3}\u{FE0F}',
  pause: '\u23F8\u{FE0F}',
  calm: '\u2601\u{FE0F}',
};

const TEXT = {
  title: { en: 'Feelings First Aid', hi: 'भावना प्राथमिक चिकित्सा' },
  intro: {
    en: (n) => `${n ? n + ', s' : 'S'}ometimes feelings get really BIG. That's okay! Today we learn what to DO when big feelings come.`,
    hi: (n) => `${n ? n + ', ' : ''}कभी-कभी भावनाएँ बहुत बड़ी हो जाती हैं। यह ठीक है! आज सीखते हैं बड़ी भावनाओं में क्या करें।`,
  },
  start: { en: 'Open Toolbox', hi: 'टूलबॉक्स खोलें' },
  tryAgain: { en: 'Try the best one!', hi: 'सबसे अच्छा वाला चुनो!' },
  practice: { en: "Let's try it together", hi: 'चलो साथ करें' },
  next: { en: 'Next', hi: 'आगे' },
  done: { en: 'You earned the Feelings Toolbox!', hi: 'तुमने भावना टूलबॉक्स जीता!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  toolbox: { en: 'Your Toolbox', hi: 'तुम्हारा टूलबॉक्स' },
};

function CharacterDisplay({ kind, emotion, size = 130 }) {
  if (kind === 'guddu') return <Guddu emotion={emotion} size={size} animate />;
  return <Character kind={kind} emotion={emotion} size={size} animate showLabel />;
}

function PracticeView({ tool, lang, onDone }) {
  const sound = useSound();
  const [count, setCount] = useState(0);

  // Breathing — render BreathingCircle and call onDone after cycles
  if (tool === 'breathing') {
    return (
      <div className="flex flex-col items-center gap-4 py-4 animate-bounce-in">
        <BreathingCircle cycles={5} inSeconds={3} outSeconds={3} active onComplete={onDone} language={lang} color="#FF6B6B" />
      </div>
    );
  }

  if (tool === 'pause') {
    return (
      <div className="flex flex-col items-center gap-4 py-4 animate-bounce-in">
        <p className="text-lg font-bold text-gray-700">{lang === 'hi' ? '5 तक धीरे गिनो' : "Let's count slowly to 5"}</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              onClick={() => {
                if (n !== count + 1) return;
                sound.playTone(440 + n * 60, 0.2, 'sine');
                setCount(n);
                if (n === 5) setTimeout(onDone, 600);
              }}
              disabled={n !== count + 1}
              className={`w-12 h-12 rounded-full font-extrabold text-xl shadow-md transition-all active:scale-90 ${
                count >= n ? 'bg-green-500 text-white' : n === count + 1 ? 'bg-yellow-300 text-gray-800 animate-pulse' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">{lang === 'hi' ? 'अगले नंबर पर टैप करें' : 'Tap the next number'}</p>
      </div>
    );
  }

  if (tool === 'comfort') {
    const items = [
      { key: 'blanket', icon: '\u{1F6CC}\u{FE0F}', label_en: 'Blanket', label_hi: 'कंबल' },
      { key: 'toy', icon: '\u{1F9F8}', label_en: 'Toy', label_hi: 'खिलौना' },
      { key: 'parent', icon: '\u{1F465}', label_en: 'Parent', label_hi: 'माता-पिता' },
      { key: 'pet', icon: '\u{1F436}', label_en: 'Pet', label_hi: 'पालतू' },
      { key: 'pillow', icon: '\u{1F6CF}\u{FE0F}', label_en: 'Pillow', label_hi: 'तकिया' },
    ];
    const [picked, setPicked] = useState(new Set());
    return (
      <div className="flex flex-col items-center gap-3 py-2 animate-bounce-in">
        <p className="text-base font-bold text-gray-700 text-center">
          {lang === 'hi' ? 'जो तुम्हें सुरक्षित महसूस कराते हैं उन पर टैप करो' : 'Tap the things that make YOU feel safe'}
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-[320px]">
          {items.map(it => {
            const on = picked.has(it.key);
            return (
              <button
                key={it.key}
                onClick={() => {
                  sound.tap();
                  const next = new Set(picked);
                  if (on) next.delete(it.key); else next.add(it.key);
                  setPicked(next);
                }}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all ${on ? 'bg-pink-100 border-pink-400 scale-105' : 'bg-white border-gray-200'}`}
                style={{ minWidth: 80 }}
              >
                <span className="text-3xl">{it.icon}</span>
                <span className="text-xs font-bold text-gray-700">{lang === 'hi' ? it.label_hi : it.label_en}</span>
              </button>
            );
          })}
        </div>
        <button onClick={onDone} className="mt-2 px-6 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">
          {TEXT.next[lang]}
        </button>
      </div>
    );
  }

  if (tool === 'talk') {
    const people = [
      { key: 'mummy', icon: '\u{1F469}', label_en: 'Mummy', label_hi: 'मम्मी' },
      { key: 'papa', icon: '\u{1F468}', label_en: 'Papa', label_hi: 'पापा' },
      { key: 'dadi', icon: '\u{1F475}', label_en: 'Dadi', label_hi: 'दादी' },
      { key: 'teacher', icon: '\u{1F469}\u200D\u{1F3EB}', label_en: 'Teacher', label_hi: 'शिक्षक' },
      { key: 'friend', icon: '\u{1F46B}', label_en: 'Friend', label_hi: 'दोस्त' },
    ];
    const [pickedPerson, setPickedPerson] = useState(null);
    return (
      <div className="flex flex-col items-center gap-3 py-2 animate-bounce-in">
        <p className="text-base font-bold text-gray-700 text-center">
          {lang === 'hi' ? 'जब तुम उदास हो, तुम किसे बताना पसंद करते हो?' : 'When you feel sad, who do you like to talk to?'}
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-[320px]">
          {people.map(p => {
            const on = pickedPerson === p.key;
            return (
              <button
                key={p.key}
                onClick={() => { sound.tap(); setPickedPerson(p.key); }}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all ${on ? 'bg-blue-100 border-blue-400 scale-105' : 'bg-white border-gray-200'}`}
                style={{ minWidth: 80 }}
              >
                <span className="text-3xl">{p.icon}</span>
                <span className="text-xs font-bold text-gray-700">{lang === 'hi' ? p.label_hi : p.label_en}</span>
              </button>
            );
          })}
        </div>
        <button onClick={onDone} disabled={!pickedPerson} className="mt-2 px-6 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90 disabled:opacity-50">
          {TEXT.next[lang]}
        </button>
      </div>
    );
  }

  if (tool === 'calm') {
    return (
      <div className="flex flex-col items-center gap-3 py-2 animate-bounce-in">
        <p className="text-base font-bold text-gray-700 text-center max-w-[320px]">
          {lang === 'hi'
            ? 'आँखें बंद करो। नरम बादल पर तैरने की कल्पना करो। आसमान गुलाबी और नारंगी है। तुम सुरक्षित हो।'
            : "Close your eyes. Imagine you're floating on a soft cloud. The sky is pink and orange. You're safe."}
        </p>
        <div className="relative" style={{ height: 180, width: 280 }}>
          <div className="absolute text-6xl" style={{ left: '10%', top: '20%', animation: 'cloud-drift 8s linear infinite' }}>{'\u{2601}\u{FE0F}'}</div>
          <div className="absolute text-5xl" style={{ left: '50%', top: '50%', animation: 'cloud-drift 12s linear infinite reverse' }}>{'\u{2601}\u{FE0F}'}</div>
          <div className="absolute text-4xl" style={{ left: '70%', top: '70%', animation: 'cloud-drift 10s linear infinite' }}>{'\u{2601}\u{FE0F}'}</div>
        </div>
        <button onClick={onDone} className="mt-2 px-6 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">
          {TEXT.next[lang]}
        </button>
      </div>
    );
  }

  return null;
}

export default function FeelingsFirstAid({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');           // intro | scene | feedback | practice | done
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [collectedTools, setCollectedTools] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const scenario = strategies[scenarioIdx];

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'scene') return;
    const t = setTimeout(() => speak(
      `${scenario.scene_en} ${scenario.prompt_en}`,
      `${scenario.scene_hi} ${scenario.prompt_hi}`,
    ), 350);
    return () => clearTimeout(t);
  }, [phase, scenarioIdx, scenario, speak]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.done.en, TEXT.done.hi), 350);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const handleChoose = useCallback((opt) => {
    if (chosen) return;
    sound.tap();
    setChosen(opt.key);
    speak(opt.feedback_en, opt.feedback_hi);
    if (opt.correct) {
      sound.success();
      setPhase('feedback');
    } else {
      sound.gentle();
      setPhase('feedback');
      // Allow retry after a bit
      advanceTimerRef.current = setTimeout(() => {
        setChosen(null);
        setPhase('scene');
      }, 2800);
    }
  }, [chosen, sound, speak]);

  const handleStartPractice = () => { stop(); setPhase('practice'); };

  const handlePracticeDone = useCallback(() => {
    setCollectedTools(prev => prev.includes(scenario.tool) ? prev : [...prev, scenario.tool]);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setChosen(null);
      if (scenarioIdx + 1 < strategies.length) {
        setScenarioIdx(i => i + 1);
        setPhase('scene');
      } else {
        setPhase('done');
      }
    }, 1500);
  }, [scenario, scenarioIdx]);

  const bg = 'bg-gradient-to-b from-[#E8F4FD] via-[#F0F4FF] to-[#FFF0E8]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\u{1F49A}'}</div>
          <Guddu emotion="happy" size={170} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('scene'); }} className="mt-2 px-10 py-4 rounded-full bg-[#A855F7] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
            {TEXT.start[lang]}
          </button>
        </div>
      </GameShell>
    );
  }

  if (phase === 'done') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <Celebration active type="confetti" />
        <Celebration active type="stars" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <Guddu emotion="celebrating" size={150} animate />
          <h2 className="text-2xl font-bold text-gray-800 animate-bounce-in">{TEXT.done[lang]}</h2>
          <p className="text-sm font-semibold text-gray-600">{TEXT.toolbox[lang]}</p>
          <div className="grid grid-cols-3 gap-2 max-w-[320px]">
            {strategies.map(s => {
              const have = collectedTools.includes(s.tool);
              return (
                <div key={s.tool} className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-all ${have ? 'bg-yellow-50 border-yellow-300 scale-105' : 'bg-gray-100 border-gray-200 opacity-50'}`}>
                  <span className="text-3xl">{TOOL_ICONS[s.tool]}</span>
                  <span className="text-[10px] font-bold text-center text-gray-700 leading-tight">
                    {lang === 'hi' ? s.tool_label_hi : s.tool_label_en}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { stop(); setScenarioIdx(0); setChosen(null); setCollectedTools([]); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(collectedTools.length); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Practice these strategies BEFORE meltdowns happen. When a real meltdown happens, breathe WITH them silently — they'll mirror you. The goal isn't to stop emotions — it's to RIDE them safely."
            tipHi="ये उपाय गुस्सा/रोने से पहले अभ्यास करें। असली मेल्टडाउन में, चुपचाप उनके साथ साँस लें — वे नकल करेंगे। लक्ष्य भावनाएँ रोकना नहीं — सुरक्षित यात्रा करना है।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  // PRACTICE view
  if (phase === 'practice') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} round={scenarioIdx} totalRounds={strategies.length} bg={bg}>
        <Celebration active={showConfetti} type="confetti" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-3">
          <p className="text-sm font-bold text-purple-700">{TEXT.practice[lang]}</p>
          <PracticeView tool={scenario.tool} lang={lang} onDone={handlePracticeDone} />
        </div>
      </GameShell>
    );
  }

  // SCENE / FEEDBACK
  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={scenarioIdx} totalRounds={strategies.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />

      <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
        <div className="flex justify-center" key={`char-${scenarioIdx}`}>
          <CharacterDisplay kind={scenario.character} emotion={scenario.emotion} size={120} />
        </div>

        <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold animate-bounce-in" key={`s-${scenarioIdx}`}>
          {lang === 'hi' ? scenario.scene_hi : scenario.scene_en}
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl px-4 py-2 text-center text-purple-900 text-sm font-bold">
          {lang === 'hi' ? scenario.prompt_hi : scenario.prompt_en}
        </div>

        <div className="flex flex-col gap-2 pb-3">
          {scenario.options.map(opt => {
            const isThis = chosen === opt.key;
            const isAnswer = opt.correct;
            let cls = 'bg-white border-gray-200 text-gray-700';
            if (chosen) {
              if (isAnswer) cls = 'bg-green-100 border-green-400 text-green-800 scale-105';
              else if (isThis) cls = 'bg-orange-50 border-orange-300 text-orange-700';
            }
            return (
              <button
                key={opt.key}
                onClick={() => handleChoose(opt)}
                disabled={!!chosen}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold text-base shadow-sm transition-all active:scale-95 ${cls}`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="flex-1">{lang === 'hi' ? opt.label_hi : opt.label_en}</span>
              </button>
            );
          })}
        </div>

        {phase === 'feedback' && chosen && (() => {
          const opt = scenario.options.find(o => o.key === chosen);
          return (
            <div className={`rounded-2xl border-2 px-4 py-3 text-center text-sm font-semibold animate-bounce-in ${
              opt.correct ? 'bg-green-50 border-green-300 text-green-900' : 'bg-orange-50 border-orange-200 text-orange-900'
            }`}>
              {lang === 'hi' ? opt.feedback_hi : opt.feedback_en}
              {opt.correct && (
                <button onClick={handleStartPractice} className="mt-3 block mx-auto px-6 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">
                  {TEXT.practice[lang]}
                </button>
              )}
            </div>
          );
        })()}
      </div>
    </GameShell>
  );
}
