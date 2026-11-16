import type { TextMark } from '@ai-testing-tool/atlassian-adf-lite';
import { mark } from '@ai-testing-tool/atlassian-adf-lite';

export type QuillInlineAttrs = {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: boolean;
  code?: boolean;
  link?: string;
  color?: string;
  background?: string;
  script?: 'sub' | 'super';
};

export function marksToAttrs(marks?: TextMark[]): QuillInlineAttrs {
  const attrs: QuillInlineAttrs = {};
  if (!marks) return attrs;
  for (const m of marks) {
    switch (m.type) {
      case 'strong':
        attrs.bold = true;
        break;
      case 'em':
        attrs.italic = true;
        break;
      case 'strike':
        attrs.strike = true;
        break;
      case 'underline':
        attrs.underline = true;
        break;
      case 'code':
        attrs.code = true;
        break;
      case 'link':
        attrs.link = m.attrs.href;
        break;
      case 'textColor':
        attrs.color = m.attrs.color;
        break;
      case 'backgroundColor':
        attrs.background = m.attrs.color;
        break;
      case 'subsup':
        attrs.script = m.attrs.type === 'sub' ? 'sub' : 'super';
        break;
      default:
        break;
    }
  }
  return attrs;
}

export function attrsToMarks(attrs?: Record<string, unknown>): TextMark[] {
  if (!attrs) return [];
  const marks: TextMark[] = [];
  if (attrs.bold) marks.push(mark.strong());
  if (attrs.italic) marks.push(mark.em());
  if (attrs.strike) marks.push(mark.strike());
  if (attrs.underline) marks.push(mark.underline());
  if (attrs.code) marks.push(mark.code());
  if (typeof attrs.link === 'string' && attrs.link) marks.push(mark.link(attrs.link));
  if (typeof attrs.color === 'string' && attrs.color) marks.push(mark.textColor(attrs.color));
  if (typeof attrs.background === 'string' && attrs.background) {
    marks.push(mark.backgroundColor(attrs.background));
  }
  if (attrs.script === 'sub') marks.push(mark.sub());
  if (attrs.script === 'super') marks.push(mark.sup());
  return marks;
}

export function hasInlineAttrs(attrs?: QuillInlineAttrs): boolean {
  if (!attrs) return false;
  return Object.keys(attrs).length > 0;
}
