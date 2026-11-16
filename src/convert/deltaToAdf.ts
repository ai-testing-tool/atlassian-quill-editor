import type {
  DocNode,
  InlineNode,
  ListItemNode,
  ParagraphNode,
  TopLevelBlockNode,
} from '@ai-testing-tool/atlassian-adf-lite';
import {
  blockquote,
  bulletList,
  codeBlock,
  doc,
  expand,
  heading,
  listItem,
  media,
  mediaSingle,
  orderedList,
  p,
  panel,
  rule,
  table,
  tableCell,
  tableHeader,
  tableRow,
  text,
  mention,
  status,
  validate,
} from '@ai-testing-tool/atlassian-adf-lite';
import type { Op } from 'quill/core';
import type {
  ExpandEmbedValue,
  MediaEmbedValue,
  MentionEmbedValue,
  OpaqueEmbedValue,
  PanelEmbedValue,
  StatusEmbedValue,
  TableEmbedValue,
} from '../types';
import { attrsToMarks } from './marks';
import { plainBodyToParagraphs } from './plainBody';

export type DeltaToAdfOptions = {
  /** Validate output with atlassian-adf-lite (default true). */
  validate?: boolean;
};

type LineBuffer = {
  inlines: InlineNode[];
  attributes: Record<string, unknown>;
};

function isEmbed(insert: unknown): insert is Record<string, unknown> {
  return typeof insert === 'object' && insert !== null;
}

function appendText(inlines: InlineNode[], value: string, attrs?: Record<string, unknown>): void {
  if (!value) return;
  const marks = attrsToMarks(attrs);
  // Split hard newlines that appear mid-line insert (rare for Quill, but safe).
  const parts = value.split('\n');
  parts.forEach((part, index) => {
    if (part) inlines.push(marks.length ? text(part, ...marks) : text(part));
    if (index < parts.length - 1) inlines.push({ type: 'hardBreak' });
  });
}

function pushEmbedInline(inlines: InlineNode[], embed: Record<string, unknown>): void {
  if ('adfBreak' in embed) {
    inlines.push({ type: 'hardBreak' });
    return;
  }
  if ('mention' in embed) {
    const v = embed.mention as MentionEmbedValue;
    inlines.push(mention(v.id, v.text, {
      accessLevel: v.accessLevel as never,
      userType: v.userType as never,
    }));
    return;
  }
  if ('status' in embed) {
    const v = embed.status as StatusEmbedValue;
    inlines.push(status(v.text, v.color));
  }
}

function lineToBlock(line: LineBuffer): TopLevelBlockNode | ListItemNode | null {
  const { inlines, attributes } = line;
  const codeLang = attributes['code-block'];
  if (codeLang !== undefined) {
    const plain = inlines
      .map((n) => (n.type === 'text' ? n.text : n.type === 'hardBreak' ? '\n' : ''))
      .join('');
    return codeBlock(plain, typeof codeLang === 'string' ? codeLang : undefined);
  }

  if (attributes.header) {
    const level = Number(attributes.header) as 1 | 2 | 3 | 4 | 5 | 6;
    return heading(level, ...inlines);
  }

  if (attributes.blockquote) {
    return blockquote(p(...inlines));
  }

  if (attributes.list === 'bullet' || attributes.list === 'ordered') {
    return listItem(p(...inlines));
  }

  return p(...inlines);
}

function flushList(
  items: ListItemNode[],
  listType: 'bullet' | 'ordered',
  out: TopLevelBlockNode[],
): void {
  if (items.length === 0) return;
  out.push(listType === 'bullet' ? bulletList(...items) : orderedList(...items));
  items.length = 0;
}

