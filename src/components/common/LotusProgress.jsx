// Lotus that opens across 5 levels: 0 bud → 1 first-petal → 2 half → 3 full → 4 golden
export default function LotusProgress({ level = 0, size = 56, label = true, language = 'en' }) {
  const clampedLevel = Math.max(0, Math.min(4, level));
  const isGolden = clampedLevel === 4;

  const baseFill = isGolden ? '#F5C518' : '#E91E8C';
  const petalFill = isGolden ? '#FFD700' : '#FF9CC8';
  const centerFill = isGolden ? '#FF8F00' : '#D4A017';
  const stroke = isGolden ? '#B8860B' : '#9D174D';

  const labels = {
    0: { en: 'Bud', hi: 'कली' },
    1: { en: 'Opening', hi: 'खुलती कली' },
    2: { en: 'Half Bloom', hi: 'अधखिला' },
    3: { en: 'Full Bloom', hi: 'पूर्ण खिला' },
    4: { en: 'Golden Lotus', hi: 'स्वर्ण कमल' },
  };

  const petalCount = clampedLevel === 0 ? 0 : clampedLevel === 1 ? 2 : clampedLevel === 2 ? 4 : 8;
  const showCenter = clampedLevel >= 1;
  const bloomOffset = clampedLevel === 1 ? 6 : clampedLevel === 2 ? 14 : 22;

  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * 360;
    petals.push(
      <ellipse
        key={i}
        cx="50"
        cy={50 - bloomOffset}
        rx="9"
        ry={clampedLevel >= 3 ? 22 : 18}
        fill={petalFill}
        stroke={stroke}
        strokeWidth="1.2"
        opacity={isGolden ? 0.95 : 0.88}
        transform={`rotate(${angle} 50 50)`}
      />,
    );
  }

  return (
    <div className="inline-flex flex-col items-center" aria-label={`Lotus level ${clampedLevel}`}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Stem-base / leaf pad */}
        <ellipse cx="50" cy="78" rx="32" ry="6" fill={isGolden ? '#FFE082' : '#B7E4C7'} opacity="0.6" />

        {/* Petals (only render if level > 0) */}
        {petals}

        {/* Bud / center */}
        {clampedLevel === 0 ? (
          <g>
            <ellipse cx="50" cy="52" rx="10" ry="20" fill="#52B788" stroke="#2D6A4F" strokeWidth="1.5" />
            <path d="M 50 32 Q 46 40 50 50 Q 54 40 50 32" fill="#9D174D" opacity="0.4" />
          </g>
        ) : (
          showCenter && (
            <circle cx="50" cy={50 - bloomOffset} r={clampedLevel >= 3 ? 8 : 6} fill={centerFill} stroke={stroke} strokeWidth="1.2" />
          )
        )}

        {/* Sparkle for golden */}
        {isGolden && (
          <>
            <circle cx="22" cy="22" r="2.5" fill="#FFF4B0">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="78" cy="20" r="2" fill="#FFF4B0">
              <animate attributeName="opacity" values="1;0.4;1" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="80" cy="64" r="2.5" fill="#FFF4B0">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
      {label && (
        <span
          className="text-[10px] font-bold mt-0.5"
          style={{ color: isGolden ? '#B8860B' : '#9D174D' }}
        >
          {labels[clampedLevel][language === 'hi' ? 'hi' : 'en']}
        </span>
      )}
    </div>
  );
}

export { LotusProgress };
