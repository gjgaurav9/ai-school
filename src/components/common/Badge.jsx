export default function Badge({ icon, label, earned = false, size = 60 }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${earned ? 'opacity-100' : 'opacity-30'}`}>
      <div
        className={`rounded-full flex items-center justify-center border-3 ${
          earned ? 'border-[#FFCB05] bg-[#FFF8E7]' : 'border-gray-300 bg-gray-100'
        }`}
        style={{ width: size, height: size }}
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{label}</span>
    </div>
  );
}
