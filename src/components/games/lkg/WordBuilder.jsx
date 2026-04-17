import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameShell from '../../common/GameShell';
import Celebration from '../../common/Celebration';
import ParentTip from '../../common/ParentTip';
import Character from '../../common/Character';
import Guddu from '../../common/Guddu';
import { useVoice } from '../../../hooks/useVoice';
import { useSound } from '../../../hooks/useSound';
import { useProgress } from '../../../hooks/useProgress';
import data from '../../../data/lkg/cvc-words.json';

const TEXT = {
  title: { en: 'Word Builder', hi: 'शब्द निर्माता' },
  intro: {
    en: (n) => `${n ? n + ', e' : 'E'}very letter has a sound. Put sounds together — they make WORDS! Let's build some.`,
    hi: (n) => `${n ? n + ', ' : ''}हर अक्षर की एक ध्वनि है। ध्वनियाँ मिलाओ तो शब्द बनते हैं! चलो बनाते हैं।`,
  },
  start: { en: "Let's Build!", hi: 'बनाएँ!' },
  done: { en: 'You built every word!', hi: 'तुमने सब शब्द बनाए!' },
  pickStart: { en: 'Which letter starts the word?', hi: 'शब्द किस अक्षर से शुरू होता है?' },
  spellPrompt: { en: 'Spell', hi: 'लिखो' },
  matchPrompt: { en: 'Match each word to its picture', hi: 'हर शब्द को उसकी तस्वीर से मिलाओ' },
  again: { en: 'Play Again', hi: 'फिर खेलें' },
  back: { en: 'Back Home', hi: 'वापस जाएँ' },
  wordWall: { en: 'Word Wall', hi: 'शब्द दीवार' },
};

function getWordMeta(w) {
  return data.words.find(x => x.word === w);
}

