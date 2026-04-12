import { useCallback, useRef } from 'react';

// Base path for Vite — resolves to /ai-school/ in production, / in dev
const BASE = import.meta.env.BASE_URL;

// Pre-create Audio elements for animal/nature sounds so they load eagerly
const SOUND_FILES = {
  cow_moo: `${BASE}sounds/cow_moo.mp3`,
  bird_chirp: `${BASE}sounds/bird_chirp.mp3`,
  rain_drops: `${BASE}sounds/rain_drops.mp3`,
  dog_bark: `${BASE}sounds/dog_bark.mp3`,
  thunder: `${BASE}sounds/thunder.mp3`,
};

// Audio credits: freesoundslibrary.com — CC BY 4.0

export function useSound() {
  const ctxRef = useRef(null);
  const audioCache = useRef({});

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Simple tone for UI sounds
  const playTone = useCallback((frequency, duration = 0.15, type = 'sine') => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {
      // AudioContext not available
    }
  }, [getCtx]);

  // ---------------------------------------------------------------------------
  // Animal / nature sounds — real audio files
  // ---------------------------------------------------------------------------

  const playFile = useCallback((key) => {
    try {
      const url = SOUND_FILES[key];
      if (!url) return;

      // Reuse or create Audio element
      let audio = audioCache.current[key];
      if (!audio) {
        audio = new Audio(url);
        audio.preload = 'auto';
        audioCache.current[key] = audio;
      }

      // Reset to start if already playing
      audio.currentTime = 0;
      audio.play().catch(() => { /* user hasn't interacted yet */ });
    } catch (e) { /* */ }
  }, []);

  const playCowMoo = useCallback(() => playFile('cow_moo'), [playFile]);
  const playBirdChirp = useCallback(() => playFile('bird_chirp'), [playFile]);
  const playRainDrops = useCallback(() => playFile('rain_drops'), [playFile]);
  const playDogBark = useCallback(() => playFile('dog_bark'), [playFile]);
  const playThunder = useCallback(() => playFile('thunder'), [playFile]);

  // UI sounds
  const success = useCallback(() => {
    playTone(523, 0.1);
    setTimeout(() => playTone(659, 0.1), 100);
    setTimeout(() => playTone(784, 0.2), 200);
  }, [playTone]);

  const tap = useCallback(() => {
    playTone(440, 0.08);
  }, [playTone]);

  const celebrate = useCallback(() => {
    [523, 587, 659, 698, 784, 880, 988, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'triangle'), i * 80);
    });
  }, [playTone]);

  const gentle = useCallback(() => {
    playTone(330, 0.2, 'sine');
  }, [playTone]);

  const pop = useCallback(() => {
    playTone(600, 0.06, 'sine');
  }, [playTone]);

  return {
    success, tap, celebrate, gentle, pop, playTone,
    playCowMoo, playBirdChirp, playRainDrops, playDogBark, playThunder,
  };
}
