import Quill from 'quill';
import type { OpaqueEmbedValue } from '../../types';

const BlockEmbed = Quill.import('blots/block/embed') as typeof import('parchment').EmbedBlot;

export class OpaqueBlot extends BlockEmbed {
  static blotName = 'adfOpaque';
  static tagName = 'DIV';
  static className = 'aqe-opaque';

  static create(value: OpaqueEmbedValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    node.setAttribute('data-adf-opaque', JSON.stringify(value.node));
    node.setAttribute('contenteditable', 'false');
    node.textContent = `Unsupported ADF node: ${value.node.type}`;
    return node;
  }

  static value(node: HTMLElement): OpaqueEmbedValue {
    const raw = node.getAttribute('data-adf-opaque');
    if (!raw) {
      return { node: { type: 'paragraph', content: [] } };
    }
    return { node: JSON.parse(raw) };
  }
}
