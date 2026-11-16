import { useEffect, useRef, useState } from 'react';
import type Quill from 'quill';
import type { DocNode } from '@ai-testing-tool/atlassian-adf-lite';
import { doc, p } from '@ai-testing-tool/atlassian-adf-lite';
import { adfToDelta } from './convert/adfToDelta';
import { deltaToAdf } from './convert/deltaToAdf';
import { registerAdfQuill } from './quill/register';
import { setEmbedEditable } from './quill/setEmbedEditable';
import { Toolbar } from './toolbar/Toolbar';
import type { AdfEditorProps, MentionCandidate } from './types';
import './styles.css';

const EMPTY_DOC: DocNode = doc(p());

function docsEqual(a: DocNode, b: DocNode): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function AdfEditor({
  value,
  defaultValue,
  onChange,
  placeholder = 'Write a description…',
  readOnly = false,
  showToolbar,
  className,
  mention,
  media,
  strict = false,
}: AdfEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const readOnlyRef = useRef(readOnly);
  const lastEmitted = useRef<DocNode | null>(null);
  const [quill, setQuill] = useState<Quill | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionHits, setMentionHits] = useState<MentionCandidate[]>([]);

  const toolbarVisible = showToolbar ?? !readOnly;

  useEffect(() => {
    readOnlyRef.current = readOnly;
  }, [readOnly]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // React StrictMode remounts: clear any previous Quill DOM before re-init.
    host.replaceChildren();
    quillRef.current = null;

    const QuillCtor = registerAdfQuill();
    const instance = new QuillCtor(host, {
      theme: undefined,
      placeholder,
      readOnly,
      modules: {
        toolbar: false,
        keyboard: {
          bindings: {
            hardBreak: {
              key: 'Enter',
              shiftKey: true,
              handler(range: { index: number }) {
                if (readOnlyRef.current) return false;
                instance.insertEmbed(range.index, 'adfBreak', true, 'user');
                instance.setSelection(range.index + 1, 0, 'user');
                return false;
              },
            },
          },
        },
      },
    });

    const initial = value ?? defaultValue ?? EMPTY_DOC;
    instance.setContents(adfToDelta(initial, { strict }).ops, 'silent');
    lastEmitted.current = initial;
    setEmbedEditable(host, !readOnly);

    // Re-read custom blot DOM edits (panel/table/expand contenteditable) into Delta.
    const onHostInput = () => {
      if (readOnlyRef.current) return;
      instance.update('user');
    };
    host.addEventListener('input', onHostInput);

    instance.on('text-change', (_delta, _old, source) => {
      if (source !== 'user' || readOnlyRef.current) return;
      const next = deltaToAdf(instance.getContents());
      lastEmitted.current = next;
      onChange?.(next);

      // Lightweight @mention detection on current line.
      if (mention) {
        const sel = instance.getSelection();
        if (!sel) return;
        const [leaf] = instance.getLeaf(sel.index);
        const text = leaf?.value?.() ?? '';
        if (typeof text === 'string') {
          const before = instance.getText(Math.max(0, sel.index - 40), 40);
          const match = before.match(/@([\w.-]*)$/);
          if (match) {
            setMentionQuery(match[1] ?? '');
          } else {
            setMentionQuery(null);
            setMentionHits([]);
          }
        }
      }
    });

    quillRef.current = instance;
    setQuill(instance);

    return () => {
      host.removeEventListener('input', onHostInput);
      instance.off('text-change');
      host.replaceChildren();
      quillRef.current = null;
      setQuill(null);
    };
    // Intentionally mount-once; controlled updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const instance = quillRef.current;
    const host = hostRef.current;
    if (!instance || !host) return;
    instance.enable(!readOnly);
    setEmbedEditable(host, !readOnly);
    if (readOnly) {
      instance.blur();
      setMentionQuery(null);
      setMentionHits([]);
    }
  }, [readOnly]);

  useEffect(() => {
    const instance = quillRef.current;
    const host = hostRef.current;
    if (!instance || !host || value == null) return;
    if (lastEmitted.current && docsEqual(value, lastEmitted.current)) return;
    instance.setContents(adfToDelta(value, { strict }).ops, 'silent');
    lastEmitted.current = value;
    // Recreated blots default to contenteditable=true — re-apply lock.
    setEmbedEditable(host, !readOnlyRef.current);
  }, [value, strict]);

  useEffect(() => {
    let cancelled = false;
    if (readOnly || mentionQuery === null || !mention) {
      setMentionHits([]);
      return;
    }
    Promise.resolve(mention.search(mentionQuery)).then((hits) => {
      if (!cancelled) setMentionHits(hits);
    });
    return () => {
      cancelled = true;
    };
  }, [mentionQuery, mention, readOnly]);

  const insertMention = (candidate: MentionCandidate) => {
    if (readOnlyRef.current) return;
    const instance = quillRef.current;
    if (!instance) return;
    const sel = instance.getSelection(true);
    if (!sel) return;
    const before = instance.getText(Math.max(0, sel.index - 40), 40);
    const match = before.match(/@([\w.-]*)$/);
    const deleteCount = match ? match[0].length : 0;
    const index = sel.index - deleteCount;
    if (deleteCount) instance.deleteText(index, deleteCount, 'user');
    instance.insertEmbed(
      index,
      'mention',
      { id: candidate.id, text: `@${candidate.displayName}` },
      'user',
    );
    instance.insertText(index + 1, ' ', 'user');
    instance.setSelection(index + 2, 0, 'user');
    setMentionQuery(null);
    setMentionHits([]);
  };

  const promptMention = async () => {
    if (readOnly || !mention || !quillRef.current) return;
    const query = window.prompt('Search people') ?? '';
    const hits = await Promise.resolve(mention.search(query));
    if (!hits.length) return;
    insertMention(hits[0]);
  };

  const promptStatus = () => {
    if (readOnly) return;
    const instance = quillRef.current;
    if (!instance) return;
    const label = window.prompt('Status text', 'In Progress');
    if (!label) return;
    const range = instance.getSelection(true);
    const index = range?.index ?? instance.getLength();
    instance.insertEmbed(index, 'status', { text: label, color: 'blue' }, 'user');
    instance.insertText(index + 1, ' ', 'user');
    instance.setSelection(index + 2, 0, 'user');
  };

  const promptMedia = async () => {
    if (readOnly || !media || !quillRef.current) return;
    const result = await Promise.resolve(media.onInsert());
    if (!result) return;
    const instance = quillRef.current;
    const range = instance.getSelection(true);
    const index = range?.index ?? instance.getLength();
    instance.insertEmbed(
      index,
      'adfMedia',
      { layout: result.layout ?? 'center', media: result.attrs },
      'user',
    );
    instance.insertText(index + 1, '\n', 'user');
    instance.setSelection(index + 2, 0, 'user');
  };

  const rootClass = [
    'aqe-root',
    readOnly ? 'aqe-root--readonly' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} data-readonly={readOnly ? 'true' : 'false'}>
      {toolbarVisible ? (
        <Toolbar
          quill={quill}
          readOnly={readOnly}
          onInsertMention={mention ? promptMention : undefined}
          onInsertStatus={promptStatus}
          onInsertMedia={media ? promptMedia : undefined}
        />
      ) : null}
      <div className="aqe-editor-host">
        <div ref={hostRef} />
        {!readOnly && mentionQuery !== null && mentionHits.length > 0 ? (
          <ul
            className="aqe-absolute aqe-z-10 aqe-mt-1 aqe-max-h-48 aqe-w-64 aqe-overflow-auto aqe-rounded aqe-border aqe-border-adf-border aqe-bg-white aqe-p-1 aqe-shadow"
            style={{ position: 'relative' }}
          >
            {mentionHits.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  className="aqe-toolbar-btn aqe-w-full aqe-justify-start"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMention(hit);
                  }}
                >
                  {hit.displayName}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default AdfEditor;
