import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed') as typeof import('parchment').EmbedBlot;

export class RuleBlot extends BlockEmbed {
  static blotName = 'adfRule';
  static tagName = 'HR';
  static className = 'aqe-rule';

  static create(): HTMLElement {
    const node = super.create() as HTMLElement;
    node.setAttribute('contenteditable', 'false');
    return node;
  }

  static value(): true {
    return true;
  }
}
