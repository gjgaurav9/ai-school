import { useState, useEffect } from 'react';
import Guddu from '../common/Guddu';
import { useVoice } from '../../hooks/useVoice';

export default function WelcomeScreen({ onSubmit, language, onToggleLanguage }) {
  const [name, setName] = useState('');
  const [step, setStep] = useState('ask'); // ask | greet
  const { speak } = useVoice(language);

  useEffect(() => {
    speak(
      "Hello! I'm Guddu! What's your name?",
      "नमस्ते! मैं गुड्डू हूँ! तुम्हारा नाम क्या है?",
    );
  }, [speak]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setStep('greet');
    speak(
      `Wow, ${trimmed}! What a beautiful name! Let's play together!`,
      `वाह, ${trimmed}! कितना प्यारा नाम है! चलो साथ में खेलते हैं!`,
    );
    setTimeout(() => onSubmit(trimmed), 2500);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#FFF8E7' }}>
      {/* Language toggle */}
      <button
        onClick={onToggleLanguage}
        className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold bg-white shadow-md border border-gray-200 active:scale-95 transition-transform"
      >
        {language === 'en' ? (
          <span>EN | <span className="text-gray-400">{'\u0939\u093F'}</span></span>
        ) : (
          <span><span className="text-gray-400">EN</span> | {'\u0939\u093F'}</span>
        )}
      </button>

      <div className="animate-bounce-in">
        <Guddu emotion={step === 'greet' ? 'celebrating' : 'happy'} size={180} />
      </div>

      {step === 'ask' ? (
        <>
          {/* Speech bubble */}
          <div className="bg-white rounded-2xl px-5 py-4 shadow-md mt-4 mb-6 relative max-w-[300px]">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
            <p className="text-center text-gray-700 font-semibold text-base leading-snug">
              {language === 'hi'
                ? "नमस्ते! मैं गुड्डू हूँ! तुम्हारा नाम क्या है?"
                : "Hello! I'm Guddu! What's your name?"}
            </p>
          </div>

          {/* Name input — parent-facing */}
          <form onSubmit={handleSubmit} className="w-full max-w-[280px]">
            <p className="text-xs text-gray-400 text-center mb-2">
              {language === 'hi' ? '(माता-पिता: बच्चे का नाम लिखें)' : '(Parents: type your child\'s name)'}
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'hi' ? 'नाम लिखें...' : 'Type name here...'}
              autoFocus
              className="w-full text-center text-xl font-bold text-gray-800 bg-white border-2 border-[#FFCB05] rounded-2xl px-4 py-4 outline-none focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/30 transition-all placeholder:text-gray-300 placeholder:font-normal placeholder:text-base"
              maxLength={20}
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full mt-4 py-4 rounded-2xl text-lg font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              style={{ background: 'linear-gradient(135deg, #FFCB05, #FF8C42)' }}
            >
              {language === 'hi' ? 'चलो खेलते हैं!' : "Let's Play!"}
            </button>
          </form>
        </>
      ) : (
        <div className="bg-white rounded-2xl px-5 py-4 shadow-md mt-4 max-w-[300px] animate-bounce-in">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
          <p className="text-center text-gray-700 font-bold text-lg leading-snug">
            {language === 'hi'
              ? `वाह, ${name.trim()}! चलो साथ में खेलते हैं!`
              : `Wow, ${name.trim()}! Let's play together!`}
          </p>
        </div>
      )}
    </div>
  );
}
