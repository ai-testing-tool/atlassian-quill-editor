import type { ReactNode } from 'react';
import type Quill from 'quill';
import type { PanelType } from '@ai-testing-tool/atlassian-adf-lite';

export type ToolbarProps = {
  quill: Quill | null;
  readOnly?: boolean;
  onInsertMention?: () => void;
  onInsertMedia?: () => void;
  onInsertStatus?: () => void;
};

type FormatKey = string;

function isActive(quill: Quill | null, format: FormatKey, value?: string | number | boolean): boolean {
  if (!quill) return false;
  const formats = quill.getFormat();
  if (value === undefined) return Boolean(formats[format]);
  return formats[format] === value;
}

function toggle(quill: Quill | null, format: FormatKey, value: boolean | string | number = true): void {
  if (!quill) return;
  const current = quill.getFormat()[format];
  if (value === true) {
    quill.format(format, !current);
  } else if (current === value) {
    quill.format(format, false);
  } else {
    quill.format(format, value);
  }
  quill.focus();
}

function Btn({
  active,
  disabled,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      className={`aqe-toolbar-btn${active ? ' is-active' : ''}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="aqe-toolbar-sep" aria-hidden />;
}

export function Toolbar({
  quill,
  readOnly,
  onInsertMention,
  onInsertMedia,
  onInsertStatus,
}: ToolbarProps) {
  const disabled = Boolean(readOnly || !quill);

  const insertPanel = (panelType: PanelType) => {
    if (!quill) return;
    const range = quill.getSelection(true);
    const index = range?.index ?? quill.getLength();
    quill.insertEmbed(index, 'adfPanel', { panelType, body: '' }, 'user');
    quill.insertText(index + 1, '\n', 'user');
    quill.setSelection(index + 2, 0);
  };

  const insertExpand = () => {
    if (!quill) return;
    const range = quill.getSelection(true);
    const index = range?.index ?? quill.getLength();
    quill.insertEmbed(index, 'adfExpand', { title: 'Details', body: '' }, 'user');
    quill.insertText(index + 1, '\n', 'user');
    quill.setSelection(index + 2, 0);
  };

  const insertTable = () => {
    if (!quill) return;
    const range = quill.getSelection(true);
    const index = range?.index ?? quill.getLength();
    quill.insertEmbed(
      index,
      'adfTable',
      {
        rows: [
          [{ header: true, text: 'Header' }, { header: true, text: 'Header' }],
          [{ text: '' }, { text: '' }],
        ],
      },
      'user',
    );
    quill.insertText(index + 1, '\n', 'user');
    quill.setSelection(index + 2, 0);
  };

  const insertRule = () => {
    if (!quill) return;
    const range = quill.getSelection(true);
    const index = range?.index ?? quill.getLength();
    quill.insertEmbed(index, 'adfRule', true, 'user');
    quill.insertText(index + 1, '\n', 'user');
    quill.setSelection(index + 2, 0);
  };

  return (
    <div className="aqe-toolbar" role="toolbar" aria-label="Formatting">
      <Btn title="Bold" disabled={disabled} active={isActive(quill, 'bold')} onClick={() => toggle(quill, 'bold')}>
        B
      </Btn>
      <Btn title="Italic" disabled={disabled} active={isActive(quill, 'italic')} onClick={() => toggle(quill, 'italic')}>
        I
      </Btn>
      <Btn title="Underline" disabled={disabled} active={isActive(quill, 'underline')} onClick={() => toggle(quill, 'underline')}>
        U
      </Btn>
      <Btn title="Strike" disabled={disabled} active={isActive(quill, 'strike')} onClick={() => toggle(quill, 'strike')}>
        S
      </Btn>
      <Btn title="Inline code" disabled={disabled} active={isActive(quill, 'code')} onClick={() => toggle(quill, 'code')}>
        {'</>'}
      </Btn>
      <Btn
        title="Link"
        disabled={disabled}
        active={isActive(quill, 'link')}
        onClick={() => {
          if (!quill) return;
          const current = quill.getFormat().link;
          if (current) {
            quill.format('link', false);
            return;
          }
          const href = window.prompt('Link URL');
          if (href) quill.format('link', href);
        }}
      >
        Link
      </Btn>
      <Sep />
      <Btn title="Heading 1" disabled={disabled} active={isActive(quill, 'header', 1)} onClick={() => toggle(quill, 'header', 1)}>
        H1
      </Btn>
      <Btn title="Heading 2" disabled={disabled} active={isActive(quill, 'header', 2)} onClick={() => toggle(quill, 'header', 2)}>
        H2
      </Btn>
      <Btn title="Heading 3" disabled={disabled} active={isActive(quill, 'header', 3)} onClick={() => toggle(quill, 'header', 3)}>
        H3
      </Btn>
      <Sep />
      <Btn title="Bullet list" disabled={disabled} active={isActive(quill, 'list', 'bullet')} onClick={() => toggle(quill, 'list', 'bullet')}>
        • List
      </Btn>
      <Btn title="Numbered list" disabled={disabled} active={isActive(quill, 'list', 'ordered')} onClick={() => toggle(quill, 'list', 'ordered')}>
        1. List
      </Btn>
      <Btn title="Blockquote" disabled={disabled} active={isActive(quill, 'blockquote')} onClick={() => toggle(quill, 'blockquote')}>
        Quote
      </Btn>
      <Btn title="Code block" disabled={disabled} active={Boolean(quill?.getFormat()['code-block'])} onClick={() => toggle(quill, 'code-block')}>
        Code
      </Btn>
      <Sep />
      <Btn title="Info panel" disabled={disabled} onClick={() => insertPanel('info')}>
        Panel
      </Btn>
      <Btn title="Expand" disabled={disabled} onClick={insertExpand}>
        Expand
      </Btn>
      <Btn title="Table" disabled={disabled} onClick={insertTable}>
        Table
      </Btn>
      <Btn title="Divider" disabled={disabled} onClick={insertRule}>
        —
      </Btn>
      <Sep />
      {onInsertMention ? (
        <Btn title="Mention" disabled={disabled} onClick={onInsertMention}>
          @
        </Btn>
      ) : null}
      {onInsertStatus ? (
        <Btn title="Status" disabled={disabled} onClick={onInsertStatus}>
          Status
        </Btn>
      ) : null}
      {onInsertMedia ? (
        <Btn title="Media" disabled={disabled} onClick={onInsertMedia}>
          Media
        </Btn>
      ) : null}
    </div>
  );
}
