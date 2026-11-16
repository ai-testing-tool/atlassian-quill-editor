import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { DocNode } from '@ai-testing-tool/atlassian-adf-lite';
import {
  bulletList,
  codeBlock,
  doc,
  expand,
  h2,
  link,
  mention,
  orderedList,
  p,
  panel,
  status,
  strong,
  em,
  tableFrom,
} from '@ai-testing-tool/atlassian-adf-lite';
import { AdfEditor } from '../AdfEditor';
import { defaultEditorArgs, EditorPlayground } from './playground';

type StoryArgs = ComponentProps<typeof EditorPlayground>;

const jiraDescription: DocNode = doc(
  h2('Release 2.4'),
  p(
    'Shipped by ',
    mention('5b10ac8d82e05b22cc7d4ef5', 'Ana'),
    ' — ',
    status('Done', 'green'),
    '.',
  ),
  p(
    'See ',
    link('https://example.com/changelog', 'the changelog'),
    ' for ',
    strong(em('everything')),
    '.',
  ),
  bulletList('Faster search', 'New dark mode', 'Mention autocomplete'),
  orderedList('Ship docs', 'Rotate tokens', 'Announce on Slack'),
  codeBlock('npm i atlassian-quill-editor', 'bash'),
  panel('warning', 'Tokens issued before 2.0 are revoked.'),
  expand('Migration notes', p('Nothing to do for most workspaces.')),
  tableFrom(
    ['Metric', 'Before', 'After'],
    [
      ['p95 ms', '420', '180'],
      ['Bundle KB', '96', '74'],
    ],
  ),
);

const commentDoc: DocNode = doc(
  p(mention('user-vu', 'Vu'), ' thanks — this looks good to merge.'),
  p('Left one note on the panel copy.'),
);

const meta = {
  title: 'AdfEditor',
  component: AdfEditor,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: defaultEditorArgs,
  argTypes: {
    readOnly: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
  },
  render: (args) => <EditorPlayground {...(args as StoryArgs)} />,
} satisfies Meta<typeof AdfEditor>;

export default meta;
type Story = StoryObj<typeof meta> & { args?: StoryArgs };

export const Empty: Story = {
  args: { defaultValue: doc(p('')) },
};

export const JiraDescription: Story = {
  name: 'Jira description',
  args: { defaultValue: jiraDescription },
};

export const Comment: Story = {
  args: {
    placeholder: 'Write a comment…',
    defaultValue: commentDoc,
  },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: {
    readOnly: true,
    showToolbar: false,
    defaultValue: jiraDescription,
    caption: 'View mode: Quill disabled, nested panel/table/expand editors locked, toolbar hidden.',
  },
};

export const ReadOnlyWithToolbar: Story = {
  name: 'Read-only (toolbar visible)',
  args: {
    readOnly: true,
    showToolbar: true,
    defaultValue: jiraDescription,
    caption: 'readOnly with showToolbar forced on — controls stay disabled.',
  },
};

export const WithoutMentionsOrMedia: Story = {
  name: 'Toolbar basics only',
  args: {
    mention: undefined,
    media: undefined,
    defaultValue: doc(
      h2('Plain editing'),
      p('No mention or media hooks — toolbar still supports panels, tables, and expands.'),
      bulletList('Bold / italic', 'Lists', 'Code blocks'),
    ),
  },
};
