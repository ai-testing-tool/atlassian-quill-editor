import type {
  DocNode,
  InlineNode,
  ListItemNode,
  TopLevelBlockNode,
} from '@ai-testing-tool/atlassian-adf-lite';
import type { Op } from 'quill/core';
import type {
  ExpandEmbedValue,
  MediaEmbedValue,
  PanelEmbedValue,
  TableEmbedValue,
} from '../types';
import { hasInlineAttrs, marksToAttrs } from './marks';
import { blocksToPlainBody } from './plainBody';

export type AdfToDeltaOptions = {
  strict?: boolean;
};

function pushInline(ops: Op[], nodes: InlineNode[] | undefined): void {
  if (!nodes || nodes.length === 0) return;
  for (const node of nodes) {
    switch (node.type) {
      case 'text': {
        const attrs = marksToAttrs(node.marks);
        ops.push(hasInlineAttrs(attrs) ? { insert: node.text, attributes: attrs } : { insert: node.text });
        break;
      }
      case 'hardBreak':
        ops.push({ insert: { adfBreak: true } });
        break;
      case 'mention':
        ops.push({
          insert: {
            mention: {
              id: node.attrs.id,
              text: node.attrs.text,
              accessLevel: node.attrs.accessLevel,
              userType: node.attrs.userType,
            },
          },
        });
        break;
      case 'status':
        ops.push({
          insert: {
            status: {
              text: node.attrs.text,
              color: node.attrs.color,
              localId: node.attrs.localId,
            },
          },
        });
        break;
      case 'emoji':
        ops.push({ insert: node.attrs.text ?? node.attrs.shortName });
        break;
      case 'date': {
        const d = new Date(Number(node.attrs.timestamp));
        ops.push({ insert: Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : node.attrs.timestamp });
        break;
      }
      case 'inlineCard':
        ops.push({ insert: 'url' in node.attrs && node.attrs.url ? node.attrs.url : '[card]' });
        break;
      case 'mediaInline': {
        const mediaType = node.attrs.type === 'link' ? 'link' : 'file';
        ops.push({
          insert: {
            adfMedia: {
              media: {
                type: mediaType,
                id: node.attrs.id,
                collection: node.attrs.collection,
                width: node.attrs.width,
                height: node.attrs.height,
                alt: node.attrs.alt,
              },
            } satisfies MediaEmbedValue,
          },
        });
        break;
      }
      default:
        break;
    }
  }
}

function pushListItems(
  ops: Op[],
  items: ListItemNode[],
  list: 'bullet' | 'ordered',
  indent = 0,
): void {
  for (const item of items) {
    for (const child of item.content) {
      if (child.type === 'paragraph') {
        pushInline(ops, child.content);
        const attributes: Record<string, unknown> = { list };
        if (indent > 0) attributes.indent = indent;
        ops.push({ insert: '\n', attributes });
      } else if (child.type === 'bulletList') {
        pushListItems(ops, child.content, 'bullet', indent + 1);
      } else if (child.type === 'orderedList') {
        pushListItems(ops, child.content, 'ordered', indent + 1);
      } else if (child.type === 'codeBlock') {
        const text = (child.content ?? []).map((t) => t.text).join('');
        ops.push({
          insert: `${text}\n`,
          attributes: {
            'code-block': child.attrs?.language || true,
            list,
            ...(indent > 0 ? { indent } : {}),
          },
        });
      }
    }
  }
}

