import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  blockquote,
  bulletList,
  codeBlock,
  date,
  doc,
  emoji,
  expand,
  externalMedia,
  fileMedia,
  hardBreak,
  heading,
  h1,
  h2,
  h3,
  inlineCard,
  listItem,
  mediaGroup,
  mediaSingle,
  mention,
  nestedExpand,
  orderedList,
  p,
  panel,
  rule,
  status,
  table,
  tableCell,
  tableHeader,
  tableHeaderRow,
  tableRow,
  text,
} from '@ai-testing-tool/atlassian-adf-lite';
import { AdfEditor } from '../AdfEditor';
import { defaultEditorArgs, EditorPlayground } from './playground';

type StoryArgs = ComponentProps<typeof EditorPlayground>;

const meta = {
  title: 'ADF/Nodes',
  component: AdfEditor,
  tags: ['autodocs'],
  args: defaultEditorArgs,
  argTypes: {
    readOnly: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
  },
  render: (args) => <EditorPlayground {...(args as StoryArgs)} />,
} satisfies Meta<typeof AdfEditor>;

export default meta;
type Story = StoryObj<typeof meta> & { args?: StoryArgs };

export const Doc: Story = {
  name: 'Node - doc',
  args: {
    defaultValue: doc(),
    caption: 'Root ADF document (`type: "doc"`, `version: 1`). Empty content is valid.',
  },
};

export const Paragraph: Story = {
  name: 'Node - paragraph',
  args: {
    defaultValue: doc(
      p('A simple paragraph.'),
      p('Another paragraph with ', text('inline text'), '.'),
    ),
    caption: 'Block node that holds inline content.',
  },
};

export const Text: Story = {
  name: 'Node - text',
  args: {
    defaultValue: doc(p(text('Plain text node inside a paragraph.'))),
    caption: 'Inline text node. Marks attach to text nodes.',
  },
};

export const Heading: Story = {
  name: 'Node - heading',
  args: {
    defaultValue: doc(
      h1('Heading level 1'),
      h2('Heading level 2'),
      h3('Heading level 3'),
      heading(4, 'Heading level 4'),
      heading(5, 'Heading level 5'),
      heading(6, 'Heading level 6'),
    ),
    caption: 'Heading levels 1–6 via `attrs.level`.',
  },
};

export const HardBreak: Story = {
  name: 'Node - hardBreak',
  args: {
    defaultValue: doc(
      p('Line one', hardBreak(), 'Line two (same paragraph)', hardBreak(), 'Line three'),
    ),
    caption: 'Soft line break inside a paragraph. Shift+Enter inserts a hard break in the editor.',
  },
};

export const Blockquote: Story = {
  name: 'Node - blockquote',
  args: {
    defaultValue: doc(
      blockquote(p('Quoted paragraph.'), p('Second line in the quote.')),
    ),
    caption: 'Blockquote containing paragraphs (and optionally lists/code/media).',
  },
};

export const BulletList: Story = {
  name: 'Node - bulletList',
  args: {
    defaultValue: doc(
      bulletList(
        'First item',
        'Second item',
        listItem(p('Nested parent'), bulletList('Nested a', 'Nested b')),
      ),
    ),
    caption: 'Unordered list of `listItem` nodes.',
  },
};

export const OrderedList: Story = {
  name: 'Node - orderedList',
  args: {
    defaultValue: doc(
      orderedList(
        'Step one',
        'Step two',
        listItem(p('Step three'), orderedList('3a', '3b')),
      ),
    ),
    caption: 'Numbered list of `listItem` nodes.',
  },
};

export const ListItem: Story = {
  name: 'Node - listItem',
  args: {
    defaultValue: doc(
      bulletList(
        listItem(p('List item with a paragraph')),
        listItem(p('Item with nested list'), bulletList('Child A', 'Child B')),
        listItem(p('Item with code'), codeBlock('echo hello', 'bash')),
      ),
    ),
    caption: 'Child of bulletList / orderedList. First child is typically a paragraph.',
  },
};

export const CodeBlock: Story = {
  name: 'Node - codeBlock',
  args: {
    defaultValue: doc(
      p('Example:'),
      codeBlock('const x = 1;\nconsole.log(x);', 'javascript'),
      codeBlock('npm run storybook', 'bash'),
    ),
    caption: 'Fenced code with optional `attrs.language`. Text inside carries no marks.',
  },
};

export const Rule: Story = {
  name: 'Node - rule',
  args: {
    defaultValue: doc(p('Above the divider'), rule(), p('Below the divider')),
    caption: 'Horizontal rule / divider.',
  },
};

export const Panel: Story = {
  name: 'Node - panel',
  args: {
    defaultValue: doc(
      panel('info', 'Info panel'),
      panel('note', 'Note panel'),
      panel('warning', 'Warning panel'),
      panel('success', 'Success panel'),
      panel('error', 'Error panel'),
    ),
    caption: 'Panel types: info, note, warning, success, error, custom.',
  },
};

export const Expand: Story = {
  name: 'Node - expand',
  args: {
    defaultValue: doc(
      expand('Click to expand', p('Hidden details live here.'), p('Second paragraph.')),
    ),
    caption: 'Collapsible section with optional `attrs.title`.',
  },
};

