import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  code,
  color,
  doc,
  em,
  highlight,
  link,
  p,
  strike,
  strong,
  sub,
  sup,
  text,
  underline,
  mark,
} from '@ai-testing-tool/atlassian-adf-lite';
import { AdfEditor } from '../AdfEditor';
import { defaultEditorArgs, EditorPlayground } from './playground';

type StoryArgs = ComponentProps<typeof EditorPlayground>;

const meta = {
  title: 'ADF/Marks',
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

export const Strong: Story = {
  name: 'Mark - strong',
  args: {
    defaultValue: doc(p('Normal ', strong('bold / strong'), ' text.')),
    caption: 'Bold emphasis (`marks: [{ type: "strong" }]`).',
  },
};

export const Em: Story = {
  name: 'Mark - em',
  args: {
    defaultValue: doc(p('Normal ', em('italic / em'), ' text.')),
    caption: 'Italic emphasis (`type: "em"`).',
  },
};

export const Strike: Story = {
  name: 'Mark - strike',
  args: {
    defaultValue: doc(p('Keep this, ', strike('remove this'), ', keep that.')),
    caption: 'Strikethrough (`type: "strike"`).',
  },
};

export const Underline: Story = {
  name: 'Mark - underline',
  args: {
    defaultValue: doc(p('Please ', underline('underline'), ' this phrase.')),
    caption: 'Underline (`type: "underline"`).',
  },
};

export const Code: Story = {
  name: 'Mark - code',
  args: {
    defaultValue: doc(p('Run ', code('npm run storybook'), ' locally.')),
    caption: 'Inline code. In ADF, `code` may only combine with `link`.',
  },
};

export const Link: Story = {
  name: 'Mark - link',
  args: {
    defaultValue: doc(
      p(
        'Open ',
        link('https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/', 'ADF docs'),
        ' or ',
        text('raw URL mark', mark.link('https://example.com')),
        '.',
      ),
    ),
    caption: 'Link mark with `attrs.href` (optional title).',
  },
};

export const TextColor: Story = {
  name: 'Mark - textColor',
  args: {
    defaultValue: doc(
      p(
        color('#ff5630')('Red text'),
        ' · ',
        color('#36b37e')('Green text'),
        ' · ',
        color('#0052cc')('Blue text'),
      ),
    ),
    caption: 'Text color mark — hex only, e.g. `#ff5630`.',
  },
};

export const BackgroundColor: Story = {
  name: 'Mark - backgroundColor',
  args: {
    defaultValue: doc(
      p(
        'Highlight ',
        highlight('#fffae6')('warning'),
        ' and ',
        highlight('#e3fcef')('success'),
        ' spans.',
      ),
    ),
    caption: 'Background / highlight color — hex only.',
  },
};

export const SubSup: Story = {
  name: 'Mark - subsup',
  args: {
    defaultValue: doc(
      p(
        'H',
        sub('2'),
        'O and x',
        sup('2'),
        ' + y',
        sup('2'),
        ' (sub / sup via `subsup`).',
      ),
    ),
    caption: '`attrs.type` is `"sub"` or `"sup"`.',
  },
};

export const CombinedMarks: Story = {
  name: 'Mark - combined',
  args: {
    defaultValue: doc(
      p(
        strong(em('bold italic')),
        ' · ',
        strong(link('https://example.com', 'bold link')),
        ' · ',
        underline(color('#6554c0')('purple underline')),
      ),
    ),
    caption: 'Marks compose on the same text node (except restricted combinations like code+strong).',
  },
};
