import Quill from 'quill';
import { MentionBlot } from './blots/mention';
import { StatusBlot } from './blots/status';
import { MediaBlot } from './blots/media';
import { PanelBlot } from './blots/panel';
import { ExpandBlot } from './blots/expand';
import { TableBlot } from './blots/table';
import { RuleBlot } from './blots/rule';
import { OpaqueBlot } from './blots/opaque';
import { HardBreakBlot } from './blots/hardBreak';

let registered = false;

export function registerAdfQuill(): typeof Quill {
  if (!registered) {
    Quill.register(MentionBlot);
    Quill.register(StatusBlot);
    Quill.register(MediaBlot);
    Quill.register(PanelBlot);
    Quill.register(ExpandBlot);
    Quill.register(TableBlot);
    Quill.register(RuleBlot);
    Quill.register(OpaqueBlot);
    Quill.register(HardBreakBlot);
    registered = true;
  }
  return Quill;
}
