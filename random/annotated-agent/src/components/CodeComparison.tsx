import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface Props {
  codex: string;
  claude: string;
  codexAnnotations?: Record<number, string>;
  claudeAnnotations?: Record<number, string>;
}

function HighlightedCode({ code }: { code: string }) {
  return (
    <Highlight theme={themes.nightOwl} code={code.trim()} language="python">
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre style={{ ...style, background: 'none', margin: 0, padding: '0.5rem 1rem', fontSize: '0.85rem', lineHeight: '1.6', fontFamily: 'var(--font-code)' }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

export default function CodeComparison({ codex, claude }: Props) {
  const [activeTab, setActiveTab] = useState<'codex' | 'claude' | 'side-by-side'>('side-by-side');

  return (
    <div className="code-comparison">
      <div className="code-tabs">
        <button
          className="code-tab"
          style={activeTab === 'codex' ? { color: 'var(--text)', borderBottomColor: 'var(--accent-codex)' } : {}}
          onClick={() => setActiveTab('codex')}
          type="button"
        >
          Codex
        </button>
        <button
          className="code-tab"
          style={activeTab === 'claude' ? { color: 'var(--text)', borderBottomColor: 'var(--accent-claude)' } : {}}
          onClick={() => setActiveTab('claude')}
          type="button"
        >
          Claude Code
        </button>
        <button
          className="code-tab"
          style={activeTab === 'side-by-side' ? { color: 'var(--text)', borderBottomColor: 'var(--accent-claude)' } : {}}
          onClick={() => setActiveTab('side-by-side')}
          type="button"
        >
          Side by Side
        </button>
      </div>

      {activeTab === 'codex' && (
        <div className="code-panel">
          <HighlightedCode code={codex} />
        </div>
      )}

      {activeTab === 'claude' && (
        <div className="code-panel">
          <HighlightedCode code={claude} />
        </div>
      )}

      {activeTab === 'side-by-side' && (
        <div className="code-side-by-side">
          <div className="code-panel">
            <div className="code-panel-header codex-header">CODEX</div>
            <HighlightedCode code={codex} />
          </div>
          <div className="code-panel">
            <div className="code-panel-header claude-header">CLAUDE CODE</div>
            <HighlightedCode code={claude} />
          </div>
        </div>
      )}
    </div>
  );
}
