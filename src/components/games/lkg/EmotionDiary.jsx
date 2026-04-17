import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import { useProgress } from '../../../hooks/useProgress';
import data from '../../../data/lkg/diary-options.json';

const TEXT = {
  title: { en: 'Emotion Diary', hi: 'भावना डायरी' },
  intro: {
    en: (n) => `Hi${n ? ' ' + n : ''}! Time for your Feeling Diary. How are you feeling RIGHT NOW?`,
    hi: (n) => `${n ? n + ', ' : ''}तुम्हारी डायरी का समय है। अभी तुम कैसा महसूस कर रहे हो?`,
  },
  why: {
    en: (e) => `You feel ${e}. Can you tell me why?`,
    hi: (e) => `तुम ${e} महसूस कर रहे हो। क्यों?`,
  },
  bodyQ: {
    en: (e) => `Where do you feel the ${e} feeling in your body?`,
    hi: (e) => `यह ${e} भावना तुम्हारे शरीर में कहाँ है?`,
  },
  helpQ: { en: "Did anything help you feel a little better?", hi: 'क्या किसी चीज़ से थोड़ा अच्छा लगा?' },
  saved: { en: 'Diary entry saved!', hi: 'डायरी सहेजी गई!' },
  bodyResponse: {
    en: (e, b) => `Many people feel ${e} in their ${b}. Your body is smart — it tells you how you feel!`,
    hi: (e, b) => `बहुत लोग ${e} अपने ${b} में महसूस करते हैं। तुम्हारा शरीर समझदार है!`,
  },
  weeklyTitle: { en: 'Your Week in Feelings', hi: 'तुम्हारा सप्ताह' },
  weeklyIntro: { en: "Let's look at your week!", hi: 'चलो तुम्हारा सप्ताह देखें!' },
  done: { en: 'Done', hi: 'हो गया' },
  again: { en: 'New Entry', hi: 'नई डायरी' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function relativeDayLabel(iso, lang) {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0,0,0,0);
  const that = new Date(d); that.setHours(0,0,0,0);
  const days = Math.round((today - that) / 86400000);
  if (days === 0) return lang === 'hi' ? 'आज' : 'Today';
  if (days === 1) return lang === 'hi' ? 'कल' : 'Yesterday';
  return lang === 'hi' ? `${days} दिन पहले` : `${days} days ago`;
}

function weekdayLetter(date, lang) {
  const en = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const hi = ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'];
  return (lang === 'hi' ? hi : en)[date.getDay()];
}

export default function EmotionDiary({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const { progress, addDiaryEntry } = useProgress();
  const entries = progress.diaryEntries || [];

  const [phase, setPhase] = useState('intro');     // intro | emotion | trigger | body | helper | saved | weekly
  const [emotion, setEmotion] = useState(null);
  const [trigger, setTrigger] = useState(null);
  const [bodyLoc, setBodyLoc] = useState(null);
  const [helper, setHelper] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);

  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const emotionMeta = useMemo(() => emotion ? data.emotions.find(e => e.key === emotion) : null, [emotion]);

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'emotion') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 200);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'trigger' || !emotionMeta) return;
    const t = setTimeout(() => speak(
      TEXT.why.en(emotionMeta.label_en.toLowerCase()),
      TEXT.why.hi(emotionMeta.label_hi),
    ), 250);
    return () => clearTimeout(t);
  }, [phase, emotionMeta, speak]);

  useEffect(() => {
    if (phase !== 'body' || !emotionMeta) return;
    const t = setTimeout(() => speak(
      TEXT.bodyQ.en(emotionMeta.label_en.toLowerCase()),
      TEXT.bodyQ.hi(emotionMeta.label_hi),
    ), 250);
    return () => clearTimeout(t);
  }, [phase, emotionMeta, speak]);

  useEffect(() => {
    if (phase !== 'helper') return;
    const t = setTimeout(() => speak(TEXT.helpQ.en, TEXT.helpQ.hi), 250);
    return () => clearTimeout(t);
  }, [phase, speak]);

  // Save when reaching saved phase
  useEffect(() => {
    if (phase !== 'saved') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.saved.en, TEXT.saved.hi), 250);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const isNegative = emotionMeta && emotionMeta.valence === 'neg';

  const handleEmotion = (e) => {
    sound.tap();
    setEmotion(e.key);
    setPhase('trigger');
  };

  const handleTrigger = (t) => {
    sound.tap();
    setTrigger(t.key);
    setPhase('body');
  };

  const handleBody = (b) => {
    sound.tap();
    setBodyLoc(b.key);
    speak(
      TEXT.bodyResponse.en(emotionMeta.label_en.toLowerCase(), b.label_en.toLowerCase()),
      TEXT.bodyResponse.hi(emotionMeta.label_hi, b.label_hi),
    );
    advanceTimerRef.current = setTimeout(() => {
      if (isNegative) setPhase('helper');
      else saveAndShow(null);
    }, 1800);
  };

  const handleHelper = (h) => {
    sound.tap();
    setHelper(h.key);
    saveAndShow(h.key);
  };

  const saveAndShow = (helperKey) => {
    const entry = {
      date: todayKey(),
      emotion,
      trigger,
      bodyLocation: bodyLoc,
      whatHelped: helperKey,
      timestamp: new Date().toISOString(),
    };
    addDiaryEntry(entry);
    setShowConfetti(true);
    setPhase('saved');
  };

  const showWeekly = () => {
    setPhase('weekly');
  };

  const handleStartNew = () => {
    stop();
    setEmotion(null); setTrigger(null); setBodyLoc(null); setHelper(null);
    setShowConfetti(false);
    setPhase('emotion');
  };

  const handleFinish = () => {
    stop();
    onComplete?.(entries.length + 1);
  };

  // Weekly review computation
  const weekData = useMemo(() => {
    // Last 7 days, with the most recent emotion per day (if any)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const key = d.toISOString().slice(0, 10);
      const todays = entries.filter(e => e.date === key);
      const last = todays[todays.length - 1] || null;
      days.push({ date: d, key, entry: last });
    }
    // Tally emotion counts
    const counts = {};
    days.forEach(d => { if (d.entry) counts[d.entry.emotion] = (counts[d.entry.emotion] || 0) + 1; });
    return { days, counts };
  }, [entries]);

  const totalEntries = entries.length + (phase === 'saved' ? 0 : 0);
  const showWeeklyButton = (entries.length + 1) % 7 === 0 || entries.length >= 7;

  const bg = 'bg-gradient-to-b from-[#FFF0E8] via-[#FFE8D8] to-[#FFD8C8]';

  // ---- INTRO ----
  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\u{1F4D4}'}</div>
          <Guddu emotion="happy" size={170} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('emotion'); }} className="mt-2 px-10 py-4 rounded-full bg-[#E91E8C] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
            {lang === 'hi' ? 'चलो शुरू करें' : "Let's Begin"}
          </button>
          {entries.length > 0 && (
            <button onClick={showWeekly} className="px-6 py-2 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90 text-sm">
              {lang === 'hi' ? `पुरानी डायरी (${entries.length})` : `View past entries (${entries.length})`}
            </button>
          )}
        </div>
      </GameShell>
    );
  }

  // ---- EMOTION PICK ----
  if (phase === 'emotion') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col px-4 py-3 gap-3">
          <div className="bg-white/85 rounded-2xl px-4 py-3 text-center text-gray-700 text-base font-semibold animate-bounce-in">
            {TEXT.intro[lang](childName)}
          </div>
          <div className="grid grid-cols-2 gap-3 pb-3">
            {data.emotions.map(e => (
              <button
                key={e.key}
                onClick={() => handleEmotion(e)}
                className="rounded-2xl border-2 border-white bg-white shadow-md py-3 px-2 active:scale-95 transition-all"
                style={{ background: `linear-gradient(135deg, ${e.color}33, ${e.color}77)`, borderColor: e.color }}
              >
                <div className="text-5xl">{e.icon}</div>
                <div className="text-base font-bold text-gray-800 mt-1">{lang === 'hi' ? e.label_hi : e.label_en}</div>
              </button>
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  // ---- TRIGGER PICK ----
  if (phase === 'trigger') {
    const triggers = data.triggers[emotion] || [];
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl">{emotionMeta.icon}</span>
            <span className="text-xl font-bold text-gray-800">{lang === 'hi' ? emotionMeta.label_hi : emotionMeta.label_en}</span>
          </div>
          <div className="bg-white/85 rounded-2xl px-4 py-2 text-center text-gray-700 text-sm font-semibold">
            {TEXT.why[lang](lang === 'hi' ? emotionMeta.label_hi : emotionMeta.label_en.toLowerCase())}
          </div>
          <div className="flex flex-col gap-2 pb-3">
            {triggers.map(t => (
              <button
                key={t.key}
                onClick={() => handleTrigger(t)}
                className="rounded-2xl border-2 border-gray-200 bg-white shadow-sm px-4 py-3 text-left font-bold text-base text-gray-700 active:scale-95"
              >
                {lang === 'hi' ? t.label_hi : t.label_en}
              </button>
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  // ---- BODY LOCATION ----
  if (phase === 'body') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center px-4 py-3 gap-3">
          <div className="bg-white/85 rounded-2xl px-4 py-2 text-center text-gray-700 text-sm font-semibold">
            {TEXT.bodyQ[lang](lang === 'hi' ? emotionMeta.label_hi : emotionMeta.label_en.toLowerCase())}
          </div>
          {/* Simple body silhouette with tappable zones */}
          <div className="relative" style={{ width: 180, height: 280 }}>
            <svg width={180} height={280} viewBox="0 0 180 280">
              {/* Body silhouette */}
              <circle cx={90} cy={40} r={30} fill="#FFE0CC" stroke="#A0522D" strokeWidth={2} />
              <rect x={55} y={70} width={70} height={90} rx={14} fill="#FFE0CC" stroke="#A0522D" strokeWidth={2} />
              <rect x={38} y={80} width={20} height={70} rx={10} fill="#FFE0CC" stroke="#A0522D" strokeWidth={2} />
              <rect x={122} y={80} width={20} height={70} rx={10} fill="#FFE0CC" stroke="#A0522D" strokeWidth={2} />
              <rect x={62} y={160} width={24} height={100} rx={10} fill="#FFE0CC" stroke="#A0522D" strokeWidth={2} />
              <rect x={94} y={160} width={24} height={100} rx={10} fill="#FFE0CC" stroke="#A0522D" strokeWidth={2} />
              {/* Highlight chosen zone */}
              {bodyLoc === 'head' && <circle cx={90} cy={40} r={32} fill={emotionMeta.color} opacity={0.6} />}
              {bodyLoc === 'chest' && <rect x={55} y={70} width={70} height={45} rx={14} fill={emotionMeta.color} opacity={0.6} />}
              {bodyLoc === 'tummy' && <rect x={55} y={115} width={70} height={45} rx={14} fill={emotionMeta.color} opacity={0.6} />}
              {bodyLoc === 'hands' && (<>
                <rect x={38} y={80} width={20} height={70} rx={10} fill={emotionMeta.color} opacity={0.6} />
                <rect x={122} y={80} width={20} height={70} rx={10} fill={emotionMeta.color} opacity={0.6} />
              </>)}
              {bodyLoc === 'legs' && (<>
                <rect x={62} y={160} width={24} height={100} rx={10} fill={emotionMeta.color} opacity={0.6} />
                <rect x={94} y={160} width={24} height={100} rx={10} fill={emotionMeta.color} opacity={0.6} />
              </>)}
              {bodyLoc === 'all' && <rect x={0} y={0} width={180} height={280} fill={emotionMeta.color} opacity={0.3} />}
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full pb-3">
            {data.bodyZones.map(z => (
              <button
                key={z.key}
                onClick={() => handleBody(z)}
                disabled={!!bodyLoc}
                className={`rounded-xl border-2 px-2 py-2 text-sm font-bold active:scale-95 transition-all ${
                  bodyLoc === z.key ? 'bg-amber-100 border-amber-400 scale-105' : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                {lang === 'hi' ? z.label_hi : z.label_en}
              </button>
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  // ---- HELPER PICK ----
  if (phase === 'helper') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
          <div className="bg-white/85 rounded-2xl px-4 py-2 text-center text-gray-700 text-sm font-semibold">
            {TEXT.helpQ[lang]}
          </div>
          <div className="flex flex-col gap-2 pb-3">
            {data.helpers.map(h => (
              <button
                key={h.key}
                onClick={() => handleHelper(h)}
                className="rounded-2xl border-2 border-gray-200 bg-white shadow-sm px-4 py-3 text-left font-bold text-base text-gray-700 active:scale-95 flex items-center gap-3"
              >
                <span className="text-2xl">{h.icon}</span>
                <span>{lang === 'hi' ? h.label_hi : h.label_en}</span>
              </button>
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  // ---- SAVED CONFIRMATION ----
  if (phase === 'saved') {
    const triggerLabel = trigger ? (data.triggers[emotion] || []).find(t => t.key === trigger) : null;
    const bodyLabel = bodyLoc ? data.bodyZones.find(b => b.key === bodyLoc) : null;
    const helperLabel = helper ? data.helpers.find(h => h.key === helper) : null;
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <Celebration active={showConfetti} type="confetti" />
        <div className="flex-1 flex flex-col items-center px-4 py-3 gap-3 overflow-y-auto">
          <div className="bg-white rounded-3xl border-4 border-amber-300 p-4 shadow-xl max-w-[330px] w-full animate-bounce-in">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-2">
              <span className="text-xs font-bold text-amber-700">{new Date().toLocaleDateString()}</span>
              <span className="text-2xl">{'\u{1F4D6}'}</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">{emotionMeta.icon}</span>
              <span className="text-2xl font-extrabold" style={{ color: emotionMeta.color }}>
                {lang === 'hi' ? emotionMeta.label_hi : emotionMeta.label_en}
              </span>
            </div>
            {triggerLabel && (
              <div className="mb-2">
                <div className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'hi' ? 'क्यों' : 'Why'}</div>
                <div className="text-sm text-gray-700">{lang === 'hi' ? triggerLabel.label_hi : triggerLabel.label_en}</div>
              </div>
            )}
            {bodyLabel && (
              <div className="mb-2">
                <div className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'hi' ? 'शरीर में' : 'Body'}</div>
                <div className="text-sm text-gray-700">{lang === 'hi' ? bodyLabel.label_hi : bodyLabel.label_en}</div>
              </div>
            )}
            {helperLabel && (
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'hi' ? 'क्या मदद की' : 'What helped'}</div>
                <div className="text-sm text-gray-700">{helperLabel.icon} {lang === 'hi' ? helperLabel.label_hi : helperLabel.label_en}</div>
              </div>
            )}
          </div>
          <p className="text-amber-700 font-bold text-sm">{TEXT.saved[lang]}</p>

          <div className="flex gap-2 pt-2 flex-wrap justify-center">
            {showWeeklyButton && (
              <button onClick={showWeekly} className="px-4 py-2 rounded-full bg-purple-500 text-white font-bold shadow-md active:scale-90 text-sm">
                {TEXT.weeklyTitle[lang]}
              </button>
            )}
            <button onClick={handleStartNew} className="px-4 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90 text-sm">
              {TEXT.again[lang]}
            </button>
            <button onClick={handleFinish} className="px-4 py-2 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90 text-sm">
              {TEXT.back[lang]}
            </button>
          </div>
          <ParentTip
            tipEn="Review this diary together weekly — without judgment. Say 'I notice you felt worried twice this week. Want to talk?' Never say 'You shouldn't feel that way.'"
            tipHi="हफ्ते में डायरी साथ देखें — बिना न्याय किए। कहें 'इस हफ्ते दो बार चिंता हुई। बात करोगे?' कभी न कहें 'ऐसा महसूस मत करो।'"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  // ---- WEEKLY REVIEW ----
  if (phase === 'weekly') {
    const topEmotionKey = Object.entries(weekData.counts).sort((a,b) => b[1] - a[1])[0]?.[0];
    const topEmotion = topEmotionKey ? data.emotions.find(e => e.key === topEmotionKey) : null;
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
          <h2 className="text-xl font-extrabold text-gray-800 text-center">{TEXT.weeklyTitle[lang]}</h2>

          {/* 7-day strip */}
          <div className="flex justify-between gap-1 px-2">
            {weekData.days.map((d, i) => {
              const e = d.entry ? data.emotions.find(em => em.key === d.entry.emotion) : null;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-[10px] font-bold text-gray-500">{weekdayLetter(d.date, lang)}</div>
                  <div
                    className={`rounded-full flex items-center justify-center text-2xl ${e ? '' : 'opacity-30'}`}
                    style={{
                      width: 36, height: 36,
                      backgroundColor: e ? e.color + '55' : '#E5E7EB',
                      border: e ? `2px solid ${e.color}` : '2px solid #D1D5DB',
                    }}
                  >
                    {e ? e.icon : '\u00b7'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Counts */}
          {Object.keys(weekData.counts).length > 0 && (
            <div className="bg-white rounded-2xl p-3 shadow-md">
              <p className="text-sm font-bold text-gray-700 mb-2">
                {lang === 'hi' ? 'इस हफ्ते' : 'This week'}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(weekData.counts).map(([key, n]) => {
                  const em = data.emotions.find(e => e.key === key);
                  if (!em) return null;
                  return (
                    <div key={key} className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold"
                      style={{ backgroundColor: em.color + '33', color: em.color, border: `1px solid ${em.color}` }}>
                      <span>{em.icon}</span>
                      <span>{lang === 'hi' ? em.label_hi : em.label_en}</span>
                      <span className="bg-white rounded-full px-1.5 ml-1">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {topEmotion && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl px-4 py-3 text-center text-purple-900 text-sm font-semibold">
              {lang === 'hi'
                ? `इस हफ्ते सबसे ज़्यादा "${topEmotion.label_hi}" महसूस किया। यह सामान्य है। हर दिन अलग होता है।`
                : `You felt "${topEmotion.label_en}" most this week. That's normal — every day is different.`}
            </div>
          )}

          {/* Past entries list */}
          {entries.length > 0 && (
            <div className="bg-white rounded-2xl p-3 shadow-md">
              <p className="text-sm font-bold text-gray-700 mb-2">
                {lang === 'hi' ? 'पुरानी डायरी' : 'Past entries'}
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {[...entries].slice(-10).reverse().map((e, i) => {
                  const em = data.emotions.find(em => em.key === e.emotion);
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs border-b border-gray-100 py-1">
                      <span className="text-xl">{em?.icon}</span>
                      <span className="font-bold" style={{ color: em?.color }}>{em ? (lang === 'hi' ? em.label_hi : em.label_en) : e.emotion}</span>
                      <span className="text-gray-400 ml-auto">{relativeDayLabel(e.date, lang)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center pt-2">
            <button onClick={handleStartNew} className="px-5 py-2 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90 text-sm">
              {TEXT.again[lang]}
            </button>
            <button onClick={handleFinish} className="px-5 py-2 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90 text-sm">
              {TEXT.back[lang]}
            </button>
          </div>
        </div>
      </GameShell>
    );
  }

  return null;
}
