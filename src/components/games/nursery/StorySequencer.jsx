import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Guddu from '../../common/Guddu';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import stories from '../../../data/nursery/stories.json';

const TEXT = {
  title: { en: 'Story Sequencer', hi: 'कहानी क्रम' },
  intro: {
    en: (n) => `${n ? n + ', the' : 'The'} story pages got mixed up! Can you put them in the right order?`,
    hi: (n) => `${n ? n + ', ' : ''}कहानी के पन्ने उलट-पुलट गए हैं! क्या तुम सही क्रम में रख सकते हो?`,
  },
  start: { en: 'Fix Stories!', hi: 'कहानियाँ ठीक करो!' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  done: { en: "You're a Story Master!", hi: 'तुम कहानी मास्टर हो!' },
  hint1: { en: "Hmm, does that come first? Try again!", hi: 'क्या वह पहले आता है? फिर देखो!' },
  hint2: { en: "What happens at the very beginning?", hi: 'सबसे शुरुआत में क्या होता है?' },
  pickCard: { en: 'Tap a card', hi: 'एक कार्ड पर टैप करें' },
  thenSlot: { en: 'then a slot', hi: 'फिर खाली जगह' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StorySequencer({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const [phase, setPhase] = useState('intro');     // intro | playing | story-complete | done
  const [storyIdx, setStoryIdx] = useState(0);
  const [shuffled, setShuffled] = useState([]);    // cards available to drag from
  const [slots, setSlots] = useState([]);          // arrays of card or null
  const [selectedCard, setSelectedCard] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [completedStories, setCompletedStories] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);
  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const story = stories[storyIdx];

  // Initialize shuffled cards & empty slots when story changes
  useEffect(() => {
    if (!story) return;
    setShuffled(shuffle(story.cards));
    setSlots(Array(story.cards.length).fill(null));
    setSelectedCard(null);
    setWrongCount(0);
  }, [story]);

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setTimeout(() => speak(story.intro_en, story.intro_hi), 350);
    return () => clearTimeout(t);
  }, [phase, storyIdx, story, speak]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.done.en, TEXT.done.hi), 350);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const handlePickCard = (card) => {
    if (phase !== 'playing') return;
    sound.tap();
    setSelectedCard(card);
  };

  const handlePlaceInSlot = (slotIdx) => {
    if (!selectedCard) return;
    // Each slot's expected card.id == slotIdx + 1
    const expectedId = slotIdx + 1;
    if (selectedCard.id === expectedId && slots[slotIdx] == null) {
      sound.success();
      const newSlots = [...slots];
      newSlots[slotIdx] = selectedCard;
      setSlots(newSlots);
      setShuffled(prev => prev.filter(c => c.id !== selectedCard.id));
      setSelectedCard(null);

      // Check if story is complete
      if (newSlots.every(s => s != null)) {
        setShowConfetti(true);
        speak(story.lesson_en, story.lesson_hi);
        setCompletedStories(c => c + 1);
        setPhase('story-complete');
        advanceTimerRef.current = setTimeout(() => {
          setShowConfetti(false);
          if (storyIdx + 1 < stories.length) {
            setStoryIdx(i => i + 1);
            setPhase('playing');
          } else {
            setPhase('done');
          }
        }, 3500);
      }
    } else if (slots[slotIdx] != null) {
      sound.gentle();
    } else {
      // wrong slot
      sound.gentle();
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setSelectedCard(null);
      if (newWrong >= 3) {
        speak(TEXT.hint2.en, TEXT.hint2.hi);
      } else {
        speak(TEXT.hint1.en, TEXT.hint1.hi);
      }
    }
  };

  const bg = 'bg-gradient-to-b from-[#E0F4FF] via-[#FFF8E0] to-[#FFE0F0]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="text-7xl animate-bounce-in">{'\u{1F4D6}'}</div>
          <Guddu emotion="happy" size={170} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('playing'); }} className="mt-2 px-10 py-4 rounded-full bg-[#FF8C42] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
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
          <div className="text-7xl animate-bounce-in">{'\u{1F3C5}'}</div>
          <Guddu emotion="celebrating" size={150} animate />
          <h2 className="text-2xl font-bold text-gray-800 animate-bounce-in">{TEXT.done[lang]}</h2>
          <p className="text-amber-700 text-base font-bold">
            {lang === 'hi' ? `तुमने ${completedStories} कहानियाँ ठीक कीं!` : `You fixed ${completedStories} stories!`}
          </p>
          <div className="flex gap-3">
            <button onClick={() => { stop(); setStoryIdx(0); setCompletedStories(0); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(completedStories); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="At bedtime, pause a story and ask: 'What happens next?' Or invite them: 'Can you tell ME a story?' Even 3-sentence stories practice narrative structure."
            tipHi="सोते समय कहानी रोकें और पूछें: 'अब क्या होगा?' या कहें: 'मुझे कहानी सुनाओ?' 3 वाक्यों की कहानी भी संरचना सिखाती है।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={storyIdx} totalRounds={stories.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />

      <div className="flex-1 flex flex-col px-3 py-3 gap-3 overflow-y-auto">
        <div className="text-center text-sm font-bold text-gray-500">
          {lang === 'hi' ? story.title_hi : story.title_en}
        </div>

        {/* Slots row */}
        <div className="flex justify-center gap-2 pt-1 flex-wrap">
          {slots.map((slot, i) => (
            <button
              key={i}
              onClick={() => handlePlaceInSlot(i)}
              disabled={!selectedCard || slot != null}
              className={`relative rounded-2xl border-4 border-dashed flex flex-col items-center justify-center transition-all
                ${slot ? 'bg-green-50 border-green-400' : 'bg-white/70 border-gray-300'}
                ${selectedCard && !slot ? 'border-amber-400 animate-pulse' : ''}`}
              style={{ width: 76, height: 96 }}
            >
              <span className="absolute -top-2 -left-2 bg-amber-400 text-white text-xs font-extrabold rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
              {slot ? (
                <>
                  <span className="text-3xl">{slot.icon}</span>
                  <span className="text-[10px] font-bold text-gray-600 text-center px-1 leading-tight">
                    {lang === 'hi' ? slot.label_hi : slot.label_en}
                  </span>
                </>
              ) : (
                <span className="text-2xl text-gray-400">?</span>
              )}
            </button>
          ))}
        </div>

        {/* Hint instruction */}
        <div className="text-center text-xs text-gray-500">
          {selectedCard ? (
            <span className="text-amber-700 font-bold">{TEXT.thenSlot[lang]}!</span>
          ) : shuffled.length > 0 ? (
            <span>{TEXT.pickCard[lang]}</span>
          ) : null}
        </div>

        {/* Available cards */}
        <div className="flex justify-center gap-2 flex-wrap pt-2">
          {shuffled.map(card => (
            <button
              key={card.id}
              onClick={() => handlePickCard(card)}
              className={`rounded-2xl border-4 flex flex-col items-center justify-center shadow-md transition-all active:scale-95
                ${selectedCard?.id === card.id ? 'bg-amber-100 border-amber-500 scale-110' : 'bg-white border-gray-300'}`}
              style={{ width: 90, height: 100 }}
            >
              <span className="text-4xl">{card.icon}</span>
              <span className="text-[10px] font-bold text-gray-700 text-center px-1 leading-tight mt-1">
                {lang === 'hi' ? card.label_hi : card.label_en}
              </span>
            </button>
          ))}
        </div>

        {phase === 'story-complete' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl px-4 py-3 mt-2 text-center text-green-900 text-sm font-semibold animate-bounce-in">
            {lang === 'hi' ? story.lesson_hi : story.lesson_en}
          </div>
        )}
      </div>
    </GameShell>
  );
}
