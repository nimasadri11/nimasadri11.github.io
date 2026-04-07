const phases = [
  { label: 'Research', workers: 3, desc: 'Fan out', pattern: 'fan-out' },
  { label: 'Synthesis', workers: 1, desc: 'Funnel in', pattern: 'funnel' },
  { label: 'Implement', workers: 2, desc: 'Sequential', pattern: 'serial' },
  { label: 'Verify', workers: 1, desc: 'Fresh eyes', pattern: 'single' },
] as const;

function WorkerDots({ count, cx, cy }: { count: number; cx: number; cy: number }) {
  if (count === 1) return <circle cx={cx} cy={cy} r={6} fill="var(--accent-codex)" opacity={0.8} />;
  const spacing = 18;
  const startX = cx - ((count - 1) * spacing) / 2;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={startX + i * spacing} cy={cy} r={5} fill="var(--accent-codex)" opacity={0.8} />
      ))}
    </>
  );
}

export default function CoordinatorPhasesDiagram() {
  const boxW = 120, boxH = 100, gap = 16, padX = 30;
  const totalW = phases.length * boxW + (phases.length - 1) * gap + padX * 2;
  const totalH = 160;

  return (
    <figure className="diagram">
      <svg viewBox={`0 0 ${totalW} ${totalH}`} style={{ width: '100%', maxWidth: totalW, display: 'block', margin: '0 auto' }}>
        <defs>
          <linearGradient id="phase-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--bg-surface)" />
            <stop offset="100%" stopColor="var(--bg-elevated)" />
          </linearGradient>
        </defs>

        {/* Background gradient bar */}
        <rect x={padX} y={20} width={totalW - padX * 2} height={boxH + 20} rx={8}
          fill="url(#phase-grad)" stroke="var(--border)" strokeWidth="1" />

        {phases.map((p, i) => {
          const x = padX + i * (boxW + gap) + gap / 2;
          const midX = x + boxW / 2;
          const fillOpacity = 0.05 + i * 0.04;

          return (
            <g key={p.label}>
              <rect x={x} y={28} width={boxW - gap} height={boxH} rx={6}
                fill={`rgba(88,166,255,${fillOpacity})`} stroke="var(--border)" strokeWidth="1" />
              <text x={midX - gap / 2} y={50} textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="600" fontFamily="system-ui">
                {p.label}
              </text>
              <WorkerDots count={p.workers} cx={midX - gap / 2} cy={80} />
              <text x={midX - gap / 2} y={115} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="system-ui">
                {p.desc}
              </text>

              {/* Arrow between phases */}
              {i < phases.length - 1 && (
                <polygon
                  points={`${x + boxW - gap + 4},${78} ${x + boxW - gap + 14},${82} ${x + boxW - gap + 4},${86}`}
                  fill="var(--text-secondary)" />
              )}
            </g>
          );
        })}
      </svg>
      <figcaption>Research fans out, synthesis funnels in, implementation fans out again, verification collects.</figcaption>
    </figure>
  );
}
