import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import lessons from '../../../data/nursery/body-safety.json';

const TEXT = {
  title: { en: 'My Body, My Rules', hi: 'मेरा शरीर, मेरे नियम' },
  intro: {
    en: (n) => `${n ? n + ', y' : 'Y'}our body belongs to YOU! Today Guddu learns about keeping his body safe. This is very important.`,
    hi: (n) => `${n ? n + ', ' : ''}तुम्हारा शरीर तुम्हारा है! आज गुड्डू सीखेगा अपने शरीर को सुरक्षित रखना। यह बहुत ज़रूरी है।`,
  },
  start: { en: 'Begin', hi: 'शुरू करें' },
  next: { en: 'Next', hi: 'आगे' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  pledgeTitle: { en: 'My Body, My Rules Pledge', hi: 'मेरा शरीर, मेरे नियम का संकल्प' },
  pledge: [
    { en: 'My body belongs to me!', hi: 'मेरा शरीर मेरा है!' },
    { en: 'I know safe and unsafe touch.', hi: 'मुझे सुरक्षित और असुरक्षित छूना पता है।' },
    { en: 'I can always say NO!', hi: 'मैं हमेशा "नहीं" कह सकता हूँ!' },
    { en: 'I will tell my trusted adults.', hi: 'मैं अपने भरोसेमंद बड़ों को बताऊँगा।' },
  ],
  champ: { en: 'Safety Champion', hi: 'सुरक्षा चैंपियन' },
  helpline: { en: 'India Childline: 1098', hi: 'इंडिया चाइल्डलाइन: 1098' },
};

function GoodTouchLesson({ lesson, lang, sound, onDone }) {
  const [tapped, setTapped] = useState(new Set());
  const [showError, setShowError] = useState(false);
  const safeKeys = lesson.options.filter(o => o.safe).map(o => o.key);
  const allSafeTapped = safeKeys.every(k => tapped.has(k));

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-2 text-center text-amber-900 text-sm font-bold">
        {lang === 'hi' ? lesson.prompt_hi : lesson.prompt_en}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {lesson.options.map(opt => {
          const on = tapped.has(opt.key);
          let cls = 'bg-white border-gray-300';
          if (on) {
            cls = opt.safe ? 'bg-green-100 border-green-400 scale-105' : 'bg-red-100 border-red-400';
          }
          return (
            <button
              key={opt.key}
              onClick={() => {
                sound.tap();
                if (!opt.safe) {
                  setShowError(true);
                  setTimeout(() => setShowError(false), 1800);
                  return;
                }
                setTapped(new Set([...tapped, opt.key]));
                sound.success();
              }}
              className={`flex flex-col items-center gap-1 rounded-2xl border-3 p-3 transition-all active:scale-95 ${cls}`}
              style={{ minHeight: 110 }}
            >
              <span className="text-3xl">{opt.icon}</span>
              <span className="text-xs font-bold text-gray-700 text-center leading-tight">
                {lang === 'hi' ? opt.label_hi : opt.label_en}
              </span>
            </button>
          );
        })}
      </div>
      {showError && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 text-sm font-bold text-center rounded-xl px-3 py-2 animate-bounce-in">
          {lang === 'hi' ? 'यह असुरक्षित है — टैप मत करो' : 'That one is unsafe — your body says NO!'}
        </div>
      )}
      {allSafeTapped && (
        <button onClick={onDone} className="mx-auto px-6 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90 animate-bounce-in">
          {TEXT.next[lang]}
        </button>
      )}
    </div>
  );
}

