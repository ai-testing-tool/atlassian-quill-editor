import type { ParagraphNode } from '@ai-testing-tool/atlassian-adf-lite';
import { p } from '@ai-testing-tool/atlassian-adf-lite';

/** Flatten ADF block children to editable plain text (paragraphs joined by blank lines). */
export function blocksToPlainBody(
  blocks: Array<{ type: string; content?: unknown[] }>,
): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.type === 'paragraph') {
      parts.push(inlineToText(block.content ?? []));
    } else if (block.type === 'heading') {
      parts.push(inlineToText(block.content ?? []));
    } else if (block.type === 'codeBlock') {
      const texts = (block.content ?? []) as Array<{ text?: string }>;
      parts.push(texts.map((t) => t.text ?? '').join(''));
    } else {
      parts.push('');
    }
  }
  return parts.join('\n\n');
}

function inlineToText(content: unknown[]): string {
  return content
    .map((node) => {
      const n = node as { type?: string; text?: string; attrs?: { text?: string } };
      if (n.type === 'text') return n.text ?? '';
      if (n.type === 'hardBreak') return '\n';
      if (n.type === 'mention') return n.attrs?.text ?? '';
      if (n.type === 'status') return n.attrs?.text ?? '';
      if (n.type === 'emoji') return n.attrs?.text ?? '';
      return '';
    })
    .join('');
}

/** Convert plain body text into ADF paragraphs. */
export function plainBodyToParagraphs(body: string): ParagraphNode[] {
  const chunks = body.replace(/\r\n/g, '\n').split(/\n{2,}/);
  if (chunks.length === 1 && chunks[0] === '') return [p()];
  return chunks.map((chunk) => {
    const lines = chunk.split('\n');
    if (lines.length === 1) return p(lines[0]);
    const parts: Array<string | { type: 'hardBreak' }> = [];
    lines.forEach((line, i) => {
      if (i > 0) parts.push({ type: 'hardBreak' });
      if (line) parts.push(line);
    });
    return p(...parts);
  });
}