function blockToOps(block: TopLevelBlockNode, options: AdfToDeltaOptions): Op[] {
  const ops: Op[] = [];

  switch (block.type) {
    case 'paragraph':
      pushInline(ops, block.content);
      ops.push({ insert: '\n' });
      return ops;

    case 'heading':
      pushInline(ops, block.content);
      ops.push({ insert: '\n', attributes: { header: block.attrs.level } });
      return ops;

    case 'codeBlock': {
      const text = (block.content ?? []).map((t) => t.text).join('');
      ops.push({
        insert: `${text}\n`,
        attributes: { 'code-block': block.attrs?.language || true },
      });
      return ops;
    }

    case 'blockquote':
      for (const child of block.content) {
        if (child.type === 'paragraph') {
          pushInline(ops, child.content);
          ops.push({ insert: '\n', attributes: { blockquote: true } });
        } else if (child.type === 'codeBlock') {
          const text = (child.content ?? []).map((t) => t.text).join('');
          ops.push({
            insert: `${text}\n`,
            attributes: { 'code-block': child.attrs?.language || true, blockquote: true },
          });
        }
      }
      return ops;

    case 'bulletList':
      pushListItems(ops, block.content, 'bullet');
      return ops;

    case 'orderedList':
      pushListItems(ops, block.content, 'ordered');
      return ops;

    case 'rule':
      ops.push({ insert: { adfRule: true } });
      ops.push({ insert: '\n' });
      return ops;

    case 'panel': {
      const value: PanelEmbedValue = {
        panelType: block.attrs.panelType,
        panelIcon: block.attrs.panelIcon,
        panelColor: block.attrs.panelColor,
        body: blocksToPlainBody(block.content),
      };
      ops.push({ insert: { adfPanel: value } });
      ops.push({ insert: '\n' });
      return ops;
    }

    case 'expand': {
      const value: ExpandEmbedValue = {
        title: block.attrs?.title ?? '',
        body: blocksToPlainBody(block.content.filter((c) => c.type !== 'table' && c.type !== 'nestedExpand') as Array<{ type: string; content?: unknown[] }>),
        nested: false,
      };
      ops.push({ insert: { adfExpand: value } });
      ops.push({ insert: '\n' });
      return ops;
    }

    case 'table': {
      const value: TableEmbedValue = {
        layout: block.attrs?.layout,
        rows: block.content.map((row) =>
          row.content.map((cell) => ({
            header: cell.type === 'tableHeader',
            text: blocksToPlainBody(cell.content),
            background: cell.attrs?.background,
            colspan: cell.attrs?.colspan,
            rowspan: cell.attrs?.rowspan,
          })),
        ),
      };
      ops.push({ insert: { adfTable: value } });
      ops.push({ insert: '\n' });
      return ops;
    }

    case 'mediaSingle': {
      const media = block.content[0];
      const value: MediaEmbedValue = {
        layout: block.attrs.layout,
        media: media.attrs,
      };
      ops.push({ insert: { adfMedia: value } });
      ops.push({ insert: '\n' });
      return ops;
    }

    case 'mediaGroup': {
      for (const media of block.content) {
        ops.push({ insert: { adfMedia: { media: media.attrs } } });
        ops.push({ insert: '\n' });
      }
      return ops;
    }

    case 'blockCard':
    case 'embedCard':
      if (options.strict) {
        throw new Error(`Unsupported ADF node in strict mode: ${block.type}`);
      }
      ops.push({ insert: { adfOpaque: { node: block } } });
      ops.push({ insert: '\n' });
      return ops;

    default:
      if (options.strict) {
        throw new Error(`Unsupported ADF node in strict mode: ${(block as { type: string }).type}`);
      }
      ops.push({ insert: { adfOpaque: { node: block as TopLevelBlockNode } } });
      ops.push({ insert: '\n' });
      return ops;
  }
}

/** Convert an ADF document into Quill Delta ops. */
export function adfToDelta(doc: DocNode | null | undefined, options: AdfToDeltaOptions = {}): { ops: Op[] } {
  if (!doc || doc.type !== 'doc') {
    return { ops: [{ insert: '\n' }] };
  }
  const ops: Op[] = [];
  for (const block of doc.content) {
    ops.push(...blockToOps(block, options));
  }
  if (ops.length === 0) {
    ops.push({ insert: '\n' });
  } else {
    const last = ops[ops.length - 1];
    if (typeof last.insert === 'object') {
      ops.push({ insert: '\n' });
    }
  }
  return { ops };
}
