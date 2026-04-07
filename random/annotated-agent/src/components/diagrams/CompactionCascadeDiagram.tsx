import { useState } from 'react';

const layers = [
  { label: 'Drop messages', width: 0.12, desc: 'Remove system-generated noise (progress bars, empty results)' },
  { label: 'Evict outputs', width: 0.18, desc: 'Strip large tool outputs, keep the tool call record' },
  { label: 'Collapse groups', width: 0.28, desc: 'Merge adjacent tool calls into a single summary block' },
  { label: 'LLM summarize', width: 0.42, desc: 'Ask the model to compress the conversation history' },
];

export default function CompactionCascadeDiagram() {
  const [hovered, setHovered] = useState<number | null>(null);
  const totalW = 560, barH = 48, padX = 20, padY = 30;
  const barW = totalW - padX * 2;

  let xOffset = padX;

  return (
    <figure className="diagram">
      <svg viewBox={`0 0 ${totalW} ${barH + padY * 2 + 30}`}
        style={{ width: '100%', maxWidth: totalW, display: 'block', margin: '0 auto' }}>
        <defs>
          <linearGradient id="cost-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a3a2a" />
            <stop offset="100%" stopColor="var(--accent-verdict)" />
          </linearGradient>
        </defs>

        {/* Labels */}
        <text x={padX} y={18} fill="var(--text-secondary)" fontSize="11" fontFamily="system-ui">Free</text>
        <text x={totalW - padX} y={18} textAnchor="end" fill="var(--accent-verdict)" fontSize="11" fontFamily="system-ui">Expensive</text>

        {/* Background bar */}
        <rect x={padX} y={padY} width={barW} height={barH} rx={6}
          fill="url(#cost-grad)" stroke="var(--border)" strokeWidth="1" />

        {/* Segments */}
        {layers.map((layer, i) => {
          const segW = barW * layer.width;
          const segX = xOffset;
          xOffset += segW;
          const intensity = 0.15 + i * 0.25;
          const isHover = hovered === i;

          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}>
              <rect x={segX} y={padY} width={segW} height={barH} rx={i === 0 ? 6 : 0}
                fill={isHover ? `rgba(210,153,34,${intensity + 0.15})` : `rgba(210,153,34,${intensity * 0.3})`}
                style={{ transition: 'fill 0.2s' }} />
              {i > 0 && <line x1={segX} y1={padY + 2} x2={segX} y2={padY + barH - 2}
                stroke="var(--border)" strokeWidth="1" />}
              <text x={segX + segW / 2} y={padY + barH / 2 + 4} textAnchor="middle"
                fill={isHover ? 'var(--text)' : 'var(--text-secondary)'}
                fontSize={segW > 80 ? '11' : '9'} fontFamily="system-ui"
                style={{ transition: 'fill 0.2s' }}>
                {layer.label}
              </text>

              {/* Tooltip */}
              {isHover && (
                <g>
                  <rect x={segX + segW / 2 - 130} y={padY + barH + 10} width={260} height={28} rx={4}
                    fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1" />
                  <text x={segX + segW / 2} y={padY + barH + 29} textAnchor="middle"
                    fill="var(--text)" fontSize="11" fontFamily="system-ui">
                    {layer.desc}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption>Each strategy is cheaper than the next. The system tries free options before spending tokens.</figcaption>
    </figure>
  );
}
