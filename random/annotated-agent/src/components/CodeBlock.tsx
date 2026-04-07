import { Highlight, themes } from 'prism-react-renderer';

interface Props {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'python' }: Props) {
  return (
    <div className="code-comparison">
      <div className="code-panel">
        <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
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
      </div>
    </div>
  );
}
