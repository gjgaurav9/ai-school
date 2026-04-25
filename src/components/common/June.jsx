import { useState, useEffect } from 'react';

// Pink pig character — generic, friendly, kid-warm. Same emotion API as before.
export default function June({ emotion = 'neutral', size = 200, animate = true, className = '' }) {
  const [bounce, setBounce] = useState(false);

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
  const headR = s * 0.28;
  const bodyY = headY + headR * 1.35;
  const bodyRX = headR * 1.05;
  const bodyRY = headR * 0.8;

  const PIG_BODY = '#FFB6C9';
  const PIG_SHADE = '#E89AB0';
  const PIG_DARK = '#C97A92';
  const PIG_INNER = '#FFD2DD';

  const happy = emotion === 'happy' || emotion === 'celebrating' || emotion === 'proud' || emotion === 'excited';
  const sad = emotion === 'sad' || emotion === 'guilty' || emotion === 'worried';
  const surprised = emotion === 'surprised' || emotion === 'scared' || emotion === 'curious';
  const angry = emotion === 'angry' || emotion === 'frustrated';

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
        <ellipse cx={cx} cy={bodyY} rx={bodyRX} ry={bodyRY} fill={PIG_BODY} stroke={PIG_DARK} strokeWidth={2} />

        {/* Legs */}
        <rect x={cx - bodyRX * 0.55} y={bodyY + bodyRY * 0.5} width={s * 0.08} height={s * 0.12}
          rx={4} fill={PIG_SHADE} stroke={PIG_DARK} strokeWidth={1.5} />
        <rect x={cx + bodyRX * 0.3} y={bodyY + bodyRY * 0.5} width={s * 0.08} height={s * 0.12}
          rx={4} fill={PIG_SHADE} stroke={PIG_DARK} strokeWidth={1.5} />

        {/* Arms / front trotters — lifted when happy */}
        {happy ? (
          <>
            <ellipse cx={cx - bodyRX * 0.95} cy={bodyY - bodyRY * 0.4}
              rx={s * 0.045} ry={s * 0.07} fill={PIG_SHADE} stroke={PIG_DARK} strokeWidth={1.5}
              transform={`rotate(-25 ${cx - bodyRX * 0.95} ${bodyY - bodyRY * 0.4})`} />
            <ellipse cx={cx + bodyRX * 0.95} cy={bodyY - bodyRY * 0.4}
              rx={s * 0.045} ry={s * 0.07} fill={PIG_SHADE} stroke={PIG_DARK} strokeWidth={1.5}
              transform={`rotate(25 ${cx + bodyRX * 0.95} ${bodyY - bodyRY * 0.4})`} />
          </>
        ) : (
          <>
            <ellipse cx={cx - bodyRX * 0.85} cy={bodyY + bodyRY * 0.05}
              rx={s * 0.04} ry={s * 0.07} fill={PIG_SHADE} stroke={PIG_DARK} strokeWidth={1.5} />
            <ellipse cx={cx + bodyRX * 0.85} cy={bodyY + bodyRY * 0.05}
              rx={s * 0.04} ry={s * 0.07} fill={PIG_SHADE} stroke={PIG_DARK} strokeWidth={1.5} />
          </>
        )}

        {/* Curly tail */}
        <path
          d={`M ${cx + bodyRX * 0.95} ${bodyY}
              q ${s * 0.04} -${s * 0.02} ${s * 0.05} ${s * 0.02}
              q ${s * 0.01} ${s * 0.04} -${s * 0.04} ${s * 0.04}`}
          fill="none" stroke={PIG_DARK} strokeWidth={s * 0.02} strokeLinecap="round"
        />

        {/* Ears (triangle, floppy tips) */}
        <path
          d={`M ${cx - headR * 0.7} ${headY - headR * 0.85}
              L ${cx - headR * 0.95} ${headY - headR * 1.25}
              L ${cx - headR * 0.35} ${headY - headR * 0.95} Z`}
          fill={PIG_BODY} stroke={PIG_DARK} strokeWidth={1.6} strokeLinejoin="round"
        />
        <path
          d={`M ${cx - headR * 0.75} ${headY - headR * 0.95}
              L ${cx - headR * 0.85} ${headY - headR * 1.1}
              L ${cx - headR * 0.55} ${headY - headR * 1.0} Z`}
          fill={PIG_INNER}
        />
        <path
          d={`M ${cx + headR * 0.7} ${headY - headR * 0.85}
              L ${cx + headR * 0.95} ${headY - headR * 1.25}
              L ${cx + headR * 0.35} ${headY - headR * 0.95} Z`}
          fill={PIG_BODY} stroke={PIG_DARK} strokeWidth={1.6} strokeLinejoin="round"
        />
        <path
          d={`M ${cx + headR * 0.75} ${headY - headR * 0.95}
              L ${cx + headR * 0.85} ${headY - headR * 1.1}
              L ${cx + headR * 0.55} ${headY - headR * 1.0} Z`}
          fill={PIG_INNER}
        />

        {/* Head */}
        <circle cx={cx} cy={headY} r={headR} fill={PIG_BODY} stroke={PIG_DARK} strokeWidth={2} />

        {/* Snout (front-facing oval with two nostrils) */}
        <ellipse cx={cx} cy={headY + headR * 0.35} rx={headR * 0.45} ry={headR * 0.3}
          fill={PIG_INNER} stroke={PIG_DARK} strokeWidth={1.6} />
        <ellipse cx={cx - headR * 0.13} cy={headY + headR * 0.33} rx={headR * 0.06} ry={headR * 0.08} fill={PIG_DARK} />
        <ellipse cx={cx + headR * 0.13} cy={headY + headR * 0.33} rx={headR * 0.06} ry={headR * 0.08} fill={PIG_DARK} />

        {/* Eyes — emotion-driven */}
        {surprised ? (
          <>
            <circle cx={cx - headR * 0.35} cy={headY - headR * 0.15} r={s * 0.035} fill="white" stroke="#333" strokeWidth={1.5} />
            <circle cx={cx - headR * 0.35} cy={headY - headR * 0.15} r={s * 0.018} fill="#333" />
            <circle cx={cx + headR * 0.35} cy={headY - headR * 0.15} r={s * 0.035} fill="white" stroke="#333" strokeWidth={1.5} />
            <circle cx={cx + headR * 0.35} cy={headY - headR * 0.15} r={s * 0.018} fill="#333" />
          </>
        ) : happy ? (
          <>
            <path d={`M ${cx - headR * 0.45} ${headY - headR * 0.1}
                      Q ${cx - headR * 0.35} ${headY - headR * 0.28}
                        ${cx - headR * 0.25} ${headY - headR * 0.1}`}
              fill="none" stroke="#333" strokeWidth={2.2} strokeLinecap="round" />
            <path d={`M ${cx + headR * 0.25} ${headY - headR * 0.1}
                      Q ${cx + headR * 0.35} ${headY - headR * 0.28}
                        ${cx + headR * 0.45} ${headY - headR * 0.1}`}
              fill="none" stroke="#333" strokeWidth={2.2} strokeLinecap="round" />
          </>
        ) : sad ? (
          <>
            <ellipse cx={cx - headR * 0.35} cy={headY - headR * 0.1} rx={s * 0.022} ry={s * 0.028} fill="#333" />
            <ellipse cx={cx + headR * 0.35} cy={headY - headR * 0.1} rx={s * 0.022} ry={s * 0.028} fill="#333" />
            <ellipse cx={cx - headR * 0.3} cy={headY + headR * 0.05} rx={s * 0.012} ry={s * 0.018} fill="#74B9FF" />
          </>
        ) : angry ? (
          <>
            <line x1={cx - headR * 0.5} y1={headY - headR * 0.3} x2={cx - headR * 0.25} y2={headY - headR * 0.18}
              stroke="#333" strokeWidth={2.2} strokeLinecap="round" />
            <circle cx={cx - headR * 0.35} cy={headY - headR * 0.08} r={s * 0.022} fill="#333" />
            <line x1={cx + headR * 0.25} y1={headY - headR * 0.18} x2={cx + headR * 0.5} y2={headY - headR * 0.3}
              stroke="#333" strokeWidth={2.2} strokeLinecap="round" />
            <circle cx={cx + headR * 0.35} cy={headY - headR * 0.08} r={s * 0.022} fill="#333" />
          </>
        ) : (
          <>
            <circle cx={cx - headR * 0.35} cy={headY - headR * 0.1} r={s * 0.025} fill="#333" />
            <circle cx={cx + headR * 0.35} cy={headY - headR * 0.1} r={s * 0.025} fill="#333" />
          </>
        )}

        {/* Mouth — small curve sitting just under the snout */}
        {happy ? (
          <path d={`M ${cx - headR * 0.18} ${headY + headR * 0.62}
                    Q ${cx} ${headY + headR * 0.78}
                      ${cx + headR * 0.18} ${headY + headR * 0.62}`}
            fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
        ) : sad ? (
          <path d={`M ${cx - headR * 0.15} ${headY + headR * 0.72}
                    Q ${cx} ${headY + headR * 0.6}
                      ${cx + headR * 0.15} ${headY + headR * 0.72}`}
            fill="none" stroke="#333" strokeWidth={2} strokeLinecap="round" />
        ) : surprised ? (
          <ellipse cx={cx} cy={headY + headR * 0.7} rx={s * 0.022} ry={s * 0.03} fill="#333" />
        ) : angry ? (
          <line x1={cx - headR * 0.15} y1={headY + headR * 0.7} x2={cx + headR * 0.15} y2={headY + headR * 0.7}
            stroke="#333" strokeWidth={2.2} strokeLinecap="round" />
        ) : (
          <path d={`M ${cx - headR * 0.12} ${headY + headR * 0.65}
                    Q ${cx} ${headY + headR * 0.72}
                      ${cx + headR * 0.12} ${headY + headR * 0.65}`}
            fill="none" stroke="#333" strokeWidth={1.8} strokeLinecap="round" />
        )}

        {/* Cheek blush for happy/proud */}
        {happy && (
          <>
            <circle cx={cx - headR * 0.6} cy={headY + headR * 0.2} r={s * 0.03} fill="#FF8FB1" opacity={0.55} />
            <circle cx={cx + headR * 0.6} cy={headY + headR * 0.2} r={s * 0.03} fill="#FF8FB1" opacity={0.55} />
          </>
        )}
      </svg>
    </div>
  );
}
