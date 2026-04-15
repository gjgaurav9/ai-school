export default function OptionButton({ children, onClick, icon, number, selected, correct, variant = 'default', disabled = false }) {
  const baseClasses = 'w-full min-h-[72px] rounded-2xl font-bold text-lg flex items-center gap-3 px-5 py-4 transition-all duration-200 active:scale-95 border-2';

  let stateClasses;
  let badgeClasses;
  if (selected && correct) {
    stateClasses = 'bg-green-100 border-green-400 text-green-700 scale-105';
    badgeClasses = 'bg-green-200 border-green-400 text-green-800';
  } else if (selected && correct === false) {
    stateClasses = 'bg-orange-50 border-orange-300 text-orange-600';
    badgeClasses = 'bg-orange-100 border-orange-300 text-orange-700';
  } else if (variant === 'kind') {
    stateClasses = 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100';
    badgeClasses = 'bg-green-200 border-green-300 text-green-800';
  } else if (variant === 'neutral') {
    stateClasses = 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100';
    badgeClasses = 'bg-gray-200 border-gray-300 text-gray-700';
  } else {
    stateClasses = 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm';
    badgeClasses = 'bg-gray-100 border-gray-300 text-gray-700';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {number != null ? (
        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${badgeClasses}`}>
          {number}
        </span>
      ) : icon ? (
        <span className="text-2xl flex-shrink-0">{icon}</span>
      ) : null}
      <span className="flex-1 text-left leading-snug">{children}</span>
    </button>
  );
}
