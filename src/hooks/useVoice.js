import { useCallback, useRef, useEffect } from 'react';

// TODO: Replace with professional voice-over recordings
export function useVoice(language = 'en') {
  const utteranceRef = useRef(null);
  const timerRef = useRef(null);
  const resumeIntervalRef = useRef(null);

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
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;

      // Try to pick a voice matching the language
      const voices = synth.getVoices();
      const langTag = language === 'hi' ? 'hi' : 'en';
      const match = voices.find(v => v.lang.startsWith(langTag) && v.localService);
      if (match) utterance.voice = match;

      utterance.onend = stopKeepAlive;
      utterance.onerror = stopKeepAlive;

      utteranceRef.current = utterance;
      synth.speak(utterance);
      startKeepAlive();
    }, 80);
  }, [language, startKeepAlive, stopKeepAlive]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    stopKeepAlive();
    window.speechSynthesis?.cancel();
  }, [stopKeepAlive]);

  // Ensure voices are loaded (some browsers fire this asynchronously)
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis?.getVoices();
    loadVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices);
      clearTimeout(timerRef.current);
      clearInterval(resumeIntervalRef.current);
    };
  }, []);

  return { speak, stop };
}
