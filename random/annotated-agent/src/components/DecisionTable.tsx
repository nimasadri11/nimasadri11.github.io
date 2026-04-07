interface Decision {
  number: number;
  name: string;
  codex: string;
  claude: string;
  verdict?: string;
  anchor?: string;
}

interface Props {
  decisions: Decision[];
  showVerdicts?: boolean;
}

const chapterGroups = [
  { label: 'Chapter 1: Prompt & Extensions', anchor: 'ch-1' },
  { label: 'Chapter 2: Context', anchor: 'ch-2' },
  { label: 'Chapter 3: Security', anchor: 'ch-3' },
  { label: 'Chapter 4: Swarm', anchor: 'ch-4' },
  { label: 'Chapter 5: Stream', anchor: 'ch-5' },
  { label: 'Chapter 6: Memory', anchor: 'ch-6' },
  { label: 'Chapter 7: Voice', anchor: 'ch-7' },
  { label: 'Chapter 8: Future', anchor: 'ch-8' },
];

export default function DecisionTable({ decisions, showVerdicts = false }: Props) {
  const grouped = chapterGroups.map(g => ({
    ...g,
    decisions: decisions.filter(d => d.anchor === g.anchor),
  })).filter(g => g.decisions.length > 0);

  return (
    <div className="decision-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Decision</th>
            <th>Codex</th>
            <th>Claude Code</th>
            {showVerdicts && <th>Verdict</th>}
          </tr>
        </thead>
        <tbody>
          {grouped.map((group) => (
            <>
              <tr
                key={group.label}
                onClick={() => window.location.hash = group.anchor}
                style={{ cursor: 'pointer' }}
              >
                <td colSpan={showVerdicts ? 5 : 4} style={{
                  background: 'var(--bg-elevated)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-secondary)',
                  padding: '0.6rem 1rem',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {group.label}
                </td>
              </tr>
              {group.decisions.map((d) => (
                <tr
                  key={d.number}
                  onClick={() => d.anchor && (window.location.hash = d.anchor)}
                  style={{ cursor: d.anchor ? 'pointer' : 'default' }}
                >
                  <td>{d.number}</td>
                  <td>{d.name}</td>
                  <td className="codex-cell">{d.codex}</td>
                  <td className="claude-cell">{d.claude}</td>
                  {showVerdicts && <td className="verdict-cell">{d.verdict || '—'}</td>}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
