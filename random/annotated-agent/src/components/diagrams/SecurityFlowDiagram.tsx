import { useState } from 'react';

interface Node { id: string; label: string; x: number; y: number; }
interface Edge { from: string; to: string; label?: string; }

const codexNodes: Node[] = [
  { id: 'c1', label: 'Tool Call', x: 130, y: 40 },
  { id: 'c2', label: 'Sandbox', x: 130, y: 120 },
  { id: 'c3', label: 'Result', x: 130, y: 200 },
  { id: 'c4', label: 'Blocked?', x: 40, y: 160 },
  { id: 'c5', label: 'Ask User', x: 40, y: 240 },
  { id: 'c6', label: 'Retry', x: 40, y: 320 },
];
const codexEdges: Edge[] = [
  { from: 'c1', to: 'c2' }, { from: 'c2', to: 'c3' },
  { from: 'c2', to: 'c4', label: 'blocked' }, { from: 'c4', to: 'c5' }, { from: 'c5', to: 'c6' },
];

const claudeNodes: Node[] = [
  { id: 'a1', label: 'Tool Call', x: 130, y: 40 },
  { id: 'a2', label: 'Check Rules', x: 130, y: 120 },
  { id: 'a3', label: 'Deny', x: 40, y: 210 },
  { id: 'a4', label: 'Ask', x: 130, y: 210 },
  { id: 'a5', label: 'Allow', x: 220, y: 210 },
  { id: 'a6', label: 'Run', x: 130, y: 300 },
];
const claudeEdges: Edge[] = [
  { from: 'a1', to: 'a2' }, { from: 'a2', to: 'a3' },
  { from: 'a2', to: 'a4' }, { from: 'a2', to: 'a5' },
  { from: 'a4', to: 'a6' }, { from: 'a5', to: 'a6' },
];

function getNode(nodes: Node[], id: string) { return nodes.find(n => n.id === id)!; }

function curvePath(from: Node, to: Node): string {
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const cpx = dx === 0 ? from.x : from.x + dx * 0.5;
  return `M ${from.x} ${from.y + 16} C ${cpx} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - 16}`;
}

function FlowPanel({ nodes, edges, accent, title, hovered, setHovered }: {
  nodes: Node[]; edges: Edge[]; accent: string; title: string;
  hovered: string | null; setHovered: (id: string | null) => void;
}) {
  const connectedTo = (id: string) => {
    const ids = new Set<string>();
    edges.forEach(e => { if (e.from === id || e.to === id) { ids.add(e.from); ids.add(e.to); } });
    return ids;
  };
  const active = hovered ? connectedTo(hovered) : null;

  return (
    <svg viewBox="0 0 260 360" style={{ width: '48%', display: 'inline-block' }}>
      <text x="130" y="20" textAnchor="middle" fill={accent} fontSize="14" fontWeight="600" fontFamily="system-ui">{title}</text>
      {edges.map((e, i) => {
        const from = getNode(nodes, e.from), to = getNode(nodes, e.to);
        const lit = active ? active.has(e.from) && active.has(e.to) : false;
        return (
          <g key={i}>
            <path d={curvePath(from, to)} fill="none"
              stroke={lit ? accent : 'var(--border)'} strokeWidth={lit ? 2 : 1} opacity={active && !lit ? 0.3 : 1}
              style={{ transition: 'all 0.2s' }} />
            {e.label && <text x={(from.x + to.x) / 2 + 12} y={(from.y + to.y) / 2 + 4}
              fill="var(--text-secondary)" fontSize="10" fontFamily="system-ui">{e.label}</text>}
          </g>
        );
      })}
      {nodes.map(n => {
        const dim = active && !active.has(n.id);
        return (
          <g key={n.id} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} opacity={dim ? 0.3 : 1}>
            <rect x={n.x - 44} y={n.y - 16} width={88} height={32} rx={6}
              fill="var(--bg-surface)" stroke={active?.has(n.id) ? accent : 'var(--border)'} strokeWidth="1" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily="system-ui">
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function SecurityFlowDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <figure className="diagram">
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2%' }}>
        <FlowPanel nodes={codexNodes} edges={codexEdges} accent="var(--accent-codex)" title="Codex"
          hovered={hovered && hovered.startsWith('c') ? hovered : null} setHovered={setHovered} />
        <FlowPanel nodes={claudeNodes} edges={claudeEdges} accent="var(--accent-claude)" title="Claude Code"
          hovered={hovered && hovered.startsWith('a') ? hovered : null} setHovered={setHovered} />
      </div>
      <figcaption>Codex runs first and asks later. Claude Code asks first and runs later.</figcaption>
    </figure>
  );
}
