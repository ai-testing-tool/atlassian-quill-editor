import Quill from 'quill';
import type { MediaEmbedValue } from '../../types';

const BlockEmbed = Quill.import('blots/block/embed') as typeof import('parchment').EmbedBlot;

export class MediaBlot extends BlockEmbed {
  static blotName = 'adfMedia';
  static tagName = 'DIV';
  static className = 'aqe-media';

  static create(value: MediaEmbedValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    node.setAttribute('data-adf-media', JSON.stringify(value));
    node.setAttribute('contenteditable', 'false');
    const label = document.createElement('span');
    const attrs = value.media;
    if (attrs.type === 'external') {
      label.textContent = `Media: ${attrs.url}`;
    } else {
      label.textContent = `Media (${attrs.type}): ${attrs.id}`;
    }
    node.replaceChildren(label);
    return node;
  }

  static value(node: HTMLElement): MediaEmbedValue {
    const raw = node.getAttribute('data-adf-media');
    if (!raw) {
      return { media: { type: 'external', url: '' } };
    }
    return JSON.parse(raw) as MediaEmbedValue;
  }
}
