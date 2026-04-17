import { useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Shared character component for Bandar, Mor, Gillu, Meenu, Chidiya
// Stylistic match with Guddu — round head, simple SVG, clear emotions
// ---------------------------------------------------------------------------

const CHAR_COLORS = {
  bandar:  { body: '#A0522D', accent: '#7A3E1D', face: '#D4A574', name: 'Bandar' },
  mor:     { body: '#1B7BC4', accent: '#0E5A94', face: '#3FA9DA', name: 'Mor' },
  gillu:   { body: '#C68642', accent: '#A06A30', face: '#E2B57A', name: 'Gillu' },
  meenu:   { body: '#B0B0B0', accent: '#888888', face: '#D8D8D8', name: 'Meenu' },
  chidiya: { body: '#FFD93D', accent: '#E0A800', face: '#FFE680', name: 'Chidiya' },
};

const EMOTION_TWEAKS = {
  happy:       { mouthCurve: 'smile', cheek: true,  eyes: 'closed-arc' },
  sad:         { mouthCurve: 'frown', cheek: false, eyes: 'droop' },
  scared:      { mouthCurve: 'small-o', cheek: false, eyes: 'wide' },
  shy:         { mouthCurve: 'small-smile', cheek: true, eyes: 'down' },
  angry:       { mouthCurve: 'flat', cheek: false, eyes: 'angry' },
  proud:       { mouthCurve: 'smile', cheek: true,  eyes: 'closed-arc' },
  guilty:      { mouthCurve: 'frown-small', cheek: false, eyes: 'down' },
  curious:     { mouthCurve: 'small-o', cheek: false, eyes: 'wide' },
  worried:     { mouthCurve: 'frown-small', cheek: false, eyes: 'droop' },
  excited:     { mouthCurve: 'smile-big', cheek: true, eyes: 'closed-arc' },
  frustrated:  { mouthCurve: 'flat', cheek: false, eyes: 'angry' },
  neutral:     { mouthCurve: 'small-smile', cheek: false, eyes: 'normal' },
  hurry:       { mouthCurve: 'small-o', cheek: false, eyes: 'wide' },
  sleepy:      { mouthCurve: 'small-smile', cheek: false, eyes: 'droop' },
};

function Eyes({ kind, cx, cy, r, stroke }) {
  const ex1 = cx - r * 0.35;
  const ex2 = cx + r * 0.35;
  const ey = cy - r * 0.05;

  if (kind === 'closed-arc') {
    return (
      <>
        <path d={`M ${ex1 - 6} ${ey} Q ${ex1} ${ey - 6} ${ex1 + 6} ${ey}`} fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" />
        <path d={`M ${ex2 - 6} ${ey} Q ${ex2} ${ey - 6} ${ex2 + 6} ${ey}`} fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" />
      </>
    );
  }
  if (kind === 'wide') {
    return (
      <>
        <circle cx={ex1} cy={ey} r={6} fill="white" stroke={stroke} strokeWidth={1.5} />
        <circle cx={ex1} cy={ey} r={3} fill={stroke} />
        <circle cx={ex2} cy={ey} r={6} fill="white" stroke={stroke} strokeWidth={1.5} />
        <circle cx={ex2} cy={ey} r={3} fill={stroke} />
      </>
    );
  }
  if (kind === 'droop') {
    return (
      <>
        <ellipse cx={ex1} cy={ey + 1} rx={3.5} ry={4} fill={stroke} />
        <ellipse cx={ex2} cy={ey + 1} rx={3.5} ry={4} fill={stroke} />
        <line x1={ex1 - 7} y1={ey - 8} x2={ex1 + 4} y2={ey - 5} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <line x1={ex2 - 4} y1={ey - 5} x2={ex2 + 7} y2={ey - 8} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </>
    );
  }
  if (kind === 'angry') {
    return (
      <>
        <line x1={ex1 - 7} y1={ey - 9} x2={ex1 + 4} y2={ey - 4} stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={ex2 - 4} y1={ey - 4} x2={ex2 + 7} y2={ey - 9} stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={ex1} cy={ey} r={3.5} fill={stroke} />
        <circle cx={ex2} cy={ey} r={3.5} fill={stroke} />
      </>
    );
  }
  if (kind === 'down') {
    return (
      <>
        <ellipse cx={ex1} cy={ey + 2} rx={3.5} ry={3} fill={stroke} />
        <ellipse cx={ex2} cy={ey + 2} rx={3.5} ry={3} fill={stroke} />
      </>
    );
  }
  // normal
  return (
    <>
      <circle cx={ex1} cy={ey} r={3.5} fill={stroke} />
      <circle cx={ex2} cy={ey} r={3.5} fill={stroke} />
    </>
  );
}

function Mouth({ kind, cx, cy, r, stroke }) {
  const my = cy + r * 0.45;
  if (kind === 'smile') {
    return <path d={`M ${cx - r * 0.25} ${my} Q ${cx} ${my + r * 0.2} ${cx + r * 0.25} ${my}`} fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" />;
  }
  if (kind === 'smile-big') {
    return <path d={`M ${cx - r * 0.32} ${my - 2} Q ${cx} ${my + r * 0.32} ${cx + r * 0.32} ${my - 2}`} fill={stroke} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" opacity={0.85} />;
  }
  if (kind === 'small-smile') {
    return <path d={`M ${cx - r * 0.16} ${my} Q ${cx} ${my + r * 0.12} ${cx + r * 0.16} ${my}`} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />;
  }
  if (kind === 'frown') {
    return <path d={`M ${cx - r * 0.22} ${my + r * 0.12} Q ${cx} ${my - r * 0.05} ${cx + r * 0.22} ${my + r * 0.12}`} fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" />;
  }
  if (kind === 'frown-small') {
    return <path d={`M ${cx - r * 0.14} ${my + r * 0.08} Q ${cx} ${my} ${cx + r * 0.14} ${my + r * 0.08}`} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />;
  }
  if (kind === 'small-o') {
    return <ellipse cx={cx} cy={my} rx={4} ry={5} fill={stroke} />;
  }
  if (kind === 'flat') {
    return <line x1={cx - r * 0.2} y1={my} x2={cx + r * 0.2} y2={my} stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />;
  }
  return null;
}

// Distinctive features per character (drawn outside the main face)
function CharacterFeatures({ kind, cx, headY, r }) {
  if (kind === 'bandar') {
    // Monkey ears + tail tuft + face patch
    return (
      <>
        <circle cx={cx - r * 1.05} cy={headY - r * 0.1} r={r * 0.32} fill="#A0522D" stroke="#7A3E1D" strokeWidth={1.5} />
        <circle cx={cx - r * 1.05} cy={headY - r * 0.1} r={r * 0.18} fill="#D4A574" />
        <circle cx={cx + r * 1.05} cy={headY - r * 0.1} r={r * 0.32} fill="#A0522D" stroke="#7A3E1D" strokeWidth={1.5} />
        <circle cx={cx + r * 1.05} cy={headY - r * 0.1} r={r * 0.18} fill="#D4A574" />
        <ellipse cx={cx} cy={headY + r * 0.25} rx={r * 0.55} ry={r * 0.5} fill="#D4A574" />
      </>
    );
  }
  if (kind === 'mor') {
    // Peacock head plume (3 feathers above)
    return (
      <>
        <path d={`M ${cx - 12} ${headY - r * 1.05} L ${cx - 12} ${headY - r * 0.6}`} stroke="#0E5A94" strokeWidth={2} strokeLinecap="round" />
        <circle cx={cx - 12} cy={headY - r * 1.1} r={5} fill="#22A06B" stroke="#147A4F" strokeWidth={1.2} />
        <path d={`M ${cx} ${headY - r * 1.15} L ${cx} ${headY - r * 0.6}`} stroke="#0E5A94" strokeWidth={2} strokeLinecap="round" />
        <circle cx={cx} cy={headY - r * 1.2} r={5} fill="#22A06B" stroke="#147A4F" strokeWidth={1.2} />
        <path d={`M ${cx + 12} ${headY - r * 1.05} L ${cx + 12} ${headY - r * 0.6}`} stroke="#0E5A94" strokeWidth={2} strokeLinecap="round" />
        <circle cx={cx + 12} cy={headY - r * 1.1} r={5} fill="#22A06B" stroke="#147A4F" strokeWidth={1.2} />
        {/* Beak */}
        <path d={`M ${cx} ${headY + r * 0.18} L ${cx - 4} ${headY + r * 0.32} L ${cx + 4} ${headY + r * 0.32} Z`} fill="#FFB347" stroke="#C97E1F" strokeWidth={1} />
      </>
    );
  }
  if (kind === 'gillu') {
    // Squirrel ears + tail outline
    return (
      <>
        <path d={`M ${cx - r * 0.55} ${headY - r * 0.85} L ${cx - r * 0.7} ${headY - r * 1.15} L ${cx - r * 0.3} ${headY - r * 0.95} Z`} fill="#A06A30" />
        <path d={`M ${cx + r * 0.55} ${headY - r * 0.85} L ${cx + r * 0.7} ${headY - r * 1.15} L ${cx + r * 0.3} ${headY - r * 0.95} Z`} fill="#A06A30" />
        {/* Bushy tail to the right */}
        <path d={`M ${cx + r * 1.0} ${headY + r * 1.6}
                  Q ${cx + r * 1.9} ${headY + r * 1.4}
                    ${cx + r * 1.7} ${headY + r * 0.4}
                  Q ${cx + r * 1.4} ${headY - r * 0.1}
                    ${cx + r * 0.9} ${headY + r * 0.5} Z`}
              fill="#C68642" stroke="#A06A30" strokeWidth={1.5} />
      </>
    );
  }
  if (kind === 'meenu') {
    // Mouse: round ears
    return (
      <>
        <circle cx={cx - r * 0.7} cy={headY - r * 0.65} r={r * 0.32} fill="#B0B0B0" stroke="#888" strokeWidth={1.2} />
        <circle cx={cx - r * 0.7} cy={headY - r * 0.65} r={r * 0.18} fill="#FFB6C1" />
        <circle cx={cx + r * 0.7} cy={headY - r * 0.65} r={r * 0.32} fill="#B0B0B0" stroke="#888" strokeWidth={1.2} />
        <circle cx={cx + r * 0.7} cy={headY - r * 0.65} r={r * 0.18} fill="#FFB6C1" />
      </>
    );
  }
  if (kind === 'chidiya') {
    // Bird: small beak + simple wing
    return (
      <>
        <path d={`M ${cx} ${headY + r * 0.12} L ${cx - 5} ${headY + r * 0.28} L ${cx + 5} ${headY + r * 0.28} Z`} fill="#FF8C42" stroke="#C66A20" strokeWidth={1} />
        <path d={`M ${cx + r * 0.35} ${headY + r * 0.65}
                  Q ${cx + r * 0.85} ${headY + r * 0.55}
                    ${cx + r * 0.65} ${headY + r * 1.0} Z`}
              fill="#E0A800" stroke="#A87C00" strokeWidth={1} />
      </>
    );
  }
  return null;
}

export default function Character({
  kind = 'bandar',
  emotion = 'neutral',
  size = 160,
  animate = true,
  showLabel = false,
  className = '',
}) {
  const [bounce, setBounce] = useState(false);
  const c = CHAR_COLORS[kind] || CHAR_COLORS.bandar;
  const tweak = EMOTION_TWEAKS[emotion] || EMOTION_TWEAKS.neutral;

  useEffect(() => {
    if (animate) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 500);
      return () => clearTimeout(t);
    }
  }, [emotion, animate]);

  const s = size;
  const cx = s / 2;
  const headY = s * 0.42;
  const headR = s * 0.27;

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        transform: bounce ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* Body (small ellipse below head) */}
        <ellipse cx={cx} cy={headY + headR * 1.55} rx={headR * 1.0} ry={headR * 0.85} fill={c.body} stroke={c.accent} strokeWidth={1.8} />

        {/* Distinctive features behind head */}
        <CharacterFeatures kind={kind} cx={cx} headY={headY} r={headR} />

        {/* Head */}
        <circle cx={cx} cy={headY} r={headR} fill={c.body} stroke={c.accent} strokeWidth={2} />

        {/* Face patch (lighter inner area) */}
        <ellipse cx={cx} cy={headY + headR * 0.1} rx={headR * 0.8} ry={headR * 0.85} fill={c.face} opacity={0.55} />

        {/* Eyes */}
        <Eyes kind={tweak.eyes} cx={cx} cy={headY} r={headR} stroke="#222" />

        {/* Mouth */}
        <Mouth kind={tweak.mouthCurve} cx={cx} cy={headY} r={headR} stroke="#222" />

        {/* Cheek blush */}
        {tweak.cheek && (
          <>
            <circle cx={cx - headR * 0.5} cy={headY + headR * 0.25} r={headR * 0.12} fill="#FFB6C1" opacity={0.5} />
            <circle cx={cx + headR * 0.5} cy={headY + headR * 0.25} r={headR * 0.12} fill="#FFB6C1" opacity={0.5} />
          </>
        )}
      </svg>
      {showLabel && (
        <div className="text-center text-xs font-bold text-gray-700 mt-1">{c.name}</div>
      )}
    </div>
  );
}
