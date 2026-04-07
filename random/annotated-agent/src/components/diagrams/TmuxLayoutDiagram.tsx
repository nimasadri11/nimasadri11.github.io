export default function TmuxLayoutDiagram() {
  const termLine = (text: string, color?: string) => (
    <div style={{
      fontFamily: 'var(--font-code)',
      fontSize: '0.65rem',
      lineHeight: 1.5,
      color: color || 'var(--text-secondary)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    }}>{text}</div>
  );

  return (
    <figure className="diagram" style={{ maxWidth: 800, margin: '1.5rem auto' }}>
      <div style={{
        display: 'flex',
        borderRadius: 6,
        overflow: 'hidden',
        height: 260,
        fontFamily: 'var(--font-code)',
        fontSize: '0.7rem',
        background: '#000',
        border: '1px solid #333',
        textAlign: 'left',
      }}>
        {/* Leader pane */}
        <div style={{
          width: '30%',
          borderRight: '1px solid #444',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d1117',
        }}>
          <div style={{
            padding: '4px 8px',
            background: '#1a1a2e',
            borderBottom: '1px solid #333',
            color: '#8b949e',
            fontSize: '0.6rem',
          }}>0: leader ─ claude</div>
          <div style={{ padding: '6px 8px', flex: 1, overflow: 'hidden' }}>
            {termLine('Team created via TeamCreate tool')}
            {termLine('')}
            <div style={{
              border: '1px solid #30363d',
              borderRadius: 4,
              padding: '4px 6px',
              margin: '2px 0 4px',
              fontSize: '0.6rem',
            }}>
              <div style={{ color: '#8b949e', marginBottom: 2 }}>auth-fix</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#58a6ff' }}>
                <span>researcher</span><span>● running</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3fb950' }}>
                <span>implementer</span><span>● running</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0883e' }}>
                <span>verifier</span><span>○ idle</span>
              </div>
            </div>
            {termLine('')}
            {termLine('> Waiting for researcher...', '#d29922')}
            {termLine('')}
            {termLine('researcher found 3 auth', '#58a6ff')}
            {termLine('  handlers in src/api/', '#58a6ff')}
          </div>
        </div>

        {/* Right side: stacked teammate panes */}
        <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
          {/* Researcher pane */}
          <div style={{
            flex: 1,
            borderBottom: '1px solid #444',
            borderLeft: '2px solid #58a6ff',
            background: '#0d1117',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '4px 8px',
              background: '#1a1a2e',
              borderBottom: '1px solid #333',
              color: '#58a6ff',
              fontSize: '0.6rem',
            }}>1: researcher ─ claude</div>
            <div style={{ padding: '6px 8px', flex: 1, overflow: 'hidden' }}>
              {termLine('● Reading src/api/auth.ts')}
              {termLine('● Reading src/api/session.ts')}
              {termLine('● Grep "validateToken" found 3', '#e6edf3')}
              {termLine('  results in 2 files')}
            </div>
          </div>

          {/* Implementer pane */}
          <div style={{
            flex: 1,
            borderBottom: '1px solid #444',
            borderLeft: '2px solid #3fb950',
            background: '#0d1117',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '4px 8px',
              background: '#1a1a2e',
              borderBottom: '1px solid #333',
              color: '#3fb950',
              fontSize: '0.6rem',
            }}>2: implementer ─ claude</div>
            <div style={{ padding: '6px 8px', flex: 1, overflow: 'hidden' }}>
              {termLine('● Editing src/api/auth.ts')}
              {termLine('  +  if (!token) return 401')}
              {termLine('  -  if (!token) return null')}
            </div>
          </div>

          {/* Verifier pane */}
          <div style={{
            flex: 1,
            borderLeft: '2px solid #f0883e',
            background: '#0d1117',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '4px 8px',
              background: '#1a1a2e',
              borderBottom: '1px solid #333',
              color: '#f0883e',
              fontSize: '0.6rem',
            }}>3: verifier ─ claude</div>
            <div style={{ padding: '6px 8px', flex: 1, overflow: 'hidden' }}>
              {termLine('○ Waiting for instructions...', '#484f58')}
            </div>
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
        Claude Code tmux swarm. Leader (left, 30%) coordinates. Teammates (right, 70%) each run in their own pane with color-coded borders.
      </figcaption>
    </figure>
  );
}