function ShieldLesson({ lesson, lang, sound, onDone }) {
  const [strength, setStrength] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-2 text-center text-amber-900 text-sm font-bold">
        {lang === 'hi' ? lesson.prompt_hi : lesson.prompt_en}
      </div>
      <div className="relative" style={{ width: 200, height: 200 }}>
        <Guddu emotion="happy" size={180} />
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: `scale(${1 + strength * 0.06})`, transition: 'transform 0.3s' }}
        >
          <div
            className="rounded-full"
            style={{
              width: 200, height: 200,
              border: `${4 + strength * 1}px solid #0077B6`,
              boxShadow: `0 0 ${10 + strength * 5}px rgba(0, 119, 182, ${0.3 + strength * 0.1})`,
              opacity: 0.6 + strength * 0.05,
            }}
          />
        </div>
      </div>
      <button
        onClick={() => {
          sound.playTone(440 + strength * 50, 0.18, 'triangle');
          setStrength(s => Math.min(s + 1, 6));
        }}
        className="px-8 py-3 rounded-full bg-[#0077B6] text-white text-lg font-bold shadow-md active:scale-90"
      >
        {'\u{1F6E1}\u{FE0F}'} {lang === 'hi' ? 'ढाल मज़बूत करें' : 'Strengthen Shield'}
      </button>
      <p className="text-xs text-gray-500">{strength} / 6</p>
      {strength >= 5 && (
        <button onClick={onDone} className="mt-1 px-6 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90 animate-bounce-in">
          {TEXT.next[lang]}
        </button>
      )}
    </div>
  );
}

function NoLesson({ lesson, lang, sound, onDone }) {
  const [taps, setTaps] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-2 text-center text-amber-900 text-sm font-bold">
        {lang === 'hi' ? lesson.prompt_hi : lesson.prompt_en}
      </div>
      <Guddu emotion={taps > 0 ? 'celebrating' : 'happy'} size={140} animate />
      <button
        onClick={() => {
          sound.playTone(220 + taps * 80, 0.3, 'sawtooth');
          setTaps(t => Math.min(t + 1, 3));
        }}
        className="rounded-3xl bg-red-500 text-white font-extrabold shadow-lg active:scale-95 transition-all"
        style={{
          padding: '14px 32px',
          fontSize: 28 + taps * 10,
        }}
      >
        {lang === 'hi' ? 'नहीं!' : 'NO!'}
      </button>
      <p className="text-xs text-gray-500">
        {lang === 'hi' ? 'अपनी मज़बूत आवाज़ का अभ्यास करो' : 'Practice your strong voice'}
      </p>
      {taps >= 3 && (
        <button onClick={onDone} className="mt-1 px-6 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90 animate-bounce-in">
          {TEXT.next[lang]}
        </button>
      )}
    </div>
  );
}

function TrustedAdultsLesson({ lesson, lang, sound, onDone }) {
  const [picked, setPicked] = useState(new Set());
  const max = lesson.max_select || 3;
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-2 text-center text-amber-900 text-sm font-bold">
        {lang === 'hi' ? lesson.prompt_hi : lesson.prompt_en}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {lesson.options.map(opt => {
          const on = picked.has(opt.key);
          return (
            <button
              key={opt.key}
              onClick={() => {
                sound.tap();
                const next = new Set(picked);
                if (on) next.delete(opt.key);
                else if (picked.size < max) next.add(opt.key);
                setPicked(next);
              }}
              className={`flex flex-col items-center gap-1 rounded-2xl border-3 p-3 transition-all active:scale-95 ${
                on ? 'bg-blue-100 border-blue-400 scale-105' : 'bg-white border-gray-300'
              }`}
              style={{ minHeight: 100 }}
            >
              <span className="text-3xl">{opt.icon}</span>
              <span className="text-xs font-bold text-gray-700">{lang === 'hi' ? opt.label_hi : opt.label_en}</span>
            </button>
          );
        })}
      </div>
      {picked.size > 0 && (
        <button onClick={onDone} className="mx-auto px-6 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90 animate-bounce-in">
          {TEXT.next[lang]}
        </button>
      )}
    </div>
  );
}

