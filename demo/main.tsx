import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  doc,
  expand,
  h2,
  mention,
  p,
  panel,
  status,
  strong,
  tableFrom,
  bulletList,
} from '@ai-testing-tool/atlassian-adf-lite';
import type { DocNode } from '@ai-testing-tool/atlassian-adf-lite';
import { AdfEditor } from '../src/AdfEditor';
import '../src/styles.css';

const sample: DocNode = doc(
  h2('Sprint review'),
  p('Shipped by ', mention('user-1', 'Ana'), ' — ', status('Done', 'green'), '.'),
  p('Highlights: ', strong('faster search'), ' and dark mode.'),
  bulletList('API v2', 'Mentions in comments', 'Table editing'),
  panel('info', 'Remember to rotate tokens after deploy.'),
  expand('Notes', p('Nothing blocking for next sprint.')),
  tableFrom(['Item', 'Owner'], [['Docs', 'Ana'], ['Release', 'Vu']]),
);

function App() {
  const [value, setValue] = useState<DocNode>(sample);

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', display: 'grid', gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 28 }}>atlassian-quill-editor</h1>
        <p style={{ color: '#6b778c' }}>
          React Quill editor that round-trips Jira ADF descriptions.
        </p>
      </header>
      <AdfEditor
        value={value}
        onChange={setValue}
        mention={{
          search: async (q) =>
            [
              { id: 'user-1', displayName: 'Ana Rivera' },
              { id: 'user-2', displayName: 'Vu Vo' },
              { id: 'user-3', displayName: 'Jordan Lee' },
            ].filter((u) => u.displayName.toLowerCase().includes(q.toLowerCase())),
        }}
        media={{
          onInsert: async () => ({
            attrs: {
              type: 'external',
              url: 'https://placehold.co/600x200',
              alt: 'Placeholder',
            },
            layout: 'center',
          }),
        }}
      />
      <section>
        <h2 style={{ fontSize: 16 }}>ADF JSON</h2>
        <pre
          style={{
            background: '#0f172a',
            color: '#e2e8f0',
            padding: 12,
            borderRadius: 8,
            overflow: 'auto',
            fontSize: 12,
          }}
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
