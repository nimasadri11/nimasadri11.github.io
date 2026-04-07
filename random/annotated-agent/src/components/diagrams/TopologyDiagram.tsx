import { useEffect, useState } from 'react';

function TreePanel({ animate }: { animate: boolean }) {
  const nodes = [
    { id: 'p', x: 150, y: 40, label: 'Parent' },
    { id: 'c1', x: 60, y: 130, label: 'Child 1' },
    { id: 'c2', x: 150, y: 130, label: 'Child 2' },
    { id: 'c3', x: 240, y: 130, label: 'Child 3' },
    { id: 'g1', x: 150, y: 220, label: 'Grandchild' },
  ];
  const edges = [
    ['p', 'c1'], ['p', 'c2'], ['p', 'c3'], ['c2', 'g1'],
  ];
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <svg viewBox="0 0 300 270" style={{ width: '48%', display: 'inline-block' }}>
      <text x="150" y="18" textAnchor="middle" fill="var(--accent-codex)" fontSize="13" fontWeight="600" fontFamily="system-ui">
        Codex: Tree (Parent-Child)
      </text>
      {edges.map(([a, b], i) => {
        const from = byId[a], to = byId[b];
        return (
          <line key={i} x1={from.x} y1={from.y + 16} x2={to.x} y2={to.y - 16}
            stroke="var(--accent-codex)" strokeWidth="1.5" opacity={animate ? 1 : 0}
            style={{ transition: `opacity 0.4s ${i * 0.15}s` }} />
        );
      })}
      {nodes.map((n, i) => (
        <g key={n.id} opacity={animate ? 1 : 0} style={{ transition: `opacity 0.4s ${i * 0.12}s` }}>
          <rect x={n.x - 42} y={n.y - 14} width={84} height={28} rx={6}
            fill="var(--bg-surface)" stroke="var(--accent-codex)" strokeWidth="1" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill="var(--text)" fontSize="11" fontFamily="system-ui">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TeamPanel({ animate }: { animate: boolean }) {
  const nodes = [
    { id: 'l', x: 150, y: 50, label: 'Leader' },
    { id: 'w1', x: 60, y: 160, label: 'Worker 1' },
    { id: 'w2', x: 150, y: 180, label: 'Worker 2' },
    { id: 'w3', x: 240, y: 160, label: 'Worker 3' },
  ];
  const ids = nodes.map(n => n.id);
  const edges: [string, string][] = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      edges.push([ids[i], ids[j]]);

  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <svg viewBox="0 0 300 240" style={{ width: '48%', display: 'inline-block' }}>
      <text x="150" y="18" textAnchor="middle" fill="var(--accent-claude)" fontSize="13" fontWeight="600" fontFamily="system-ui">
        Claude Code: Team (Any-to-Any)
      </text>
      {edges.map(([a, b], i) => {
        const from = byId[a], to = byId[b];
        return (
          <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke="var(--accent-claude)" strokeWidth="1" strokeDasharray="4 3" opacity={animate ? 0.7 : 0}
            style={{ transition: `opacity 0.5s ${0.2 + i * 0.08}s` }} />
        );
      })}
      {nodes.map((n, i) => (
        <g key={n.id} opacity={animate ? 1 : 0} style={{ transition: `opacity 0.4s ${i * 0.1}s` }}>
          <rect x={n.x - 42} y={n.y - 14} width={84} height={28} rx={6}
            fill="var(--bg-surface)" stroke="var(--accent-claude)" strokeWidth="1" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill="var(--text)" fontSize="11" fontFamily="system-ui">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function TopologyDiagram() {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setAnimate(true)); }, []);

  return (
    <figure className="diagram">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2%', maxHeight: '280px' }}>
        <TreePanel animate={animate} />
        <TeamPanel animate={animate} />
      </div>
      <figcaption>Codex enforces parent-child hierarchy. Claude Code allows lateral messaging between any team member.</figcaption>
    </figure>
  );
}
