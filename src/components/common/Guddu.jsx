import { useState, useEffect } from 'react';

const EMOTIONS = {
  neutral: { eyes: '•  •', mouth: '◡', color: '#A0A0A0', trunkCurve: 0 },
  happy: { eyes: '◠  ◠', mouth: '◡', color: '#FFD93D', trunkCurve: 15 },
  sad: { eyes: '•  •', mouth: '︵', color: '#74B9FF', trunkCurve: -10 },
  angry: { eyes: '╥  ╥', mouth: '﹏', color: '#FF6B6B', trunkCurve: -5 },
  scared: { eyes: '◉  ◉', mouth: 'o', color: '#A29BFE', trunkCurve: -15 },
  surprised: { eyes: '◉  ◉', mouth: 'O', color: '#FFEAA7', trunkCurve: 10 },
  celebrating: { eyes: '★  ★', mouth: '◡', color: '#FFD93D', trunkCurve: 20 },
};

export default function Guddu({ emotion = 'neutral', size = 200, animate = true, className = '' }) {
  const [bounce, setBounce] = useState(false);
  const e = EMOTIONS[emotion] || EMOTIONS.neutral;

  useEffect(() => {
    if (animate) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 500);
      return () => clearTimeout(t);
    }
  }, [emotion, animate]);

  const s = size;
  const bodyRadius = s * 0.28;
  const headRadius = s * 0.22;
  const earSize = s * 0.12;
  const cx = s / 2;
  const bodyY = s * 0.58;
  const headY = s * 0.32;

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        transform: bounce ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* Body */}
        <ellipse cx={cx} cy={bodyY} rx={bodyRadius} ry={bodyRadius * 1.1}
          fill="#9E9E9E" stroke="#757575" strokeWidth={2} />

        {/* Legs */}
        <rect x={cx - bodyRadius * 0.6} y={bodyY + bodyRadius * 0.7} width={s * 0.08} height={s * 0.15}
          rx={4} fill="#8E8E8E" />
        <rect x={cx + bodyRadius * 0.3} y={bodyY + bodyRadius * 0.7} width={s * 0.08} height={s * 0.15}
          rx={4} fill="#8E8E8E" />

        {/* Arms - animated based on emotion */}
        {emotion === 'happy' || emotion === 'celebrating' ? (
          <>
            <rect x={cx - bodyRadius - s * 0.06} y={bodyY - bodyRadius * 0.6} width={s * 0.06} height={s * 0.15}
              rx={3} fill="#8E8E8E" transform={`rotate(-30 ${cx - bodyRadius} ${bodyY})`} />
            <rect x={cx + bodyRadius} y={bodyY - bodyRadius * 0.6} width={s * 0.06} height={s * 0.15}
              rx={3} fill="#8E8E8E" transform={`rotate(30 ${cx + bodyRadius} ${bodyY})`} />
          </>
        ) : (
          <>
            <rect x={cx - bodyRadius - s * 0.05} y={bodyY - s * 0.02} width={s * 0.06} height={s * 0.12}
              rx={3} fill="#8E8E8E" />
            <rect x={cx + bodyRadius - s * 0.01} y={bodyY - s * 0.02} width={s * 0.06} height={s * 0.12}
              rx={3} fill="#8E8E8E" />
          </>
        )}

        {/* Head */}
        <circle cx={cx} cy={headY} r={headRadius} fill="#BDBDBD" stroke="#9E9E9E" strokeWidth={2} />

        {/* Ears */}
        <ellipse cx={cx - headRadius * 0.9} cy={headY - headRadius * 0.5}
          rx={earSize} ry={earSize * 1.3} fill="#BDBDBD" stroke="#9E9E9E" strokeWidth={1.5}
          transform={`rotate(-15 ${cx - headRadius * 0.9} ${headY - headRadius * 0.5})`} />
        <ellipse cx={cx - headRadius * 0.9} cy={headY - headRadius * 0.5}
          rx={earSize * 0.6} ry={earSize * 0.9} fill="#E8A0BF"
          transform={`rotate(-15 ${cx - headRadius * 0.9} ${headY - headRadius * 0.5})`} />

        <ellipse cx={cx + headRadius * 0.9} cy={headY - headRadius * 0.5}
          rx={earSize} ry={earSize * 1.3} fill="#BDBDBD" stroke="#9E9E9E" strokeWidth={1.5}
          transform={`rotate(15 ${cx + headRadius * 0.9} ${headY - headRadius * 0.5})`} />
        <ellipse cx={cx + headRadius * 0.9} cy={headY - headRadius * 0.5}
          rx={earSize * 0.6} ry={earSize * 0.9} fill="#E8A0BF"
          transform={`rotate(15 ${cx + headRadius * 0.9} ${headY - headRadius * 0.5})`} />

        {/* Trunk */}
        <path
          d={`M ${cx} ${headY + headRadius * 0.4}
              Q ${cx + e.trunkCurve} ${headY + headRadius * 1.2}
                ${cx + e.trunkCurve * 0.5} ${headY + headRadius * 1.6}`}
          fill="none" stroke="#9E9E9E" strokeWidth={s * 0.04} strokeLinecap="round"
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Eyes */}
        {emotion === 'scared' || emotion === 'surprised' ? (
          <>
            <circle cx={cx - headRadius * 0.3} cy={headY - headRadius * 0.1} r={s * 0.03} fill="white" stroke="#333" strokeWidth={1.5} />
            <circle cx={cx - headRadius * 0.3} cy={headY - headRadius * 0.1} r={s * 0.015} fill="#333" />
            <circle cx={cx + headRadius * 0.3} cy={headY - headRadius * 0.1} r={s * 0.03} fill="white" stroke="#333" strokeWidth={1.5} />
            <circle cx={cx + headRadius * 0.3} cy={headY - headRadius * 0.1} r={s * 0.015} fill="#333" />
          </>
        ) : emotion === 'happy' || emotion === 'celebrating' ? (
          <>
            <path d={`M ${cx - headRadius * 0.4} ${headY - headRadius * 0.05} Q ${cx - headRadius * 0.3} ${headY - headRadius * 0.2} ${cx - headRadius * 0.2} ${headY - headRadius * 0.05}`}
              fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
            <path d={`M ${cx + headRadius * 0.2} ${headY - headRadius * 0.05} Q ${cx + headRadius * 0.3} ${headY - headRadius * 0.2} ${cx + headRadius * 0.4} ${headY - headRadius * 0.05}`}
              fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
          </>
        ) : emotion === 'sad' ? (
          <>
            <ellipse cx={cx - headRadius * 0.3} cy={headY - headRadius * 0.05} rx={s * 0.02} ry={s * 0.025} fill="#333" />
            <ellipse cx={cx + headRadius * 0.3} cy={headY - headRadius * 0.05} rx={s * 0.02} ry={s * 0.025} fill="#333" />
            {/* Tear */}
            <ellipse cx={cx - headRadius * 0.25} cy={headY + headRadius * 0.1} rx={s * 0.01} ry={s * 0.015} fill="#74B9FF" />
          </>
        ) : emotion === 'angry' ? (
          <>
            <line x1={cx - headRadius * 0.4} y1={headY - headRadius * 0.2} x2={cx - headRadius * 0.2} y2={headY - headRadius * 0.1}
              stroke="#333" strokeWidth={2} strokeLinecap="round" />
            <circle cx={cx - headRadius * 0.3} cy={headY} r={s * 0.02} fill="#333" />
            <line x1={cx + headRadius * 0.2} y1={headY - headRadius * 0.1} x2={cx + headRadius * 0.4} y2={headY - headRadius * 0.2}
              stroke="#333" strokeWidth={2} strokeLinecap="round" />
            <circle cx={cx + headRadius * 0.3} cy={headY} r={s * 0.02} fill="#333" />
          </>
        ) : (
          <>
            <circle cx={cx - headRadius * 0.3} cy={headY - headRadius * 0.05} r={s * 0.025} fill="#333" />
            <circle cx={cx + headRadius * 0.3} cy={headY - headRadius * 0.05} r={s * 0.025} fill="#333" />
          </>
        )}

        {/* Mouth */}
        {emotion === 'happy' || emotion === 'celebrating' ? (
          <path d={`M ${cx - headRadius * 0.2} ${headY + headRadius * 0.25} Q ${cx} ${headY + headRadius * 0.45} ${cx + headRadius * 0.2} ${headY + headRadius * 0.25}`}
            fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
        ) : emotion === 'sad' ? (
          <path d={`M ${cx - headRadius * 0.15} ${headY + headRadius * 0.35} Q ${cx} ${headY + headRadius * 0.2} ${cx + headRadius * 0.15} ${headY + headRadius * 0.35}`}
            fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
        ) : emotion === 'surprised' ? (
          <ellipse cx={cx} cy={headY + headRadius * 0.3} rx={s * 0.025} ry={s * 0.035} fill="#333" />
        ) : emotion === 'angry' ? (
          <path d={`M ${cx - headRadius * 0.15} ${headY + headRadius * 0.3} L ${cx + headRadius * 0.15} ${headY + headRadius * 0.3}`}
            fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
        ) : emotion === 'scared' ? (
          <ellipse cx={cx} cy={headY + headRadius * 0.3} rx={s * 0.02} ry={s * 0.025} fill="#333" />
        ) : (
          <path d={`M ${cx - headRadius * 0.15} ${headY + headRadius * 0.25} Q ${cx} ${headY + headRadius * 0.35} ${cx + headRadius * 0.15} ${headY + headRadius * 0.25}`}
            fill="none" stroke="#333" strokeWidth={1.5} strokeLinecap="round" />
        )}

        {/* Blush for happy states */}
        {(emotion === 'happy' || emotion === 'celebrating') && (
          <>
            <circle cx={cx - headRadius * 0.5} cy={headY + headRadius * 0.15} r={s * 0.025} fill="#FFB6C1" opacity={0.5} />
            <circle cx={cx + headRadius * 0.5} cy={headY + headRadius * 0.15} r={s * 0.025} fill="#FFB6C1" opacity={0.5} />
          </>
        )}
      </svg>
    </div>
  );
}
