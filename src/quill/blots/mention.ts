import Quill from 'quill';
import type { MentionEmbedValue } from '../../types';

const Embed = Quill.import('blots/embed') as typeof import('parchment').EmbedBlot;

export class MentionBlot extends Embed {
  static blotName = 'mention';
  static tagName = 'SPAN';
  static className = 'aqe-mention';

  static create(value: MentionEmbedValue): HTMLElement {
    const node = super.create(value) as HTMLElement;
    node.setAttribute('data-mention-id', value.id);
    if (value.text) node.setAttribute('data-mention-text', value.text);
    if (value.accessLevel) node.setAttribute('data-access-level', value.accessLevel);
    if (value.userType) node.setAttribute('data-user-type', value.userType);
    node.setAttribute('contenteditable', 'false');
    node.textContent = value.text?.startsWith('@') ? value.text : `@${value.text ?? value.id}`;
    return node;
  }

  static value(node: HTMLElement): MentionEmbedValue {
    return {
      id: node.getAttribute('data-mention-id') ?? '',
      text: node.getAttribute('data-mention-text') ?? node.textContent ?? undefined,
      accessLevel: node.getAttribute('data-access-level') ?? undefined,
      userType: node.getAttribute('data-user-type') ?? undefined,
    };
  }
}
