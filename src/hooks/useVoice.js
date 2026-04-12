import { useCallback, useRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Voice scoring: pick the most natural, Indian, child-friendly voice.
// ---------------------------------------------------------------------------
function scoreVoice(voice, targetLang) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  // ── Language match ──
  if (targetLang === 'hi') {
    if (lang === 'hi-in') score += 50;
    else if (lang.startsWith('hi')) score += 40;
  } else {
    if (lang === 'en-in') score += 50;
    else if (lang === 'en-gb') score += 15;
    else if (lang.startsWith('en')) score += 10;
  }

  // ── Quality tiers (higher = more natural) ──
  // Apple "Siri" voices are the most natural on macOS/iOS
  if (/siri/i.test(name)) score += 40;
  // Apple "premium" / "enhanced" downloaded voices
  if (/premium|enhanced/i.test(name)) score += 35;
  // Neural / natural voices (Edge, newer Chrome)
  if (/neural|natural/i.test(name)) score += 35;
  // Microsoft Online voices (Edge) — very natural
  if (/microsoft.*online/i.test(name)) score += 30;

  // ── Known good Indian voices ──
  if (/neerja/i.test(name)) score += 32;     // en-IN female (Apple, very natural)
  if (/veena/i.test(name)) score += 28;      // en-IN female (Apple)
  if (/lekha/i.test(name)) score += 30;      // hi-IN female (Apple)
  if (/rishi/i.test(name)) score += 26;      // en-IN male (Apple)
  if (/google.*hindi/i.test(name)) score += 22;
  if (/google.*india/i.test(name)) score += 22;
  if (/aditi|priya|kavya/i.test(name)) score += 25;

  // ── Prefer female voices — warmer for kids ──
  if (/female|woman/i.test(name)) score += 10;

  // Local service voices often have lower latency
  if (voice.localService) score += 3;

  return score;
}

function pickBestVoice(voices, targetLang) {
  if (!voices.length) return null;
  let best = null;
  let bestScore = -1;
  for (const v of voices) {
    const s = scoreVoice(v, targetLang);
    if (s > bestScore) { bestScore = s; best = v; }
  }
  return bestScore > 0 ? best : null;
}

export function useVoice(language = 'en') {
  const utteranceRef = useRef(null);
  const timerRef = useRef(null);
  const resumeIntervalRef = useRef(null);
  const cachedVoiceRef = useRef(null);
  const cachedLangRef = useRef(null);
  const resolveRef = useRef(null);  // tracks the current speak promise

  // Chrome kills speechSynthesis after ~15s. Periodic pause/resume keeps it alive.
  const startKeepAlive = useCallback(() => {
    clearInterval(resumeIntervalRef.current);
    resumeIntervalRef.current = setInterval(() => {
      if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, []);

  const stopKeepAlive = useCallback(() => {
    clearInterval(resumeIntervalRef.current);
  }, []);

  const getBestVoice = useCallback(() => {
    if (cachedVoiceRef.current && cachedLangRef.current === language) {
      return cachedVoiceRef.current;
    }
    const voices = window.speechSynthesis?.getVoices() || [];
    const voice = pickBestVoice(voices, language);
    if (voice) {
      cachedVoiceRef.current = voice;
      cachedLangRef.current = language;
    }
    return voice;
  }, [language]);

  const speakOne = useCallback((text) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth || !text) { resolve(); return; }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      // Natural, child-friendly speech parameters
      utterance.rate = 0.88;
      utterance.pitch = 1.15;
      utterance.volume = 1.0;

      const voice = getBestVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = () => { stopKeepAlive(); resolve(); };
      utterance.onerror = () => { stopKeepAlive(); resolve(); };

      utteranceRef.current = utterance;
      synth.speak(utterance);
      startKeepAlive();
    });
  }, [language, getBestVoice, startKeepAlive, stopKeepAlive]);

  // speak() now returns a Promise that resolves when speech finishes.
  // Games can use: speak(en, hi).then(() => advanceRound())
  const speak = useCallback((textEn, textHi) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      console.log('Speech:', language === 'hi' ? textHi : textEn);
      return Promise.resolve();
    }

    // Cancel any ongoing speech and its promise
    synth.cancel();
    clearTimeout(timerRef.current);
    stopKeepAlive();
    if (resolveRef.current) { resolveRef.current(); resolveRef.current = null; }

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      timerRef.current = setTimeout(() => {
        const text = language === 'hi' ? (textHi || textEn) : textEn;
        speakOne(text).then(() => {
          resolveRef.current = null;
          resolve();
        });
      }, 80);
    });
  }, [language, speakOne, stopKeepAlive]);

  // speakSequence returns a Promise that resolves when ALL items finish
  const speakSequence = useCallback((items) => {
    const synth = window.speechSynthesis;
    if (!synth) return Promise.resolve();

    synth.cancel();
    clearTimeout(timerRef.current);
    stopKeepAlive();
    if (resolveRef.current) { resolveRef.current(); resolveRef.current = null; }

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      timerRef.current = setTimeout(async () => {
        for (const item of items) {
          const text = language === 'hi' ? (item.hi || item.en) : item.en;
          if (text) await speakOne(text);
        }
        resolveRef.current = null;
        resolve();
      }, 80);
    });
  }, [language, speakOne, stopKeepAlive]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    stopKeepAlive();
    window.speechSynthesis?.cancel();
    if (resolveRef.current) { resolveRef.current(); resolveRef.current = null; }
  }, [stopKeepAlive]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      cachedVoiceRef.current = null;
      cachedLangRef.current = null;
      if (voices.length) {
        const picked = pickBestVoice(voices, language);
        if (picked) console.log(`[useVoice] Best voice for ${language}:`, picked.name, picked.lang);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices);
      clearTimeout(timerRef.current);
      clearInterval(resumeIntervalRef.current);
    };
  }, [language]);

  return { speak, speakSequence, stop };
}
