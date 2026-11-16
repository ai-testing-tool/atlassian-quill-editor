import type { Preview } from '@storybook/react';
import '../src/styles.css';

const preview: Preview = {
  // Quill attaches to a DOM node; StrictMode double-mount breaks the editor in docs/canvas.
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'AdfEditor',
          'ADF',
          ['Nodes', 'Marks'],
        ],
      },
    },
  },
};

export default preview;
