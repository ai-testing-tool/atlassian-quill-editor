import type {
  DocNode,
  MediaNode,
  PanelType,
  StatusColor,
  TopLevelBlockNode,
} from '@ai-testing-tool/atlassian-adf-lite';

export type MentionCandidate = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type MentionOptions = {
  search: (query: string) => Promise<MentionCandidate[]> | MentionCandidate[];
};

export type MediaInsertResult = {
  attrs: MediaNode['attrs'];
  layout?: 'wrap-left' | 'center' | 'wrap-right' | 'wide' | 'full-width' | 'align-start' | 'align-end';
};

export type MediaOptions = {
  onInsert: () => Promise<MediaInsertResult | null> | MediaInsertResult | null;
  resolveUrl?: (attrs: MediaNode['attrs']) => string | null;
};

export type AdfEditorProps = {
  value?: DocNode | null;
  defaultValue?: DocNode;
  onChange?: (doc: DocNode) => void;
  placeholder?: string;
  /** View-only mode: disables Quill, nested blot editors, toolbar, and mention UI. */
  readOnly?: boolean;
  /** Override toolbar visibility. Defaults to hidden when `readOnly` is true. */
  showToolbar?: boolean;
  className?: string;
  mention?: MentionOptions;
  media?: MediaOptions;
  /** When true, unknown ADF nodes throw instead of becoming opaque placeholders. */
  strict?: boolean;
};

export type MentionEmbedValue = {
  id: string;
  text?: string;
  accessLevel?: string;
  userType?: string;
};

export type StatusEmbedValue = {
  text: string;
  color: StatusColor;
  localId?: string;
};

export type MediaEmbedValue = {
  layout?: MediaInsertResult['layout'];
  media: MediaNode['attrs'];
};

export type PanelEmbedValue = {
  panelType: PanelType;
  panelIcon?: string;
  panelColor?: string;
  /** Plain text body; converted to paragraphs on export. */
  body: string;
};

export type ExpandEmbedValue = {
  title: string;
  body: string;
  nested?: boolean;
};

export type TableCellValue = {
  header?: boolean;
  text: string;
  background?: string;
  colspan?: number;
  rowspan?: number;
};

export type TableEmbedValue = {
  rows: TableCellValue[][];
  layout?: 'center' | 'align-start' | 'default' | 'wide' | 'full-width';
};

export type OpaqueEmbedValue = {
  node: TopLevelBlockNode;
};

export type AdfDeltaEmbed =
  | { mention: MentionEmbedValue }
  | { status: StatusEmbedValue }
  | { adfMedia: MediaEmbedValue }
  | { adfPanel: PanelEmbedValue }
  | { adfExpand: ExpandEmbedValue }
  | { adfTable: TableEmbedValue }
  | { adfRule: true }
  | { adfOpaque: OpaqueEmbedValue };
