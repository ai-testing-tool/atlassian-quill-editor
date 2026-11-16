import Quill from 'quill';
import type { StatusColor } from '@ai-testing-tool/atlassian-adf-lite';
import type { StatusEmbedValue } from '../../types';

const Embed = Quill.import('blots/embed') as typeof import('parchment').EmbedBlot;

export class StatusBlot extends Embed {
  static blotName = 'status';
  static tagName = 'SPAN';
  static className = 'aqe-status';

  static create(value: StatusEmbedValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    node.setAttribute('data-status-text', value.text);
    node.setAttribute('data-color', value.color);
    if (value.localId) node.setAttribute('data-local-id', value.localId);
    node.setAttribute('contenteditable', 'false');
    node.textContent = value.text;
    return node;
  }

  static value(node: HTMLElement): StatusEmbedValue {
    return {
      text: node.getAttribute('data-status-text') ?? node.textContent ?? '',
      color: (node.getAttribute('data-color') as StatusColor) || 'neutral',
      localId: node.getAttribute('data-local-id') ?? undefined,
    };
  }
}
