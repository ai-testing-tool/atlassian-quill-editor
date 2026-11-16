import Quill from 'quill';
import type { PanelEmbedValue } from '../../types';

const BlockEmbed = Quill.import('blots/block/embed') as typeof import('parchment').EmbedBlot;

function readBody(node: HTMLElement): string {
  const body = node.querySelector('.aqe-panel-body');
  return body?.textContent ?? '';
}

export class PanelBlot extends BlockEmbed {
  static blotName = 'adfPanel';
  static tagName = 'DIV';
  static className = 'aqe-panel';

  static create(value: PanelEmbedValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    node.setAttribute('data-panel-type', value.panelType);
    if (value.panelIcon) node.setAttribute('data-panel-icon', value.panelIcon);
    if (value.panelColor) node.setAttribute('data-panel-color', value.panelColor);
    node.setAttribute('contenteditable', 'false');

    const label = document.createElement('div');
    label.className = 'aqe-panel-label';
    label.textContent = value.panelType;

    const body = document.createElement('div');
    body.className = 'aqe-panel-body';
    body.setAttribute('contenteditable', 'true');
    body.textContent = value.body;

    node.replaceChildren(label, body);
    return node;
  }

  static value(node: HTMLElement): PanelEmbedValue {
    return {
      panelType: (node.getAttribute('data-panel-type') as PanelEmbedValue['panelType']) || 'info',
      panelIcon: node.getAttribute('data-panel-icon') ?? undefined,
      panelColor: node.getAttribute('data-panel-color') ?? undefined,
      body: readBody(node),
    };
  }
}