export default function MyBodyMyRules({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');     // intro | lesson | done
  const [lessonIdx, setLessonIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const lesson = lessons[lessonIdx];

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'lesson') return;
    const t = setTimeout(() => speak(lesson.intro_en, lesson.intro_hi), 350);
    return () => clearTimeout(t);
  }, [phase, lessonIdx, lesson, speak]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(
      `You are a Safety Champion!`,
      `तुम सुरक्षा चैंपियन हो!`,
    ), 350);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const handleLessonDone = useCallback(() => {
    setShowConfetti(true);
    speak(lesson.lesson_en, lesson.lesson_hi);
    advanceTimerRef.current = setTimeout(() => {
      setShowConfetti(false);
      if (lessonIdx + 1 < lessons.length) setLessonIdx(i => i + 1);
      else setPhase('done');
    }, 2800);
  }, [lesson, lessonIdx, speak]);

  const bg = 'bg-gradient-to-b from-[#E0F4FF] via-[#FFF4E0] to-[#FFE0E0]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\u{1F6E1}\u{FE0F}'}</div>
          <Guddu emotion="happy" size={170} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('lesson'); }} className="mt-2 px-10 py-4 rounded-full bg-[#0077B6] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
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
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
          <div className="text-7xl animate-bounce-in">{'\u{1F396}\u{FE0F}'}</div>
          <Guddu emotion="celebrating" size={140} animate />
          <h2 className="text-xl font-bold text-gray-800">{TEXT.pledgeTitle[lang]}</h2>
          <ul className="text-sm text-gray-700 font-semibold space-y-1 bg-white rounded-2xl px-4 py-3 shadow-md max-w-[320px]">
            {TEXT.pledge.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500">{'\u2713'}</span>
                <span>{p[lang]}</span>
              </li>
            ))}
          </ul>
          <p className="text-amber-700 text-xs font-bold">{TEXT.champ[lang]} {'\u{1F396}\u{FE0F}'}</p>
          <div className="flex gap-3">
            <button onClick={() => { stop(); setLessonIdx(0); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(lessons.length); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <div className="text-xs text-red-700 font-bold mt-2">{TEXT.helpline[lang]}</div>
          <ParentTip
            tipEn="THIS IS CRITICAL EDUCATION. Reinforce these concepts regularly and casually — during bath time, before playdates. Use correct anatomical terms. If your child ever discloses uncomfortable contact, believe them, stay calm, and seek professional support. Childline India: 1098."
            tipHi="यह बहुत ज़रूरी शिक्षा है। इन्हें नियमित रूप से दोहराएँ — नहाते समय, खेल के पहले। सही शारीरिक नाम सिखाएँ। अगर बच्चा कुछ असहज बात बताए, उन पर भरोसा करें, शांत रहें, मदद लें। चाइल्डलाइन: 1098।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={lessonIdx} totalRounds={lessons.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />

      <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
        <div className="text-center text-sm font-bold text-gray-500">
          {lang === 'hi' ? lesson.title_hi : lesson.title_en}
        </div>

        <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold animate-bounce-in" key={`s-${lessonIdx}`}>
          {lang === 'hi' ? lesson.intro_hi : lesson.intro_en}
        </div>

        <div className="pb-2" key={`l-${lessonIdx}`}>
          {lesson.id === 'good_uncomfortable' && <GoodTouchLesson lesson={lesson} lang={lang} sound={sound} onDone={handleLessonDone} />}
          {lesson.id === 'swimsuit' && <ShieldLesson lesson={lesson} lang={lang} sound={sound} onDone={handleLessonDone} />}
          {lesson.id === 'saying_no' && <NoLesson lesson={lesson} lang={lang} sound={sound} onDone={handleLessonDone} />}
          {lesson.id === 'trusted_adult' && <TrustedAdultsLesson lesson={lesson} lang={lang} sound={sound} onDone={handleLessonDone} />}
        </div>
      </div>
    </GameShell>
  );
}
