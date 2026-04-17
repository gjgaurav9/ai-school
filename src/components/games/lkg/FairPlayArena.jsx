import { useState, useEffect, useCallback, useRef } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import Character from '../../common/Character';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import scenarios from '../../../data/lkg/fairplay-scenarios.json';

const TEXT = {
  title: { en: 'Fair Play Arena', hi: 'न्याय का खेल' },
  intro: {
    en: (n) => `${n ? n + ', w' : 'W'}elcome to the Fair Play Arena! Here we learn the most important game skill — being a GOOD player, not just a winning player.`,
    hi: (n) => `${n ? n + ', ' : ''}न्याय के खेल में स्वागत है! यहाँ सबसे ज़रूरी सीख — अच्छा खिलाड़ी बनना, सिर्फ़ जीतने वाला नहीं।`,
  },
  start: { en: 'Step Onto the Field', hi: 'मैदान में आओ' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  done: { en: 'You earned the Fair Play Champion badge!', hi: 'तुमने न्याय चैंपियन बैज जीता!' },
  pledgeTitle: { en: 'Fair Play Pledge', hi: 'न्याय का संकल्प' },
  pledge: [
    { en: 'I follow the rules, even when no one is watching.', hi: 'मैं नियम मानता हूँ, चाहे कोई देखे या न देखे।' },
    { en: 'I win with kindness and lose with grace.', hi: 'मैं प्यार से जीतता हूँ और शान से हारता हूँ।' },
    { en: 'I stand up for fairness.', hi: 'मैं न्याय की बात करता हूँ।' },
    { en: 'Teamwork makes us stronger.', hi: 'टीम वर्क हमें ताक़तवर बनाता है।' },
  ],
};

function CharRenderer({ kind, size = 90 }) {
  if (kind === 'guddu') return <Guddu emotion="happy" size={size} animate />;
  return <Character kind={kind} emotion="neutral" size={size} animate />;
}

function PushLogInteraction({ lang, sound, onDone }) {
  const [taps, setTaps] = useState({ guddu: 0, chhotu: 0 });
  const [done, setDone] = useState(false);
  const target = 6;
  const total = taps.guddu + taps.chhotu;

  const handleTap = (who) => {
    if (done) return;
    sound.playTone(440 + total * 40, 0.18, 'triangle');
    setTaps(prev => {
      const next = { ...prev, [who]: prev[who] + 1 };
      if (next.guddu + next.chhotu >= target) {
        setDone(true);
        sound.success();
        setTimeout(onDone, 1500);
      }
      return next;
    });
  };

  const progress = Math.min(total / target, 1);

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="text-base font-bold text-gray-700 text-center">
        {lang === 'hi' ? 'मिलकर लकड़ी धकेलें!' : 'Push the log together!'}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => handleTap('guddu')} disabled={done} className="active:scale-90 transition-transform">
          <Guddu emotion="happy" size={90} />
          <div className="text-xs font-bold text-amber-700 mt-1">PUSH</div>
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: target }).map((_, i) => (
            <div key={i}
              className={`w-3 h-8 rounded-sm ${i < total ? 'bg-amber-500' : 'bg-gray-300'}`} />
          ))}
        </div>
        <button onClick={() => handleTap('chhotu')} disabled={done} className="active:scale-90 transition-transform">
          <Character kind="chhotu" emotion="happy" size={90} />
          <div className="text-xs font-bold text-amber-700 mt-1">PUSH</div>
        </button>
      </div>
      {done && (
        <div className="text-base font-bold text-green-700 animate-bounce-in">
          {lang === 'hi' ? 'पुल बन गया! दोनों पार पहुँचे!' : 'A bridge! Both crossed safely!'}
        </div>
      )}
    </div>
  );
}

