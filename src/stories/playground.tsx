import { useState } from 'react';
import type { DocNode } from '@ai-testing-tool/atlassian-adf-lite';
import { doc, p } from '@ai-testing-tool/atlassian-adf-lite';
import { AdfEditor } from '../AdfEditor';
import type { AdfEditorProps, MentionCandidate } from '../types';

export const DEMO_USERS: MentionCandidate[] = [
  { id: '5b10ac8d82e05b22cc7d4ef5', displayName: 'Ana Rivera' },
  { id: 'user-vu', displayName: 'Vu Vo' },
  { id: 'user-jordan', displayName: 'Jordan Lee' },
];

export const mentionSearch = async (q: string) =>
  DEMO_USERS.filter((u) => u.displayName.toLowerCase().includes(q.toLowerCase()));

export const mediaInsert = async () => ({
  attrs: {
    type: 'external' as const,
    url: 'https://placehold.co/640x200/png',
    alt: 'Placeholder image',
  },
  layout: 'center' as const,
});

export const defaultEditorArgs: Partial<AdfEditorProps> = {
  placeholder: 'Write a description…',
  readOnly: false,
  mention: { search: mentionSearch },
  media: { onInsert: mediaInsert },
};

export function EditorPlayground(props: AdfEditorProps & { showJson?: boolean; caption?: string }) {
  const { showJson = true, caption, value: initial, defaultValue, onChange, ...rest } = props;
  const [value, setValue] = useState<DocNode>(initial ?? defaultValue ?? doc(p('')));

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 880 }}>
      {caption ? (
        <p style={{ margin: 0, color: '#6b778c', fontSize: 13 }}>{caption}</p>
      ) : null}
      <AdfEditor
        {...rest}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
      />
      {showJson ? (
        <details open>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>ADF JSON</summary>
          <pre
            style={{
              margin: '8px 0 0',
              padding: 12,
              borderRadius: 8,
              background: '#0f172a',
              color: '#e2e8f0',
              fontSize: 12,
              overflow: 'auto',
              maxHeight: 420,
            }}
          >
            {JSON.stringify(value, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
