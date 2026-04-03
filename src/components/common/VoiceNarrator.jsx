import { useEffect } from 'react';
import { useVoice } from '../../hooks/useVoice';

// TODO: Replace with professional voice-over
export default function VoiceNarrator({ textEn, textHi, language = 'en', trigger }) {
  const { speak, stop } = useVoice(language);

  useEffect(() => {
    if (textEn) {
      speak(textEn, textHi);
    }
    return () => stop();
  }, [textEn, textHi, trigger, speak, stop]);

  return null;
}