export default function FairPlayArena({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');     // intro | scene | feedback | done
  const [scenIdx, setScenIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const scen = scenarios[scenIdx];
  const isInteractive = !!scen?.interactive;
  const currentQuestion = !isInteractive ? scen?.questions[questionIdx] : null;
  const isLastQuestion = !isInteractive && questionIdx === scen?.questions.length - 1;

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'scene') return;
    const t = setTimeout(() => {
      if (questionIdx === 0) {
        speak(`${scen.scene_en} ${currentQuestion ? currentQuestion.prompt_en : ''}`,
              `${scen.scene_hi} ${currentQuestion ? currentQuestion.prompt_hi : ''}`);
      } else if (currentQuestion) {
        speak(currentQuestion.prompt_en, currentQuestion.prompt_hi);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [phase, scenIdx, questionIdx, scen, currentQuestion, speak]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.done.en, TEXT.done.hi), 350);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const goNext = useCallback(() => {
    setShowConfetti(false);
    setChosen(null);
    if (!isInteractive && !isLastQuestion) {
      setQuestionIdx(q => q + 1);
    } else if (scenIdx + 1 < scenarios.length) {
      setScenIdx(i => i + 1);
      setQuestionIdx(0);
    } else {
      setPhase('done');
    }
  }, [isInteractive, isLastQuestion, scenIdx]);

  const handleChoose = useCallback((opt) => {
    if (chosen) return;
    sound.tap();
    setChosen(opt.key);
    if (opt.correct) {
      sound.success();
      setScore(s => s + 1);
      setShowConfetti(true);
      const speech = isLastQuestion
        ? scen.lesson_en
        : (lang === 'hi' ? 'अच्छा सोचा!' : 'Good thinking!');
      const speechHi = isLastQuestion
        ? scen.lesson_hi
        : (lang === 'hi' ? 'अच्छा सोचा!' : 'Good thinking!');
      speak(speech, speechHi);
      advanceTimerRef.current = setTimeout(goNext, isLastQuestion ? 3500 : 1800);
    } else {
      sound.gentle();
      const correctOpt = currentQuestion.options.find(o => o.correct);
      speak(
        `Hmm, the better answer is: ${correctOpt.label_en}.`,
        `बेहतर उत्तर: ${correctOpt.label_hi}।`,
      );
      advanceTimerRef.current = setTimeout(goNext, 2500);
    }
  }, [chosen, currentQuestion, scen, isLastQuestion, sound, speak, goNext, lang]);

  const handleInteractiveDone = () => {
    setShowConfetti(true);
    speak(scen.lesson_en, scen.lesson_hi);
    advanceTimerRef.current = setTimeout(goNext, 3500);
  };

  const bg = 'bg-gradient-to-b from-[#FFE0E0] via-[#FFF8E0] to-[#E0F4FF]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\ud83c\udfc5'}</div>
          <Character kind="bhaloo" emotion="happy" size={140} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('scene'); }} className="mt-2 px-10 py-4 rounded-full bg-[#22C55E] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
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
          <div className="text-7xl animate-bounce-in">{'\ud83c\udfc6'}</div>
          <Character kind="bhaloo" emotion="happy" size={120} animate />
          <h2 className="text-xl font-bold text-gray-800 text-center">{TEXT.pledgeTitle[lang]}</h2>
          <ul className="text-sm text-gray-700 font-semibold space-y-1 bg-white rounded-2xl px-4 py-3 shadow-md max-w-[330px]">
            {TEXT.pledge.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500">{'\u2605'}</span>
                <span>{p[lang]}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { stop(); setScenIdx(0); setQuestionIdx(0); setScore(0); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Model sportsmanship during family games. When YOU lose, say 'Oh, I lost! Good game!' Children learn more from watching you lose gracefully than from any lecture. Let them win AND lose."
            tipHi="परिवार के खेल में खेल भावना दिखाएँ। जब आप हारें, कहें 'अरे, मैं हार गया! अच्छा खेल!' बच्चे डाँट से नहीं, आपको देखकर सीखते हैं।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={scenIdx} totalRounds={scenarios.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />

      <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-y-auto">
        <div className="text-center text-sm font-bold text-gray-500">
          {lang === 'hi' ? scen.title_hi : scen.title_en}
        </div>

        <div className="flex justify-center gap-2">
          {(scen.characters || []).map(c => (
            <div key={c} className="animate-bounce-in">
              <CharRenderer kind={c} size={80} />
            </div>
          ))}
        </div>

        <div className="bg-white/85 rounded-2xl px-4 py-3 shadow-sm text-center text-gray-700 text-sm font-semibold animate-bounce-in" key={`s-${scenIdx}`}>
          {lang === 'hi' ? scen.scene_hi : scen.scene_en}
        </div>

        {isInteractive && <PushLogInteraction lang={lang} sound={sound} onDone={handleInteractiveDone} />}

        {!isInteractive && currentQuestion && (
          <>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2 text-center text-amber-900 text-sm font-bold">
              {lang === 'hi' ? currentQuestion.prompt_hi : currentQuestion.prompt_en}
            </div>
            <div className="flex flex-col gap-2 pb-2">
              {currentQuestion.options.map(opt => {
                const isThis = chosen === opt.key;
                let cls = 'bg-white border-gray-200 text-gray-700';
                if (chosen) {
                  if (opt.correct) cls = 'bg-green-100 border-green-400 text-green-800 scale-105';
                  else if (isThis) cls = 'bg-orange-50 border-orange-300 text-orange-700';
                }
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleChoose(opt)}
                    disabled={!!chosen}
                    className={`rounded-2xl border-2 px-4 py-3 text-left font-bold text-base shadow-sm transition-all active:scale-95 ${cls}`}
                  >
                    {lang === 'hi' ? opt.label_hi : opt.label_en}
                  </button>
                );
              })}
            </div>
            {chosen && currentQuestion.options.find(o => o.key === chosen)?.correct && isLastQuestion && (
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl px-4 py-3 text-center text-green-900 text-sm font-semibold animate-bounce-in">
                {lang === 'hi' ? scen.lesson_hi : scen.lesson_en}
              </div>
            )}
          </>
        )}
      </div>
    </GameShell>
  );
}
