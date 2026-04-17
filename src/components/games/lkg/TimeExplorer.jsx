import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Character from '../../common/Character';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import data from '../../../data/lkg/time-activities.json';

const TEXT = {
  title: { en: 'Time Explorer', hi: 'समय खोजी' },
  intro: {
    en: (n) => `${n ? n + ', t' : 'T'}ime is always moving! Let's learn to understand it.`,
    hi: (n) => `${n ? n + ', ' : ''}समय हमेशा चलता रहता है! चलो इसे समझें।`,
  },
  start: { en: 'Begin Journey', hi: 'यात्रा शुरू' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  done: { en: 'You understand time now!', hi: 'अब तुम समय समझते हो!' },
  badge: { en: 'Time Explorer', hi: 'समय खोजी' },
  daysSection: { en: 'Days of the Week', hi: 'सप्ताह के दिन' },
  clockSection: { en: 'Reading the Clock', hi: 'घड़ी पढ़ना' },
  planSection: { en: 'Plan Saturday', hi: 'शनिवार की योजना' },
  whatNextDay: { en: 'What day comes next?', hi: 'अगला दिन कौनसा?' },
  whatTime: { en: 'What time?', hi: 'कौनसा समय?' },
  setClockTo: {
    en: (h) => `Set the clock to ${h} o'clock!`,
    hi: (h) => `घड़ी को ${h} बजे पर सेट करें!`,
  },
  morning:   { en: 'Morning',   hi: 'सुबह' },
  afternoon: { en: 'Afternoon', hi: 'दोपहर' },
  evening:   { en: 'Evening',   hi: 'शाम' },
};

// ---------------------------------------------------------------------------
// Clock face — only hour hand. `hour` is 1..12.
// `interactive` enables drag/tap to change `hour` via setHour callback.
// ---------------------------------------------------------------------------
function Clock({ hour = 12, size = 200, interactive = false, onChange }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.45;
  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);
  const handleAngle = ((hour % 12) / 12) * 360 - 90;
  const handLen = r * 0.55;
  const handX = cx + Math.cos(handleAngle * Math.PI / 180) * handLen;
  const handY = cy + Math.sin(handleAngle * Math.PI / 180) * handLen;

  const handleClick = (e) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    let newHour = Math.round(angle / 30);
    if (newHour === 0) newHour = 12;
    onChange?.(newHour);
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      onClick={handleClick}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      <circle cx={cx} cy={cy} r={r} fill="#FFF8E0" stroke="#E0A800" strokeWidth={4} />
      {numbers.map((n) => {
        const a = ((n / 12) * 360 - 90) * Math.PI / 180;
        const nx = cx + Math.cos(a) * r * 0.8;
        const ny = cy + Math.sin(a) * r * 0.8 + 5;
        return (
          <text key={n} x={nx} y={ny} textAnchor="middle" fontWeight="800"
            fontSize={size * 0.1} fill="#7A4F00">
            {n}
          </text>
        );
      })}
      {/* Hour hand */}
      <line x1={cx} y1={cy} x2={handX} y2={handY}
        stroke="#0077B6" strokeWidth={size * 0.04} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={size * 0.04} fill="#0077B6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sub-screens
// ---------------------------------------------------------------------------
function DaysScreen({ lang, sound, speak, onDone }) {
  const today = data.days[(new Date().getDay() + 6) % 7]; // Mon=0
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  const questions = useMemo(() => [
    { prompt_en: 'Monday, Tuesday, Wednesday... what comes next?', prompt_hi: 'सोम, मंगल, बुध... आगे?', options: ['Thursday', 'Saturday', 'Monday'], answer: 'Thursday' },
    { prompt_en: `Today is ${today.key}. What was yesterday?`, prompt_hi: `आज ${today.hi} है। कल क्या था?`, options: data.days.slice(0,3).map(d => d.key), answer: data.days[(data.days.indexOf(today) + 6) % 7].key, hint: true },
  ], [today]);

  const q = questions[questionIdx];
  // Re-build "yesterday" question dynamically with proper options
  const realQ = q.hint
    ? { ...q, options: [
        data.days[(data.days.indexOf(today) + 6) % 7].key,
        data.days[(data.days.indexOf(today) + 1) % 7].key,
        data.days[(data.days.indexOf(today) + 3) % 7].key,
      ]}
    : q;

  const handlePick = (opt) => {
    if (selectedDay) return;
    sound.tap();
    setSelectedDay(opt);
    if (opt === realQ.answer) {
      sound.success();
      speak(`Yes, ${opt}!`, `सही, ${opt}!`);
      setTimeout(() => {
        setSelectedDay(null);
        if (questionIdx + 1 < questions.length) setQuestionIdx(i => i + 1);
        else onDone();
      }, 1600);
    } else {
      sound.gentle();
      speak(`Hmm, the answer is ${realQ.answer}.`, `नहीं, उत्तर ${realQ.answer} है।`);
      setTimeout(() => {
        setSelectedDay(null);
        if (questionIdx + 1 < questions.length) setQuestionIdx(i => i + 1);
        else onDone();
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 px-3">
      <h3 className="text-base font-bold text-gray-700">{TEXT.daysSection[lang]}</h3>
      <div className="flex gap-1 flex-wrap justify-center">
        {data.days.map((d, i) => (
          <div
            key={d.key}
            className="flex flex-col items-center rounded-xl border-2 px-2 py-1"
            style={{ backgroundColor: d.color + '33', borderColor: d.color }}
          >
            <span className="text-xl">{d.icon}</span>
            <span className="text-[10px] font-bold text-gray-700">{lang === 'hi' ? d.hi : d.key.slice(0,3)}</span>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2 text-center text-amber-900 text-sm font-bold">
        {lang === 'hi' ? realQ.prompt_hi : realQ.prompt_en}
      </div>
      <div className="flex flex-col gap-2 w-full max-w-[300px]">
        {realQ.options.map(opt => {
          const isThis = selectedDay === opt;
          let cls = 'bg-white border-gray-300 text-gray-700';
          if (selectedDay) {
            if (opt === realQ.answer) cls = 'bg-green-100 border-green-500 text-green-700';
            else if (isThis) cls = 'bg-orange-50 border-orange-300 text-orange-700';
          }
          return (
            <button
              key={opt}
              onClick={() => handlePick(opt)}
              disabled={!!selectedDay}
              className={`rounded-xl border-2 px-4 py-2 font-bold text-base shadow-sm transition-all active:scale-95 ${cls}`}
            >
              {lang === 'hi' ? data.days.find(d => d.key === opt)?.hi : opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ClockScreen({ lang, sound, speak, onDone }) {
  const [step, setStep] = useState(0); // 0: read, 1: set
  const [readIdx, setReadIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [setIdx, setSetIdx] = useState(0);
  const [setHour, setSetHour] = useState(12);

  const reads = data.clockReads;
  const sets = data.setClock;

  const handleRead = (n) => {
    if (chosen) return;
    sound.tap();
    setChosen(n);
    if (n === reads[readIdx].answer) {
      sound.success();
      speak(`Yes, ${n} o'clock!`, `सही, ${n} बजे!`);
    } else {
      sound.gentle();
      speak(`The answer is ${reads[readIdx].answer} o'clock.`, `उत्तर ${reads[readIdx].answer} बजे है।`);
    }
    setTimeout(() => {
      setChosen(null);
      if (readIdx + 1 < reads.length) setReadIdx(i => i + 1);
      else setStep(1);
    }, 2000);
  };

  const handleSetConfirm = () => {
    if (setHour !== sets[setIdx]) {
      sound.gentle();
      speak(`Almost! Try ${sets[setIdx]} o'clock.`, `लगभग! ${sets[setIdx]} बजे की कोशिश करें।`);
      return;
    }
    sound.success();
    sound.playTone(523, 0.4, 'triangle');
    speak(`${sets[setIdx]} o'clock!`, `${sets[setIdx]} बजे!`);
    setTimeout(() => {
      if (setIdx + 1 < sets.length) {
        setSetIdx(i => i + 1);
        setSetHour(12);
      } else {
        onDone();
      }
    }, 1500);
  };

  if (step === 0) {
    const r = reads[readIdx];
    return (
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-base font-bold text-gray-700">{TEXT.clockSection[lang]}</h3>
        <Clock hour={r.show} size={170} />
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2 text-center text-amber-900 text-sm font-bold">
          {lang === 'hi' ? r.phrase_hi : r.phrase_en}
        </div>
        <div className="flex gap-3">
          {r.options.map(n => {
            const isThis = chosen === n;
            let cls = 'bg-white border-gray-300';
            if (chosen) {
              if (n === r.answer) cls = 'bg-green-100 border-green-500 scale-110';
              else if (isThis) cls = 'bg-orange-50 border-orange-300';
            }
            return (
              <button
                key={n}
                onClick={() => handleRead(n)}
                disabled={!!chosen}
                className={`px-3 py-2 rounded-xl border-2 font-bold text-base shadow-sm active:scale-95 transition-all ${cls}`}
              >
                {lang === 'hi' ? `${n} बजे` : `${n} o'clock`}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // step 1: set
  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-base font-bold text-gray-700">{TEXT.clockSection[lang]}</h3>
      <p className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2 text-center text-amber-900 text-sm font-bold">
        {TEXT.setClockTo[lang](sets[setIdx])}
      </p>
      <Clock hour={setHour} size={200} interactive onChange={setSetHour} />
      <p className="text-xs text-gray-500">{lang === 'hi' ? 'घड़ी पर जहाँ टैप करें' : 'Tap on the clock face'}</p>
      <button
        onClick={handleSetConfirm}
        className="px-6 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90"
      >
        {lang === 'hi' ? 'पुष्टि करें' : 'Confirm'}
      </button>
    </div>
  );
}

function PlanScreen({ lang, sound, onDone }) {
  const [placements, setPlacements] = useState({}); // key -> slot
  const [pickedKey, setPickedKey] = useState(null);

  const slots = ['morning', 'afternoon', 'evening'];

  const handleActivityPick = (key) => {
    if (placements[key]) return;
    sound.tap();
    setPickedKey(key);
  };

  const handleSlotTap = (slot) => {
    if (!pickedKey) return;
    sound.success();
    setPlacements(prev => ({ ...prev, [pickedKey]: slot }));
    setPickedKey(null);
  };

  const allPlaced = data.planActivities.every(a => placements[a.key]);

  useEffect(() => {
    if (allPlaced) setTimeout(onDone, 1500);
  }, [allPlaced, onDone]);

  return (
    <div className="flex flex-col gap-3 px-3">
      <h3 className="text-base font-bold text-gray-700 text-center">{TEXT.planSection[lang]}</h3>

      {/* Slots */}
      <div className="flex flex-col gap-2">
        {slots.map(slot => {
          const placed = data.planActivities.filter(a => placements[a.key] === slot);
          return (
            <button
              key={slot}
              onClick={() => handleSlotTap(slot)}
              disabled={!pickedKey}
              className={`rounded-2xl border-2 border-dashed p-2 min-h-[60px] transition-all ${pickedKey ? 'border-amber-400 bg-amber-50 animate-pulse' : 'border-gray-300 bg-white/60'}`}
            >
              <div className="text-[11px] font-bold text-gray-600 text-left mb-1">{TEXT[slot][lang]}</div>
              <div className="flex flex-wrap gap-1">
                {placed.map(a => (
                  <div key={a.key} className="bg-green-100 border border-green-400 rounded-lg px-2 py-1 text-xs font-bold text-green-700 flex items-center gap-1">
                    <span>{a.icon}</span>
                    <span>{lang === 'hi' ? a.label_hi : a.label_en}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Activity tiles */}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {data.planActivities.filter(a => !placements[a.key]).map(a => {
          const isPicked = pickedKey === a.key;
          return (
            <button
              key={a.key}
              onClick={() => handleActivityPick(a.key)}
              className={`flex flex-col items-center rounded-xl border-2 p-2 shadow-md transition-all active:scale-95 ${
                isPicked ? 'bg-amber-100 border-amber-500 scale-110' : 'bg-white border-gray-300'
              }`}
              style={{ minWidth: 80 }}
            >
              <span className="text-3xl">{a.icon}</span>
              <span className="text-[10px] font-bold text-gray-700 text-center">{lang === 'hi' ? a.label_hi : a.label_en}</span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500">
        {pickedKey
          ? (lang === 'hi' ? 'अब समय (सुबह/दोपहर/शाम) चुनें' : 'Now tap a time slot above')
          : (lang === 'hi' ? 'गतिविधि चुनें' : 'Pick an activity')}
      </p>
    </div>
  );
}

export default function TimeExplorer({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');     // intro | days | clock | plan | done
  const [showConfetti, setShowConfetti] = useState(false);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  useEffect(() => () => { stop(); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    setShowConfetti(true);
    const t = setTimeout(() => speak(TEXT.done.en, TEXT.done.hi), 350);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const totalRounds = 3;
  const currentRound = phase === 'days' ? 0 : phase === 'clock' ? 1 : phase === 'plan' ? 2 : 3;

  const bg = 'bg-gradient-to-b from-[#FFF8E0] via-[#E0F4FF] to-[#FFE0F0]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <Clock hour={(new Date().getHours() % 12) || 12} size={140} />
          <Character kind="ullu" emotion="happy" size={130} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('days'); }} className="mt-2 px-10 py-4 rounded-full bg-[#FF8C42] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
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
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
          <Clock hour={(new Date().getHours() % 12) || 12} size={140} />
          <Character kind="ullu" emotion="happy" size={120} animate />
          <h2 className="text-xl font-bold text-gray-800">{TEXT.done[lang]}</h2>
          <p className="text-amber-700 text-sm font-bold">{TEXT.badge[lang]}</p>
          <div className="flex gap-3">
            <button onClick={() => { stop(); setPhase('intro'); setShowConfetti(false); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(3); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Get a simple analog clock for your child's room. Ask 'What does the short hand say?' Before events: 'Cricket is at 4 — how many hours from now?' Builds time sense digital clocks can't."
            tipHi="बच्चे के कमरे में सादी एनालॉग घड़ी रखें। पूछें 'छोटा हाथ क्या कह रहा है?' डिजिटल घड़ियाँ यह नहीं सिखातीं।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={currentRound} totalRounds={totalRounds} bg={bg}>
      <div className="flex-1 flex items-center justify-center py-3">
        {phase === 'days'  && <DaysScreen  lang={lang} sound={sound} speak={speak} onDone={() => setPhase('clock')} />}
        {phase === 'clock' && <ClockScreen lang={lang} sound={sound} speak={speak} onDone={() => setPhase('plan')} />}
        {phase === 'plan'  && <PlanScreen  lang={lang} sound={sound} onDone={() => setPhase('done')} />}
      </div>
    </GameShell>
  );
}
