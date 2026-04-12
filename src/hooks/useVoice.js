import { useCallback, useRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Voice scoring: pick the best Indian, warm, child-friendly voice available.
// ---------------------------------------------------------------------------
function scoreVoice(voice, targetLang) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  // Exact Indian locale match (en-IN / hi-IN) is best
  if (targetLang === 'hi') {
    if (lang === 'hi-in') score += 50;
    else if (lang.startsWith('hi')) score += 40;
  } else {
    if (lang === 'en-in') score += 50;
    else if (lang === 'en-gb') score += 20;       // British closer to Indian intonation
    else if (lang.startsWith('en')) score += 10;
  }

  // Prefer female voices — warmer & more nurturing for young kids
  if (/female|woman/i.test(name)) score += 15;
  // Known good Indian voices by name (macOS / iOS / Chrome)
  if (/lekha/i.test(name)) score += 30;           // hi-IN female (Apple)
  if (/rishi/i.test(name)) score += 25;            // en-IN male (Apple)
  if (/veena/i.test(name)) score += 25;            // en-IN female (Apple)
  if (/google.*hindi/i.test(name)) score += 28;    // Chrome hi
  if (/google.*india/i.test(name)) score += 28;    // Chrome en-IN
  if (/aditi/i.test(name)) score += 25;            // Amazon Polly en-IN
  if (/priya/i.test(name)) score += 25;            // common en-IN
  if (/neerja/i.test(name)) score += 25;           // en-IN (Apple newer)

  // Prefer high-quality / premium / enhanced voices
  if (/premium|enhanced|natural|neural/i.test(name)) score += 12;
  // Local voices tend to sound better than network voices
  if (voice.localService) score += 5;

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

  // Get (and cache) the best voice for the current language
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

      // Warm, friendly, slightly slower for kids
      utterance.rate = 0.82;
      utterance.pitch = 1.18;
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

  const speak = useCallback((textEn, textHi) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      console.log('Speech:', language === 'hi' ? textHi : textEn);
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();
    clearTimeout(timerRef.current);
    stopKeepAlive();

    // Delay after cancel — Chrome/Safari silently drop speak() called right after cancel()
    timerRef.current = setTimeout(() => {
      const text = language === 'hi' ? (textHi || textEn) : textEn;
      speakOne(text);
    }, 80);
  }, [language, speakOne, stopKeepAlive]);

  // Speak multiple texts in sequence without cancelling between them
  const speakSequence = useCallback((items) => {
    // items: array of { en, hi } objects
    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel();
    clearTimeout(timerRef.current);
    stopKeepAlive();

    timerRef.current = setTimeout(async () => {
      for (const item of items) {
        const text = language === 'hi' ? (item.hi || item.en) : item.en;
        if (text) await speakOne(text);
      }
    }, 80);
  }, [language, speakOne, stopKeepAlive]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    stopKeepAlive();
    window.speechSynthesis?.cancel();
  }, [stopKeepAlive]);

  // Ensure voices are loaded (some browsers fire this asynchronously)
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      // Invalidate cache so next speak picks up newly loaded voices
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
