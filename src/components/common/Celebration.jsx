import { useState, useEffect } from 'react';

const COLORS = ['#FFCB05', '#0077B6', '#FF8C42', '#E91E8C', '#2DC653', '#A855F7', '#F43F5E'];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

export default function Celebration({ active = false, type = 'confetti' }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const count = type === 'confetti' ? 30 : 15;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(10, 90),
      y: randomBetween(-10, 10),
      size: randomBetween(6, 14),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: randomBetween(0, 0.5),
      duration: randomBetween(1.5, 2.5),
      rotation: randomBetween(0, 360),
      shape: type === 'stars' ? 'star' : ['circle', 'square', 'circle'][i % 3],
    }));

    setParticles(newParticles);

    const t = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(t);
  }, [active, type]);

  if (!particles.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 'star' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'star' ? '0' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {p.shape === 'star' && (
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
