import { useEffect, useState } from 'react';

const zones = [
  { id: 'session', label: 'Session', x: 80, y: 50, desc: 'Write memories' },
  { id: 'next', label: 'Next Session', x: 420, y: 50, desc: 'Retrieve relevant' },
  { id: 'dream', label: 'Dream', x: 250, y: 210, desc: 'Consolidate' },
];

const edges = [
  { from: 0, to: 2, label: 'write memories' },
  { from: 2, to: 1, label: 'consolidate' },
  { from: 1, to: 0, label: 'retrieve relevant' },
];

export default function MemoryFlowDiagram() {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setAnimate(true)); }, []);

  return (
    <figure className="diagram">
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxWidth: 520, display: 'block', margin: '0 auto' }}>
        <defs>
          <filter id="dream-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <style>{`
            @keyframes pulse-cycle {
              0%, 100% { opacity: 0.3; }
              33% { opacity: 1; }
            }
          `}</style>
        </defs>

        {/* Curved edges */}
        {edges.map((e, i) => {
          const from = zones[e.from], to = zones[e.to];
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          const cpx = midX + (e.from === 1 ? -40 : e.from === 0 ? 0 : 20);
          const cpy = midY + (e.from === 1 ? -60 : 20);
          return (
            <g key={i}>
              <path d={`M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`}
                fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="6 4"
                opacity={animate ? 0.6 : 0} style={{ transition: `opacity 0.5s ${i * 0.3}s` }} />
              <text x={cpx + (e.from === 1 ? 10 : -10)} y={cpy + (e.from === 1 ? -8 : 10)}
                textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="system-ui">
                {e.label}
              </text>
              {/* Pulse dot */}
              <circle r="4" fill="var(--accent-claude)" opacity={animate ? 1 : 0}
                style={{ animation: animate ? `pulse-cycle 3s ease-in-out ${i}s infinite` : 'none' }}>
                <animateMotion dur="3s" repeatCount="indefinite" begin={`${i}s`}
                  path={`M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`} />
              </circle>
            </g>
          );
        })}

        {/* Zone nodes */}
        {zones.map((z, i) => {
          const isDream = z.id === 'dream';
          return (
            <g key={z.id} opacity={animate ? 1 : 0} style={{ transition: `opacity 0.4s ${i * 0.15}s` }}>
              <rect x={z.x - 55} y={z.y - 22} width={110} height={44} rx={8}
                fill={isDream ? 'var(--bg-elevated)' : 'var(--bg-surface)'}
                stroke={isDream ? 'var(--accent-claude)' : 'var(--accent-codex)'}
                strokeWidth={isDream ? 1.5 : 1}
                filter={isDream ? 'url(#dream-glow)' : undefined} />
              <text x={z.x} y={z.y + 5} textAnchor="middle"
                fill={isDream ? 'var(--accent-claude)' : 'var(--text)'}
                fontSize="13" fontWeight={isDream ? '600' : '400'} fontFamily="system-ui">
                {z.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>Three loops: in-session memory writes, background dream consolidation, and next-session semantic retrieval.</figcaption>
    </figure>
  );
}
