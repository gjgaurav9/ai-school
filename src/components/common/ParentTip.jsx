import { useState } from 'react';

export default function ParentTip({ tipEn, tipHi, language = 'en' }) {
  const [open, setOpen] = useState(false);
  const tip = language === 'hi' ? (tipHi || tipEn) : tipEn;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 text-sm text-gray-500 mx-auto mt-3"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        {language === 'hi' ? 'माता-पिता के लिए' : 'Tip for parents'}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-6 pb-10 max-w-md w-full animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="font-bold text-gray-700 text-base mb-3">
              {language === 'hi' ? 'माता-पिता के लिए सुझाव' : 'Tip for Parents'}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{tip}</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full py-3 rounded-xl bg-[#FFCB05] text-gray-800 font-semibold"
            >
              {language === 'hi' ? 'समझ गए!' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
