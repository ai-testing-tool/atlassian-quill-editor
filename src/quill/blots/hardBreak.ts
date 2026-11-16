import Quill from 'quill';

const Embed = Quill.import('blots/embed') as typeof import('parchment').EmbedBlot;

export class HardBreakBlot extends Embed {
  static blotName = 'adfBreak';
  static tagName = 'BR';
  static className = 'aqe-break';

  static create(): HTMLElement {
    return super.create() as HTMLElement;
  }

  static value(): true {
    return true;
  }
}
