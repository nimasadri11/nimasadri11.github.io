const states = [
  {
    label: 'Working',
    color: '#3fb950',
    icon: '●',
    desc: 'Reading files, editing code, running tests, committing.',
    detail: 'Focused → collaborative (asks before acting). Unfocused → autonomous (commits, pushes).',
  },
  {
    label: 'Reporting',
    color: '#58a6ff',
    icon: '↑',
    desc: 'Sends results via SendUserMessage.',
    detail: '"normal" = reply to user. "proactive" = agent-initiated → push notification.',
  },
  {
    label: 'Tick',
    color: '#d29922',
    icon: '⏱',
    desc: 'Periodic wake-up: "you\'re awake, what now?"',
    detail: 'Checks for messages, scheduled tasks, channel notifications. Must work or sleep.',
  },
  {
    label: 'Sleeping',
    color: '#484f58',
    icon: '○',
    desc: 'Idle. Waiting for next tick or user message.',
    detail: 'Prompt cache expires after 5 min. Balances cost (short sleep = more API calls) vs latency.',
  },
];

export default function KairosLifecycleDiagram() {
  return (
    <figure className="diagram" style={{ maxWidth: 750, margin: '1.5rem auto' }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '1.5rem',
        fontFamily: 'var(--font-ui)',
        textAlign: 'left',
      }}>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>KAIROS Lifecycle</div>

        {/* Cycle arrow */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginBottom: '1.2rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          {states.map((s, i) => (
            <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: s.color, fontWeight: 600 }}>{s.icon} {s.label}</span>
              {i < states.length - 1 && <span>→</span>}
            </span>
          ))}
          <span>↩</span>
        </div>

        {/* State details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {states.map((s) => (
            <div key={s.label} style={{
              display: 'flex',
              gap: 12,
              padding: '8px 12px',
              background: 'var(--bg)',
              borderRadius: 6,
              borderLeft: `3px solid ${s.color}`,
            }}>
              <div style={{ flexShrink: 0, fontSize: '1rem', width: 20, textAlign: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: 2 }}>
                  <strong style={{ color: s.color }}>{s.label}.</strong> {s.desc}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {s.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Context indicators */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginTop: '1rem',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950' }} />
            Terminal focused → collaborative
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0883e' }} />
            Terminal unfocused → autonomous
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d29922' }} />
            Bash auto-backgrounds after 15s
          </div>
        </div>
      </div>
      <figcaption style={{
        marginTop: '0.5rem',
        fontFamily: 'var(--font-ui)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}>
        The cycle repeats indefinitely. Ticks wake the agent; Sleep idles it cost-efficiently.
      </figcaption>
    </figure>
  );
}