function CompleteRound({ round, lang, sound, speak, onDone }) {
  const meta = getWordMeta(round.word);
  const correctLetter = round.word[round.blank_index];
  const [picked, setPicked] = useState(null);
  const display = round.word.split('').map((ch, i) => i === round.blank_index ? (picked || '_') : ch).join(' ');

  const handleClick = (letter) => {
    if (picked) return;
    sound.tap();
    setPicked(letter);
    if (letter === correctLetter) {
      sound.success();
      speak(`Yes! ${round.word}!`, `सही! ${round.word}!`);
      setTimeout(() => onDone(true), 1700);
    } else {
      sound.gentle();
      speak(`Hmm, that doesn't sound right. The word is ${round.word}.`, `सही नहीं। शब्द है ${round.word}।`);
      setTimeout(() => onDone(false), 1900);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-7xl">{meta.icon}</div>
      <div className="text-5xl font-extrabold tracking-widest text-gray-800 bg-white rounded-2xl px-6 py-3 shadow-md border-2 border-amber-200">
        {display.split(' ').map((ch, i) => (
          <span key={i} className={i === round.blank_index ? (picked === correctLetter ? 'text-green-600' : picked ? 'text-orange-500' : 'text-amber-400 animate-pulse') : ''}>
            {ch}
            {i < 2 ? '\u00a0' : ''}
          </span>
        ))}
      </div>
      <p className="text-sm font-semibold text-gray-600">{TEXT.pickStart[lang]}</p>
      <div className="flex gap-3">
        {round.options.map(letter => (
          <button
            key={letter}
            onClick={() => handleClick(letter)}
            disabled={!!picked}
            className={`w-16 h-16 rounded-2xl border-3 font-extrabold text-3xl shadow-md active:scale-95 transition-all ${
              picked === letter
                ? letter === correctLetter ? 'bg-green-100 border-green-500 scale-110' : 'bg-orange-50 border-orange-300'
                : 'bg-white border-gray-300'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

function BuildRound({ round, lang, sound, speak, onDone }) {
  const meta = getWordMeta(round.word);
  const wordLetters = round.word.split('');
  const allTiles = useMemo(() => {
    const tiles = [...wordLetters, ...round.extras];
    // shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles.map((ch, i) => ({ id: i, letter: ch }));
  }, [round]);

  const [slots, setSlots] = useState(Array(wordLetters.length).fill(null));
  const [usedIds, setUsedIds] = useState(new Set());
  const [completed, setCompleted] = useState(false);

  const nextSlot = slots.findIndex(s => s == null);

  const handleTilePick = (tile) => {
    if (usedIds.has(tile.id) || completed) return;
    if (nextSlot === -1) return;
    const expected = wordLetters[nextSlot];
    if (tile.letter === expected) {
      sound.success();
      const newSlots = [...slots];
      newSlots[nextSlot] = tile;
      setSlots(newSlots);
      setUsedIds(new Set([...usedIds, tile.id]));
      // Check completion
      if (nextSlot === wordLetters.length - 1) {
        setCompleted(true);
        speak(`${round.word}! Excellent!`, `${round.word}! बहुत बढ़िया!`);
        setTimeout(() => onDone(true), 2000);
      } else {
        sound.playTone(440 + nextSlot * 80, 0.18, 'sine');
      }
    } else {
      sound.gentle();
      speak(`Hmm, listen again: ${meta.sounds[nextSlot]}...`, `फिर सुनो: ${meta.sounds[nextSlot]}...`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-7xl">{meta.icon}</div>
      <p className="text-sm font-semibold text-gray-600">{TEXT.spellPrompt[lang]} <strong>{round.word}</strong>!</p>
      <div className="flex gap-2">
        {slots.map((s, i) => (
          <div
            key={i}
            className={`w-14 h-16 rounded-2xl border-3 border-dashed flex items-center justify-center text-3xl font-extrabold ${
              s ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white/70 border-gray-300 text-gray-400'
            }`}
          >
            {s ? s.letter : '_'}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2 max-w-[330px] pt-2">
        {allTiles.map(tile => {
          const used = usedIds.has(tile.id);
          return (
            <button
              key={tile.id}
              onClick={() => handleTilePick(tile)}
              disabled={used || completed}
              className={`w-12 h-12 rounded-xl border-2 font-extrabold text-2xl shadow-md transition-all active:scale-90 ${
                used ? 'bg-gray-100 border-gray-200 text-gray-300' : 'bg-white border-amber-300 text-amber-700'
              }`}
            >
              {tile.letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchRound({ round, lang, sound, speak, onDone }) {
  const wordsList = round.words;
  const shuffledPics = useMemo(() => {
    const arr = [...wordsList];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [round]);

  const [pickedWord, setPickedWord] = useState(null);
  const [matches, setMatches] = useState({});  // word -> matched icon word

  const allMatched = wordsList.every(w => matches[w]);

  useEffect(() => {
    if (allMatched) {
      sound.success();
      speak('All matched! Excellent reading!', 'सब मिल गए! बहुत अच्छी पढ़ाई!');
      setTimeout(() => onDone(true), 2000);
    }
  }, [allMatched]);

  const handleWordTap = (w) => {
    if (matches[w]) return;
    sound.tap();
    speak(w, w);
    setPickedWord(w);
  };

  const handlePicTap = (w) => {
    if (!pickedWord) return;
    if (Object.values(matches).includes(w)) return;
    if (pickedWord === w) {
      sound.success();
      setMatches({ ...matches, [pickedWord]: w });
      setPickedWord(null);
    } else {
      sound.gentle();
      speak(`Hmm, that's not ${pickedWord}. Try again.`, `यह ${pickedWord} नहीं है। फिर देखो।`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-gray-600">{TEXT.matchPrompt[lang]}</p>
      <div className="flex gap-3">
        {wordsList.map(w => {
          const matched = !!matches[w];
          const picked = pickedWord === w;
          return (
            <button
              key={w}
              onClick={() => handleWordTap(w)}
              disabled={matched}
              className={`px-3 py-2 rounded-2xl border-2 font-extrabold text-xl shadow-md transition-all active:scale-95 ${
                matched ? 'bg-green-100 border-green-500 text-green-700' :
                picked ? 'bg-amber-100 border-amber-500 scale-110' : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>
      <div className="flex gap-3 pt-3">
        {shuffledPics.map(w => {
          const meta = getWordMeta(w);
          const matched = Object.values(matches).includes(w);
          return (
            <button
              key={w}
              onClick={() => handlePicTap(w)}
              disabled={matched || !pickedWord}
              className={`w-20 h-20 rounded-2xl border-3 flex items-center justify-center text-5xl shadow-md transition-all active:scale-95 ${
                matched ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'
              }`}
            >
              {meta?.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function WordBuilder({ onComplete, onBack, language = 'en', childName = '' }) {
  const lang = language;
  const { progress, addWordToWall } = useProgress();
  const wall = progress.wordWall || [];

  const [phase, setPhase] = useState('intro');     // intro | playing | done
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const advanceTimerRef = useRef(null);

  const { speak, stop } = useVoice(lang);
  const sound = useSound();

  const round = data.rounds[roundIdx];

  useEffect(() => () => { stop(); clearTimeout(advanceTimerRef.current); }, [stop]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => speak(TEXT.intro.en(childName), TEXT.intro.hi(childName)), 350);
    return () => clearTimeout(t);
  }, [phase, speak, childName]);

  useEffect(() => {
    if (phase !== 'done') return;
    sound.celebrate();
    const t = setTimeout(() => speak(TEXT.done.en, TEXT.done.hi), 350);
    return () => clearTimeout(t);
  }, [phase, speak, sound]);

  const handleRoundDone = useCallback((correct) => {
    if (correct) {
      setScore(s => s + 1);
      setShowConfetti(true);
      // Save discovered words to word wall
      if (round.type === 'complete' || round.type === 'build') {
        addWordToWall(round.word);
      } else if (round.type === 'match') {
        round.words.forEach(addWordToWall);
      }
    }
    setTimeout(() => {
      setShowConfetti(false);
      if (roundIdx + 1 < data.rounds.length) setRoundIdx(i => i + 1);
      else setPhase('done');
    }, 600);
  }, [round, roundIdx, addWordToWall]);

  const bg = 'bg-gradient-to-b from-[#FFE0F0] via-[#FFF0E0] to-[#E0F4FF]';

  if (phase === 'intro') {
    return (
      <GameShell onBack={onBack} title={TEXT.title[lang]} bg={bg}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <Character kind="ullu" emotion="happy" size={150} animate />
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md text-center text-gray-700 text-base font-semibold max-w-[320px] animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            {TEXT.intro[lang](childName)}
          </div>
          <button onClick={() => { sound.pop(); stop(); setPhase('playing'); }} className="mt-2 px-10 py-4 rounded-full bg-[#E91E8C] text-white text-xl font-bold shadow-lg animate-pulse-glow active:scale-90">
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
        <div className="flex-1 flex flex-col items-center px-4 py-3 gap-3 overflow-y-auto">
          <Guddu emotion="celebrating" size={140} animate />
          <h2 className="text-xl font-bold text-gray-800 animate-bounce-in">{TEXT.done[lang]}</h2>
          <p className="text-amber-700 text-sm font-bold">
            {lang === 'hi' ? `${data.rounds.length} में से ${score}!` : `${score} of ${data.rounds.length} correct!`}
          </p>
          <p className="text-sm font-bold text-gray-600 mt-2">{TEXT.wordWall[lang]} ({wall.length})</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-[330px]">
            {wall.map(w => {
              const meta = getWordMeta(w);
              return (
                <button
                  key={w}
                  onClick={() => { sound.pop(); speak(w, w); }}
                  className="bg-white rounded-xl border-2 border-amber-300 px-2 py-1 shadow-sm active:scale-95 flex items-center gap-1"
                >
                  <span className="text-xl">{meta?.icon}</span>
                  <span className="text-xs font-extrabold text-gray-700">{w}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { stop(); setRoundIdx(0); setScore(0); setPhase('intro'); }} className="px-6 py-3 rounded-full bg-[#FFCB05] text-gray-800 font-bold shadow-md active:scale-90">{TEXT.again[lang]}</button>
            <button onClick={() => { stop(); onComplete?.(score); }} className="px-6 py-3 rounded-full bg-white text-gray-600 font-bold shadow-md active:scale-90">{TEXT.back[lang]}</button>
          </div>
          <ParentTip
            tipEn="Label things at home with post-its: CUP, BED, DOOR. Your child will start recognizing words everywhere. Reading comes before writing — don't worry about spelling yet."
            tipHi="घर की चीज़ों पर पोस्ट-इट लगाएँ: CUP, BED, DOOR। बच्चा हर जगह शब्द पहचानने लगेगा। पढ़ना पहले, लिखना बाद में।"
            language={lang}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell onBack={onBack} title={TEXT.title[lang]} round={roundIdx} totalRounds={data.rounds.length} bg={bg}>
      <Celebration active={showConfetti} type="confetti" />
      <div className="flex-1 flex items-center justify-center px-3 py-4" key={roundIdx}>
        {round.type === 'complete' && <CompleteRound round={round} lang={lang} sound={sound} speak={speak} onDone={handleRoundDone} />}
        {round.type === 'build'    && <BuildRound    round={round} lang={lang} sound={sound} speak={speak} onDone={handleRoundDone} />}
        {round.type === 'match'    && <MatchRound    round={round} lang={lang} sound={sound} speak={speak} onDone={handleRoundDone} />}
      </div>
    </GameShell>
  );
}
