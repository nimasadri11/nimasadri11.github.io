import { useEffect, useRef } from 'react';

const steps = ['Prompt', 'LLM', 'Parse', 'Permission', 'Execute', 'Append'];

export default function AgentLoopDiagram() {
  const pathRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = pathRef.current;
    if (el) el.style.animationPlayState = 'running';
  }, []);

  const cx = 300, cy = 200, rx = 220, ry = 140;

  return (
    <figure className="diagram">
      <svg viewBox="0 0 600 400" style={{ width: '100%', maxWidth: 600, display: 'block', margin: '0 auto' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <style>{`
            @keyframes orbit {
              0% { offset-distance: 0%; opacity: 1; }
              100% { offset-distance: 100%; opacity: 1; }
            }
            .orbit-dot {
              offset-path: path("M ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx - 0.01} ${cy}");
              offset-rotate: 0deg;
              animation: orbit 3s ease-in-out forwards;
              animation-play-state: paused;
              opacity: 0;
            }
          `}</style>
        </defs>

        {/* Connecting ellipse path */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Arrow indicators along the path */}
        {steps.map((_, i) => {
          const angle = (i * 2 * Math.PI) / steps.length - Math.PI / 2;
          const midAngle = ((i + 0.5) * 2 * Math.PI) / steps.length - Math.PI / 2;
          const mx = cx + rx * Math.cos(midAngle);
          const my = cy + ry * Math.sin(midAngle);
          const dir = midAngle + Math.PI / 2;
          return (
            <polygon
              key={`arr-${i}`}
              points={`${mx + 5 * Math.cos(dir)},${my + 5 * Math.sin(dir)} ${mx - 3 * Math.cos(dir) - 3 * Math.sin(dir)},${my - 3 * Math.sin(dir) + 3 * Math.cos(dir)} ${mx - 3 * Math.cos(dir) + 3 * Math.sin(dir)},${my - 3 * Math.sin(dir) - 3 * Math.cos(dir)}`}
              fill="var(--text-secondary)"
            />
          );
        })}

        {/* Nodes */}
        {steps.map((label, i) => {
          const angle = (i * 2 * Math.PI) / steps.length - Math.PI / 2;
          const x = cx + rx * Math.cos(angle);
          const y = cy + ry * Math.sin(angle);
          return (
            <g key={label}>
              <rect x={x - 48} y={y - 18} width={96} height={36} rx={8}
                fill="var(--bg-surface)" stroke="var(--accent-codex)" strokeWidth="1" />
              <text x={x} y={y + 5} textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="system-ui">
                {label}
              </text>
            </g>
          );
        })}

        {/* Animated dot */}
        <circle ref={pathRef} className="orbit-dot" r="6" fill="var(--accent-codex)" filter="url(#glow)" />
      </svg>
      <figcaption>The core agent loop: prompt the model, parse its response, check permissions, execute tools, append results, repeat.</figcaption>
    </figure>
  );
}