export const NestedExpand: Story = {
  name: 'Node - nestedExpand',
  args: {
    defaultValue: doc(
      expand(
        'Outer expand',
        p('Outer body'),
        nestedExpand('Inner nestedExpand', p('Nested body content.')),
      ),
    ),
    caption:
      'Child of expand. Quill flattens expand bodies to plain text on edit — nested structure may be lossy.',
  },
};

export const Mention: Story = {
  name: 'Node - mention',
  args: {
    defaultValue: doc(
      p('Hello ', mention('5b10ac8d82e05b22cc7d4ef5', 'Ana'), ', please review.'),
      p('Also ping ', mention('user-vu', 'Vu Vo'), '.'),
    ),
    caption: 'Inline mention with `attrs.id` (account id) and display `text`.',
  },
};

export const Status: Story = {
  name: 'Node - status',
  args: {
    defaultValue: doc(
      p(
        status('To Do', 'neutral'),
        ' ',
        status('In Progress', 'blue'),
        ' ',
        status('Blocked', 'red'),
        ' ',
        status('Review', 'yellow'),
        ' ',
        status('Done', 'green'),
        ' ',
        status('Parked', 'purple'),
      ),
    ),
    caption: 'Inline status lozenge. Colors: neutral, purple, blue, red, yellow, green.',
  },
};

export const Emoji: Story = {
  name: 'Node - emoji',
  args: {
    defaultValue: doc(
      p('Ship it ', emoji('rocket', { text: '🚀' }), ' ', emoji('tada', { text: '🎉' })),
    ),
    caption: 'Inline emoji. Editor currently flattens to text/shortName on round-trip.',
  },
};

export const DateNode: Story = {
  name: 'Node - date',
  args: {
    defaultValue: doc(
      p('Due ', date('2026-11-16'), ' — launched ', date(Date.UTC(2026, 0, 1))),
    ),
    caption: 'Inline date (`attrs.timestamp` as epoch ms string). Flattened to ISO date text in Quill.',
  },
};

export const InlineCard: Story = {
  name: 'Node - inlineCard',
  args: {
    defaultValue: doc(
      p('See ', inlineCard('https://example.atlassian.net/browse/PROJ-123'), ' for details.'),
    ),
    caption: 'Smart-link style inline card. Currently rendered as URL text in the editor.',
  },
};

export const Media: Story = {
  name: 'Node - media',
  args: {
    defaultValue: doc(
      mediaSingle(
        externalMedia('https://placehold.co/480x200/png', { alt: 'External media' }),
        'center',
      ),
      mediaSingle(fileMedia('attachment-id-1', '', { alt: 'Uploaded file' }), 'center'),
    ),
    caption: 'Media node (file / link / external). Shown via mediaSingle wrapper in descriptions.',
  },
};

export const MediaSingle: Story = {
  name: 'Node - mediaSingle',
  args: {
    defaultValue: doc(
      mediaSingle(
        externalMedia('https://placehold.co/640x240/png', { alt: 'Wide image' }),
        'center',
        100,
      ),
    ),
    caption: 'Single media with layout (`center`, `wrap-left`, `wide`, …).',
  },
};

export const MediaGroup: Story = {
  name: 'Node - mediaGroup',
  args: {
    defaultValue: doc(
      mediaGroup(
        externalMedia('https://placehold.co/200x120/png?text=A', { alt: 'A' }),
        externalMedia('https://placehold.co/200x120/png?text=B', { alt: 'B' }),
        fileMedia('file-c', '', { alt: 'C' }),
      ),
    ),
    caption: 'Group of media nodes (gallery-style). Each media becomes a placeholder embed.',
  },
};

export const Table: Story = {
  name: 'Node - table',
  args: {
    defaultValue: doc(
      table(
        tableHeaderRow('Name', 'Role', 'Status'),
        tableRow('Ana', 'PM', 'Active'),
        tableRow('Vu', 'Eng', 'Active'),
      ),
    ),
    caption: 'Table with header row and body rows.',
  },
};

export const TableRow: Story = {
  name: 'Node - tableRow',
  args: {
    defaultValue: doc(
      table(
        tableRow(tableHeader('A'), tableHeader('B')),
        tableRow(tableCell('r1c1'), tableCell('r1c2')),
        tableRow(tableCell('r2c1'), tableCell('r2c2')),
      ),
    ),
    caption: 'Row containing tableHeader and/or tableCell children.',
  },
};

export const TableHeader: Story = {
  name: 'Node - tableHeader',
  args: {
    defaultValue: doc(
      table(
        tableRow(
          tableHeader('Metric', { background: '#f4f5f7' }),
          tableHeader('Value', { background: '#f4f5f7' }),
        ),
        tableRow('Latency', '180ms'),
      ),
    ),
    caption: 'Header cell. Optional attrs: background, colspan, rowspan, colwidth.',
  },
};

export const TableCell: Story = {
  name: 'Node - tableCell',
  args: {
    defaultValue: doc(
      table(
        tableHeaderRow('Left', 'Right'),
        tableRow(
          tableCell(p('Cell with ', text('paragraph')), { background: '#deebff' }),
          tableCell('Plain string cell', { colspan: 1 }),
        ),
      ),
    ),
    caption: 'Body cell. Content is block nodes (usually paragraphs).',
  },
};
