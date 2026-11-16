import Quill from 'quill';
import type { ExpandEmbedValue } from '../../types';

const BlockEmbed = Quill.import('blots/block/embed') as typeof import('parchment').EmbedBlot;

export class ExpandBlot extends BlockEmbed {
  static blotName = 'adfExpand';
  static tagName = 'DIV';
  static className = 'aqe-expand';

  static create(value: ExpandEmbedValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    node.setAttribute('data-expand-title', value.title);
    if (value.nested) node.setAttribute('data-nested', 'true');
    node.setAttribute('contenteditable', 'false');

    const title = document.createElement('div');
    title.className = 'aqe-expand-title';
    title.setAttribute('contenteditable', 'true');
    title.textContent = value.title || 'Expand';

    const body = document.createElement('div');
    body.className = 'aqe-expand-body';
    body.setAttribute('contenteditable', 'true');
    body.textContent = value.body;

    node.replaceChildren(title, body);
    return node;
  }

  static value(node: HTMLElement): ExpandEmbedValue {
    const titleEl = node.querySelector('.aqe-expand-title');
    const bodyEl = node.querySelector('.aqe-expand-body');
    return {
      title: titleEl?.textContent ?? node.getAttribute('data-expand-title') ?? '',
      body: bodyEl?.textContent ?? '',
      nested: node.getAttribute('data-nested') === 'true',
    };
  }
}