function embedToBlock(embed: Record<string, unknown>): TopLevelBlockNode | null {
  if ('adfRule' in embed) return rule();

  if ('adfPanel' in embed) {
    const v = embed.adfPanel as PanelEmbedValue;
    return panel(v.panelType, ...plainBodyToParagraphs(v.body));
  }

  if ('adfExpand' in embed) {
    const v = embed.adfExpand as ExpandEmbedValue;
    return expand(v.title, ...plainBodyToParagraphs(v.body));
  }

  if ('adfMedia' in embed) {
    const v = embed.adfMedia as MediaEmbedValue;
    return mediaSingle(media(v.media), v.layout ?? 'center');
  }

  if ('adfTable' in embed) {
    const v = embed.adfTable as TableEmbedValue;
    const rows = v.rows.map((row) =>
      tableRow(
        ...row.map((cell) => {
          const content = plainBodyToParagraphs(cell.text);
          const attrs = {
            ...(cell.background ? { background: cell.background } : {}),
            ...(cell.colspan ? { colspan: cell.colspan } : {}),
            ...(cell.rowspan ? { rowspan: cell.rowspan } : {}),
          };
          const hasAttrs = Object.keys(attrs).length > 0;
          const cellContent = content.length === 1 ? content[0] : content;
          return cell.header
            ? tableHeader(cellContent, hasAttrs ? attrs : undefined)
            : tableCell(cellContent, hasAttrs ? attrs : undefined);
        }),
      ),
    );
    return table(...rows);
  }

  if ('adfOpaque' in embed) {
    return (embed.adfOpaque as OpaqueEmbedValue).node;
  }

  return null;
}

/** Convert Quill Delta ops into an ADF document. */
export function deltaToAdf(
  delta: { ops?: Op[] } | Op[] | null | undefined,
  options: DeltaToAdfOptions = {},
): DocNode {
  const ops = Array.isArray(delta) ? delta : delta?.ops ?? [];
  const blocks: TopLevelBlockNode[] = [];
  let current: LineBuffer = { inlines: [], attributes: {} };
  let listItems: ListItemNode[] = [];
  let listType: 'bullet' | 'ordered' | null = null;

  const finishLine = (): void => {
    const listAttr = current.attributes.list;
    if (listAttr === 'bullet' || listAttr === 'ordered') {
      if (listType && listType !== listAttr) {
        flushList(listItems, listType, blocks);
      }
      listType = listAttr;
      const item = lineToBlock(current);
      if (item && item.type === 'listItem') listItems.push(item);
    } else {
      flushList(listItems, listType ?? 'bullet', blocks);
      listType = null;
      const block = lineToBlock(current);
      if (block && block.type !== 'listItem') blocks.push(block);
    }
    current = { inlines: [], attributes: {} };
  };

  for (const op of ops) {
    const insert = op.insert;
    if (insert === undefined) continue;

    if (isEmbed(insert)) {
      // Inline embeds stay on the current line.
      if ('mention' in insert || 'status' in insert || 'adfBreak' in insert) {
        pushEmbedInline(current.inlines, insert);
        continue;
      }

      flushList(listItems, listType ?? 'bullet', blocks);
      listType = null;
      if (current.inlines.length > 0) {
        blocks.push(p(...current.inlines));
        current = { inlines: [], attributes: {} };
      }
      const block = embedToBlock(insert);
      if (block) blocks.push(block);
      continue;
    }

    if (typeof insert !== 'string') continue;

    const attrs = (op.attributes ?? {}) as Record<string, unknown>;
    const parts = insert.split('\n');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part) appendText(current.inlines, part, attrs);
      if (i < parts.length - 1) {
        current.attributes = attrs;
        finishLine();
      }
    }
  }

  if (current.inlines.length > 0 || Object.keys(current.attributes).length > 0) {
    finishLine();
  } else {
    flushList(listItems, listType ?? 'bullet', blocks);
  }

  // Drop trailing empty paragraph often produced by Quill's final newline.
  while (blocks.length > 1) {
    const last = blocks[blocks.length - 1];
    if (last.type === 'paragraph' && (!last.content || last.content.length === 0)) {
      blocks.pop();
    } else {
      break;
    }
  }

  const result = doc(...(blocks.length ? blocks : [p() as ParagraphNode]));
  if (options.validate !== false) {
    const { valid, errors } = validate(result, { strictTypes: false });
    if (!valid) {
      // Soft-fail: still return the doc; consumers can inspect via validate themselves.
      console.warn('[atlassian-quill-editor] ADF validation warnings:', errors);
    }
  }
  return result;
}
